import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Result } from "@/types/common";

export interface AllocatedSkuDto {
  id: string; // Primary identifier from API
  skuCode: string | null;
  skuName: string | null;
  brandName: string | null;
  categoryName: string | null;
  mrp: number;
  sellingPrice: number;
  uom: string | null;
  status: number;
  statusName: string | null;
  brandId: string;
  masterCategoryId: string;
  categoryId: string;
  subCategoryId: string;

  // Additional fields from detail endpoint
  partCode?: string | null;
  subCategoryName?: string | null;
  hsnCode?: string | null;
  unitPrice?: number; // Same as sellingPrice
  gstPercent?: number;
  discountPercent?: number;
  availableStock?: number;
  imageUrl?: string | null;
  hasAllocation?: boolean;
  remainingAllocation?: number;
  pdc?: number; // Prepaid discount
  cdc?: number; // Credit discount
  skuId?: string; // Alias for id (for backward compatibility)
}

export interface SearchAllocatedSkusQuery {
  keyword?: string | null;
  brandId?: string | null;
  categoryId?: string | null;
  subCategoryId?: string | null;
  pageNumber?: number;
  pageSize?: number;
}

export interface AllocatedSkusResponse {
  data: AllocatedSkuDto[];
  pagination: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export const skuService = {
  /**
   * Search allocated SKUs for logged-in distributor
   * Only returns products from categories allocated to the distributor
   * Uses logged-in distributor from session (no ID parameter needed)
   */
  async searchAllocatedSkus(query: SearchAllocatedSkusQuery): Promise<AllocatedSkusResponse> {
    const response = await apiClient.post<Result<AllocatedSkusResponse>>(
      ENDPOINTS.DISTRIBUTOR.MY_SKUS,
      query
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to fetch allocated products");
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
   * Get detailed information about a specific SKU for logged-in distributor
   * Uses logged-in distributor from session (no ID parameter needed)
   */
  async getSkuDetails(skuId: string): Promise<AllocatedSkuDto | null> {
    const response = await apiClient.get<Result<AllocatedSkuDto>>(
      ENDPOINTS.DISTRIBUTOR.MY_SKU_DETAILS(skuId)
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to fetch SKU details");
    }

    return response.data?.data || null;
  },
};
