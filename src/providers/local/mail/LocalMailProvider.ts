import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { MailProvider } from '../../contracts/auth/MailProvider';
import { Clock } from '../../contracts/Clock';

export class LocalMailProvider implements MailProvider {
  private mailDir: string;
  private clock: Clock;

  constructor(dataDir: string, clock: Clock) {
    this.mailDir = path.resolve(dataDir, 'mail');
    this.clock = clock;
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
  ): Promise<void> {
    const timestamp = Date.now();
    const safeEmail = email.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${timestamp}-${safeEmail}.txt`;
    const filePath = path.join(this.mailDir, filename);

    const content = `
========================================
MYEVENT'S LOCAL MAILBOX
========================================
To: ${email}
Date: ${this.clock.now().toISOString()}
Subject: Réinitialisation de votre mot de passe

Bonjour,

Si un compte correspond à cette adresse, vous avez demandé à réinitialiser votre mot de passe sur MyEvent's.

Veuillez cliquer sur le lien ci-dessous pour créer un nouveau mot de passe :
${resetLink}

Ce lien est valable 30 minutes.

À bientôt sur MyEvent's !
========================================
`;

    // Ensure directory exists
    try {
      await fs.mkdir(this.mailDir, { recursive: true });
    } catch {
      // Ignore
    }

    await fs.writeFile(filePath, content, 'utf-8');
  }
}
