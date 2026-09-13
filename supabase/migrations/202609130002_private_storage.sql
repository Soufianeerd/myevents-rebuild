begin;

-- Bucket is private and initially read/delete-only. Upload grants are intentionally
-- absent until server MIME/size/quota validation is implemented in the media milestone.
insert into storage.buckets (id, name, public)
values ('event-assets', 'event-assets', false);

-- Keys: <tenant UUID>/<event UUID>/<opaque asset name>.
create policy myevents_assets_read on storage.objects for select to authenticated
using (
  bucket_id = 'event-assets'
  and (storage.foldername(storage.objects.name))[1] in (select tenant_id::text from public.profiles where id = (select auth.uid()))
  and exists (select 1 from public.events e where e.id::text = (storage.foldername(storage.objects.name))[2] and e.tenant_id::text = (storage.foldername(storage.objects.name))[1] and e.deleted_at is null)
);
create policy myevents_assets_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'event-assets'
  and (storage.foldername(storage.objects.name))[1] in (select tenant_id::text from public.profiles where id = (select auth.uid()))
  and exists (select 1 from public.events e where e.id::text = (storage.foldername(storage.objects.name))[2] and e.tenant_id::text = (storage.foldername(storage.objects.name))[1] and e.deleted_at is null)
);

commit;
