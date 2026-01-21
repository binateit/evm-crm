"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import { saleOrderSchema, type SaleOrderFormData } from "@/lib/validations/crm";
import { distributorService, dropdownService } from "@/lib/api/services";
import type { OrderValidationResult, OrderItem } from "@/types";
import { PurchaseOrderHeader } from "./purchase-order-header";
import { PurchaseOrderItemsTableV2 } from "./purchase-order-items-table-v2";
import { PurchaseOrderFooter } from "./purchase-order-footer";
import { PurchaseOrderValidationDialog } from "./purchase-order-validation-dialog";
import { StockConfirmationDialog } from "./stock-confirmation-dialog";
import { validateOrder } from "@/lib/utils/sale-order-validations";
import { determineGSTType, type GSTType } from "@/lib/utils/gst-calculator";
import { useToast } from "@/lib/contexts/toast-context";

interface PurchaseOrderFormProps {
  onSubmit: (data: SaleOrderFormData, isDraft?: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

export function PurchaseOrderForm({ onSubmit, isSubmitting }: PurchaseOrderFormProps) {
  const toast = useToast();

  // Items state - managed directly instead of through field array
  const [items, setItems] = useState<OrderItem[]>([]);

  // Validation dialogs
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showStockConfirmDialog, setShowStockConfirmDialog] = useState(false);
  const [validationResult, setValidationResult] = useState<OrderValidationResult | null>(null);

  // GST state
  const [gstType, setGstType] = useState<GSTType>("INTER");

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

  // Get delivery locations from distributor details
  const deliveryLocations = distributorDetails?.shippingAddresses || [];
  const loadingLocations = loadingDistributorDetails;

  // Form setup - only for header fields, items managed separately
  const {
    control,
    watch,
    formState: { errors },
  } = useForm<SaleOrderFormData>({
    resolver: zodResolver(saleOrderSchema),
    defaultValues: {
      deliveryLocationId: "",
      paymentType: "",
      items: [],
    },
  });

  // Watch for changes
  const selectedPaymentTypeId = watch("paymentType");
  const selectedDeliveryLocationId = watch("deliveryLocationId");

  // Get payment type name from ID for discount logic
  const selectedPaymentTypeName =
    paymentTypes.find((pt) => pt.id === selectedPaymentTypeId)?.name || "";

  // Update GST type when delivery location changes
  useEffect(() => {
    if (distributorDetails && selectedDeliveryLocationId) {
      const selectedAddress = deliveryLocations.find(
        (addr: { id: string }) => addr.id === selectedDeliveryLocationId
      );

      if (selectedAddress) {
        const billingState = distributorDetails.billingStateName || null;
        const shippingState = selectedAddress.stateName || null;
        const newGstType = determineGSTType(billingState, shippingState);
        setGstType(newGstType);
      }
    }
  }, [selectedDeliveryLocationId, distributorDetails, deliveryLocations]);

  // Handle stock confirmation
  const handleProceedWithAvailableStock = () => {
    if (!validationResult) return;

    // Update items with available stock
    const updatedItems = items.map((item) => {
      const stockIssue = validationResult.stockIssues.find((issue) => issue.skuId === item.skuId);
      if (stockIssue) {
        return { ...item, quantity: stockIssue.availableStock };
      }
      return item;
    });

    setItems(updatedItems);
    setShowStockConfirmDialog(false);

    // Submit with updated items
    const formData = {
      deliveryLocationId: watch("deliveryLocationId"),
      paymentType: watch("paymentType"),
      items: updatedItems,
    };
    handleFormSubmit(formData, false);
  };

  const handleCancelStockConfirmation = () => {
    setShowStockConfirmDialog(false);
    toast.info("Order cancelled. Please adjust quantities manually.");
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
      .map((item) => ({
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
        rowIndex: 0, // Not needed anymore but kept for compatibility
      }));

    // Calculate order total for validation
    const orderTotal = calculateOrderTotal();

    // Validate order
    const result = validateOrder(distributorDetails, itemsWithSKUs, orderTotal, data.paymentType);

    setValidationResult(result);

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
  const calculateOrderTotal = () => {
    let totalTaxableAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    items.forEach((item) => {
      totalTaxableAmount += item.taxableAmount || 0;
      cgstAmount += item.cgstAmount || 0;
      sgstAmount += item.sgstAmount || 0;
      igstAmount += item.igstAmount || 0;
    });

    return totalTaxableAmount + cgstAmount + sgstAmount + igstAmount;
  };

  // Handle form submission
  const handleFormSubmission = (isDraft: boolean = false) => {
    // Build form data from state
    const formData: SaleOrderFormData = {
      deliveryLocationId: watch("deliveryLocationId"),
      paymentType: watch("paymentType"),
      items,
    };

    handleFormSubmit(formData, isDraft);
  };

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
        loadingLocations={loadingLocations}
      />

      {/* Items Table */}
      <PurchaseOrderItemsTableV2
        items={items}
        onChange={setItems}
        paymentTypeName={selectedPaymentTypeName}
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
