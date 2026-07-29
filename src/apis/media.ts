import { getSmeApiBaseUrl } from "@/apis/config";
import { networkFailure, parseApiEnvelope } from "@/apis/api-result";
import type {
  ConfirmMediaBody,
  CreateUploadUrlBody,
  ListMediaParams,
  MediaAsset,
  MediaAssetResult,
  MediaPage,
  MediaPageResult,
  MediaVoidResult,
  UploadUrlApiResult,
  UploadUrlResult,
} from "@/types/media";

function asMediaAsset(raw: MediaAsset): MediaAsset {
  return {
    id: String(raw.id),
    workspaceId: String(raw.workspaceId),
    url: String(raw.url ?? ""),
    storageKey: String(raw.storageKey ?? ""),
    originalFilename:
      raw.originalFilename == null ? null : String(raw.originalFilename),
    mimeType: String(raw.mimeType ?? ""),
    sizeBytes: Number(raw.sizeBytes ?? 0),
    width: raw.width == null ? null : Number(raw.width),
    height: raw.height == null ? null : Number(raw.height),
    status: String(raw.status ?? "pending"),
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

function asUploadUrl(raw: UploadUrlResult): UploadUrlResult {
  return {
    mediaId: String(raw.mediaId),
    uploadUrl: String(raw.uploadUrl ?? ""),
    storageKey: String(raw.storageKey ?? ""),
    expiresAt: String(raw.expiresAt ?? ""),
  };
}

function asPage(raw: MediaPage): MediaPage {
  return {
    items: Array.isArray(raw.items) ? raw.items.map(asMediaAsset) : [],
    page: Number(raw.page ?? 0),
    limit: Number(raw.limit ?? 20),
    totalItems: Number(raw.totalItems ?? 0),
    totalPages: Number(raw.totalPages ?? 0),
  };
}

function authHeaders(accessToken: string, json = false): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

function mediaBase(workspaceId: string): string {
  return `${getSmeApiBaseUrl()}/workspaces/${encodeURIComponent(workspaceId)}/media`;
}

/** POST /workspaces/{workspaceId}/media/upload-url */
export async function createMediaUploadUrl(
  workspaceId: string,
  accessToken: string,
  body: CreateUploadUrlBody,
): Promise<UploadUrlApiResult> {
  let res: Response;
  try {
    res = await fetch(`${mediaBase(workspaceId)}/upload-url`, {
      method: "POST",
      headers: authHeaders(accessToken, true),
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not start the upload. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<UploadUrlResult>(
    res,
    "Upload URL could not be created.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asUploadUrl(parsed.data) };
}

/** PUT file directly to the signed S3 URL (no auth header). */
export async function putFileToSignedUrl(
  uploadUrl: string,
  file: File,
  mimeType: string,
): Promise<{ ok: true } | { ok: false; errorMessage: string }> {
  let res: Response;
  try {
    res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": mimeType,
      },
      body: file,
    });
  } catch {
    return {
      ok: false,
      errorMessage:
        "Could not upload the file to storage. Check your connection and try again.",
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      errorMessage: `Storage upload failed (${res.status}).`,
    };
  }
  return { ok: true };
}

/** POST /workspaces/{workspaceId}/media/{mediaId}/confirm */
export async function confirmMediaUpload(
  workspaceId: string,
  mediaId: string,
  accessToken: string,
  body: ConfirmMediaBody = {},
): Promise<MediaAssetResult> {
  let res: Response;
  try {
    res = await fetch(
      `${mediaBase(workspaceId)}/${encodeURIComponent(mediaId)}/confirm`,
      {
        method: "POST",
        headers: authHeaders(accessToken, true),
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
  } catch {
    return networkFailure(
      "Could not confirm the upload. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<MediaAsset>(
    res,
    "Upload could not be confirmed.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asMediaAsset(parsed.data) };
}

/** GET /workspaces/{workspaceId}/media */
export async function listMedia(
  workspaceId: string,
  accessToken: string,
  params: ListMediaParams = {},
): Promise<MediaPageResult> {
  const qs = new URLSearchParams();
  if (params.type) qs.set("type", params.type);
  qs.set("page", String(params.page ?? 0));
  qs.set("limit", String(params.limit ?? 40));

  let res: Response;
  try {
    res = await fetch(`${mediaBase(workspaceId)}?${qs}`, {
      headers: authHeaders(accessToken),
      cache: "no-store",
    });
  } catch {
    return networkFailure(
      "Could not load the media library. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<MediaPage>(
    res,
    "Media library could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asPage(parsed.data) };
}

/** GET /workspaces/{workspaceId}/media/{mediaId} */
export async function getMedia(
  workspaceId: string,
  mediaId: string,
  accessToken: string,
): Promise<MediaAssetResult> {
  let res: Response;
  try {
    res = await fetch(
      `${mediaBase(workspaceId)}/${encodeURIComponent(mediaId)}`,
      {
        headers: authHeaders(accessToken),
        cache: "no-store",
      },
    );
  } catch {
    return networkFailure(
      "Could not load this media asset. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<MediaAsset>(
    res,
    "Media asset could not be loaded.",
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: asMediaAsset(parsed.data) };
}

/** DELETE /workspaces/{workspaceId}/media/{mediaId} */
export async function deleteMedia(
  workspaceId: string,
  mediaId: string,
  accessToken: string,
): Promise<MediaVoidResult> {
  let res: Response;
  try {
    res = await fetch(
      `${mediaBase(workspaceId)}/${encodeURIComponent(mediaId)}`,
      {
        method: "DELETE",
        headers: authHeaders(accessToken),
        cache: "no-store",
      },
    );
  } catch {
    return networkFailure(
      "Could not delete this media asset. Check your connection and try again.",
    );
  }

  const parsed = await parseApiEnvelope<null>(
    res,
    "Media asset could not be deleted.",
    { allowNullData: true },
  );
  if (!parsed.ok) return parsed;
  return { ok: true, data: null };
}
