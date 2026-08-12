export interface PasswordHashInfo {
  hash: string;
  salt: string;
  algorithm: string;
  params: {
    N: number;
    r: number;
    p: number;
  };
}

export interface PasswordHasher {
  hash(password: string): Promise<PasswordHashInfo>;
  verify(password: string, stored: PasswordHashInfo): Promise<boolean>;
}
