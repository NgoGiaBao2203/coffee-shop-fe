export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  username: string;
  token: string;
}

export interface UserProfile {
  createdAt: string;
  email: string;
  fullName: string;
  isDeleted: boolean;
  phoneNumber: string;
  profileId: string;
  roleName: string;
  shopName: string | null;
  updatedAt: string | null;
  username: string;
}

export interface GetProfileResponse {
  code: string;
  message: string;
  traceId: string;
  userProfile: UserProfile;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  errorDetails: ValidationErrorDetail[] | null;
  traceId: string;
}
