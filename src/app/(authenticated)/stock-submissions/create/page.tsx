"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/ui/PageBreadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";
import { StockSubmissionExcelUpload } from "@/components/crm/stock-submission/stock-submission-excel-upload";
import { distributorStockSubmissionService, skuService } from "@/lib/api/services";
import { useToast } from "@/lib/contexts/toast-context";

const breadcrumbItems = [
  { label: "Stock Submissions", url: "/stock-submissions" },
  { label: "Create" },
];

interface StockItem {
  skuId: string;
  skuCode: string;
  skuName: string;
  quantity: number;
  remarks: string;
}

export default function CreateStockSubmissionPage() {
  const router = useRouter();
  const toast = useToast();

  const [submissionPeriod, setSubmissionPeriod] = useState<Date | null>(null);
  const [generalRemarks, setGeneralRemarks] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assigned SKUs
  const { data: assignedSkusResponse, isLoading: loadingSKUs } = useQuery({
    queryKey: ["my-skus"],
    queryFn: () => skuService.searchAllocatedSkus({ pageSize: 1000 }),
  });

  // Initialize items when SKUs are loaded
  useEffect(() => {
    if (assignedSkusResponse?.data && items.length === 0) {
      const initialItems: StockItem[] = assignedSkusResponse.data.map((sku) => ({
        skuId: sku.id,
        skuCode: sku.skuCode || "",
        skuName: sku.skuName || "",
        quantity: 0,
        remarks: "",
      }));
      setItems(initialItems);
    }
  }, [assignedSkusResponse, items.length]);

  const handleQuantityChange = (skuId: string, value: number | null) => {
    setItems((prev) =>
      prev.map((item) => (item.skuId === skuId ? { ...item, quantity: value || 0 } : item))
    );
  };

  const handleRemarksChange = (skuId: string, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.skuId === skuId ? { ...item, remarks: value } : item))
    );
  };

  const handleExcelDataImported = (
    data: Array<{ skuId: string; quantity: number; remarks: string }>
  ) => {
    // Update items state with imported data
    setItems((prev) =>
      prev.map((item) => {
        const imported = data.find((d) => d.skuId === item.skuId);
        if (imported) {
          return {
            ...item,
            quantity: imported.quantity,
            remarks: imported.remarks,
          };
        }
        return item;
      })
    );
    toast?.showSuccess(`Successfully imported ${data.length} SKU quantities`);
  };

  const handleSaveAsDraft = async () => {
    if (!submissionPeriod) {
      toast?.showError("Please select a submission period");
      return;
    }

    // Filter items with quantity > 0
    const itemsWithQuantity = items.filter((item) => item.quantity > 0);

    if (itemsWithQuantity.length === 0) {
      toast?.showError("Please enter at least one SKU with quantity");
      return;
    }

    try {
      setIsSubmitting(true);

      const submissionDate = format(submissionPeriod, "yyyy-MM-dd");

      await distributorStockSubmissionService.createMySubmission({
        submissionPeriod: submissionDate,
        remarks: generalRemarks || undefined,
        items: itemsWithQuantity.map((item) => ({
          skuId: item.skuId,
          quantity: item.quantity,
          remarks: item.remarks || undefined,
        })),
      });

      toast?.showSuccess("Stock submission submitted successfully");
      router.push("/stock-submissions");
    } catch (error) {
      console.error("Error saving submission:", error);
      toast?.showError(error instanceof Error ? error.message : "Failed to save submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Column templates
  const quantityTemplate = (rowData: StockItem) => {
    return (
      <InputNumber
        value={rowData.quantity}
        onValueChange={(e) => handleQuantityChange(rowData.skuId, e.value ?? null)}
        min={0}
        showButtons
        buttonLayout="horizontal"
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
        className="w-full"
      />
    );
  };

  const remarksTemplate = (rowData: StockItem) => {
    return (
      <InputTextarea
        value={rowData.remarks}
        onChange={(e) => handleRemarksChange(rowData.skuId, e.target.value)}
        rows={1}
        autoResize
        className="w-full"
        placeholder="Optional remarks"
      />
    );
  };

  if (loadingSKUs) {
    return (
      <div className="flex flex-col gap-6">
        <PageBreadcrumb items={breadcrumbItems} />
        <PageHeader title="Create Stock Submission" subtitle="Loading assigned SKUs..." />
        <div className="flex items-center justify-center py-12">
          <i className="pi pi-spin pi-spinner text-2xl text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb items={breadcrumbItems} />

      <PageHeader title="Create Stock Submission" subtitle="Submit your monthly stock levels" />

      {/* Submission Period */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Period (Month/Year) <span className="text-red-500">*</span>
              </label>
              <Calendar
                value={submissionPeriod}
                onChange={(e) => setSubmissionPeriod(e.value as Date)}
                view="month"
                dateFormat="MM/yy"
                placeholder="Select Month/Year"
                showIcon
                className="w-full"
              />
              <small className="text-gray-500">
                Select the month and year for this stock submission
              </small>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">General Remarks</label>
              <InputTextarea
                value={generalRemarks}
                onChange={(e) => setGeneralRemarks(e.target.value)}
                rows={3}
                placeholder="Optional general remarks for this submission"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Bulk Import Section */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Bulk Import</h3>
              <p className="text-sm text-gray-500 mt-1">
                Download template with your allocated SKUs, fill quantities offline, and upload
              </p>
            </div>
            <div className="flex-shrink-0">
              <StockSubmissionExcelUpload
                allocatedSkus={assignedSkusResponse?.data || []}
                submissionPeriod={submissionPeriod ? format(submissionPeriod, "yyyy-MM-dd") : null}
                onDataImported={handleExcelDataImported}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Stock Items */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Items</h3>
          <DataTable
            value={items}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            emptyMessage="No SKUs assigned"
            scrollable
            scrollHeight="600px"
          >
            <Column field="skuCode" header="SKU Code" style={{ minWidth: "150px" }} frozen />
            <Column field="skuName" header="SKU Name" style={{ minWidth: "300px" }} />
            <Column header="Quantity" body={quantityTemplate} style={{ minWidth: "200px" }} />
            <Column header="Remarks" body={remarksTemplate} style={{ minWidth: "250px" }} />
          </DataTable>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          onClick={handleCancel}
          disabled={isSubmitting}
        />
        <Button
          label="Submit"
          severity="success"
          onClick={handleSaveAsDraft}
          loading={isSubmitting}
          icon="pi pi-check"
        />
      </div>
    </div>
  );
}
