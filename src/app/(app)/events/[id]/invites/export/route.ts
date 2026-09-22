import { eventScope } from '@/server/experience/service';
function cell(value: unknown) {
  let text = Array.isArray(value) ? value.join(', ') : String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { context, repository } = await eventScope(id);
    const [record, rows] = await Promise.all([
      repository.get(id, context.tenantId),
      repository.responses(id, context.tenantId),
    ]);
    const fields = record?.published?.fields ?? record?.draft.fields ?? [];
    const csv = [
      [
        'Nom',
        'E-mail',
        'Présence',
        'Accompagnants',
        ...fields.map((f) => f.label),
        'Date',
      ],
      ...rows.map((row) => [
        row.name,
        row.email,
        row.presence === 'yes' ? 'Présent' : 'Absent',
        row.companions ?? 0,
        ...fields.map((f) => row.answers[f.id] ?? ''),
        row.createdAt,
      ]),
    ]
      .map((row) => row.map(cell).join(';'))
      .join('\r\n');
    return new Response('\uFEFF' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="reponses.csv"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return new Response('Accès refusé', { status: 403 });
  }
}
