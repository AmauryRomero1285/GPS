import { apiRequest } from '@/api/client';
import type { ApiSuccess } from '@/types/api';
import type {
  LoginInput,
  LoginResult,
  RegisterInput,
  RegisterResult,
  ResendVerificationResult,
  UserProfile,
  VerifyEmailResult,
} from '@/types/auth';

// Un método por endpoint del backend (backend/src/routes/auth.routes.js), sin
// lógica de negocio -- eso vive en AuthFacade.
export const AuthRepository = {
  register(input: RegisterInput) {
    return apiRequest<ApiSuccess<RegisterResult>>('/auth/register', {
      method: 'POST',
      body: input,
      auth: false,
    });
  },

  login(input: LoginInput) {
    return apiRequest<ApiSuccess<LoginResult>>('/auth/login', {
      method: 'POST',
      body: input,
      auth: false,
    });
  },

  refresh(refreshToken: string) {
    return apiRequest<ApiSuccess<{ accessToken: string }>>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    });
  },

  resendVerification(email: string) {
    return apiRequest<ApiSuccess<ResendVerificationResult>>('/auth/resend-verification', {
      method: 'POST',
      body: { email },
      auth: false,
    });
  },

  verifyEmail(token: string) {
    return apiRequest<ApiSuccess<VerifyEmailResult>>(`/auth/verify/${token}`, {
      method: 'GET',
      auth: false,
    });
  },

  me() {
    return apiRequest<ApiSuccess<UserProfile>>('/auth/me', { method: 'GET' });
  },
};
