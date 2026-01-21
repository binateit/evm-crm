"use client";

import { useState, useRef, useEffect } from "react";
import { Controller, Control, FieldErrors, UseFieldArrayReturn } from "react-hook-form";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import AsyncSelect from "react-select/async";

import type { SaleOrderFormData } from "@/lib/validations/crm";
import type { ExtendedSKUData } from "@/types/sale-order-validation.types";
import { skuService } from "@/lib/api/services";
import { formatCurrency, formatNumber } from "@/lib/utils/formatters";

interface SKUOption {
  value: string;
  label: string;
  data: ExtendedSKUData | Record<string, unknown>;
}

interface ColumnConfig {
  key: string;
  label: string;
  required?: boolean;
  width?: string;
}

const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { key: "partCode", label: "Part Code", required: true, width: "min-w-[200px]" },
  { key: "productName", label: "Product Name", required: false, width: "min-w-[250px]" },
  { key: "stock", label: "Stock", required: true, width: "min-w-[100px]" },
  { key: "quantity", label: "Quantity", required: true, width: "min-w-[120px]" },
  { key: "rate", label: "Rate (per unit)", required: true, width: "min-w-[120px]" },
  { key: "discount", label: "Discount %", required: true, width: "min-w-[120px]" },
  { key: "gst", label: "GST %", required: true, width: "min-w-[100px]" },
  { key: "totalAmount", label: "Total Amount", required: true, width: "min-w-[150px]" },
  { key: "etd", label: "ETD", required: false, width: "min-w-[100px]" },
  { key: "taxableAmt", label: "Taxable Amt", required: false, width: "min-w-[120px]" },
  { key: "hsn", label: "HSN", required: false, width: "min-w-[100px]" },
  { key: "inTransit", label: "In Transit", required: false, width: "min-w-[100px]" },
  { key: "backOrderQty", label: "Back Order Qty", required: false, width: "min-w-[130px]" },
  { key: "remarks", label: "Remarks", required: false, width: "min-w-[150px]" },
  { key: "actions", label: "Action", required: true, width: "min-w-[80px]" },
];

interface PurchaseOrderItemsTableProps {
  control: Control<SaleOrderFormData>;
  errors: FieldErrors<SaleOrderFormData>;
  fieldArray: UseFieldArrayReturn<SaleOrderFormData, "items", "id">;
  selectedSkus: Map<number, ExtendedSKUData>;
  onSkuSelect: (index: number, sku: ExtendedSKUData | Record<string, unknown> | null) => void;
  onAddItem: () => void;
}

export function PurchaseOrderItemsTable({
  control,
  errors,
  fieldArray,
  selectedSkus,
  onSkuSelect,
  onAddItem,
}: PurchaseOrderItemsTableProps) {
  const { fields, remove } = fieldArray;

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter((col) => col.required).map((col) => col.key)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  // Close column menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    };

    if (showColumnMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnMenu]);

  // Async function to load SKU options for react-select
  const loadSkuOptions = async (inputValue: string): Promise<SKUOption[]> => {
    if (inputValue.length < 2) {
      return [];
    }

    try {
      const response = await skuService.searchAllocatedSkus({
        keyword: inputValue,
        pageNumber: 1,
        pageSize: 50,
      });

      const options = (response?.data || []).map((sku) => ({
        value: String(sku.id || ""),
        label: `${sku.skuCode || ""} - ${sku.skuName || ""}`,
        data: {
          ...sku,
          skuId: sku.id, // Set skuId from id for backward compatibility
          partCode: sku.skuCode, // Map skuCode to partCode
        },
      }));

      return options;
    } catch (error) {
      console.error("Error loading SKUs:", error);
      return [];
    }
  };

  const toggleColumn = (columnKey: string) => {
    const column = AVAILABLE_COLUMNS.find((col) => col.key === columnKey);
    if (column?.required) return; // Don't allow toggling required columns

    setVisibleColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey]
    );
  };

  const isColumnVisible = (columnKey: string) => {
    return visibleColumns.includes(columnKey);
  };

  const calculateLineTotal = (
    quantity: number,
    unitPrice: number,
    discountPercent: number,
    taxPercent: number
  ): number => {
    const discountAmount = (unitPrice * discountPercent) / 100;
    const priceAfterDiscount = unitPrice - discountAmount;
    const taxableAmount = priceAfterDiscount * quantity;
    const taxAmount = (taxableAmount * taxPercent) / 100;
    return taxableAmount + taxAmount;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
        <div className="flex items-center gap-2">
          {/* Column Visibility Toggle */}
          <div className="relative" ref={columnMenuRef}>
            <Button
              type="button"
              label="Add Column"
              icon="pi pi-plus"
              size="small"
              outlined
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="border-gray-300 text-gray-700"
            />
            {showColumnMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                <div className="p-2 max-h-[300px] overflow-y-auto">
                  {AVAILABLE_COLUMNS.filter((col) => !col.required).map((column) => (
                    <label
                      key={column.key}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isColumnVisible(column.key)}
                        onChange={() => toggleColumn(column.key)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{column.label}</span>
                      {column.required && (
                        <span className="ml-auto text-xs text-gray-400">(Required)</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="button"
            label="Add Item"
            icon="pi pi-plus"
            size="small"
            onClick={onAddItem}
            className="bg-blue-500 hover:bg-blue-600 text-white border-none"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {isColumnVisible("partCode") && (
                <th className="sticky left-0 z-20 bg-gray-50 text-left px-3 py-3 text-xs font-semibold text-gray-700 border-r border-gray-200">
                  Part Code *
                </th>
              )}
              {isColumnVisible("productName") && (
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-700">
                  Product Name
                </th>
              )}
              {isColumnVisible("stock") && (
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-700">Stock</th>
              )}
              {isColumnVisible("quantity") && (
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-700">
                  Quantity *
                </th>
              )}
              {isColumnVisible("rate") && (
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-700">Rate *</th>
              )}
              {isColumnVisible("discount") && (
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-700">
                  Discount %
                </th>
              )}
              {isColumnVisible("gst") && (
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-700">GST %</th>
              )}
              {isColumnVisible("totalAmount") && (
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-700">
                  Total Amount *
                </th>
              )}
              {isColumnVisible("actions") && (
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-700">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fields.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="text-center py-8 text-gray-500">
                  No items added. Click &quot;Add Item&quot; to start.
                </td>
              </tr>
            ) : (
              fields.map((item, index) => {
                const currentSku = selectedSkus.get(index);
                const items = control._formValues.items || [];
                const currentItem = items[index];

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {isColumnVisible("partCode") && (
                      <td className="sticky left-0 z-10 bg-white py-2 px-2 border-r border-gray-200">
                        <Controller
                          name={`items.${index}.skuId`}
                          control={control}
                          render={() => {
                            const currentSkuOption = currentSku
                              ? {
                                  value: currentSku.id,
                                  label: `${
                                    "skuCode" in currentSku
                                      ? currentSku.skuCode
                                      : "partCode" in currentSku
                                        ? currentSku.partCode
                                        : ""
                                  } - ${currentSku.skuName || ""}`,
                                  data: currentSku,
                                }
                              : null;

                            return (
                              <AsyncSelect<SKUOption>
                                instanceId={`sku-select-${index}`}
                                value={currentSkuOption}
                                loadOptions={loadSkuOptions}
                                onChange={(option) => {
                                  if (option) {
                                    onSkuSelect(index, option.data);
                                  } else {
                                    onSkuSelect(index, null);
                                  }
                                }}
                                isClearable
                                placeholder="Search by code/name..."
                                className="min-w-[200px]"
                                menuPortalTarget={document.body}
                                formatOptionLabel={({ data }) => {
                                  const skuName =
                                    "skuName" in data && typeof data.skuName === "string"
                                      ? data.skuName
                                      : "";
                                  const skuCode =
                                    "skuCode" in data && typeof data.skuCode === "string"
                                      ? data.skuCode
                                      : "partCode" in data && typeof data.partCode === "string"
                                        ? data.partCode
                                        : "";
                                  const sellingPrice =
                                    "sellingPrice" in data && typeof data.sellingPrice === "number"
                                      ? data.sellingPrice
                                      : 0;

                                  return (
                                    <div className="py-1">
                                      <div className="font-semibold text-gray-800">{skuName}</div>
                                      <div className="text-xs text-gray-500">
                                        {skuCode} • {formatCurrency(sellingPrice)}
                                      </div>
                                    </div>
                                  );
                                }}
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    minHeight: "40px",
                                    borderColor: "#d1d5db",
                                  }),
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                              />
                            );
                          }}
                        />
                      </td>
                    )}

                    {isColumnVisible("productName") && (
                      <td className="py-2 px-3 text-sm text-gray-700">
                        {currentSku?.skuName || "-"}
                      </td>
                    )}

                    {isColumnVisible("stock") && (
                      <td className="py-2 px-3 text-sm text-right">
                        <span
                          className={`font-medium ${
                            currentSku && "availableStock" in currentSku
                              ? (currentSku.availableStock as number) > 0
                                ? "text-green-600"
                                : "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {currentSku && "availableStock" in currentSku
                            ? formatNumber(currentSku.availableStock as number)
                            : "-"}
                        </span>
                      </td>
                    )}

                    {isColumnVisible("quantity") && (
                      <td className="py-2 px-2">
                        <Controller
                          name={`items.${index}.quantity`}
                          control={control}
                          render={({ field }) => (
                            <InputNumber
                              value={field.value}
                              onValueChange={(e) => field.onChange(e.value)}
                              min={1}
                              className="w-full"
                              inputClassName="text-right"
                            />
                          )}
                        />
                      </td>
                    )}

                    {isColumnVisible("rate") && (
                      <td className="py-2 px-3 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(currentItem?.unitPrice || 0)}
                      </td>
                    )}

                    {isColumnVisible("discount") && (
                      <td className="py-2 px-3 text-sm text-right text-gray-700">
                        {currentItem?.discountPercent || 0}%
                      </td>
                    )}

                    {isColumnVisible("gst") && (
                      <td className="py-2 px-3 text-sm text-right text-gray-700">
                        {currentItem?.taxPercent || 0}%
                      </td>
                    )}

                    {isColumnVisible("totalAmount") && (
                      <td className="py-2 px-3 text-sm text-right font-semibold text-gray-900">
                        {formatCurrency(
                          calculateLineTotal(
                            currentItem?.quantity || 0,
                            currentItem?.unitPrice || 0,
                            currentItem?.discountPercent || 0,
                            currentItem?.taxPercent || 0
                          )
                        )}
                      </td>
                    )}

                    {isColumnVisible("actions") && (
                      <td className="py-2 px-3 text-center">
                        <Button
                          type="button"
                          icon="pi pi-trash"
                          severity="danger"
                          text
                          rounded
                          onClick={() => remove(index)}
                          className="p-2"
                        />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {errors.items && (
        <p className="text-red-600 text-sm mt-2">{errors.items.message?.toString()}</p>
      )}
    </div>
  );
}
