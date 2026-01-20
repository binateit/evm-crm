import { useState } from "react";
import type {
  DataTableFilterMeta,
  DataTableStateEvent,
  DataTableFilterEvent,
} from "primereact/datatable";

export interface PaginationModel {
  pageNumber?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 1 | -1 | 0 | null;
}

export interface UseDataTableStateReturn {
  first: number;
  filters: DataTableFilterMeta;
  paginationModel: PaginationModel;
  handlePageChange: (event: DataTableStateEvent) => void;
  handleFilterChange: (event: DataTableFilterEvent) => void;
  getOrderBy: () => string | undefined;
}

export function useDataTableState(): UseDataTableStateReturn {
  const [first, setFirst] = useState(0);
  const [filters, setFilters] = useState<DataTableFilterMeta>({});
  const [paginationModel, setPaginationModel] = useState<PaginationModel>({
    pageNumber: 1,
    pageSize: 10,
    sortField: undefined,
    sortOrder: null,
  });

  const handlePageChange = (event: DataTableStateEvent) => {
    const pageNumber = Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    const pageSize = event.rows ?? 10;

    setFirst(event.first ?? 0);
    setPaginationModel({
      pageNumber,
      pageSize,
      sortField: event.sortField,
      sortOrder: event.sortOrder,
    });
  };

  const handleFilterChange = (event: DataTableFilterEvent) => {
    setFilters(event.filters);
  };

  const getOrderBy = (): string | undefined => {
    if (!paginationModel.sortField) return undefined;
    const order = paginationModel.sortOrder === 1 ? "ASC" : "DESC";
    return `${paginationModel.sortField},${order}`;
  };

  return {
    first,
    filters,
    paginationModel,
    handlePageChange,
    handleFilterChange,
    getOrderBy,
  };
}
