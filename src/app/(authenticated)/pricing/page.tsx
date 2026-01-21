"use client";

import { useEffect, useState } from "react";
import { pricingService } from "@/lib/api/services/pricing.service";
import type { DistributorPricingDto, GetDistributorPricingListQuery } from "@/types/pricing.types";
import { DEFAULT_PRICING_QUERY, PRICING_SORT_OPTIONS } from "@/types/pricing.types";
import { PageHeader, PageBreadcrumb, Card, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils/formatters";
import { Search, Tag, Percent, Package } from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Paginator, type PaginatorPageChangeEvent } from "primereact/paginator";
import { Skeleton } from "primereact/skeleton";

export default function PricingListPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton width="100%" height="200px" className="mb-3" />
                <Skeleton width="100%" height="1.5rem" className="mb-2" />
                <Skeleton width="60%" height="1rem" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.skuId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                    {product.primaryImageUrl ? (
                      <img
                        src={product.primaryImageUrl}
                        alt={product.skuName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    {product.discountPercentage && product.discountPercentage > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {product.discountPercentage.toFixed(0)}% OFF
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-2">
                    {/* Part Code */}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Tag className="w-3 h-3" />
                      {product.partCode}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                      {product.skuName}
                    </h3>

                    {/* Brand & Category */}
                    <div className="text-xs text-gray-600">
                      {product.brandName && (
                        <span className="font-medium">{product.brandName}</span>
                      )}
                      {product.categoryName && (
                        <span className="ml-1">• {product.categoryName}</span>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 border-t">
                      {product.mrp &&
                      product.sellingPrice &&
                      product.mrp !== product.sellingPrice ? (
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              {formatCurrency(product.sellingPrice)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {formatCurrency(product.mrp)}
                            </span>
                          </div>
                          {product.discountAmount && (
                            <p className="text-xs text-green-600">
                              Save {formatCurrency(product.discountAmount)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(product.sellingPrice || product.mrp || 0)}
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                      <span>UOM: {product.uom}</span>
                      {product.gstApplicable && <span>GST: {product.gstPercentage}%</span>}
                    </div>

                    {/* Status */}
                    <div className="pt-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          product.statusName === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.statusName}
                      </span>
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
