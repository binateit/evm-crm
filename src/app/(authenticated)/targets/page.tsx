"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";
import { Calendar, TrendingUp, Award, Info } from "lucide-react";

import { targetService, type TargetItem } from "@/lib/api/services";
import { useDistributor } from "@/hooks/use-distributor";

const TargetStatus = {
  Draft: 0,
  Active: 1,
  Expired: 2,
} as const;

export default function MyTargetsPage() {
  const { distributorId } = useDistributor();

  const { data: targets, isLoading } = useQuery({
    queryKey: ["my-targets", distributorId],
    queryFn: () => targetService.getMyTargets(distributorId!),
    enabled: !!distributorId,
    select: (response) => response.data.data,
  });

  const getStatusBadge = (status: number) => {
    switch (status) {
      case TargetStatus.Draft:
        return <Tag value="Draft" severity="secondary" />;
      case TargetStatus.Active:
        return <Tag value="Active" severity="success" />;
      case TargetStatus.Expired:
        return <Tag value="Expired" severity="danger" />;
      default:
        return <Tag value="Unknown" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ProgressBar mode="indeterminate" className="h-2 mb-4" />
            <p className="text-gray-600">Loading your targets...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeTargets = targets?.filter((t) => t.status === TargetStatus.Active) || [];
  const upcomingTargets = targets?.filter((t) => t.status === TargetStatus.Draft) || [];
  const expiredTargets = targets?.filter((t) => t.status === TargetStatus.Expired) || [];

  // Calculate total active target amount
  const totalActiveTargetAmount = activeTargets.reduce((sum, t) => sum + t.totalTargetAmount, 0);
  const totalActiveIncentive = activeTargets.reduce((sum, t) => sum + t.totalIncentiveValue, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">My Targets & Incentives</h1>
        <p className="text-blue-100">
          Track your sales targets and earn incentives by achieving your goals
        </p>
      </div>

      {/* Summary Cards */}
      {activeTargets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Targets</p>
                <p className="text-2xl font-bold text-gray-900">{activeTargets.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Target Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalActiveTargetAmount)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Potential Incentive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalActiveIncentive)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* No Targets Message */}
      {!targets || targets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="mb-4 flex justify-center">
              <div className="p-4 bg-gray-100 rounded-full">
                <Info className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Targets Assigned Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              You don&apos;t have any sales targets assigned at the moment. Contact your sales
              manager for more information.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Active Targets */}
          {activeTargets.length > 0 && (
            <Card title="Active Targets" className="shadow-sm">
              <div className="space-y-6">
                {activeTargets.map((target) => (
                  <div
                    key={target.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">Target Period</h3>
                          {getStatusBadge(target.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(target.startDate)} - {formatDate(target.endDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Target</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(target.totalTargetAmount)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Incentive: {formatCurrency(target.totalIncentiveValue)}
                        </p>
                      </div>
                    </div>

                    {/* Target Items Table */}
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Target Items ({target.targetItems.length})
                      </h4>
                      <DataTable
                        value={target.targetItems}
                        className="text-sm"
                        stripedRows
                        size="small"
                      >
                        <Column
                          field="skuCode"
                          header="SKU Code"
                          body={(item: TargetItem) => item.skuCode || item.skuId}
                          style={{ width: "20%" }}
                        />
                        <Column
                          field="skuName"
                          header="Product"
                          body={(item: TargetItem) => item.skuName || "N/A"}
                          style={{ width: "35%" }}
                        />
                        <Column
                          field="targetAmount"
                          header="Target Amount"
                          body={(item: TargetItem) => (
                            <span className="font-semibold text-green-600">
                              {formatCurrency(item.targetAmount)}
                            </span>
                          )}
                          align="right"
                          style={{ width: "20%" }}
                        />
                        <Column
                          field="incentiveValue"
                          header="Incentive"
                          body={(item: TargetItem) => (
                            <span className="font-semibold text-blue-600">
                              {formatCurrency(item.incentiveValue)}
                            </span>
                          )}
                          align="right"
                          style={{ width: "15%" }}
                        />
                        <Column
                          field="mandatoryCreditNote"
                          header="Credit Note"
                          body={(item: TargetItem) =>
                            item.mandatoryCreditNote ? (
                              <Tag value="Required" severity="warning" />
                            ) : (
                              <Tag value="Optional" severity="secondary" />
                            )
                          }
                          align="center"
                          style={{ width: "10%" }}
                        />
                      </DataTable>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Upcoming/Draft Targets */}
          {upcomingTargets.length > 0 && (
            <Card title="Upcoming Targets" className="shadow-sm">
              <div className="space-y-4">
                {upcomingTargets.map((target) => (
                  <div key={target.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-700">Target Period</h3>
                          {getStatusBadge(target.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(target.startDate)} - {formatDate(target.endDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Target</p>
                        <p className="text-lg font-bold text-gray-700">
                          {formatCurrency(target.totalTargetAmount)}
                        </p>
                        <p className="text-xs text-gray-500">{target.targetItems.length} items</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Expired Targets */}
          {expiredTargets.length > 0 && (
            <Card title="Past Targets" className="shadow-sm">
              <div className="space-y-4">
                {expiredTargets.slice(0, 3).map((target) => (
                  <div key={target.id} className="border border-gray-200 rounded-lg p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-600">Target Period</h3>
                          {getStatusBadge(target.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(target.startDate)} - {formatDate(target.endDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Target</p>
                        <p className="text-lg font-semibold text-gray-600">
                          {formatCurrency(target.totalTargetAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
