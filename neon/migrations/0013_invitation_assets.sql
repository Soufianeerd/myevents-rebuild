CREATE FUNCTION myevents.invitation_image_ids(doc jsonb, visible_only boolean) RETURNS TABLE(id text) LANGUAGE sql IMMUTABLE SET search_path='' AS $$
 SELECT doc->>'backgroundMediaId' WHERE doc->>'backgroundMediaId' IS NOT NULL
 UNION SELECT s->>'mediaId' FROM jsonb_array_elements(doc->'sections') s WHERE s->>'mediaId' IS NOT NULL AND (NOT visible_only OR (s->>'visible')::boolean)
 UNION SELECT s->>'backgroundMediaId' FROM jsonb_array_elements(doc->'sections') s WHERE s->>'backgroundMediaId' IS NOT NULL AND (NOT visible_only OR (s->>'visible')::boolean)
$$;
REVOKE ALL ON FUNCTION myevents.invitation_image_ids(jsonb,boolean) FROM PUBLIC;
CREATE OR REPLACE FUNCTION myevents.public_invitation_image(p_hash text,p_id uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT m.object_key FROM myevents.media_items m JOIN (
 SELECT event_id,document FROM myevents.public_invitation(p_hash) UNION ALL SELECT event_id,document FROM myevents.public_guest_invitation(p_hash)
 ) i ON i.event_id=m.event_id
 WHERE m.id=p_id AND m.status='ready' AND m.mime LIKE 'image/%' AND EXISTS(SELECT FROM myevents.invitation_image_ids(i.document,true) r WHERE r.id=p_id::text) LIMIT 1
$$;
CREATE OR REPLACE FUNCTION myevents.publish_invitation(p_event uuid,p_revision integer,p_hash text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE doc jsonb;
BEGIN
 IF NOT myevents.can_edit() OR NOT EXISTS(SELECT FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Access denied'; END IF;
 IF NOT myevents.has_product(p_event,'invitation') THEN RAISE EXCEPTION 'Invitation entitlement required'; END IF;
 SELECT draft INTO doc FROM myevents.invitations WHERE event_id=p_event AND revision=p_revision FOR UPDATE;
 IF doc IS NULL THEN RAISE EXCEPTION 'Revision conflict'; END IF;
 PERFORM m.id FROM myevents.media_items m WHERE m.event_id=p_event AND EXISTS(SELECT FROM myevents.invitation_image_ids(doc,false) r WHERE r.id=m.id::text) FOR SHARE OF m;
 IF EXISTS(SELECT FROM myevents.invitation_image_ids(doc,false) r WHERE NOT EXISTS(SELECT FROM myevents.media_items m WHERE m.id::text=r.id AND m.event_id=p_event AND m.status='ready' AND m.mime LIKE 'image/%')) THEN RAISE EXCEPTION 'Image unavailable'; END IF;
 UPDATE myevents.invitations SET published=draft,published_revision=revision,published_at=now() WHERE event_id=p_event AND revision=p_revision;
 IF NOT FOUND THEN RAISE EXCEPTION 'Revision conflict'; END IF;
 INSERT INTO myevents.share_links(token_hash,event_id,kind) VALUES(p_hash,p_event,'invitation') ON CONFLICT(event_id,kind) DO UPDATE SET token_hash=excluded.token_hash,enabled=true;
END $$;
CREATE OR REPLACE FUNCTION myevents.protect_published_image() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.status='deleted' AND OLD.status<>'deleted' AND EXISTS(SELECT FROM myevents.invitations i CROSS JOIN LATERAL myevents.invitation_image_ids(i.published,true) r WHERE i.event_id=OLD.event_id AND r.id=OLD.id::text) THEN RAISE EXCEPTION 'Retirez cette image de l’invitation publiée avant de la supprimer.'; END IF;
 RETURN NEW;
END $$;
INSERT INTO myevents.migrations(version) VALUES('0013_invitation_assets');
