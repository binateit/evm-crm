import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  DistributorShippingAddressDto,
  CreateShippingAddressCommand,
  UpdateShippingAddressCommand,
  DistributorShippingAddressDtoResult,
  DistributorShippingAddressDtoListResult,
} from "@/types";
import type { BooleanResult } from "@/types/common";

export const shippingAddressService = {
  /**
   * Get all shipping addresses for a distributor
   */
  async getByDistributor(distributorId: string): Promise<DistributorShippingAddressDto[]> {
    try {
      const response = await apiClient.get<DistributorShippingAddressDtoListResult>(
        ENDPOINTS.SHIPPING_ADDRESS.BY_DISTRIBUTOR(distributorId)
      );

      if (!response.data?.succeeded) {
        console.error("Failed to fetch shipping addresses:", response.data?.messages?.[0]);
        return [];
      }

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching shipping addresses:", error);
      return [];
    }
  },

  /**
   * Get a shipping address by ID
   */
  async getById(id: string): Promise<DistributorShippingAddressDto | null> {
    try {
      const response = await apiClient.get<DistributorShippingAddressDtoResult>(
        ENDPOINTS.SHIPPING_ADDRESS.BY_ID(id)
      );

      if (!response.data?.succeeded) {
        console.error("Failed to fetch shipping address:", response.data?.messages?.[0]);
        return null;
      }

      return response.data?.data || null;
    } catch (error) {
      console.error("Error fetching shipping address:", error);
      return null;
    }
  },

  /**
   * Create a new shipping address
   */
  async create(data: CreateShippingAddressCommand): Promise<DistributorShippingAddressDto> {
    const response = await apiClient.post<DistributorShippingAddressDtoResult>(
      ENDPOINTS.SHIPPING_ADDRESS.CREATE,
      data
    );

    if (!response.data?.succeeded || !response.data.data) {
      throw new Error(response.data?.messages?.[0] || "Failed to create shipping address");
    }

    return response.data.data;
  },

  /**
   * Update an existing shipping address
   */
  async update(
    id: string,
    data: UpdateShippingAddressCommand
  ): Promise<DistributorShippingAddressDto> {
    const response = await apiClient.put<DistributorShippingAddressDtoResult>(
      ENDPOINTS.SHIPPING_ADDRESS.UPDATE(id),
      data
    );

    if (!response.data?.succeeded || !response.data.data) {
      throw new Error(response.data?.messages?.[0] || "Failed to update shipping address");
    }

    return response.data.data;
  },

  /**
   * Delete a shipping address
   */
  async delete(id: string, distributorId: string): Promise<void> {
    const response = await apiClient.delete<BooleanResult>(
      ENDPOINTS.SHIPPING_ADDRESS.DELETE(id, distributorId)
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to delete shipping address");
    }
  },

  /**
   * Set a shipping address as default
   */
  async setDefault(id: string, distributorId: string): Promise<void> {
    const response = await apiClient.put<BooleanResult>(
      ENDPOINTS.SHIPPING_ADDRESS.SET_DEFAULT(id, distributorId)
    );

    if (!response.data?.succeeded) {
      throw new Error(response.data?.messages?.[0] || "Failed to set default shipping address");
    }
  },
};
