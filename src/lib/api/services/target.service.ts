import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";

export interface TargetItem {
  id: string;
  targetId: string;
  skuId: string;
  skuCode?: string;
  skuName?: string;
  targetAmount: number;
  incentiveValue: number;
  mandatoryCreditNote: boolean;
}

export interface Target {
  id: string;
  targetHolderId: string;
  targetHolderRole: number;
  targetHolderName?: string;
  startDate: string;
  endDate: string;
  status: number;
  targetItems: TargetItem[];
  totalTargetAmount: number;
  totalIncentiveValue: number;
  createdOn: string;
  createdBy: string;
  lastModifiedOn: string;
  lastModifiedBy?: string;
}

export const targetService = {
  /**
   * Get targets assigned to the current distributor
   */
  getMyTargets: (distributorId: string) =>
    apiClient.get<{ succeeded: boolean; data: Target[] }>(
      ENDPOINTS.TARGET.MY_TARGETS(distributorId)
    ),

  /**
   * Get target details by ID
   */
  getById: (id: string) =>
    apiClient.get<{ succeeded: boolean; data: Target }>(ENDPOINTS.TARGET.BY_ID(id)),
};
