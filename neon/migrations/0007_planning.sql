CREATE TABLE myevents.planning(event_id uuid PRIMARY KEY REFERENCES myevents.events(id),tenant_id uuid NOT NULL,document jsonb NOT NULL CHECK(octet_length(document::text)<=1048576),revision integer NOT NULL CHECK(revision>0),updated_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE myevents.planning ENABLE ROW LEVEL SECURITY;
CREATE POLICY planning_read ON myevents.planning FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND deleted_at IS NULL));
CREATE POLICY planning_insert ON myevents.planning FOR INSERT TO myevents_app WITH CHECK(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL));
CREATE POLICY planning_update ON myevents.planning FOR UPDATE TO myevents_app USING(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND deleted_at IS NULL)) WITH CHECK(tenant_id=myevents.current_tenant());
GRANT SELECT,INSERT ON myevents.planning TO myevents_app;
GRANT UPDATE(document,revision,updated_at) ON myevents.planning TO myevents_app;
INSERT INTO myevents.migrations(version) VALUES('0007_planning');
