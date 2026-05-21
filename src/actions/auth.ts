"use server";

import {
  getAccountMe,
  postLogin,
  postLogout,
  postRegister,
  verifyEmailToken,
} from "@/apis/auth";
import type {
  GetAccountMeResult,
  LoginCredentials,
  PostLoginResult,
  PostLogoutResult,
  RegisterBusinessInput,
  PostRegisterResult,
  VerifyEmailResult,
} from "@/types/auth";

/** Registration — use from signup page / client forms. */
export async function registerBusinessAction(
  business: RegisterBusinessInput,
): Promise<PostRegisterResult> {
  return postRegister(business);
}

/** Sign in — use from sign-in page / client forms. */
export async function loginAction(
  credentials: LoginCredentials,
): Promise<PostLoginResult> {
  return postLogin(credentials);
}

/** Load the current account/business profile with the login token. */
export async function getAccountMeAction(
  accessToken: string,
): Promise<GetAccountMeResult> {
  return getAccountMe(accessToken);
}

/** Sign out — invalidates the refresh token with the backend. */
export async function logoutAction(
  refreshToken: string,
): Promise<PostLogoutResult> {
  return postLogout(refreshToken);
}

/** Verify email address from an emailed token. */
export async function verifyEmailAction(
  token: string,
): Promise<VerifyEmailResult> {
  return verifyEmailToken(token);
}
