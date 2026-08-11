import { env } from '../../lib/env';
import { SystemClock } from '../../providers/local/clock/SystemClock';
import { CryptoIdGenerator } from '../../providers/local/ids/CryptoIdGenerator';
import type { AppContainer } from './types';

let containerInstance: AppContainer | null = null;

export const createContainer = (): AppContainer => {
  if (containerInstance) {
    return containerInstance;
  }

  // We only support 'local' for now, as specified in the rules
  if (env.APP_MODE !== 'local') {
    throw new Error(
      `Unsupported APP_MODE: ${env.APP_MODE}. Only 'local' is supported in this session.`,
    );
  }

  const clock = new SystemClock();
  const idGenerator = new CryptoIdGenerator();

  containerInstance = {
    clock,
    idGenerator,
  };

  return containerInstance;
};

// Only for tests
export const __resetContainer = (): void => {
  containerInstance = null;
};
