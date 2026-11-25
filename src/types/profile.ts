import type { ApiResponse } from './api';

// PUT /profile/change-password — the account is the one in the X-USER-ID header
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type ChangePasswordResponse = ApiResponse;
