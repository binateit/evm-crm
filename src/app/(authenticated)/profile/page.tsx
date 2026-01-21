"use client";

import { useEffect, useState } from "react";
import { useDistributor } from "@/hooks/use-distributor";
import { distributorService } from "@/lib/api/services";
import type { DistributorDto } from "@/types";
import {
  PageHeader,
  PageBreadcrumb,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils/formatters";
import { Building, Mail, Phone, CreditCard, MapPin, User, FileText, Banknote } from "lucide-react";

export default function ProfilePage() {
  const { distributorId, isLoading: authLoading } = useDistributor();
  const [distributor, setDistributor] = useState<DistributorDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDistributor() {
      if (!distributorId || authLoading) return;

      try {
        setLoading(true);
        const data = await distributorService.getById(distributorId);
        setDistributor(data);
      } catch (err) {
        console.error("Error fetching distributor:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDistributor();
  }, [distributorId, authLoading]);

  const breadcrumbItems = [{ label: "Profile", url: "/profile" }];

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!distributor) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageBreadcrumb items={breadcrumbItems} />
      <PageHeader title="My Profile" subtitle="View your distributor account details" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Basic Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distributor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Distributor Name</p>
                  <p className="font-medium">{distributor.distributorName || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Distributor Code</p>
                  <p className="font-medium">{distributor.distributorCode || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium">{distributor.contactPerson || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{distributor.emailAddress || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile Number</p>
                  <p className="font-medium">{distributor.mobileNumber || "N/A"}</p>
                </div>
              </div>

              {distributor.alternatePhone && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Alternate Phone</p>
                    <p className="font-medium">{distributor.alternatePhone}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Info */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Credit Limit</span>
                </div>
                <span className="font-medium">{formatCurrency(distributor.creditLimit)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Credit Days</span>
                </div>
                <span className="font-medium">{distributor.creditDays} days</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Outstanding Balance</span>
                </div>
                <span
                  className={`font-medium ${distributor.outstandingBalance > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {formatCurrency(distributor.outstandingBalance)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Discount Type</span>
                </div>
                <span className="font-medium">{distributor.discountTypeName || "N/A"}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Category</span>
                </div>
                <span className="font-medium">{distributor.category || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">GST Number</p>
                  <p className="font-medium font-mono">{distributor.gstNumber || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">PAN Number</p>
                  <p className="font-medium font-mono">{distributor.panNumber || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">GST Registration Type</p>
                  <p className="font-medium">{distributor.gstRegistrationTypeName || "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium">
                  {[
                    distributor.billingAddress1,
                    distributor.billingAddress2,
                    distributor.billingCity,
                  ]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {distributor.billingPincode && `PIN: ${distributor.billingPincode}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Representatives */}
        {(distributor.primarySalespersonName || distributor.secondarySalespersonName) && (
          <Card>
            <CardHeader>
              <CardTitle>Sales Representatives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {distributor.primarySalespersonName && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Primary Salesperson</p>
                      <p className="font-medium">{distributor.primarySalespersonName}</p>
                    </div>
                  </div>
                )}

                {distributor.secondarySalespersonName && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-lime-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Secondary Salesperson</p>
                      <p className="font-medium">{distributor.secondarySalespersonName}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
