"use client";

import { useHealth } from "@/hooks/use-health";

export function HealthStatus() {
  const { data, isPending, isError, error, refetch } = useHealth();

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Checking API…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        {error instanceof Error ? error.message : "Something went wrong"}{" "}
        <button
          type="button"
          className="underline"
          onClick={() => void refetch()}
        >
          Retry
        </button>
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      API: {data?.service} — ok: {String(data?.ok)}
    </p>
  );
}
