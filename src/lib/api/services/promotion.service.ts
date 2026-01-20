import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  PromotionDetailDto,
  PromotionTypeDto,
  SearchPromotionsQuery,
  PromotionPaginationResponse,
  PromotionDetailDtoResult,
  PromotionPaginationResponseResult,
  PromotionTypeDtoListResult,
} from "@/types/crm";

export const promotionService = {
  /**
   * Search promotions with pagination and filters
   */
  async search(query: SearchPromotionsQuery): Promise<PromotionPaginationResponse> {
    const response = await apiClient.post<PromotionPaginationResponseResult>(
      ENDPOINTS.PROMOTION.SEARCH,
      query
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to search promotions");
    }

    return (
      response.data?.data || {
        data: [],
        pagination: {
          totalCount: 0,
          pageSize: 10,
          currentPage: 1,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      }
    );
  },

  /**
   * Get promotion details by ID
   */
  async getById(id: string): Promise<PromotionDetailDto | null> {
    try {
      const response = await apiClient.get<PromotionDetailDtoResult>(ENDPOINTS.PROMOTION.BY_ID(id));

      if (!response.data?.succeeded) {
        console.error("Failed to fetch promotion:", response.data?.messages?.[0]);
        return null;
      }

      return response.data?.data || null;
    } catch (error) {
      console.error("Error fetching promotion:", error);
      return null;
    }
  },

  /**
   * Get list of promotion types
   */
  async getTypes(): Promise<PromotionTypeDto[]> {
    try {
      const response = await apiClient.get<PromotionTypeDtoListResult>(ENDPOINTS.PROMOTION.TYPES);

      if (!response.data?.succeeded) {
        console.error("Failed to fetch promotion types:", response.data?.messages?.[0]);
        return [];
      }

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching promotion types:", error);
      return [];
    }
  },
};
