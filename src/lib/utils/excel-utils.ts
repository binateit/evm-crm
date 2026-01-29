import * as XLSX from "xlsx";
import type { AllocatedSkuDto } from "@/lib/api/services";

export interface StockSubmissionExcelRow {
  skuCode: string;
  skuName: string;
  brandName: string;
  categoryName: string;
  quantity: number;
  remarks: string;
}

export interface ExcelParseResult {
  validRows: Array<{ skuId: string; quantity: number; remarks: string }>;
  invalidRows: Array<{ row: number; skuCode: string; error: string }>;
  totalRows: number;
}

/**
 * Download Excel template with all allocated SKUs
 */
export function downloadStockSubmissionTemplate(
  allocatedSkus: AllocatedSkuDto[],
  submissionPeriod: string
) {
  try {
    // Create worksheet data
    const data = [
      // Header row
      ["SKU Code", "SKU Name", "Brand", "Category", "Quantity", "Remarks"],
      // Data rows - pre-filled with allocated SKUs
      ...allocatedSkus.map((sku) => [
        sku.skuCode || "",
        sku.skuName || "",
        sku.brandName || "",
        sku.categoryName || "",
        0, // Default quantity
        "", // Empty remarks
      ]),
    ];

    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // SKU Code
      { wch: 40 }, // SKU Name
      { wch: 20 }, // Brand
      { wch: 25 }, // Category
      { wch: 10 }, // Quantity
      { wch: 30 }, // Remarks
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Submission");

    // Download file
    const fileName = `Stock_Submission_${submissionPeriod.replace(/-/g, "")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error("Error in downloadStockSubmissionTemplate:", error);
    throw new Error("Failed to generate Excel template. Please try again.");
  }
}

/**
 * Parse uploaded Excel file and validate against allocated SKUs
 */
export async function parseStockSubmissionExcel(
  file: File,
  allocatedSkus: AllocatedSkuDto[]
): Promise<ExcelParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          reject(new Error("Excel file is empty or invalid"));
          return;
        }

        const firstSheet = workbook.Sheets[sheetName];

        if (!firstSheet) {
          reject(new Error("Excel sheet is empty or invalid"));
          return;
        }

        const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1 });

        // Skip header row
        const dataRows = rows.slice(1);

        const validRows: Array<{ skuId: string; quantity: number; remarks: string }> = [];
        const invalidRows: Array<{ row: number; skuCode: string; error: string }> = [];

        // Create SKU lookup map
        const skuMap = new Map(allocatedSkus.map((sku) => [sku.skuCode, sku.id]));

        dataRows.forEach((row: unknown, index: number) => {
          if (!Array.isArray(row)) return;
          const rowNumber = index + 2; // +2 because of header and 0-index
          const [skuCode, , , , quantity, remarks] = row;

          // Skip empty rows
          if (!skuCode && !quantity) return;

          // Validate SKU Code
          if (!skuCode) {
            invalidRows.push({
              row: rowNumber,
              skuCode: "",
              error: "SKU Code is required",
            });
            return;
          }

          const skuId = skuMap.get(skuCode?.toString().trim());
          if (!skuId) {
            invalidRows.push({
              row: rowNumber,
              skuCode: skuCode?.toString() || "",
              error: "SKU Code not found in your allocated SKUs",
            });
            return;
          }

          // Validate Quantity
          const qty = Number(quantity);
          if (isNaN(qty) || qty < 0) {
            invalidRows.push({
              row: rowNumber,
              skuCode: skuCode?.toString() || "",
              error: "Quantity must be a positive number",
            });
            return;
          }

          // Only include rows with quantity > 0
          if (qty > 0) {
            validRows.push({
              skuId,
              quantity: qty,
              remarks: remarks?.toString().trim() || "",
            });
          }
        });

        resolve({
          validRows,
          invalidRows,
          totalRows: dataRows.length,
        });
      } catch {
        reject(new Error("Failed to parse Excel file. Please check the format."));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
}

/**
 * Validate Excel file before parsing
 */
export function validateExcelFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
    return { valid: false, error: "Please upload a valid Excel file (.xlsx or .xls)" };
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: "File size must be less than 5MB" };
  }

  return { valid: true };
}
