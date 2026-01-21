"use client";

import { useState } from "react";
import { TermsConditionsModal } from "@/components/crm/terms-conditions-modal";
import { Button } from "primereact/button";

export default function TestTermsPage() {
  const [showModal, setShowModal] = useState(false);

  const handleAccept = async () => {
    console.log("Terms accepted!");
    alert("Terms accepted successfully!");
    setShowModal(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Terms & Conditions Modal</h1>
      <p className="mb-4">
        This page allows you to test the Terms & Conditions modal without needing the backend
        implementation.
      </p>
      <Button label="Show Terms Modal" onClick={() => setShowModal(true)} severity="info" />

      <TermsConditionsModal visible={showModal} onAccept={handleAccept} />
    </div>
  );
}
