import { useState, useMemo, useRef, useEffect } from "react";
import Button from "./Button";
import SegmentedButtonGroup from "./SegmentedButtonGroup";
import { partijen, subpartijen, exen } from "../data/entities/partijen";
import { havens } from "../data/entities/havens";
import { vaartuigenEigen } from "../data/entities/vaartuigen-eigen";

/* ── Lading (subpartij) ── */

interface EnrichedSubpartij {
  id: string;
  naam: string;
  exNaam: string;
  exType: string;
  exDisplay: string;
  totalTonnage: number;
  laadlocatie: string;
  loslocatie: string;
  laaddatum: string;
  losdatum: string;
}

/* ── Vaartuig ── */

interface EnrichedVaartuig {
  id: string;
  naam: string;
  eni: string;
  scheepstype: string;
  groottonnage: number;
  locatie: string;
  beschikbaarVanaf: string;
}

const deriveScheepstype = (naam: string): string => {
  const n = naam.toLowerCase();
  if (n.includes('duwbak')) return 'Duwbak';
  if (n.includes('tanker')) return 'Tanker';
  return 'Motorschip';
};

/* ── Submit data ── */

export interface EigenAanbodSubmitData {
  type: 'lading' | 'vaartuig';
  // lading
  subpartijId?: string;
  subpartijNaam?: string;
  exNaam?: string;
  exType?: string;
  exDisplay?: string;
  marktMin?: number;
  marktMax?: number;
  laadlocatie?: string;
  loslocatie?: string;
  laaddatum?: string;
  losdatum?: string;
  // vaartuig
  vaartuigId?: string;
  vaartuigNaam?: string;
  vaartuigEni?: string;
  vaartuigGroottonnage?: number;
  vaartuigLocatie?: string;
  vaartuigBeschikbaarVanaf?: string;
}

interface AddEigenAanbodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EigenAanbodSubmitData) => void;
  initialItemType?: 'lading' | 'vaartuig';
}

/* ── Shared tonnage input ── */

function TonnageInput({ value, onChange, placeholder, readOnly, error }: {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  error?: boolean;
}) {
  return (
    <div className={`content-stretch flex items-start relative rounded-[6px] flex-1 min-w-0 ${readOnly ? 'bg-[#f9fafb]' : 'bg-white'}`}>
      <div aria-hidden="true" className={`absolute border border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] ${error ? 'border-[#f04438]' : 'border-[#d0d5dd]'}`} />
      <input
        type="text"
        inputMode={readOnly ? undefined : "numeric"}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`flex-1 px-[12px] py-[8px] font-sans font-normal leading-[20px] text-[14px] bg-transparent outline-none rounded-l-[6px] w-0 ${readOnly ? 'text-[#667085] cursor-default select-none' : 'text-[#101828]'}`}
      />
      <div className="content-stretch flex items-center px-[12px] py-[8px] relative rounded-br-[8px] rounded-tr-[8px] shrink-0">
        <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] whitespace-nowrap">t</p>
      </div>
    </div>
  );
}

/* ── Main component ── */

export default function AddEigenAanbodModal({ isOpen, onClose, onSubmit, initialItemType = 'lading' }: AddEigenAanbodModalProps) {
  const [itemType, setItemType] = useState<'lading' | 'vaartuig'>(initialItemType);

  // Reset itemType when modal opens with a new initialItemType
  useEffect(() => {
    if (isOpen) setItemType(initialItemType);
  }, [isOpen, initialItemType]);

  // Lading state
  const [ladingQuery, setLadingQuery] = useState('');
  const [selectedSubpartij, setSelectedSubpartij] = useState<EnrichedSubpartij | null>(null);
  const [showLadingDropdown, setShowLadingDropdown] = useState(false);
  const [marktMin, setMarktMin] = useState('');

  // Vaartuig state
  const [vaartuigQuery, setVaartuigQuery] = useState('');
  const [selectedVaartuig, setSelectedVaartuig] = useState<EnrichedVaartuig | null>(null);
  const [showVaartuigDropdown, setShowVaartuigDropdown] = useState(false);

  const ladingInputRef = useRef<HTMLInputElement>(null);
  const vaartuigInputRef = useRef<HTMLInputElement>(null);
  const ladingDropdownRef = useRef<HTMLDivElement>(null);
  const vaartuigDropdownRef = useRef<HTMLDivElement>(null);

  /* ── Enriched data ── */

  const enrichedSubpartijen = useMemo<EnrichedSubpartij[]>(() =>
    subpartijen.map(s => {
      const partij = partijen.find(p => p.id === s.partijId);
      const ex = exen.find(e => e.id === partij?.exId);
      const laadlocatie = havens.find(h => h.id === partij?.laadlocatieId)?.naam ?? '—';
      const loslocatie = havens.find(h => h.id === s.loslocatieId)?.naam ?? '—';
      const exNaam = ex?.naam ?? '—';
      const exType = ex?.type ?? 'zeeboot';
      return {
        id: s.id,
        naam: s.naam,
        exNaam,
        exType,
        exDisplay: exType === 'zeeboot' ? `m/v ${exNaam}` : exNaam,
        totalTonnage: partij?.tonnage ?? 0,
        laadlocatie,
        loslocatie,
        laaddatum: s.laaddatum ?? '',
        losdatum: s.losdatum ?? '',
      };
    }), []);

  const enrichedVaartuigen = useMemo<EnrichedVaartuig[]>(() =>
    vaartuigenEigen.map(v => ({
      id: v.id,
      naam: v.naam,
      eni: v.eni,
      scheepstype: deriveScheepstype(v.naam),
      groottonnage: v.groottonnage,
      locatie: havens.find(h => h.id === v.huidigeLocatieId)?.naam ?? '—',
      beschikbaarVanaf: v.beschikbaarVanaf,
    })), []);

  const ladingResults = useMemo(() => {
    if (!ladingQuery) return enrichedSubpartijen.slice(0, 6);
    const q = ladingQuery.toLowerCase();
    return enrichedSubpartijen.filter(s =>
      s.naam.toLowerCase().includes(q) || s.exNaam.toLowerCase().includes(q) || s.exDisplay.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [ladingQuery, enrichedSubpartijen]);

  const vaartuigResults = useMemo(() => {
    if (!vaartuigQuery) return enrichedVaartuigen.slice(0, 6);
    const q = vaartuigQuery.toLowerCase();
    return enrichedVaartuigen.filter(v =>
      v.naam.toLowerCase().includes(q) || v.eni.includes(q)
    ).slice(0, 8);
  }, [vaartuigQuery, enrichedVaartuigen]);

  /* ── Computed ── */

  const parseNum = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
  const marktMinValue = parseNum(marktMin);
  const total = selectedSubpartij?.totalTonnage ?? 0;

  const eigenVlootDisplay = useMemo(() => {
    if (!selectedSubpartij) return '';
    return Math.max(0, total - marktMinValue).toLocaleString('nl-NL');
  }, [selectedSubpartij, total, marktMinValue]);

  /* ── Outside click ── */

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ladingDropdownRef.current && !ladingDropdownRef.current.contains(e.target as Node)) setShowLadingDropdown(false);
      if (vaartuigDropdownRef.current && !vaartuigDropdownRef.current.contains(e.target as Node)) setShowVaartuigDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* ── Handlers ── */

  const handleSelectSubpartij = (sub: EnrichedSubpartij) => {
    setSelectedSubpartij(sub);
    setShowLadingDropdown(false);
    setLadingQuery('');
    setMarktMin('');
  };

  const handleDeselectSubpartij = () => {
    setSelectedSubpartij(null);
    setMarktMin('');
    setTimeout(() => ladingInputRef.current?.focus(), 0);
  };

  const handleSelectVaartuig = (v: EnrichedVaartuig) => {
    setSelectedVaartuig(v);
    setShowVaartuigDropdown(false);
    setVaartuigQuery('');
  };

  const handleDeselectVaartuig = () => {
    setSelectedVaartuig(null);
    setTimeout(() => vaartuigInputRef.current?.focus(), 0);
  };

  const handleTonnageChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setter(raw ? Number(raw).toLocaleString('nl-NL') : '');
  };

  const handleSubmit = () => {
    if (itemType === 'lading') {
      if (!selectedSubpartij) return;
      onSubmit({
        type: 'lading',
        subpartijId: selectedSubpartij.id,
        subpartijNaam: selectedSubpartij.naam,
        exNaam: selectedSubpartij.exNaam,
        exType: selectedSubpartij.exType,
        exDisplay: selectedSubpartij.exDisplay,
        marktMin: marktMinValue,
        marktMax: marktMinValue,
        laadlocatie: selectedSubpartij.laadlocatie,
        loslocatie: selectedSubpartij.loslocatie,
        laaddatum: selectedSubpartij.laaddatum,
        losdatum: selectedSubpartij.losdatum,
      });
    } else {
      if (!selectedVaartuig) return;
      onSubmit({
        type: 'vaartuig',
        vaartuigId: selectedVaartuig.id,
        vaartuigNaam: selectedVaartuig.naam,
        vaartuigEni: selectedVaartuig.eni,
        vaartuigGroottonnage: selectedVaartuig.groottonnage,
        vaartuigLocatie: selectedVaartuig.locatie,
        vaartuigBeschikbaarVanaf: selectedVaartuig.beschikbaarVanaf,
      });
    }
    // reset
    setLadingQuery('');
    setSelectedSubpartij(null);
    setMarktMin('');
    setVaartuigQuery('');
    setSelectedVaartuig(null);
    onClose();
  };

  const isOverTonnage = !!selectedSubpartij && marktMin !== '' && marktMinValue > total;
  const canSubmit = itemType === 'lading' ? (!!selectedSubpartij && !isOverTonnage) : !!selectedVaartuig;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[128px]">
      <div className="absolute bg-[#0c111d] inset-0 opacity-70" onClick={onClose} />

      <div className="relative bg-white rounded-[12px] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] w-full max-w-[640px] mx-[16px]">
        {/* Header */}
        <div className="content-stretch flex gap-[16px] items-start pt-[24px] px-[24px]">
          <div className="flex-1 flex flex-col gap-[4px]">
            <p className="font-sans font-bold leading-[26px] text-[#101828] text-[18px]">
              Toevoegen aan eigen aanbod
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

        <div className="h-[20px] shrink-0 w-full" />

        {/* Segmented type selector */}
        <div className="px-[24px]">
          <SegmentedButtonGroup
            items={[
              { value: 'lading', label: 'Lading' },
              { value: 'vaartuig', label: 'Vaartuig' },
            ]}
            value={itemType}
            onChange={v => setItemType(v as 'lading' | 'vaartuig')}
            className="w-full"
            fullWidth
          />
        </div>

        {/* Form */}
        <div className="px-[24px] pt-[24px] pb-[24px] flex flex-col gap-[20px]">

          {/* ── Lading form ── */}
          {itemType === 'lading' && (
            <>
              <div className="flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Subpartij</p>
                {selectedSubpartij ? (
                  <div className="bg-[#f9fafb] rounded-[8px] border border-[#d0d5dd] px-[14px] py-[12px] flex items-start gap-[12px]">
                    <div className="flex-1 flex flex-col gap-[2px] min-w-0">
                      <p className="font-sans font-bold leading-[20px] text-[#101828] text-[14px]">{selectedSubpartij.exDisplay}</p>
                      <p className="font-sans font-normal leading-[20px] text-[#475467] text-[13px]">
                        {selectedSubpartij.naam} &middot; {selectedSubpartij.totalTonnage.toLocaleString('nl-NL')} ton
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" label="Wijzigen" onClick={handleDeselectSubpartij} />
                  </div>
                ) : (
                  <div className="relative" ref={ladingDropdownRef}>
                    <div className="flex items-center border border-[#d0d5dd] rounded-[8px] bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] overflow-hidden">
                      <div className="pl-[14px] shrink-0">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M14 14L10.4 10.4M11.3333 6.66667C11.3333 9.24399 9.24399 11.3333 6.66667 11.3333C4.08934 11.3333 2 9.24399 2 6.66667C2 4.08934 4.08934 2 6.66667 2C9.24399 2 11.3333 4.08934 11.3333 6.66667Z" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
                        </svg>
                      </div>
                      <input
                        ref={ladingInputRef}
                        type="text"
                        value={ladingQuery}
                        onChange={e => { setLadingQuery(e.target.value); setShowLadingDropdown(true); }}
                        onFocus={() => setShowLadingDropdown(true)}
                        placeholder="Zoek op ex of subpartij..."
                        className="flex-1 font-sans font-normal text-[14px] leading-[20px] text-[#101828] placeholder-[#667085] px-[10px] py-[10px] outline-none bg-transparent"
                      />
                    </div>
                    {showLadingDropdown && ladingResults.length > 0 && (
                      <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-[8px] border border-[#d0d5dd] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] z-10 overflow-hidden">
                        {ladingResults.map(sub => (
                          <button
                            key={sub.id}
                            onMouseDown={e => { e.preventDefault(); handleSelectSubpartij(sub); }}
                            className="w-full text-left px-[14px] py-[10px] flex flex-col gap-[2px] hover:bg-[#f9fafb] transition-colors"
                          >
                            <p className="font-sans font-bold leading-[20px] text-[#101828] text-[14px]">{sub.exDisplay}</p>
                            <p className="font-sans font-normal leading-[18px] text-[#475467] text-[12px]">
                              {sub.naam} &middot; {sub.totalTonnage.toLocaleString('nl-NL')} ton
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedSubpartij && (
                <div className="flex gap-[12px] items-start">
                  <div className="flex-1 flex flex-col gap-[6px]">
                    <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Eigen vloot</p>
                    <TonnageInput value={eigenVlootDisplay} readOnly />
                    {marktMinValue >= total && total > 0 ? (
                      <button
                        onClick={() => setMarktMin('')}
                        className="self-start flex items-center gap-[4px] font-sans font-bold text-[14px] leading-[20px] text-[#1567a4] hover:text-[#0f4f82] transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M13 8H3M3 8L7 4M3 8L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Alles terughalen
                      </button>
                    ) : (
                      <button
                        onClick={() => setMarktMin(total.toLocaleString('nl-NL'))}
                        className="self-start flex items-center gap-[4px] font-sans font-bold text-[14px] leading-[20px] text-[#1567a4] hover:text-[#0f4f82] transition-colors"
                      >
                        Alles in de markt
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-[6px]">
                    <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Markt</p>
                    <TonnageInput value={marktMin} onChange={handleTonnageChange(setMarktMin)} placeholder="Aantal" error={isOverTonnage} />
                    {isOverTonnage && (
                      <p className="font-sans font-normal text-[12px] leading-[18px] text-[#f04438]">
                        Maximaal {total.toLocaleString('nl-NL')} t beschikbaar
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Vaartuig form ── */}
          {itemType === 'vaartuig' && (
            <div className="flex flex-col gap-[6px]">
              <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Vaartuig</p>
              {selectedVaartuig ? (
                <div className="bg-[#f9fafb] rounded-[8px] border border-[#d0d5dd] px-[14px] py-[12px] flex items-start gap-[12px]">
                  <div className="flex-1 flex flex-col gap-[4px] min-w-0">
                    <p className="font-sans font-bold leading-[20px] text-[#101828] text-[14px]">{selectedVaartuig.naam}</p>
                    <p className="font-sans font-normal leading-[18px] text-[#475467] text-[13px]">
                      {selectedVaartuig.scheepstype} &middot; {selectedVaartuig.groottonnage.toLocaleString('nl-NL')} ton
                    </p>
                    <div className="flex items-center gap-[6px]">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                        <circle cx="6" cy="6" r="5" fill="#258DD2" opacity="0.3" />
                        <circle cx="6" cy="6" r="3" fill="#258DD2" />
                      </svg>
                      <p className="font-sans font-normal leading-[18px] text-rdj-text-primary text-[12px]">
                        {selectedVaartuig.locatie}
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" label="Wijzigen" onClick={handleDeselectVaartuig} />
                </div>
              ) : (
                <div className="relative" ref={vaartuigDropdownRef}>
                  <div className="flex items-center border border-[#d0d5dd] rounded-[8px] bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] overflow-hidden">
                    <div className="pl-[14px] shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M14 14L10.4 10.4M11.3333 6.66667C11.3333 9.24399 9.24399 11.3333 6.66667 11.3333C4.08934 11.3333 2 9.24399 2 6.66667C2 4.08934 4.08934 2 6.66667 2C9.24399 2 11.3333 4.08934 11.3333 6.66667Z" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
                      </svg>
                    </div>
                    <input
                      ref={vaartuigInputRef}
                      type="text"
                      value={vaartuigQuery}
                      onChange={e => { setVaartuigQuery(e.target.value); setShowVaartuigDropdown(true); }}
                      onFocus={() => setShowVaartuigDropdown(true)}
                      placeholder="Zoek op vaartuignaam of ENI-nummer..."
                      className="flex-1 font-sans font-normal text-[14px] leading-[20px] text-[#101828] placeholder-[#667085] px-[10px] py-[10px] outline-none bg-transparent"
                    />
                  </div>
                  {showVaartuigDropdown && vaartuigResults.length > 0 && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-[8px] border border-[#d0d5dd] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] z-10 overflow-hidden">
                      {vaartuigResults.map(v => (
                        <button
                          key={v.id}
                          onMouseDown={e => { e.preventDefault(); handleSelectVaartuig(v); }}
                          className="w-full text-left px-[14px] py-[10px] flex flex-col gap-[2px] hover:bg-[#f9fafb] transition-colors"
                        >
                          <p className="font-sans font-bold leading-[20px] text-[#101828] text-[14px]">{v.naam}</p>
                          <p className="font-sans font-normal leading-[18px] text-[#475467] text-[12px]">
                            {v.scheepstype} &middot; {v.groottonnage.toLocaleString('nl-NL')} ton
                          </p>
                          <div className="flex items-center gap-[6px]">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                              <circle cx="6" cy="6" r="5" fill="#258DD2" opacity="0.3" />
                              <circle cx="6" cy="6" r="3" fill="#258DD2" />
                            </svg>
                            <p className="font-sans font-normal leading-[18px] text-rdj-text-primary text-[12px]">
                              {v.locatie}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#eaecf0]" />

        {/* Footer */}
        <div className="px-[24px] py-[16px] flex justify-end gap-[12px]">
          <Button variant="secondary" label="Annuleren" onClick={onClose} />
          <Button variant="primary" label="Toevoegen" onClick={handleSubmit} disabled={!canSubmit} />
        </div>
      </div>
    </div>
  );
}
