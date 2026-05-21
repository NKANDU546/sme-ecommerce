import type { Metadata } from "next";
import { CartClient } from "@/app/preview/[workspaceId]/cart/cart-client";

type PageProps = {
  params: Promise<{ workspaceId: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { workspaceId } = await params;
  return {
    title: `Checkout · ${workspaceId.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({ params }: PageProps) {
  const { workspaceId } = await params;
  return <CartClient workspaceId={workspaceId} initialStep="checkout" />;
}
