-- Preflight read-only. Run with psql -X -v ON_ERROR_STOP=1 -f this-file.sql.
-- Keep the report outside Git: schema names and definitions can be private.
-- Estimated rows are NOT evidence of a complete migration.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout = '30s';

SELECT current_database() AS database_name,
       current_setting('server_version') AS server_version,
       pg_database_size(current_database()) AS database_bytes;

SELECT extname, extversion FROM pg_extension ORDER BY extname;

SELECT n.nspname AS schema_name,
       c.relname AS relation_name,
       c.relkind AS relation_kind,
       c.reltuples::bigint AS estimated_rows,
       pg_total_relation_size(c.oid) AS total_bytes,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND n.nspname NOT LIKE 'pg_toast%'
  AND n.nspname NOT LIKE 'pg_temp_%'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')
ORDER BY n.nspname, c.relname;

SELECT table_schema, table_name, column_name, ordinal_position,
       data_type, udt_schema, udt_name, is_nullable, is_identity
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name, ordinal_position;

SELECT n.nspname AS schema_name, c.relname AS table_name,
       con.conname AS constraint_name, con.contype AS constraint_type,
       pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, c.relname, con.conname;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
ORDER BY schemaname, tablename, policyname;

SELECT n.nspname AS schema_name, p.proname AS routine_name,
       pg_get_function_identity_arguments(p.oid) AS arguments,
       p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, p.proname, p.oid;

SELECT n.nspname AS schema_name, c.relname AS table_name,
       t.tgname AS trigger_name, pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT t.tgisinternal
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, c.relname, t.tgname;

ROLLBACK;
