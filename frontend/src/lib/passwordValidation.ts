export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  isPasswordValid: boolean;
  matches: boolean;
  isValid: boolean;
}

export function validatePassword(password: string, confirmPassword?: string): PasswordValidationResult {
  const p = password || '';
  const cp = confirmPassword || '';

  const hasMinLength = p.length > 8;
  const hasUppercase = /[A-Z]/.test(p);
  const hasNumber = /[0-9]/.test(p);
  const hasSymbol = /[^A-Za-z0-9]/.test(p);

  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSymbol;
  const matches = confirmPassword !== undefined ? p === cp && cp.length > 0 : true;

  return {
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSymbol,
    isPasswordValid,
    matches,
    isValid: isPasswordValid && matches,
  };
}
