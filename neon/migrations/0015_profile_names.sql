CREATE POLICY own_profile_update ON myevents.profiles FOR UPDATE TO myevents_app USING(neon_user_id=myevents.verified_subject()) WITH CHECK(neon_user_id=myevents.verified_subject());
ALTER TABLE myevents.profiles ADD CONSTRAINT profile_names_length CHECK(length(first_name)<=100 AND length(last_name)<=100) NOT VALID;
GRANT UPDATE(first_name,last_name,updated_at) ON myevents.profiles TO myevents_app;
INSERT INTO myevents.migrations(version) VALUES('0015_profile_names');
