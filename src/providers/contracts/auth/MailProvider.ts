export interface MailProvider {
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
}
