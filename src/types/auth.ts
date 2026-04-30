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
};

export type PostLoginResult =
  | { ok: true; data: LoginSuccessData }
  | { ok: false; errorMessage: string; errorCode?: string };

export type LoginApiEnvelope = {
  success: boolean;
  data: unknown;
  error: { code?: string; message?: string } | null;
};
