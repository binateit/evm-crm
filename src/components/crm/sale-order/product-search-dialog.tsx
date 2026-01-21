"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { skuService, type AllocatedSkuDto } from "@/lib/api/services/sku.service";
import { formatCurrency } from "@/lib/utils/formatters";
import { Search, Plus } from "lucide-react";

interface ProductSearchDialogProps {
  visible: boolean;
  onHide: () => void;
  onSelect: (product: AllocatedSkuDto) => void;
  selectedProductIds?: string[];
  distributorId: string;
}

export function ProductSearchDialog({
  visible,
  onHide,
  onSelect,
  selectedProductIds = [],
  distributorId,
}: ProductSearchDialogProps) {
  const [products, setProducts] = useState<AllocatedSkuDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (visible && distributorId) {
      searchProducts();
    }
  }, [visible, keyword, page, distributorId]);

  const searchProducts = async () => {
    if (!distributorId) return;

    try {
      setLoading(true);
      const response = await skuService.searchAllocatedSkus({
        keyword: keyword || null,
        pageNumber: page,
        pageSize,
      });
      setProducts(response.data);
      setTotalRecords(response.pagination.totalCount);
    } catch (error) {
      console.error("Error searching allocated products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    searchProducts();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectProduct = (product: AllocatedSkuDto) => {
    onSelect(product);
    setKeyword("");
    setPage(1);
  };

  const isProductSelected = (productId: string) => {
    return selectedProductIds.includes(productId);
  };

  const actionTemplate = (rowData: AllocatedSkuDto) => {
    const isSelected = isProductSelected(rowData.skuId ?? "");
    return (
      <Button
        icon={<Plus className="w-4 h-4" />}
        rounded
        text
        severity={isSelected ? "secondary" : "success"}
        onClick={() => handleSelectProduct(rowData)}
        disabled={isSelected}
        tooltip={isSelected ? "Already added" : "Add to order"}
        tooltipOptions={{ position: "left" }}
      />
    );
  };

  const stockTemplate = (rowData: AllocatedSkuDto) => {
    const stock = rowData.availableStock || 0;
    const severity = stock > 50 ? "text-green-600" : stock > 0 ? "text-yellow-600" : "text-red-600";
    return <span className={severity}>{stock}</span>;
  };

  return (
    <Dialog
      header="Search Allocated Products"
      visible={visible}
      onHide={onHide}
      style={{ width: "90vw", maxWidth: "1200px" }}
      maximizable
    >
      <div className="space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            Only products from your allocated categories are shown below.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <span className="p-input-icon-left flex-1">
            <Search className="w-4 h-4" />
            <InputText
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by product name, SKU code, or part code..."
              className="w-full"
            />
          </span>
          <Button
            label="Search"
            icon={<Search className="w-4 h-4 mr-2" />}
            onClick={handleSearch}
            loading={loading}
          />
        </div>

        {/* Product Table */}
        <DataTable
          value={products}
          loading={loading}
          paginator
          rows={pageSize}
          totalRecords={totalRecords}
          first={(page - 1) * pageSize}
          onPage={(e) => setPage(Math.floor(e.first / e.rows) + 1)}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
          size="small"
          emptyMessage="No allocated products found. Please contact your administrator."
        >
          <Column field="skuCode" header="SKU Code" style={{ minWidth: "120px" }} />
          <Column field="partCode" header="Part Code" style={{ minWidth: "120px" }} />
          <Column field="skuName" header="Product Name" style={{ minWidth: "250px" }} />
          <Column field="brandName" header="Brand" style={{ minWidth: "120px" }} />
          <Column field="categoryName" header="Category" style={{ minWidth: "150px" }} />
          <Column
            field="availableStock"
            header="Stock"
            body={stockTemplate}
            style={{ minWidth: "100px" }}
            className="text-right"
          />
          <Column
            field="unitPrice"
            header="Rate"
            body={(rowData) => formatCurrency(rowData.unitPrice)}
            style={{ minWidth: "120px" }}
            className="text-right"
          />
          <Column
            field="discountPercent"
            header="Discount %"
            body={(rowData) => `${rowData.discountPercent || 0}%`}
            style={{ minWidth: "100px" }}
            className="text-right"
          />
          <Column
            field="gstPercent"
            header="GST %"
            body={(rowData) => `${rowData.gstPercent || 0}%`}
            style={{ minWidth: "100px" }}
            className="text-right"
          />
          <Column
            body={actionTemplate}
            header="Action"
            style={{ width: "80px" }}
            frozen
            alignFrozen="right"
          />
        </DataTable>
      </div>
    </Dialog>
  );
}
