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

      <PageHeader title="EVM Price List" description="View current pricing for all products" />

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
              // Extract just the number from warranty period (e.g., "1 YEAR" -> "1"), default to "1"
              const warrantyNumber = item.warrantyPeriod?.toString().replace(/[^\d]/g, "") || "1";

              return (
                <div
                  key={item.skuId}
                  className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                >
                  <div className="p-4 flex flex-col relative">
                    {/* Warranty Badge - Top Right */}
                    <div className="absolute top-4 right-4">
                      <div className="relative w-24 h-10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/warranty.png"
                          alt="Warranty"
                          className="w-full h-full object-contain"
                        />
                        {/* Warranty number overlay on blue circle */}
                        <div className="absolute inset-0 flex items-center justify-start pl-3">
                          <span className="text-white font-bold text-lg">{warrantyNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Name - Top */}
                    <h3 className="font-semibold text-gray-900 text-base leading-tight mb-3 text-center break-words pr-28">
                      {item.skuName}
                    </h3>

                    {/* Model */}
                    <div className="text-xs mb-3 text-center">
                      <p className="text-gray-500 break-words">
                        <span className="font-medium">Model:</span> {item.partCode || "-"}
                      </p>
                    </div>

                    {/* Image - Centered */}
                    <div className="flex justify-center mb-4">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={item.skuName}
                          className="w-64 h-64 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-64 h-64 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          <i className="pi pi-image text-4xl" />
                        </div>
                      )}
                    </div>

                    {/* Pricing Section - Bottom */}
                    <div className="flex items-center justify-center gap-12 pt-3 border-t border-gray-100">
                      {/* MRP */}
                      <div className="text-center">
                        <p className="text-xs text-gray-600 font-semibold mb-1">MRP</p>
                        <p className="text-2xl font-bold text-blue-600 whitespace-nowrap">
                          ₹{item.mrp?.toFixed(2)}
                        </p>
                      </div>

                      {/* Selling Price with + */}
                      <div className="text-center">
                        <p className="text-xs text-gray-600 font-semibold mb-1">DP</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-green-600 whitespace-nowrap">
                            ₹{item.sellingPrice?.toFixed(2)}+
                          </p>
                        </div>
                      </div>
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
