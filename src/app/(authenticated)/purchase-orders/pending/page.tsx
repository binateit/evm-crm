"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/ui/PageBreadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppDataTable } from "@/components/ui/AppDataTable";
import { saleOrderService } from "@/lib/api/services/sale-order.service";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { useToast } from "@/lib/contexts/toast-context";
import { useQuery } from "@tanstack/react-query";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import type { SaleOrderListDto } from "@/types";

export default function PendingPurchaseOrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchValue, setSearchValue] = useState("");

  // Fetch pending orders
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pending-orders", pageNumber, pageSize, searchValue],
    queryFn: () =>
      saleOrderService.getMyOrdersByTrack("pending", {
        pageNumber,
        pageSize,
        keyword: searchValue || undefined,
      }),
  });

  const handleViewOrder = (orderId: string) => {
    router.push(`/purchase-orders/${orderId}`);
  };

  // Table column templates
  const orderNumberTemplate = (rowData: SaleOrderListDto) => {
    return (
      <span
        className="text-primary-500 cursor-pointer hover:underline"
        onClick={() => handleViewOrder(rowData.id)}
      >
        {rowData.orderNumber}
      </span>
    );
  };

  const dateTemplate = (rowData: SaleOrderListDto) => {
    return formatDate(rowData.orderDate);
  };

  const amountTemplate = (rowData: SaleOrderListDto) => {
    return formatCurrency(rowData.totalAmount);
  };

  const statusTemplate = (rowData: SaleOrderListDto) => {
    return <span>{rowData.statusName}</span>;
  };

  const actionsTemplate = (rowData: SaleOrderListDto) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          size="small"
          outlined
          severity="info"
          tooltip="View Details"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleViewOrder(rowData.id)}
        />
      </div>
    );
  };

  if (error) {
    toast?.showError("Failed to load pending purchase orders");
  }

  const breadcrumbItems = [{ label: "Purchase Orders", url: "#" }, { label: "Pending" }];

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <PageHeader
          title="Pending Purchase Orders"
          subtitle="Track your purchase orders in progress"
        />
      </div>

      <Card>
        <AppDataTable
          value={ordersData?.data || []}
          loading={isLoading}
          totalRecords={ordersData?.pagination?.totalCount || 0}
          first={(pageNumber - 1) * pageSize}
          rows={pageSize}
          onPageChange={(e) => {
            setPageNumber((e.page ?? 0) + 1);
            setPageSize(e.rows ?? pageSize);
          }}
          searchValue={searchValue}
          onSearchChange={(value) => {
            setSearchValue(value);
            setPageNumber(1);
          }}
          entityName="pending purchase orders"
          emptyMessage="No pending purchase orders found"
          paginator
          rowsPerPageOptions={[10, 20, 50, 100]}
        >
          <Column
            field="orderNumber"
            header="PO Number"
            body={orderNumberTemplate}
            sortable
            style={{ minWidth: "150px" }}
          />
          <Column
            field="orderDate"
            header="Order Date"
            body={dateTemplate}
            sortable
            style={{ minWidth: "120px" }}
          />
          <Column field="itemCount" header="Items" sortable style={{ minWidth: "80px" }} />
          <Column
            field="totalAmount"
            header="Amount"
            body={amountTemplate}
            sortable
            style={{ minWidth: "120px" }}
          />
          <Column
            field="paymentTypeName"
            header="Payment Type"
            sortable
            style={{ minWidth: "120px" }}
          />
          <Column
            field="statusName"
            header="Status"
            body={statusTemplate}
            style={{ minWidth: "120px" }}
          />
          <Column
            header="Actions"
            body={actionsTemplate}
            frozen
            alignFrozen="right"
            style={{ width: "120px" }}
          />
        </AppDataTable>
      </Card>
    </div>
  );
}
