import { formatCurrency, formatNumber, formatDate } from "@/lib/utils/formatters";

// Two-line cell with primary and secondary text
export function TwoLineCell({
  primary,
  secondary,
}: {
  primary: string;
  secondary?: string | null;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-gray-900">{primary}</span>
      {secondary && <span className="text-xs text-gray-500">{secondary}</span>}
    </div>
  );
}

// Status badge with color mapping
// Supports both "status" prop (for text-based lookup) and "value"/"severity" props (for explicit severity)
export function StatusBadge({
  status,
  value,
  severity,
  colorMap,
}: {
  status?: string;
  value?: string;
  severity?: "success" | "warning" | "danger" | "info" | "secondary";
  colorMap?: Record<string, string>;
}) {
  const defaultColorMap: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    approved: "bg-green-100 text-green-700",
    success: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    submitted: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    failed: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    inactive: "bg-gray-100 text-gray-600",
    disabled: "bg-gray-100 text-gray-600",
    draft: "bg-gray-100 text-gray-600",
    refunded: "bg-blue-100 text-blue-700",
  };

  const severityColorMap: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    secondary: "bg-gray-100 text-gray-600",
  };

  const displayText = value ?? status ?? "Unknown";

  let colorClass: string;
  if (severity) {
    colorClass = severityColorMap[severity] ?? "bg-gray-100 text-gray-600";
  } else {
    const colors = colorMap ?? defaultColorMap;
    colorClass = colors[displayText.toLowerCase()] ?? "bg-gray-100 text-gray-600";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
    >
      {displayText}
    </span>
  );
}

// Currency cell
export function CurrencyCell({ value }: { value: number }) {
  return (
    <span className="text-sm font-semibold text-gray-900 tabular-nums">
      {formatCurrency(value)}
    </span>
  );
}

// Number cell
export function NumberCell({ value }: { value: number }) {
  return <span className="text-sm text-gray-900 tabular-nums">{formatNumber(value)}</span>;
}

// Date cell
export function DateCell({ value }: { value: string | null | undefined }) {
  return <span className="text-sm text-gray-600">{value ? formatDate(value) : "-"}</span>;
}

// Text cell
export function TextCell({ value }: { value: string | null | undefined }) {
  return <span className="text-sm text-gray-600">{value ?? "-"}</span>;
}
