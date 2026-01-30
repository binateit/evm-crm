import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type {
  DistributorContactDto,
  DistributorContactDtoListResult,
  DistributorContactDtoResult,
  CreateDistributorContactCommand,
  UpdateDistributorContactCommand,
  GuidResult,
} from "@/types/crm-types";
import type { BooleanResult } from "@/types/common";

export const distributorContactService = {
  /**
   * Get all contacts for a specific distributor
   */
  async getByDistributor(distributorId: string): Promise<DistributorContactDto[]> {
    try {
      const response = await apiClient.get<DistributorContactDtoListResult>(
        ENDPOINTS.DISTRIBUTOR_CONTACT.BY_DISTRIBUTOR(distributorId)
      );

      if (!response.data?.succeeded) {
        console.error("Failed to fetch contacts:", response.data?.messages?.[0]);
        return [];
      }

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
  },

  /**
   * Get a single contact by ID
   */
  async getById(contactId: string): Promise<DistributorContactDto | null> {
    try {
      const response = await apiClient.get<DistributorContactDtoResult>(
        ENDPOINTS.DISTRIBUTOR_CONTACT.BY_ID(contactId)
      );

      if (!response.data?.succeeded) {
        console.error("Failed to fetch contact:", response.data?.messages?.[0]);
        return null;
      }

      return response.data?.data || null;
    } catch (error) {
      console.error("Error fetching contact:", error);
      return null;
    }
  },

  /**
   * Create a new distributor contact
   */
  async create(data: CreateDistributorContactCommand): Promise<string> {
    const response = await apiClient.post<GuidResult>(ENDPOINTS.DISTRIBUTOR_CONTACT.CREATE, data);

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to create contact");
    }

    return response.data?.data || "";
  },

  /**
   * Update an existing distributor contact
   */
  async update(contactId: string, data: UpdateDistributorContactCommand): Promise<string> {
    const response = await apiClient.put<GuidResult>(
      ENDPOINTS.DISTRIBUTOR_CONTACT.UPDATE(contactId),
      data
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to update contact");
    }

    return response.data?.data || "";
  },

  /**
   * Delete a distributor contact (soft delete)
   */
  async delete(contactId: string): Promise<void> {
    const response = await apiClient.delete<BooleanResult>(
      ENDPOINTS.DISTRIBUTOR_CONTACT.DELETE(contactId)
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to delete contact");
    }
  },

  /**
   * Reset password for a distributor contact
   */
  async resetPassword(contactId: string, newPassword: string): Promise<boolean> {
    const response = await apiClient.post<BooleanResult>(
      ENDPOINTS.DISTRIBUTOR_CONTACT.RESET_PASSWORD(contactId),
      { newPassword }
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to reset password");
    }

    return response.data?.data || false;
  },
};
