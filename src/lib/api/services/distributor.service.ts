import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { DistributorDto, DistributorDtoResult } from "@/types/crm";

export const distributorService = {
  /**
   * Get distributor profile by ID
   * Used by distributors to view their own profile
   */
  async getById(id: string): Promise<DistributorDto | null> {
    try {
      const response = await apiClient.get<DistributorDtoResult>(ENDPOINTS.DISTRIBUTOR.BY_ID(id));

      if (!response.data?.succeeded) {
        console.error("Failed to fetch distributor:", response.data?.messages?.[0]);
        return null;
      }

      return response.data?.data || null;
    } catch (error) {
      console.error("Error fetching distributor:", error);
      return null;
    }
  },
};
