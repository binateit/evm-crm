"use client";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import type { OrderValidationResult } from "@/types";

interface PurchaseOrderValidationDialogProps {
  visible: boolean;
  onHide: () => void;
  validationResult: OrderValidationResult | null;
}

export function PurchaseOrderValidationDialog({
  visible,
  onHide,
  validationResult,
}: PurchaseOrderValidationDialogProps) {
  if (!validationResult) return null;

  return (
    <Dialog
      header="Purchase Order Validation Errors"
      visible={visible}
      onHide={onHide}
      style={{ width: "600px" }}
      modal
    >
      <div className="space-y-4">
        {validationResult.blockingErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-800 mb-3">
              The following errors must be resolved before submitting:
            </h4>
            <ul className="space-y-2">
              {validationResult.blockingErrors.map((error, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-red-700">
                  <i className="pi pi-times-circle text-red-600 mt-0.5" />
                  <span>{error.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {validationResult.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-3">Warnings:</h4>
            <ul className="space-y-2">
              {validationResult.warnings.map((warning, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-yellow-700">
                  <i className="pi pi-exclamation-triangle text-yellow-600 mt-0.5" />
                  <span>{warning.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <Button label="Close" onClick={onHide} />
        </div>
      </div>
    </Dialog>
  );
}
