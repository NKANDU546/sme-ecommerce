import {
  confirmMediaUpload,
  createMediaUploadUrl,
  putFileToSignedUrl,
} from "@/apis/media";
import type { ApiErrorResult, MediaAsset } from "@/types/media";
import {
  MEDIA_ALLOWED_MIME_TYPES,
  MEDIA_MAX_SIZE_BYTES,
} from "@/types/media";

function readImageDimensions(
  file: File,
): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof Image === "undefined") {
      resolve({});
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || undefined;
      const height = img.naturalHeight || undefined;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    img.src = url;
  });
}

export function validateImageFile(
  file: File,
): { ok: true } | { ok: false; errorMessage: string } {
  const mime = file.type.trim().toLowerCase();
  if (
    !(MEDIA_ALLOWED_MIME_TYPES as readonly string[]).includes(mime)
  ) {
    return {
      ok: false,
      errorMessage: "Use a JPEG, PNG, or WebP image.",
    };
  }
  if (file.size <= 0 || file.size > MEDIA_MAX_SIZE_BYTES) {
    return {
      ok: false,
      errorMessage: "Image must be under 5 MB.",
    };
  }
  return { ok: true };
}

/**
 * Full media upload flow:
 * 1) POST upload-url → pending media + signed PUT URL
 * 2) PUT file to S3
 * 3) POST confirm → ready media with public URL
 */
export async function uploadWorkspaceImage(
  workspaceId: string,
  accessToken: string,
  file: File,
): Promise<{ ok: true; data: MediaAsset } | ApiErrorResult> {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    return {
      ok: false,
      errorMessage: validation.errorMessage,
      status: 400,
    };
  }

  const mimeType = file.type.trim().toLowerCase();
  const uploadUrlResult = await createMediaUploadUrl(
    workspaceId,
    accessToken,
    {
      filename: file.name || "image.jpg",
      mimeType,
      sizeBytes: file.size,
    },
  );
  if (!uploadUrlResult.ok) return uploadUrlResult;

  const putResult = await putFileToSignedUrl(
    uploadUrlResult.data.uploadUrl,
    file,
    mimeType,
  );
  if (!putResult.ok) {
    return {
      ok: false,
      errorMessage: putResult.errorMessage,
      status: 0,
    };
  }

  const dimensions = await readImageDimensions(file);
  const confirmed = await confirmMediaUpload(
    workspaceId,
    uploadUrlResult.data.mediaId,
    accessToken,
    dimensions,
  );
  return confirmed;
}
