import { SortOrder } from "primereact/datatable";

// Base Filter
export interface BaseFilter {
  keyword?: string;
}

// DataTable Sort
export interface DataTableSort {
  sortField?: string;
  sortOrder?: SortOrder;
}

// Pagination Filter (extends BaseFilter and DataTableSort)
export interface PaginationFilter extends BaseFilter, DataTableSort {
  first?: number;
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string[];
}
