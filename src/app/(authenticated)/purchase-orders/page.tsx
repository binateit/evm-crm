"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/ui/PageBreadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppDataTable } from "@/components/ui/AppDataTable";
import { SaleOrderStatusBadge } from "@/components/crm/sale-order/sale-order-status-badge";
import { saleOrderService } from "@/lib/api/services/sale-order.service";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { useToast } from "@/lib/contexts/toast-context";
import { useQuery } from "@tanstack/react-query";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Column } from "primereact/column";
import type { SaleOrderListDto } from "@/types";

type Track = "draft" | "pending" | "history";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<number>(1); // Default to Pending tab
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");

  // Map tab index to track type
  const getTrackFromTabIndex = (index: number): Track => {
    switch (index) {
      case 0:
        return "draft";
      case 1:
        return "pending";
      case 2:
        return "history";
      default:
        return "pending";
    }
  };

  const currentTrack = getTrackFromTabIndex(activeTab);

  // Fetch orders by track
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-orders", currentTrack, pageNumber, pageSize, keyword],
    queryFn: () =>
      saleOrderService.getMyOrdersByTrack(currentTrack, {
        pageNumber,
        pageSize,
        keyword: keyword || undefined,
      }),
  });

  const handleTabChange = (e: { index: number }) => {
    setActiveTab(e.index);
    setPageNumber(1); // Reset to first page when changing tabs
    setKeyword(""); // Clear search when changing tabs
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/purchase-orders/${orderId}`);
  };

  const handleCreateOrder = () => {
    router.push("/purchase-orders/create");
  };

  // Table column templates
  const orderNumberTemplate = (rowData: SaleOrderListDto) => {
    return (
      <Button
        label={rowData.orderNumber || "N/A"}
        link
        className="p-0 text-primary-500"
        onClick={() => handleViewOrder(rowData.id)}
      />
    );
  };

  const dateTemplate = (rowData: SaleOrderListDto) => {
    return formatDate(rowData.orderDate);
  };

  const amountTemplate = (rowData: SaleOrderListDto) => {
    return formatCurrency(rowData.totalAmount);
  };

  const statusTemplate = (rowData: SaleOrderListDto) => {
    return <SaleOrderStatusBadge statusId={rowData.statusId} statusName={rowData.statusName} />;
  };

  const actionsTemplate = (rowData: SaleOrderListDto) => {
    return (
      <Button
        label="View"
        icon="pi pi-eye"
        size="small"
        outlined
        onClick={() => handleViewOrder(rowData.id)}
      />
    );
  };

  if (error) {
    toast?.showError("Failed to load purchase orders");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb items={[{ label: "Purchase Orders" }]} />

      <div className="flex items-center justify-between">
        <PageHeader title="Purchase Orders" subtitle="View and manage your purchase orders" />
        <Button
          label="Create PO"
          icon="pi pi-plus"
          onClick={handleCreateOrder}
          severity="success"
        />
      </div>

      <Card>
        <TabView activeIndex={activeTab} onTabChange={handleTabChange}>
          {/* Draft Tab */}
          <TabPanel header="Draft" leftIcon="pi pi-file-edit mr-2">
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
              searchValue={keyword}
              onSearchChange={setKeyword}
              emptyMessage="No draft purchase orders found"
            >
              <Column field="orderNumber" header="PO Number" body={orderNumberTemplate} sortable />
              <Column field="orderDate" header="Order Date" body={dateTemplate} sortable />
              <Column field="itemCount" header="Items" sortable />
              <Column field="totalAmount" header="Amount" body={amountTemplate} sortable />
              <Column field="paymentTypeName" header="Payment Type" sortable />
              <Column field="statusName" header="Status" body={statusTemplate} />
              <Column header="Actions" body={actionsTemplate} style={{ width: "120px" }} />
            </AppDataTable>
          </TabPanel>

          {/* Pending Tab */}
          <TabPanel header="Pending" leftIcon="pi pi-clock mr-2">
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
              searchValue={keyword}
              onSearchChange={setKeyword}
              emptyMessage="No pending purchase orders found"
            >
              <Column field="orderNumber" header="PO Number" body={orderNumberTemplate} sortable />
              <Column field="orderDate" header="Order Date" body={dateTemplate} sortable />
              <Column field="itemCount" header="Items" sortable />
              <Column field="totalAmount" header="Amount" body={amountTemplate} sortable />
              <Column field="paymentTypeName" header="Payment Type" sortable />
              <Column field="statusName" header="Status" body={statusTemplate} />
              <Column header="Actions" body={actionsTemplate} style={{ width: "120px" }} />
            </AppDataTable>
          </TabPanel>

          {/* History Tab */}
          <TabPanel header="History" leftIcon="pi pi-history mr-2">
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
              searchValue={keyword}
              onSearchChange={setKeyword}
              emptyMessage="No purchase order history found"
            >
              <Column field="orderNumber" header="PO Number" body={orderNumberTemplate} sortable />
              <Column field="orderDate" header="Order Date" body={dateTemplate} sortable />
              <Column field="itemCount" header="Items" sortable />
              <Column field="totalAmount" header="Amount" body={amountTemplate} sortable />
              <Column field="paymentTypeName" header="Payment Type" sortable />
              <Column field="statusName" header="Status" body={statusTemplate} />
              <Column header="Actions" body={actionsTemplate} style={{ width: "120px" }} />
            </AppDataTable>
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
}
