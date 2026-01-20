// CRM Module Types for Distributor Portal
import type { Result, PaginatedResponse } from "@/types/common";

// ============ Distributor Types ============

export interface DistributorDto {
  id: string;
  distributorCode: string | null;
  distributorName: string | null;
  contactPerson: string | null;
  emailAddress: string | null;
  mobileNumber: string | null;
  alternatePhone: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  billingAddress1: string | null;
  billingAddress2: string | null;
  billingCity: string | null;
  billingStateId: number | null;
  billingDistrictId: number | null;
  billingPincode: string | null;
  creditLimit: number;
  creditDays: number;
  outstandingBalance: number;
  isActive: boolean;
  category: string | null;
  easyEcomCustomerId: number | null;
  gstRegistrationTypeId: number | null;
  gstRegistrationTypeName: string | null;
  discountTypeId: number | null;
  discountTypeName: string | null;
  openingBalance: number;
  primarySalespersonId: string | null;
  primarySalespersonName: string | null;
  secondarySalespersonId: string | null;
  secondarySalespersonName: string | null;
}

export interface DistributorDropdownDto {
  id: string;
  distributorCode: string | null;
  distributorName: string | null;
}

// ============ Distributor Shipping Address Types ============

export interface DistributorShippingAddressDto {
  id: string;
  distributorId: string;
  addressName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  stateId: number | null;
  stateName: string | null;
  districtId: number | null;
  districtName: string | null;
  pincode: string | null;
  isDefault: boolean;
}

export interface CreateShippingAddressCommand {
  distributorId: string;
  addressName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  stateId: number | null;
  districtId: number | null;
  pincode: string | null;
  isDefault: boolean;
}

export interface UpdateShippingAddressCommand {
  addressName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  stateId: number | null;
  districtId: number | null;
  pincode: string | null;
}

// ============ Sale Order Types ============

export interface SaleOrderDetailDto {
  id: string;
  orderNumber: string | null;
  orderDate: string;
  expectedDeliveryDate: string | null;
  distributorId: string;
  distributorName: string | null;
  distributorCode: string | null;
  shippingAddress: string | null;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  statusId: number;
  statusName: string | null;
  salespersonId: string | null;
  salespersonName: string | null;
  submittedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  notes: string | null;

  // Two-stage approval fields
  distributorApprovedBy: string | null;
  distributorApprovedAt: string | null;
  creatorUserId: string | null;
  creatorRole: string | null;

  // Additional fields
  deliveryLocation: string | null;
  deliveryLocationId: string | null;
  paymentType: string | null; // "Credit" or "Advance"
  retailerName: string | null;
  easyEcomOrderId: number | null;

  items: SaleOrderItemDto[] | null;
  createdOn: string;
  createdBy: string;
  lastModifiedOn: string | null;
}

export interface SaleOrderListDto {
  id: string;
  orderNumber: string | null;
  orderDate: string;
  distributorId: string;
  distributorName: string | null;
  distributorCode: string | null;
  statusId: number;
  statusName: string | null;
  itemCount: number;
  totalAmount: number;
  expectedDeliveryDate: string | null;
  salespersonId: string | null;
  salespersonName: string | null;
  easyEcomOrderId: number | null;
  paymentType: string | null;
  distributorApprovedAt: string | null;
  createdOn: string;
}

export interface SaleOrderItemDto {
  id: string;
  skuId: string;
  skuCode: string | null;
  skuName: string | null;
  partCode?: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  gstPercent?: number;
  hsnCode?: string | null;
  lineTotal: number;

  // Enhanced fields for stock management
  stockAtTimeOfOrder: number;
  inTransit: number | null;
  backOrderQuantity: number | null;
  etd: string | null;
  billWhenStockArrives: boolean;
  isOfferItem: boolean;
  specialRate: number | null;
  baseSchemeQuantity: number | null;
  remarks: string | null;
}

// Distributor approval requests
export interface DistributorApproveRequest {
  distributorId: string;
}

export interface DistributorRejectRequest {
  distributorId: string;
  rejectionReason: string;
}

export interface SearchSaleOrdersQuery {
  keyword?: string | null;
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string | null;
  distributorId?: string | null;
  salespersonId?: string | null;
  statusId?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
}

// Search queries for distributor approval stage
export interface SearchPendingDistributorApprovalQuery {
  pageNumber?: number;
  pageSize?: number;
  distributorId?: string | null;
  distributorName?: string | null;
  orderNumber?: string | null;
  fromOrderDate?: string | null;
  toOrderDate?: string | null;
  salespersonId?: string | null;
  paymentType?: string | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  fromExpectedDeliveryDate?: string | null;
  toExpectedDeliveryDate?: string | null;
  retailerName?: string | null;
}

// Dashboard summary
export interface SaleOrderDashboardSummaryDto {
  pendingDistributorApprovalCount: number;
  pendingFinalApprovalCount: number;
  distributorRejectedCount: number;
  approvedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  draftCount: number;
  shippedCount: number;
  deliveredCount: number;
  completedCount: number;
  totalCount: number;
  totalOrders: number;
  totalOrderValue: number;
  totalApprovedValue: number;
  totalPendingValue: number;
  averageOrderValue: number;
}

// Sale Order Status enum
export enum SaleOrderStatus {
  Draft = 1,
  PendingDistributorApproval = 2,
  DistributorApproved = 3,
  Approved = 4,
  Rejected = 5,
  Cancelled = 6,
  Shipped = 7,
  Delivered = 8,
  Completed = 9,
}

// ============ Promotion Types ============

export interface PromotionTypeDto {
  id: number;
  name: string;
}

export interface PromotionDto {
  id: string;
  promotionCode: string;
  promotionName: string;
  description?: string | null;
  promotionTypeId: number;
  promotionTypeName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  canStackWithOthers: boolean;
  currentUsageCount: number;
  maxTotalUsage?: number | null;
}

export interface PromotionSlabDto {
  id: string;
  fromQuantity: number;
  toQuantity?: number | null;
  freeQuantity?: number | null;
  discountPercent?: number | null;
  specialRate?: number | null;
}

export interface PromotionRequirementDto {
  id: string;
  requirementType: string;
  skuId: string;
  skuCode?: string | null;
  skuName?: string | null;
  requiredQuantity: number;
  displayOrder: number;
}

export interface PromotionDetailDto extends PromotionDto {
  brandId?: string | null;
  brandName?: string | null;
  masterCategoryId?: string | null;
  masterCategoryName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  subCategoryId?: string | null;
  subCategoryName?: string | null;
  applicableToSKUIds?: string[] | null;
  skuCode?: string | null;
  skuName?: string | null;
  minimumQuantity?: number | null;
  minimumOrderValue?: number | null;
  applicableToDistributorIds?: string[] | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  maxDiscountAmount?: number | null;
  maxUsagePerDistributor?: number | null;
  slabs: PromotionSlabDto[];
  requirements: PromotionRequirementDto[];
}

// Query types
export interface SearchPromotionsQuery {
  keyword?: string | null;
  isActive?: boolean | null;
  promotionTypeId?: number | null;
  brandId?: string | null;
  categoryId?: string | null;
  activeOnDate?: string | null;
  pageNumber?: number;
  pageSize?: number;
}

// Pagination response type
export interface PromotionPaginationResponse {
  data: PromotionDto[];
  pagination: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

// ============ Audit Log Types ============

export interface PropertyChange {
  propertyName: string | null;
  oldValue: string | null;
  newValue: string | null;
}

export interface AuditLogDto {
  id: string;
  userId: string;
  userName: string | null;
  action: string | null;
  entityType: string | null;
  entityId: string;
  description: string | null;
  oldValues: string | null;
  newValues: string | null;
  changes: PropertyChange[] | null;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
}

// ============ Dropdown Types ============

export interface StateDto {
  id: number;
  name: string;
  code: string;
}

export interface DistrictDto {
  id: number;
  name: string;
  stateId: number;
}

export interface BrandDropdownDto {
  id: string;
  name: string;
}

export interface CategoryDropdownDto {
  id: string;
  name: string;
}

// ============ Result Wrappers ============

export type DistributorDtoResult = Result<DistributorDto>;
export type DistributorDropdownDtoListResult = Result<DistributorDropdownDto[]>;

export type DistributorShippingAddressDtoResult = Result<DistributorShippingAddressDto>;
export type DistributorShippingAddressDtoListResult = Result<DistributorShippingAddressDto[]>;

export type SaleOrderDetailDtoResult = Result<SaleOrderDetailDto>;
export type SaleOrderListDtoPaginationResponse = PaginatedResponse<SaleOrderListDto>;
export type SaleOrderListDtoPaginationResponseResult = Result<SaleOrderListDtoPaginationResponse>;
export type SaleOrderDashboardSummaryDtoResult = Result<SaleOrderDashboardSummaryDto>;

export type PromotionDtoResult = Result<PromotionDto>;
export type PromotionDetailDtoResult = Result<PromotionDetailDto>;
export type PromotionDtoListResult = Result<PromotionDto[]>;
export type PromotionPaginationResponseResult = Result<PromotionPaginationResponse>;
export type PromotionTypeDtoListResult = Result<PromotionTypeDto[]>;

export type AuditLogDtoListResult = Result<AuditLogDto[]>;

export type StateDtoListResult = Result<StateDto[]>;
export type DistrictDtoListResult = Result<DistrictDto[]>;
export type BrandDropdownDtoListResult = Result<BrandDropdownDto[]>;
export type CategoryDropdownDtoListResult = Result<CategoryDropdownDto[]>;

export type GuidResult = Result<string>;
