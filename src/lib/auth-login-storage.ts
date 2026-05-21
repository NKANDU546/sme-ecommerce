import {
  SME_WORKSPACE_STORAGE_KEY,
  type StoredWorkspace,
} from "@/lib/workspace-id";
import type { LoginSuccessData } from "@/types/auth";

export const SME_AUTH_SESSION_KEY = "sme_auth_session";

type StoredAuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

export function getStoredAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SME_AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthSession;
    return parsed.accessToken ? parsed : null;
  } catch {
    return null;
  }
}

export function clearStoredAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SME_AUTH_SESSION_KEY);
    localStorage.removeItem(SME_WORKSPACE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Persist tokens and workspace id after a successful login (client-only). */
export function persistLoginSuccess(email: string, data: LoginSuccessData): void {
  if (typeof window === "undefined") return;

  if (data.accessToken) {
    try {
      const session: StoredAuthSession = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      };
      localStorage.setItem(SME_AUTH_SESSION_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
  }

  if (!data.businessId) return;

  let prev: StoredWorkspace | null = null;
  try {
    const raw = localStorage.getItem(SME_WORKSPACE_STORAGE_KEY);
    if (raw) prev = JSON.parse(raw) as StoredWorkspace;
  } catch {
    /* ignore */
  }

  const matched =
    prev &&
    (prev.workspaceId === data.businessId ||
      prev.email.toLowerCase() === email.toLowerCase())
      ? prev
      : null;

  const payload: StoredWorkspace = {
    workspaceId: data.businessId,
    email,
    name: data.fullName ?? (matched ? matched.name : "Merchant"),
    createdAt: matched ? matched.createdAt : Date.now(),
    userId: data.userId ?? matched?.userId,
    businessName: data.businessName ?? matched?.businessName,
    publicLink: data.publicLink ?? matched?.publicLink,
  };

  try {
    localStorage.setItem(SME_WORKSPACE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}
