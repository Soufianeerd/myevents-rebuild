import {
  UserRepository,
  SessionRepository,
} from '../../../providers/contracts/auth/AuthRepositories';
import { PasswordHasher } from '../../../providers/contracts/auth/PasswordHasher';
import { TokenHasher } from '../../../providers/contracts/auth/TokenHasher';
import { SecretTokenProvider } from '../../../providers/contracts/auth/SecretTokenProvider';
import { IdGenerator } from '../../../providers/contracts/IdGenerator';
import { Clock } from '../../../providers/contracts/Clock';
import { Session, SafeUser } from '../models';
import { normalizeEmail } from '../utils/normalizeEmail';
import { Result, ok, err } from '../../result';
import { AppError, createAppError } from '../../errors';
import { SessionId } from '../models';

export interface LoginUserCommand {
  email: string;
  password: string;
}

export interface LoginUserResult {
  user: SafeUser;
  session: Session;
  rawSessionToken: string;
}

export class LoginUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private passwordHasher: PasswordHasher,
    private tokenHasher: TokenHasher,
    private secretTokenProvider: SecretTokenProvider,
    private idGenerator: IdGenerator,
    private clock: Clock,
  ) {}

  async execute(
    command: LoginUserCommand,
  ): Promise<Result<LoginUserResult, AppError>> {
    const genericAuthError = createAppError(
      'UNAUTHORIZED',
      'Adresse e-mail ou mot de passe incorrect.',
      401,
    );

    const emailResult = normalizeEmail(command.email);
    if (!emailResult.ok) return err(genericAuthError);

    // 1. Find user
    const user = await this.userRepository.findByEmail(emailResult.value);

    // 2. Timing enumeration protection and password verification
    let isPasswordValid = false;

    if (!user) {
      // Dummy hash verify to prevent timing enumeration attacks.
      // We pass the provided password and a dummy hash info matching our scrypt profile.
      await this.passwordHasher.verify(command.password, {
        hash: 'dummy_hash',
        salt: 'dummy_salt',
        algorithm: 'scrypt',
        params: { N: 65536, r: 8, p: 2 },
      });
      return err(genericAuthError);
    } else {
      isPasswordValid = await this.passwordHasher.verify(command.password, {
        hash: user.passwordHash,
        salt: user.passwordSalt,
        algorithm: user.passwordAlgorithm,
        params: user.passwordParams,
      });
    }

    if (!isPasswordValid) {
      return err(genericAuthError);
    }

    // 3. Create Session
    const rawSessionToken = this.secretTokenProvider.generateToken();
    const tokenHash = this.tokenHasher.hashToken(rawSessionToken);

    // 30 days expiration
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(
      this.clock.now().getTime() + thirtyDaysMs,
    ).toISOString();

    const session: Session = {
      id: this.idGenerator.generate() as SessionId,
      userId: user.id,
      tokenHash,
      createdAt: this.clock.now().toISOString(),
      expiresAt,
    };

    const sessionResult = await this.sessionRepository.create(session);
    if (!sessionResult.ok) return err(sessionResult.error);

    const safeUser: SafeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
    };

    return ok({ user: safeUser, session, rawSessionToken });
  }
}
