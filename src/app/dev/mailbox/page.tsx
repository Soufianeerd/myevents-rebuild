import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { notFound } from 'next/navigation';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function DevMailboxPage() {
  if (env.APP_MODE !== 'local') {
    notFound();
  }

  const dataDir = process.env.LOCAL_DATA_DIR || '.data';
  const mailDir = path.resolve(process.cwd(), dataDir, 'mail');

  let files: string[] = [];
  try {
    files = await fs.readdir(mailDir);
    files.sort((a, b) => b.localeCompare(a)); // Newest first
  } catch {
    // Directory might not exist yet
  }

  const mails = await Promise.all(
    files.map(async (filename) => {
      const content = await fs.readFile(path.join(mailDir, filename), 'utf-8');
      return { filename, content };
    }),
  );

  return (
    <div className="p-8 font-mono text-sm max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">LOCAL MAILBOX</h1>

      {mails.length === 0 ? (
        <p className="text-neutral-500">Aucun e-mail n&apos;a été envoyé.</p>
      ) : (
        <div className="space-y-8">
          {mails.map((mail) => (
            <div
              key={mail.filename}
              className="border border-neutral-200 rounded-md p-4 bg-white shadow-sm"
            >
              <h2 className="font-bold border-b border-neutral-200 pb-2 mb-2 text-primary">
                {mail.filename}
              </h2>
              <pre className="whitespace-pre-wrap">{mail.content}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
