import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Result } from "@/types/common";

export interface RoleDropdownDto {
  id: string;
  name: string;
}

export const roleService = {
  /**
   * Get distributor roles for dropdown
   * Returns only "Distributor Admin" and "Distributor Contact" roles
   */
  async getDistributorRoles(): Promise<RoleDropdownDto[]> {
    try {
      const response = await apiClient.get<Result<RoleDropdownDto[]>>(
        ENDPOINTS.ROLE.DISTRIBUTOR_ROLES
      );

      if (!response.data?.succeeded) {
        console.error("Failed to fetch roles:", response.data?.messages?.[0]);
        return [];
      }

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching roles:", error);
      return [];
    }
  },
};
