"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/ui/PageBreadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";
import { SaleOrderSummary } from "@/components/crm/sale-order/sale-order-summary";
import { saleOrderService } from "@/lib/api/services/sale-order.service";
import { formatDate } from "@/lib/utils/formatters";
import { useToast } from "@/lib/contexts/toast-context";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { useState } from "react";
import { useDistributor } from "@/hooks/use-distributor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PurchaseOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const { distributorId } = useDistributor();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Fetch order details using "my" endpoint
  const {
    data: order,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-order-detail", id],
    queryFn: () => saleOrderService.getMyOrderById(id),
    enabled: !!id,
  });

  const handleBack = () => {
    router.push("/purchase-orders");
  };

  const handleApprove = async () => {
    if (!distributorId || !order) return;

    try {
      setIsApproving(true);
      await saleOrderService.distributorApprove(order.id, { distributorId });
      toast?.showSuccess("Purchase order approved successfully");
      refetch();
    } catch (error) {
      toast?.showError(error instanceof Error ? error.message : "Failed to approve order");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!distributorId || !order || !rejectionReason.trim()) {
      toast?.showError("Please provide a rejection reason");
      return;
    }

    try {
      setIsRejecting(true);
      await saleOrderService.distributorReject(order.id, {
        distributorId,
        rejectionReason: rejectionReason.trim(),
      });
      toast?.showSuccess("Purchase order rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      refetch();
    } catch (error) {
      toast?.showError(error instanceof Error ? error.message : "Failed to reject order");
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageBreadcrumb
          items={[{ label: "Purchase Orders", url: "/purchase-orders" }, { label: "Loading..." }]}
        />
        <div className="flex items-center justify-center h-64">
          <i className="pi pi-spin pi-spinner text-4xl text-primary-500" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col gap-6">
        <PageBreadcrumb items={[{ label: "Purchase Orders", url: "#" }, { label: "Not Found" }]} />
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg text-muted-foreground">Purchase order not found</p>
            <Button label="Back to Orders" onClick={handleBack} className="mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPendingDistributorApproval = order.statusId === 2;

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb
        items={[
          { label: "Purchase Orders", url: "#" },
          { label: order.orderNumber || "Order Details" },
        ]}
      />

      <div className="flex items-center justify-between">
        <PageHeader
          title={`PO #${order.orderNumber}`}
          subtitle={`Order Date: ${formatDate(order.orderDate)}`}
        />
        <Button label="Back" icon="pi pi-arrow-left" outlined onClick={handleBack} />
      </div>

      {/* Order Summary */}
      <SaleOrderSummary saleOrder={order} />

      {/* Approval Actions */}
      {isPendingDistributorApproval && (
        <Card>
          <CardContent className="flex gap-4 justify-end">
            <Button
              label="Reject Order"
              icon="pi pi-times"
              severity="danger"
              outlined
              onClick={() => setShowRejectDialog(true)}
              disabled={isApproving || isRejecting}
            />
            <Button
              label="Approve Order"
              icon="pi pi-check"
              severity="success"
              onClick={handleApprove}
              loading={isApproving}
              disabled={isRejecting}
            />
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog
        header="Reject Purchase Order"
        visible={showRejectDialog}
        style={{ width: "500px" }}
        onHide={() => {
          setShowRejectDialog(false);
          setRejectionReason("");
        }}
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              label="Cancel"
              outlined
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
            />
            <Button
              label="Reject"
              severity="danger"
              onClick={handleReject}
              loading={isRejecting}
              disabled={!rejectionReason.trim()}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p>Please provide a reason for rejecting this purchase order:</p>
          <InputTextarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={5}
            placeholder="Enter rejection reason..."
            className="w-full"
          />
        </div>
      </Dialog>
    </div>
  );
}
