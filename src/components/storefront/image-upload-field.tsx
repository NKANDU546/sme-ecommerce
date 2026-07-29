"use client";

import { useId, useRef, useState } from "react";
import { useUploadMedia } from "@/hooks/use-media";

type ImageUploadFieldProps = {
  workspaceId: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function ImageUploadField({
  workspaceId,
  label,
  value,
  onChange,
  disabled,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia(workspaceId);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const media = await upload.mutateAsync(file);
      onChange(media.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    }
  }

  const isBusy = upload.isPending;
  const hasImage = Boolean(value.trim());

  return (
    <div>
      <span className="mb-1.5 block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-blue/60">
        {label}
      </span>
      <div className="flex items-start gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-primary-blue/15 bg-blue-gray/30">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={disabled || isBusy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              void handleFile(file);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled || isBusy}
              onClick={() => inputRef.current?.click()}
              className="border border-primary-blue/20 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-primary-blue transition-colors hover:bg-blue-gray/30 disabled:opacity-50"
            >
              {isBusy ? "Uploading…" : hasImage ? "Replace image" : "Upload image"}
            </button>
            {hasImage ? (
              <button
                type="button"
                disabled={disabled || isBusy}
                onClick={() => onChange("")}
                className="font-sans text-xs font-semibold text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            ) : null}
          </div>
          <p className="font-sans text-[11px] text-muted-foreground">
            JPEG, PNG, or WebP · max 5 MB
          </p>
          {error ? (
            <p className="font-sans text-xs text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
