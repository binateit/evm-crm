// Sale Order Validation Types

export type ValidationType = "credit_limit" | "allocation_quota" | "stock_quantity";
export type ValidationSeverity = "error" | "warning";

// Extended SKU Data with additional validation properties
export interface ExtendedSKUData {
  id: string;
  skuName: string | null;
  availableStock?: number;
  hasAllocation?: boolean;
  remainingAllocation?: number;
  [key: string]: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  validationType: ValidationType;
  severity: ValidationSeverity;
  message: string;
  skuId?: string;
  skuName?: string;
  requestedQuantity?: number;
  availableQuantity?: number;
}

export interface StockIssue {
  rowIndex: number;
  skuId: string;
  skuCode: string | null;
  skuName: string | null;
  requestedQuantity: number;
  availableStock: number;
}

export interface OrderValidationResult {
  canProceed: boolean;
  blockingErrors: ValidationResult[];
  stockIssues: StockIssue[];
  warnings: ValidationResult[];
}

// Credit limit validation request
export interface CreditLimitValidationRequest {
  distributorId: string;
  orderTotal: number;
  paymentType: "Credit" | "Advance";
}

// Stock quantity validation request
export interface StockQuantityValidationRequest {
  skuId: string;
  skuName: string | null;
  requestedQuantity: number;
}

// Allocation quota validation request
export interface AllocationQuotaValidationRequest {
  distributorId: string;
  skuId: string;
  skuName: string | null;
  requestedQuantity: number;
}
