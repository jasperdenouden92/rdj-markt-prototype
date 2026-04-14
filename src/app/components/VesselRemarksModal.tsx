import { useState } from "react";
import { X } from "lucide-react";

interface VesselRemarksModalProps {
  vessel: {
    id: string;
    title: string;
    weight: string;
    vesselType: string;
  };
  onClose: () => void;
  onSave: (remarks: string) => void;
}

export default function VesselRemarksModal({ vessel, onClose, onSave }: VesselRemarksModalProps) {
  const [remarks, setRemarks] = useState("");

  const handleSubmit = () => {
    onSave(remarks);
    onClose();
  };

  return (
    <>
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-[#0c111d] opacity-70 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[12px] max-w-[520px] w-full max-h-[90vh] overflow-auto shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
          {/* Header */}
          <div className="relative shrink-0 w-full">
            <div className="content-stretch flex gap-[16px] items-start pt-[24px] px-[24px] relative w-full">
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative">
                <p className="font-sans font-bold leading-[26px] relative shrink-0 text-[#101828] text-[18px] w-full">
                  {vessel.title} naar werklijst
                </p>
                <p className="font-sans font-normal leading-[20px] relative shrink-0 text-[#475467] text-[14px] w-full">
                  {vessel.weight} · {vessel.vesselType}
                </p>
              </div>
              <button onClick={onClose} className="relative shrink-0 size-[24px] text-[#667085] hover:text-[#344054]">
                <X size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-[24px] py-[20px]">
            <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Opmerkingen</p>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Extra informatie en bijzonderheden..."
                rows={4}
                className="w-full px-[14px] py-[12px] font-sans font-normal leading-[20px] text-[#101828] text-[14px] bg-white border border-[#d0d5dd] rounded-[6px] outline-none resize-none"
              />
              <p className="font-sans font-normal leading-[18px] text-[#475467] text-[12px]">
                Deze opmerkingen worden meegestuurd op het document/PDF dat naar relaties wordt verstuurd.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="h-px relative shrink-0 w-full bg-[#eaecf0]" />
          <div className="px-[24px] py-[20px]">
            <div className="content-stretch flex gap-[12px] items-center justify-end relative shrink-0 w-full">
              <button
                onClick={onClose}
                className="bg-white relative rounded-[6px] shrink-0"
              >
                <div className="content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[16px] py-[10px] relative rounded-[inherit]">
                  <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Annuleren</p>
                </div>
                <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
              </button>
              <button
                onClick={handleSubmit}
                className="bg-[#1567a4] relative rounded-[6px] shrink-0"
              >
                <div className="content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[16px] py-[10px] relative rounded-[inherit]">
                  <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[14px] text-white whitespace-nowrap">Toepassen</p>
                </div>
                <div aria-hidden="true" className="absolute border border-[#1567a4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
