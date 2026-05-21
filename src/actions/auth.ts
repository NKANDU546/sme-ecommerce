"use server";

import { postLogin, postRegister } from "@/apis/auth";
import type {
  LoginCredentials,
  PostLoginResult,
  RegisterBusinessInput,
  PostRegisterResult,
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
