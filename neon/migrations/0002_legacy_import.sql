-- Owner-only import from the recovered source, in the same transaction as 0001.
-- Preserve source IDs, tenant ownership, timestamps and every lifecycle value.
DO $$ BEGIN
  IF EXISTS(SELECT FROM auth.users u LEFT JOIN public.organization_memberships m ON m.user_id=u.id GROUP BY u.id HAVING count(m.organization_id)<>1)
  OR EXISTS(SELECT FROM public.events WHERE event_date IS NULL OR created_by IS NULL)
  THEN RAISE EXCEPTION 'Legacy data requires an explicit migration mapping'; END IF;
END $$;
INSERT INTO myevents.workspaces(id,tenant_id,name,legacy_organization_id,created_at,updated_at)
SELECT gen_random_uuid(),id,name,id,created_at,updated_at FROM public.organizations WHERE deleted_at IS NULL;
INSERT INTO myevents.profiles(id,tenant_id,email,first_name,last_name,member_role,legacy_user_id,created_at,updated_at)
SELECT u.id,m.organization_id,lower(btrim(u.email)),coalesce(u.raw_user_meta_data->>'first_name',u.raw_user_meta_data->>'name',''),coalesce(u.raw_user_meta_data->>'last_name',''),m.role::text,u.id,u.created_at,u.updated_at
FROM auth.users u JOIN public.organization_memberships m ON m.user_id=u.id;
INSERT INTO myevents.events(id,workspace_id,tenant_id,created_by,type,name,start_at,timezone,lifecycle_status,legacy_event_id,created_at,updated_at,deleted_at)
SELECT e.id,w.id,e.organization_id,e.created_by,e.event_type,e.title,e.event_date,e.timezone,e.status::text,e.id,e.created_at,e.updated_at,e.deleted_at
FROM public.events e JOIN myevents.workspaces w ON w.legacy_organization_id=e.organization_id;
DO $$ BEGIN
  IF (SELECT count(*) FROM myevents.events) <> (SELECT count(*) FROM public.events) THEN
    RAISE EXCEPTION 'Legacy event count mismatch'; END IF;
END $$;
INSERT INTO myevents.migrations(version) VALUES('0002_legacy_import');
