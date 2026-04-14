import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import Button from "./Button";
import { ladingenEigen } from "../data/entities/ladingen-eigen";
import { setMarktToewijzing } from "../data/markt-toewijzing-store";

interface ToewijzenAanMarktDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (marktTonnage: number) => void;
  subpartijId: string;
  subpartijNaam: string;
  subpartijTonnage: number;
}

function TonnageInput({ value, onChange, placeholder, readOnly, error }: {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  error?: boolean;
}) {
  return (
    <div className={`content-stretch flex items-start relative rounded-[6px] flex-1 min-w-0 ${readOnly ? "bg-[#f9fafb]" : "bg-white"}`}>
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] ${error ? "border-[#f04438]" : "border-[#d0d5dd]"}`} />
      <input
        type="text"
        inputMode={readOnly ? undefined : "numeric"}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`flex-1 px-[12px] py-[8px] font-sans font-normal leading-[20px] text-[14px] bg-transparent outline-none rounded-l-[6px] w-0 ${readOnly ? "text-[#667085] cursor-default select-none" : "text-[#101828]"}`}
      />
      <div className="content-stretch flex items-center px-[12px] py-[8px] relative rounded-br-[8px] rounded-tr-[8px] shrink-0">
        <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] whitespace-nowrap">t</p>
      </div>
    </div>
  );
}

export default function ToewijzenAanMarktDialog({ isOpen, onClose, onSave, subpartijId, subpartijNaam, subpartijTonnage }: ToewijzenAanMarktDialogProps) {
  const navigate = useNavigate();
  const [marktMin, setMarktMin] = useState("");

  const parseNum = (v: string) => parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
  const marktMinValue = parseNum(marktMin);

  const eigenVlootDisplay = useMemo(() =>
    Math.max(0, subpartijTonnage - marktMinValue).toLocaleString("nl-NL"),
    [subpartijTonnage, marktMinValue]
  );

  const handleTonnageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setMarktMin(raw ? Number(raw).toLocaleString("nl-NL") : "");
  };

  const handleAllesInDeMarkt = () => setMarktMin(subpartijTonnage.toLocaleString("nl-NL"));
  const handleAllesTerughalen = () => setMarktMin("");

  const handleClose = () => {
    setMarktMin("");
    onClose();
  };

  const allesInMarkt = marktMinValue >= subpartijTonnage && subpartijTonnage > 0;
  const isOverTonnage = marktMin !== "" && marktMinValue > subpartijTonnage;

  const handleSave = () => {
    const marktItem = ladingenEigen.find((le) => le.subpartijId === subpartijId);
    const marktPath = marktItem
      ? `/markt/bevrachting/lading/${marktItem.id}`
      : "/markt/bevrachting/ladingen";
    setMarktToewijzing(subpartijId, marktMinValue, subpartijTonnage);
    onSave(marktMinValue);
    toast.success("Toegewezen aan de markt", {
      description: `${marktMin} t`,
      action: {
        label: "Bekijken in eigen aanbod",
        onClick: () => navigate(marktPath),
      },
    });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[128px]">
      <div className="absolute bg-[#0c111d] inset-0 opacity-70" onClick={handleClose} />

      <div className="relative bg-white rounded-[12px] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] w-full max-w-[480px] mx-[16px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-[16px] pt-[24px] px-[24px]">
          <div className="flex flex-col gap-[2px]">
            <p className="font-sans font-bold leading-[26px] text-[#101828] text-[18px]">Toewijzen aan markt</p>
            <p className="font-sans font-normal text-[14px] leading-[20px] text-[#475467]">{subpartijNaam}</p>
          </div>
          <button onClick={handleClose} className="overflow-clip relative shrink-0 size-[24px] hover:opacity-70 mt-[2px]">
            <div className="absolute inset-[20.83%]">
              <div className="absolute inset-[-10.53%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                  <path d="M13 1L1 13M1 1L13 13" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Body */}
        <div className="px-[24px] pt-[24px] pb-[24px] flex flex-col gap-[20px]">
          {/* Tonnage fields */}
          <div className="flex gap-[12px] items-start">
            {/* Eigen vloot */}
            <div className="flex-1 flex flex-col gap-[6px]">
              <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Eigen vloot</p>
              <TonnageInput value={eigenVlootDisplay} readOnly />
              {allesInMarkt ? (
                  <button
                    onClick={handleAllesTerughalen}
                    className="self-start flex items-center gap-[4px] font-sans font-bold text-[14px] leading-[20px] text-[#1567a4] hover:text-[#0f4f82] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Alles terughalen
                  </button>
                ) : (
                  <button
                    onClick={handleAllesInDeMarkt}
                    className="self-start flex items-center gap-[4px] font-sans font-bold text-[14px] leading-[20px] text-[#1567a4] hover:text-[#0f4f82] transition-colors"
                  >
                    Alles in de markt
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )
              }
            </div>

            {/* Markt */}
            <div className="flex-1 flex flex-col gap-[6px]">
              <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Markt</p>
              <TonnageInput
                value={marktMin}
                onChange={handleTonnageChange}
                placeholder="Aantal"
                error={isOverTonnage}
              />
              {isOverTonnage && (
                <p className="font-sans font-normal text-[12px] leading-[18px] text-[#f04438]">
                  Maximaal {subpartijTonnage.toLocaleString("nl-NL")} t beschikbaar
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#eaecf0]" />

        {/* Footer */}
        <div className="px-[24px] py-[16px] flex justify-end gap-[12px]">
          <Button variant="secondary" label="Annuleren" onClick={handleClose} />
          <Button variant="primary" label="Opslaan" onClick={handleSave} disabled={!marktMin || isOverTonnage} />
        </div>
      </div>
    </div>
  );
}
