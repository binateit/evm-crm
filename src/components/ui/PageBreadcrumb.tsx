import { BreadCrumb } from "primereact/breadcrumb";
import type { MenuItem } from "primereact/menuitem";
import { Home } from "lucide-react";

export interface PageBreadcrumbProps {
  items: MenuItem[];
  homeUrl?: string;
  className?: string;
}

export function PageBreadcrumb({
  items,
  homeUrl = "/dashboard",
  className = "",
}: PageBreadcrumbProps) {
  const breadcrumbHome: MenuItem = {
    icon: () => <Home className="w-4 h-4" />,
    url: homeUrl,
  };

  return <BreadCrumb model={items} home={breadcrumbHome} className={className} />;
}
