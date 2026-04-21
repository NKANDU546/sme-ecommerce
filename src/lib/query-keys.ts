/**
 * Central query keys — use with useQuery / prefetchQuery / invalidateQueries.
 * Nest segments so you can invalidate groups (e.g. all of "products").
 */
export const queryKeys = {
  root: ["sme"] as const,
  health: () => [...queryKeys.root, "health"] as const,
  // Example: products: { all: () => [...queryKeys.root, "products"] as const, detail: (id: string) => [...queryKeys.products.all(), id] as const },
} as const;
