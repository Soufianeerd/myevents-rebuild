import { expect, it } from 'vitest';
import {
  copyTables,
  hashRows,
  selectContents,
} from '../../../scripts/migration/restore-source-staging.mjs';

it('selects legacy application, Auth and Storage data while preserving platform-only entries separately', () => {
  const included = [
    '1; 0 1 TABLE DATA auth users owner',
    '2; 0 2 TABLE DATA public events owner',
    '3; 0 3 TABLE DATA storage objects owner',
    '4; 0 4 FK CONSTRAINT public events events_created_by_fkey owner',
    '5; 0 5 POLICY public events events_select owner',
    '6; 0 6 SEQUENCE SET auth refresh_tokens_id_seq owner',
    '7; 0 7 EXTENSION - pgcrypto ',
    '8; 0 8 SCHEMA - auth owner',
  ];
  const excluded = [
    '9; 0 9 ACL public TABLE events owner',
    '10; 0 10 EXTENSION - supabase_vault ',
    '11; 0 11 FUNCTION extensions grant_pg_cron_access() owner',
    '12; 0 12 TABLE DATA realtime messages owner',
    '13; 0 13 EVENT TRIGGER - pgrst_ddl_watch owner',
    '14; 0 14 TABLE DATA public_other events owner',
    '15; 0 15 PUBLICATION - supabase_realtime owner',
  ];
  expect(selectContents([...included, ...excluded].join('\n'))).toEqual({
    selected: included,
    excluded,
  });
});

it('compares complete COPY rows including escaped newlines, nulls and duplicates without depending on row order', () => {
  const sql = String.raw`COPY auth.users (id, email) FROM stdin;
u1\tfirst@example.test
\.
COPY public.events (id, title, "position") FROM stdin;
e1\tline one\nline two\t\N
e1\tline one\nline two\t\N
\.
COPY storage.s3_multipart_uploads (id) FROM stdin;
\.
`;
  const tables = copyTables(sql);
  expect(tables).toHaveLength(3);
  expect(tables[2]).toMatchObject({
    name: 'storage.s3_multipart_uploads',
    rows: 0,
  });
  expect(tables[1]).toMatchObject({ name: 'public.events', rows: 2 });
  expect(hashRows(['a', 'b'])).toBe(hashRows(['b', 'a']));
  expect(hashRows(['a', 'b'])).not.toBe(hashRows(['a', 'a', 'b']));
  expect(hashRows(['a\tb'])).not.toBe(hashRows(['a', 'b']));
});

it('refuses an unrecognized archive or COPY export missing Auth', () => {
  expect(() => selectContents('malformed archive entry')).toThrow();
  expect(() =>
    copyTables('COPY public.events (id) FROM stdin;\n1\n\\.\n'),
  ).toThrow('incomplete');
});
