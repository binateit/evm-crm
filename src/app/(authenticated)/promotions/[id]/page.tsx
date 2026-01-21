"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "primereact/button";
import { PageBreadcrumb } from "@/components/ui";
import { useToast } from "@/lib/contexts/toast-context";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { promotionService } from "@/lib/api/services";
import { PromotionSlabDto } from "@/types";

export default function PromotionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const promotionId = params.id as string;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const { data: promotion, isLoading } = useQuery({
    queryKey: ["promotion", promotionId],
    queryFn: async () => {
      const data = await promotionService.getById(promotionId);
      if (!data) {
        toast?.showError("Promotion not found");
        router.push("/promotions");
        return null;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const breadcrumbItems = [
    { label: "Promotions", url: "/promotions" },
    { label: promotion?.promotionName || "Details" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading promotion...</p>
        </div>
      </div>
    );
  }

  if (!promotion) return null;

  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);
  const daysRemaining = differenceInDays(endDate, new Date());
  const totalDays = differenceInDays(endDate, startDate);
  const daysElapsed = differenceInDays(new Date(), startDate);
  const progress = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

  const getTimelineStatus = () => {
    if (isPast(endDate))
      return { label: "Expired", color: "bg-red-500", textColor: "text-red-600" };
    if (isFuture(startDate))
      return { label: "Upcoming", color: "bg-amber-500", textColor: "text-amber-600" };
    return { label: "Active", color: "bg-emerald-500", textColor: "text-emerald-600" };
  };

  const timelineStatus = getTimelineStatus();

  return (
    <div className="space-y-6">
      <PageBreadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            {/* Promo Image */}
            {promotion.promoImageUrl && (
              <div className="flex-shrink-0">
                <div className="relative w-full lg:w-72 h-48 rounded-xl overflow-hidden ring-4 ring-white/10 shadow-2xl">
                  <Image
                    src={`${baseUrl}/${promotion.promoImageUrl}`}
                    alt={promotion.promotionName}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/10 text-white/80 rounded-full">
                      {promotion.promotionTypeName}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                        promotion.isActive
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {promotion.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
                    {promotion.promotionName}
                  </h1>
                  <p className="text-slate-400 font-mono text-sm">{promotion.promotionCode}</p>
                </div>
              </div>

              {promotion.description && (
                <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-2xl">
                  {promotion.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  label="Back to Promotions"
                  icon="pi pi-arrow-left"
                  outlined
                  severity="secondary"
                  onClick={() => router.push("/promotions")}
                  className="border-white/20 text-white hover:bg-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${timelineStatus.color} animate-pulse`} />
            <h2 className="text-lg font-bold text-slate-900">Campaign Timeline</h2>
          </div>
          <span className={`text-sm font-semibold ${timelineStatus.textColor}`}>
            {timelineStatus.label}
            {daysRemaining > 0 && ` • ${daysRemaining} days remaining`}
          </span>
        </div>

        <div className="relative mb-4">
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isPast(endDate) ? "bg-red-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <div>
            <p className="text-slate-500 mb-1">Start Date</p>
            <p className="font-semibold text-slate-900">{format(startDate, "MMM dd, yyyy")}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 mb-1">End Date</p>
            <p className="font-semibold text-slate-900">{format(endDate, "MMM dd, yyyy")}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slabs Table */}
          {promotion.slabs && promotion.slabs.length > 0 && (
            <InfoSection
              title="Quantity Slabs"
              icon="pi-list"
              badge={`${promotion.slabs.length} slabs`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Buy Quantity
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Get Free
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...promotion.slabs]
                      .sort((a, b) => a.quantity - b.quantity)
                      .map((slab: PromotionSlabDto, idx: number) => (
                        <tr key={slab.id} className={idx % 2 === 0 ? "bg-slate-50/50" : ""}>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900">{slab.quantity}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              +{slab.freeQuantity} FREE
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </InfoSection>
          )}
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* SKU Details */}
          {promotion.skuName && (
            <InfoSection title="Applicable SKU" icon="pi-box">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <p className="font-semibold text-slate-900 mb-1">{promotion.skuName}</p>
                <p className="text-sm text-slate-500 font-mono">{promotion.skuCode}</p>
              </div>
            </InfoSection>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoSection({
  title,
  icon,
  badge,
  children,
}: {
  title: string;
  icon: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <i className={`pi ${icon} text-slate-400`} />
          <h3 className="font-bold text-slate-900">{title}</h3>
        </div>
        {badge && (
          <span className="px-2.5 py-1 text-xs font-semibold bg-slate-200 text-slate-600 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
