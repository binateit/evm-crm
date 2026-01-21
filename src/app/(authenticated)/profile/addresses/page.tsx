"use client";

import { useEffect, useState, useCallback } from "react";
import { useDistributor } from "@/hooks/use-distributor";
import { shippingAddressService, dropdownService } from "@/lib/api/services";
import type { DistributorShippingAddressDto, StateDto, DistrictDto } from "@/types";
import { PageHeader, PageBreadcrumb, Card, CardContent } from "@/components/ui";
import { useToast } from "@/lib/contexts/toast-context";
import { MapPin, Plus, Edit, Trash2, Star } from "lucide-react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

interface AddressFormData {
  addressName: string;
  address1: string;
  address2: string;
  city: string;
  stateId: number | null;
  districtId: number | null;
  pincode: string;
  isDefault: boolean;
}

const initialFormData: AddressFormData = {
  addressName: "",
  address1: "",
  address2: "",
  city: "",
  stateId: null,
  districtId: null,
  pincode: "",
  isDefault: false,
};

export default function AddressesPage() {
  const { distributorId, isLoading: authLoading } = useDistributor();
  const { showSuccess, showError } = useToast();
  const [addresses, setAddresses] = useState<DistributorShippingAddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DistributorShippingAddressDto | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  const [states, setStates] = useState<StateDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<DistrictDto[]>([]);

  // Fetch dropdown data
  useEffect(() => {
    async function fetchDropdowns() {
      try {
        const [statesData, districtsData] = await Promise.all([
          dropdownService.getStates(),
          dropdownService.getDistricts(),
        ]);
        setStates(statesData);
        setDistricts(districtsData);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    }

    fetchDropdowns();
  }, []);

  // Filter districts based on selected state
  useEffect(() => {
    if (formData.stateId) {
      const filtered = districts.filter((d) => d.stateId === formData.stateId);
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts([]);
    }
  }, [formData.stateId, districts]);

  const fetchAddresses = useCallback(async () => {
    if (!distributorId || authLoading) return;

    try {
      setLoading(true);
      const data = await shippingAddressService.getByDistributor(distributorId);
      setAddresses(data);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  }, [distributorId, authLoading]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAddDialog = () => {
    setEditingAddress(null);
    setFormData(initialFormData);
    setShowDialog(true);
  };

  const openEditDialog = (address: DistributorShippingAddressDto) => {
    setEditingAddress(address);
    setFormData({
      addressName: address.addressName || "",
      address1: address.address1 || "",
      address2: address.address2 || "",
      city: address.city || "",
      stateId: address.stateId,
      districtId: address.districtId,
      pincode: address.pincode || "",
      isDefault: address.isDefault,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!distributorId) return;

    if (!formData.addressName.trim() || !formData.address1.trim() || !formData.city.trim()) {
      showError("Please fill in required fields");
      return;
    }

    try {
      setSaving(true);

      if (editingAddress) {
        await shippingAddressService.update(editingAddress.id, {
          addressName: formData.addressName,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          stateId: formData.stateId,
          districtId: formData.districtId,
          pincode: formData.pincode,
        });
        showSuccess("Address updated successfully");
      } else {
        await shippingAddressService.create({
          distributorId,
          addressName: formData.addressName,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          stateId: formData.stateId,
          districtId: formData.districtId,
          pincode: formData.pincode,
          isDefault: formData.isDefault,
        });
        showSuccess("Address created successfully");
      }

      setShowDialog(false);
      fetchAddresses();
    } catch (err) {
      console.error("Error saving address:", err);
      showError("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (address: DistributorShippingAddressDto) => {
    if (!distributorId) return;

    confirmDialog({
      message: `Are you sure you want to delete "${address.addressName}"?`,
      header: "Delete Address",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await shippingAddressService.delete(address.id, distributorId);
          showSuccess("Address deleted successfully");
          fetchAddresses();
        } catch (err) {
          console.error("Error deleting address:", err);
          showError("Failed to delete address");
        }
      },
    });
  };

  const handleSetDefault = async (address: DistributorShippingAddressDto) => {
    if (!distributorId || address.isDefault) return;

    try {
      await shippingAddressService.setDefault(address.id, distributorId);
      showSuccess("Default address updated");
      fetchAddresses();
    } catch (err) {
      console.error("Error setting default address:", err);
      showError("Failed to set default address");
    }
  };

  const breadcrumbItems = [
    { label: "Profile", url: "/profile" },
    { label: "Shipping Addresses", url: "/profile/addresses" },
  ];

  const dialogFooter = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        severity="secondary"
        outlined
        onClick={() => setShowDialog(false)}
        disabled={saving}
      />
      <Button label={editingAddress ? "Update" : "Create"} onClick={handleSave} loading={saving} />
    </div>
  );

  return (
    <div className="space-y-4">
      <ConfirmDialog />
      <PageBreadcrumb items={breadcrumbItems} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader title="Shipping Addresses" subtitle="Manage your delivery addresses" />

        <Button
          label="Add Address"
          icon={<Plus className="w-4 h-4 mr-2" />}
          onClick={openAddDialog}
        />
      </div>

      {loading || authLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No shipping addresses found</p>
              <Button
                label="Add Your First Address"
                icon={<Plus className="w-4 h-4 mr-2" />}
                onClick={openAddDialog}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`relative ${address.isDefault ? "ring-2 ring-primary" : ""}`}
            >
              <CardContent className="p-4">
                {address.isDefault && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <Star className="w-3 h-3 fill-current" />
                      Default
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {address.addressName || "Unnamed Address"}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>{address.address1}</p>
                  {address.address2 && <p>{address.address2}</p>}
                  <p>
                    {[address.city, address.districtName, address.stateName]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {address.pincode && <p>PIN: {address.pincode}</p>}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Button
                    icon={<Edit className="w-4 h-4" />}
                    rounded
                    text
                    severity="secondary"
                    aria-label="Edit"
                    tooltip="Edit"
                    tooltipOptions={{ position: "top" }}
                    onClick={() => openEditDialog(address)}
                  />
                  <Button
                    icon={<Trash2 className="w-4 h-4" />}
                    rounded
                    text
                    severity="danger"
                    aria-label="Delete"
                    tooltip="Delete"
                    tooltipOptions={{ position: "top" }}
                    onClick={() => handleDelete(address)}
                  />
                  {!address.isDefault && (
                    <Button
                      label="Set Default"
                      size="small"
                      outlined
                      className="ml-auto"
                      onClick={() => handleSetDefault(address)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        header={editingAddress ? "Edit Address" : "Add Address"}
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        footer={dialogFooter}
        style={{ width: "500px" }}
        className="p-fluid"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Name <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.addressName}
              onChange={(e) => setFormData({ ...formData, addressName: e.target.value })}
              placeholder="e.g., Office, Warehouse, Home"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.address1}
              onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
              placeholder="Street address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <InputText
              value={formData.address2}
              onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
              placeholder="Apartment, suite, unit, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <InputText
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="PIN Code"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <Dropdown
                value={formData.stateId}
                options={states}
                optionLabel="name"
                optionValue="id"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stateId: e.value,
                    districtId: null,
                  })
                }
                placeholder="Select State"
                showClear
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <Dropdown
                value={formData.districtId}
                options={filteredDistricts}
                optionLabel="name"
                optionValue="id"
                onChange={(e) => setFormData({ ...formData, districtId: e.value })}
                placeholder="Select District"
                showClear
                disabled={!formData.stateId}
              />
            </div>
          </div>

          {!editingAddress && (
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.checked ?? false })}
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
