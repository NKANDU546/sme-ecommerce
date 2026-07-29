"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { listWorkspaces } from "@/apis/workspaces";
import {
  getStoredAuthSession,
  persistResolvedWorkspace,
} from "@/lib/auth-login-storage";

type WorkspaceRouteGuardProps = {
  workspaceId: string;
  children: React.ReactNode;
};

type ResolveState =
  | { status: "checking" }
  | { status: "ready" }
  | { status: "error"; message: string; detail?: string };

/**
 * Ensures the dashboard URL uses the backend workspace UUID.
 * Older flows used businessId in the path — redirect before loading draft APIs.
 */
export function WorkspaceRouteGuard({
  workspaceId,
  children,
}: WorkspaceRouteGuardProps) {
  const router = useRouter();
  const [state, setState] = useState<ResolveState>({ status: "checking" });

  useEffect(() => {
    const session = getStoredAuthSession();
    if (!session?.accessToken) {
      setState({
        status: "error",
        message: "Sign in to open your workspace.",
      });
      return;
    }

    let cancelled = false;
    setState({ status: "checking" });

    void (async () => {
      const result = await listWorkspaces(session.accessToken).catch(() => null);
      if (cancelled) return;

      if (!result?.ok) {
        setState({
          status: "error",
          message:
            result && !result.ok
              ? result.errorMessage
              : "Could not load your workspaces.",
          detail:
            "GET /api/v1/workspaces failed. Restart the backend after the duplicate-business fix, then sign in again.",
        });
        return;
      }

      const primary = result.data[0];
      if (!primary) {
        setState({
          status: "error",
          message: "No workspace exists for this account yet.",
          detail:
            "Register/verify a business account first. The backend auto-creates a workspace on first GET /workspaces.",
        });
        return;
      }

      persistResolvedWorkspace({
        workspaceId: primary.id,
        businessId: primary.businessId,
        businessName: primary.name,
      });

      // URL may still contain businessId from older login redirects.
      if (workspaceId !== primary.id) {
        const qs =
          typeof window !== "undefined" ? window.location.search : "";
        router.replace(`/dashboard/${primary.id}${qs}`);
        return;
      }

      setState({ status: "ready" });
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, router]);

  if (state.status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 font-sans text-sm text-muted-foreground">
        Resolving workspace…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="font-serif text-2xl text-primary-blue">
          Workspace unavailable
        </h1>
        <p className="max-w-md font-sans text-sm text-muted-foreground">
          {state.message}
        </p>
        {state.detail ? (
          <p className="max-w-md font-sans text-xs text-muted-foreground">
            {state.detail}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-primary-blue px-4 py-2 font-sans text-sm font-semibold text-white"
          >
            Retry
          </button>
          <Link
            href="/signin"
            className="font-sans text-sm font-semibold text-primary-blue underline"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
