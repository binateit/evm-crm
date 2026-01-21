"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDistributor } from "@/hooks/use-distributor";
import { saleOrderService } from "@/lib/api/services";
import { useToast } from "@/lib/contexts/toast-context";
import { PageHeader, PageBreadcrumb } from "@/components/ui";
import { CreateOrderForm } from "@/components/crm/sale-order/create-order-form";
import type { CreateSaleOrderCommand } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "primereact/button";

export default function CreateOrderPage() {
  const router = useRouter();
  const { distributorId, isLoading: authLoading } = useDistributor();
  const { showSuccess, showError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitOrder = async (orderData: Omit<CreateSaleOrderCommand, "distributorId">) => {
    if (!distributorId) {
      showError("Distributor ID not found");
      return;
    }

    try {
      setSubmitting(true);

      const command: CreateSaleOrderCommand = {
        distributorId,
        ...orderData,
      };

      const orderId = await saleOrderService.create(command);

      // Submit the order immediately
      await saleOrderService.submit(orderId);

      showSuccess("Order submitted successfully!");
      router.push("/orders");
      router.refresh();
    } catch (error) {
      console.error("Error creating order:", error);
      showError(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = (items: unknown[]) => {
    // Save to local storage for now
    localStorage.setItem("draft_order", JSON.stringify(items));
    showSuccess("Draft saved successfully");
  };

  const breadcrumbItems = [
    { label: "Orders", url: "/orders" },
    { label: "Create Order", url: "/orders/create" },
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!distributorId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">Unable to load distributor information</p>
        <Button
          label="Back to Orders"
          icon={<ArrowLeft className="w-4 h-4 mr-2" />}
          outlined
          onClick={() => router.push("/orders")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageBreadcrumb items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <PageHeader
          title="Create New Order"
          subtitle="Add products and submit your order for approval"
        />
        <Button
          label="Back"
          icon={<ArrowLeft className="w-4 h-4 mr-2" />}
          outlined
          severity="secondary"
          onClick={() => router.push("/orders")}
        />
      </div>

      <CreateOrderForm
        distributorId={distributorId}
        onSubmit={handleSubmitOrder}
        onSaveDraft={handleSaveDraft}
        submitting={submitting}
      />
    </div>
  );
}
