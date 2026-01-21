"use client";

import { useDistributor } from "@/hooks/use-distributor";
import { Card, CardContent } from "@/components/ui";
import { PageHeader } from "@/components/ui";

export default function DashboardPage() {
  const { distributorName, isLoading } = useDistributor();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${distributorName || "User"}`} />

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to EVM CRM</h2>
          <p className="text-gray-600 text-lg">
            Manage your orders, view pricing, check promotions, and track stock availability all in
            one place.
          </p>
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Browse Products</p>
                <p className="text-sm text-gray-600">
                  Check out the pricing list to view all available products and their prices
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Place Orders</p>
                <p className="text-sm text-gray-600">
                  Create purchase orders and track their approval status
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Check Promotions</p>
                <p className="text-sm text-gray-600">
                  Stay updated with the latest offers and promotional deals
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
