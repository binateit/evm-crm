import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/common/pagination.types";
import type {
  DistributorStockSubmissionDetailDto,
  DistributorStockSubmissionListDto,
  SearchMyStockSubmissionsQuery,
  CreateDistributorStockSubmissionCommand,
  UpdateDistributorStockSubmissionCommand,
  DistributorStockSubmissionDetailDtoResult,
  DistributorStockSubmissionListDtoPaginationResponseResult,
  GuidResult,
} from "@/types";

export const distributorStockSubmissionService = {
  /**
   * Get my stock submissions (logged-in distributor)
   */
  async getMySubmissions(
    query: SearchMyStockSubmissionsQuery
  ): Promise<PaginatedResponse<DistributorStockSubmissionListDto>> {
    try {
      const response =
        await apiClient.post<DistributorStockSubmissionListDtoPaginationResponseResult>(
          ENDPOINTS.DISTRIBUTOR_STOCK_SUBMISSION.MY_SUBMISSIONS,
          {
            pageNumber: query.pageNumber || 1,
            pageSize: query.pageSize || 10,
            ...query,
          }
        );

      const defaultPagination = {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        pageSize: 10,
        hasPreviousPage: false,
        hasNextPage: false,
      };

      if (!response.data?.succeeded) {
        return { data: [], pagination: defaultPagination };
      }

      return response.data?.data || { data: [], pagination: defaultPagination };
    } catch (error) {
      console.error("Error fetching my submissions:", error);
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          pageSize: 10,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
    }
  },

  /**
   * Get my submission by ID
   */
  async getMySubmissionById(id: string): Promise<DistributorStockSubmissionDetailDto | null> {
    try {
      const response = await apiClient.get<DistributorStockSubmissionDetailDtoResult>(
        ENDPOINTS.DISTRIBUTOR_STOCK_SUBMISSION.MY_SUBMISSION_BY_ID(id)
      );

      if (!response.data?.succeeded) {
        console.error("Failed to fetch submission:", response.data?.messages?.[0]);
        return null;
      }

      return response.data?.data || null;
    } catch (error) {
      console.error("Error fetching submission:", error);
      return null;
    }
  },

  /**
   * Create a new stock submission
   */
  async createMySubmission(data: CreateDistributorStockSubmissionCommand): Promise<string> {
    const response = await apiClient.post<GuidResult>(
      ENDPOINTS.DISTRIBUTOR_STOCK_SUBMISSION.CREATE,
      data
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to create stock submission");
    }

    return response.data?.data || "";
  },

  /**
   * Update an existing stock submission (draft only)
   */
  async updateMySubmission(
    id: string,
    data: UpdateDistributorStockSubmissionCommand
  ): Promise<string> {
    const response = await apiClient.put<GuidResult>(
      ENDPOINTS.DISTRIBUTOR_STOCK_SUBMISSION.UPDATE(id),
      data
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to update stock submission");
    }

    return response.data?.data || "";
  },

  /**
   * Delete a stock submission (draft only)
   */
  async deleteMySubmission(id: string): Promise<void> {
    const response = await apiClient.delete<GuidResult>(
      ENDPOINTS.DISTRIBUTOR_STOCK_SUBMISSION.DELETE(id)
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to delete stock submission");
    }
  },

  /**
   * Submit a draft stock submission
   */
  async submitMySubmission(id: string): Promise<void> {
    const response = await apiClient.post<GuidResult>(
      ENDPOINTS.DISTRIBUTOR_STOCK_SUBMISSION.SUBMIT(id),
      {}
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to submit stock submission");
    }
  },

  /**
   * Get my stock submission history
   */
  async getMyHistory(query: SearchMyStockSubmissionsQuery): Promise<unknown> {
    try {
      const response = await apiClient.post(
        ENDPOINTS.DISTRIBUTOR_STOCK_SUBMISSION.MY_HISTORY,
        query
      );

      if (!response.data?.succeeded) {
        return { data: [], pagination: {} };
      }

      return response.data?.data || { data: [], pagination: {} };
    } catch (error) {
      console.error("Error fetching history:", error);
      return { data: [], pagination: {} };
    }
  },
};
