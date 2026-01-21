"use client";

import { useMemo } from "react";
import { Button } from "primereact/button";
import type { GSTType } from "@/lib/utils/gst-calculator";
import type { OrderItem } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils/formatters";

interface PurchaseOrderFooterProps {
  items: OrderItem[];
  gstType: GSTType;
  isSubmitting: boolean;
  onSaveDraft: () => void;
}

export function PurchaseOrderFooter({
  items,
  gstType,
  isSubmitting,
  onSaveDraft,
}: PurchaseOrderFooterProps) {
  // Calculate totals from items (using pre-calculated item values)
  const totals = useMemo(() => {
    let totalQuantity = 0;
    let totalTaxableAmount = 0;
    let totalDiscountAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    items.forEach((item) => {
      totalQuantity += item.quantity || 0;
      totalTaxableAmount += item.taxableAmount || 0;
      totalDiscountAmount += item.discountAmount || 0;
      cgstAmount += item.cgstAmount || 0;
      sgstAmount += item.sgstAmount || 0;
      igstAmount += item.igstAmount || 0;
    });

    const netAmount = totalTaxableAmount + cgstAmount + sgstAmount + igstAmount;

    return {
      totalQuantity,
      totalTaxableAmount,
      totalDiscountAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      netAmount,
    };
  }, [items]);

  const hasItems = items.length > 0;
  return (
    <>
      {/* Order Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Quantity:</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatNumber(totals.totalQuantity)} units
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Taxable Amount:</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(totals.totalTaxableAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Total Discount:</span>
            <span className="text-sm font-semibold text-green-600">
              {formatCurrency(totals.totalDiscountAmount)}
            </span>
          </div>

          {gstType === "INTRA" ? (
            <>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total CGST (9%):</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(totals.cgstAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total SGST (9%):</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(totals.sgstAmount)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total IGST (18%):</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(totals.igstAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
            <span className="text-base font-semibold text-gray-900">Total Net Amount:</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(totals.netAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          outlined
          className="border-gray-300 text-gray-700"
        />
        <Button
          type="button"
          label={isSubmitting ? "Saving..." : "Save as Draft"}
          outlined
          onClick={onSaveDraft}
          disabled={isSubmitting || !hasItems}
          className="border-blue-500 text-blue-500 hover:bg-blue-50"
        />
        <Button
          type="submit"
          label={isSubmitting ? "Submitting..." : "Review and Submit"}
          icon={isSubmitting ? "pi pi-spin pi-spinner" : undefined}
          disabled={isSubmitting || !hasItems}
          className="bg-blue-500 hover:bg-blue-600 text-white border-none"
        />
      </div>
    </>
  );
}
