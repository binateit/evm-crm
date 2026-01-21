"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { promotionService } from "@/lib/api/services";
import type { PromotionDto } from "@/types";
import { PageHeader, PageBreadcrumb, Card, CardContent } from "@/components/ui";
import { formatDate } from "@/lib/utils/formatters";
import { Tag, Calendar, ChevronRight, Gift, Percent } from "lucide-react";
import { Dropdown } from "primereact/dropdown";

export default function PromotionsPage() {
  const [filteredPromotions, setFilteredPromotions] = useState<PromotionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(true);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        setLoading(true);
        const data = await promotionService.getMyPromotions(activeFilter ?? true);
        setFilteredPromotions(data);
      } catch (err) {
        console.error("Error fetching promotions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPromotions();
  }, [activeFilter]);

  const breadcrumbItems = [{ label: "Promotions", url: "/promotions" }];

  const activeOptions = [
    { label: "Active Only", value: true },
    { label: "All Promotions", value: null },
  ];

  return (
    <div className="space-y-4">
      <PageBreadcrumb items={breadcrumbItems} />
      <PageHeader
        title="My Promotions"
        subtitle="View promotions available for your allocated products"
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Showing promotions for products in your allocated sub-categories
              </p>
            </div>
            <div className="w-full sm:w-48">
              <Dropdown
                value={activeFilter}
                options={activeOptions}
                onChange={(e) => {
                  setActiveFilter(e.value);
                }}
                placeholder="Filter"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No promotions available at the moment</p>
              <p className="text-sm text-gray-400 mt-2">
                Check back later for new offers and promotions
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPromotions.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      )}
    </div>
  );
}

function PromotionCard({ promotion }: { promotion: PromotionDto }) {
  const isExpired = new Date(promotion.endDate) < new Date();
  const isUpcoming = new Date(promotion.startDate) > new Date();

  const getPromotionTypeIcon = (typeId: number) => {
    switch (typeId) {
      case 1:
        return <Gift className="w-5 h-5" />;
      case 2:
        return <Percent className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  const getPromotionTypeColor = (typeId: number) => {
    switch (typeId) {
      case 1:
        return "bg-green-100 text-green-600";
      case 2:
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-purple-100 text-purple-600";
    }
  };

  return (
    <Link href={`/promotions/${promotion.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPromotionTypeColor(
                promotion.promotionTypeId
              )}`}
            >
              {getPromotionTypeIcon(promotion.promotionTypeId)}
            </div>
            <div className="flex items-center gap-2">
              {isExpired ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Expired
                </span>
              ) : isUpcoming ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                  Upcoming
                </span>
              ) : promotion.isActive ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Inactive
                </span>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {promotion.promotionName}
          </h3>
          <p className="text-xs text-gray-500 mb-3">{promotion.promotionTypeName}</p>

          {promotion.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{promotion.description}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{promotion.promotionTypeName}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
