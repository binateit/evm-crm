"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDistributor } from "@/hooks/use-distributor";
import { saleOrderService } from "@/lib/api/services";
import type { SaleOrderDashboardSummaryDto, SaleOrderListDto } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { PageHeader } from "@/components/ui";
import { ShoppingCart, Clock, CheckCircle, TrendingUp, Package, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

export default function DashboardPage() {
  const { distributorId, distributorName, isLoading: authLoading } = useDistributor();
  const [summary, setSummary] = useState<SaleOrderDashboardSummaryDto | null>(null);
  const [recentOrders, setRecentOrders] = useState<SaleOrderListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!distributorId || authLoading) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard summary and recent orders in parallel
        const [summaryData, ordersData] = await Promise.all([
          saleOrderService.getSummary(distributorId),
          saleOrderService.getByDistributor(distributorId, {
            pageNumber: 1,
            pageSize: 5,
          }),
        ]);

        setSummary(summaryData);
        setRecentOrders(ordersData.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [distributorId, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-primary hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Orders",
      value: summary?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-blue-500",
      href: "/orders",
    },
    {
      title: "Pending Approval",
      value: summary?.pendingDistributorApprovalCount || 0,
      icon: Clock,
      color: "bg-yellow-500",
      href: "/orders/pending",
    },
    {
      title: "Approved Orders",
      value: summary?.approvedCount || 0,
      icon: CheckCircle,
      color: "bg-green-500",
      href: "/orders/approved",
    },
    {
      title: "Total Order Value",
      value: formatCurrency(summary?.totalOrderValue || 0),
      icon: TrendingUp,
      color: "bg-purple-500",
      isValue: true,
    },
  ];

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1:
        return "bg-gray-100 text-gray-700"; // Draft
      case 2:
        return "bg-yellow-100 text-yellow-700"; // Pending Distributor Approval
      case 3:
        return "bg-blue-100 text-blue-700"; // Distributor Approved
      case 4:
        return "bg-green-100 text-green-700"; // Approved
      case 5:
        return "bg-red-100 text-red-700"; // Rejected
      case 6:
        return "bg-gray-100 text-gray-700"; // Cancelled
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${distributorName}`} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            {stat.href ? (
              <Link href={stat.href} className="block">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            ) : (
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/promotions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">View Promotions</p>
                <p className="text-sm text-gray-500">Check available offers</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/pricing">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Pricing List</p>
                <p className="text-sm text-gray-500">View product prices</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/stocks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Stock Availability</p>
                <p className="text-sm text-gray-500">Check stock levels</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link
            href="/orders"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                      Order #
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Items</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                      Amount
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {formatDate(order.orderDate)}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">{order.itemCount} items</td>
                      <td className="py-3 px-2 text-sm text-gray-900 text-right font-medium">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            order.statusId
                          )}`}
                        >
                          {order.statusName}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
