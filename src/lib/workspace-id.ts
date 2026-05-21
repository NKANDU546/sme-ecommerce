/** URL-safe unique id for a merchant workspace (no backend yet). */
export function createWorkspaceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export const SME_WORKSPACE_STORAGE_KEY = "sme_workspace";

export type StoredWorkspace = {
  workspaceId: string;
  name: string;
  email: string;
  createdAt: number;
  userId?: string;
  businessName?: string;
  publicLink?: string;
};
