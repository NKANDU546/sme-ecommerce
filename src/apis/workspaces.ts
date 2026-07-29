import { getSmeApiBaseUrl } from "@/apis/config";
import { networkFailure, parseApiEnvelope } from "@/apis/api-result";
import type {
  Workspace,
  WorkspaceResult,
  WorkspacesListResult,
} from "@/types/workspace";

function asWorkspace(raw: Workspace): Workspace {
  return {
    id: String(raw.id),
    businessId: String(raw.businessId),
    name: String(raw.name ?? ""),
    publicSlug: raw.publicSlug == null ? null : String(raw.publicSlug),
    status: raw.status,
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

/** GET /workspaces — list (and auto-create) workspaces for the logged-in merchant. */
export async function listWorkspaces(
  accessToken: string,
): Promise<WorkspacesListResult> {
  const url = `${getSmeApiBaseUrl()}/workspaces`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load workspaces. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<Workspace[]>(
    res,
    "Workspaces could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data.map(asWorkspace) };
}

/** GET /workspaces/{workspaceId} */
export async function getWorkspace(
  workspaceId: string,
  accessToken: string,
): Promise<WorkspaceResult> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load this workspace. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<Workspace>(
    res,
    "Workspace could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asWorkspace(parsed.data) };
}
