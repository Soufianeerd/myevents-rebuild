CREATE TABLE myevents.guest_links(token_hash text PRIMARY KEY CHECK(token_hash ~ '^[a-f0-9]{64}$'),event_id uuid NOT NULL REFERENCES myevents.events(id),guest_id uuid NOT NULL,response_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,UNIQUE(event_id,guest_id));
ALTER TABLE myevents.guest_links ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION myevents.issue_guest_link(p_event uuid,p_guest uuid,p_hash text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT myevents.can_edit() OR NOT EXISTS(SELECT FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Access denied'; END IF;
 IF NOT myevents.has_product(p_event,'invitation') OR NOT EXISTS(SELECT FROM myevents.invitations i JOIN myevents.share_links l ON l.event_id=i.event_id WHERE i.event_id=p_event AND i.published IS NOT NULL AND l.kind='invitation' AND l.enabled) THEN RAISE EXCEPTION 'Publish invitation first'; END IF;
 IF NOT EXISTS(SELECT FROM myevents.guest_books b CROSS JOIN LATERAL jsonb_array_elements(b.document->'guests') g WHERE b.event_id=p_event AND g->>'id'=p_guest::text) THEN RAISE EXCEPTION 'Guest unavailable'; END IF;
 INSERT INTO myevents.guest_links(token_hash,event_id,guest_id) VALUES(p_hash,p_event,p_guest) ON CONFLICT(event_id,guest_id) DO UPDATE SET token_hash=excluded.token_hash;
END $$;
REVOKE ALL ON FUNCTION myevents.issue_guest_link(uuid,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION myevents.issue_guest_link(uuid,uuid,text) TO myevents_app;
CREATE FUNCTION myevents.public_guest_invitation(p_hash text) RETURNS TABLE(event_id uuid,document jsonb,revision integer,guest jsonb) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT i.event_id,i.published,i.published_revision,jsonb_build_object('id',g->>'id','name',g->>'name','email',g->>'email','maxCompanions',coalesce((g->>'maxCompanions')::integer,0))
 FROM myevents.guest_links gl JOIN myevents.invitations i ON i.event_id=gl.event_id JOIN myevents.events e ON e.id=i.event_id JOIN myevents.share_links l ON l.event_id=e.id AND l.kind='invitation' JOIN myevents.guest_books b ON b.event_id=e.id CROSS JOIN LATERAL jsonb_array_elements(b.document->'guests') g
 WHERE gl.token_hash=p_hash AND g->>'id'=gl.guest_id::text AND l.enabled AND i.published IS NOT NULL AND e.deleted_at IS NULL AND myevents.has_product(e.id,'invitation')
$$;
REVOKE ALL ON FUNCTION myevents.public_guest_invitation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION myevents.public_guest_invitation(text) TO myevents_app;
CREATE FUNCTION myevents.submit_guest_rsvp(p_hash text,p_response jsonb,p_revision integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE invitation record; parent_hash text; bound_response jsonb; companions integer; response_id uuid;
BEGIN
 -- Lock publication and guest list so a concurrent suspension/edit cannot bypass these checks.
 SELECT gl.response_id INTO response_id FROM myevents.guest_links gl JOIN myevents.invitations i ON i.event_id=gl.event_id JOIN myevents.guest_books b ON b.event_id=gl.event_id WHERE gl.token_hash=p_hash FOR UPDATE OF gl FOR SHARE OF i,b;
 SELECT * INTO invitation FROM myevents.public_guest_invitation(p_hash);
 IF invitation.event_id IS NULL OR invitation.revision<>p_revision THEN RAISE EXCEPTION 'Invitation unavailable'; END IF;
 companions:=coalesce((p_response->>'companions')::integer,0);
 IF companions<0 OR companions>coalesce((invitation.guest->>'maxCompanions')::integer,0) THEN RAISE EXCEPTION 'Companion limit exceeded'; END IF;
 bound_response:=p_response||jsonb_build_object('id',response_id::text,'guestId',invitation.guest->>'id','name',invitation.guest->>'name','companions',CASE WHEN p_response->>'presence'='yes' THEN companions ELSE 0 END);
 SELECT token_hash INTO parent_hash FROM myevents.share_links WHERE event_id=invitation.event_id AND kind='invitation' AND enabled FOR SHARE;
 PERFORM myevents.submit_rsvp(parent_hash,bound_response,p_revision);
 UPDATE myevents.rsvp_responses SET response=bound_response,created_at=now() WHERE id=response_id AND event_id=invitation.event_id;
END $$;
REVOKE ALL ON FUNCTION myevents.submit_guest_rsvp(text,jsonb,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION myevents.submit_guest_rsvp(text,jsonb,integer) TO myevents_app;
INSERT INTO myevents.migrations(version) VALUES('0009_guest_links');
