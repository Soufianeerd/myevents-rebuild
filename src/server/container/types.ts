import type {
  Clock,
  IdGenerator,
  UserRepository,
  SessionRepository,
  PasswordResetRepository,
  PasswordHasher,
  MailProvider,
  TokenHasher,
  SecretTokenProvider,
  AppUrlProvider,
} from '../../providers/contracts';
import type { WorkspaceRepository } from '../../providers/contracts/WorkspaceRepository';
import type { EventRepository } from '../../providers/contracts/EventRepository';

export interface AppContainer {
  clock: Clock;
  idGenerator: IdGenerator;
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  passwordResetRepository: PasswordResetRepository;
  workspaceRepository: WorkspaceRepository;
  eventRepository: EventRepository;
  passwordHasher: PasswordHasher;
  mailProvider: MailProvider;
  tokenHasher: TokenHasher;
  secretTokenProvider: SecretTokenProvider;
  appUrlProvider: AppUrlProvider;
}
