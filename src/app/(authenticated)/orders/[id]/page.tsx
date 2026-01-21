"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useDistributor } from "@/hooks/use-distributor";
import { saleOrderService } from "@/lib/api/services";
import type { SaleOrderDetailDto } from "@/types";
import {
  PageHeader,
  PageBreadcrumb,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { useToast } from "@/lib/contexts/toast-context";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { ArrowLeft, Calendar, CreditCard, MapPin, Package, User, Check, X } from "lucide-react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { distributorId, isLoading: authLoading } = useDistributor();
  const { showSuccess, showError } = useToast();
  const [order, setOrder] = useState<SaleOrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;

      try {
        setLoading(true);
        const data = await saleOrderService.getById(id);
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  const handleApprove = async () => {
    if (!order || !distributorId) return;

    try {
      setActionLoading(true);
      await saleOrderService.distributorApprove(order.id, {
        distributorId,
      });
      showSuccess("Order approved successfully");
      setShowApproveDialog(false);
      // Refresh order data
      const data = await saleOrderService.getById(id);
      setOrder(data);
    } catch (err) {
      console.error("Error approving order:", err);
      showError("Failed to approve order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!order || !distributorId || !rejectionReason.trim()) {
      showError("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(true);
      await saleOrderService.distributorReject(order.id, {
        distributorId,
        rejectionReason: rejectionReason.trim(),
      });
      showSuccess("Order rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      // Refresh order data
      const data = await saleOrderService.getById(id);
      setOrder(data);
    } catch (err) {
      console.error("Error rejecting order:", err);
      showError("Failed to reject order");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1:
        return "bg-gray-100 text-gray-700";
      case 2:
        return "bg-yellow-100 text-yellow-700";
      case 3:
        return "bg-blue-100 text-blue-700";
      case 4:
        return "bg-green-100 text-green-700";
      case 5:
        return "bg-red-100 text-red-700";
      case 6:
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const isPendingDistributorApproval = order?.statusId === 2;

  const breadcrumbItems = [
    { label: "Orders", url: "/orders" },
    { label: order?.orderNumber || "Order Details", url: `/orders/${id}` },
  ];

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">Order not found</p>
        <Button
          label="Back to Orders"
          icon={<ArrowLeft className="w-4 h-4 mr-2" />}
          outlined
          onClick={() => router.push("/orders")}
        />
      </div>
    );
  }

  const approveDialogFooter = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        severity="secondary"
        outlined
        onClick={() => setShowApproveDialog(false)}
        disabled={actionLoading}
      />
      <Button label="Approve" severity="success" onClick={handleApprove} loading={actionLoading} />
    </div>
  );

  const rejectDialogFooter = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        severity="secondary"
        outlined
        onClick={() => setShowRejectDialog(false)}
        disabled={actionLoading}
      />
      <Button
        label="Reject"
        severity="danger"
        onClick={handleReject}
        loading={actionLoading}
        disabled={!rejectionReason.trim()}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <PageBreadcrumb items={breadcrumbItems} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title={`Order ${order.orderNumber}`}
          subtitle={`Created on ${formatDate(order.createdOn)}`}
        />

        <div className="flex items-center gap-2">
          <Button
            label="Back"
            icon={<ArrowLeft className="w-4 h-4 mr-2" />}
            outlined
            severity="secondary"
            onClick={() => router.push("/orders")}
          />
          {isPendingDistributorApproval && (
            <>
              <Button
                label="Reject"
                icon={<X className="w-4 h-4 mr-2" />}
                severity="danger"
                outlined
                onClick={() => setShowRejectDialog(true)}
              />
              <Button
                label="Approve"
                icon={<Check className="w-4 h-4 mr-2" />}
                severity="success"
                onClick={() => setShowApproveDialog(true)}
              />
            </>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{formatDate(order.orderDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Type</p>
                  <p className="font-medium">{order.paymentType || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Salesperson</p>
                  <p className="font-medium">{order.salespersonName || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      order.statusId
                    )}`}
                  >
                    {order.statusName}
                  </span>
                </div>
              </div>
            </div>

            {order.shippingAddress && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shipping Address</p>
                    <p className="font-medium">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>
            )}

            {order.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(order.subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">-{formatCurrency(order.discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-lg">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items ({order.items?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">SKU</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Product</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Qty</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                    Unit Price
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                    Discount
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Tax</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 text-sm font-medium">{item.skuCode}</td>
                    <td className="py-3 px-2 text-sm">
                      {item.skuName}
                      {item.isOfferItem && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          Offer
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-sm text-right">{item.quantity}</td>
                    <td className="py-3 px-2 text-sm text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-2 text-sm text-right text-green-600">
                      {item.discountPercent > 0 ? `${item.discountPercent}%` : "-"}
                    </td>
                    <td className="py-3 px-2 text-sm text-right">
                      {item.taxPercent > 0 ? `${item.taxPercent}%` : "-"}
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-medium">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <Dialog
        header="Approve Order"
        visible={showApproveDialog}
        onHide={() => setShowApproveDialog(false)}
        footer={approveDialogFooter}
        style={{ width: "400px" }}
      >
        <p>
          Are you sure you want to approve order <strong>{order.orderNumber}</strong>?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Total Amount: <strong>{formatCurrency(order.totalAmount)}</strong>
        </p>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        header="Reject Order"
        visible={showRejectDialog}
        onHide={() => setShowRejectDialog(false)}
        footer={rejectDialogFooter}
        style={{ width: "450px" }}
      >
        <p className="mb-3">
          Please provide a reason for rejecting order <strong>{order.orderNumber}</strong>:
        </p>
        <InputTextarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={3}
          className="w-full"
          placeholder="Enter rejection reason..."
          autoFocus
        />
      </Dialog>
    </div>
  );
}
