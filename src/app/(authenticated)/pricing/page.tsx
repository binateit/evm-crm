"use client";

import { useEffect, useState } from "react";
import { pricingService } from "@/lib/api/services/pricing.service";
import type { DistributorPricingDto, GetDistributorPricingListQuery } from "@/types/pricing.types";
import { DEFAULT_PRICING_QUERY, PRICING_SORT_OPTIONS } from "@/types/pricing.types";
import { PageHeader, PageBreadcrumb, Card, CardContent } from "@/components/ui";
import { Search, Tag, Package } from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import { Skeleton } from "primereact/skeleton";

export default function PricingListPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const [products, setProducts] = useState<DistributorPricingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [query, setQuery] = useState<GetDistributorPricingListQuery>(DEFAULT_PRICING_QUERY);

  // Debounce search keyword
  const [searchKeyword, setSearchKeyword] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((prev) => ({ ...prev, keyword: searchKeyword || null, pageNumber: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Fetch pricing list
  useEffect(() => {
    async function fetchPricingList() {
      try {
        setLoading(true);
        const response = await pricingService.getMyPricingList(query);
        setProducts(response.data);
        setTotalRecords(response.pagination.totalCount);
      } catch (err) {
        console.error("Error fetching pricing list:", err);
        setProducts([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    }

    fetchPricingList();
  }, [query]);

  const handlePageChange = (event: PaginatorPageChangeEvent) => {
    setQuery((prev) => ({
      ...prev,
      pageNumber: event.page + 1,
      pageSize: event.rows,
    }));
  };

  const handleSortChange = (value: string) => {
    setQuery((prev) => ({
      ...prev,
      sortBy: value as "partcode" | "skuname" | "mrp" | "sellingprice" | "discount" | null,
      pageNumber: 1,
    }));
  };

  const breadcrumbItems = [{ label: "Pricing List", url: "/pricing" }];

  const sortDirectionOptions = [
    { value: "asc", label: "Low to High" },
    { value: "desc", label: "High to Low" },
  ];

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
  };

  return (
    <div className="space-y-4">
      <PageBreadcrumb items={breadcrumbItems} />
      <PageHeader
        title="Pricing List"
        subtitle="Browse products available for purchase with current prices"
      />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="flex-1">
              <span className="p-input-icon-left w-full">
                <Search className="w-4 h-4" />
                <InputText
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search by Part Code or Product Name..."
                  className="w-full"
                />
              </span>
            </div>

            {/* Sort By */}
            <div>
              <Dropdown
                value={query.sortBy}
                options={PRICING_SORT_OPTIONS}
                onChange={(e) => handleSortChange(e.value)}
                placeholder="Sort by"
                className="w-full"
              />
            </div>

            {/* Sort Direction */}
            <div>
              <Dropdown
                value={query.sortDirection}
                options={sortDirectionOptions}
                onChange={(e) =>
                  setQuery((prev) => ({ ...prev, sortDirection: e.value, pageNumber: 1 }))
                }
                placeholder="Order"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Skeleton
                    width="100%"
                    height="160px"
                    className="md:w-[128px] md:h-[128px] flex-shrink-0"
                  />
                  <div className="flex-1">
                    <Skeleton width="60%" height="1rem" className="mb-2" />
                    <Skeleton width="100%" height="1.5rem" className="mb-2" />
                    <Skeleton width="80%" height="1rem" className="mb-2" />
                    <Skeleton width="70%" height="1rem" />
                  </div>
                  <div className="w-full md:w-[200px] border-t md:border-t-0 pt-3 md:pt-0">
                    <Skeleton width="100%" height="2rem" className="mb-2" />
                    <Skeleton width="100%" height="2rem" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500">
              {searchKeyword
                ? "Try adjusting your search criteria"
                : "No products are currently available for your allocated categories"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {products.map((product) => (
              <Card key={product.skuId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 relative">
                    {/* Status Badge - Absolute positioned */}
                    <span
                      className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full z-10 ${
                        product.statusName === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.statusName}
                    </span>

                    {/* Left: Product Image */}
                    <div className="relative h-40 md:h-32 md:w-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {product.primaryImageUrl ? (
                        <img
                          src={getImageUrl(product.primaryImageUrl)}
                          alt={product.skuName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Center: Product Details */}
                    <div className="flex-1 min-w-0">
                      {/* Part Code */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Tag className="w-3 h-3" />
                        <span className="font-mono">{product.partCode}</span>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-gray-900 text-base mb-2 pr-16 md:pr-0">
                        {product.skuName}
                      </h3>

                      {/* Model & Brand */}
                      <div className="text-sm text-gray-600 mb-2 flex flex-wrap gap-x-3">
                        {product.modelNumber && <span>Model: {product.modelNumber}</span>}
                        {product.brandName && <span>Brand: {product.brandName}</span>}
                      </div>

                      {/* HSN & Category Info */}
                      <div className="text-xs text-gray-500 flex flex-wrap gap-x-3">
                        <span>HSN: {product.hsnCode || "N/A"}</span>
                        {product.categoryName && <span>• {product.categoryName}</span>}
                      </div>
                    </div>

                    {/* Right: Pricing & Status */}
                    <div className="flex flex-col gap-2 md:min-w-[200px] md:items-end border-t md:border-t-0 pt-3 md:pt-0">
                      {/* Pricing Grid */}
                      <div className="grid grid-cols-2 gap-4 w-full">
                        {/* MRP */}
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">MRP</p>
                          <p className="text-xl font-bold text-blue-600">
                            ₹{product.mrp?.toFixed(2) || "0.00"}
                          </p>
                        </div>

                        {/* DP */}
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-1">DP</p>
                          <p className="text-xl font-bold text-green-600">
                            ₹{product.sellingPrice?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>

                      {/* Discount Badge */}
                      {product.discountAmount && product.discountAmount > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded px-3 py-1.5 w-full">
                          <p className="text-sm font-semibold text-red-600">
                            Discount: ₹{product.discountAmount.toFixed(2)} (
                            {product.discountPercentage?.toFixed(1)}%)
                          </p>
                        </div>
                      )}

                      {/* GST Info */}
                      <div className="text-xs text-gray-600 w-full md:text-right">
                        GST: {product.gstPercentage}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <Card>
            <CardContent className="p-2">
              <Paginator
                first={(query.pageNumber! - 1) * query.pageSize!}
                rows={query.pageSize!}
                totalRecords={totalRecords}
                rowsPerPageOptions={[10, 20, 30, 50]}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
