import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/common/pagination.types";
import type {
  SaleOrderDetailDto,
  SaleOrderListDto,
  SearchSaleOrdersQuery,
  SaleOrderDetailDtoResult,
  SaleOrderListDtoPaginationResponseResult,
  DistributorApproveRequest,
  DistributorRejectRequest,
  SearchPendingDistributorApprovalQuery,
  SaleOrderDashboardSummaryDto,
  SaleOrderDashboardSummaryDtoResult,
} from "@/types/crm";

export const saleOrderService = {
  /**
   * Get sale orders for a specific distributor
   */
  async getByDistributor(
    distributorId: string,
    query: Pick<
      SearchSaleOrdersQuery,
      "pageNumber" | "pageSize" | "statusId" | "fromDate" | "toDate"
    >
  ): Promise<PaginatedResponse<SaleOrderListDto>> {
    const response = await apiClient.post<SaleOrderListDtoPaginationResponseResult>(
      ENDPOINTS.SALE_ORDER.BY_DISTRIBUTOR(distributorId),
      query
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to fetch sale orders");
    }

    return response.data?.data || { data: [], pagination: {} };
  },

  /**
   * Get sale order by ID
   */
  async getById(id: string): Promise<SaleOrderDetailDto | null> {
    try {
      const response = await apiClient.get<SaleOrderDetailDtoResult>(
        ENDPOINTS.SALE_ORDER.BY_ID(id)
      );

      if (!response.data?.succeeded) {
        console.error("Failed to fetch sale order:", response.data?.messages?.[0]);
        return null;
      }

      return response.data?.data || null;
    } catch (error) {
      console.error("Error fetching sale order:", error);
      return null;
    }
  },

  /**
   * Get orders pending distributor approval
   */
  async getPendingDistributorApproval(
    pageNumber: number = 1,
    pageSize: number = 10,
    distributorId?: string
  ): Promise<PaginatedResponse<SaleOrderListDto>> {
    const response = await apiClient.get<SaleOrderListDtoPaginationResponseResult>(
      ENDPOINTS.SALE_ORDER.PENDING_DISTRIBUTOR_APPROVAL,
      {
        params: { pageNumber, pageSize, distributorId },
      }
    );

    if (!response.data?.succeeded) {
      throw new Error(
        response.data?.messages?.[0] || "Failed to fetch pending distributor approval orders"
      );
    }

    return response.data?.data || { data: [], pagination: {} };
  },

  /**
   * Search orders pending distributor approval with filters
   */
  async searchPendingDistributorApproval(
    query: SearchPendingDistributorApprovalQuery
  ): Promise<PaginatedResponse<SaleOrderListDto>> {
    const response = await apiClient.post<SaleOrderListDtoPaginationResponseResult>(
      ENDPOINTS.SALE_ORDER.PENDING_DISTRIBUTOR_APPROVAL_SEARCH,
      query
    );

    if (!response.data?.succeeded) {
      throw new Error(
        response.data?.messages?.[0] || "Failed to search pending distributor approval orders"
      );
    }

    return response.data?.data || { data: [], pagination: {} };
  },

  /**
   * Approve an order as distributor (Stage 1 approval)
   */
  async distributorApprove(
    id: string,
    data: DistributorApproveRequest
  ): Promise<SaleOrderDetailDto | null> {
    const response = await apiClient.post<SaleOrderDetailDtoResult>(
      ENDPOINTS.SALE_ORDER.DISTRIBUTOR_APPROVE(id),
      data
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to approve sale order");
    }

    return response.data?.data || null;
  },

  /**
   * Reject an order as distributor (Stage 1 rejection)
   */
  async distributorReject(
    id: string,
    data: DistributorRejectRequest
  ): Promise<SaleOrderDetailDto | null> {
    const response = await apiClient.post<SaleOrderDetailDtoResult>(
      ENDPOINTS.SALE_ORDER.DISTRIBUTOR_REJECT(id),
      data
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to reject sale order");
    }

    return response.data?.data || null;
  },

  /**
   * Get dashboard summary for distributor
   */
  async getSummary(distributorId?: string): Promise<SaleOrderDashboardSummaryDto | null> {
    const response = await apiClient.get<SaleOrderDashboardSummaryDtoResult>(
      ENDPOINTS.SALE_ORDER.SUMMARY,
      {
        params: distributorId ? { distributorId } : undefined,
      }
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to fetch sale order summary");
    }

    return response.data?.data || null;
  },

  /**
   * Get order history/audit trail
   */
  async getHistory(id: string): Promise<unknown> {
    const response = await apiClient.get(ENDPOINTS.SALE_ORDER.HISTORY(id));

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to fetch sale order history");
    }

    return response.data?.data || null;
  },
};
