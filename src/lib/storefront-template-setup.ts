const KEY_PREFIX = "sme_sf_template_setup_v2_";

function storageKey(workspaceId: string): string {
  return `${KEY_PREFIX}${workspaceId}`;
}

/** True after the merchant has confirmed a template for this workspace. */
export function hasChosenStorefrontTemplate(workspaceId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.localStorage.getItem(storageKey(workspaceId)));
  } catch {
    return false;
  }
}

export function getChosenStorefrontTemplateId(
  workspaceId: string,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(storageKey(workspaceId));
  } catch {
    return null;
  }
}

export function markStorefrontTemplateChosen(
  workspaceId: string,
  templateId: string,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(workspaceId), templateId);
  } catch {
    /* private mode / quota */
  }
}
