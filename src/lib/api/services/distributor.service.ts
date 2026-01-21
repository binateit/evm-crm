import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  DistributorDto,
  DistributorDtoResult,
  DistributorForSaleOrderDto,
  DistributorForSaleOrderDtoResult,
  GuidResult,
} from "@/types";

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

  /**
   * Get current logged-in distributor's profile
   * Uses "my" endpoint that auto-detects distributor from session
   */
  async getMyProfile(): Promise<DistributorDto | null> {
    try {
      const response = await apiClient.get<DistributorDtoResult>(ENDPOINTS.DISTRIBUTOR.MY_PROFILE);

      if (!response.data?.succeeded) {
        console.error("Failed to fetch distributor profile:", response.data?.messages?.[0]);
        return null;
      }

      return response.data?.data || null;
    } catch (error) {
      console.error("Error fetching distributor profile:", error);
      return null;
    }
  },

  /**
   * Get distributor data for creating a sale order
   * Returns credit info, shipping addresses, and order-related fields
   * Uses logged-in distributor from session (no ID parameter needed)
   */
  async getForSaleOrder(): Promise<DistributorForSaleOrderDto | null> {
    try {
      const response = await apiClient.get<DistributorForSaleOrderDtoResult>(
        ENDPOINTS.DISTRIBUTOR.FOR_SALE_ORDER
      );

      if (!response.data?.succeeded) {
        console.error("Failed to fetch distributor for sale order:", response.data?.messages?.[0]);
        return null;
      }

      return response.data?.data || null;
    } catch (error) {
      console.error("Error fetching distributor for sale order:", error);
      return null;
    }
  },

  /**
   * Accept terms and conditions for distributor
   */
  async acceptTerms(distributorId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<GuidResult>(
        ENDPOINTS.DISTRIBUTOR.ACCEPT_TERMS(distributorId),
        {}
      );

      if (!response.data?.succeeded) {
        console.error("Failed to accept terms:", response.data?.messages?.[0]);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error accepting terms:", error);
      return false;
    }
  },

  /**
   * Accept terms and conditions for current logged-in distributor
   * Uses "my" endpoint that auto-detects distributor from session
   */
  async acceptMyTerms(): Promise<boolean> {
    try {
      const response = await apiClient.post<GuidResult>(ENDPOINTS.DISTRIBUTOR.MY_ACCEPT_TERMS, {});

      if (!response.data?.succeeded) {
        console.error("Failed to accept terms:", response.data?.messages?.[0]);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error accepting terms:", error);
      return false;
    }
  },
};
