"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import AsyncSelect from "react-select/async";

import { skuService, type AllocatedSkuDto } from "@/lib/api/services";
import { formatCurrency } from "@/lib/utils/formatters";
import type { GSTType } from "@/lib/utils/gst-calculator";
import type { OrderItem } from "@/types";
import { applyCalculations } from "@/lib/utils/order-calculations";

interface SKUOption {
  value: string;
  label: string;
  data: AllocatedSkuDto;
}

// Re-export OrderItem for convenience
export type { OrderItem };

interface ColumnConfig {
  key: string;
  label: string;
  required?: boolean;
  width?: string;
}

const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { key: "partCode", label: "Part Code", required: true, width: "min-w-[200px]" },
  { key: "productName", label: "Product Name", required: false, width: "min-w-[250px]" },
  // { key: "stock", label: "Stock", required: true, width: "min-w-[100px]" },
  { key: "quantity", label: "Quantity", required: true, width: "min-w-[120px]" },
  { key: "rate", label: "Rate (per unit)", required: true, width: "min-w-[120px]" },
  { key: "discount", label: "Discount %", required: true, width: "min-w-[120px]" },
  { key: "gst", label: "GST %", required: true, width: "min-w-[100px]" },
  { key: "totalAmount", label: "Total Amount", required: true, width: "min-w-[150px]" },
  { key: "actions", label: "Action", required: true, width: "min-w-[80px]" },
];

interface PurchaseOrderItemsTableProps {
  items: OrderItem[];
  onChange: (items: OrderItem[]) => void;
  paymentTypeName: string; // Payment type name (for discount logic)
  gstType: GSTType;
  errors?: string;
}

export function PurchaseOrderItemsTableV2({
  items,
  onChange,
  paymentTypeName,
  gstType,
  errors,
}: PurchaseOrderItemsTableProps) {
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

  // Update discounts when payment type changes
  useEffect(() => {
    // Skip if no payment type selected or no items
    if (!paymentTypeName || items.length === 0) return;

    const updatedItems = items.map((item) => {
      // Use pdc/cdc from OrderItem (already stored when SKU was selected)
      if (item.skuId) {
        const pdc = item.pdc || 0;
        const cdc = item.cdc || 0;
        const newDiscount = paymentTypeName === "Advance" ? cdc : pdc;
        // Recalculate all fields with new discount
        return applyCalculations({ ...item, discountPercent: newDiscount });
      }
      return item;
    });

    // Only update if discounts actually changed
    const hasChanges = updatedItems.some(
      (item, idx) => item.discountPercent !== items[idx]?.discountPercent
    );

    if (hasChanges) {
      onChange(updatedItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentTypeName]);

  // Update GST percentages when gstType changes
  useEffect(() => {
    // Skip if no items
    if (items.length === 0) return;

    const updatedItems = items.map((item) =>
      applyCalculations({
        ...item,
        cgstPercent: gstType === "INTRA" ? 9 : 0,
        sgstPercent: gstType === "INTRA" ? 9 : 0,
        igstPercent: gstType === "INTER" ? 18 : 0,
      })
    );

    // Only update if GST actually changed
    const hasChanges = updatedItems.some(
      (item, idx) =>
        item.cgstPercent !== items[idx]?.cgstPercent ||
        item.sgstPercent !== items[idx]?.sgstPercent ||
        item.igstPercent !== items[idx]?.igstPercent
    );

    if (hasChanges) {
      onChange(updatedItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gstType]);

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

      return (response?.data || []).map((sku) => ({
        value: String(sku.id || ""),
        label: `${sku.skuCode || ""} - ${sku.skuName || ""}`,
        data: sku,
      }));
    } catch (error) {
      console.error("Error loading SKUs:", error);
      return [];
    }
  };

  const handleAddItem = () => {
    const newItem: OrderItem = {
      // Row identification
      rowId: crypto.randomUUID(),

      // SKU basic info (empty until selected)
      skuId: "",
      skuName: null,
      skuCode: null,
      brandName: null,
      categoryName: null,

      // Pricing & stock (defaults)
      sellingPrice: 0,
      availableStock: 0,

      // Tax & discount (defaults)
      pdc: 0,
      cdc: 0,

      // Additional fields
      hsnCode: null,
      etd: null,

      // Order line fields
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxPercent: 18,
      cgstPercent: gstType === "INTRA" ? 9 : 0,
      sgstPercent: gstType === "INTRA" ? 9 : 0,
      igstPercent: gstType === "INTER" ? 18 : 0,

      // Calculated fields (all zero for empty item)
      subTotal: 0,
      discountAmount: 0,
      taxableAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
    };

    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, idx) => idx !== index);
    onChange(newItems);
  };

  const handleSkuSelect = async (index: number, skuOption: SKUOption | null) => {
    if (!skuOption) {
      // Clear SKU - reset to empty item
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index]!,
        skuId: "",
        skuName: null,
        skuCode: null,
        brandName: null,
        categoryName: null,
        sellingPrice: 0,
        availableStock: 0,
        pdc: 0,
        cdc: 0,
        hsnCode: null,
        etd: null,
        unitPrice: 0,
        discountPercent: 0,
        // Reset calculated fields
        subTotal: 0,
        discountAmount: 0,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
      };
      onChange(newItems);
      return;
    }

    try {
      // Fetch full SKU details
      const skuDetails = await skuService.getSkuDetails(skuOption.value);

      if (skuDetails) {
        const unitPrice = skuDetails.sellingPrice || skuDetails.unitPrice || 0;
        const pdc = skuDetails.pdc || 0;
        const cdc = skuDetails.cdc || 0;
        const discountPercent = paymentTypeName === "Advance" ? cdc : pdc;

        // Update items array with full SKU details
        const newItems = [...items];
        const updatedItem: OrderItem = {
          ...newItems[index]!,
          // SKU basic info
          skuId: skuDetails.id,
          skuName: skuDetails.skuName,
          skuCode: skuDetails.skuCode,
          brandName: skuDetails.brandName,
          categoryName: skuDetails.categoryName,

          // Pricing & stock
          sellingPrice: skuDetails.sellingPrice,
          availableStock: skuDetails.availableStock || 0,

          // Tax & discount
          pdc,
          cdc,

          // Additional fields
          hsnCode: skuDetails.hsnCode || null,
          etd: null, // Set by user if needed

          // Order line fields
          unitPrice,
          discountPercent,
          taxPercent: 18,
          cgstPercent: gstType === "INTRA" ? 9 : 0,
          sgstPercent: gstType === "INTRA" ? 9 : 0,
          igstPercent: gstType === "INTER" ? 18 : 0,

          // Calculated fields (initialized, will be computed)
          subTotal: 0,
          discountAmount: 0,
          taxableAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          taxAmount: 0,
          totalAmount: 0,
        };

        // Apply calculations
        newItems[index] = applyCalculations(updatedItem);
        onChange(newItems);
      }
    } catch (error) {
      console.error("Error fetching SKU details:", error);
      // Use basic info from search result
      const newItems = [...items];
      const fallbackItem: OrderItem = {
        ...newItems[index]!,
        skuId: skuOption.data.id,
        skuName: skuOption.data.skuName,
        skuCode: skuOption.data.skuCode,
        brandName: skuOption.data.brandName,
        categoryName: skuOption.data.categoryName,
        sellingPrice: skuOption.data.sellingPrice || 0,
        availableStock: 0,
        pdc: 0,
        cdc: 0,
        hsnCode: null,
        etd: null,
        unitPrice: skuOption.data.sellingPrice || 0,
        discountPercent: 0,
        taxPercent: 18,
        cgstPercent: gstType === "INTRA" ? 9 : 0,
        sgstPercent: gstType === "INTRA" ? 9 : 0,
        igstPercent: gstType === "INTER" ? 18 : 0,
        // Calculated fields
        subTotal: 0,
        discountAmount: 0,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
      };
      newItems[index] = applyCalculations(fallbackItem);
      onChange(newItems);
    }
  };

  const handleQuantityChange = (index: number, quantity: number | null | undefined) => {
    const newItems = [...items];
    const updatedItem = {
      ...newItems[index]!,
      quantity: quantity || 1,
    };
    // Recalculate all derived fields
    newItems[index] = applyCalculations(updatedItem);
    onChange(newItems);
  };

  const toggleColumn = (columnKey: string) => {
    const column = AVAILABLE_COLUMNS.find((col) => col.key === columnKey);
    if (column?.required) return;

    setVisibleColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey]
    );
  };

  const isColumnVisible = (columnKey: string) => {
    return visibleColumns.includes(columnKey);
  };

  // This function is now simplified since we pre-calculate totalAmount in OrderItem
  const getLineTotal = (item: OrderItem): number => {
    return item.totalAmount;
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
            onClick={handleAddItem}
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
              {/* {isColumnVisible("stock") && (
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-700">Stock</th>
              )} */}
              {isColumnVisible("quantity") && (
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-700">
                  Quantity *
                </th>
              )}
              {isColumnVisible("rate") && (
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-700">Rate </th>
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
                  Total Amount
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
            {items.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="text-center py-8 text-gray-500">
                  No items added. Click &quot;Add Item&quot; to start.
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                // Create a minimal AllocatedSkuDto from item data for AsyncSelect compatibility
                const skuData: AllocatedSkuDto = {
                  id: item.skuId,
                  skuName: item.skuName || "",
                  skuCode: item.skuCode || "",
                  brandName: item.brandName || "",
                  categoryName: item.categoryName || "",
                  sellingPrice: item.sellingPrice,
                  availableStock: item.availableStock,
                  pdc: item.pdc,
                  cdc: item.cdc,
                  hsnCode: item.hsnCode || "",
                } as AllocatedSkuDto;

                return (
                  <tr key={item.rowId} className="hover:bg-gray-50">
                    {isColumnVisible("partCode") && (
                      <td className="sticky left-0 z-10 bg-white py-2 px-2 border-r border-gray-200">
                        <AsyncSelect<SKUOption>
                          instanceId={`sku-select-${index}`}
                          value={
                            item.skuId
                              ? {
                                  value: item.skuId,
                                  label: `${item.skuCode || ""} - ${item.skuName || ""}`,
                                  data: skuData,
                                }
                              : null
                          }
                          loadOptions={loadSkuOptions}
                          onChange={(option) => handleSkuSelect(index, option)}
                          isClearable
                          placeholder="Search by code/name..."
                          className="min-w-[200px]"
                          menuPortalTarget={document.body}
                          formatOptionLabel={({ data }) => (
                            <div className="py-1">
                              <div className="font-semibold text-gray-800">{data.skuName}</div>
                              <div className="text-xs text-gray-500">
                                {data.skuCode} • {formatCurrency(data.sellingPrice || 0)}
                              </div>
                            </div>
                          )}
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
                      </td>
                    )}

                    {isColumnVisible("productName") && (
                      <td className="py-2 px-3 text-sm text-gray-700">{item.skuName || "-"}</td>
                    )}

                    {/* {isColumnVisible("stock") && (
                      <td className="py-2 px-3 text-sm text-right">
                        <span
                          className={`font-medium ${
                            item.availableStock !== undefined
                              ? item.availableStock > 0
                                ? "text-green-600"
                                : "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {item.availableStock !== undefined
                            ? formatNumber(item.availableStock)
                            : "-"}
                        </span>
                      </td>
                    )} */}

                    {isColumnVisible("quantity") && (
                      <td className="py-2 px-2">
                        <InputNumber
                          value={item.quantity}
                          onValueChange={(e) => handleQuantityChange(index, e.value)}
                          min={1}
                          className="w-24"
                          inputClassName="text-right"
                        />
                      </td>
                    )}

                    {isColumnVisible("rate") && (
                      <td className="py-2 px-3 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(item.unitPrice)}
                      </td>
                    )}

                    {isColumnVisible("discount") && (
                      <td className="py-2 px-3 text-sm text-right text-gray-700">
                        {item.discountPercent}%
                      </td>
                    )}

                    {isColumnVisible("gst") && (
                      <td className="py-2 px-3 text-sm text-right text-gray-700">
                        {item.taxPercent}%
                      </td>
                    )}

                    {isColumnVisible("totalAmount") && (
                      <td className="py-2 px-3 text-sm text-right font-semibold text-gray-900">
                        {formatCurrency(getLineTotal(item))}
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
                          onClick={() => handleRemoveItem(index)}
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

      {errors && <p className="text-red-600 text-sm mt-2">{errors}</p>}
    </div>
  );
}
