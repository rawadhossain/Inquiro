import { ResetPasswordEmail } from './reset-password';
import { EmailVerificationEmail } from './email-verification';

/**
 * Email template utilities using TypeScript components
 */
export class EmailTemplates {
  /**
   * Get reset password email HTML
   */
  static getResetPasswordEmail(resetUrl: string): string {
    return ResetPasswordEmail({ resetUrl });
  }

  /**
   * Get email verification email HTML
   */
  static getEmailVerificationEmail(verificationUrl: string, userName: string = 'there'): string {
    return EmailVerificationEmail({ verificationUrl, userName });
  }
}

// Export individual functions for convenience
export const getResetPasswordEmail = (resetUrl: string) => 
  EmailTemplates.getResetPasswordEmail(resetUrl);

export const getEmailVerificationEmail = (verificationUrl: string, userName?: string) => 
  EmailTemplates.getEmailVerificationEmail(verificationUrl, userName); 