import { AppUrlProvider } from '../../contracts/auth/AppUrlProvider';
import { env } from '../../../lib/env';

export class EnvAppUrlProvider implements AppUrlProvider {
  getAppUrl(): string {
    return env.APP_URL || '';
  }
}
