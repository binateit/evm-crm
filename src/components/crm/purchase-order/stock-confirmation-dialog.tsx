"use client";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import type { StockIssue } from "@/types/sale-order-validation.types";
import { formatNumber } from "@/lib/utils/formatters";

interface StockConfirmationDialogProps {
  visible: boolean;
  onHide: () => void;
  onProceedWithAvailableStock: () => void;
  onCancel: () => void;
  stockIssues: StockIssue[];
}

export function StockConfirmationDialog({
  visible,
  onHide,
  onProceedWithAvailableStock,
  onCancel,
  stockIssues,
}: StockConfirmationDialogProps) {
  return (
    <Dialog
      header="Stock Availability Warning"
      visible={visible}
      onHide={onHide}
      style={{ width: "700px" }}
      modal
      closable={false}
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="pi pi-exclamation-triangle text-yellow-600 text-xl mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                Some items have insufficient stock
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                The following items have requested quantities exceeding available stock:
              </p>

              <div className="bg-white rounded border border-yellow-300 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-yellow-100">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-yellow-900">Product</th>
                      <th className="text-right py-2 px-3 font-medium text-yellow-900">
                        Requested Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockIssues.map((issue, idx) => (
                      <tr key={idx} className="border-t border-yellow-200">
                        <td className="py-2 px-3 text-gray-900">{issue.skuName}</td>
                        <td className="py-2 px-3 text-right text-red-700 font-semibold">
                          {formatNumber(issue.requestedQuantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">What would you like to do?</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <i className="pi pi-check-circle text-blue-600 mt-0.5" />
              <span>
                <strong>Proceed with available stock</strong> - Automatically adjust quantities to
                match available stock
              </span>
            </li>
            <li className="flex items-start gap-2">
              <i className="pi pi-times-circle text-blue-600 mt-0.5" />
              <span>
                <strong>Cancel</strong> - Return to the form to manually adjust quantities
              </span>
            </li>
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <Button label="Cancel" severity="secondary" outlined onClick={onCancel} />
          <Button
            label="Proceed with Available Stock"
            onClick={onProceedWithAvailableStock}
            className="bg-blue-500 hover:bg-blue-600"
          />
        </div>
      </div>
    </Dialog>
  );
}
