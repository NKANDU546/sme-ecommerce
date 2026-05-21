export type RegisterBusinessInput = {
  email: string;
  password: string;
  fullName: string;
  businessName: string;
  description: string;
};

export type RegisterSuccessData = {
  userId: string;
  businessId: string;
  publicLink: string;
  message: string;
};

export type PostRegisterResult =
  | { ok: true; data: RegisterSuccessData }
  | { ok: false; errorMessage: string; errorCode?: string };

/** Wire shape for POST /auth/register JSON body. */
export type RegisterApiEnvelope = {
  success: boolean;
  data: RegisterSuccessData | null;
  error: { code?: string; message?: string } | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

/** Normalized login payload (backend may use camelCase or snake_case). */
export type LoginSuccessData = {
  userId?: string;
  businessId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  businessName?: string;
  publicLink?: string;
  fullName?: string;
};

export type PostLoginResult =
  | { ok: true; data: LoginSuccessData }
  | { ok: false; errorMessage: string; errorCode?: string };

export type LoginApiEnvelope = {
  success: boolean;
  data: unknown;
  error: { code?: string; message?: string } | null;
};

export type AccountProfileData = {
  userId: string;
  email: string;
  fullName: string;
  accountStatus: string;
  role: string;
  userCreatedAt: string;
  userUpdatedAt: string;
  businessId: string;
  businessName: string;
  businessDescription: string;
  slug: string;
  publicLink: string;
  businessUpdatedAt: string;
};

export type AccountMeApiEnvelope = {
  success: boolean;
  data: AccountProfileData | null;
  error: { code?: string; message?: string } | null;
};

export type GetAccountMeResult =
  | { ok: true; data: AccountProfileData }
  | { ok: false; errorMessage: string; errorCode?: string };

export type LogoutApiEnvelope = {
  success: boolean;
  data: string | null;
  error: { code?: string; message?: string } | null;
};

export type PostLogoutResult =
  | { ok: true; message: string }
  | { ok: false; errorMessage: string; errorCode?: string };

export type VerifyEmailApiEnvelope = {
  success: boolean;
  data: string | null;
  error: { code?: string; message?: string } | null;
};

export type VerifyEmailResult =
  | { ok: true; message: string }
  | { ok: false; errorMessage: string; errorCode?: string };
