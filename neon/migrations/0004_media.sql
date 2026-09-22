CREATE TABLE myevents.media_spaces(event_id uuid NOT NULL REFERENCES myevents.events(id),kind text NOT NULL CHECK(kind IN ('audio','photo_video')),enabled boolean NOT NULL DEFAULT true,collaborative boolean NOT NULL DEFAULT false,available_at timestamptz NOT NULL,allow_download boolean NOT NULL DEFAULT false,PRIMARY KEY(event_id,kind));
CREATE TABLE myevents.media_items(id uuid PRIMARY KEY,event_id uuid NOT NULL REFERENCES myevents.events(id),tenant_id uuid NOT NULL,kind text NOT NULL CHECK(kind IN ('audio','photo_video')),object_key text NOT NULL UNIQUE,upload_hash text NOT NULL,name text NOT NULL,author text NOT NULL DEFAULT '',mime text NOT NULL,size bigint NOT NULL CHECK(size>0 AND size<=104857600),status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','ready','deleted')),hidden boolean NOT NULL DEFAULT false,favorite boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX media_event ON myevents.media_items(event_id,status);
ALTER TABLE myevents.media_spaces ENABLE ROW LEVEL SECURITY;ALTER TABLE myevents.media_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY media_space_read ON myevents.media_spaces FOR SELECT TO myevents_app USING(EXISTS(SELECT FROM myevents.events WHERE id=event_id AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL));
CREATE POLICY media_read ON myevents.media_items FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant());
CREATE POLICY media_moderate ON myevents.media_items FOR UPDATE TO myevents_app USING(tenant_id=myevents.current_tenant() AND myevents.can_edit()) WITH CHECK(tenant_id=myevents.current_tenant());
GRANT SELECT ON myevents.media_spaces,myevents.media_items TO myevents_app;
GRANT UPDATE(name,hidden,favorite,status) ON myevents.media_items TO myevents_app;
CREATE FUNCTION myevents.configure_media(p_event uuid,p_kind text,p_hash text,p_config jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE e myevents.events;
BEGIN
 SELECT * INTO e FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL;
 IF e.id IS NULL OR NOT myevents.can_edit() OR p_kind NOT IN ('audio','photo_video') THEN RAISE EXCEPTION 'Access denied'; END IF;
 IF NOT EXISTS(SELECT FROM myevents.orders WHERE event_id=p_event AND status='paid' AND offer->'products' ? p_kind) THEN RAISE EXCEPTION 'Entitlement required'; END IF;
 INSERT INTO myevents.media_spaces(event_id,kind,enabled,collaborative,available_at,allow_download) VALUES(p_event,p_kind,coalesce((p_config->>'enabled')::boolean,true),coalesce((p_config->>'collaborative')::boolean,false),coalesce((p_config->>'availableAt')::timestamptz,coalesce(e.end_at,e.start_at)+interval '24 hours'),coalesce((p_config->>'allowDownload')::boolean,false)) ON CONFLICT(event_id,kind) DO UPDATE SET enabled=excluded.enabled,collaborative=excluded.collaborative,available_at=excluded.available_at,allow_download=excluded.allow_download;
 INSERT INTO myevents.share_links(token_hash,event_id,kind,enabled) VALUES(p_hash,p_event,p_kind,coalesce((p_config->>'enabled')::boolean,true)) ON CONFLICT(event_id,kind) DO UPDATE SET token_hash=excluded.token_hash,enabled=excluded.enabled;
END $$;
CREATE FUNCTION myevents.public_media_space(p_hash text) RETURNS TABLE(event_id uuid,kind text,title text,collaborative boolean,available_at timestamptz,allow_download boolean) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT s.event_id,s.kind,e.name,s.collaborative,s.available_at,s.allow_download FROM myevents.media_spaces s JOIN myevents.share_links l ON l.event_id=s.event_id AND l.kind=s.kind JOIN myevents.events e ON e.id=s.event_id WHERE l.token_hash=p_hash AND l.enabled AND s.enabled AND e.deleted_at IS NULL AND EXISTS(SELECT FROM myevents.orders WHERE event_id=e.id AND status='paid' AND offer->'products' ? s.kind)
$$;
CREATE FUNCTION myevents.reserve_media(p_hash text,p_id uuid,p_upload_hash text,p_data jsonb) RETURNS TABLE(object_key text) LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s record;t uuid;bytes bigint;key text;
BEGIN
 SELECT * INTO s FROM myevents.public_media_space(p_hash);IF s.event_id IS NULL THEN RAISE EXCEPTION 'Space unavailable'; END IF;
 SELECT tenant_id INTO t FROM myevents.events WHERE id=s.event_id;
 PERFORM pg_advisory_xact_lock(hashtextextended('media-project-quota',0));
 bytes:=(p_data->>'size')::bigint;
 IF bytes NOT BETWEEN 1 AND 104857600 OR length(p_data->>'name') NOT BETWEEN 1 AND 180 OR length(p_data->>'author')>100 OR p_data->>'consent'<>'true' THEN RAISE EXCEPTION 'Invalid upload'; END IF;
 IF (s.kind='audio' AND p_data->>'mime' NOT LIKE 'audio/%') OR (s.kind='photo_video' AND p_data->>'mime' NOT LIKE 'image/%' AND p_data->>'mime' NOT LIKE 'video/%') THEN RAISE EXCEPTION 'Invalid kind'; END IF;
 IF (SELECT coalesce(sum(size),0) FROM myevents.media_items WHERE tenant_id=t AND status<>'deleted')+bytes>3000000000 THEN RAISE EXCEPTION 'Account quota exceeded'; END IF;
 IF (SELECT coalesce(sum(size),0) FROM myevents.media_items WHERE status<>'deleted')+bytes>4500000000 THEN RAISE EXCEPTION 'Staging storage capacity reached'; END IF;
 key:=t::text||'/'||s.event_id::text||'/'||p_id::text;
 INSERT INTO myevents.media_items(id,event_id,tenant_id,kind,object_key,upload_hash,name,author,mime,size) VALUES(p_id,s.event_id,t,s.kind,key,p_upload_hash,p_data->>'name',coalesce(p_data->>'author',''),p_data->>'mime',bytes);
 RETURN QUERY SELECT key;
END $$;
CREATE FUNCTION myevents.pending_media(p_id uuid,p_hash text) RETURNS SETOF myevents.media_items LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT * FROM myevents.media_items WHERE id=p_id AND upload_hash=p_hash AND status='pending' AND created_at>now()-interval '15 minutes'
$$;
CREATE FUNCTION myevents.complete_media(p_id uuid,p_hash text,p_size bigint,p_mime text,p_key text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 UPDATE myevents.media_items SET status='ready',object_key=p_key WHERE id=p_id AND upload_hash=p_hash AND status='pending' AND size=p_size AND mime=p_mime AND created_at>now()-interval '15 minutes';IF NOT FOUND THEN RAISE EXCEPTION 'Upload unavailable'; END IF;
END $$;
CREATE FUNCTION myevents.cancel_media(p_id uuid,p_hash text) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 UPDATE myevents.media_items SET status='deleted' WHERE id=p_id AND upload_hash=p_hash AND status='pending'
$$;
CREATE FUNCTION myevents.shared_media(p_hash text) RETURNS TABLE(id uuid,name text,author text,mime text,size bigint,created_at timestamptz,object_key text,allow_download boolean) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT m.id,m.name,m.author,m.mime,m.size,m.created_at,m.object_key,s.allow_download FROM myevents.media_items m JOIN myevents.public_media_space(p_hash) s ON s.event_id=m.event_id AND s.kind=m.kind WHERE s.collaborative AND s.available_at<=now() AND m.status='ready' AND NOT m.hidden ORDER BY m.created_at DESC
$$;
REVOKE ALL ON FUNCTION myevents.configure_media(uuid,text,text,jsonb),myevents.public_media_space(text),myevents.reserve_media(text,uuid,text,jsonb),myevents.pending_media(uuid,text),myevents.complete_media(uuid,text,bigint,text,text),myevents.cancel_media(uuid,text),myevents.shared_media(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION myevents.configure_media(uuid,text,text,jsonb),myevents.public_media_space(text),myevents.reserve_media(text,uuid,text,jsonb),myevents.pending_media(uuid,text),myevents.complete_media(uuid,text,bigint,text,text),myevents.cancel_media(uuid,text),myevents.shared_media(text) TO myevents_app;
INSERT INTO myevents.migrations(version) VALUES('0004_media');
