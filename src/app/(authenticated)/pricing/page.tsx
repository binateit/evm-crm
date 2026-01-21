"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Paginator } from "primereact/paginator";
import { Search, X } from "lucide-react";

import { PageBreadcrumb, PageHeader } from "@/components/ui";
import { pricingService } from "@/lib/api/services/pricing.service";

const breadcrumbItems = [{ label: "CRM", url: "/crm" }, { label: "Pricing List" }];

export default function PricingListPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");

  // Pricing list query
  const { data, isLoading } = useQuery({
    queryKey: ["pricing-list", pageNumber, pageSize, keyword],
    queryFn: () =>
      pricingService.getMyPricingList({
        pageNumber,
        pageSize,
        keyword: keyword || undefined,
      }),
  });

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPageNumber(1);
  };

  const handleClearSearch = () => {
    setKeyword("");
    setPageNumber(1);
  };

  const onPageChange = (e: { first: number; rows: number }) => {
    const newPageNumber = Math.floor(e.first / e.rows) + 1;
    setPageNumber(newPageNumber);
    setPageSize(e.rows);
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
  };

  const items = data?.data || [];
  const totalRecords = data?.pagination?.totalCount || 0;

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageBreadcrumb items={breadcrumbItems} />

      <PageHeader title="Pricing List" description="View current pricing for all products" />

      {/* Search Bar */}
      <div className="flex justify-end">
        <div className="w-full md:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU name, part code, or model..."
              value={keyword}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {keyword && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <i className="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4" />
            <p className="text-gray-600 font-medium">Loading pricing list...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="border border-gray-200 rounded-lg bg-white p-12 text-center">
          <i className="pi pi-inbox text-5xl text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium">No products found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => {
              const imageUrl = item.primaryImageUrl ? getImageUrl(item.primaryImageUrl) : "";

              return (
                <div
                  key={item.skuId}
                  className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden"
                >
                  {/* Product Header with Image and Basic Info */}
                  <div className="flex gap-4 p-4 border-b border-gray-200">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={item.skuName}
                          className="w-32 h-32 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          <i className="pi pi-image text-3xl" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Name and Code */}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                          {item.skuName}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          <span className="font-medium">Code:</span> {item.partCode}
                        </p>
                      </div>

                      {/* Model and Brand in one line */}
                      <div className="text-xs">
                        <p className="text-gray-500">
                          <span className="font-medium">Model:</span> {item.modelNumber || "-"}
                        </p>
                        <p className="text-gray-500">
                          <span className="font-medium">Brand:</span> {item.brandName || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-transparent">
                    <div className="flex items-end justify-between mb-3">
                      {/* MRP */}
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">
                          MRP
                        </p>
                        <p className="text-lg font-bold text-blue-600">₹{item.mrp?.toFixed(2)}</p>
                      </div>

                      {/* Selling Price */}
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-1">
                          DP
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{item.sellingPrice?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Discount Badge */}
                    {/* {item.discountAmount !== null &&
                      item.discountAmount !== undefined &&
                      item.discountAmount > 0 && (
                        <div className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-semibold">
                          Discount: ₹{item.discountAmount.toFixed(2)} (
                          {item.discountPercentage?.toFixed(1)}%)
                        </div>
                      )} */}
                  </div>

                  {/* Footer: Category, GST, Status */}
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-gray-500 font-medium">{item.subCategoryName}</p>
                      <p className="text-gray-500">
                        HSN: <span className="font-medium">{item.hsnCode || "-"}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
                          {item.statusName || "Active"}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        GST: <span className="font-semibold">{item.gstPercentage}%</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginator */}
          {totalRecords > pageSize && (
            <div className="border border-gray-200 rounded-lg bg-white p-5">
              <Paginator
                first={(pageNumber - 1) * pageSize}
                rows={pageSize}
                totalRecords={totalRecords}
                onPageChange={onPageChange}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                rowsPerPageOptions={[12, 20, 24, 48]}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
