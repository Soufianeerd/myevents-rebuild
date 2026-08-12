import type {
  Clock,
  IdGenerator,
  UserRepository,
  SessionRepository,
  PasswordResetRepository,
  PasswordHasher,
  MailProvider,
} from '../../providers/contracts';

export interface AppContainer {
  clock: Clock;
  idGenerator: IdGenerator;
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  passwordResetRepository: PasswordResetRepository;
  passwordHasher: PasswordHasher;
  mailProvider: MailProvider;
}
