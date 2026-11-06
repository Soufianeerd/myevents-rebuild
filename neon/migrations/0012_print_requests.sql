CREATE TABLE myevents.material_requests (
 id uuid PRIMARY KEY,
 event_id uuid NOT NULL REFERENCES myevents.events(id),
 tenant_id uuid NOT NULL,
 payload jsonb NOT NULL CHECK(octet_length(payload::text)<=300000 AND payload->>'status'='requested' AND payload->>'id'=id::text AND payload->>'eventId'=event_id::text AND payload->>'tenantId'=tenant_id::text),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE myevents.material_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY request_read ON myevents.material_requests FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND deleted_at IS NULL));
CREATE POLICY request_insert ON myevents.material_requests FOR INSERT TO myevents_app WITH CHECK(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL));
CREATE POLICY request_retry ON myevents.material_requests FOR UPDATE TO myevents_app USING(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND deleted_at IS NULL)) WITH CHECK(tenant_id=myevents.current_tenant());
CREATE FUNCTION myevents.preserve_material_request() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'A submitted print request cannot be changed'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER preserve_material_request BEFORE UPDATE ON myevents.material_requests FOR EACH ROW EXECUTE FUNCTION myevents.preserve_material_request();
GRANT SELECT,INSERT ON myevents.material_requests TO myevents_app;
GRANT UPDATE(payload) ON myevents.material_requests TO myevents_app;
INSERT INTO myevents.migrations(version) VALUES('0012_print_requests');
