"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate } from "@/formats/date";
import {
  loadCatalogProducts,
  saveCatalogProducts,
} from "@/lib/catalog-storage";
import type { CatalogProduct, CatalogProductStatus } from "@/types/catalog-product";

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

export function ProductsPanel({ workspaceId }: ProductsPanelProps) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<CatalogProductStatus | "">("");
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    setProducts(loadCatalogProducts(workspaceId));
    setHydrated(true);
  }, [workspaceId]);

  const persist = useCallback(
    (next: CatalogProduct[]) => {
      setProducts(next);
      saveCatalogProducts(workspaceId, next);
    },
    [workspaceId],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category.trim()) set.add(p.category);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (status && p.status !== status) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });

    rows = [...rows];
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
  }, [products, query, category, status, sort]);

  const hasActiveFilters = Boolean(
    query.trim() || category || status || sort !== "newest",
  );

  function clearFilters() {
    setQuery("");
    setCategory("");
    setStatus("");
    setSort("newest");
  }

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 font-sans text-sm text-muted-foreground">
        Loading products…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-blue-gray/20">
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm outline-none focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/15"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
              onClick={() => {
                const id = `p-${Date.now()}`;
                persist([
                  {
                    id,
                    title: "New product",
                    sku: `SKU-NEW-${String(products.length + 1).padStart(3, "0")}`,
                    priceLabel: "R 0.00",
                    category: categories[0] ?? "Home",
                    status: "draft",
                    imageUrl: "",
                    updatedAt: Date.now(),
                  },
                  ...products,
                ]);
              }}
              className="bg-primary-blue px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-blue/90"
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
          of {products.length} products · stored in this browser until your API
          is ready.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-primary-blue/20 bg-white px-6 py-14 text-center">
            <p className="font-serif text-xl font-light text-primary-blue">
              No matches
            </p>
            <p className="mt-2 font-sans text-sm text-muted-foreground">
              Try another search or clear filters to see the full catalogue.
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
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
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
                        {p.category}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${statusClasses(p.status)}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-primary-blue">
                        {p.priceLabel}
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground 2xl:table-cell">
                        {formatDate(p.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {filtered.map((p) => (
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
                      <p className="font-medium text-primary-blue">{p.title}</p>
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
                          {p.category}
                        </span>
                        <span className="ml-auto font-semibold tabular-nums text-primary-blue">
                          {p.priceLabel}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Updated {formatDate(p.updatedAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
