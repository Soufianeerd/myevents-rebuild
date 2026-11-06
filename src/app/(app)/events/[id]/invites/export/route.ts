import { responsesCsv } from '@/core/guests/responses';
import { eventScope } from '@/server/experience/service';
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
    return new Response(
      responsesCsv(
        record?.published?.fields ?? record?.draft.fields ?? [],
        rows,
      ),
      {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="reponses.csv"',
          'Cache-Control': 'private, no-store',
        },
      },
    );
  } catch {
    return new Response('Accès refusé', { status: 403 });
  }
}
