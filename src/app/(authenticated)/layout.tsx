"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { TermsConditionsModal } from "@/components/crm/terms-conditions-modal";
import { cn } from "@/lib/utils/cn";
import { useDistributor } from "@/hooks/use-distributor";
import { distributorService } from "@/lib/api/services";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const { distributorId, isLoading: authLoading } = useDistributor();

  useEffect(() => {
    async function checkTermsAcceptance() {
      if (!distributorId || authLoading || termsChecked) return;

      console.log("[Terms Check] Starting check for distributor:", distributorId);

      try {
        const distributor = await distributorService.getMyProfile();
        console.log("[Terms Check] Distributor profile:", distributor);
        console.log("[Terms Check] Terms accepted at:", distributor?.termsAcceptedAt);

        if (distributor && !distributor.termsAcceptedAt) {
          console.log("[Terms Check] Terms NOT accepted - showing modal");
          setShowTermsModal(true);
        } else {
          console.log("[Terms Check] Terms already accepted or profile not found");
        }

        setTermsChecked(true);
      } catch (error) {
        console.error("[Terms Check] Error:", error);
        setTermsChecked(true);
      }
    }

    checkTermsAcceptance();
  }, [distributorId, authLoading, termsChecked]);

  const handleAcceptTerms = async () => {
    if (!distributorId) return;

    try {
      const success = await distributorService.acceptMyTerms();

      if (success) {
        setShowTermsModal(false);
      } else {
        alert("Failed to accept terms. Please try again.");
      }
    } catch (error) {
      console.error("Error accepting terms:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      <TermsConditionsModal visible={showTermsModal} onAccept={handleAcceptTerms} />

      <div className="flex h-screen overflow-hidden bg-white">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={handleCloseSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <AppSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        </div>

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white">
          <AppHeader onMenuClick={handleMenuClick} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-5 bg-white">{children}</main>
        </div>
      </div>
    </>
  );
}
