import type { OrderItem } from "@/types";

/**
 * Calculate all derived fields for an order item
 * This function computes: subTotal, discountAmount, taxableAmount, tax amounts, and totalAmount
 */
export function calculateOrderItemFields(item: Partial<OrderItem>): {
  subTotal: number;
  discountAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxAmount: number;
  totalAmount: number;
} {
  const quantity = item.quantity || 0;
  const unitPrice = item.unitPrice || 0;
  const discountPercent = item.discountPercent || 0;
  const cgstPercent = item.cgstPercent || 0;
  const sgstPercent = item.sgstPercent || 0;
  const igstPercent = item.igstPercent || 0;

  // 1. Calculate subtotal (before discount)
  const subTotal = unitPrice * quantity;

  // 2. Calculate discount amount in currency
  const discountAmount = (subTotal * discountPercent) / 100;

  // 3. Calculate taxable amount (after discount, before tax)
  const taxableAmount = subTotal - discountAmount;

  // 4. Calculate individual tax amounts
  const cgstAmount = (taxableAmount * cgstPercent) / 100;
  const sgstAmount = (taxableAmount * sgstPercent) / 100;
  const igstAmount = (taxableAmount * igstPercent) / 100;

  // 5. Calculate total tax amount
  const taxAmount = cgstAmount + sgstAmount + igstAmount;

  // 6. Calculate final total amount
  const totalAmount = taxableAmount + taxAmount;

  return {
    subTotal,
    discountAmount,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    taxAmount,
    totalAmount,
  };
}

/**
 * Apply calculated fields to an order item
 * Returns a new OrderItem with all calculated fields updated
 */
export function applyCalculations(item: OrderItem): OrderItem {
  const calculations = calculateOrderItemFields(item);
  return {
    ...item,
    ...calculations,
  };
}
