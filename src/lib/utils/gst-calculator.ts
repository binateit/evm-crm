export type GSTType = "INTRA" | "INTER";

export interface GSTCalculation {
  type: GSTType;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGSTAmount: number;
}

/**
 * Determine GST type based on billing and shipping states
 * Rule: If billing state = "Maharashtra" AND shipping state = "Maharashtra" → Intra, else → Inter
 */
export function determineGSTType(
  billingState: string | null,
  shippingState: string | null
): GSTType {
  const normalizedBillingState = billingState?.trim().toLowerCase();
  const normalizedShippingState = shippingState?.trim().toLowerCase();

  if (normalizedBillingState === "maharashtra" && normalizedShippingState === "maharashtra") {
    return "INTRA";
  }

  return "INTER";
}

/**
 * Calculate GST amounts based on taxable amount and GST type
 */
export function calculateGST(taxableAmount: number, gstType: GSTType): GSTCalculation {
  if (gstType === "INTRA") {
    const cgstPercent = 9;
    const sgstPercent = 9;
    const cgstAmount = (taxableAmount * cgstPercent) / 100;
    const sgstAmount = (taxableAmount * sgstPercent) / 100;

    return {
      type: "INTRA",
      cgstPercent,
      sgstPercent,
      igstPercent: 0,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      totalGSTAmount: cgstAmount + sgstAmount,
    };
  } else {
    const igstPercent = 18;
    const igstAmount = (taxableAmount * igstPercent) / 100;

    return {
      type: "INTER",
      cgstPercent: 0,
      sgstPercent: 0,
      igstPercent,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount,
      totalGSTAmount: igstAmount,
    };
  }
}
