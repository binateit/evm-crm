"use client";

import Link from "next/link";
import { useDistributor } from "@/hooks/use-distributor";
import { Card, CardContent } from "@/components/ui";
import { PageHeader } from "@/components/ui";
import { ShoppingCart, TrendingUp, Package, ArrowRight, FileText } from "lucide-react";

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

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Orders</p>
                  <p className="text-sm text-gray-500">View and manage orders</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/purchase-orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Purchase Orders</p>
                  <p className="text-sm text-gray-500">Manage purchase orders</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/promotions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Package className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Promotions</p>
                  <p className="text-sm text-gray-500">Check available offers</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pricing">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Pricing List</p>
                  <p className="text-sm text-gray-500">View product prices</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

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
