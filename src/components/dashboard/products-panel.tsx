"use client";

import { useEffect, useMemo, useState } from "react";
import { DeleteProductModal } from "@/components/dashboard/delete-product-modal";
import {
  ProductFormModal,
  productFormToCreateBody,
  productFormToUpdateBody,
  type ProductFormValues,
} from "@/components/dashboard/product-form-modal";
import { formatDate } from "@/formats/date";
import {
  useArchiveProduct,
  useCreateProduct,
  useDraftProduct,
  useProductCategories,
  useProducts,
  usePublishProduct,
  useUpdateProduct,
} from "@/hooks/use-products";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import { productApiToCatalog } from "@/lib/product-mapper";
import type { CatalogProduct, CatalogProductStatus } from "@/types/catalog-product";
import type { ProductApi } from "@/types/product";

type ProductsPanelProps = {
  workspaceId: string;
};

type SortKey = "newest" | "name-asc" | "name-desc";

function statusClasses(status: CatalogProductStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-800 ring-emerald-600/15";
    case "draft":
      return "bg-amber-50 text-amber-900 ring-amber-600/20";
    case "archived":
      return "bg-blue-gray/40 text-primary-blue/70 ring-primary-blue/10";
    default:
      return "bg-blue-gray/40 text-primary-blue/70";
  }
}

type ProductActionsProps = {
  product: CatalogProduct;
  busy: boolean;
  onEdit: () => void;
  onPublish: () => void;
  onDraft: () => void;
  onDelete: () => void;
  compact?: boolean;
};

function ProductActions({
  product,
  busy,
  onEdit,
  onPublish,
  onDraft,
  onDelete,
  compact,
}: ProductActionsProps) {
  const link = compact
    ? "font-sans text-xs font-semibold"
    : "font-sans text-xs font-semibold underline-offset-2 hover:underline disabled:opacity-50";

  return (
    <div
      className={
        compact
          ? "mt-3 flex flex-wrap gap-3"
          : "flex flex-wrap justify-end gap-2"
      }
    >
      <button
        type="button"
        disabled={busy}
        onClick={onEdit}
        className={`${link} text-primary-blue`}
      >
        Edit
      </button>
      {product.status !== "active" ? (
        <button
          type="button"
          disabled={busy}
          onClick={onPublish}
          className={`${link} text-emerald-800`}
        >
          Publish
        </button>
      ) : null}
      {product.status !== "draft" ? (
        <button
          type="button"
          disabled={busy}
          onClick={onDraft}
          className={`${link} text-amber-900`}
        >
          Draft
        </button>
      ) : null}
      {product.status !== "archived" ? (
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className={`${link} text-red-700`}
        >
          Delete
        </button>
      ) : null}
    </div>
  );
}

export function ProductsPanel({ workspaceId }: ProductsPanelProps) {
  const accessToken = getStoredAuthSession()?.accessToken ?? null;
  const [query, setQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<CatalogProductStatus | "">("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<ProductApi | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductApi | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(query.trim());
    }, 300);
    return () => window.clearTimeout(id);
  }, [query]);

  const listParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status || undefined,
      categoryId: categoryId || undefined,
      page: 0,
      limit: 100,
    }),
    [debouncedSearch, status, categoryId],
  );

  const productsQuery = useProducts(workspaceId, accessToken, listParams);
  const categoriesQuery = useProductCategories(workspaceId, accessToken);
  const createMutation = useCreateProduct(workspaceId, accessToken);
  const updateMutation = useUpdateProduct(workspaceId, accessToken);
  const publishMutation = usePublishProduct(workspaceId, accessToken);
  const draftMutation = useDraftProduct(workspaceId, accessToken);
  const archiveMutation = useArchiveProduct(workspaceId, accessToken);

  const apiItems = productsQuery.data?.items ?? [];

  const products: CatalogProduct[] = useMemo(
    () => apiItems.map(productApiToCatalog),
    [apiItems],
  );

  const apiById = useMemo(() => {
    const map = new Map<string, ProductApi>();
    for (const item of apiItems) map.set(String(item.id), item);
    return map;
  }, [apiItems]);

  const categories = categoriesQuery.data ?? [];

  const filtered = useMemo(() => {
    const rows = [...products];
    switch (sort) {
      case "name-asc":
        rows.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        rows.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
      default:
        rows.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
    }
    return rows;
  }, [products, sort]);

  const hasActiveFilters = Boolean(
    query.trim() || categoryId || status || sort !== "newest",
  );

  function clearFilters() {
    setQuery("");
    setCategoryId("");
    setStatus("");
    setSort("newest");
  }

  function openCreate() {
    setFormMode("create");
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEdit(productId: string) {
    const product = apiById.get(productId);
    if (!product) return;
    setFormMode("edit");
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleFormSubmit(values: ProductFormValues) {
    setActionError(null);
    if (formMode === "edit" && editingProduct) {
      await updateMutation.mutateAsync({
        productId: String(editingProduct.id),
        body: productFormToUpdateBody(values),
      });
    } else {
      await createMutation.mutateAsync(productFormToCreateBody(values));
    }
    setFormOpen(false);
    setEditingProduct(null);
  }

  async function runStatusAction(
    productId: string,
    action: "publish" | "draft",
  ) {
    setActionError(null);
    setBusyProductId(productId);
    try {
      if (action === "publish") {
        await publishMutation.mutateAsync(productId);
      } else {
        await draftMutation.mutateAsync(productId);
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : `Could not ${action} the product.`,
      );
    } finally {
      setBusyProductId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setActionError(null);
    setBusyProductId(String(deleteTarget.id));
    try {
      await archiveMutation.mutateAsync(String(deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Could not delete the product.",
      );
    } finally {
      setBusyProductId(null);
    }
  }

  if (productsQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 font-sans text-sm text-muted-foreground">
        Loading products…
      </div>
    );
  }

  if (productsQuery.isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="font-serif text-xl text-primary-blue">
          Could not load products
        </p>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          {productsQuery.error instanceof Error
            ? productsQuery.error.message
            : "Please try again."}
        </p>
        <button
          type="button"
          onClick={() => productsQuery.refetch()}
          className="mt-2 font-sans text-sm font-semibold text-primary-blue underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalItems = productsQuery.data?.totalItems ?? products.length;
  const formSubmitting =
    createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-blue-gray/20">
      <ProductFormModal
        open={formOpen}
        mode={formMode}
        workspaceId={workspaceId}
        product={editingProduct}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
        categories={categories}
        isSubmitting={formSubmitting}
      />
      <DeleteProductModal
        open={Boolean(deleteTarget)}
        productTitle={deleteTarget?.title ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
        isSubmitting={archiveMutation.isPending}
      />

      <div className="shrink-0 border-b border-primary-blue/10 bg-white px-5 py-4 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="catalog-search"
                className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/55"
              >
                Search
              </label>
              <input
                id="catalog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, SKU, category…"
                className="w-full border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm text-foreground outline-none focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/15"
              />
            </div>
            <div>
              <label
                htmlFor="catalog-category"
                className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/55"
              >
                Category
              </label>
              <select
                id="catalog-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm outline-none focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/15"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="catalog-status"
                className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/55"
              >
                Status
              </label>
              <select
                id="catalog-status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as CatalogProductStatus | "")
                }
                className="w-full border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm outline-none focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/15"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="catalog-sort"
                className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/55"
              >
                Sort
              </label>
              <select
                id="catalog-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="w-full border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm outline-none focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/15"
              >
                <option value="newest">Recently updated</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
              </select>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="font-sans text-sm font-medium text-primary-blue underline decoration-primary-blue/30 underline-offset-4 hover:decoration-primary-blue"
              >
                Clear filters
              </button>
            ) : null}
            <button
              type="button"
              disabled={!accessToken}
              onClick={openCreate}
              className="bg-primary-blue px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90 disabled:opacity-60"
            >
              Add product
            </button>
          </div>
        </div>
        <p className="mt-3 font-sans text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-primary-blue/80">
            {filtered.length}
          </span>{" "}
          of {totalItems} products · synced with your workspace.
        </p>
        {actionError ? (
          <p className="mt-2 font-sans text-xs text-red-700" role="alert">
            {actionError}
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-primary-blue/20 bg-white px-6 py-14 text-center">
            <p className="font-serif text-xl font-light text-primary-blue">
              No matches
            </p>
            <p className="mt-2 font-sans text-sm text-muted-foreground">
              Try another search, clear filters, or add your first product.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-lg border border-primary-blue/10 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-primary-blue/10 bg-blue-gray/25 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-blue/55">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">
                      SKU
                    </th>
                    <th className="hidden px-4 py-3 font-medium xl:table-cell">
                      Category
                    </th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                    <th className="hidden px-4 py-3 font-medium 2xl:table-cell">
                      Updated
                    </th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const busy = busyProductId === p.id;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-primary-blue/5 transition-colors last:border-0 hover:bg-blue-gray/15"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-primary-blue/10 bg-blue-gray/30">
                              {p.imageUrl.trim() ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.imageUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-primary-blue">
                                {p.title}
                              </p>
                              <p className="truncate font-mono text-[11px] text-primary-blue/45 lg:hidden">
                                {p.sku}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 font-mono text-xs text-primary-blue/70 lg:table-cell">
                          {p.sku}
                        </td>
                        <td className="hidden px-4 py-3 text-primary-blue/75 xl:table-cell">
                          {p.category || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${statusClasses(p.status)}`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums text-primary-blue">
                          <span className="inline-flex flex-col items-end gap-0.5">
                            <span>{p.priceLabel}</span>
                            {p.onSale && p.compareAtPriceLabel ? (
                              <span className="text-[11px] font-normal text-primary-blue/45 line-through">
                                {p.compareAtPriceLabel}
                              </span>
                            ) : null}
                            {p.onSale ? (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                                Sale
                              </span>
                            ) : null}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-muted-foreground 2xl:table-cell">
                          {formatDate(p.updatedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <ProductActions
                            product={p}
                            busy={busy}
                            onEdit={() => openEdit(p.id)}
                            onPublish={() =>
                              void runStatusAction(p.id, "publish")
                            }
                            onDraft={() => void runStatusAction(p.id, "draft")}
                            onDelete={() => {
                              const api = apiById.get(p.id);
                              if (api) setDeleteTarget(api);
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {filtered.map((p) => {
                const busy = busyProductId === p.id;
                return (
                  <li
                    key={p.id}
                    className="rounded-lg border border-primary-blue/10 bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-primary-blue/10 bg-blue-gray/30">
                        {p.imageUrl.trim() ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-primary-blue">
                          {p.title}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-primary-blue/50">
                          {p.sku}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${statusClasses(p.status)}`}
                          >
                            {p.status}
                          </span>
                          <span className="text-xs text-primary-blue/60">
                            {p.category || "—"}
                          </span>
                          <span className="ml-auto inline-flex flex-col items-end font-semibold tabular-nums text-primary-blue">
                            <span>{p.priceLabel}</span>
                            {p.onSale && p.compareAtPriceLabel ? (
                              <span className="text-[10px] font-normal text-primary-blue/45 line-through">
                                {p.compareAtPriceLabel}
                              </span>
                            ) : null}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          Updated {formatDate(p.updatedAt)}
                        </p>
                        <ProductActions
                          product={p}
                          busy={busy}
                          compact
                          onEdit={() => openEdit(p.id)}
                          onPublish={() =>
                            void runStatusAction(p.id, "publish")
                          }
                          onDraft={() => void runStatusAction(p.id, "draft")}
                          onDelete={() => {
                            const api = apiById.get(p.id);
                            if (api) setDeleteTarget(api);
                          }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
