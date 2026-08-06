/** URL-safe unique id helper (prefer backend workspace ids from GET /workspaces). */
export function createWorkspaceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export const SME_WORKSPACE_STORAGE_KEY = "sme_workspace";

export type StoredWorkspace = {
  /** Backend workspace UUID from GET /workspaces (not the business id). */
  workspaceId: string;
  name: string;
  email: string;
  createdAt: number;
  userId?: string;
  businessId?: string;
  businessName?: string;
  publicLink?: string;
};

export function getStoredWorkspace(): StoredWorkspace | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SME_WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredWorkspace;
  } catch {
    return null;
  }
}
