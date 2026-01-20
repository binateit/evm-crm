"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { promotionService } from "@/lib/api/services";
import type { PromotionDetailDto } from "@/types/crm";
import {
  PageHeader,
  PageBreadcrumb,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { formatDate } from "@/lib/utils/formatters";
import { ArrowLeft, Calendar, Tag, Package, Layers } from "lucide-react";
import { Button } from "primereact/button";

interface PromotionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PromotionDetailPage({ params }: PromotionDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [promotion, setPromotion] = useState<PromotionDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPromotion() {
      if (!id) return;

      try {
        setLoading(true);
        const data = await promotionService.getById(id);
        setPromotion(data);
      } catch (err) {
        console.error("Error fetching promotion:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPromotion();
  }, [id]);

  const breadcrumbItems = [
    { label: "Promotions", url: "/promotions" },
    { label: promotion?.promotionName || "Promotion Details", url: `/promotions/${id}` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">Promotion not found</p>
        <Button
          label="Back to Promotions"
          icon={<ArrowLeft className="w-4 h-4 mr-2" />}
          outlined
          onClick={() => router.push("/promotions")}
        />
      </div>
    );
  }

  const isExpired = new Date(promotion.endDate) < new Date();
  const isUpcoming = new Date(promotion.startDate) > new Date();

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
          Expired
        </span>
      );
    }
    if (isUpcoming) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
          Upcoming
        </span>
      );
    }
    if (promotion.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
        Inactive
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <PageBreadcrumb items={breadcrumbItems} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader title={promotion.promotionName} subtitle={`Code: ${promotion.promotionCode}`} />

        <div className="flex items-center gap-2">
          <Button
            label="Back"
            icon={<ArrowLeft className="w-4 h-4 mr-2" />}
            outlined
            severity="secondary"
            onClick={() => router.push("/promotions")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Promotion Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getStatusBadge()}
                <span className="text-sm text-gray-500">{promotion.promotionTypeName}</span>
              </div>

              {promotion.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-900">{promotion.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(promotion.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{formatDate(promotion.endDate)}</p>
                  </div>
                </div>
              </div>

              {/* Applicable Product/Category */}
              {(promotion.brandName || promotion.categoryName || promotion.skuName) && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Applicable To</p>
                  <div className="space-y-2">
                    {promotion.brandName && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Brand: {promotion.brandName}</span>
                      </div>
                    )}
                    {promotion.categoryName && (
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Category: {promotion.categoryName}</span>
                      </div>
                    )}
                    {promotion.skuName && (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Product: {promotion.skuName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {promotion.discountPercent && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Discount</span>
                  <span className="font-medium text-green-600">{promotion.discountPercent}%</span>
                </div>
              )}

              {promotion.minimumQuantity && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Min. Quantity</span>
                  <span className="font-medium">{promotion.minimumQuantity}</span>
                </div>
              )}

              {promotion.minimumOrderValue && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Min. Order Value</span>
                  <span className="font-medium">
                    {promotion.minimumOrderValue.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </span>
                </div>
              )}

              {promotion.maxDiscountAmount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Max. Discount</span>
                  <span className="font-medium">
                    {promotion.maxDiscountAmount.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </span>
                </div>
              )}

              {promotion.maxUsagePerDistributor && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Max Usage</span>
                  <span className="font-medium">{promotion.maxUsagePerDistributor} times</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Priority</span>
                <span className="font-medium">{promotion.priority}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Stackable</span>
                <span className="font-medium">{promotion.canStackWithOthers ? "Yes" : "No"}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">Current Usage</span>
                <span className="font-medium">
                  {promotion.currentUsageCount}
                  {promotion.maxTotalUsage ? ` / ${promotion.maxTotalUsage}` : ""}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slabs */}
      {promotion.slabs && promotion.slabs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Promotion Slabs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Quantity Range
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Free Quantity
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Discount %
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Special Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {promotion.slabs.map((slab, index) => (
                    <tr key={slab.id || index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">
                        {slab.fromQuantity} - {slab.toQuantity ?? "∞"}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">{slab.freeQuantity ?? "-"}</td>
                      <td className="py-3 px-4 text-sm text-right text-green-600">
                        {slab.discountPercent ? `${slab.discountPercent}%` : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        {slab.specialRate
                          ? slab.specialRate.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements */}
      {promotion.requirements && promotion.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Product
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Required Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {promotion.requirements.map((req, index) => (
                    <tr key={req.id || index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm capitalize">{req.requirementType}</td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <p className="font-medium">{req.skuName || "Any"}</p>
                          {req.skuCode && <p className="text-xs text-gray-500">{req.skuCode}</p>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-right">{req.requiredQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
