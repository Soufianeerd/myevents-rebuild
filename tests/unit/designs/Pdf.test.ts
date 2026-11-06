import { it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';
import { newThankYou, designElementSchema } from '@/core/designs/models';
import { renderDesignPdf } from '@/server/designs/pdf';
import QRCode from 'qrcode';
it('exports recto and verso at exact printable size with embedded fonts and QR', async () => {
  const document = newThankYou('Léa & Noé', randomUUID);
  document.sides[1].elements = [
    designElementSchema.parse({
      id: randomUUID(),
      type: 'qr',
      x: 20,
      y: 20,
      width: 50,
      height: 40,
      qr: 'audio',
    }),
  ];
  const bytes = await renderDesignPdf(document, {
    audio: await QRCode.toBuffer('https://example.invalid/audio'),
  });
  const pdf = await PDFDocument.load(bytes);
  expect(pdf.getPageCount()).toBe(2);
  expect(pdf.getTitle()).toBe('Merci — Léa & Noé');
  expect(pdf.getPage(0).getWidth()).toBeCloseTo((105 * 72) / 25.4, 4);
  expect(pdf.getPage(1).getHeight()).toBeCloseTo((148 * 72) / 25.4, 4);
});
it('refuses incomplete image blocks rather than silently losing a design element', async () => {
  const document = newThankYou('Merci', randomUUID);
  document.sides[0].elements.push(
    designElementSchema.parse({
      id: randomUUID(),
      type: 'image',
      x: 0,
      y: 0,
      width: 30,
      height: 30,
    }),
  );
  await expect(renderDesignPdf(document, {})).rejects.toThrow(
    'Choisissez une image',
  );
});
