"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDistributor } from "@/hooks/use-distributor";
import { saleOrderService } from "@/lib/api/services";
import type { SaleOrderListDto } from "@/types";
import type { PaginatedResponse } from "@/types/common";
import { PageHeader, PageBreadcrumb } from "@/components/ui";
import { AppDataTable, StatusBadge, CurrencyCell, DateCell } from "@/components/ui";
import { Eye, Plus } from "lucide-react";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

export default function OrdersPage() {
  const { distributorId, isLoading: authLoading } = useDistributor();
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

  useEffect(() => {
    async function fetchOrders() {
      if (!distributorId || authLoading) return;

      try {
        setLoading(true);
        const data = await saleOrderService.getByDistributor(distributorId, {
          pageNumber: page,
          pageSize: pageSize,
        });
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [distributorId, authLoading, page, pageSize]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const breadcrumbItems = [{ label: "Orders", url: "/orders" }];

  const getStatusSeverity = (
    statusId: number
  ): "success" | "warning" | "danger" | "info" | "secondary" => {
    switch (statusId) {
      case 1:
        return "secondary"; // Draft
      case 2:
        return "warning"; // Pending Distributor Approval
      case 3:
        return "info"; // Distributor Approved
      case 4:
        return "success"; // Approved
      case 5:
        return "danger"; // Rejected
      case 6:
        return "secondary"; // Cancelled
      case 7:
        return "info"; // Shipped
      case 8:
        return "success"; // Delivered
      case 9:
        return "success"; // Completed
      default:
        return "secondary";
    }
  };

  const orderNumberTemplate = (rowData: SaleOrderListDto) => (
    <Link href={`/orders/${rowData.id}`} className="text-primary font-medium hover:underline">
      {rowData.orderNumber}
    </Link>
  );

  const statusTemplate = (rowData: SaleOrderListDto) => (
    <StatusBadge
      value={rowData.statusName || "Unknown"}
      severity={getStatusSeverity(rowData.statusId)}
    />
  );

  const actionsTemplate = (rowData: SaleOrderListDto) => (
    <Link href={`/orders/${rowData.id}`}>
      <Button
        icon={<Eye className="w-4 h-4" />}
        rounded
        text
        severity="secondary"
        aria-label="View order"
      />
    </Link>
  );

  return (
    <div className="space-y-4">
      <PageBreadcrumb items={breadcrumbItems} />
      <div className="flex items-center justify-between">
        <PageHeader title="My Orders" subtitle="View and manage your orders" />
        <Link href="/orders/create">
          <Button
            label="Create Order"
            icon={<Plus className="w-4 h-4 mr-2" />}
            severity="success"
          />
        </Link>
      </div>

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
        emptyMessage="No orders found"
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
          field="statusName"
          header="Status"
          body={statusTemplate}
          sortable
          style={{ minWidth: "150px" }}
        />
        <Column
          body={actionsTemplate}
          header="Actions"
          style={{ width: "80px" }}
          frozen
          alignFrozen="right"
        />
      </AppDataTable>
    </div>
  );
}
