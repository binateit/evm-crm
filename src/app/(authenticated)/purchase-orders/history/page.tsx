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
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import type { SaleOrderListDto } from "@/types";

export default function HistoryPurchaseOrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Fetch history orders
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["history-orders", pageNumber, pageSize, keyword, fromDate, toDate],
    queryFn: () =>
      saleOrderService.getMyOrdersByTrack("history", {
        pageNumber,
        pageSize,
        keyword: keyword || undefined,
        fromOrderDate: fromDate ? fromDate.toISOString() : undefined,
        toOrderDate: toDate ? toDate.toISOString() : undefined,
      }),
  });

  const handleViewOrder = (orderId: string) => {
    router.push(`/purchase-orders/${orderId}`);
  };

  const handleClearFilters = () => {
    setKeyword("");
    setFromDate(null);
    setToDate(null);
    setPageNumber(1);
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
    toast?.showError("Failed to load purchase order history");
  }

  const breadcrumbItems = [
    { label: "Purchase Orders", url: "/purchase-orders" },
    { label: "History" },
  ];

  const hasActiveFilters = keyword || fromDate || toDate;

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <PageHeader
          title="Purchase Order History"
          subtitle="View all completed, cancelled, and rejected orders"
        />
      </div>

      <Card>
        {/* Filters Section */}
        <div className="mb-4 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Search</label>
            <span className="p-input-icon-left w-full">
              <i className="pi pi-search" />
              <InputText
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPageNumber(1);
                }}
                placeholder="Search by order number..."
                className="w-full"
              />
            </span>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">From Date</label>
            <Calendar
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.value as Date | null);
                setPageNumber(1);
              }}
              placeholder="Select start date"
              dateFormat="dd/mm/yy"
              showIcon
              className="w-full"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">To Date</label>
            <Calendar
              value={toDate}
              onChange={(e) => {
                setToDate(e.value as Date | null);
                setPageNumber(1);
              }}
              placeholder="Select end date"
              dateFormat="dd/mm/yy"
              showIcon
              className="w-full"
            />
          </div>

          {hasActiveFilters && (
            <Button
              label="Clear Filters"
              icon="pi pi-filter-slash"
              outlined
              severity="secondary"
              onClick={handleClearFilters}
            />
          )}
        </div>

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
          emptyMessage="No purchase order history found"
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
