import { PaginationInfo } from "@/types/common/pagination.types";

/**
 * Calculate pagination display values
 */
export function calculatePaginationDisplay(
  first: number,
  pagination?: PaginationInfo,
  totalItems?: number,
  pageSize: number = 10
) {
  const total = totalItems ?? pagination?.totalCount ?? 0;
  const actualPageSize = pagination?.pageSize ?? pageSize;

  const startItem = total > 0 ? first + 1 : 0;
  const endItem = Math.min(first + actualPageSize, total);

  return {
    startItem,
    endItem,
    totalItems: total,
    hasItems: total > 0,
  };
}

/**
 * Paginator left template - Shows "Showing X to Y of Z items"
 */
export function createPaginatorLeft(
  first: number,
  pagination?: PaginationInfo,
  totalItems?: number,
  itemName: string = "items",
  pageSize: number = 10
) {
  const {
    startItem,
    endItem,
    totalItems: total,
    hasItems,
  } = calculatePaginationDisplay(first, pagination, totalItems, pageSize);

  if (!hasItems) {
    return null; // Don't show anything in paginatorLeft when empty - emptyMessage handles this
  }

  return (
    <span className="text-sm text-gray-600">
      Showing {startItem} to {endItem} of {total} {itemName}
    </span>
  );
}

/**
 * Paginator right template - Custom content for right side
 */
export function createPaginatorRight(content: React.ReactNode) {
  return <div className="flex items-center gap-2">{content}</div>;
}
