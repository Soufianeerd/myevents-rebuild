-- Additive migration. Public access is restricted to explicit published snapshots.
CREATE TABLE myevents.invitations (
 event_id uuid PRIMARY KEY REFERENCES myevents.events(id), tenant_id uuid NOT NULL,
 draft jsonb NOT NULL, published jsonb, revision integer NOT NULL CHECK(revision>0), published_revision integer,
 published_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now(), history jsonb NOT NULL DEFAULT '[]',
 CHECK(jsonb_typeof(draft)='object' AND octet_length(draft::text)<=262144)
);
CREATE TABLE myevents.share_links (
 token_hash text PRIMARY KEY CHECK(token_hash ~ '^[a-f0-9]{64}$'), event_id uuid NOT NULL REFERENCES myevents.events(id),
 kind text NOT NULL CHECK(kind IN ('invitation','audio','photo_video')), enabled boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(event_id,kind)
);
CREATE TABLE myevents.rsvp_responses (
 id uuid PRIMARY KEY, event_id uuid NOT NULL REFERENCES myevents.events(id), tenant_id uuid NOT NULL,
 response jsonb NOT NULL CHECK(octet_length(response::text)<=131072), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rsvp_event ON myevents.rsvp_responses(event_id,created_at);
CREATE TABLE myevents.orders (
 id uuid PRIMARY KEY, event_id uuid NOT NULL REFERENCES myevents.events(id), tenant_id uuid NOT NULL,
 offer jsonb NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','refunded')),
 session_id text UNIQUE, created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz
);
CREATE TABLE myevents.service_secrets(name text PRIMARY KEY,hash text NOT NULL);
REVOKE ALL ON myevents.service_secrets FROM PUBLIC,myevents_app;

ALTER TABLE myevents.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE myevents.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE myevents.rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE myevents.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitation_read ON myevents.invitations FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant());
CREATE POLICY invitation_create ON myevents.invitations FOR INSERT TO myevents_app WITH CHECK(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND published IS NULL AND EXISTS(SELECT FROM myevents.events e WHERE e.id=event_id AND e.tenant_id=myevents.current_tenant() AND e.deleted_at IS NULL));
CREATE POLICY invitation_update ON myevents.invitations FOR UPDATE TO myevents_app USING(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND EXISTS(SELECT FROM myevents.events e WHERE e.id=event_id AND e.deleted_at IS NULL)) WITH CHECK(tenant_id=myevents.current_tenant());
CREATE POLICY response_read ON myevents.rsvp_responses FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant());
CREATE POLICY order_read ON myevents.orders FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant());
CREATE POLICY order_create ON myevents.orders FOR INSERT TO myevents_app WITH CHECK(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND status='pending' AND session_id IS NULL AND paid_at IS NULL AND EXISTS(SELECT FROM myevents.events e WHERE e.id=event_id AND e.tenant_id=myevents.current_tenant() AND e.deleted_at IS NULL));
CREATE POLICY order_attach ON myevents.orders FOR UPDATE TO myevents_app USING(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND status='pending') WITH CHECK(tenant_id=myevents.current_tenant() AND status='pending');
GRANT SELECT ON myevents.invitations,myevents.orders,myevents.rsvp_responses TO myevents_app;
GRANT INSERT(event_id,tenant_id,draft,revision,history,updated_at) ON myevents.invitations TO myevents_app;
GRANT UPDATE(draft,revision,history,updated_at) ON myevents.invitations TO myevents_app;
GRANT INSERT(id,event_id,tenant_id,offer,created_at) ON myevents.orders TO myevents_app;
GRANT UPDATE(session_id) ON myevents.orders TO myevents_app;

CREATE FUNCTION myevents.publish_invitation(p_event uuid,p_revision integer,p_hash text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT myevents.can_edit() OR NOT EXISTS(SELECT FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Access denied'; END IF;
 IF NOT EXISTS(SELECT FROM myevents.orders WHERE event_id=p_event AND status='paid' AND offer->'products' ? 'invitation') THEN RAISE EXCEPTION 'Invitation entitlement required'; END IF;
 UPDATE myevents.invitations SET published=draft,published_revision=revision,published_at=now() WHERE event_id=p_event AND revision=p_revision;
 IF NOT FOUND THEN RAISE EXCEPTION 'Revision conflict'; END IF;
 INSERT INTO myevents.share_links(token_hash,event_id,kind) VALUES(p_hash,p_event,'invitation') ON CONFLICT(event_id,kind) DO UPDATE SET token_hash=excluded.token_hash,enabled=true;
END $$;
CREATE FUNCTION myevents.suspend_invitation(p_event uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT myevents.can_edit() OR NOT EXISTS(SELECT FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Access denied'; END IF;
 UPDATE myevents.invitations SET published=NULL WHERE event_id=p_event;
 UPDATE myevents.share_links SET enabled=false WHERE event_id=p_event AND kind='invitation';
END $$;
CREATE FUNCTION myevents.public_invitation(p_hash text) RETURNS TABLE(event_id uuid,document jsonb,revision integer) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT i.event_id,i.published,i.published_revision FROM myevents.invitations i JOIN myevents.share_links l ON l.event_id=i.event_id JOIN myevents.events e ON e.id=i.event_id
 WHERE l.token_hash=p_hash AND l.kind='invitation' AND l.enabled AND i.published IS NOT NULL AND e.deleted_at IS NULL
$$;
CREATE FUNCTION myevents.submit_rsvp(p_hash text,p_response jsonb,p_revision integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE invitation record;
BEGIN
 SELECT i.event_id,i.tenant_id,i.published,i.published_revision INTO invitation FROM myevents.invitations i JOIN myevents.share_links l ON l.event_id=i.event_id JOIN myevents.events e ON e.id=i.event_id WHERE l.token_hash=p_hash AND l.kind='invitation' AND l.enabled AND i.published IS NOT NULL AND e.deleted_at IS NULL FOR SHARE OF i,l,e;
 IF invitation.event_id IS NULL OR invitation.published_revision<>p_revision OR NOT coalesce((invitation.published->>'rsvpEnabled')::boolean,false) THEN RAISE EXCEPTION 'Invitation unavailable'; END IF;
 IF invitation.published->>'deadline' IS NOT NULL AND (invitation.published->>'deadline')::timestamptz<now() THEN RAISE EXCEPTION 'Deadline passed'; END IF;
 IF p_response->>'presence' NOT IN ('yes','no') OR p_response->>'consent'<>'true' OR length(p_response->>'name') NOT BETWEEN 1 AND 150 OR length(p_response->>'email') NOT BETWEEN 3 AND 254 THEN RAISE EXCEPTION 'Invalid response'; END IF;
 INSERT INTO myevents.rsvp_responses(id,event_id,tenant_id,response) VALUES((p_response->>'id')::uuid,invitation.event_id,invitation.tenant_id,p_response) ON CONFLICT(id) DO NOTHING;
END $$;
CREATE FUNCTION myevents.fulfill_order(p_id uuid,p_session text,p_amount integer,p_secret text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT EXISTS(SELECT FROM myevents.service_secrets WHERE name='payments' AND hash=encode(sha256(convert_to(p_secret,'UTF8')),'hex')) THEN RAISE EXCEPTION 'Access denied'; END IF;
 UPDATE myevents.orders SET status='paid',paid_at=coalesce(paid_at,now()) WHERE id=p_id AND session_id=p_session AND status IN ('pending','paid') AND (offer->>'amount')::integer=p_amount AND offer->>'currency'='eur' AND offer->>'testOnly'='true';
 IF NOT FOUND THEN RAISE EXCEPTION 'Order mismatch'; END IF;
END $$;
REVOKE ALL ON FUNCTION myevents.publish_invitation(uuid,integer,text),myevents.suspend_invitation(uuid),myevents.public_invitation(text),myevents.submit_rsvp(text,jsonb,integer),myevents.fulfill_order(uuid,text,integer,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION myevents.publish_invitation(uuid,integer,text),myevents.suspend_invitation(uuid),myevents.public_invitation(text),myevents.submit_rsvp(text,jsonb,integer),myevents.fulfill_order(uuid,text,integer,text) TO myevents_app;
INSERT INTO myevents.migrations(version) VALUES('0003_experience');
