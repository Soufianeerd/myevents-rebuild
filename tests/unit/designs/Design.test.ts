import { it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  newThankYou,
  designSchema,
  designElementSchema,
  validateDesignRights,
} from '@/core/designs/models';
import {
  quotePrint,
  testMaterials,
  printRequestSchema,
} from '@/core/designs/printing';
it('validates printable bounds and per-event QR/image rights', () => {
  const doc = newThankYou('Camille & Alex', randomUUID);
  expect(doc.sides.map((s) => s.name)).toEqual(['recto', 'verso']);
  expect(() =>
    designElementSchema.parse({
      id: randomUUID(),
      type: 'text',
      x: 90,
      y: 10,
      width: 30,
      height: 20,
    }),
  ).toThrow();
  doc.sides[1].elements.push(
    designElementSchema.parse({
      id: randomUUID(),
      type: 'qr',
      x: 10,
      y: 10,
      width: 30,
      height: 30,
      qr: 'audio',
    }),
  );
  expect(() => validateDesignRights(doc, [], [])).toThrow();
  expect(() => validateDesignRights(doc, ['audio'], [])).not.toThrow();
  doc.sides[1].elements.push(
    designElementSchema.parse({
      id: randomUUID(),
      type: 'image',
      x: 10,
      y: 10,
      width: 30,
      height: 30,
      image: randomUUID(),
    }),
  );
  expect(() => validateDesignRights(doc, ['audio'], [])).toThrow();
  expect(() =>
    designSchema.parse({ ...doc, sides: [doc.sides[0], doc.sides[0]] }),
  ).toThrow();
});
it('prices exact quantities plus shipping and rejects unsupported formats, finishes and unapproved proofs', () => {
  const doc = newThankYou('Merci', randomUUID);
  const request = printRequestSchema.parse({
    materialId: 'carton',
    quantity: 50,
    finish: 'mat',
    approved: true,
    address: {
      name: 'Camille Test',
      line1: '1 rue de Test',
      postalCode: '75001',
      city: 'Paris',
      country: 'FR',
    },
  });
  expect(quotePrint(doc, testMaterials[1], request)).toEqual({
    subtotal: 6000,
    delivery: 690,
    total: 6690,
  });
  expect(() =>
    quotePrint({ ...doc, widthMm: 999 }, testMaterials[1], request),
  ).toThrow();
  expect(() =>
    quotePrint(doc, testMaterials[1], { ...request, quantity: 1001 }),
  ).toThrow();
  expect(() =>
    printRequestSchema.parse({ ...request, approved: false }),
  ).toThrow();
});
