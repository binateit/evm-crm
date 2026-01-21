"use client";

import { Controller, Control, FieldErrors } from "react-hook-form";
import { Dropdown } from "primereact/dropdown";

import type { SaleOrderFormData } from "@/lib/validations/crm";
import { formatCurrency } from "@/lib/utils/formatters";
import type {
  DistributorShippingAddressDto,
  DistributorForSaleOrderDto,
  PaymentTypeDto,
} from "@/types";

interface PurchaseOrderHeaderProps {
  control: Control<SaleOrderFormData>;
  errors: FieldErrors<SaleOrderFormData>;
  distributorDetails: DistributorForSaleOrderDto | null | undefined;
  paymentTypes: PaymentTypeDto[];
  loadingPaymentTypes: boolean;
  deliveryLocations: DistributorShippingAddressDto[];
  loadingLocations: boolean;
  onPaymentTypeChange?: () => void;
}

export function PurchaseOrderHeader({
  control,
  errors,
  distributorDetails,
  paymentTypes,
  loadingPaymentTypes,
  deliveryLocations,
  loadingLocations,
  onPaymentTypeChange,
}: PurchaseOrderHeaderProps) {
  // Format billing address
  const formatBillingAddress = (dist: DistributorForSaleOrderDto | null | undefined) => {
    if (!dist) return "";
    const parts = [
      dist.billingAddress1,
      dist.billingAddress2,
      dist.billingAddress3,
      dist.billingAddress4,
      `${dist.billingStateName || ""}${dist.billingPincode ? " - " + dist.billingPincode : ""}`,
    ].filter(Boolean);
    return parts.join("\n");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Row 1 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Seller:</label>
          <p className="text-sm text-gray-900 py-2.5 px-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            Hundia Infosolutions Pvt Ltd
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Buyer / Distributor: <span className="text-red-600">*</span>
          </label>
          <p className="text-sm text-gray-900 py-2.5 px-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            {distributorDetails?.distributorName || "Loading..."}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">GSTIN:</label>
          <p className="text-sm text-gray-900 py-2.5 px-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            {distributorDetails?.gstNumber || "N/A"}
          </p>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Credit Limit / Used:</label>
          <p className="text-sm text-gray-900 py-2.5 px-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            {distributorDetails
              ? `${formatCurrency(distributorDetails.creditLimit || 0)} / ${formatCurrency(distributorDetails.outstandingBalance || 0)}`
              : "N/A"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Payment Type: <span className="text-red-600">*</span>
          </label>
          <Controller
            name="paymentTypeId"
            control={control}
            render={({ field }) => (
              <Dropdown
                value={field.value}
                onChange={(e) => {
                  field.onChange(e.value);
                  onPaymentTypeChange?.();
                }}
                options={paymentTypes}
                optionLabel="name"
                optionValue="id"
                placeholder="Select payment type"
                loading={loadingPaymentTypes}
                className="h-11"
              />
            )}
          />
          {errors.paymentTypeId && (
            <small className="text-red-600">{errors.paymentTypeId.message}</small>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Credit Days / Due since:</label>
          <p className="text-sm text-gray-900 py-2.5 px-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            {distributorDetails
              ? `${distributorDetails.creditDays || 0} days${distributorDetails.dueSince ? ` / ${distributorDetails.dueSince} days overdue` : ""}`
              : "N/A"}
          </p>
        </div>

        {/* Row 3 - Billing Address and Delivery Location */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Billing Address:</label>
          <p className="text-sm text-gray-900 whitespace-pre-line py-2.5 px-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            {formatBillingAddress(distributorDetails) || "N/A"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Delivery Location: <span className="text-red-600">*</span>
          </label>
          <Controller
            name="deliveryLocationId"
            control={control}
            render={({ field }) => (
              <Dropdown
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                options={deliveryLocations}
                optionLabel="addressName"
                optionValue="id"
                placeholder="Select an additional address"
                filter
                loading={loadingLocations}
                className="h-11"
                itemTemplate={(item: DistributorShippingAddressDto) => (
                  <div className="flex flex-col py-1">
                    <div className="font-medium">{item.addressName}</div>
                    <div className="text-sm text-gray-500">{item.address1},</div>
                  </div>
                )}
              />
            )}
          />
          {errors.deliveryLocationId && (
            <small className="text-red-600">{errors.deliveryLocationId.message}</small>
          )}
        </div>
      </div>
    </div>
  );
}
