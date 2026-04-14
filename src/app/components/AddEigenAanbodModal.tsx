import { useState, useMemo, useRef, useEffect } from "react";
import Button from "./Button";
import Checkbox from "./Checkbox";
import { partijen, subpartijen } from "../data/entities/partijen";

interface EnrichedSubpartij {
  id: string;
  naam: string;
  partijNaam: string;
  totalTonnage: number;
}

interface AddEigenAanbodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { subpartijId: string; subpartijNaam: string; marktMin: number; marktMax: number }) => void;
}

export default function AddEigenAanbodModal({ isOpen, onClose, onSubmit }: AddEigenAanbodModalProps) {
  const [query, setQuery] = useState('');
  const [selectedSubpartij, setSelectedSubpartij] = useState<EnrichedSubpartij | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [marktMin, setMarktMin] = useState('');
  const [marktMax, setMarktMax] = useState('');
  const [isRange, setIsRange] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const enrichedSubpartijen = useMemo<EnrichedSubpartij[]>(() =>
    subpartijen.map(s => {
      const partij = partijen.find(p => p.id === s.partijId);
      return {
        id: s.id,
        naam: s.naam,
        partijNaam: partij?.naam ?? '—',
        totalTonnage: partij?.tonnage ?? 0,
      };
    }), []);

  const searchResults = useMemo(() => {
    if (!query) return enrichedSubpartijen.slice(0, 6);
    const q = query.toLowerCase();
    return enrichedSubpartijen.filter(s =>
      s.naam.toLowerCase().includes(q) || s.partijNaam.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, enrichedSubpartijen]);

  const marktMinValue = parseFloat(marktMin.replace(/\./g, '').replace(',', '.')) || 0;
  const eigenVloot = selectedSubpartij ? Math.max(0, selectedSubpartij.totalTonnage - marktMinValue) : 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (sub: EnrichedSubpartij) => {
    setSelectedSubpartij(sub);
    setShowDropdown(false);
    setQuery('');
    setMarktMin('');
    setMarktMax('');
  };

  const handleDeselect = () => {
    setSelectedSubpartij(null);
    setMarktMin('');
    setMarktMax('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleRangeToggle = (checked: boolean) => {
    setIsRange(checked);
    if (!checked) setMarktMax('');
  };

  const handleSubmit = () => {
    if (!selectedSubpartij) return;
    const marktMaxValue = parseFloat(marktMax.replace(/\./g, '').replace(',', '.')) || 0;
    onSubmit({
      subpartijId: selectedSubpartij.id,
      subpartijNaam: selectedSubpartij.naam,
      marktMin: marktMinValue,
      marktMax: isRange ? marktMaxValue : marktMinValue,
    });
    setQuery('');
    setSelectedSubpartij(null);
    setMarktMin('');
    setMarktMax('');
    setIsRange(false);
    onClose();
  };

  const handleTonnageChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setter(raw ? Number(raw).toLocaleString('nl-NL') : '');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[128px]">
      {/* Overlay */}
      <div
        className="absolute bg-[#0c111d] inset-0 opacity-70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[12px] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] w-full max-w-[640px] mx-[16px]">
        {/* Header */}
        <div className="content-stretch flex gap-[16px] items-start pt-[24px] px-[24px]">
          <div className="flex-1 flex flex-col gap-[4px]">
            <p className="font-sans font-bold leading-[26px] text-[#101828] text-[18px]">
              Lading toevoegen aan eigen aanbod
            </p>
          </div>
          <button onClick={onClose} className="overflow-clip relative shrink-0 size-[24px] hover:opacity-70">
            <div className="absolute inset-[20.83%]">
              <div className="absolute inset-[-10.53%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                  <path d="M13 1L1 13M1 1L13 13" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Form */}
        <div className="px-[24px] pt-[20px] pb-[24px] flex flex-col gap-[20px]">
          {/* Subpartij search */}
          <div className="flex flex-col gap-[6px]">
            <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
              Subpartij
            </p>

            {selectedSubpartij ? (
              <div className="bg-[#f9fafb] rounded-[8px] border border-[#d0d5dd] px-[14px] py-[12px] flex items-start gap-[12px]">
                <div className="flex-1 flex flex-col gap-[2px] min-w-0">
                  <p className="font-sans font-bold leading-[20px] text-[#101828] text-[14px]">
                    {selectedSubpartij.naam}
                  </p>
                  <p className="font-sans font-normal leading-[20px] text-[#475467] text-[13px]">
                    Partij {selectedSubpartij.partijNaam} &middot; {selectedSubpartij.totalTonnage.toLocaleString('nl-NL')} ton
                  </p>
                </div>
                <Button variant="secondary" size="sm" label="Wijzigen" onClick={handleDeselect} />
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center border border-[#d0d5dd] rounded-[8px] bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] overflow-hidden">
                  <div className="pl-[14px] shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M14 14L10.4 10.4M11.3333 6.66667C11.3333 9.24399 9.24399 11.3333 6.66667 11.3333C4.08934 11.3333 2 9.24399 2 6.66667C2 4.08934 4.08934 2 6.66667 2C9.24399 2 11.3333 4.08934 11.3333 6.66667Z" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
                    </svg>
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Zoek op subpartij of partij..."
                    className="flex-1 font-sans font-normal text-[14px] leading-[20px] text-[#101828] placeholder-[#667085] px-[10px] py-[10px] outline-none bg-transparent"
                  />
                </div>

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-[8px] border border-[#d0d5dd] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] z-10 overflow-hidden">
                    {searchResults.map(sub => (
                      <button
                        key={sub.id}
                        onMouseDown={e => { e.preventDefault(); handleSelect(sub); }}
                        className="w-full text-left px-[14px] py-[10px] flex flex-col gap-[2px] hover:bg-[#f9fafb] transition-colors"
                      >
                        <p className="font-sans font-bold leading-[20px] text-[#101828] text-[14px]">
                          {sub.naam}
                        </p>
                        <p className="font-sans font-normal leading-[18px] text-[#475467] text-[12px]">
                          Partij {sub.partijNaam} &middot; {sub.totalTonnage.toLocaleString('nl-NL')} ton
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tonnage fields — only shown after selecting a subpartij */}
          {selectedSubpartij && (
            <div className="flex gap-[12px] items-start">
              {/* Eigen vloot (readonly) */}
              <div className="flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  Eigen vloot
                </p>
                <div className="bg-white content-stretch flex items-start relative rounded-[6px] shrink-0 w-[140px]">
                  <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-[#d0d5dd] bg-[#f9fafb]" />
                  <input
                    type="text"
                    readOnly
                    value={eigenVloot.toLocaleString('nl-NL')}
                    className="flex-1 px-[12px] py-[8px] font-sans font-normal leading-[20px] text-[#667085] text-[14px] bg-transparent outline-none rounded-l-[6px] w-0 cursor-default select-none"
                  />
                  <div className="content-stretch flex items-center px-[12px] py-[8px] relative rounded-br-[8px] rounded-tr-[8px] shrink-0">
                    <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] text-left whitespace-nowrap">t</p>
                  </div>
                </div>
              </div>

              {/* Markt (editable, with range) */}
              <div className="flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  Markt
                </p>
                <div className="flex gap-[8px] items-center">
                  <div className="bg-white content-stretch flex items-start relative rounded-[6px] shrink-0 w-[140px]">
                    <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-[#d0d5dd]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={marktMin}
                      onChange={handleTonnageChange(setMarktMin)}
                      placeholder={isRange ? "Min" : "Aantal"}
                      className="flex-1 px-[12px] py-[8px] font-sans font-normal leading-[20px] text-[#101828] text-[14px] bg-transparent outline-none rounded-l-[6px] w-0"
                    />
                    <div className="content-stretch flex items-center px-[12px] py-[8px] relative rounded-br-[8px] rounded-tr-[8px] shrink-0">
                      <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] text-left whitespace-nowrap">t</p>
                    </div>
                  </div>
                  {isRange && (
                    <>
                      <span className="font-sans font-normal text-[#475467] text-[14px]">–</span>
                      <div className="bg-white content-stretch flex items-start relative rounded-[6px] shrink-0 w-[140px]">
                        <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-[#d0d5dd]" />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={marktMax}
                          onChange={handleTonnageChange(setMarktMax)}
                          placeholder="Max"
                          className="flex-1 px-[12px] py-[8px] font-sans font-normal leading-[20px] text-[#101828] text-[14px] bg-transparent outline-none rounded-l-[6px] w-0"
                        />
                        <div className="content-stretch flex items-center px-[12px] py-[8px] relative rounded-br-[8px] rounded-tr-[8px] shrink-0">
                          <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] text-left whitespace-nowrap">t</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <Checkbox
                  checked={isRange}
                  onChange={handleRangeToggle}
                  label="Range"
                />
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#eaecf0]" />

        {/* Footer */}
        <div className="px-[24px] py-[16px] flex justify-end gap-[12px]">
          <Button variant="secondary" label="Annuleren" onClick={onClose} />
          <Button
            variant="primary"
            label="Toevoegen"
            onClick={handleSubmit}
            disabled={!selectedSubpartij}
          />
        </div>
      </div>
    </div>
  );
}
