CREATE OR REPLACE FUNCTION myevents.reserve_design_image(p_event uuid,p_id uuid,p_hash text,p_data jsonb) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE t uuid; bytes bigint; key text;
BEGIN
 SELECT tenant_id INTO t FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL;
 IF t IS NULL OR NOT myevents.can_edit() THEN RAISE EXCEPTION 'Access denied'; END IF;
 IF ((p_data->>'mime') LIKE 'audio/%' AND NOT myevents.has_product(p_event,'invitation')) OR (NOT myevents.has_product(p_event,'invitation') AND NOT myevents.has_product(p_event,'thank_you')) THEN RAISE EXCEPTION 'Entitlement required'; END IF;
 bytes:=(p_data->>'size')::bigint;
 IF bytes NOT BETWEEN 1 AND 104857600 OR ((p_data->>'mime') LIKE 'image/%' AND bytes>20971520) OR p_data->>'mime' NOT IN ('image/jpeg','image/png','image/webp','image/gif','audio/mpeg','audio/mp4','audio/webm','audio/ogg','audio/wav','audio/x-wav') OR length(p_data->>'name') NOT BETWEEN 1 AND 180 OR p_data->>'consent'<>'true' THEN RAISE EXCEPTION 'Invalid image'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('media-project-quota',0));
 IF (SELECT coalesce(sum(size),0) FROM myevents.media_items WHERE tenant_id=t AND status<>'deleted')+bytes>3000000000 THEN RAISE EXCEPTION 'Account quota exceeded'; END IF;
 IF (SELECT coalesce(sum(size),0) FROM myevents.media_items WHERE status<>'deleted')+bytes>4500000000 THEN RAISE EXCEPTION 'Staging storage capacity reached'; END IF;
 key:=t::text||'/'||p_event::text||'/'||p_id::text;
 INSERT INTO myevents.media_items(id,event_id,tenant_id,kind,purpose,object_key,upload_hash,name,author,mime,size,hidden) VALUES(p_id,p_event,t,CASE WHEN (p_data->>'mime') LIKE 'audio/%' THEN 'audio' ELSE 'photo_video' END,'design',key,p_hash,p_data->>'name','Organisateur',p_data->>'mime',bytes,true);
 RETURN key;
END $$;
CREATE OR REPLACE FUNCTION myevents.public_invitation_image(p_hash text,p_id uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT m.object_key FROM myevents.media_items m JOIN (
 SELECT event_id,document FROM myevents.public_invitation(p_hash) UNION ALL SELECT event_id,document FROM myevents.public_guest_invitation(p_hash)
 ) i ON i.event_id=m.event_id
 WHERE m.id=p_id AND m.status='ready' AND ((m.mime LIKE 'image/%' AND EXISTS(SELECT FROM myevents.invitation_image_ids(i.document,true) r WHERE r.id=p_id::text)) OR (m.mime LIKE 'audio/%' AND m.purpose='design' AND i.document->'music'->>'mediaId'=p_id::text)) LIMIT 1
$$;
CREATE OR REPLACE FUNCTION myevents.publish_invitation(p_event uuid,p_revision integer,p_hash text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE doc jsonb;
BEGIN
 IF NOT myevents.can_edit() OR NOT EXISTS(SELECT FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Access denied'; END IF;
 IF NOT myevents.has_product(p_event,'invitation') THEN RAISE EXCEPTION 'Invitation entitlement required'; END IF;
 SELECT draft INTO doc FROM myevents.invitations WHERE event_id=p_event AND revision=p_revision FOR UPDATE;
 IF doc IS NULL THEN RAISE EXCEPTION 'Revision conflict'; END IF;
 PERFORM m.id FROM myevents.media_items m WHERE m.event_id=p_event AND EXISTS(SELECT 1 FROM myevents.invitation_image_ids(doc,false) r WHERE r.id=m.id::text UNION ALL SELECT 1 WHERE doc->'music'->>'mediaId'=m.id::text) FOR SHARE OF m;
 IF EXISTS(SELECT FROM myevents.invitation_image_ids(doc,false) r WHERE NOT EXISTS(SELECT FROM myevents.media_items m WHERE m.id::text=r.id AND m.event_id=p_event AND m.status='ready' AND m.mime LIKE 'image/%')) THEN RAISE EXCEPTION 'Image unavailable'; END IF;
 IF doc->'music'->>'mediaId' IS NOT NULL AND NOT EXISTS(SELECT FROM myevents.media_items m WHERE m.id::text=doc->'music'->>'mediaId' AND m.event_id=p_event AND m.status='ready' AND m.mime LIKE 'audio/%' AND m.purpose='design') THEN RAISE EXCEPTION 'Music unavailable'; END IF;
 UPDATE myevents.invitations SET published=draft,published_revision=revision,published_at=now() WHERE event_id=p_event AND revision=p_revision;
 IF NOT FOUND THEN RAISE EXCEPTION 'Revision conflict'; END IF;
 INSERT INTO myevents.share_links(token_hash,event_id,kind) VALUES(p_hash,p_event,'invitation') ON CONFLICT(event_id,kind) DO UPDATE SET token_hash=excluded.token_hash,enabled=true;
END $$;
CREATE OR REPLACE FUNCTION myevents.protect_published_image() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.status='deleted' AND OLD.status<>'deleted' AND EXISTS(SELECT FROM myevents.invitations i WHERE i.event_id=OLD.event_id AND (i.published->'music'->>'mediaId'=OLD.id::text OR EXISTS(SELECT FROM myevents.invitation_image_ids(i.published,true) r WHERE r.id=OLD.id::text))) THEN RAISE EXCEPTION 'Retirez cette image de l’invitation publiée avant de la supprimer.'; END IF;
 RETURN NEW;
END $$;
INSERT INTO myevents.migrations(version) VALUES('0016_invitation_music');
