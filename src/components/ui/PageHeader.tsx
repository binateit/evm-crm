export interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  subtitle,
  actions,
  className = "",
}: PageHeaderProps) {
  const text = subtitle || description;
  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {text && <p className="mt-1 text-sm text-gray-500">{text}</p>}
      </div>
      {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
    </div>
  );
}
