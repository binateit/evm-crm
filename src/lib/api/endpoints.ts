// API Endpoints for Distributor Portal
// Subset of endpoints relevant to distributors

export const ENDPOINTS = {
  // Sale Orders - Distributor specific
  SALE_ORDER: {
    SEARCH: "/v1/crm/SaleOrders/search",
    CREATE: "/v1/crm/SaleOrders",
    UPDATE: (id: string) => `/v1/crm/SaleOrders/${id}`,
    DELETE: (id: string) => `/v1/crm/SaleOrders/${id}`,
    SUBMIT: (id: string) => `/v1/crm/SaleOrders/${id}/submit`,
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
    MY_PROMOTIONS: "/v1/crm/promotions/my-promotions",
    BY_ID: (id: string) => `/v1/crm/promotions/${id}`,
    TYPES: "/v1/crm/promotions/types",
    REQUIREMENT_TYPES: "/v1/crm/promotions/requirement-types",
  },

  // Pricing List
  PRICING_LIST: {
    PIMS_GENERAL: "/v1/pims/SKUs/pricing-list", // General PIMS pricing list
    MY_PRICING: "/v1/crm/distributors/my/pricing-list", // Distributor-specific pricing list
  },

  // Stocks
  STOCK: {
    SEARCH: "/v1/pims/stocks/search",
    SUMMARY_SEARCH: "/v1/pims/stocks/summary/search",
    BY_SKU_ID: (skuId: string) => `/v1/pims/stocks/sku/${skuId}`,
  },

  // Distributor Profile & Addresses
  DISTRIBUTOR: {
    BY_ID: (id: string) => `/v1/crm/Distributors/${id}`,
    FOR_SALE_ORDER: "/v1/crm/distributors/for-sale-order",
    MY_FOR_SALE_ORDER: "/v1/crm/distributors/my/for-sale-order",
    MY_PROFILE: "/v1/crm/distributors/my/profile",
    ACCEPT_TERMS: (id: string) => `/v1/crm/Distributors/${id}/accept-terms`,
    MY_ACCEPT_TERMS: "/v1/crm/distributors/my/accept-terms",
    MY_SKUS: "/v1/crm/distributors/my/skus",
    MY_SKU_DETAILS: (skuId: string) => `/v1/crm/distributors/my/skus/${skuId}`,
    MY_ORDERS_BY_TRACK: (track: string) => `/v1/crm/distributors/my/orders/${track}`,
    MY_ORDER_BY_ID: (orderId: string) => `/v1/crm/distributors/my/orders/${orderId}`,
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
    PAYMENT_TYPES: "/v1/crm/paymenttypes/dropdown",
  },

  // Purchase Orders (alias to Sale Orders - same backend endpoint)
  PURCHASE_ORDER: {
    SEARCH: "/v1/crm/SaleOrders/search",
    CREATE: "/v1/crm/SaleOrders",
    UPDATE: (id: string) => `/v1/crm/SaleOrders/${id}`,
    DELETE: (id: string) => `/v1/crm/SaleOrders/${id}`,
    SUBMIT: (id: string) => `/v1/crm/SaleOrders/${id}/submit`,
    BY_DISTRIBUTOR: (distributorId: string) => `/v1/crm/SaleOrders/by-distributor/${distributorId}`,
    BY_ID: (id: string) => `/v1/crm/SaleOrders/${id}`,
  },

  // Distributor Stock Submissions - My submissions
  DISTRIBUTOR_STOCK_SUBMISSION: {
    MY_SUBMISSIONS: "/v1/crm/distributorstocksubmissions/my",
    MY_SUBMISSION_BY_ID: (id: string) => `/v1/crm/distributorstocksubmissions/my/${id}`,
    MY_HISTORY: "/v1/crm/distributorstocksubmissions/my/history",
    CREATE: "/v1/crm/distributorstocksubmissions/my/create",
    UPDATE: (id: string) => `/v1/crm/distributorstocksubmissions/my/${id}`,
    DELETE: (id: string) => `/v1/crm/distributorstocksubmissions/my/${id}`,
    SUBMIT: (id: string) => `/v1/crm/distributorstocksubmissions/my/${id}/submit`,
  },
} as const;
