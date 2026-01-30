import type { DistributorDto, DistributorForSaleOrderDto } from "@/types";
import type {
  ValidationResult,
  StockIssue,
  OrderValidationResult,
} from "@/types/sale-order-validation.types";

// Extended SKU type that includes allocation and stock fields
interface ExtendedSKUData {
  id: string;
  skuName: string | null;
  availableStock?: number;
  hasAllocation?: boolean;
  remainingAllocation?: number;
  [key: string]: unknown;
}

interface OrderItem {
  sku: ExtendedSKUData;
  quantity: number;
  rowIndex: number;
}

/**
 * Validate credit limit - only applies to "Credit" payment type
 * Credit Limit = 0 means unlimited credit, skip validation
 */
export function validateCreditLimit(
  distributor: DistributorDto | DistributorForSaleOrderDto,
  orderTotal: number,
  paymentType: string
): ValidationResult {
  // Credit limit only applies to Credit payment type
  if (paymentType !== "Credit") {
    return {
      isValid: true,
      validationType: "credit_limit",
      severity: "error",
      message: "",
    };
  }

  // Credit Limit = 0 means unlimited credit, skip validation
  if (!distributor.creditLimit || distributor.creditLimit === 0) {
    return {
      isValid: true,
      validationType: "credit_limit",
      severity: "error",
      message: "",
    };
  }

  const availableCredit = distributor.creditLimit - distributor.outstandingBalance;

  if (orderTotal > availableCredit) {
    return {
      isValid: false,
      validationType: "credit_limit",
      severity: "error",
      message: `Credit limit exceeded. Order total: ₹${orderTotal.toLocaleString(
        "en-IN"
      )}, Available credit: ₹${availableCredit.toLocaleString("en-IN")}. Please contact your account manager.`,
      requestedQuantity: orderTotal,
      availableQuantity: availableCredit,
    };
  }

  return {
    isValid: true,
    validationType: "credit_limit",
    severity: "error",
    message: "",
  };
}

/**
 * Validate stock quantity
 */
export function validateStockQuantity(
  sku: ExtendedSKUData,
  requestedQuantity: number
): ValidationResult {
  const availableStock = sku.availableStock ?? 0;

  if (requestedQuantity > availableStock) {
    return {
      isValid: false,
      validationType: "stock_quantity",
      severity: "warning",
      message: `${sku.skuName}: Insufficient stock. Requested: ${requestedQuantity}`,
      skuId: sku.id,
      skuName: sku.skuName || undefined,
      requestedQuantity,
      availableQuantity: availableStock,
    };
  }

  return {
    isValid: true,
    validationType: "stock_quantity",
    severity: "warning",
    message: "",
  };
}

/**
 * Validate allocation quota for distributor
 */
export function validateAllocationQuota(
  sku: ExtendedSKUData,
  requestedQuantity: number
): ValidationResult {
  // If SKU is not under allocation, validation passes
  if (!sku.hasAllocation) {
    return {
      isValid: true,
      validationType: "allocation_quota",
      severity: "error",
      message: "",
    };
  }

  const remainingAllocation = sku.remainingAllocation ?? 0;

  if (requestedQuantity > remainingAllocation) {
    return {
      isValid: false,
      validationType: "allocation_quota",
      severity: "error",
      message: `${sku.skuName}: Allocation quota exceeded. Requested: ${requestedQuantity}, Available quota: ${remainingAllocation}. Order cannot be created.`,
      skuId: sku.id,
      skuName: sku.skuName || undefined,
      requestedQuantity,
      availableQuantity: remainingAllocation,
    };
  }

  return {
    isValid: true,
    validationType: "allocation_quota",
    severity: "error",
    message: "",
  };
}

/**
 * Main validation orchestrator for entire order
 */
export function validateOrder(
  distributorDetails: DistributorDto | DistributorForSaleOrderDto,
  items: OrderItem[],
  orderTotal: number,
  paymentType: string
): OrderValidationResult {
  const blockingErrors: ValidationResult[] = [];
  const stockIssues: StockIssue[] = [];
  const warnings: ValidationResult[] = [];

  // 1. Validate credit limit (order-level)
  const creditCheck = validateCreditLimit(distributorDetails, orderTotal, paymentType);
  if (!creditCheck.isValid) {
    blockingErrors.push(creditCheck);
  }

  // 2. Validate each item
  for (const item of items) {
    // Allocation quota check (blocking error)
    const quotaCheck = validateAllocationQuota(item.sku, item.quantity);
    if (!quotaCheck.isValid) {
      blockingErrors.push(quotaCheck);
    }

    // Stock quantity check (warning with special handling)
    const stockCheck = validateStockQuantity(item.sku, item.quantity);
    if (!stockCheck.isValid) {
      stockIssues.push({
        rowIndex: item.rowIndex,
        skuId: item.sku.id,
        skuCode: null, // Can be added if available in SKU data
        skuName: item.sku.skuName,
        requestedQuantity: item.quantity,
        availableStock: item.sku.availableStock ?? 0,
      });
      warnings.push(stockCheck);
    }
  }

  return {
    canProceed: blockingErrors.length === 0,
    blockingErrors,
    stockIssues,
    warnings,
  };
}
