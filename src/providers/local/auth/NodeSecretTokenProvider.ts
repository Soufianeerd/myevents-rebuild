import * as crypto from 'node:crypto';
import { SecretTokenProvider } from '../../contracts/auth/SecretTokenProvider';

export class NodeSecretTokenProvider implements SecretTokenProvider {
  generateToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }
}
