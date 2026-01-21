"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/ui/PageBreadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";
import { SaleOrderStatusBadge } from "@/components/crm/sale-order/sale-order-status-badge";
import { SaleOrderSummary } from "@/components/crm/sale-order/sale-order-summary";
import { saleOrderService } from "@/lib/api/services/sale-order.service";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { useToast } from "@/lib/contexts/toast-context";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { useState } from "react";
import { useDistributor } from "@/hooks/use-distributor";
import type { SaleOrderItemDto } from "@/types";

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

  // Table column templates
  const priceTemplate = (rowData: SaleOrderItemDto) => formatCurrency(rowData.unitPrice);
  const discountTemplate = (rowData: SaleOrderItemDto) => `${rowData.discountPercent}%`;
  const taxTemplate = (rowData: SaleOrderItemDto) => `${rowData.taxPercent}%`;
  const lineTotalTemplate = (rowData: SaleOrderItemDto) => formatCurrency(rowData.lineTotal);

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
        <PageBreadcrumb
          items={[{ label: "Purchase Orders", url: "/purchase-orders" }, { label: "Not Found" }]}
        />
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
          { label: "Purchase Orders", url: "/purchase-orders" },
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

      {/* Order Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <SaleOrderStatusBadge statusId={order.statusId} statusName={order.statusName} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Type</label>
              <p className="mt-1">{order.paymentType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
              <p className="mt-1">
                {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : "N/A"}
              </p>
            </div>
            {order.salespersonName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Salesperson</label>
                <p className="mt-1">{order.salespersonName}</p>
              </div>
            )}
            {order.notes && (
              <div className="col-span-full">
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="mt-1">{order.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items ({order.items?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable value={order.items || []} stripedRows>
            <Column field="skuCode" header="SKU Code" />
            <Column field="skuName" header="Product Name" />
            <Column field="quantity" header="Qty" />
            <Column field="unitPrice" header="Unit Price" body={priceTemplate} />
            <Column field="discountPercent" header="Discount" body={discountTemplate} />
            <Column field="taxPercent" header="Tax" body={taxTemplate} />
            <Column field="lineTotal" header="Line Total" body={lineTotalTemplate} />
          </DataTable>
        </CardContent>
      </Card>

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
