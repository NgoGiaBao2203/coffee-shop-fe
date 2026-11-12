import type { ApiResponse } from '@/types/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserProfile {
  profileId: string;
  email: string;
  username: string;
  fullName: string | null;
  phoneNumber: string | null;
  // Null for OWNER or a user not assigned to a shop
  shopName: string | null;
  // Vietnamese role label: CHỦ QUÁN / QUẢN LÝ / NHÂN VIÊN (see ROLES)
  roleName: string;
  createdAt: string | null;
  updatedAt: string | null;
  isDeleted: boolean;
}

export interface GetProfileResponse extends ApiResponse {
  userProfile: UserProfile;
}
