"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
  DollarSign,
  Gift,
  FilePlus,
  Clock,
  History,
  ShoppingCart,
  ClipboardList,
  PackagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavSubItem {
  label: string;
  href: string;
  icon?: typeof LayoutDashboard;
}

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  children?: NavSubItem[];
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: ShoppingCart,
    label: "Purchase Orders",
    href: "/purchase-orders",
    children: [
      { label: "Create PO", href: "/purchase-orders/create", icon: FilePlus },
      { label: "Draft POs", href: "/purchase-orders/drafts", icon: FileText },
      { label: "Pending Approval", href: "/purchase-orders/pending", icon: Clock },
      { label: "Order History", href: "/purchase-orders/history", icon: History },
    ],
  },
  // {
  //   icon: Receipt,
  //   label: "My Invoices",
  //   href: "/invoices",
  // },
  // {
  //   icon: CreditCard,
  //   label: "Ledger & Outstanding",
  //   href: "/ledger",
  // },
  {
    icon: DollarSign,
    label: "Price List",
    href: "/price-list",
  },
  {
    icon: ClipboardList,
    label: "My Stock",
    href: "/stock-submissions",
    children: [
      { label: "New Submission", href: "/stock-submissions/create", icon: PackagePlus },
      { label: "View Submissions", href: "/stock-submissions", icon: ClipboardList },
    ],
  },
  // {
  //   icon: Target,
  //   label: "Target & Incentives",
  //   href: "/targets",
  //   children: [{ label: "View Targets", href: "/targets", icon: Target }],
  // },
  // {
  //   icon: Package,
  //   label: "Add / Update My Stock",
  //   href: "/stock/update",
  // },
  // {
  //   icon: BarChart3,
  //   label: "My Stock Levels",
  //   href: "/stock/levels",
  // },
  {
    icon: Gift,
    label: "Promotions & Offers",
    href: "/promotions",
    children: [{ label: "View all promotions", href: "/promotions", icon: Gift }],
  },
  // {
  //   icon: Newspaper,
  //   label: "News & Engagements",
  //   href: "/news",
  //   children: [{ label: "View all News", href: "/news", icon: Newspaper }],
  // },
  // {
  //   icon: HeadphonesIcon,
  //   label: "Support & Feedbacks",
  //   href: "/support",
  // },
  // {
  //   icon: User,
  //   label: "Profile",
  //   href: "/profile",
  // },
  // {
  //   icon: Users,
  //   label: "My Contacts",
  //   href: "/contacts",
  // },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = true, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand parent items that contain the active route
  useEffect(() => {
    const newExpandedItems: string[] = [];
    navItems.forEach((item) => {
      if (
        item.children?.some(
          (child) => pathname === child.href || pathname.startsWith(child.href + "/")
        )
      ) {
        newExpandedItems.push(item.label);
      }
    });
    setExpandedItems(newExpandedItems);
  }, [pathname]);

  // Auto-close drawer on route change (mobile only)
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ESC key to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isItemActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some(
        (child) => pathname === child.href || pathname.startsWith(child.href + "/")
      );
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const isChildActive = (child: NavSubItem) => {
    return pathname === child.href;
  };

  // Get initials from distributor name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "D";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo & Title */}
      <div className="flex items-center justify-between h-[60px] px-5 border-b border-gray-200 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/Hundia_Logo.png"
              alt="EVM Connect"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-sm font-semibold text-gray-900">Distributor Portal</span>
        </Link>

        {/* Close button - only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2.5 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.label);
          const active = isItemActive(item);

          return (
            <div key={item.label}>
              {hasChildren ? (
                <>
                  {/* Parent item with children - clickable to expand */}
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-[18px] h-[18px] shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                  {/* Children */}
                  {isExpanded && item.children && (
                    <div className="ml-7 mt-1 flex flex-col gap-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                            isChildActive(child)
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          )}
                        >
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Regular nav item without children */
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="flex items-center gap-3 px-4 py-4 border-t border-gray-200">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-semibold">
            {getInitials(session?.user?.distributorName)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {session?.user?.distributorName || "Distributor"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {session?.user?.distributorCode || "Code"}
          </p>
        </div>
      </div>
    </aside>
  );
}
