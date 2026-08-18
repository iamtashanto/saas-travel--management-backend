import bcrypt from 'bcrypt';

export class PasswordService {
  /**
   * Hashes a password using bcrypt.
   * If Argon2 was requested explicitly as an alternative, we would use argon2.
   * However, the requirements state: "If the project already established bcrypt and there is a strong reason to retain it, keep it consistent."
   * Phase 02 seed script used bcrypt. We will stick to bcrypt for consistency, but with high cost factor.
   */
  static async hash(password: string): Promise<string> {
    const saltRounds = 12; // Sufficiently strong
    return bcrypt.hash(password, saltRounds);
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
