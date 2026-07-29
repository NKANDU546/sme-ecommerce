export type MediaStatus = "pending" | "ready" | "deleted" | string;

export type MediaAsset = {
  id: string;
  workspaceId: string;
  url: string;
  storageKey: string;
  originalFilename: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  status: MediaStatus;
  createdAt: string;
  updatedAt: string;
};

export type UploadUrlResult = {
  mediaId: string;
  uploadUrl: string;
  storageKey: string;
  expiresAt: string;
};

export type MediaPage = {
  items: MediaAsset[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type CreateUploadUrlBody = {
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

export type ConfirmMediaBody = {
  width?: number;
  height?: number;
};

export type ListMediaParams = {
  type?: "image";
  page?: number;
  limit?: number;
};

export type ApiErrorResult = {
  ok: false;
  errorMessage: string;
  errorCode?: string;
  status?: number;
};

export type UploadUrlApiResult =
  | { ok: true; data: UploadUrlResult }
  | ApiErrorResult;

export type MediaAssetResult =
  | { ok: true; data: MediaAsset }
  | ApiErrorResult;

export type MediaPageResult =
  | { ok: true; data: MediaPage }
  | ApiErrorResult;

export type MediaVoidResult =
  | { ok: true; data: null }
  | ApiErrorResult;

/** Client-side limits aligned with backend defaults. */
export const MEDIA_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MEDIA_MAX_SIZE_BYTES = 5 * 1024 * 1024;
