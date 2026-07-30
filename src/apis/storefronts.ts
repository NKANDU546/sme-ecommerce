import { getSmeApiBaseUrl } from "@/apis/config";
import { networkFailure, parseApiEnvelope } from "@/apis/api-result";
import type {
  PublishHistoryItem,
  PublishHistoryResult,
  PublishResult,
  PublishResultResponse,
  PublishStorefrontBody,
  PublishedStorefront,
  PublishedStorefrontResult,
  ResetStorefrontDraftBody,
  StorefrontDraft,
  StorefrontDraftResult,
  UnpublishResult,
  UnpublishResultResponse,
  UpdateStorefrontDraftBody,
} from "@/types/workspace";

function asDraft(raw: StorefrontDraft): StorefrontDraft {
  return {
    workspaceId: String(raw.workspaceId),
    storefrontId: String(raw.storefrontId),
    templateId: String(raw.templateId ?? "classic-boutique"),
    templateVersion: Number(raw.templateVersion ?? 1),
    configVersion: Number(raw.configVersion ?? 1),
    config:
      raw.config && typeof raw.config === "object"
        ? (raw.config as Record<string, unknown>)
        : {},
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

function asPublishResult(raw: PublishResult): PublishResult {
  return {
    workspaceId: String(raw.workspaceId),
    storefrontId: String(raw.storefrontId),
    publishedSnapshotId: String(raw.publishedSnapshotId),
    status: raw.status,
    publishedAt: String(raw.publishedAt ?? ""),
  };
}

function asPublishedStorefront(raw: PublishedStorefront): PublishedStorefront {
  return {
    workspaceId: String(raw.workspaceId),
    storefrontId: String(raw.storefrontId),
    publishedSnapshotId: String(raw.publishedSnapshotId),
    templateId: String(raw.templateId ?? "classic-boutique"),
    templateVersion: Number(raw.templateVersion ?? 1),
    configVersion: Number(raw.configVersion ?? 1),
    config:
      raw.config && typeof raw.config === "object"
        ? (raw.config as Record<string, unknown>)
        : {},
    status: raw.status,
    publicSlug: raw.publicSlug == null ? null : String(raw.publicSlug),
    publishedAt: String(raw.publishedAt ?? ""),
    notes: raw.notes == null ? null : String(raw.notes),
  };
}

function asHistoryItem(raw: PublishHistoryItem): PublishHistoryItem {
  return {
    snapshotId: String(raw.snapshotId),
    templateId: String(raw.templateId ?? "classic-boutique"),
    templateVersion: Number(raw.templateVersion ?? 1),
    configVersion: Number(raw.configVersion ?? 1),
    publishedByUserId: String(raw.publishedByUserId ?? ""),
    publishedAt: String(raw.publishedAt ?? ""),
    notes: raw.notes == null ? null : String(raw.notes),
  };
}

function asUnpublishResult(raw: UnpublishResult): UnpublishResult {
  return {
    workspaceId: String(raw.workspaceId),
    status: raw.status,
    lastPublishedAt:
      raw.lastPublishedAt == null ? null : String(raw.lastPublishedAt),
  };
}

/** GET /workspaces/{workspaceId}/storefront/draft — auto-creates classic-boutique if missing. */
export async function getStorefrontDraft(
  workspaceId: string,
  accessToken: string,
): Promise<StorefrontDraftResult> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/storefront/draft`;
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
      "Could not load the storefront draft. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<StorefrontDraft>(
    res,
    "Storefront draft could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asDraft(parsed.data) };
}

/** PUT /workspaces/{workspaceId}/storefront/draft — replaces the full draft config. */
export async function updateStorefrontDraft(
  workspaceId: string,
  accessToken: string,
  body: UpdateStorefrontDraftBody,
): Promise<StorefrontDraftResult> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/storefront/draft`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not save the storefront draft. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<StorefrontDraft>(
    res,
    "Storefront draft could not be saved.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asDraft(parsed.data) };
}

/** POST /workspaces/{workspaceId}/storefront/draft/reset */
export async function resetStorefrontDraft(
  workspaceId: string,
  accessToken: string,
  body: ResetStorefrontDraftBody,
): Promise<StorefrontDraftResult> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/storefront/draft/reset`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not reset the storefront draft. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<StorefrontDraft>(
    res,
    "Storefront draft could not be reset.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asDraft(parsed.data) };
}

/** POST /workspaces/{workspaceId}/storefront/publish */
export async function publishStorefront(
  workspaceId: string,
  accessToken: string,
  body: PublishStorefrontBody,
): Promise<PublishResultResponse> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/storefront/publish`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not publish the storefront. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<PublishResult>(
    res,
    "Storefront could not be published.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asPublishResult(parsed.data) };
}

/** GET /workspaces/{workspaceId}/storefront/published */
export async function getPublishedStorefront(
  workspaceId: string,
  accessToken: string,
): Promise<PublishedStorefrontResult> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/storefront/published`;
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
      "Could not load the published storefront. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<PublishedStorefront>(
    res,
    "Published storefront could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asPublishedStorefront(parsed.data) };
}

/** GET /workspaces/{workspaceId}/storefront/publish-history */
export async function getPublishHistory(
  workspaceId: string,
  accessToken: string,
): Promise<PublishHistoryResult> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/storefront/publish-history`;
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
      "Could not load publish history. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<PublishHistoryItem[]>(
    res,
    "Publish history could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: parsed.data.map(asHistoryItem) };
}

/** GET /workspaces/{workspaceId}/storefront/publish-history/{snapshotId} */
export async function getPublishSnapshot(
  workspaceId: string,
  snapshotId: string,
  accessToken: string,
): Promise<PublishedStorefrontResult> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/storefront/publish-history/${encodeURIComponent(snapshotId)}`;
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
      "Could not load that publish snapshot. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<PublishedStorefront>(
    res,
    "Publish snapshot could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asPublishedStorefront(parsed.data) };
}

/** POST /workspaces/{workspaceId}/storefront/unpublish */
export async function unpublishStorefront(
  workspaceId: string,
  accessToken: string,
): Promise<UnpublishResultResponse> {
  const url = `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/storefront/unpublish`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not unpublish the storefront. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<UnpublishResult>(
    res,
    "Storefront could not be unpublished.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asUnpublishResult(parsed.data) };
}
