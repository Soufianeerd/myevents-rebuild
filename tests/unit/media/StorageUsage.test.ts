import { it, expect } from 'vitest';
import { summarizeMediaUsage, storageAlert } from '@/core/media/models';
it('includes pending uploads and design photos once, excluding deleted objects', () => {
  const usage = summarizeMediaUsage([
    { size: 200, mime: 'image/jpeg', purpose: 'design', status: 'ready' },
    { size: 100, mime: 'audio/mpeg', status: 'pending' },
    { size: 900, mime: 'video/mp4', status: 'deleted' },
  ]);
  expect(usage).toMatchObject({
    total: 300,
    studio: 200,
    audio: 100,
    pending: 100,
    videos: 0,
    photos: 0,
    limit: 3000000000,
  });
});
it('warns at 75 and 90 percent and identifies full storage', () => {
  expect(storageAlert({ total: 2249999999, limit: 3000000000 }).level).toBe(
    'normal',
  );
  expect(storageAlert({ total: 2250000000, limit: 3000000000 }).level).toBe(
    'warning',
  );
  expect(storageAlert({ total: 2700000000, limit: 3000000000 }).level).toBe(
    'critical',
  );
  expect(storageAlert({ total: 3000000000, limit: 3000000000 })).toEqual({
    level: 'full',
    percent: 100,
  });
});
