import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  StateDto,
  DistrictDto,
  BrandDropdownDto,
  CategoryDropdownDto,
  StateDtoListResult,
  DistrictDtoListResult,
  BrandDropdownDtoListResult,
  CategoryDropdownDtoListResult,
} from "@/types/crm";

export const dropdownService = {
  /**
   * Get list of brands for dropdown
   */
  async getBrands(): Promise<BrandDropdownDto[]> {
    try {
      const response = await apiClient.get<BrandDropdownDtoListResult>(ENDPOINTS.DROPDOWN.BRANDS);

      if (!response.data?.succeeded) {
        console.error("Failed to fetch brands:", response.data?.messages?.[0]);
        return [];
      }

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching brands:", error);
      return [];
    }
  },

  /**
   * Get list of master categories for dropdown
   */
  async getMasterCategories(): Promise<CategoryDropdownDto[]> {
    try {
      const response = await apiClient.get<CategoryDropdownDtoListResult>(
        ENDPOINTS.DROPDOWN.MASTER_CATEGORIES
      );

      if (!response.data?.succeeded) {
        console.error("Failed to fetch master categories:", response.data?.messages?.[0]);
        return [];
      }

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching master categories:", error);
      return [];
    }
  },

  /**
   * Get list of categories for dropdown
   */
  async getCategories(): Promise<CategoryDropdownDto[]> {
    try {
      const response = await apiClient.get<CategoryDropdownDtoListResult>(
        ENDPOINTS.DROPDOWN.CATEGORIES
      );

      if (!response.data?.succeeded) {
        console.error("Failed to fetch categories:", response.data?.messages?.[0]);
        return [];
      }

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  /**
   * Get list of sub-categories for dropdown
   */
  async getSubCategories(): Promise<CategoryDropdownDto[]> {
    try {
      const response = await apiClient.get<CategoryDropdownDtoListResult>(
        ENDPOINTS.DROPDOWN.SUB_CATEGORIES
      );

      if (!response.data?.succeeded) {
        console.error("Failed to fetch sub-categories:", response.data?.messages?.[0]);
        return [];
      }

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
      return [];
    }
  },

  /**
   * Get list of states for dropdown
   */
  async getStates(): Promise<StateDto[]> {
    try {
      const response = await apiClient.get<StateDtoListResult>(ENDPOINTS.DROPDOWN.STATES);

      if (!response.data?.succeeded) {
        console.error("Failed to fetch states:", response.data?.messages?.[0]);
        return [];
      }

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching states:", error);
      return [];
    }
  },

  /**
   * Get list of districts for dropdown
   */
  async getDistricts(): Promise<DistrictDto[]> {
    try {
      const response = await apiClient.get<DistrictDtoListResult>(ENDPOINTS.DROPDOWN.DISTRICTS);

      if (!response.data?.succeeded) {
        console.error("Failed to fetch districts:", response.data?.messages?.[0]);
        return [];
      }

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching districts:", error);
      return [];
    }
  },

  /**
   * Get districts by state ID
   */
  async getDistrictsByState(stateId: number): Promise<DistrictDto[]> {
    try {
      const response = await apiClient.get<DistrictDtoListResult>(ENDPOINTS.DROPDOWN.DISTRICTS, {
        params: { stateId },
      });

      if (!response.data?.succeeded) {
        console.error("Failed to fetch districts:", response.data?.messages?.[0]);
        return [];
      }

      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching districts:", error);
      return [];
    }
  },
};
