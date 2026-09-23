ALTER TABLE myevents.media_items ADD COLUMN purpose text NOT NULL DEFAULT 'guest' CHECK(purpose IN ('guest','design'));
CREATE FUNCTION myevents.reserve_design_image(p_event uuid,p_id uuid,p_hash text,p_data jsonb) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE t uuid; bytes bigint; key text;
BEGIN
 SELECT tenant_id INTO t FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL;
 IF t IS NULL OR NOT myevents.can_edit() THEN RAISE EXCEPTION 'Access denied'; END IF;
 IF NOT myevents.has_product(p_event,'invitation') AND NOT myevents.has_product(p_event,'thank_you') THEN RAISE EXCEPTION 'Entitlement required'; END IF;
 bytes:=(p_data->>'size')::bigint;
 IF bytes NOT BETWEEN 1 AND 20971520 OR p_data->>'mime' NOT IN ('image/jpeg','image/png','image/webp','image/gif') OR length(p_data->>'name') NOT BETWEEN 1 AND 180 OR p_data->>'consent'<>'true' THEN RAISE EXCEPTION 'Invalid image'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('media-project-quota',0));
 IF (SELECT coalesce(sum(size),0) FROM myevents.media_items WHERE tenant_id=t AND status<>'deleted')+bytes>3000000000 THEN RAISE EXCEPTION 'Account quota exceeded'; END IF;
 IF (SELECT coalesce(sum(size),0) FROM myevents.media_items WHERE status<>'deleted')+bytes>4500000000 THEN RAISE EXCEPTION 'Staging storage capacity reached'; END IF;
 key:=t::text||'/'||p_event::text||'/'||p_id::text;
 INSERT INTO myevents.media_items(id,event_id,tenant_id,kind,purpose,object_key,upload_hash,name,author,mime,size,hidden) VALUES(p_id,p_event,t,'photo_video','design',key,p_hash,p_data->>'name','Organisateur',p_data->>'mime',bytes,true);
 RETURN key;
END $$;
CREATE OR REPLACE FUNCTION myevents.shared_media(p_hash text) RETURNS TABLE(id uuid,name text,author text,mime text,size bigint,created_at timestamptz,object_key text,allow_download boolean) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT m.id,m.name,m.author,m.mime,m.size,m.created_at,m.object_key,s.allow_download FROM myevents.media_items m JOIN myevents.public_media_space(p_hash) s ON s.event_id=m.event_id AND s.kind=m.kind WHERE s.collaborative AND s.available_at<=now() AND m.status='ready' AND m.purpose='guest' AND NOT m.hidden ORDER BY m.created_at DESC
$$;
CREATE FUNCTION myevents.public_invitation_image(p_hash text,p_id uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT m.object_key FROM myevents.media_items m JOIN (
 SELECT event_id,document FROM myevents.public_invitation(p_hash) UNION ALL SELECT event_id,document FROM myevents.public_guest_invitation(p_hash)
 ) i ON i.event_id=m.event_id
 WHERE m.id=p_id AND m.status='ready' AND m.mime LIKE 'image/%' AND EXISTS(SELECT FROM jsonb_array_elements(i.document->'sections') s WHERE s->>'type'='image' AND s->>'mediaId'=p_id::text AND (s->>'visible')::boolean)
 LIMIT 1
$$;
REVOKE ALL ON FUNCTION myevents.reserve_design_image(uuid,uuid,text,jsonb),myevents.public_invitation_image(text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION myevents.reserve_design_image(uuid,uuid,text,jsonb),myevents.public_invitation_image(text,uuid) TO myevents_app;
CREATE OR REPLACE FUNCTION myevents.publish_invitation(p_event uuid,p_revision integer,p_hash text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE doc jsonb;
BEGIN
 IF NOT myevents.can_edit() OR NOT EXISTS(SELECT FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Access denied'; END IF;
 IF NOT myevents.has_product(p_event,'invitation') THEN RAISE EXCEPTION 'Invitation entitlement required'; END IF;
 SELECT draft INTO doc FROM myevents.invitations WHERE event_id=p_event AND revision=p_revision;
 IF doc IS NULL THEN RAISE EXCEPTION 'Revision conflict'; END IF;
 PERFORM m.id FROM myevents.media_items m WHERE m.event_id=p_event AND EXISTS(SELECT FROM jsonb_array_elements(doc->'sections') s WHERE s->>'mediaId'=m.id::text) FOR SHARE OF m;
 IF EXISTS(SELECT FROM jsonb_array_elements(doc->'sections') s WHERE s->>'mediaId' IS NOT NULL AND NOT EXISTS(SELECT FROM myevents.media_items m WHERE m.id::text=s->>'mediaId' AND m.event_id=p_event AND m.status='ready' AND m.mime LIKE 'image/%')) THEN RAISE EXCEPTION 'Image unavailable'; END IF;
 UPDATE myevents.invitations SET published=draft,published_revision=revision,published_at=now() WHERE event_id=p_event AND revision=p_revision;
 IF NOT FOUND THEN RAISE EXCEPTION 'Revision conflict'; END IF;
 INSERT INTO myevents.share_links(token_hash,event_id,kind) VALUES(p_hash,p_event,'invitation') ON CONFLICT(event_id,kind) DO UPDATE SET token_hash=excluded.token_hash,enabled=true;
END $$;
CREATE FUNCTION myevents.protect_published_image() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.status='deleted' AND OLD.status<>'deleted' AND EXISTS(SELECT FROM myevents.invitations i CROSS JOIN LATERAL jsonb_array_elements(i.published->'sections') s WHERE i.event_id=OLD.event_id AND s->>'type'='image' AND s->>'mediaId'=OLD.id::text AND (s->>'visible')::boolean) THEN RAISE EXCEPTION 'Retirez cette photo de l’invitation publiée avant de la supprimer.'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION myevents.protect_published_image() FROM PUBLIC;
CREATE TRIGGER protect_published_image BEFORE UPDATE OF status ON myevents.media_items FOR EACH ROW EXECUTE FUNCTION myevents.protect_published_image();
INSERT INTO myevents.migrations(version) VALUES('0010_design_images');
