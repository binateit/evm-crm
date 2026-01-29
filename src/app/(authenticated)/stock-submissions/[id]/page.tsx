"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/ui/PageBreadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";
import { distributorStockSubmissionService } from "@/lib/api/services";
import { useToast } from "@/lib/contexts/toast-context";
import type { DistributorStockSubmissionItemDto } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StockSubmissionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch submission details
  const {
    data: submission,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["stock-submission-detail", id],
    queryFn: () => distributorStockSubmissionService.getMySubmissionById(id),
    enabled: !!id,
  });

  const handleBack = () => {
    router.push("/stock-submissions");
  };

  const handleEdit = () => {
    router.push(`/stock-submissions/${id}/edit`);
  };

  const handleSubmit = async () => {
    if (!submission) return;

    if (
      !confirm(
        `Are you sure you want to submit ${submission.submissionNumber}? You won't be able to edit it after submission.`
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await distributorStockSubmissionService.submitMySubmission(id);
      toast?.showSuccess("Submission submitted successfully");
      refetch();
    } catch (error) {
      console.error("Error submitting:", error);
      toast?.showError(error instanceof Error ? error.message : "Failed to submit submission");
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="flex items-center justify-center h-64">
          <i className="pi pi-spin pi-spinner text-4xl text-primary-500" />
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
            <Button label="Back to List" onClick={handleBack} className="mt-4" />
          </div>
        </Card>
      </div>
    );
  }

  const isDraft = submission.statusId === 1;
  const statusClass =
    submission.statusId === 1 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";

  // Column templates
  const quantityTemplate = (rowData: DistributorStockSubmissionItemDto) => {
    return <span className="font-medium">{rowData.quantity.toLocaleString()}</span>;
  };

  const remarksTemplate = (rowData: DistributorStockSubmissionItemDto) => {
    return rowData.remarks || "-";
  };

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb
        items={[
          { label: "Stock Submissions", url: "/stock-submissions" },
          { label: submission.submissionNumber },
        ]}
      />

      <div className="flex items-center justify-between">
        <PageHeader
          title={`Submission ${submission.submissionNumber}`}
          subtitle={submission.periodDisplay}
        />
        <div className="flex gap-2">
          <Button label="Back" icon="pi pi-arrow-left" outlined onClick={handleBack} />
          {isDraft && (
            <>
              <Button
                label="Edit"
                icon="pi pi-pencil"
                severity="warning"
                outlined
                onClick={handleEdit}
              />
              <Button
                label="Submit"
                icon="pi pi-check"
                severity="success"
                onClick={handleSubmit}
                loading={isSubmitting}
              />
            </>
          )}
        </div>
      </div>

      {/* Header Information */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Distributor</label>
              <p className="text-base font-medium text-gray-900">{submission.distributorName}</p>
              <p className="text-sm text-gray-600">{submission.distributorCode}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500 block mb-1">Period</label>
              <p className="text-base font-medium text-gray-900">{submission.periodDisplay}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500 block mb-1">Status</label>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
                  {submission.statusName}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 block mb-1">Total SKUs</label>
              <p className="text-base font-medium text-gray-900">{submission.totalSKUCount}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500 block mb-1">Total Quantity</label>
              <p className="text-base font-medium text-gray-900">
                {submission.totalQuantity.toLocaleString()}
              </p>
            </div>

            {submission.submittedAt && (
              <div>
                <label className="text-sm text-gray-500 block mb-1">Submitted At</label>
                <p className="text-base font-medium text-gray-900">
                  {format(new Date(submission.submittedAt), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            )}
          </div>

          {submission.remarks && (
            <div className="mt-4 pt-4 border-t">
              <label className="text-sm text-gray-500 block mb-1">Remarks</label>
              <p className="text-base text-gray-700">{submission.remarks}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Stock Items */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Items</h3>
          <DataTable
            value={submission.items}
            stripedRows
            emptyMessage="No items found"
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
          >
            <Column field="skuCode" header="SKU Code" style={{ minWidth: "150px" }} />
            <Column field="skuName" header="SKU Name" style={{ minWidth: "300px" }} />
            <Column
              field="quantity"
              header="Quantity"
              body={quantityTemplate}
              style={{ minWidth: "120px" }}
            />
            <Column
              field="remarks"
              header="Remarks"
              body={remarksTemplate}
              style={{ minWidth: "200px" }}
            />
          </DataTable>
        </div>
      </Card>

      {/* Audit Information */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created:</span>{" "}
            {format(new Date(submission.createdOn), "dd MMM yyyy, hh:mm a")}
          </div>
          {submission.lastModifiedOn && (
            <div>
              <span className="font-medium">Last Modified:</span>{" "}
              {format(new Date(submission.lastModifiedOn), "dd MMM yyyy, hh:mm a")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
