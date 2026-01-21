/**
 * Product image information in pricing list
 */
export interface PricingImageDto {
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

/**
 * SKU pricing information for distributor
 * Shows products available to distributor based on assigned subcategories
 */
export interface DistributorPricingDto {
  // SKU Identification
  skuId: string;
  partCode: string;
  skuName: string;
  skuShortName: string | null;

  // Product Hierarchy
  brandName: string | null;
  brandId: string | null;
  masterCategoryName: string | null;
  masterCategoryId: string | null;
  categoryName: string | null;
  categoryId: string | null;
  subCategoryName: string | null;
  subCategoryId: string | null;

  // Product Details
  modelNumber: string | null;
  variant: string | null;
  colorName: string | null;
  warrantyPeriod: string | null;

  // Pricing
  mrp: number | null;
  sellingPrice: number | null;
  discountAmount: number | null; // Calculated: MRP - SellingPrice
  discountPercentage: number | null; // Calculated: ((MRP - SellingPrice) / MRP) * 100

  // Tax Information
  uom: string;
  hsnCode: string | null;
  gstPercentage: number;
  gstApplicable: boolean;

  // Status
  statusName: string;

  // Price Effective Date
  priceEffectiveFrom: string | null; // ISO DateTime

  // Images
  primaryImageUrl: string | null;
  images: PricingImageDto[];
}

/**
 * Query parameters for fetching distributor pricing list
 */
export interface GetDistributorPricingListQuery {
  // Pagination
  pageNumber?: number;
  pageSize?: number;

  // Search
  keyword?: string | null;

  // Hierarchy Filters
  brandId?: string | null;
  masterCategoryId?: string | null;
  categoryId?: string | null;
  subCategoryId?: string | null;

  // Price Range Filters
  minMRP?: number | null;
  maxMRP?: number | null;
  minSellingPrice?: number | null;
  maxSellingPrice?: number | null;

  // Sorting
  sortBy?: "skuname" | "partcode" | "mrp" | "sellingprice" | "discount" | null;
  sortDirection?: "asc" | "desc" | null;
}

/**
 * Default values for pricing list query
 */
export const DEFAULT_PRICING_QUERY: GetDistributorPricingListQuery = {
  pageNumber: 1,
  pageSize: 20,
  keyword: null,
  brandId: null,
  masterCategoryId: null,
  categoryId: null,
  subCategoryId: null,
  minMRP: null,
  maxMRP: null,
  minSellingPrice: null,
  maxSellingPrice: null,
  sortBy: "partcode",
  sortDirection: "asc",
};

/**
 * Sort options for pricing list
 */
export const PRICING_SORT_OPTIONS = [
  { value: "partcode", label: "Part Code" },
  { value: "skuname", label: "Product Name" },
  { value: "mrp", label: "MRP" },
  { value: "sellingprice", label: "Selling Price" },
  { value: "discount", label: "Discount Amount" },
];

/**
 * Sort direction options
 */
export const SORT_DIRECTION_OPTIONS = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];
