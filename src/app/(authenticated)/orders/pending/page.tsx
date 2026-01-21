"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useDistributor } from "@/hooks/use-distributor";
import { saleOrderService } from "@/lib/api/services";
import type { SaleOrderListDto } from "@/types";
import type { PaginatedResponse } from "@/types/common";
import { PageHeader, PageBreadcrumb } from "@/components/ui";
import { AppDataTable, CurrencyCell, DateCell } from "@/components/ui";
import { useToast } from "@/lib/contexts/toast-context";
import { Eye, Check, X } from "lucide-react";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";

export default function PendingOrdersPage() {
  const { distributorId, isLoading: authLoading } = useDistributor();
  const { showSuccess, showError } = useToast();
  const [orders, setOrders] = useState<PaginatedResponse<SaleOrderListDto>>({
    data: [],
    pagination: {
      totalCount: 0,
      pageSize: 10,
      currentPage: 1,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<SaleOrderListDto | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!distributorId || authLoading) return;

    try {
      setLoading(true);
      const data = await saleOrderService.searchPendingDistributorApproval({
        distributorId,
        pageNumber: page,
        pageSize: pageSize,
      });
      setOrders(data);
    } catch (err) {
      console.error("Error fetching pending orders:", err);
    } finally {
      setLoading(false);
    }
  }, [distributorId, authLoading, page, pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleApprove = async () => {
    if (!selectedOrder || !distributorId) return;

    try {
      setActionLoading(true);
      await saleOrderService.distributorApprove(selectedOrder.id, {
        distributorId,
      });
      showSuccess("Order approved successfully");
      setShowApproveDialog(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error("Error approving order:", err);
      showError("Failed to approve order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder || !distributorId || !rejectionReason.trim()) {
      showError("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(true);
      await saleOrderService.distributorReject(selectedOrder.id, {
        distributorId,
        rejectionReason: rejectionReason.trim(),
      });
      showSuccess("Order rejected");
      setShowRejectDialog(false);
      setSelectedOrder(null);
      setRejectionReason("");
      fetchOrders();
    } catch (err) {
      console.error("Error rejecting order:", err);
      showError("Failed to reject order");
    } finally {
      setActionLoading(false);
    }
  };

  const openApproveDialog = (order: SaleOrderListDto) => {
    setSelectedOrder(order);
    setShowApproveDialog(true);
  };

  const openRejectDialog = (order: SaleOrderListDto) => {
    setSelectedOrder(order);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const breadcrumbItems = [
    { label: "Orders", url: "/orders" },
    { label: "Pending Approval", url: "/orders/pending" },
  ];

  const orderNumberTemplate = (rowData: SaleOrderListDto) => (
    <Link href={`/orders/${rowData.id}`} className="text-primary font-medium hover:underline">
      {rowData.orderNumber}
    </Link>
  );

  const actionsTemplate = (rowData: SaleOrderListDto) => (
    <div className="flex items-center gap-1">
      <Link href={`/orders/${rowData.id}`}>
        <Button
          icon={<Eye className="w-4 h-4" />}
          rounded
          text
          severity="secondary"
          aria-label="View order"
          tooltip="View"
          tooltipOptions={{ position: "top" }}
        />
      </Link>
      <Button
        icon={<Check className="w-4 h-4" />}
        rounded
        text
        severity="success"
        aria-label="Approve order"
        tooltip="Approve"
        tooltipOptions={{ position: "top" }}
        onClick={() => openApproveDialog(rowData)}
      />
      <Button
        icon={<X className="w-4 h-4" />}
        rounded
        text
        severity="danger"
        aria-label="Reject order"
        tooltip="Reject"
        tooltipOptions={{ position: "top" }}
        onClick={() => openRejectDialog(rowData)}
      />
    </div>
  );

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
      <PageHeader title="Pending Approval" subtitle="Orders awaiting your approval" />

      <AppDataTable
        value={orders.data}
        loading={loading || authLoading}
        totalRecords={orders.pagination?.totalCount || 0}
        rows={pageSize}
        first={(page - 1) * pageSize}
        onPage={(e) => handlePageChange(Math.floor(e.first / e.rows) + 1, e.rows)}
        paginator
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="No pending orders"
        className="p-datatable-sm"
      >
        <Column
          field="orderNumber"
          header="Order #"
          body={orderNumberTemplate}
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="orderDate"
          header="Date"
          body={(rowData) => <DateCell value={rowData.orderDate} />}
          sortable
          style={{ minWidth: "100px" }}
        />
        <Column field="salespersonName" header="Salesperson" style={{ minWidth: "150px" }} />
        <Column field="itemCount" header="Items" sortable style={{ minWidth: "80px" }} />
        <Column
          field="totalAmount"
          header="Amount"
          body={(rowData) => <CurrencyCell value={rowData.totalAmount} />}
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column field="paymentType" header="Payment" style={{ minWidth: "100px" }} />
        <Column
          body={actionsTemplate}
          header="Actions"
          style={{ width: "140px" }}
          frozen
          alignFrozen="right"
        />
      </AppDataTable>

      {/* Approve Confirmation Dialog */}
      <Dialog
        header="Approve Order"
        visible={showApproveDialog}
        onHide={() => setShowApproveDialog(false)}
        footer={approveDialogFooter}
        style={{ width: "400px" }}
      >
        <p>
          Are you sure you want to approve order <strong>{selectedOrder?.orderNumber}</strong>?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Total Amount:{" "}
          <strong>
            {selectedOrder?.totalAmount?.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </strong>
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
          Please provide a reason for rejecting order <strong>{selectedOrder?.orderNumber}</strong>:
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
