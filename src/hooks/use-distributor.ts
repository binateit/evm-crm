"use client";

import { useSession } from "next-auth/react";

/**
 * Hook to get the current distributor information from the session
 */
export function useDistributor() {
  const { data: session, status } = useSession();

  return {
    distributorId: session?.user?.distributorId ?? "",
    distributorCode: session?.user?.distributorCode ?? "",
    distributorName: session?.user?.distributorName ?? "",
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
