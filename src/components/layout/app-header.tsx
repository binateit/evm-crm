"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu, Bell, LogOut, User } from "lucide-react";
import Link from "next/link";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu - visible on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Welcome Message */}
        <div className="hidden sm:block">
          <h1 className="text-sm font-medium text-gray-900">
            Welcome, {session?.user?.distributorName || "Distributor"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px] text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
        </button>

        {/* Profile Link */}
        <Link
          href="/profile"
          className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Profile"
        >
          <User className="w-[18px] h-[18px] text-gray-600" />
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-[18px] h-[18px] text-gray-600" />
        </button>
      </div>
    </header>
  );
}
