import { useState } from "react";
import { Check, X } from "lucide-react";
import FeaturedIcon from "./FeaturedIcon";
import Checkbox from "./Checkbox";
import Button from "./Button";

export interface ApprovalOptions {
  generateCharter: boolean;
  sendToLoadPlanning: boolean;
  removeFromMarket: boolean;
  rejectOtherBids: boolean;
  sendRejectionEmail: boolean;
}

interface ApprovalConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (options: ApprovalOptions) => void;
  relatieName?: string;
}

export default function ApprovalConfirmationDialog({ open, onClose, onConfirm, relatieName }: ApprovalConfirmationDialogProps) {
  const [generateCharter, setGenerateCharter] = useState(true);
  const [sendToLoadPlanning, setSendToLoadPlanning] = useState(true);
  const [removeFromMarket, setRemoveFromMarket] = useState(true);
  const [rejectOtherBids, setRejectOtherBids] = useState(false);
  const [sendRejectionEmail, setSendRejectionEmail] = useState(false);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm({
      generateCharter,
      sendToLoadPlanning,
      removeFromMarket,
      rejectOtherBids,
      sendRejectionEmail: rejectOtherBids && sendRejectionEmail,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-[12px] shadow-xl w-full max-w-[480px] mx-[16px]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-[16px] right-[16px] text-rdj-text-tertiary hover:text-rdj-text-primary transition-colors cursor-pointer"
        >
          <X size={20} strokeWidth={2} />
        </button>

        {/* Header */}
        <div className="px-[24px] pt-[24px] pb-[16px]">
          <div className="flex items-center gap-[12px]">
            <FeaturedIcon icon={<Check strokeWidth={2.5} />} variant="brand" size={40} />
            <h2 className="font-sans font-bold text-rdj-text-primary text-[16px] leading-[24px]">
              Onderhandeling goedkeuren
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-[16px] px-[24px] pb-[24px]">
          <p className="font-sans font-normal text-rdj-text-secondary text-[14px] leading-[20px]">
            Wil je direct de volgende acties uitvoeren? Je kunt deze later ook nog handmatig starten.
          </p>

          <div className="flex flex-col gap-[12px]">
            <Checkbox
              checked={generateCharter}
              onChange={setGenerateCharter}
              label="Charter doc genereren en verzenden"
            />
            <Checkbox
              checked={sendToLoadPlanning}
              onChange={setSendToLoadPlanning}
              label="Lading doorsturen naar laadplanning"
            />
            <Checkbox
              checked={removeFromMarket}
              onChange={setRemoveFromMarket}
              label="Partij uit de markt halen"
            />
            <div className="flex flex-col gap-[8px]">
              <Checkbox
                checked={rejectOtherBids}
                onChange={(v) => {
                  setRejectOtherBids(v);
                  if (!v) setSendRejectionEmail(false);
                }}
                label="Andere biedingen op 'afgewezen' zetten"
              />
              {rejectOtherBids && (
                <div className="pl-[24px]">
                  <Checkbox
                    checked={sendRejectionEmail}
                    onChange={setSendRejectionEmail}
                    label="Stuur automatische afwijzingsmail"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-rdj-border-secondary px-[24px] py-[16px] flex gap-[12px]">
          <Button variant="secondary" label="Annuleren" fullWidth onClick={onClose} />
          <Button variant="primary" label="Bevestigen" leadingIcon={<Check strokeWidth={2.5} />} fullWidth onClick={handleConfirm} />
        </div>
      </div>
    </div>
  );
}
