"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PageBreadcrumb, PageHeader } from "@/components/ui";
import { PurchaseOrderForm } from "@/components/crm/purchase-order";
import { saleOrderService } from "@/lib/api/services";
import { useToast } from "@/lib/contexts/toast-context";
import { useDistributor } from "@/hooks/use-distributor";
import type { SaleOrderFormData } from "@/lib/validations/crm";

const breadcrumbItems = [
  { label: "CRM", url: "/crm" },
  { label: "Purchase Orders", url: "#" },
  { label: "Create" },
];

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const { distributorId, isLoading: authLoading } = useDistributor();
  const { showSuccess, showError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: SaleOrderFormData, isDraft: boolean = false) => {
    if (!distributorId) {
      showError("Distributor information not found. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      // Create the purchase order (maps to sale order API)
      await saleOrderService.create({
        distributorId,
        paymentTypeId: data.paymentType,
        saveAsDraft: isDraft,
        acknowledgeLowStock: true,
        acknowledgePartialAllocation: true,
        items: data.items.map((item) => ({
          id: item.rowId,
          skuId: item.skuId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          taxPercent: item.taxPercent,
        })),
      });

      showSuccess(
        isDraft ? "Purchase order saved as draft" : "Purchase order created successfully"
      );

      router.push("/purchase-orders/pending");
    } catch (error) {
      console.error("Error creating purchase order:", error);
      showError(error instanceof Error ? error.message : "Failed to create purchase order");
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
      <PurchaseOrderForm onSubmit={handleSubmit} isSubmitting={submitting} />
    </div>
  );
}
