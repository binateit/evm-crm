"use client";

import type { ReactNode } from "react";
import { DataTable } from "primereact/datatable";
import type {
  DataTableFilterMeta,
  DataTablePassThroughOptions,
  DataTableStateEvent,
  DataTableFilterEvent,
} from "primereact/datatable";

import { createPaginatorLeft } from "@/lib/utils/pagination";
import { Search } from "lucide-react";
import { InputText } from "primereact/inputtext";
import { PAGE_SIZE_OPTIONS, type PaginatedResponse } from "@/types/common/pagination.types";

export interface AppDataTableProps<T> {
  // Required props - can accept either separate data/totalRecords OR PaginatedResponse
  data?: T[];
  value?: T[]; // Alias for data
  totalRecords?: number;
  response?: PaginatedResponse<T>;
  loading?: boolean;

  // Pagination props (from useDataTableState)
  first: number;
  pageSize?: number;
  rows?: number; // Alias for pageSize
  sortField?: string;
  sortOrder?: 1 | -1 | 0 | null;
  filters?: DataTableFilterMeta;
  onPageChange?: (event: DataTableStateEvent) => void;
  onPage?: (event: DataTableStateEvent) => void; // Alias for onPageChange
  onFilterChange?: (event: DataTableFilterEvent) => void;

  // Search props
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  // Customization
  entityName?: string;
  emptyMessage?: string;
  showPaginatorLeft?: boolean;
  paginator?: boolean;
  paginatorTemplate?: string;
  rowsPerPageOptions?: number[];
  header?: ReactNode;
  children: ReactNode;

  // Optional overrides
  dataKey?: string;
  pt?: DataTablePassThroughOptions;
  className?: string;
  paginatorClassName?: string;
}

export function AppDataTable<T extends object>({
  data: propData,
  value,
  totalRecords: propTotalRecords,
  response,
  loading = false,
  first,
  pageSize,
  rows,
  sortField,
  sortOrder,
  onPageChange,
  onPage,
  searchValue,
  onSearchChange,
  entityName = "records",
  emptyMessage,
  showPaginatorLeft = true,
  paginator,
  rowsPerPageOptions,
  children,
  dataKey = "id",
  className = "text-sm",
  paginatorClassName = "border-t border-gray-200",
}: AppDataTableProps<T>) {
  // Support both patterns: direct data/totalRecords OR PaginatedResponse
  // Also support aliases (value for data, rows for pageSize, onPage for onPageChange)
  const data = response?.data ?? value ?? propData ?? [];
  const totalRecords = response?.pagination?.totalCount ?? propTotalRecords ?? 0;
  const effectivePageSize = pageSize ?? rows ?? 10;
  const effectiveOnPageChange = onPageChange ?? onPage;

  const isSearchEnabled = onSearchChange !== undefined;

  const renderHeader = () => (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <InputText
        placeholder={`Search ${entityName}...`}
        value={searchValue ?? ""}
        onChange={(e) => onSearchChange?.(e.target.value)}
        disabled={!isSearchEnabled}
        className={`w-full h-10 pl-10 pr-4 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 ${
          isSearchEnabled
            ? "bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            : "bg-gray-100 text-gray-600"
        }`}
      />
    </div>
  );

  const header = renderHeader();

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <DataTable
        value={data as T[] & Record<string, unknown>[]}
        lazy
        dataKey={dataKey}
        paginator={paginator ?? totalRecords > 0}
        rows={effectivePageSize}
        showGridlines
        responsiveLayout="stack"
        rowsPerPageOptions={rowsPerPageOptions ?? PAGE_SIZE_OPTIONS}
        totalRecords={totalRecords}
        first={first}
        onPage={effectiveOnPageChange}
        onSort={effectiveOnPageChange}
        loading={loading}
        sortMode="single"
        sortField={sortField}
        sortOrder={sortOrder}
        emptyMessage={emptyMessage ?? `No ${entityName} found`}
        paginatorLeft={
          showPaginatorLeft
            ? createPaginatorLeft(first, undefined, totalRecords, entityName, effectivePageSize)
            : undefined
        }
        header={header}
        className={className}
        paginatorClassName={paginatorClassName}
        pt={{
          emptyMessage: {
            className: "text-center py-8",
          },
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
