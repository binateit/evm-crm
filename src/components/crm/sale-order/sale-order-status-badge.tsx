import { Badge } from "primereact/badge";
import { SaleOrderStatus } from "@/types";

interface SaleOrderStatusBadgeProps {
  statusId: number;
  statusName: string | null;
}

export function SaleOrderStatusBadge({ statusId, statusName }: SaleOrderStatusBadgeProps) {
  const getStatusSeverity = (status: number): "success" | "info" | "warning" | "danger" | null => {
    switch (status) {
      case SaleOrderStatus.Draft:
        return "info";
      case SaleOrderStatus.PendingDistributorApproval:
        return "warning";
      case SaleOrderStatus.DistributorApproved:
        return "info";
      case SaleOrderStatus.Approved:
        return "success";
      case SaleOrderStatus.Rejected:
        return "danger";
      case SaleOrderStatus.Cancelled:
        return "danger";
      case SaleOrderStatus.Shipped:
        return "info";
      case SaleOrderStatus.Delivered:
        return "success";
      case SaleOrderStatus.Completed:
        return "success";
      default:
        return null;
    }
  };

  return (
    <Badge
      value={statusName || "Unknown"}
      severity={getStatusSeverity(statusId)}
      className="text-sm"
    />
  );
}
