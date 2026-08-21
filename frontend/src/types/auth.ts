// Formas que ya retorna el backend (ver backend/src/services/auth.service.js).
// UserProfile: snake_case, viene de /auth/me y de /auth/register.
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  lastname: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

// SessionUser: camelCase, subconjunto que retorna /auth/login.
export interface SessionUser {
  id: string;
  email: string;
  username: string;
  name: string;
  lastname: string;
  isVerified: boolean;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  name: string;
  lastname: string;
}

export interface RegisterResult {
  user: UserProfile;
  // Solo presente cuando el backend corre con NODE_ENV != production.
  verificationToken?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

export interface ResendVerificationResult {
  verificationToken?: string;
}

export interface VerifyEmailResult {
  id: string;
  is_verified: boolean;
  is_active: boolean;
}
