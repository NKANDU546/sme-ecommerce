import { Suspense } from "react";
import { PublicOrderConfirmationClient } from "@/app/s/[storeSlug]/order/[orderId]/public-order-confirmation-client";

type PageProps = {
  params: Promise<{ storeSlug: string; orderId: string }>;
};

export default async function PublicOrderConfirmationPage({
  params,
}: PageProps) {
  const { storeSlug, orderId } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background font-sans text-sm text-muted-foreground">
          Loading order…
        </div>
      }
    >
      <PublicOrderConfirmationClient storeSlug={storeSlug} orderId={orderId} />
    </Suspense>
  );
}
