export type DashboardNavId =
  | "dashboard"
  | "orders"
  | "products"
  | "storefront"
  | "customers"
  | "analytics"
  | "inventory"
  | "reports"
  | "settings";

export type DashboardSectionAction =
  | { kind: "href"; label: string; href: string }
  | { kind: "section"; label: string; section: DashboardNavId };

export type DashboardSectionEmpty = {
  title: string;
  description: string;
  action?: DashboardSectionAction;
};

export type DashboardSectionConfig = {
  id: DashboardNavId;
  label: string;
  icon:
    | "grid"
    | "orders"
    | "box"
    | "store"
    | "users"
    | "chart"
    | "inventory"
    | "report"
    | "gear";
  /** Main column heading */
  panelTitle: string;
  panelSubtitle: string;
  /** Primary panel when this section has no data yet */
  empty: DashboardSectionEmpty;
  /** When true, show a primary “New order” style control in the header */
  showHeaderCta?: boolean;
  headerCtaLabel?: string;
};

export const DASHBOARD_SECTIONS: readonly DashboardSectionConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "grid",
    panelTitle: "Dashboard overview",
    panelSubtitle:
      "Welcome back—here is your business at a glance. More soon.",
    showHeaderCta: true,
    headerCtaLabel: "New order",
    empty: {
      title: "Overview in preview",
      description:
        "Your workspace is ready. Charts, alerts, and quick actions will appear here as we ship them—bookmark this URL and check back.",
    },
  },
  {
    id: "orders",
    label: "Orders",
    icon: "orders",
    panelTitle: "Orders",
    panelSubtitle:
      "Track WhatsApp and storefront orders in one list with clear status.",
    showHeaderCta: true,
    headerCtaLabel: "New order",
    empty: {
      title: "No orders yet",
      description:
        "When customers message or checkout, each order will land here so you can fulfil without losing threads in chat.",
      action: {
        kind: "section",
        label: "Make your site",
        section: "storefront",
      },
    },
  },
  {
    id: "products",
    label: "Products",
    icon: "box",
    panelTitle: "Products",
    panelSubtitle: "Catalog, pricing, and what you sell in one catalogue.",
    empty: {
      title: "No products yet",
      description:
        "Add what you sell once—use it on your storefront and in order flows so customers always see accurate items and prices.",
      action: { kind: "href", label: "Add a product", href: "#" },
    },
  },
  {
    id: "storefront",
    label: "Storefront",
    icon: "store",
    panelTitle: "Storefront",
    panelSubtitle:
      "Your public shop and order hub—branded, clear, and ready to share.",
    empty: {
      title: "No storefront published",
      description:
        "The Storefront tab hosts a default template you can customize. Until the API ships, settings are saved in this browser only.",
    },
  },
  {
    id: "customers",
    label: "Customers",
    icon: "users",
    panelTitle: "Customers",
    panelSubtitle: "People who buy from you—history and context in one place.",
    empty: {
      title: "No customers yet",
      description:
        "After first orders, customer profiles will appear here with contact preferences and order history.",
    },
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "chart",
    panelTitle: "Analytics",
    panelSubtitle: "See what is selling, stalling, and worth your attention.",
    empty: {
      title: "No analytics yet",
      description:
        "Once there is order volume, trends and simple reports will show here so you can decide with numbers, not guesswork.",
    },
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: "inventory",
    panelTitle: "Inventory",
    panelSubtitle: "Stock levels tied to what you sell and what is on order.",
    empty: {
      title: "No stock records yet",
      description:
        "Connect counts to products so low-stock nudges and fulfilment stay honest as orders pick up.",
    },
  },
  {
    id: "reports",
    label: "Reports",
    icon: "report",
    panelTitle: "Reports",
    panelSubtitle: "Exports and summaries for you or your accountant.",
    empty: {
      title: "No reports yet",
      description:
        "Run summaries when you need them—daily sales, VAT-friendly exports, and order logs will be available here.",
    },
  },
  {
    id: "settings",
    label: "Settings",
    icon: "gear",
    panelTitle: "Settings",
    panelSubtitle: "Workspace, notifications, and how SME Operations behaves.",
    empty: {
      title: "Settings coming soon",
      description:
        "Team access, WhatsApp numbers, and billing will live here. For now your workspace link and profile are enough to explore.",
    },
  },
] as const;

export function getDashboardSection(
  id: DashboardNavId,
): DashboardSectionConfig {
  const found = DASHBOARD_SECTIONS.find((s) => s.id === id);
  if (!found) return DASHBOARD_SECTIONS[0];
  return found;
}
