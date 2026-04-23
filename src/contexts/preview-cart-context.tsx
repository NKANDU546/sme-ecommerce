"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadPreviewCart,
  savePreviewCart,
} from "@/lib/preview-cart-storage";
import type { PreviewCartLine } from "@/types/preview-cart";

export type PreviewCartContextValue = {
  lines: PreviewCartLine[];
  itemCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (
    input: {
      productId: string;
      title: string;
      sku: string;
      priceLabel: string;
      imageUrl: string;
      quantity?: number;
    },
    opts?: { openDrawer?: boolean },
  ) => void;
  setQuantity: (productId: string, quantity: number) => void;
  incrementLine: (productId: string) => void;
  decrementLine: (productId: string) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
};

const PreviewCartContext = createContext<PreviewCartContextValue | null>(
  null,
);

export function usePreviewCartOptional(): PreviewCartContextValue | null {
  return useContext(PreviewCartContext);
}

type PreviewCartProviderProps = {
  workspaceId: string;
  children: ReactNode;
};

export function PreviewCartProvider({
  workspaceId,
  children,
}: PreviewCartProviderProps) {
  const [lines, setLines] = useState<PreviewCartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setLines(loadPreviewCart(workspaceId));
    setHydrated(true);
  }, [workspaceId]);

  useEffect(() => {
    if (!hydrated) return;
    savePreviewCart(workspaceId, lines);
  }, [hydrated, workspaceId, lines]);

  const itemCount = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines],
  );

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), []);

  const addItem = useCallback(
    (
      input: {
        productId: string;
        title: string;
        sku: string;
        priceLabel: string;
        imageUrl: string;
        quantity?: number;
      },
      opts?: { openDrawer?: boolean },
    ) => {
      const q = Math.max(1, Math.floor(input.quantity ?? 1));
      setLines((prev) => {
        const i = prev.findIndex((l) => l.productId === input.productId);
        if (i === -1) {
          return [
            ...prev,
            {
              productId: input.productId,
              title: input.title,
              sku: input.sku,
              priceLabel: input.priceLabel,
              imageUrl: input.imageUrl,
              quantity: q,
            },
          ];
        }
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + q };
        return next;
      });
      if (opts?.openDrawer !== false) setDrawerOpen(true);
    },
    [],
  );

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const q = Math.floor(quantity);
    if (q < 1) {
      setLines((prev) => prev.filter((l) => l.productId !== productId));
      return;
    }
    setLines((prev) =>
      prev.map((l) =>
        l.productId === productId ? { ...l, quantity: q } : l,
      ),
    );
  }, []);

  const incrementLine = useCallback((productId: string) => {
    setLines((prev) =>
      prev.map((l) =>
        l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l,
      ),
    );
  }, []);

  const decrementLine = useCallback((productId: string) => {
    setLines((prev) => {
      const next: PreviewCartLine[] = [];
      for (const l of prev) {
        if (l.productId !== productId) {
          next.push(l);
          continue;
        }
        if (l.quantity <= 1) continue;
        next.push({ ...l, quantity: l.quantity - 1 });
      }
      return next;
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<PreviewCartContextValue>(
    () => ({
      lines,
      itemCount,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      setQuantity,
      incrementLine,
      decrementLine,
      removeLine,
      clearCart,
    }),
    [
      lines,
      itemCount,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      setQuantity,
      incrementLine,
      decrementLine,
      removeLine,
      clearCart,
    ],
  );

  return (
    <PreviewCartContext.Provider value={value}>
      {children}
    </PreviewCartContext.Provider>
  );
}
