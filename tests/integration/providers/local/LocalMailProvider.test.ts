import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalMailProvider } from '../../../../src/providers/local/mail/LocalMailProvider';
import * as fs from 'fs';
import * as path from 'path';

describe('LocalMailProvider', () => {
  const dataDir = path.join(
    process.cwd(),
    '.data-test-mail-' + Math.random().toString(36).slice(2),
  );
  let provider: LocalMailProvider;

  beforeEach(() => {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    provider = new LocalMailProvider(dataDir, { now: () => new Date() });
  });

  afterEach(() => {
    fs.rmSync(dataDir, { recursive: true, force: true });
  });

  it('should write an email to the store', async () => {
    await provider.sendPasswordResetEmail('test@example.com', 'http://reset');

    const mailDir = path.join(dataDir, 'mail');
    const files = fs.readdirSync(mailDir);
    expect(files.length).toBeGreaterThan(0);

    const content = fs.readFileSync(path.join(mailDir, files[0]), 'utf8');
    expect(content).toContain('test@example.com');
  });
});
