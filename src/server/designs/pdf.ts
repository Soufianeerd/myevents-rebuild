import PDFDocument from 'pdfkit';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import type { Design } from '@/core/designs/models';

const fontFiles = {
  serif: 'cormorant-garamond-latin-400-normal.ttf',
  'sans-serif': 'inter-latin-400-normal.ttf',
  cursive: 'great-vibes-latin-400-normal.ttf',
} as const;

/** Assets are resolved by the authorized service, never by arbitrary client URLs. */
export async function renderDesignPdf(
  document: Design,
  assets: Record<string, Uint8Array>,
) {
  const fonts: Record<string, Buffer> = Object.fromEntries(
    await Promise.all(
      Object.entries(fontFiles).map(async ([key, file]) => [
        key,
        await readFile(join(process.cwd(), 'public/fonts', file)),
      ]),
    ),
  );
  const width = (document.widthMm * 72) / 25.4;
  const height = (document.heightMm * 72) / 25.4;
  const pdf = new PDFDocument({
    autoFirstPage: false,
    font: join(process.cwd(), 'public/fonts', fontFiles.serif),
    margin: 0,
    info: { Title: document.name, Creator: 'MyEvents' },
  });
  const chunks: Buffer[] = [];
  const result = new Promise<Uint8Array>((resolve, reject) => {
    pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdf.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
    pdf.on('error', reject);
  });
  for (const [name, bytes] of Object.entries(fonts))
    pdf.registerFont(name, bytes);
  const prepared = new Map<string, Buffer>();
  for (const side of document.sides) {
    pdf.addPage({ size: [width, height], margin: 0 });
    pdf.rect(0, 0, width, height).fill(side.background);
    for (const element of side.elements) {
      const x = (element.x * width) / 100,
        y = (element.y * height) / 100;
      const w = (element.width * width) / 100,
        h = (element.height * height) / 100;
      pdf.save().rect(x, y, w, h).clip();
      if (element.type === 'text') {
        const size = (element.fontSize * width) / 500;
        pdf.font(element.font).fontSize(size).fillColor(element.color);
        const lineGap = Math.max(0, size * 1.35 - pdf.currentLineHeight());
        const options = { width: w, align: element.align, lineGap };
        const textHeight = pdf.heightOfString(element.text, options);
        pdf.text(element.text, x, y + Math.max(0, (h - textHeight) / 2), {
          ...options,
          height: h,
          ellipsis: false,
        });
      } else if (element.type === 'shape') {
        if (element.shape === 'ellipse')
          pdf
            .ellipse(x + w / 2, y + h / 2, w / 2, h / 2)
            .fill(element.background);
        else pdf.rect(x, y, w, h).fill(element.background);
      } else {
        const key = element.type === 'qr' ? element.qr : element.image;
        if (!key || !assets[key])
          throw new Error(
            'Choisissez une image pour chaque élément avant de télécharger le PDF.',
          );
        if (!prepared.has(key))
          prepared.set(
            key,
            await sharp(assets[key], { limitInputPixels: 40000000 })
              .rotate()
              .resize({
                width: 4000,
                height: 4000,
                fit: 'inside',
                withoutEnlargement: true,
              })
              .png()
              .toBuffer(),
          );
        pdf.image(prepared.get(key)!, x, y, {
          [element.type === 'qr' ? 'fit' : 'cover']: [w, h],
          align: 'center',
          valign: 'center',
        });
      }
      pdf.restore();
    }
  }
  pdf.end();
  return result;
}
