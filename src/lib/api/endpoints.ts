// API Endpoints for Distributor Portal
// Subset of endpoints relevant to distributors

export const ENDPOINTS = {
  // Sale Orders - Distributor specific
  SALE_ORDER: {
    SEARCH: "/v1/crm/SaleOrders/search",
    BY_DISTRIBUTOR: (distributorId: string) => `/v1/crm/SaleOrders/by-distributor/${distributorId}`,
    BY_ID: (id: string) => `/v1/crm/SaleOrders/${id}`,
    PENDING_DISTRIBUTOR_APPROVAL: "/v1/crm/SaleOrders/pending-distributor-approval",
    PENDING_DISTRIBUTOR_APPROVAL_SEARCH: "/v1/crm/SaleOrders/pending-distributor-approval/search",
    DISTRIBUTOR_APPROVE: (id: string) => `/v1/crm/SaleOrders/${id}/distributor-approve`,
    DISTRIBUTOR_REJECT: (id: string) => `/v1/crm/SaleOrders/${id}/distributor-reject`,
    HISTORY: (id: string) => `/v1/crm/SaleOrders/${id}/history`,
    SUMMARY: "/v1/crm/SaleOrders/summary",
  },

  // Promotions
  PROMOTION: {
    SEARCH: "/v1/crm/promotions/search",
    BY_ID: (id: string) => `/v1/crm/promotions/${id}`,
    TYPES: "/v1/crm/promotions/types",
    REQUIREMENT_TYPES: "/v1/crm/promotions/requirement-types",
  },

  // Pricing List
  PRICING_LIST: "/v1/pims/SKUs/pricing-list",

  // Stocks
  STOCK: {
    SEARCH: "/v1/pims/stocks/search",
    SUMMARY_SEARCH: "/v1/pims/stocks/summary/search",
    BY_SKU_ID: (skuId: string) => `/v1/pims/stocks/sku/${skuId}`,
  },

  // Distributor Profile & Addresses
  DISTRIBUTOR: {
    BY_ID: (id: string) => `/v1/crm/Distributors/${id}`,
  },

  // Shipping Addresses
  SHIPPING_ADDRESS: {
    BY_DISTRIBUTOR: (distributorId: string) =>
      `/v1/crm/DistributorShippingAddresses/by-distributor/${distributorId}`,
    BY_ID: (id: string) => `/v1/crm/DistributorShippingAddresses/${id}`,
    CREATE: "/v1/crm/DistributorShippingAddresses",
    UPDATE: (id: string) => `/v1/crm/DistributorShippingAddresses/${id}`,
    DELETE: (id: string, distributorId: string) =>
      `/v1/crm/DistributorShippingAddresses/${id}/distributor/${distributorId}`,
    SET_DEFAULT: (id: string, distributorId: string) =>
      `/v1/crm/DistributorShippingAddresses/${id}/distributor/${distributorId}/set-default`,
  },

  // Dropdown endpoints
  DROPDOWN: {
    BRANDS: "/v1/pims/Brands/dropdown",
    MASTER_CATEGORIES: "/v1/pims/MasterCategories/dropdown",
    CATEGORIES: "/v1/pims/Categories/dropdown",
    SUB_CATEGORIES: "/v1/pims/SubCategories/dropdown",
    WAREHOUSE_LOCATIONS: "/v1/admin/WarehouseLocations/dropdown",
    STATES: "/v1/admin/States/dropdown",
    DISTRICTS: "/v1/admin/Districts/dropdown",
  },
} as const;
