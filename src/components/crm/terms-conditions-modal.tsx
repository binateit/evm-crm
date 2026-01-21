"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";

interface TermsConditionsModalProps {
  visible: boolean;
  onAccept: () => void | Promise<void>;
}

export function TermsConditionsModal({ visible, onAccept }: TermsConditionsModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!agreed) return;

    setLoading(true);
    try {
      await onAccept();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={() => {}}
      modal
      closable={false}
      closeOnEscape={false}
      dismissableMask={false}
      header="CRM Terms & Conditions"
      style={{ width: "50rem", maxWidth: "90vw" }}
      contentClassName="overflow-y-auto"
      pt={{
        content: { className: "max-h-[60vh]" },
      }}
    >
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Please read and accept the terms and conditions to continue.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4 text-sm border border-gray-200">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Order Processing</h3>
            <p className="text-gray-700">
              Orders placed through the CRM are not guaranteed for same-day processing. All orders
              are subject to company approval, stock availability, credit status, and internal
              policies.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Company Rights</h3>
            <p className="text-gray-700">
              The company reserves the right to hold, cancel, reject, or modify any Purchase Order
              (PO) at its sole discretion, without providing any explanation or justification.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Pricing & Taxes</h3>
            <p className="text-gray-700">
              Prices shown in the CRM are indicative only and may change without prior notice. Final
              billing will include applicable GST, C/SGST, IGST, or other statutory levies as per
              law.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Credit & Payments</h3>
            <p className="text-gray-700">
              Orders will be executed only if the distributor&apos;s account is within approved
              credit limits and without overdue outstanding payments.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Advance Payments</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>
                Advance payment orders will be processed strictly as per internal company policy and
                only after confirmation of payment credit into the company&apos;s bank by the
                Accounts Team.
              </li>
              <li>Same-day dispatch is not guaranteed, even for advance payment orders.</li>
              <li>
                Stock availability is not guaranteed at the time of advance payment order placement.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Stock Availability</h3>
            <p className="text-gray-700">
              Stock availability shown in the CRM is indicative and updated periodically. Actual
              stock may vary. The company is not liable for any discrepancies between shown and
              actual stock availability.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Delivery & Shipping</h3>
            <p className="text-gray-700">
              Expected delivery dates are estimates only and not guaranteed. Delays may occur due to
              factors beyond the company&apos;s control including but not limited to transportation
              issues, stock delays, or force majeure events.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Liability</h3>
            <p className="text-gray-700">
              The company shall not be liable for any indirect, incidental, or consequential damages
              arising from order delays, cancellations, or modifications. All disputes are subject
              to the jurisdiction of courts in the company&apos;s registered location.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Checkbox
            inputId="terms-agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.checked ?? false)}
            className="mt-0.5"
          />
          <label htmlFor="terms-agree" className="text-sm text-gray-900 cursor-pointer flex-1">
            I have read and agree to the terms and conditions.
          </label>
        </div>

        <div className="flex justify-end">
          <Button
            label="Accept and Continue"
            onClick={handleAccept}
            disabled={!agreed}
            loading={loading}
            severity="success"
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </Dialog>
  );
}
