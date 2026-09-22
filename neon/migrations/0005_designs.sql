CREATE TABLE myevents.designs(event_id uuid PRIMARY KEY REFERENCES myevents.events(id),tenant_id uuid NOT NULL,document jsonb NOT NULL CHECK(octet_length(document::text)<=262144),revision integer NOT NULL CHECK(revision>0),updated_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE myevents.designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY design_read ON myevents.designs FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND deleted_at IS NULL));
CREATE POLICY design_insert ON myevents.designs FOR INSERT TO myevents_app WITH CHECK(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL));
CREATE POLICY design_update ON myevents.designs FOR UPDATE TO myevents_app USING(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND deleted_at IS NULL)) WITH CHECK(tenant_id=myevents.current_tenant());
GRANT SELECT,INSERT ON myevents.designs TO myevents_app;
GRANT UPDATE(document,revision,updated_at) ON myevents.designs TO myevents_app;
INSERT INTO myevents.migrations(version) VALUES('0005_designs');
