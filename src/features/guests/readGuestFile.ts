import { parseCsv } from '@/core/guests/models';
export async function readGuestFile(file: File): Promise<string[][]> {
  if (file.size > 2000000) throw new Error('Le fichier dépasse 2 Mo.');
  if (file.name.toLowerCase().endsWith('.csv'))
    return parseCsv(await file.text());
  if (!file.name.toLowerCase().endsWith('.xlsx'))
    throw new Error('Utilisez un fichier CSV ou Excel .xlsx.');
  const { readSheet } = await import('read-excel-file/browser');
  const data = await readSheet(file);
  if (data.length > 5001 || data.some((row) => row.length > 50))
    throw new Error('Limite : 5 000 invités et 50 colonnes.');
  const rows = data
    .map((row) =>
      row.map((value) =>
        value instanceof Date ? value.toISOString() : String(value ?? ''),
      ),
    )
    .filter((row) => row.some((value) => value.trim()));
  if (
    rows.some((row) => row.some((value) => value.length > 10000)) ||
    JSON.stringify(rows).length > 2000000
  )
    throw new Error('Le classeur contient trop de données.');
  return rows;
}
