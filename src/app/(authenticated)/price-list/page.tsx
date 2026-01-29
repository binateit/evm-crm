"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Paginator } from "primereact/paginator";
import { Checkbox } from "primereact/checkbox";

import { PageBreadcrumb, PageHeader } from "@/components/ui";
import { useDebounce } from "@/hooks";
import { pricingService } from "@/lib/api/services/pricing.service";

const breadcrumbItems = [{ label: "CRM", url: "/crm" }, { label: "Pricing List" }];

export default function PricingListPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  // Search keyword with debounce
  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebounce(searchKeyword, 300);

  // Pagination state
  const [first, setFirst] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  // EOL filter state
  const [showEOL, setShowEOL] = useState<boolean | null>(null);

  // Calculate current page number
  const pageNumber = Math.floor(first / pageSize) + 1;

  // Pricing list query - auto fetches when dependencies change
  const { data, isLoading } = useQuery({
    queryKey: ["pricing-list", debouncedKeyword, pageNumber, pageSize, showEOL],
    queryFn: () =>
      pricingService.getMyPricingList({
        pageNumber,
        pageSize,
        keyword: debouncedKeyword || undefined,
        isEOL: showEOL,
      }),
  });

  // Reset pagination when search changes
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    setFirst(0); // Reset to first page on new search
  };

  const onPageChange = (e: { first: number; rows: number }) => {
    setFirst(e.first);
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

      {/* Search Bar and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* EOL Filter Checkboxes */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="showAll"
              checked={showEOL === null}
              onChange={() => {
                setShowEOL(null);
                setFirst(0);
              }}
            />
            <label htmlFor="showAll" className="text-sm text-gray-700 cursor-pointer">
              Show All Products
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="showActive"
              checked={showEOL === false}
              onChange={() => {
                setShowEOL(false);
                setFirst(0);
              }}
            />
            <label htmlFor="showActive" className="text-sm text-gray-700 cursor-pointer">
              Active Products Only
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="showEOL"
              checked={showEOL === true}
              onChange={() => {
                setShowEOL(true);
                setFirst(0);
              }}
            />
            <label htmlFor="showEOL" className="text-sm text-gray-700 cursor-pointer">
              EOL Products Only
            </label>
          </div>
        </div>

        <div className="w-full md:w-96">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by SKU name, part code, or model..."
              value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchKeyword && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="pi pi-times" />
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
                  className={`border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                    item.isEOL ? "border-orange-400 bg-orange-50/30" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="p-4 flex flex-col relative h-full">
                    {/* EOL Badge - Top Left */}
                    {item.isEOL && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          EOL
                        </div>
                      </div>
                    )}

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
                    <h3 className="font-semibold text-gray-900 text-base leading-tight mb-3 text-center line-clamp-2 pr-28">
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
                    <div className="flex items-start justify-center gap-12 pt-3 border-t border-gray-100 mt-auto">
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
                            ₹{item.sellingPrice?.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">Exclusive of all taxes</p>
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
                first={first}
                rows={pageSize}
                totalRecords={totalRecords}
                onPageChange={onPageChange}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                rowsPerPageOptions={[6, 12, 24, 48]}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
