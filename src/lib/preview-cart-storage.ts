import type { PreviewCartLine } from "@/types/preview-cart";

const STORAGE_PREFIX = "sme_preview_cart_v1_";

export function previewCartStorageKey(workspaceId: string): string {
  return `${STORAGE_PREFIX}${workspaceId}`;
}

function normalizeLine(raw: unknown, fallback: PreviewCartLine): PreviewCartLine {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const o = raw as Record<string, unknown>;
  const qty =
    typeof o.quantity === "number" && Number.isFinite(o.quantity) && o.quantity > 0
      ? Math.floor(o.quantity)
      : fallback.quantity;
  return {
    productId:
      typeof o.productId === "string" && o.productId ? o.productId : fallback.productId,
    title: typeof o.title === "string" ? o.title : fallback.title,
    sku: typeof o.sku === "string" ? o.sku : fallback.sku,
    priceLabel:
      typeof o.priceLabel === "string" ? o.priceLabel : fallback.priceLabel,
    imageUrl:
      typeof o.imageUrl === "string" ? o.imageUrl : fallback.imageUrl,
    quantity: qty,
  };
}

export function loadPreviewCart(workspaceId: string): PreviewCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(previewCartStorageKey(workspaceId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const fb: PreviewCartLine = {
      productId: "",
      title: "",
      sku: "",
      priceLabel: "",
      imageUrl: "",
      quantity: 1,
    };
    return parsed
      .map((row) => normalizeLine(row, fb))
      .filter((l) => l.productId && l.quantity > 0);
  } catch {
    return [];
  }
}

export function savePreviewCart(
  workspaceId: string,
  lines: PreviewCartLine[],
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      previewCartStorageKey(workspaceId),
      JSON.stringify(lines),
    );
  } catch {
    /* ignore */
  }
}
