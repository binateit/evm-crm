import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Result } from "@/types/common";
import type { PaginatedResponse } from "@/types/common/pagination.types";
import type { DistributorPricingDto, GetDistributorPricingListQuery } from "@/types/pricing.types";

export const pricingService = {
  /**
   * Get pricing list for logged-in distributor
   * Returns SKUs from assigned subcategories with PIMS pricing information
   * Supports pagination, keyword search, and filtering by brand/category/price range
   */
  async getMyPricingList(
    query: GetDistributorPricingListQuery
  ): Promise<PaginatedResponse<DistributorPricingDto>> {
    const response = await apiClient.post<Result<PaginatedResponse<DistributorPricingDto>>>(
      ENDPOINTS.PRICING_LIST.MY_PRICING,
      query
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to fetch pricing list");
    }

    return (
      response.data?.data || {
        data: [],
        pagination: {
          totalCount: 0,
          pageSize: query.pageSize || 20,
          currentPage: query.pageNumber || 1,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      }
    );
  },
};
