"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "@/apis/health";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
  });
}
