CREATE TABLE myevents.preview_settings(singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),enabled boolean NOT NULL DEFAULT false);
INSERT INTO myevents.preview_settings VALUES(true,false);
CREATE TABLE myevents.preview_access(event_id uuid PRIMARY KEY REFERENCES myevents.events(id),tenant_id uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE myevents.preview_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY preview_read ON myevents.preview_access FOR SELECT TO myevents_app USING(tenant_id=myevents.current_tenant());
GRANT SELECT ON myevents.preview_access TO myevents_app;
CREATE VIEW myevents.event_entitlements WITH(security_invoker=true) AS SELECT DISTINCT event_id,tenant_id,jsonb_array_elements_text(offer->'products') AS product FROM myevents.orders WHERE status='paid' UNION SELECT event_id,tenant_id,unnest(ARRAY['invitation','audio','photo_video','thank_you']) AS product FROM myevents.preview_access;
GRANT SELECT ON myevents.event_entitlements TO myevents_app;
CREATE FUNCTION myevents.has_product(p_event uuid,p_product text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT EXISTS(SELECT FROM myevents.event_entitlements WHERE event_id=p_event AND product=p_product) $$;
REVOKE ALL ON FUNCTION myevents.has_product(uuid,text) FROM PUBLIC;
CREATE FUNCTION myevents.activate_preview(p_event uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT EXISTS(SELECT FROM myevents.preview_settings WHERE enabled) OR NOT myevents.can_edit() OR NOT EXISTS(SELECT FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Preview unavailable'; END IF;
 INSERT INTO myevents.preview_access(event_id,tenant_id) VALUES(p_event,myevents.current_tenant()) ON CONFLICT DO NOTHING;
END $$;
REVOKE ALL ON FUNCTION myevents.activate_preview(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION myevents.activate_preview(uuid) TO myevents_app;
CREATE OR REPLACE FUNCTION myevents.publish_invitation(p_event uuid,p_revision integer,p_hash text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT myevents.can_edit() OR NOT EXISTS(SELECT FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Access denied'; END IF;
 IF NOT myevents.has_product(p_event,'invitation') THEN RAISE EXCEPTION 'Invitation entitlement required'; END IF;
 UPDATE myevents.invitations SET published=draft,published_revision=revision,published_at=now() WHERE event_id=p_event AND revision=p_revision;
 IF NOT FOUND THEN RAISE EXCEPTION 'Revision conflict'; END IF;
 INSERT INTO myevents.share_links(token_hash,event_id,kind) VALUES(p_hash,p_event,'invitation') ON CONFLICT(event_id,kind) DO UPDATE SET token_hash=excluded.token_hash,enabled=true;
END $$;
CREATE OR REPLACE FUNCTION myevents.public_invitation(p_hash text) RETURNS TABLE(event_id uuid,document jsonb,revision integer) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT i.event_id,i.published,i.published_revision FROM myevents.invitations i JOIN myevents.share_links l ON l.event_id=i.event_id JOIN myevents.events e ON e.id=i.event_id
 WHERE l.token_hash=p_hash AND l.kind='invitation' AND l.enabled AND i.published IS NOT NULL AND e.deleted_at IS NULL AND myevents.has_product(e.id,'invitation')
$$;
CREATE OR REPLACE FUNCTION myevents.submit_rsvp(p_hash text,p_response jsonb,p_revision integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE invitation record;
BEGIN
 SELECT i.event_id,i.tenant_id,i.published,i.published_revision INTO invitation FROM myevents.invitations i JOIN myevents.share_links l ON l.event_id=i.event_id JOIN myevents.events e ON e.id=i.event_id WHERE l.token_hash=p_hash AND l.kind='invitation' AND l.enabled AND i.published IS NOT NULL AND e.deleted_at IS NULL AND myevents.has_product(e.id,'invitation') FOR SHARE OF i,l,e;
 IF invitation.event_id IS NULL OR invitation.published_revision<>p_revision OR NOT coalesce((invitation.published->>'rsvpEnabled')::boolean,false) THEN RAISE EXCEPTION 'Invitation unavailable'; END IF;
 IF invitation.published->>'deadline' IS NOT NULL AND (invitation.published->>'deadline')::timestamptz<now() THEN RAISE EXCEPTION 'Deadline passed'; END IF;
 IF p_response->>'presence' NOT IN ('yes','no') OR p_response->>'consent'<>'true' OR length(p_response->>'name') NOT BETWEEN 1 AND 150 OR length(p_response->>'email') NOT BETWEEN 3 AND 254 THEN RAISE EXCEPTION 'Invalid response'; END IF;
 INSERT INTO myevents.rsvp_responses(id,event_id,tenant_id,response) VALUES((p_response->>'id')::uuid,invitation.event_id,invitation.tenant_id,p_response) ON CONFLICT(id) DO NOTHING;
END $$;
CREATE OR REPLACE FUNCTION myevents.configure_media(p_event uuid,p_kind text,p_hash text,p_config jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE e myevents.events;
BEGIN
 SELECT * INTO e FROM myevents.events WHERE id=p_event AND tenant_id=myevents.current_tenant() AND deleted_at IS NULL;
 IF e.id IS NULL OR NOT myevents.can_edit() OR p_kind NOT IN ('audio','photo_video') THEN RAISE EXCEPTION 'Access denied'; END IF;
 IF NOT myevents.has_product(p_event,p_kind) THEN RAISE EXCEPTION 'Entitlement required'; END IF;
 INSERT INTO myevents.media_spaces(event_id,kind,enabled,collaborative,available_at,allow_download) VALUES(p_event,p_kind,coalesce((p_config->>'enabled')::boolean,true),coalesce((p_config->>'collaborative')::boolean,false),coalesce((p_config->>'availableAt')::timestamptz,coalesce(e.end_at,e.start_at)+interval '24 hours'),coalesce((p_config->>'allowDownload')::boolean,false)) ON CONFLICT(event_id,kind) DO UPDATE SET enabled=excluded.enabled,collaborative=excluded.collaborative,available_at=excluded.available_at,allow_download=excluded.allow_download;
 INSERT INTO myevents.share_links(token_hash,event_id,kind,enabled) VALUES(p_hash,p_event,p_kind,coalesce((p_config->>'enabled')::boolean,true)) ON CONFLICT(event_id,kind) DO UPDATE SET token_hash=excluded.token_hash,enabled=excluded.enabled;
END $$;
CREATE OR REPLACE FUNCTION myevents.public_media_space(p_hash text) RETURNS TABLE(event_id uuid,kind text,title text,collaborative boolean,available_at timestamptz,allow_download boolean) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT s.event_id,s.kind,e.name,s.collaborative,s.available_at,s.allow_download FROM myevents.media_spaces s JOIN myevents.share_links l ON l.event_id=s.event_id AND l.kind=s.kind JOIN myevents.events e ON e.id=s.event_id WHERE l.token_hash=p_hash AND l.enabled AND s.enabled AND e.deleted_at IS NULL AND myevents.has_product(e.id,s.kind)
$$;
INSERT INTO myevents.migrations(version) VALUES('0006_business_preview');
