"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { useRouter } from "next/navigation";
import { saleOrderService } from "@/lib/api/services/sale-order.service";
import { SaleOrderStatus } from "@/types";
import type { SaleOrderDetailDto } from "@/types";

interface SaleOrderActionsProps {
  saleOrder: SaleOrderDetailDto;
  distributorId: string;
  onActionComplete?: () => void;
}

export function SaleOrderActions({
  saleOrder,
  distributorId,
  onActionComplete,
}: SaleOrderActionsProps) {
  const router = useRouter();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  const canApprove = saleOrder.statusId === SaleOrderStatus.PendingDistributorApproval;

  const handleApprove = async () => {
    if (!canApprove) return;

    setLoading(true);
    try {
      await saleOrderService.distributorApprove(saleOrder.id, { distributorId });
      setShowApproveDialog(false);

      if (onActionComplete) {
        onActionComplete();
      } else {
        router.push("/crm/sale-orders/pending");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to approve sale order:", error);
      alert(error instanceof Error ? error.message : "Failed to approve order");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!canApprove || !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setLoading(true);
    try {
      await saleOrderService.distributorReject(saleOrder.id, {
        distributorId,
        rejectionReason: rejectionReason.trim(),
      });
      setShowRejectDialog(false);

      if (onActionComplete) {
        onActionComplete();
      } else {
        router.push("/crm/sale-orders/pending");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to reject sale order:", error);
      alert(error instanceof Error ? error.message : "Failed to reject order");
    } finally {
      setLoading(false);
    }
  };

  if (!canApprove) {
    return null;
  }

  return (
    <>
      <div className="flex gap-3">
        <Button
          label="Approve Order"
          icon="pi pi-check"
          severity="success"
          onClick={() => setShowApproveDialog(true)}
          disabled={loading}
        />
        <Button
          label="Reject Order"
          icon="pi pi-times"
          severity="danger"
          outlined
          onClick={() => setShowRejectDialog(true)}
          disabled={loading}
        />
      </div>

      {/* Approve Dialog */}
      <Dialog
        header="Approve Sale Order"
        visible={showApproveDialog}
        style={{ width: "450px" }}
        onHide={() => setShowApproveDialog(false)}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowApproveDialog(false)}
              className="p-button-text"
              disabled={loading}
            />
            <Button
              label="Confirm Approval"
              icon="pi pi-check"
              onClick={handleApprove}
              loading={loading}
              severity="success"
            />
          </div>
        }
      >
        <div className="space-y-4">
          <p>Are you sure you want to approve this sale order?</p>
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm">
              <strong>Order Number:</strong> {saleOrder.orderNumber}
            </p>
            <p className="text-sm">
              <strong>Total Amount:</strong> ₹{saleOrder.totalAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-sm">
              <strong>Items:</strong> {saleOrder.items?.length || 0}
            </p>
          </div>
        </div>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        header="Reject Sale Order"
        visible={showRejectDialog}
        style={{ width: "450px" }}
        onHide={() => {
          setShowRejectDialog(false);
          setRejectionReason("");
        }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
              className="p-button-text"
              disabled={loading}
            />
            <Button
              label="Confirm Rejection"
              icon="pi pi-times"
              onClick={handleReject}
              loading={loading}
              severity="danger"
              disabled={!rejectionReason.trim()}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Please provide a reason for rejecting this order:</p>
          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm">
              <strong>Order Number:</strong> {saleOrder.orderNumber}
            </p>
            <p className="text-sm">
              <strong>Total Amount:</strong> ₹{saleOrder.totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <InputTextarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            placeholder="Enter rejection reason..."
            className="w-full"
            required
          />
        </div>
      </Dialog>
    </>
  );
}
