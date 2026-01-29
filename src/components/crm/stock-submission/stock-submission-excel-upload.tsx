"use client";

import { useState, useRef } from "react";
import { Button } from "primereact/button";
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Message } from "primereact/message";
import type { AllocatedSkuDto } from "@/lib/api/services";
import {
  downloadStockSubmissionTemplate,
  parseStockSubmissionExcel,
  validateExcelFile,
  type ExcelParseResult,
} from "@/lib/utils/excel-utils";

interface StockSubmissionExcelUploadProps {
  allocatedSkus: AllocatedSkuDto[];
  submissionPeriod: string | null;
  onDataImported: (data: Array<{ skuId: string; quantity: number; remarks: string }>) => void;
}

export function StockSubmissionExcelUpload({
  allocatedSkus,
  submissionPeriod,
  onDataImported,
}: StockSubmissionExcelUploadProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileUploadRef = useRef<FileUpload>(null);

  const handleDownloadTemplate = () => {
    console.log("Download button clicked");
    console.log("Submission period:", submissionPeriod);
    console.log("Allocated SKUs:", allocatedSkus?.length);

    if (!submissionPeriod) {
      alert("Please select a submission period first");
      return;
    }

    if (!allocatedSkus || allocatedSkus.length === 0) {
      alert("No allocated SKUs found");
      return;
    }

    try {
      console.log("Calling downloadStockSubmissionTemplate...");
      downloadStockSubmissionTemplate(allocatedSkus, submissionPeriod);
      console.log("Download completed successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      alert(error instanceof Error ? error.message : "Failed to download template");
    }
  };

  const handleUpload = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];

    if (!file) {
      alert("No file selected");
      return;
    }

    // Validate file
    const validation = validateExcelFile(file as File);
    if (!validation.valid) {
      alert(validation.error);
      fileUploadRef.current?.clear();
      return;
    }

    setIsProcessing(true);
    setShowDialog(true);

    try {
      const result = await parseStockSubmissionExcel(file as File, allocatedSkus);
      setParseResult(result);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to parse Excel file");
      setShowDialog(false);
    } finally {
      setIsProcessing(false);
      fileUploadRef.current?.clear();
    }
  };

  const handleImportData = () => {
    if (parseResult?.validRows) {
      onDataImported(parseResult.validRows);
      setShowDialog(false);
      setParseResult(null);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setParseResult(null);
  };

  return (
    <>
      {/* Upload/Download Buttons */}
      <div className="flex gap-3">
        <Button
          label="Download Template"
          icon="pi pi-download"
          severity="secondary"
          outlined
          onClick={handleDownloadTemplate}
          disabled={!submissionPeriod}
          tooltip={!submissionPeriod ? "Please select submission period first" : ""}
          tooltipOptions={{ position: "top" }}
        />
        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          name="excel"
          accept=".xlsx,.xls"
          maxFileSize={5000000}
          customUpload
          uploadHandler={handleUpload}
          auto
          chooseLabel="Upload Excel"
          className="p-button-info p-button-outlined"
          chooseOptions={{
            icon: "pi pi-upload",
            className: "p-button-info p-button-outlined",
          }}
        />
      </div>

      {/* Validation Dialog */}
      <Dialog
        header="Excel Import Validation"
        visible={showDialog}
        style={{ width: "800px" }}
        onHide={handleCancel}
        footer={
          <div className="flex gap-2 justify-end">
            <Button label="Cancel" outlined onClick={handleCancel} />
            <Button
              label={`Import ${parseResult?.validRows.length || 0} Valid Rows`}
              severity="success"
              onClick={handleImportData}
              disabled={!parseResult?.validRows.length}
            />
          </div>
        }
      >
        {isProcessing ? (
          <div className="flex items-center justify-center py-8">
            <i className="pi pi-spin pi-spinner text-2xl text-primary-500" />
            <span className="ml-3">Processing Excel file...</span>
          </div>
        ) : parseResult ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Total Rows</div>
                <div className="text-2xl font-bold">{parseResult.totalRows}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Valid Rows</div>
                <div className="text-2xl font-bold text-green-700">
                  {parseResult.validRows.length}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600">Invalid Rows</div>
                <div className="text-2xl font-bold text-red-700">
                  {parseResult.invalidRows.length}
                </div>
              </div>
            </div>

            {/* Errors */}
            {parseResult.invalidRows.length > 0 && (
              <div>
                <Message
                  severity="warn"
                  text={`${parseResult.invalidRows.length} row(s) have errors and will be skipped`}
                />
                <DataTable
                  value={parseResult.invalidRows}
                  className="mt-3"
                  scrollable
                  scrollHeight="300px"
                  emptyMessage="No errors"
                >
                  <Column field="row" header="Row" style={{ width: "80px" }} />
                  <Column field="skuCode" header="SKU Code" style={{ width: "150px" }} />
                  <Column field="error" header="Error" />
                </DataTable>
              </div>
            )}

            {/* Warning if no valid rows */}
            {parseResult.validRows.length === 0 && (
              <Message
                severity="error"
                text="No valid rows found. Please fix the errors and try again."
              />
            )}
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
