"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import { PageBreadcrumb } from "@/components/ui/PageBreadcrumb";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppDataTable } from "@/components/ui/AppDataTable";
import { distributorStockSubmissionService } from "@/lib/api/services";
import { useToast } from "@/lib/contexts/toast-context";
import type { DistributorStockSubmissionListDto } from "@/types";

const breadcrumbItems = [{ label: "Stock Submissions" }];

const statusOptions = [
  { id: 1, name: "Draft" },
  { id: 2, name: "Submitted" },
];

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: format(new Date(2024, i), "MMMM"),
}));

export default function StockSubmissionsPage() {
  const router = useRouter();
  const toast = useToast();

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [monthFilter, setMonthFilter] = useState<number | null>(null);

  // Fetch submissions
  const { data: submissionsData, isLoading } = useQuery({
    queryKey: [
      "stock-submissions",
      pageNumber,
      pageSize,
      searchValue,
      statusFilter,
      yearFilter,
      monthFilter,
    ],
    queryFn: () =>
      distributorStockSubmissionService.getMySubmissions({
        keyword: searchValue || undefined,
        pageNumber,
        pageSize,
        statusId: statusFilter || undefined,
        submissionYear: yearFilter || undefined,
        submissionMonth: monthFilter || undefined,
      }),
  });

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/stock-submissions/${submissionId}`);
  };

  const handleCreateSubmission = () => {
    router.push("/stock-submissions/create");
  };

  const handleEditSubmission = (submissionId: string) => {
    router.push(`/stock-submissions/${submissionId}/edit`);
  };

  const handleDeleteSubmission = async (submissionId: string, submissionNumber: string) => {
    if (!confirm(`Are you sure you want to delete submission ${submissionNumber}?`)) {
      return;
    }

    try {
      await distributorStockSubmissionService.deleteMySubmission(submissionId);
      toast?.showSuccess("Submission deleted successfully");
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast?.showError("Failed to delete submission");
    }
  };

  // TODO: Add submit functionality to actions column
  // const handleSubmitSubmission = async (
  //   submissionId: string,
  //   submissionNumber: string
  // ) => {
  //   if (!confirm(`Are you sure you want to submit ${submissionNumber}? You won't be able to edit it after submission.`)) {
  //     return;
  //   }

  //   try {
  //     await distributorStockSubmissionService.submitMySubmission(submissionId);
  //     toast?.showSuccess("Submission submitted successfully");
  //   } catch (error) {
  //     console.error("Error submitting:", error);
  //     toast?.showError("Failed to submit submission");
  //   }
  // };

  // Column templates
  const periodTemplate = (rowData: DistributorStockSubmissionListDto) => {
    return (
      <span
        className="text-primary-500 cursor-pointer hover:underline"
        onClick={() => handleViewSubmission(rowData.submissionId)}
      >
        {format(new Date(rowData.submissionDate), "MMMM yyyy")}
      </span>
    );
  };

  const skuNameTemplate = (rowData: DistributorStockSubmissionListDto) => {
    return <span className="text-gray-700">{rowData.skuName}</span>;
  };

  const skuCountTemplate = (rowData: DistributorStockSubmissionListDto) => {
    return <span className="font-medium">{rowData.skuCount}</span>;
  };

  const actionsTemplate = (rowData: DistributorStockSubmissionListDto) => {
    // Note: We need to determine if this is a draft or submitted
    // For now, showing all actions - should be filtered based on status
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          size="small"
          outlined
          severity="info"
          tooltip="View"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleViewSubmission(rowData.submissionId)}
        />
        <Button
          icon="pi pi-pencil"
          size="small"
          outlined
          severity="warning"
          tooltip="Edit"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEditSubmission(rowData.submissionId)}
        />
        <Button
          icon="pi pi-trash"
          size="small"
          outlined
          severity="danger"
          tooltip="Delete"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleDeleteSubmission(rowData.submissionId, "Draft")}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <PageHeader title="Stock Submissions" subtitle="Manage your monthly stock submissions" />
        <Button
          label="New Submission"
          icon="pi pi-plus"
          onClick={handleCreateSubmission}
          severity="success"
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Dropdown
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.value);
                setPageNumber(1);
              }}
              options={statusOptions}
              optionLabel="name"
              optionValue="id"
              placeholder="All Statuses"
              showClear
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Year</label>
            <Calendar
              value={yearFilter ? new Date(yearFilter, 0) : null}
              onChange={(e) => {
                setYearFilter(e.value ? new Date(e.value.toString()).getFullYear() : null);
                setPageNumber(1);
              }}
              view="year"
              dateFormat="yy"
              placeholder="Select Year"
              showIcon
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Month</label>
            <Dropdown
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.value);
                setPageNumber(1);
              }}
              options={monthOptions}
              optionLabel="name"
              optionValue="id"
              placeholder="All Months"
              showClear
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card>
        <AppDataTable
          value={submissionsData?.data || []}
          loading={isLoading}
          totalRecords={submissionsData?.pagination?.totalCount || 0}
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
          entityName="stock submissions"
          emptyMessage="No stock submissions found"
          paginator
          rowsPerPageOptions={[10, 20, 50, 100]}
        >
          <Column
            field="submissionDate"
            header="Period"
            body={periodTemplate}
            sortable
            style={{ minWidth: "150px" }}
          />
          <Column
            field="skuName"
            header="SKU"
            body={skuNameTemplate}
            style={{ minWidth: "250px" }}
          />
          <Column
            field="skuCount"
            header="Total SKUs"
            body={skuCountTemplate}
            sortable
            style={{ minWidth: "120px" }}
          />
          <Column
            header="Actions"
            body={actionsTemplate}
            frozen
            alignFrozen="right"
            style={{ width: "180px" }}
          />
        </AppDataTable>
      </Card>
    </div>
  );
}
