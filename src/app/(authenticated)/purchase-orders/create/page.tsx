"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageBreadcrumb, PageHeader } from "@/components/ui";
import { PurchaseOrderForm, PurchaseOrderErrorDialog } from "@/components/crm/purchase-order";
import { saleOrderService } from "@/lib/api/services";
import { useToast } from "@/lib/contexts/toast-context";
import { useDistributor } from "@/hooks/use-distributor";
import type { SaleOrderFormData } from "@/lib/validations/crm";

const breadcrumbItems = [
  { label: "CRM", url: "/crm" },
  { label: "Purchase Orders", url: "#" },
  { label: "Create" },
];

function CreatePurchaseOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { distributorId, isLoading: authLoading } = useDistributor();
  const { showSuccess, showError } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extract promotion claim data from URL params
  const initialPromotionClaim = useMemo(() => {
    if (searchParams.get("claimPromotion") === "true") {
      const isComboOffer = searchParams.get("isComboOffer") === "true";

      return {
        promotionId: searchParams.get("promotionId") || "",
        promotionCode: searchParams.get("promotionCode") || "",
        // For slab-based promotions (not combo offers)
        skuId: isComboOffer ? "" : searchParams.get("skuId") || "",
        quantity: isComboOffer ? 0 : parseInt(searchParams.get("quantity") || "1", 10),
        freeQuantity: isComboOffer ? 0 : parseInt(searchParams.get("freeQuantity") || "0", 10),
      };
    }
    return null;
  }, [searchParams]);

  const handleSubmit = async (data: SaleOrderFormData, isDraft: boolean = false) => {
    if (!distributorId) {
      showError("Distributor information not found. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      // Get promotionId from items if this is a promotion order
      const promotionId = data.items.find((item) => item.promotionId)?.promotionId;

      // Create the purchase order (maps to sale order API)
      await saleOrderService.create({
        paymentTypeId: data.paymentTypeId,
        shippingAddressId: data.deliveryLocationId,
        promotionId: promotionId || undefined,
        saveAsDraft: isDraft,
        acknowledgeLowStock: true,
        acknowledgePartialAllocation: true,
        items: data.items.map((item) => ({
          id: item.rowId,
          skuId: item.skuId,
          quantity: item.quantity,
          discountPercent: item.discountPercent,
          billWhenStockArrives: item.billWhenStockArrives || false,
          remarks: item.remarks || undefined,
          isOfferItem: item.isOfferItem || false,
        })),
      });

      showSuccess(
        isDraft ? "Purchase order saved as draft" : "Purchase order created successfully"
      );

      router.push("/purchase-orders/pending");
    } catch (error) {
      console.error("Error creating purchase order:", error);
      const message = error instanceof Error ? error.message : "Failed to create purchase order";

      // Show error in both dialog and toast
      setErrorMessage(message);
      setShowErrorDialog(true);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-5 lg:space-y-6">
        <PageBreadcrumb items={breadcrumbItems} />
        <PageHeader title="Create Purchase Order" description="Loading..." />
        <div className="flex items-center justify-center py-12">
          <i className="pi pi-spin pi-spinner text-2xl text-gray-400" />
        </div>
      </div>
    );
  }

  if (!distributorId) {
    return (
      <div className="space-y-5 lg:space-y-6">
        <PageBreadcrumb items={breadcrumbItems} />
        <PageHeader title="Create Purchase Order" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Unable to load distributor information. Please log in again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageBreadcrumb items={breadcrumbItems} />
      <PageHeader
        title="Create Purchase Order"
        description="Create a new purchase order for products"
      />
      <PurchaseOrderForm
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        initialPromotionClaim={initialPromotionClaim}
      />

      {/* Error Dialog */}
      <PurchaseOrderErrorDialog
        visible={showErrorDialog}
        onHide={() => setShowErrorDialog(false)}
        errorMessage={errorMessage}
      />
    </div>
  );
}

export default function CreatePurchaseOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-5 lg:space-y-6">
          <PageBreadcrumb items={breadcrumbItems} />
          <PageHeader title="Create Purchase Order" description="Loading..." />
          <div className="flex items-center justify-center py-12">
            <i className="pi pi-spin pi-spinner text-2xl text-gray-400" />
          </div>
        </div>
      }
    >
      <CreatePurchaseOrderContent />
    </Suspense>
  );
}
