import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { formatCurrency } from "@/lib/utils/formatters";
import { SaleOrderStatusBadge } from "./sale-order-status-badge";
import type { SaleOrderDetailDto } from "@/types";

interface SaleOrderSummaryProps {
  saleOrder: SaleOrderDetailDto;
}

export function SaleOrderSummary({ saleOrder }: SaleOrderSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Order Header */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Order Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold">{saleOrder.orderNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span>{new Date(saleOrder.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Delivery:</span>
                <span>
                  {saleOrder.expectedDeliveryDate
                    ? new Date(saleOrder.expectedDeliveryDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Type:</span>
                <span className="font-semibold">{saleOrder.paymentType || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <SaleOrderStatusBadge
                  statusId={saleOrder.statusId}
                  statusName={saleOrder.statusName}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Distributor Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{saleOrder.distributorName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Address:</span>
                <span className="text-right max-w-xs">{saleOrder.shippingAddress || "N/A"}</span>
              </div>
              {saleOrder.salespersonName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Salesperson:</span>
                  <span>{saleOrder.salespersonName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {saleOrder.notes && (
          <>
            <Divider />
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Notes:</h4>
              <p className="text-sm">{saleOrder.notes}</p>
            </div>
          </>
        )}
      </Card>

      {/* Order Items */}
      <Card>
        <h3 className="text-lg font-semibold mb-3">Order Items</h3>
        <DataTable
          value={saleOrder.items || []}
          size="small"
          showGridlines
          responsiveLayout="scroll"
        >
          <Column field="skuCode" header="SKU Code" style={{ minWidth: "120px" }} />
          <Column field="skuName" header="Product Name" style={{ minWidth: "200px" }} />
          <Column
            field="quantity"
            header="Quantity"
            style={{ minWidth: "100px" }}
            className="text-right"
          />
          <Column
            field="unitPrice"
            header="Unit Price"
            body={(rowData) => formatCurrency(rowData.unitPrice)}
            style={{ minWidth: "120px" }}
            className="text-right"
          />
          <Column
            field="discountPercent"
            header="Discount %"
            body={(rowData) => `${rowData.discountPercent}%`}
            style={{ minWidth: "100px" }}
            className="text-right"
          />
          <Column
            field="taxPercent"
            header="GST %"
            body={(rowData) => `${rowData.taxPercent}%`}
            style={{ minWidth: "100px" }}
            className="text-right"
          />
          <Column
            field="lineTotal"
            header="Line Total"
            body={(rowData) => formatCurrency(rowData.lineTotal)}
            style={{ minWidth: "120px" }}
            className="text-right font-semibold"
          />
        </DataTable>
      </Card>

      {/* Order Summary */}
      <Card>
        <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2 max-w-md ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(saleOrder.subTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount:</span>
            <span className="text-red-600">- {formatCurrency(saleOrder.discountAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (GST):</span>
            <span>{formatCurrency(saleOrder.taxAmount)}</span>
          </div>
          <Divider />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span className="text-primary">{formatCurrency(saleOrder.totalAmount)}</span>
          </div>
        </div>
      </Card>

      {/* Approval Information */}
      {(saleOrder.distributorApprovedAt || saleOrder.approvedAt) && (
        <Card>
          <h3 className="text-lg font-semibold mb-3">Approval Information</h3>
          <div className="space-y-2 text-sm">
            {saleOrder.distributorApprovedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Distributor Approved:</span>
                <span>
                  {new Date(saleOrder.distributorApprovedAt).toLocaleString()}
                  {saleOrder.distributorApprovedBy && ` by ${saleOrder.distributorApprovedBy}`}
                </span>
              </div>
            )}
            {saleOrder.approvedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Final Approved:</span>
                <span>
                  {new Date(saleOrder.approvedAt).toLocaleString()}
                  {saleOrder.approvedBy && ` by ${saleOrder.approvedBy}`}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
