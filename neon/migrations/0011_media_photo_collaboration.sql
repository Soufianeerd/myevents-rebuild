-- Guest collaboration applies exclusively to photo/video. Existing audio
-- contributions are retained, while previous public-gallery settings are revoked.
UPDATE myevents.media_spaces SET collaborative=false,allow_download=false WHERE kind='audio';
ALTER TABLE myevents.media_spaces ADD CONSTRAINT audio_space_private CHECK(kind<>'audio' OR (NOT collaborative AND NOT allow_download));
CREATE OR REPLACE FUNCTION myevents.shared_media(p_hash text) RETURNS TABLE(id uuid,name text,author text,mime text,size bigint,created_at timestamptz,object_key text,allow_download boolean) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT m.id,m.name,m.author,m.mime,m.size,m.created_at,m.object_key,s.allow_download FROM myevents.media_items m JOIN myevents.public_media_space(p_hash) s ON s.event_id=m.event_id AND s.kind=m.kind WHERE s.kind='photo_video' AND s.collaborative AND s.available_at<=now() AND m.status='ready' AND m.purpose='guest' AND NOT m.hidden ORDER BY m.created_at DESC
$$;
INSERT INTO myevents.migrations(version) VALUES('0011_media_photo_collaboration');
