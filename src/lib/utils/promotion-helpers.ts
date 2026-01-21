import type { PromotionDetailDto, PromotionSlabDto } from "@/types";

/**
 * Result of greedy slab calculation
 */
export interface SlabCalculationResult {
  totalFreeUnits: number;
  slabBreakdown: Array<{
    slab: PromotionSlabDto;
    timesApplied: number;
    freeUnitsFromSlab: number;
  }>;
}

/**
 * Greedy algorithm to maximize free units from promotion slabs.
 * Uses the largest slabs first to get maximum benefit.
 *
 * Algorithm:
 * 1. Sort slabs by quantity in descending order (largest first)
 * 2. For each slab, apply it as many times as possible
 * 3. Reduce remaining quantity and move to next smaller slab
 * 4. Continue until no more slabs can be applied
 *
 * Example 1:
 * - Slabs: [Buy 10 → +2 free], [Buy 50 → +12 free]
 * - Quantity: 120
 * - Greedy allocation:
 *   - 2x (50 → +12) = 100 units used, +24 free
 *   - 2x (10 → +2) = 20 units used, +4 free
 * - Result: 28 total free units
 *
 * Example 2:
 * - Slabs: [Buy 5 → +1 free], [Buy 20 → +5 free], [Buy 100 → +30 free]
 * - Quantity: 235
 * - Greedy allocation:
 *   - 2x (100 → +30) = 200 units used, +60 free
 *   - 1x (20 → +5) = 20 units used, +5 free
 *   - 3x (5 → +1) = 15 units used, +3 free
 * - Result: 68 total free units
 */
export function calculateOptimalSlabAllocation(
  slabs: PromotionSlabDto[],
  quantity: number
): SlabCalculationResult {
  if (!slabs || slabs.length === 0 || quantity <= 0) {
    return { totalFreeUnits: 0, slabBreakdown: [] };
  }

  // Sort slabs by quantity descending (largest first) for greedy approach
  const sortedSlabs = [...slabs].sort((a, b) => b.quantity - a.quantity);

  let remainingQuantity = quantity;
  const breakdown: Array<{
    slab: PromotionSlabDto;
    timesApplied: number;
    freeUnitsFromSlab: number;
  }> = [];

  // Greedy: Apply largest slabs first
  for (const slab of sortedSlabs) {
    if (remainingQuantity >= slab.quantity) {
      const timesApplied = Math.floor(remainingQuantity / slab.quantity);
      const freeUnitsFromSlab = timesApplied * (slab.freeQuantity || 0);

      breakdown.push({
        slab,
        timesApplied,
        freeUnitsFromSlab,
      });

      remainingQuantity -= timesApplied * slab.quantity;
    }
  }

  const totalFreeUnits = breakdown.reduce((sum, item) => sum + item.freeUnitsFromSlab, 0);

  return { totalFreeUnits, slabBreakdown: breakdown };
}

/**
 * Determines the applicable promotion slab for a given quantity.
 * Returns the highest slab where quantity >= slab.quantity.
 *
 * @deprecated Use calculateOptimalSlabAllocation for greedy algorithm
 */
export function getApplicableSlab(
  slabs: PromotionSlabDto[],
  quantity: number
): PromotionSlabDto | null {
  if (!slabs || slabs.length === 0) return null;

  // Sort slabs by quantity ascending
  const sortedSlabs = [...slabs].sort((a, b) => a.quantity - b.quantity);

  // Find highest slab where quantity meets requirement
  let applicableSlab: PromotionSlabDto | null = null;

  for (const slab of sortedSlabs) {
    if (quantity >= slab.quantity) {
      applicableSlab = slab;
    } else {
      break; // No need to check higher slabs
    }
  }

  return applicableSlab;
}

/**
 * Validation result for promotion claim eligibility
 */
export interface PromotionValidationResult {
  canClaim: boolean;
  reason?: string;
}

/**
 * Validates if a promotion can be claimed by a distributor.
 * Checks various conditions like active status, dates, SKU/requirements availability.
 * Supports both slab-based promotions and Combo Offers.
 */
export function validatePromotionClaim(
  promotion: PromotionDetailDto | null | undefined
): PromotionValidationResult {
  if (!promotion) {
    return { canClaim: false, reason: "Promotion not found" };
  }

  // Check if promotion is active
  if (!promotion.isActive) {
    return { canClaim: false, reason: "This promotion is currently inactive" };
  }

  // Check if promotion has ended
  const endDate = new Date(promotion.endDate);
  if (new Date() > endDate) {
    return { canClaim: false, reason: "This promotion has expired" };
  }

  // Check if promotion has started
  const startDate = new Date(promotion.startDate);
  if (new Date() < startDate) {
    return { canClaim: false, reason: "This promotion hasn't started yet" };
  }

  // For Combo Offers, check if requirements exist
  if (promotion.promotionTypeName === "Combo Offer") {
    if (!promotion.requirements || promotion.requirements.length === 0) {
      return { canClaim: false, reason: "No requirements configured for this combo offer" };
    }
    return { canClaim: true };
  }

  // For slab-based promotions, check if SKU and slabs exist
  if (!promotion.skuId) {
    return { canClaim: false, reason: "No product is associated with this promotion" };
  }

  if (!promotion.slabs || promotion.slabs.length === 0) {
    return { canClaim: false, reason: "No quantity slabs configured for this promotion" };
  }

  return { canClaim: true };
}

/**
 * Gets the minimum quantity required to qualify for any slab
 */
export function getMinimumSlabQuantity(slabs: PromotionSlabDto[]): number {
  if (!slabs || slabs.length === 0) return 1;
  return Math.min(...slabs.map((s) => s.quantity));
}
