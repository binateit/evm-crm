"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { distributorContactService, roleService } from "@/lib/api/services";
import type { DistributorContactDto } from "@/types/crm-types";

const createContactSchema = z.object({
  contactName: z.string().min(1, "Contact name is required").max(100),
  emailAddress: z.string().email("Invalid email").max(100),
  mobileNumber: z.string().max(15).optional().or(z.literal("")),
  isPrimary: z.boolean(),
  password: z.string().min(6, "Minimum 6 characters required").max(100),
  roleId: z.string().uuid("Invalid role"),
});

type CreateContactForm = z.infer<typeof createContactSchema>;

export default function ContactsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const distributorId = session?.user?.distributorId || "";

  const [showDialog, setShowDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<DistributorContactDto | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Fetch contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts", distributorId],
    queryFn: () => distributorContactService.getByDistributor(distributorId),
    enabled: !!distributorId,
  });

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ["distributor-roles"],
    queryFn: roleService.getDistributorRoles,
  });

  const activeContacts = contacts.filter((c) => c.isActive);
  const canAddContact = activeContacts.length < 3;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateContactForm>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      isPrimary: false,
      contactName: "",
      emailAddress: "",
      mobileNumber: "",
      password: "",
      roleId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateContactForm) =>
      distributorContactService.create({
        ...data,
        distributorId,
        mobileNumber: data.mobileNumber || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", distributorId] });
      setShowDialog(false);
      reset();
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (contactId: string) => distributorContactService.delete(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", distributorId] });
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ contactId, password }: { contactId: string; password: string }) =>
      distributorContactService.resetPassword(contactId, password),
    onSuccess: () => {
      setShowPasswordDialog(false);
      setSelectedContact(null);
      setNewPassword("");
      alert("Password reset successfully");
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const onSubmit = (data: CreateContactForm) => {
    createMutation.mutate(data);
  };

  const handleResetPassword = () => {
    if (!selectedContact || !newPassword) return;
    resetPasswordMutation.mutate({
      contactId: selectedContact.id,
      password: newPassword,
    });
  };

  const primaryTemplate = (rowData: DistributorContactDto) =>
    rowData.isPrimary ? (
      <span className="text-green-600 font-semibold">Primary</span>
    ) : (
      <span className="text-gray-500">-</span>
    );

  const statusTemplate = (rowData: DistributorContactDto) => (
    <span className={rowData.isActive ? "text-green-600" : "text-red-600"}>
      {rowData.isActive ? "Active" : "Inactive"}
    </span>
  );

  const actionsTemplate = (rowData: DistributorContactDto) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-key"
        className="p-button-text p-button-sm"
        onClick={() => {
          setSelectedContact(rowData);
          setShowPasswordDialog(true);
        }}
        tooltip="Reset Password"
      />
      {!rowData.isPrimary && (
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-sm p-button-danger"
          onClick={() => {
            if (confirm("Are you sure you want to delete this contact?")) {
              deleteMutation.mutate(rowData.id);
            }
          }}
          tooltip="Delete Contact"
        />
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Contacts</h1>
          <p className="text-sm text-gray-600 mt-1">Active Contacts: {activeContacts.length} / 3</p>
        </div>
        <Button
          label="Add Contact"
          icon="pi pi-plus"
          onClick={() => setShowDialog(true)}
          disabled={!canAddContact}
          tooltip={!canAddContact ? "Maximum 3 active contacts allowed" : undefined}
        />
      </div>

      {/* Contacts Table */}
      <div className="card">
        <DataTable
          value={contacts}
          loading={isLoading}
          emptyMessage="No contacts found"
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
        >
          <Column field="contactName" header="Name" sortable />
          <Column field="emailAddress" header="Email" sortable />
          <Column field="mobileNumber" header="Mobile" />
          <Column header="Type" body={primaryTemplate} />
          <Column header="Status" body={statusTemplate} />
          <Column header="Actions" body={actionsTemplate} style={{ width: "120px" }} />
        </DataTable>
      </div>

      {/* Create Contact Dialog */}
      <Dialog
        header="Add New Contact"
        visible={showDialog}
        onHide={() => {
          setShowDialog(false);
          reset();
        }}
        style={{ width: "500px" }}
        modal
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Contact Name *</label>
            <InputText {...register("contactName")} className="w-full" />
            {errors.contactName && (
              <small className="text-red-500">{errors.contactName.message}</small>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Email *</label>
            <InputText {...register("emailAddress")} className="w-full" type="email" />
            {errors.emailAddress && (
              <small className="text-red-500">{errors.emailAddress.message}</small>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Mobile Number</label>
            <InputText {...register("mobileNumber")} className="w-full" />
            {errors.mobileNumber && (
              <small className="text-red-500">{errors.mobileNumber.message}</small>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Password *</label>
            <Password
              {...register("password")}
              className="w-full"
              inputClassName="w-full"
              toggleMask
              feedback={false}
            />
            {errors.password && <small className="text-red-500">{errors.password.message}</small>}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Role *</label>
            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <Dropdown
                  value={field.value}
                  options={roles}
                  onChange={(e) => field.onChange(e.value)}
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select role"
                  className="w-full"
                />
              )}
            />
            {errors.roleId && <small className="text-red-500">{errors.roleId.message}</small>}
          </div>

          <div className="flex items-center gap-2">
            <Controller
              name="isPrimary"
              control={control}
              render={({ field }) => (
                <Checkbox
                  inputId="isPrimary"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.checked)}
                />
              )}
            />
            <label htmlFor="isPrimary" className="text-sm font-medium">
              Primary Contact
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              label="Cancel"
              onClick={() => {
                setShowDialog(false);
                reset();
              }}
              className="p-button-text"
              type="button"
            />
            <Button label="Create" type="submit" loading={createMutation.isPending} />
          </div>
        </form>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        header="Reset Password"
        visible={showPasswordDialog}
        onHide={() => {
          setShowPasswordDialog(false);
          setSelectedContact(null);
          setNewPassword("");
        }}
        style={{ width: "400px" }}
        modal
      >
        <div className="space-y-4 pt-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Contact</label>
            <p className="text-sm text-gray-700">{selectedContact?.contactName}</p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">New Password *</label>
            <Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full"
              inputClassName="w-full"
              toggleMask
              feedback={false}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              label="Cancel"
              onClick={() => {
                setShowPasswordDialog(false);
                setSelectedContact(null);
                setNewPassword("");
              }}
              className="p-button-text"
              type="button"
            />
            <Button
              label="Reset Password"
              onClick={handleResetPassword}
              loading={resetPasswordMutation.isPending}
              disabled={!newPassword || newPassword.length < 6}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
