export interface TokenHasher {
  hashToken(token: string): string;
}
