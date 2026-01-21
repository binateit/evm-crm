"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import type { PromotionDetailDto } from "@/types";
import {
  calculateOptimalSlabAllocation,
  getMinimumSlabQuantity,
} from "@/lib/utils/promotion-helpers";

interface ClaimPromotionDialogProps {
  visible: boolean;
  onHide: () => void;
  promotion: PromotionDetailDto;
  onClaim: (quantity: number, freeQuantity: number) => void;
}

export function ClaimPromotionDialog({
  visible,
  onHide,
  promotion,
  onClaim,
}: ClaimPromotionDialogProps) {
  const minSlabQuantity = getMinimumSlabQuantity(promotion.slabs || []);
  const [quantity, setQuantity] = useState<number>(minSlabQuantity);

  // Reset quantity when dialog shows
  const handleShow = () => {
    setQuantity(minSlabQuantity);
  };

  // Calculate optimal slab allocation using greedy algorithm
  const slabCalculation = calculateOptimalSlabAllocation(promotion.slabs || [], quantity);
  const freeQuantity = slabCalculation.totalFreeUnits;
  const hasApplicableSlab = slabCalculation.slabBreakdown.length > 0;

  const handleClaim = () => {
    onClaim(quantity, freeQuantity);
  };

  return (
    <Dialog
      header="Claim Promotion"
      visible={visible}
      onHide={onHide}
      onShow={handleShow}
      style={{ width: "900px", maxHeight: "90vh" }}
      modal
      className="p-fluid"
      contentStyle={{ overflowY: "auto", maxHeight: "calc(90vh - 120px)" }}
      contentClassName="scrollbar-hide"
    >
      <div className="grid grid-cols-2 gap-6">
        {/* LEFT SIDE - Promotion Details */}
        <div className="space-y-4">
          {/* Promotion Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <i className="pi pi-gift text-blue-600 text-2xl" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{promotion.promotionName}</h3>
                <p className="text-sm text-gray-600 mb-2">{promotion.promotionCode}</p>
                {promotion.skuName && (
                  <div className="bg-white rounded-lg px-3 py-2 border border-blue-200">
                    <p className="text-xs text-gray-500 mb-1">Product</p>
                    <p className="font-semibold text-gray-900">{promotion.skuName}</p>
                    <p className="text-xs text-gray-500 font-mono">{promotion.skuCode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Available Slabs Reference */}
          {promotion.slabs && promotion.slabs.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 uppercase">Available Slabs</h4>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto scrollbar-hide">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-200">
                    {[...promotion.slabs]
                      .sort((a, b) => a.quantity - b.quantity)
                      .map((slab) => {
                        const isUsed = slabCalculation.slabBreakdown.some(
                          (item) => item.slab.id === slab.id
                        );
                        return (
                          <tr key={slab.id} className={isUsed ? "bg-emerald-50" : ""}>
                            <td className="py-1.5 text-gray-700">
                              Buy {slab.quantity}
                              {isUsed && (
                                <i className="pi pi-check-circle text-emerald-600 text-xs ml-1" />
                              )}
                            </td>
                            <td className="py-1.5 text-right text-emerald-600 font-semibold">
                              +{slab.freeQuantity} FREE
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - Quantity Input & Promotion Applied */}
        <div className="space-y-4">
          {/* Quantity Input */}
          <div>
            <label
              htmlFor="quantity-input"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Enter Quantity *
            </label>
            <InputNumber
              inputId="quantity-input"
              value={quantity}
              onValueChange={(e) => setQuantity(e.value || minSlabQuantity)}
              min={minSlabQuantity}
              className="w-full"
              inputClassName="text-center text-lg font-semibold"
              inputStyle={{ width: "100%" }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum quantity for promotion: {minSlabQuantity}
            </p>
          </div>

          {/* Greedy Algorithm Result Display */}
          {hasApplicableSlab ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <i className="pi pi-check-circle text-emerald-600 text-xl" />
                <h4 className="font-bold text-emerald-900">Promotion Applied!</h4>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <p className="text-gray-500 text-xs mb-1">You Order</p>
                  <p className="font-bold text-gray-900 text-lg">{quantity} units</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <p className="text-gray-500 text-xs mb-1">You Get FREE</p>
                  <p className="font-bold text-emerald-600 text-lg">+{freeQuantity} units</p>
                </div>
              </div>

              {/* Breakdown */}
              {slabCalculation.slabBreakdown.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">
                    Slab Breakdown
                  </p>
                  <div className="space-y-1.5">
                    {slabCalculation.slabBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {item.timesApplied}x (Buy {item.slab.quantity} → +{item.slab.freeQuantity}{" "}
                          free)
                        </span>
                        <span className="font-semibold text-emerald-600">
                          +{item.freeUnitsFromSlab} units
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <i className="pi pi-info-circle text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">No slab applicable</p>
                  <p>
                    Increase quantity to at least {minSlabQuantity} to qualify for promotional
                    benefits.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions - Full Width */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button label="Cancel" severity="secondary" outlined onClick={onHide} />
        <Button
          label="Claim & Create Order"
          icon="pi pi-shopping-cart"
          onClick={handleClaim}
          className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
          disabled={!hasApplicableSlab}
        />
      </div>
    </Dialog>
  );
}
