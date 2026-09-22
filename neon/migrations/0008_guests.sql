CREATE TABLE myevents.guest_books(event_id uuid PRIMARY KEY REFERENCES myevents.events(id),tenant_id uuid NOT NULL,document jsonb NOT NULL CHECK(octet_length(document::text)<=4194304),revision integer NOT NULL CHECK(revision>0),updated_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE myevents.guest_books ENABLE ROW LEVEL SECURITY;
CREATE POLICY guest_book_read ON myevents.guest_books FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND deleted_at IS NULL));
CREATE POLICY guest_book_insert ON myevents.guest_books FOR INSERT TO myevents_app WITH CHECK(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL));
CREATE POLICY guest_book_update ON myevents.guest_books FOR UPDATE TO myevents_app USING(tenant_id=myevents.current_tenant() AND myevents.can_edit() AND EXISTS(SELECT FROM myevents.events WHERE id=event_id AND deleted_at IS NULL)) WITH CHECK(tenant_id=myevents.current_tenant());
GRANT SELECT,INSERT ON myevents.guest_books TO myevents_app;
GRANT UPDATE(document,revision,updated_at) ON myevents.guest_books TO myevents_app;
INSERT INTO myevents.migrations(version) VALUES('0008_guests');
