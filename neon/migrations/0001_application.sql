-- Additive application schema. The recovered public/auth/storage tables stay intact.
-- Apply as database owner after provisioning Neon Auth, never as the runtime role.
CREATE SCHEMA myevents;
REVOKE ALL ON SCHEMA myevents FROM PUBLIC;
CREATE ROLE myevents_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT USAGE ON SCHEMA myevents TO myevents_app;

CREATE TABLE myevents.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  neon_user_id uuid UNIQUE REFERENCES neon_auth."user"(id),
  tenant_id uuid NOT NULL,
  email text NOT NULL UNIQUE CHECK (email = lower(btrim(email))),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  member_role text NOT NULL DEFAULT 'owner' CHECK (member_role IN ('owner','admin','editor','viewer')),
  legacy_user_id uuid UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE myevents.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
  legacy_organization_id uuid UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(id, tenant_id)
);
CREATE TABLE myevents.events (
  id uuid PRIMARY KEY,
  workspace_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  created_by uuid NOT NULL REFERENCES myevents.profiles(id),
  type text NOT NULL,
  name text NOT NULL CHECK(length(btrim(name)) BETWEEN 1 AND 200),
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  timezone text NOT NULL,
  default_language text NOT NULL DEFAULT 'fr',
  primary_location text,
  estimated_guest_count integer CHECK(estimated_guest_count >= 0),
  lifecycle_status text NOT NULL DEFAULT 'draft' CHECK(lifecycle_status IN ('draft','setup','ready_for_publish','payment_required','published','suspended','completed','archived')),
  legacy_event_id uuid UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  FOREIGN KEY(workspace_id, tenant_id) REFERENCES myevents.workspaces(id, tenant_id),
  CHECK(end_at IS NULL OR end_at >= start_at)
);
CREATE INDEX events_tenant_workspace ON myevents.events(tenant_id,workspace_id) WHERE deleted_at IS NULL;

CREATE TABLE myevents.registration_names (
  neon_user_id uuid PRIMARY KEY REFERENCES neon_auth."user"(id),
  first_name text NOT NULL CHECK(length(first_name) BETWEEN 2 AND 100),
  last_name text NOT NULL CHECK(length(last_name) BETWEEN 2 AND 100)
);
-- Called only with the identity returned by a successful server-side sign-up.
CREATE FUNCTION myevents.save_registration_names(p_user uuid,p_first text,p_last text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  INSERT INTO myevents.registration_names
    SELECT id,p_first,p_last FROM neon_auth."user"
    WHERE id=p_user AND name=btrim(p_first||' '||p_last)
      AND "createdAt">now()-interval '10 minutes'
    ON CONFLICT DO NOTHING;
END $$;

-- Claims are set locally to each DB transaction, only after server-side Auth verification.
CREATE FUNCTION myevents.neon_subject() RETURNS uuid LANGUAGE sql STABLE SET search_path='' AS $$
  SELECT nullif(current_setting('myevents.neon_user_id',true),'')::uuid
$$;
-- Also validate the live session in SQL. Password changes invalidate every
-- older session for application access, independently of upstream cookie caches.
CREATE FUNCTION myevents.verified_subject() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT u.id FROM neon_auth."user" u JOIN neon_auth.session s ON s."userId"=u.id
  WHERE u.id=myevents.neon_subject() AND u."emailVerified"
    AND s.id=nullif(current_setting('myevents.neon_session_id',true),'')::uuid
    AND s."expiresAt">now()
    AND (NOT coalesce(u.banned,false) OR u."banExpires" < now())
    AND NOT EXISTS(SELECT FROM neon_auth.account a WHERE a."userId"=u.id
      AND a."providerId"='credential' AND a."updatedAt">s."createdAt")
$$;
CREATE FUNCTION myevents.current_profile() RETURNS SETOF myevents.profiles LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT p.* FROM myevents.profiles p JOIN neon_auth."user" u ON u.id=p.neon_user_id
  WHERE u.id=myevents.verified_subject()
$$;
CREATE FUNCTION myevents.current_tenant() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT tenant_id FROM myevents.current_profile()
$$;
CREATE FUNCTION myevents.can_edit() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT coalesce((SELECT member_role IN ('owner','admin','editor') FROM myevents.current_profile()),false)
$$;

-- Creating a new tenant never links a legacy account by email. Existing users
-- require an explicit, operator-verified ID mapping, outside the runtime role.
CREATE FUNCTION myevents.ensure_identity(p_first text DEFAULT '', p_last text DEFAULT '')
RETURNS SETOF myevents.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE u neon_auth."user"; p myevents.profiles; t uuid;
BEGIN
  SELECT * INTO u FROM neon_auth."user" WHERE id=myevents.verified_subject();
  IF u.id IS NULL OR NOT u."emailVerified" OR (coalesce(u.banned,false) AND (u."banExpires" IS NULL OR u."banExpires">now())) THEN
    RETURN;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(u.id::text,0));
  SELECT * INTO p FROM myevents.profiles WHERE neon_user_id=u.id;
  IF p.id IS NULL THEN
    IF EXISTS(SELECT FROM myevents.profiles WHERE email=lower(btrim(u.email))) THEN
      RAISE EXCEPTION 'Legacy identity requires explicit binding' USING ERRCODE='42501';
    END IF;
    SELECT first_name,last_name INTO p_first,p_last FROM myevents.registration_names WHERE neon_user_id=u.id;
    t := gen_random_uuid();
    INSERT INTO myevents.profiles(id,neon_user_id,tenant_id,email,first_name,last_name)
      VALUES(u.id,u.id,t,lower(btrim(u.email)),coalesce(nullif(btrim(p_first),''),u.name),coalesce(btrim(p_last),'')) RETURNING * INTO p;
    INSERT INTO myevents.workspaces(tenant_id,name) VALUES(t,'Espace personnel');
  END IF;
  RETURN NEXT p;
END $$;

CREATE FUNCTION myevents.validate_event() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  IF NOT EXISTS(SELECT FROM pg_timezone_names WHERE name=NEW.timezone) THEN
    RAISE EXCEPTION 'Invalid timezone' USING ERRCODE='23514';
  END IF;
  IF TG_OP='UPDATE' AND (NEW.id,NEW.tenant_id,NEW.workspace_id,NEW.created_by,NEW.type,NEW.lifecycle_status,NEW.legacy_event_id,NEW.created_at)
    IS DISTINCT FROM (OLD.id,OLD.tenant_id,OLD.workspace_id,OLD.created_by,OLD.type,OLD.lifecycle_status,OLD.legacy_event_id,OLD.created_at) THEN
    RAISE EXCEPTION 'Event identity and lifecycle are immutable in this session' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER validate_event BEFORE INSERT OR UPDATE ON myevents.events FOR EACH ROW EXECUTE FUNCTION myevents.validate_event();

ALTER TABLE myevents.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE myevents.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE myevents.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_profile ON myevents.profiles FOR SELECT TO myevents_app USING(neon_user_id=myevents.verified_subject());
CREATE POLICY workspace_read ON myevents.workspaces FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant());
CREATE POLICY workspace_insert ON myevents.workspaces FOR INSERT TO myevents_app WITH CHECK(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND legacy_organization_id IS NULL);
CREATE POLICY workspace_update ON myevents.workspaces FOR UPDATE TO myevents_app USING(tenant_id=myevents.current_tenant() AND myevents.can_edit()) WITH CHECK(tenant_id=myevents.current_tenant());
-- SELECT must also cover the just-soft-deleted row for UPDATE RETURNING. Read
-- repositories exclude it; UPDATE policy prevents resurrection or further edits.
CREATE POLICY event_read ON myevents.events FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant());
CREATE POLICY event_insert ON myevents.events FOR INSERT TO myevents_app WITH CHECK(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND created_by=(SELECT id FROM myevents.current_profile()) AND lifecycle_status='draft' AND deleted_at IS NULL AND legacy_event_id IS NULL);
CREATE POLICY event_update ON myevents.events FOR UPDATE TO myevents_app USING(tenant_id=myevents.current_tenant() AND deleted_at IS NULL AND myevents.can_edit()) WITH CHECK(tenant_id=myevents.current_tenant());

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA myevents FROM PUBLIC;
GRANT EXECUTE ON FUNCTION myevents.neon_subject(), myevents.verified_subject(), myevents.save_registration_names(uuid,text,text), myevents.current_profile(), myevents.current_tenant(), myevents.can_edit(), myevents.ensure_identity(text,text) TO myevents_app;
GRANT SELECT ON myevents.profiles,myevents.workspaces,myevents.events TO myevents_app;
GRANT INSERT(id,tenant_id,name,created_at,updated_at) ON myevents.workspaces TO myevents_app;
GRANT UPDATE(name,updated_at) ON myevents.workspaces TO myevents_app;
GRANT INSERT(id,workspace_id,tenant_id,created_by,type,name,start_at,end_at,timezone,default_language,primary_location,estimated_guest_count,lifecycle_status,created_at,updated_at) ON myevents.events TO myevents_app;
GRANT UPDATE(name,start_at,end_at,timezone,default_language,primary_location,estimated_guest_count,updated_at,deleted_at) ON myevents.events TO myevents_app;

CREATE TABLE myevents.migrations(version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
INSERT INTO myevents.migrations(version) VALUES('0001_application');
