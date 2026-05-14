"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchAdminOverview,
  useAdminOverviewQueryKey,
  type AdminOverview,
} from "@/lib/api/admin";

export function useAdminOverview(args: { department: string | null; days: number }) {
  const key = useAdminOverviewQueryKey(args);
  return useQuery<AdminOverview>({
    queryKey: key,
    queryFn: () => fetchAdminOverview({ department: args.department, days: args.days }),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
