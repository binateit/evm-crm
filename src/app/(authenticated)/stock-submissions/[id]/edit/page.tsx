"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { parse } from "date-fns";

import { Card } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/ui/PageBreadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";
import { distributorStockSubmissionService } from "@/lib/api/services";
import { useToast } from "@/lib/contexts/toast-context";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface StockItem {
  id: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  quantity: number;
  remarks: string;
}

export default function EditStockSubmissionPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();

  const [submissionPeriod, setSubmissionPeriod] = useState<Date | null>(null);
  const [generalRemarks, setGeneralRemarks] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch submission details
  const { data: submission, isLoading } = useQuery({
    queryKey: ["stock-submission-detail", id],
    queryFn: () => distributorStockSubmissionService.getMySubmissionById(id),
    enabled: !!id,
  });

  // Initialize form when submission is loaded
  useEffect(() => {
    if (submission) {
      // Check if it's a draft
      if (submission.statusId !== 1) {
        toast?.showError("Only draft submissions can be edited");
        router.push(`/stock-submissions/${id}`);
        return;
      }

      // Parse the submission period (YYYY-MM-DD format)
      const periodDate = parse(submission.submissionPeriod, "yyyy-MM-dd", new Date());
      setSubmissionPeriod(periodDate);

      // Set remarks
      setGeneralRemarks(submission.remarks || "");

      // Set items
      const initialItems: StockItem[] = submission.items.map((item) => ({
        id: item.id,
        skuId: item.skuId,
        skuCode: item.skuCode,
        skuName: item.skuName,
        quantity: item.quantity,
        remarks: item.remarks || "",
      }));
      setItems(initialItems);
    }
  }, [submission, id, router, toast]);

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

  const handleUpdate = async () => {
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

      await distributorStockSubmissionService.updateMySubmission(id, {
        id,
        remarks: generalRemarks || undefined,
        items: itemsWithQuantity.map((item) => ({
          id: item.id,
          skuId: item.skuId,
          quantity: item.quantity,
          remarks: item.remarks || undefined,
        })),
      });

      toast?.showSuccess("Stock submission updated successfully");
      router.push(`/stock-submissions/${id}`);
    } catch (error) {
      console.error("Error updating submission:", error);
      toast?.showError(error instanceof Error ? error.message : "Failed to update submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/stock-submissions/${id}`);
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageBreadcrumb
          items={[
            { label: "Stock Submissions", url: "/stock-submissions" },
            { label: "Loading..." },
          ]}
        />
        <PageHeader title="Edit Stock Submission" subtitle="Loading submission data..." />
        <div className="flex items-center justify-center py-12">
          <i className="pi pi-spin pi-spinner text-2xl text-gray-400" />
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col gap-6">
        <PageBreadcrumb
          items={[
            { label: "Stock Submissions", url: "/stock-submissions" },
            { label: "Not Found" },
          ]}
        />
        <Card>
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Submission not found</p>
            <Button
              label="Back to List"
              onClick={() => router.push("/stock-submissions")}
              className="mt-4"
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb
        items={[
          { label: "Stock Submissions", url: "/stock-submissions" },
          { label: submission.submissionNumber, url: `/stock-submissions/${id}` },
          { label: "Edit" },
        ]}
      />

      <PageHeader
        title={`Edit ${submission.submissionNumber}`}
        subtitle="Update your stock submission"
      />

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

      {/* Stock Items */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Items</h3>
          <DataTable
            value={items}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            emptyMessage="No items found"
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
          label="Update Submission"
          severity="success"
          onClick={handleUpdate}
          loading={isSubmitting}
          icon="pi pi-save"
        />
      </div>
    </div>
  );
}
