"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { promotionService } from "@/lib/api/services";
import type { PromotionDto, PromotionPaginationResponse } from "@/types/crm";
import { PageHeader, PageBreadcrumb, Card, CardContent } from "@/components/ui";
import { formatDate } from "@/lib/utils/formatters";
import { Tag, Calendar, ChevronRight, Gift, Percent } from "lucide-react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionPaginationResponse>({
    data: [],
    pagination: {
      totalCount: 0,
      pageSize: 12,
      currentPage: 1,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(true);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        setLoading(true);
        const data = await promotionService.search({
          pageNumber: page,
          pageSize: 12,
          keyword: keyword || null,
          isActive: activeFilter,
        });
        setPromotions(data);
      } catch (err) {
        console.error("Error fetching promotions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPromotions();
  }, [page, keyword, activeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const breadcrumbItems = [{ label: "Promotions", url: "/promotions" }];

  const activeOptions = [
    { label: "Active Only", value: true },
    { label: "Inactive Only", value: false },
    { label: "All", value: null },
  ];

  return (
    <div className="space-y-4">
      <PageBreadcrumb items={breadcrumbItems} />
      <PageHeader title="Promotions" subtitle="View available promotions and offers" />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <InputText
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search promotions..."
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Dropdown
                value={activeFilter}
                options={activeOptions}
                onChange={(e) => {
                  setActiveFilter(e.value);
                  setPage(1);
                }}
                placeholder="Status"
                className="w-full"
              />
            </div>
            <Button type="submit" label="Search" icon="pi pi-search" className="w-full sm:w-auto" />
          </form>
        </CardContent>
      </Card>

      {/* Promotions Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : promotions.data.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No promotions found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.data.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>

          {/* Pagination */}
          {promotions.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                icon="pi pi-chevron-left"
                outlined
                disabled={!promotions.pagination.hasPreviousPage}
                onClick={() => setPage(page - 1)}
              />
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {promotions.pagination.currentPage} of {promotions.pagination.totalPages}
              </span>
              <Button
                icon="pi pi-chevron-right"
                outlined
                disabled={!promotions.pagination.hasNextPage}
                onClick={() => setPage(page + 1)}
              />
            </div>
          )}
        </>
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
          <p className="text-xs text-gray-500 mb-3">{promotion.promotionCode}</p>

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
