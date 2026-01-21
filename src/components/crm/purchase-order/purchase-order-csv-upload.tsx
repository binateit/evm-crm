"use client";

import { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";

interface PurchaseOrderCSVUploadProps {
  visible: boolean;
  onHide: () => void;
  onItemsUploaded: (items: Array<{ partCode: string; quantity: number }>) => void;
}

interface CSVError {
  row: number;
  message: string;
}

export function PurchaseOrderCSVUpload({
  visible,
  onHide,
  onItemsUploaded,
}: PurchaseOrderCSVUploadProps) {
  const [errors, setErrors] = useState<CSVError[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileUploadRef = useRef<FileUpload>(null);

  const handleDownloadTemplate = () => {
    const template = "Part Code,Quantity\nEXAMPLE-001,10\nEXAMPLE-002,5";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "purchase-order-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (content: string): Array<{ partCode: string; quantity: number }> => {
    const lines = content.trim().split("\n");
    const parsedErrors: CSVError[] = [];
    const items: Array<{ partCode: string; quantity: number }> = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const [partCode, quantityStr] = line.split(",").map((s) => s.trim());

      if (!partCode) {
        parsedErrors.push({
          row: i + 1,
          message: "Part Code is required",
        });
        continue;
      }

      if (!quantityStr) {
        parsedErrors.push({
          row: i + 1,
          message: "Quantity is required",
        });
        continue;
      }

      const quantity = parseInt(quantityStr);
      if (isNaN(quantity) || quantity < 1) {
        parsedErrors.push({
          row: i + 1,
          message: "Quantity must be a positive number",
        });
        continue;
      }

      items.push({ partCode, quantity });
    }

    setErrors(parsedErrors);
    return items;
  };

  const handleFileUpload = (event: { files: File[] }) => {
    const file = event.files[0];
    if (!file) return;

    setUploading(true);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const items = parseCSV(content);

        if (errors.length === 0 && items.length > 0) {
          onItemsUploaded(items);
          fileUploadRef.current?.clear();
        }
      } catch {
        setErrors([{ row: 0, message: "Failed to parse CSV file" }]);
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      setErrors([{ row: 0, message: "Failed to read file" }]);
      setUploading(false);
    };

    reader.readAsText(file);
  };

  return (
    <Dialog
      header="Upload Purchase Order CSV"
      visible={visible}
      onHide={onHide}
      style={{ width: "600px" }}
      modal
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Upload a CSV file with Part Code and Quantity columns to quickly add items.
          </p>
          <Button
            label="Download Template"
            icon="pi pi-download"
            size="small"
            outlined
            onClick={handleDownloadTemplate}
          />
        </div>

        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          accept=".csv"
          maxFileSize={1000000}
          customUpload
          uploadHandler={handleFileUpload}
          chooseLabel={uploading ? "Processing..." : "Choose CSV File"}
          disabled={uploading}
          className="w-full"
        />

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-800 mb-2">Upload Errors:</h4>
            <ul className="space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-700">
                  {error.row > 0 ? `Row ${error.row}: ` : ""}
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">CSV Format:</h4>
          <pre className="text-xs text-blue-700 font-mono">
            Part Code,Quantity{"\n"}
            SKU-001,10{"\n"}
            SKU-002,5
          </pre>
        </div>
      </div>
    </Dialog>
  );
}
