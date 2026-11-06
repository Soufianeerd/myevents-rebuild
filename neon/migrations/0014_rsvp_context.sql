CREATE FUNCTION myevents.capture_rsvp_context() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE doc jsonb; labels jsonb; household_field text; household text;
BEGIN
 SELECT published INTO doc FROM myevents.invitations WHERE event_id=NEW.event_id;
 SELECT coalesce(jsonb_object_agg(f->>'id',f->>'label'),'{}'::jsonb) INTO labels FROM jsonb_array_elements(doc->'fields') f;
 SELECT f->>'id' INTO household_field FROM jsonb_array_elements(doc->'fields') f WHERE f->>'binding'='household' AND f->>'type'='text' LIMIT 1;
 household:=btrim(coalesce(NEW.response->'answers'->>household_field,''));
 IF length(household)>150 THEN RAISE EXCEPTION 'Household name too long'; END IF;
 NEW.response:=(NEW.response-'household'-'answerLabels')||jsonb_build_object('answerLabels',labels);
 IF household<>'' THEN NEW.response:=NEW.response||jsonb_build_object('household',household); END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION myevents.capture_rsvp_context() FROM PUBLIC;
CREATE TRIGGER capture_rsvp_context BEFORE INSERT OR UPDATE OF response ON myevents.rsvp_responses FOR EACH ROW EXECUTE FUNCTION myevents.capture_rsvp_context();
INSERT INTO myevents.migrations(version) VALUES('0014_rsvp_context');
