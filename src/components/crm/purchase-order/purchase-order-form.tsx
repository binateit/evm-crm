"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import { saleOrderSchema, type SaleOrderFormData } from "@/lib/validations/crm";
import {
  distributorService,
  dropdownService,
  skuService,
  promotionService,
} from "@/lib/api/services";
import { applyCalculations } from "@/lib/utils/order-calculations";
import { calculateOptimalSlabAllocation } from "@/lib/utils/promotion-helpers";
import type { PromotionDetailDto } from "@/types";
import type { OrderValidationResult, OrderItem } from "@/types";
import { PurchaseOrderHeader } from "./purchase-order-header";
import { PurchaseOrderItemsTableV2 } from "./purchase-order-items-table-v2";
import { PurchaseOrderFooter } from "./purchase-order-footer";
import { PurchaseOrderValidationDialog } from "./purchase-order-validation-dialog";
import { StockConfirmationDialog } from "./stock-confirmation-dialog";
import { validateOrder } from "@/lib/utils/sale-order-validations";
import { determineGSTType } from "@/lib/utils/gst-calculator";
import { useToast } from "@/lib/contexts/toast-context";

export interface PromotionClaimData {
  promotionId: string;
  promotionCode: string;
  skuId: string;
  quantity: number;
  freeQuantity: number;
}

interface PurchaseOrderFormProps {
  onSubmit: (data: SaleOrderFormData, isDraft?: boolean) => Promise<void>;
  isSubmitting?: boolean;
  initialPromotionClaim?: PromotionClaimData | null;
}

export function PurchaseOrderForm({
  onSubmit,
  isSubmitting,
  initialPromotionClaim,
}: PurchaseOrderFormProps) {
  const toast = useToast();

  // Validation dialogs
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showStockConfirmDialog, setShowStockConfirmDialog] = useState(false);
  const [validationResult, setValidationResult] = useState<OrderValidationResult | null>(null);

  // Store promotion details for recalculation
  const [promotionDetails, setPromotionDetails] = useState<PromotionDetailDto | null>(null);

  // Fetch distributor details (includes shipping addresses, billing address, credit info)
  const { data: distributorDetails, isLoading: loadingDistributorDetails } = useQuery({
    queryKey: ["distributor-for-sale-order"],
    queryFn: () => distributorService.getForSaleOrder(),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch payment types from API
  const { data: paymentTypes = [], isLoading: loadingPaymentTypes } = useQuery({
    queryKey: ["payment-types"],
    queryFn: () => dropdownService.getPaymentTypes(),
    staleTime: 30 * 60 * 1000,
  });

  // Fetch promotion and SKU details for promotion claim initialization
  const {
    data: promotionClaimData,
    isLoading: loadingPromotionClaim,
    error: promotionClaimError,
  } = useQuery({
    queryKey: ["promotion-claim-init", initialPromotionClaim?.promotionId],
    queryFn: async () => {
      if (!initialPromotionClaim?.promotionId) return null;

      const promotion = await promotionService.getById(initialPromotionClaim.promotionId);
      if (!promotion) throw new Error("Promotion not found");

      // Determine promotion type by checking slabs vs requirements
      const isSlabWise = promotion.slabs && promotion.slabs.length > 0;
      const isCombo = promotion.requirements && promotion.requirements.length > 0;

      if (isSlabWise) {
        // Slab-wise: fetch single SKU from promotion or claim data
        const skuId = initialPromotionClaim.skuId || promotion.skuId;
        if (!skuId) throw new Error("SKU not specified for slab promotion");

        const skuDetails = await skuService.getSkuDetails(skuId);
        if (!skuDetails) throw new Error("SKU not found");

        // SECURITY: Recalculate free quantity from slabs - never trust URL params
        const slabResult = calculateOptimalSlabAllocation(
          promotion.slabs,
          initialPromotionClaim.quantity
        );

        return {
          type: "slab" as const,
          promotion,
          skuDetails,
          quantity: initialPromotionClaim.quantity,
          freeQuantity: slabResult.totalFreeUnits,
          promotionCode: initialPromotionClaim.promotionCode,
        };
      } else if (isCombo) {
        // Combo: fetch all SKUs from requirements
        console.log("Combo promotion requirements:", promotion.requirements);
        const purchaseReqs = promotion.requirements.filter(
          (r) => r.requirementTypeName === "Purchase"
        );
        const benefitReqs = promotion.requirements.filter(
          (r) => r.requirementTypeName === "Benefit"
        );
        console.log("Purchase requirements:", purchaseReqs);
        console.log("Benefit requirements:", benefitReqs);

        // Fetch all SKU details in parallel
        const allSkuIds = [...purchaseReqs, ...benefitReqs]
          .map((r) => r.skuId)
          .filter((id): id is string => !!id);

        const skuDetailsMap = new Map<
          string,
          Awaited<ReturnType<typeof skuService.getSkuDetails>>
        >();
        const skuResults = await Promise.all(allSkuIds.map((id) => skuService.getSkuDetails(id)));
        allSkuIds.forEach((id, i) => {
          if (skuResults[i]) skuDetailsMap.set(id, skuResults[i]);
        });

        return {
          type: "combo" as const,
          promotion,
          purchaseRequirements: purchaseReqs,
          benefitRequirements: benefitReqs,
          skuDetailsMap,
          promotionCode: initialPromotionClaim.promotionCode,
        };
      }

      throw new Error("Invalid promotion: no slabs or requirements configured");
    },
    enabled: !!initialPromotionClaim?.promotionId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Get delivery locations from distributor details
  const deliveryLocations = distributorDetails?.shippingAddresses || [];

  // Form setup - only for header fields, items managed separately
  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SaleOrderFormData>({
    resolver: zodResolver(saleOrderSchema),
    defaultValues: {
      deliveryLocationId: "",
      paymentTypeId: 0,
      items: [],
    },
  });

  // Auto-select shipping address when delivery locations are loaded
  useEffect(() => {
    if (deliveryLocations.length > 0 && !watch("deliveryLocationId")) {
      // Find default address or use first one
      const defaultAddress = deliveryLocations.find((addr) => addr.isDefault);
      const addressToSelect = defaultAddress || deliveryLocations[0];
      if (addressToSelect) {
        setValue("deliveryLocationId", addressToSelect.id);
      }
    }
  }, [deliveryLocations, setValue, watch]);

  // Watch for changes - single source of truth from form state
  const selectedPaymentTypeId = watch("paymentTypeId");
  const selectedDeliveryLocationId = watch("deliveryLocationId");
  const items = watch("items") || [];

  // Get selected delivery location
  const selectedDeliveryLocation = deliveryLocations.find(
    (addr: { id: string }) => addr.id === selectedDeliveryLocationId
  );

  // Derive GST type from billing and shipping states
  const gstType = useMemo(() => {
    if (!distributorDetails || !selectedDeliveryLocation) return "INTER" as const;
    const billingState = distributorDetails.billingStateName || null;
    const shippingState = selectedDeliveryLocation.stateName || null;
    return determineGSTType(billingState, shippingState);
  }, [distributorDetails, selectedDeliveryLocation]);

  // Track if promotion items have been initialized (one-time operation)
  const promotionInitialized = useRef(false);

  // Derive initial items from promotion claim data
  const promotionInitialItems = useMemo(() => {
    if (!promotionClaimData) return null;

    // Helper to build an order item
    const buildOrderItem = (
      skuDetails: NonNullable<Awaited<ReturnType<typeof skuService.getSkuDetails>>>,
      quantity: number,
      isFree: boolean,
      promotionId: string,
      promotionCode: string,
      claimedFreeQty: number
    ): OrderItem => {
      const unitPrice = isFree ? 0.01 : skuDetails.sellingPrice || skuDetails.unitPrice || 0;
      const pdc = skuDetails.pdc || 0;
      const cdc = skuDetails.cdc || 0;
      const discountPercent = isFree ? 0 : selectedPaymentTypeId === 2 ? cdc : pdc; // 2 = Advance

      return {
        rowId: crypto.randomUUID(),
        skuId: skuDetails.id,
        skuName: skuDetails.skuName,
        skuCode: skuDetails.skuCode,
        sellingPrice: skuDetails.sellingPrice,
        availableStock: skuDetails.availableStock || 0,
        pdc,
        cdc,
        hsnCode: skuDetails.hsnCode || null,
        etd: null,
        quantity,
        unitPrice,
        discountPercent,
        taxPercent: 18,
        cgstPercent: gstType === "INTRA" ? 9 : 0,
        sgstPercent: gstType === "INTRA" ? 9 : 0,
        igstPercent: gstType === "INTER" ? 18 : 0,
        subTotal: 0,
        discountAmount: 0,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
        isLocked: true,
        promotionId,
        promotionCode,
        claimedFreeQuantity: claimedFreeQty,
        isOfferItem: isFree,
      };
    };

    if (promotionClaimData.type === "slab") {
      const { promotion, skuDetails, quantity, freeQuantity, promotionCode } = promotionClaimData;

      // Build paid item + free item
      const paidItem = buildOrderItem(
        skuDetails,
        quantity,
        false,
        promotion.id,
        promotionCode,
        freeQuantity
      );
      const freeItem = buildOrderItem(
        skuDetails,
        freeQuantity,
        true,
        promotion.id,
        promotionCode,
        0
      );

      return [applyCalculations(paidItem), applyCalculations(freeItem)];
    }

    if (promotionClaimData.type === "combo") {
      const { promotion, purchaseRequirements, benefitRequirements, skuDetailsMap, promotionCode } =
        promotionClaimData;
      const orderItems: OrderItem[] = [];

      // Add purchase requirement items (paid)
      for (const req of purchaseRequirements) {
        const sku = req.skuId ? skuDetailsMap.get(req.skuId) : null;
        if (sku) {
          const item = buildOrderItem(
            sku,
            req.requiredQuantity || 1,
            false,
            promotion.id,
            promotionCode,
            0
          );
          orderItems.push(applyCalculations(item));
        }
      }

      // Add benefit items (free at 0.01)
      for (const req of benefitRequirements) {
        const sku = req.skuId ? skuDetailsMap.get(req.skuId) : null;
        if (sku) {
          const item = buildOrderItem(
            sku,
            req.requiredQuantity || 1,
            true,
            promotion.id,
            promotionCode,
            0
          );
          orderItems.push(applyCalculations(item));
        }
      }

      return orderItems;
    }

    return null;
  }, [promotionClaimData, selectedPaymentTypeId, gstType]);

  // Initialize items from promotion claim (one-time, replaces useEffect)
  if (
    promotionInitialItems &&
    promotionInitialItems.length > 0 &&
    !promotionInitialized.current &&
    items.length === 0
  ) {
    promotionInitialized.current = true;
    setValue("items", promotionInitialItems);
    if (promotionClaimData?.promotion) {
      setPromotionDetails(promotionClaimData.promotion);
    }
  }

  // Auto-select delivery location when there's only one option
  useEffect(() => {
    if (deliveryLocations.length === 1 && !selectedDeliveryLocationId) {
      setValue("deliveryLocationId", deliveryLocations[0]!.id);
    }
  }, [deliveryLocations, selectedDeliveryLocationId, setValue]);

  // Show error toast if promotion claim failed
  useEffect(() => {
    if (promotionClaimError) {
      toast.showError(
        promotionClaimError instanceof Error
          ? promotionClaimError.message
          : "Failed to load promotion details"
      );
    }
  }, [promotionClaimError, toast]);

  // Handle stock confirmation
  const handleProceedWithAvailableStock = () => {
    if (!validationResult) return;

    // Update items with available stock
    const itemsWithAdjustedStock = items.map((item) => {
      const stockIssue = validationResult.stockIssues.find((issue) => issue.skuId === item.skuId);
      if (stockIssue) {
        return { ...item, quantity: stockIssue.availableStock };
      }
      return item;
    });

    // Use handleItemsChange to ensure promotion recalculation if needed
    // This returns the final items after any promotion adjustments
    const finalItems = handleItemsChange(itemsWithAdjustedStock);
    setShowStockConfirmDialog(false);

    // Submit with the final updated items
    const formData = {
      deliveryLocationId: watch("deliveryLocationId"),
      paymentTypeId: watch("paymentTypeId"),
      items: finalItems,
    };
    handleFormSubmit(formData, false);
  };

  const handleCancelStockConfirmation = () => {
    setShowStockConfirmDialog(false);
    toast.info("Order cancelled. Please adjust quantities manually.");
  };

  // Custom items change handler to handle promotion recalculation
  // Returns the final updated items after promotion recalculation
  const handleItemsChange = (newItems: OrderItem[]): OrderItem[] => {
    // Check if promotion was removed
    const hasPromotionItems = newItems.some((item) => item.isLocked && item.promotionId);
    if (!hasPromotionItems && promotionDetails) {
      // Clear promotion details if all promotion items were removed
      setPromotionDetails(null);
      setValue("items", newItems);
      return newItems;
    }

    // Check if any locked promotion item's quantity changed
    if (promotionDetails && promotionDetails.slabs) {
      const updatedItems = [...newItems];
      let hasChanges = false;

      // Find the paid promotion item (has claimedFreeQuantity > 0)
      const paidItemIndex = updatedItems.findIndex(
        (item) => item.isLocked && item.promotionId && (item.claimedFreeQuantity ?? 0) > 0
      );

      if (paidItemIndex !== -1) {
        const paidItem = updatedItems[paidItemIndex]!;
        const newQuantity = paidItem.quantity;

        // Recalculate free quantity using greedy algorithm
        const slabResult = calculateOptimalSlabAllocation(promotionDetails.slabs, newQuantity);
        const newFreeQuantity = slabResult.totalFreeUnits;

        // Update the claimedFreeQuantity on paid item
        if (paidItem.claimedFreeQuantity !== newFreeQuantity) {
          updatedItems[paidItemIndex] = {
            ...paidItem,
            claimedFreeQuantity: newFreeQuantity,
          };
          hasChanges = true;

          // Find and update the free item (unitPrice === 0.01 with same promotionId)
          const freeItemIndex = updatedItems.findIndex(
            (item) =>
              item.isLocked && item.promotionId === paidItem.promotionId && item.unitPrice === 0.01
          );

          if (freeItemIndex !== -1) {
            const freeItem = updatedItems[freeItemIndex]!;
            updatedItems[freeItemIndex] = applyCalculations({
              ...freeItem,
              quantity: newFreeQuantity,
            });
          }
        }
      }

      if (hasChanges) {
        setValue("items", updatedItems);
        return updatedItems;
      }
    }

    // No promotion recalculation needed, just update items
    setValue("items", newItems);
    return newItems;
  };

  // Form submission with validation
  const handleFormSubmit = (data: SaleOrderFormData, isDraft: boolean = false) => {
    if (!distributorDetails) {
      toast.showError("Distributor details are not loaded. Please wait.");
      return;
    }

    // Skip validation for drafts
    if (isDraft) {
      onSubmit(data, true);
      return;
    }

    // Build items with SKU data for validation
    // Each item in the new structure already has availableStock from the table component
    const itemsWithSKUs = data.items
      .filter((item) => item.skuId) // Only items with SKU selected
      .map((item, index) => ({
        sku: {
          id: item.skuId,
          skuCode: item.skuCode || null,
          skuName: item.skuName || null,
          availableStock: item.availableStock || 0,
          sellingPrice: item.unitPrice,
          pdc: item.discountPercent,
          cdc: item.discountPercent,
        },
        quantity: item.quantity,
        rowIndex: index,
      }));

    // Get payment type name from payment types list
    const selectedPaymentType = paymentTypes.find((pt) => pt.id === selectedPaymentTypeId);
    const paymentTypeName = selectedPaymentType?.name || "";

    // Validate order (payment type: "Credit" or "Advance")
    const result = validateOrder(distributorDetails, itemsWithSKUs, orderTotal, paymentTypeName);

    setValidationResult(result);

    // Log validation results for debugging
    if (result.blockingErrors.length > 0 || result.stockIssues.length > 0) {
      console.error("Order validation issues:", {
        blockingErrors: result.blockingErrors,
        stockIssues: result.stockIssues,
        orderTotal,
        paymentType: paymentTypeName,
      });
    }

    // Show validation errors
    if (result.blockingErrors.length > 0) {
      setShowValidationDialog(true);
      return;
    }

    // Show stock warnings
    if (result.stockIssues.length > 0) {
      setShowStockConfirmDialog(true);
      return;
    }

    // Submit if all validations pass
    onSubmit(data, false);
  };

  // Calculate order total for validation (net amount only)
  const orderTotal = useMemo(() => {
    return items.reduce((total, item) => {
      return (
        total +
        (item.taxableAmount || 0) +
        (item.cgstAmount || 0) +
        (item.sgstAmount || 0) +
        (item.igstAmount || 0)
      );
    }, 0);
  }, [items]);

  // Handle form submission with validation
  const handleFormSubmission = (isDraft: boolean = false) => {
    if (isDraft) {
      // Skip validation for drafts
      const formData: SaleOrderFormData = {
        deliveryLocationId: watch("deliveryLocationId"),
        paymentTypeId: watch("paymentTypeId"),
        items: items,
      };
      handleFormSubmit(formData, isDraft);
      return;
    }

    // For non-drafts, use React Hook Form's handleSubmit for validation
    handleSubmit(
      (data) => {
        console.log("Form validation passed, submitting:", data);
        const formData: SaleOrderFormData = {
          ...data,
          items,
        };
        handleFormSubmit(formData, false);
      },
      (errors) => {
        console.error("Form validation errors:", errors);
        console.error("Current form values:", {
          deliveryLocationId: watch("deliveryLocationId"),
          paymentTypeId: watch("paymentTypeId"),
          items: items,
        });
      }
    )();
  };

  // Show loading state while fetching promotion claim data
  if (loadingPromotionClaim && initialPromotionClaim) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-2xl text-gray-400" />
          <p className="text-gray-500 mt-2">Loading promotion details...</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleFormSubmission(false);
      }}
      className="space-y-6"
    >
      {/* Header - Billing Details */}
      <PurchaseOrderHeader
        control={control}
        errors={errors}
        distributorDetails={distributorDetails}
        paymentTypes={paymentTypes}
        loadingPaymentTypes={loadingPaymentTypes}
        deliveryLocations={deliveryLocations}
        loadingLocations={loadingDistributorDetails}
      />

      {/* Items Table */}
      <PurchaseOrderItemsTableV2
        items={items}
        onChange={handleItemsChange}
        paymentTypeId={selectedPaymentTypeId}
        gstType={gstType}
        errors={errors.items?.message?.toString()}
      />

      {/* Footer - Order Summary & Actions */}
      <PurchaseOrderFooter
        items={items}
        gstType={gstType}
        isSubmitting={isSubmitting || false}
        onSaveDraft={() => handleFormSubmission(true)}
      />

      {/* Validation Error Dialog */}
      <PurchaseOrderValidationDialog
        visible={showValidationDialog}
        onHide={() => setShowValidationDialog(false)}
        validationResult={validationResult}
      />

      {/* Stock Confirmation Dialog */}
      <StockConfirmationDialog
        visible={showStockConfirmDialog}
        onHide={handleCancelStockConfirmation}
        onProceedWithAvailableStock={handleProceedWithAvailableStock}
        onCancel={handleCancelStockConfirmation}
        stockIssues={validationResult?.stockIssues || []}
      />
    </form>
  );
}
