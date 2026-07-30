"use client";

import { useId, useRef, useState } from "react";
import { useUploadMedia } from "@/hooks/use-media";

export type SelectedMedia = {
  id: string;
  url: string;
};

type ProductMediaFieldsProps = {
  workspaceId: string;
  mainImage: SelectedMedia | null;
  gallery: SelectedMedia[];
  onMainImageChange: (next: SelectedMedia | null) => void;
  onGalleryChange: (next: SelectedMedia[]) => void;
  disabled?: boolean;
};

const labelClass =
  "mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/55";

export function ProductMediaFields({
  workspaceId,
  mainImage,
  gallery,
  onMainImageChange,
  onGalleryChange,
  disabled,
}: ProductMediaFieldsProps) {
  const mainInputId = useId();
  const galleryInputId = useId();
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMedia(workspaceId);
  const [error, setError] = useState<string | null>(null);
  const [busySlot, setBusySlot] = useState<"main" | "gallery" | null>(null);

  async function handleFile(
    file: File | undefined,
    slot: "main" | "gallery",
  ) {
    if (!file) return;
    setError(null);
    setBusySlot(slot);
    try {
      const media = await upload.mutateAsync(file);
      const selected = { id: media.id, url: media.url };
      if (slot === "main") {
        onMainImageChange(selected);
      } else {
        onGalleryChange([...gallery, selected]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setBusySlot(null);
    }
  }

  const isBusy = busySlot != null || upload.isPending;

  return (
    <div className="space-y-4">
      <div>
        <span className={labelClass}>Main image</span>
        <div className="mt-1 flex items-start gap-3">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-primary-blue/15 bg-blue-gray/30">
            {mainImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImage.url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <input
              ref={mainInputRef}
              id={mainInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={disabled || isBusy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                void handleFile(file, "main");
              }}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={disabled || isBusy}
                onClick={() => mainInputRef.current?.click()}
                className="border border-primary-blue/20 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-primary-blue transition-colors hover:bg-blue-gray/30 disabled:opacity-50"
              >
                {busySlot === "main" ? "Uploading…" : "Upload image"}
              </button>
              {mainImage ? (
                <button
                  type="button"
                  disabled={disabled || isBusy}
                  onClick={() => onMainImageChange(null)}
                  className="font-sans text-xs font-semibold text-red-700 underline-offset-2 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <p className="font-sans text-[11px] text-muted-foreground">
              JPEG, PNG, or WebP · max 5 MB
            </p>
          </div>
        </div>
      </div>

      <div>
        <span className={labelClass}>Gallery</span>
        {gallery.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {gallery.map((item) => (
              <li
                key={item.id}
                className="relative h-16 w-16 overflow-hidden rounded-md border border-primary-blue/15 bg-blue-gray/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  disabled={disabled || isBusy}
                  aria-label="Remove gallery image"
                  onClick={() =>
                    onGalleryChange(gallery.filter((g) => g.id !== item.id))
                  }
                  className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 font-sans text-[10px] font-semibold text-white"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <input
          ref={galleryInputRef}
          id={galleryInputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled || isBusy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            void handleFile(file, "gallery");
          }}
        />
        <button
          type="button"
          disabled={disabled || isBusy}
          onClick={() => galleryInputRef.current?.click()}
          className="mt-2 border border-primary-blue/20 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-primary-blue transition-colors hover:bg-blue-gray/30 disabled:opacity-50"
        >
          {busySlot === "gallery" ? "Uploading…" : "Add gallery image"}
        </button>
      </div>

      {error ? (
        <p className="font-sans text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
