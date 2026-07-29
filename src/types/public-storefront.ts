export type PublicSeo = {
  title: string;
  description: string;
  imageUrl: string | null;
};

export type PublicStorefront = {
  workspaceId: string;
  storeSlug: string;
  storeName: string;
  status: string;
  templateId: string;
  templateVersion: number;
  configVersion: number;
  config: Record<string, unknown>;
  publishedAt: string;
  seo: PublicSeo | null;
};

export type PublicPage = {
  slug: string;
  title: string;
  page: Record<string, unknown>;
};

export type ApiErrorResult = {
  ok: false;
  errorMessage: string;
  errorCode?: string;
  status?: number;
};

export type PublicStorefrontResult =
  | { ok: true; data: PublicStorefront }
  | ApiErrorResult;

export type PublicPageResult =
  | { ok: true; data: PublicPage }
  | ApiErrorResult;
