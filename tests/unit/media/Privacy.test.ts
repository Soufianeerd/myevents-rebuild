import { expect, it } from 'vitest';
import {
  isGalleryOpen,
  privateAudioSpace,
  validateSpace,
} from '@/core/media/models';
const config = {
  enabled: true,
  collaborative: true,
  allowDownload: true,
  availableAt: '2020-01-01T00:00:00.000Z',
};
it('never turns an audio contribution link into a guest gallery, including legacy settings', () => {
  expect(() => validateSpace('audio', config)).toThrow();
  expect(() =>
    validateSpace('audio', { ...config, collaborative: false }),
  ).toThrow();
  expect(isGalleryOpen({ ...config, kind: 'audio' }, Date.now())).toBe(false);
  expect(privateAudioSpace({ ...config, kind: 'audio' })).toMatchObject({
    collaborative: false,
    allowDownload: false,
  });
  expect(
    validateSpace('audio', {
      ...config,
      collaborative: false,
      allowDownload: false,
    }).enabled,
  ).toBe(true);
});
it('opens only the photo/video gallery at its chosen date', () => {
  expect(isGalleryOpen({ ...config, kind: 'photo_video' }, Date.now())).toBe(
    true,
  );
  expect(
    isGalleryOpen(
      {
        ...config,
        kind: 'photo_video',
        availableAt: '2999-01-01T00:00:00.000Z',
      },
      Date.now(),
    ),
  ).toBe(false);
  expect(validateSpace('photo_video', config)).toEqual(config);
});
