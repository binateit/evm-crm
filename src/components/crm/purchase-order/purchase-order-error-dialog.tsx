"use client";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface PurchaseOrderErrorDialogProps {
  visible: boolean;
  onHide: () => void;
  errorMessage: string | null;
}

export function PurchaseOrderErrorDialog({
  visible,
  onHide,
  errorMessage,
}: PurchaseOrderErrorDialogProps) {
  if (!errorMessage) return null;

  return (
    <Dialog
      header="Order Submission Failed"
      visible={visible}
      onHide={onHide}
      style={{ width: "600px" }}
      modal
      closable={true}
    >
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="pi pi-times-circle text-red-600 text-2xl mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-800 mb-2">
                Unable to create purchase order
              </h4>
              <p className="text-sm text-red-700 whitespace-pre-line">{errorMessage}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button label="Close" onClick={onHide} severity="secondary" />
        </div>
      </div>
    </Dialog>
  );
}
