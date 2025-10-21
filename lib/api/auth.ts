import { apiFetch } from '@/lib/api-client';
import type { SafeUser } from '@/types';

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  remember?: boolean;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type UpdateProfilePayload = {
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  timezone?: string | null;
};

export const authApi = {
  me: () => apiFetch<{ user: SafeUser | null }>('/api/auth/me'),
  register: (payload: RegisterPayload) =>
    apiFetch<{ user: SafeUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  login: (payload: LoginPayload) =>
    apiFetch<{ user: SafeUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  logout: () =>
    apiFetch<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  requestReset: (email: string) =>
    apiFetch<{ success: boolean; resetToken?: string; resetUrl?: string }>(
      '/api/auth/request-reset',
      {
        method: 'POST',
        body: JSON.stringify({ email })
      }
    ),
  resetPassword: (payload: ResetPasswordPayload) =>
    apiFetch<{ success: boolean }>('/api/auth/reset', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateProfile: (payload: UpdateProfilePayload) =>
    apiFetch<{ user: SafeUser }>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  changePassword: (payload: ChangePasswordPayload) =>
    apiFetch<{ success: boolean }>('/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
};
