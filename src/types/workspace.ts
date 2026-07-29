export type WorkspaceStatus =
  | "DRAFT"
  | "LIVE"
  | "UNPUBLISHED"
  | "SUSPENDED"
  | "draft"
  | "live"
  | "unpublished"
  | "suspended";

export type Workspace = {
  id: string;
  businessId: string;
  name: string;
  publicSlug: string | null;
  status: WorkspaceStatus | string;
  createdAt: string;
  updatedAt: string;
};

export type StorefrontDraft = {
  workspaceId: string;
  storefrontId: string;
  templateId: string;
  templateVersion: number;
  configVersion: number;
  config: Record<string, unknown>;
  updatedAt: string;
};

export type UpdateStorefrontDraftBody = {
  templateId: string;
  templateVersion: number;
  configVersion: number;
  config: Record<string, unknown>;
};

export type ResetStorefrontDraftBody = {
  templateId: string;
  templateVersion: number;
};

export type PublishStorefrontBody = {
  confirm: boolean;
  notes?: string;
};

export type PublishResult = {
  workspaceId: string;
  storefrontId: string;
  publishedSnapshotId: string;
  status: WorkspaceStatus | string;
  publishedAt: string;
};

export type PublishedStorefront = {
  workspaceId: string;
  storefrontId: string;
  publishedSnapshotId: string;
  templateId: string;
  templateVersion: number;
  configVersion: number;
  config: Record<string, unknown>;
  status: WorkspaceStatus | string;
  publicSlug: string | null;
  publishedAt: string;
  notes: string | null;
};

export type PublishHistoryItem = {
  snapshotId: string;
  templateId: string;
  templateVersion: number;
  configVersion: number;
  publishedByUserId: string;
  publishedAt: string;
  notes: string | null;
};

export type UnpublishResult = {
  workspaceId: string;
  status: WorkspaceStatus | string;
  lastPublishedAt: string | null;
};

export type ApiErrorResult = {
  ok: false;
  errorMessage: string;
  errorCode?: string;
  status?: number;
};

export type WorkspacesListResult =
  | { ok: true; data: Workspace[] }
  | ApiErrorResult;

export type WorkspaceResult =
  | { ok: true; data: Workspace }
  | ApiErrorResult;

export type StorefrontDraftResult =
  | { ok: true; data: StorefrontDraft }
  | ApiErrorResult;

export type PublishResultResponse =
  | { ok: true; data: PublishResult }
  | ApiErrorResult;

export type PublishedStorefrontResult =
  | { ok: true; data: PublishedStorefront }
  | ApiErrorResult;

export type PublishHistoryResult =
  | { ok: true; data: PublishHistoryItem[] }
  | ApiErrorResult;

export type UnpublishResultResponse =
  | { ok: true; data: UnpublishResult }
  | ApiErrorResult;
