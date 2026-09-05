import * as path from 'node:path';
import { env } from '../../lib/env';
import { SystemClock } from '../../providers/local/clock/SystemClock';
import { CryptoIdGenerator } from '../../providers/local/ids/CryptoIdGenerator';
import {
  ScryptPasswordHasher,
  LocalUserRepository,
  LocalSessionRepository,
  LocalPasswordResetRepository,
  LocalMailProvider,
  NodeTokenHasher,
  NodeSecretTokenProvider,
  EnvAppUrlProvider,
  LocalWorkspaceRepository,
  LocalEventRepository,
} from '../../providers/local';
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

  const dataDir = path.resolve(
    process.cwd(),
    process.env.LOCAL_DATA_DIR || '.data',
  );

  const clock = new SystemClock();
  const idGenerator = new CryptoIdGenerator();
  const passwordHasher = new ScryptPasswordHasher();

  const userRepository = new LocalUserRepository(dataDir);
  const sessionRepository = new LocalSessionRepository(dataDir);
  const passwordResetRepository = new LocalPasswordResetRepository(dataDir);
  const workspaceRepository = new LocalWorkspaceRepository(dataDir);
  const eventRepository = new LocalEventRepository(dataDir);

  const mailProvider = new LocalMailProvider(dataDir, clock);
  const tokenHasher = new NodeTokenHasher();
  const secretTokenProvider = new NodeSecretTokenProvider();
  const appUrlProvider = new EnvAppUrlProvider();

  containerInstance = {
    clock,
    idGenerator,
    userRepository,
    sessionRepository,
    passwordResetRepository,
    workspaceRepository,
    eventRepository,
    passwordHasher,
    mailProvider,
    tokenHasher,
    secretTokenProvider,
    appUrlProvider,
  };

  return containerInstance;
};

// Only for tests
export const __resetContainer = (): void => {
  containerInstance = null;
};
