"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useProducts,
  useUpdateProduct,
} from "@/hooks/use-products";
import { getStoredAuthSession } from "@/lib/auth-login-storage";
import type { ProductApi } from "@/types/product";

type InventoryPanelProps = {
  workspaceId: string;
};

type StockFilter = "all" | "in" | "out";

export function InventoryPanel({ workspaceId }: InventoryPanelProps) {
  const accessToken = getStoredAuthSession()?.accessToken ?? null;
  const [query, setQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draftQty, setDraftQty] = useState<Record<string, string>>({});

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(query.trim());
    }, 300);
    return () => window.clearTimeout(id);
  }, [query]);

  const listParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: "active" as const,
      page: 0,
      limit: 100,
      ...(stockFilter === "in"
        ? { inStock: true }
        : stockFilter === "out"
          ? { inStock: false }
          : {}),
    }),
    [debouncedSearch, stockFilter],
  );

  const productsQuery = useProducts(workspaceId, accessToken, listParams);
  const updateMutation = useUpdateProduct(workspaceId, accessToken);
  const items = productsQuery.data?.items ?? [];

  async function setStock(product: ProductApi, quantityAvailable: number) {
    if (!accessToken) return;
    const qty = Math.max(0, Math.floor(quantityAvailable));
    setBusyId(product.id);
    try {
      const updated = await updateMutation.mutateAsync({
        productId: product.id,
        body: { quantityAvailable: qty },
      });
      setDraftQty((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      const saved = Math.max(
        0,
        Math.floor(Number(updated.quantityAvailable ?? NaN)),
      );
      if (!Number.isFinite(saved) || saved !== qty) {
        toast.error("Stock was not saved", {
          description:
            "The API accepted the request but did not return quantityAvailable. Restart/redeploy the backend with Step 03C inventory fields.",
        });
        return;
      }
      toast.success(saved === 0 ? "Marked sold out" : "Stock updated", {
        description: `${updated.title} · ${saved} in stock`,
      });
    } catch (err) {
      toast.error("Could not update stock", {
        description:
          err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function nudge(product: ProductApi, delta: number) {
    const current = Math.max(0, Math.floor(Number(product.quantityAvailable ?? 0)));
    await setStock(product, current + delta);
  }

  function commitDraft(product: ProductApi) {
    const raw = draftQty[product.id];
    if (raw == null) return;
    const parsed = Number(raw.trim());
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      toast.error("Enter a whole number of 0 or more.");
      return;
    }
    void setStock(product, parsed);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-primary-blue/10 bg-white px-5 py-4 sm:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-xl">
            <div>
              <label
                htmlFor="inventory-search"
                className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/55"
              >
                Search
              </label>
              <input
                id="inventory-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title or SKU"
                className="w-full border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm outline-none focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/15"
              />
            </div>
            <div>
              <label
                htmlFor="inventory-filter"
                className="mb-1 block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-blue/55"
              >
                Stock
              </label>
              <select
                id="inventory-filter"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                className="w-full border border-primary-blue/15 bg-white px-3 py-2 font-sans text-sm outline-none focus-visible:border-primary-blue/35 focus-visible:ring-2 focus-visible:ring-primary-blue/15"
              >
                <option value="all">All active</option>
                <option value="in">In stock</option>
                <option value="out">Sold out</option>
              </select>
            </div>
          </div>
          <p className="font-sans text-xs text-muted-foreground">
            Active products only · adjust counts with +/− or type a number.
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">
        {!accessToken ? (
          <p className="font-sans text-sm text-muted-foreground">
            Sign in to manage inventory.
          </p>
        ) : productsQuery.isLoading ? (
          <p className="font-sans text-sm text-muted-foreground">Loading stock…</p>
        ) : productsQuery.isError ? (
          <p className="font-sans text-sm text-red-700" role="alert">
            {productsQuery.error instanceof Error
              ? productsQuery.error.message
              : "Could not load inventory."}
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-primary-blue/20 bg-white px-6 py-14 text-center">
            <p className="font-serif text-xl font-light text-primary-blue">
              No products here
            </p>
            <p className="mt-2 font-sans text-sm text-muted-foreground">
              Publish products from the Products tab, then tune stock levels
              here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-primary-blue/10 bg-white shadow-sm">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-primary-blue/10 bg-blue-gray/25 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-blue/55">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    SKU
                  </th>
                  <th className="px-4 py-3 font-medium">Available</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((product) => {
                  const busy = busyId === product.id;
                  const qty = Math.max(
                    0,
                    Math.floor(Number(product.quantityAvailable ?? 0)),
                  );
                  const draft = draftQty[product.id] ?? String(qty);
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-primary-blue/5 last:border-0 hover:bg-blue-gray/15"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-primary-blue">
                          {product.title}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-primary-blue/45 sm:hidden">
                          {product.sku}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-primary-blue/70 sm:table-cell">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center rounded-md border border-primary-blue/15 bg-white">
                            <button
                              type="button"
                              disabled={busy || qty <= 0}
                              onClick={() => void nudge(product, -1)}
                              className="px-2 py-1 text-primary-blue disabled:opacity-40"
                              aria-label={`Decrease stock for ${product.title}`}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={0}
                              step={1}
                              disabled={busy}
                              value={draft}
                              onChange={(e) =>
                                setDraftQty((prev) => ({
                                  ...prev,
                                  [product.id]: e.target.value,
                                }))
                              }
                              onBlur={() => commitDraft(product)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-14 border-x border-primary-blue/10 bg-transparent py-1 text-center font-sans text-xs font-semibold tabular-nums text-primary-blue outline-none disabled:opacity-50"
                              aria-label={`Stock quantity for ${product.title}`}
                            />
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void nudge(product, 1)}
                              className="px-2 py-1 text-primary-blue disabled:opacity-40"
                              aria-label={`Increase stock for ${product.title}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${
                            product.inStock
                              ? "bg-emerald-50 text-emerald-800 ring-emerald-600/15"
                              : "bg-red-50 text-red-800 ring-red-600/15"
                          }`}
                        >
                          {product.inStock ? "In stock" : "Sold out"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
