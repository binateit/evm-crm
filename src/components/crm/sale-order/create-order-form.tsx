"use client";

import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Plus, Trash2, Save, Send } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { ProductSearchDialog } from "./product-search-dialog";
import { shippingAddressService, dropdownService } from "@/lib/api/services";
import type { AllocatedSkuDto } from "@/lib/api/services/sku.service";
import type { DistributorShippingAddressDto, PaymentTypeDto } from "@/types";

interface OrderItem extends AllocatedSkuDto {
  quantity: number;
  lineTotal: number;
}

interface CreateOrderFormProps {
  distributorId: string;
  onSubmit: (orderData: {
    items: Array<{
      id: string;
      skuId: string;
      quantity: number;
      unitPrice: number;
      discountPercent: number;
      taxPercent: number;
    }>;
    paymentTypeId: string;
    saveAsDraft?: boolean;
    acknowledgeLowStock?: boolean;
    acknowledgePartialAllocation?: boolean;
  }) => Promise<void>;
  onSaveDraft?: (orderData: OrderItem[]) => void;
  submitting?: boolean;
}

export function CreateOrderForm({
  distributorId,
  onSubmit,
  onSaveDraft,
  submitting = false,
}: CreateOrderFormProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [shippingAddresses, setShippingAddresses] = useState<DistributorShippingAddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeDto[]>([]);
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingPaymentTypes, setLoadingPaymentTypes] = useState(false);

  useEffect(() => {
    fetchShippingAddresses();
    fetchPaymentTypes();
  }, [distributorId]);

  const fetchShippingAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const addresses = await shippingAddressService.getByDistributor(distributorId);
      setShippingAddresses(addresses);

      // Auto-select default address
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addresses.length > 0 && addresses[0]) {
        setSelectedAddressId(addresses[0].id);
      }
    } catch (error) {
      console.error("Error fetching shipping addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchPaymentTypes = async () => {
    try {
      setLoadingPaymentTypes(true);
      const types = await dropdownService.getPaymentTypes();
      setPaymentTypes(types);

      // Auto-select first payment type
      if (types.length > 0 && types[0]) {
        setSelectedPaymentTypeId(types[0].id);
      }
    } catch (error) {
      console.error("Error fetching payment types:", error);
    } finally {
      setLoadingPaymentTypes(false);
    }
  };

  const handleAddProduct = (product: AllocatedSkuDto) => {
    // Check if product already exists
    if (items.some((item) => item.skuId === product.skuId)) {
      return;
    }

    const newItem: OrderItem = {
      ...product,
      quantity: 1,
      lineTotal: calculateLineTotal(
        product.unitPrice ?? 0,
        1,
        product.discountPercent ?? 0,
        product.gstPercent ?? 0
      ),
    };

    setItems([...items, newItem]);
  };

  const handleQuantityChange = (index: number, quantity: number | null) => {
    if (!quantity || quantity < 1) return;

    const updatedItems = [...items];
    const item = updatedItems[index];
    if (!item) return;

    item.quantity = quantity;
    item.lineTotal = calculateLineTotal(
      item.unitPrice ?? 0,
      quantity,
      item.discountPercent ?? 0,
      item.gstPercent ?? 0
    );
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateLineTotal = (
    unitPrice: number,
    quantity: number,
    discountPercent: number,
    gstPercent: number
  ): number => {
    const subtotal = unitPrice * quantity;
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = (taxableAmount * gstPercent) / 100;
    return taxableAmount + gstAmount;
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    items.forEach((item) => {
      const itemSubtotal = (item.unitPrice ?? 0) * item.quantity;
      const itemDiscount = (itemSubtotal * (item.discountPercent ?? 0)) / 100;
      const itemTaxable = itemSubtotal - itemDiscount;
      const itemTax = (itemTaxable * (item.gstPercent ?? 0)) / 100;

      subTotal += itemSubtotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;
    });

    const totalAmount = subTotal - discountAmount + taxAmount;

    return { subTotal, discountAmount, taxAmount, totalAmount };
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      alert("Please add at least one product");
      return;
    }

    if (!selectedPaymentTypeId) {
      alert("Please select a payment type");
      return;
    }

    const orderItems = items.map((item) => ({
      id: crypto.randomUUID(),
      skuId: item.skuId ?? "",
      quantity: item.quantity,
      unitPrice: item.unitPrice ?? 0,
      discountPercent: item.discountPercent ?? 0,
      taxPercent: item.gstPercent ?? 0,
    }));

    await onSubmit({
      items: orderItems,
      paymentTypeId: selectedPaymentTypeId,
      saveAsDraft: false,
      acknowledgeLowStock: true,
      acknowledgePartialAllocation: true,
    });
  };

  const quantityEditor = (options: { value: number; rowIndex: number }) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e) => handleQuantityChange(options.rowIndex, e.value || null)}
        min={1}
        showButtons
        buttonLayout="horizontal"
        decrementButtonClassName="p-button-sm"
        incrementButtonClassName="p-button-sm"
        className="w-full"
      />
    );
  };

  const actionTemplate = (_rowData: OrderItem, options: { rowIndex: number }) => {
    return (
      <Button
        icon={<Trash2 className="w-4 h-4" />}
        rounded
        text
        severity="danger"
        onClick={() => handleRemoveItem(options.rowIndex)}
        tooltip="Remove"
        tooltipOptions={{ position: "left" }}
      />
    );
  };

  const { subTotal, discountAmount, taxAmount, totalAmount } = calculateTotals();
  const selectedProductIds = items
    .map((item) => item.skuId)
    .filter((id): id is string => id !== undefined);

  const addressOptionTemplate = (option: DistributorShippingAddressDto) => {
    return (
      <div>
        <div className="font-medium">{option.addressName}</div>
        <div className="text-sm text-gray-500">
          {option.address1}, {option.city}, {option.stateName}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Order Details */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Shipping Address *</label>
            <Dropdown
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.value)}
              options={shippingAddresses}
              optionLabel="addressName"
              optionValue="id"
              placeholder="Select shipping address"
              className="w-full"
              itemTemplate={addressOptionTemplate}
              disabled={loadingAddresses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Type *</label>
            <Dropdown
              value={selectedPaymentTypeId}
              onChange={(e) => setSelectedPaymentTypeId(e.value)}
              options={paymentTypes}
              optionLabel="name"
              optionValue="id"
              placeholder="Select payment type"
              className="w-full"
              loading={loadingPaymentTypes}
              disabled={loadingPaymentTypes}
            />
          </div>
        </div>
      </Card>

      {/* Order Items */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Order Items</h3>
          <Button
            label="Add Product"
            icon={<Plus className="w-4 h-4 mr-2" />}
            onClick={() => setShowProductDialog(true)}
            size="small"
          />
        </div>

        <DataTable
          value={items}
          size="small"
          showGridlines
          emptyMessage="No products added. Click 'Add Product' to get started."
        >
          <Column field="skuCode" header="SKU Code" style={{ minWidth: "120px" }} />
          <Column field="skuName" header="Product Name" style={{ minWidth: "200px" }} />
          <Column
            field="availableStock"
            header="Stock"
            style={{ minWidth: "80px" }}
            className="text-right"
          />
          <Column
            field="quantity"
            header="Quantity *"
            body={quantityEditor}
            style={{ minWidth: "150px" }}
          />
          <Column
            field="unitPrice"
            header="Rate"
            body={(rowData) => formatCurrency(rowData.unitPrice)}
            style={{ minWidth: "120px" }}
            className="text-right bg-gray-50"
          />
          <Column
            field="discountPercent"
            header="Discount %"
            body={(rowData) => `${rowData.discountPercent || 0}%`}
            style={{ minWidth: "100px" }}
            className="text-right bg-gray-50"
          />
          <Column
            field="gstPercent"
            header="GST %"
            body={(rowData) => `${rowData.gstPercent || 0}%`}
            style={{ minWidth: "100px" }}
            className="text-right bg-gray-50"
          />
          <Column
            field="lineTotal"
            header="Line Total"
            body={(rowData) => formatCurrency(rowData.lineTotal)}
            style={{ minWidth: "120px" }}
            className="text-right font-semibold"
          />
          <Column
            body={actionTemplate}
            header="Action"
            style={{ width: "80px" }}
            frozen
            alignFrozen="right"
          />
        </DataTable>
      </Card>

      {/* Order Summary */}
      {items.length > 0 && (
        <Card>
          <div className="space-y-3 max-w-md ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="text-red-600">- {formatCurrency(discountAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (GST):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <Divider />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onSaveDraft && (
          <Button
            label="Save as Draft"
            icon={<Save className="w-4 h-4 mr-2" />}
            outlined
            onClick={() => onSaveDraft(items)}
            disabled={items.length === 0 || submitting}
          />
        )}
        <Button
          label="Submit Order"
          icon={<Send className="w-4 h-4 mr-2" />}
          onClick={handleSubmitOrder}
          disabled={items.length === 0 || !selectedPaymentTypeId || submitting}
          loading={submitting}
        />
      </div>

      {/* Product Search Dialog */}
      <ProductSearchDialog
        visible={showProductDialog}
        onHide={() => setShowProductDialog(false)}
        onSelect={handleAddProduct}
        selectedProductIds={selectedProductIds}
        distributorId={distributorId}
      />
    </div>
  );
}
