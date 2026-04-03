import { useState, useMemo, useRef, useEffect } from "react";
import svgPaths from "../../imports/svg-hstiyx955m";
import { type Relatie } from "../data/api";
import { mockRelaties } from "../data/mock-relatie-data";
import Button from "./Button";
import Checkbox from "./Checkbox";
import SegmentedButtonGroup from "./SegmentedButtonGroup";
import TermijnDropdown, { type TermijnValue } from "./TermijnDropdown";
import DatePickerPopover, { type DatePickerValue, formatDatePickerValue } from "./DatePickerPopover";
import { TermijnPill } from "./TermijnDropdown";

/* ── Condition pills (zoekcriteria) ── */

type ConditionKey = "prijs" | "laadtijd" | "laadgereed" | "liggeldLaden" | "lostijd" | "losgereed" | "liggeldLossen" | "deadline" | "overig";
type ConditionValues = Partial<Record<ConditionKey, string>>;

const fmtLiggeld = (v: string, label: string) => {
  if (v.toUpperCase() === "NLW") return `NLW ${label}`;
  return `€${v} ${label}`;
};

const CONDITION_DEFS: { key: ConditionKey; label: string; placeholder?: string; format: (v: string) => string; isDate?: boolean; isTermijn?: boolean }[] = [
  { key: "prijs", label: "Prijs", placeholder: "bijv. 4,00", format: v => `€${v} /ton` },
  { key: "laadtijd", label: "Laadtijd", placeholder: "bijv. 12", format: v => `${v} uur laden` },
  { key: "laadgereed", label: "Laadgereed", placeholder: "datum", format: v => `laadgereed ${v}`, isDate: true },
  { key: "liggeldLaden", label: "Liggeld laden", placeholder: "bijv. 25 of NLW", format: v => fmtLiggeld(v, "liggeld laden") },
  { key: "lostijd", label: "Lostijd", placeholder: "bijv. 8", format: v => `${v} uur lossen` },
  { key: "losgereed", label: "Losgereed", placeholder: "datum", format: v => `losgereed ${v}`, isDate: true },
  { key: "liggeldLossen", label: "Liggeld lossen", placeholder: "bijv. 25 of NLW", format: v => fmtLiggeld(v, "liggeld lossen") },
  { key: "deadline", label: "Deadline", placeholder: "bijv. 21-03", format: v => `deadline ${v}` },
  { key: "overig", label: "Overig", placeholder: "vrije tekst", format: v => v },
];

function ConditionPill({ def, value, onChange }: { def: (typeof CONDITION_DEFS)[number]; value?: string; onChange: (value: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleConfirm = () => { onChange(draft.trim()); setEditing(false); };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") { setDraft(value || ""); setEditing(false); }
  };

  if (editing) {
    return (
      <span className="inline-flex items-center rounded-full border border-[#1567a4] bg-white overflow-hidden">
        <span className="font-sans font-bold text-[12px] leading-[16px] text-[#344054] pl-[10px] pr-[4px] whitespace-nowrap">{def.label}</span>
        <input ref={inputRef} type="text" value={draft} onChange={e => setDraft(e.target.value)} onBlur={handleConfirm} onKeyDown={handleKeyDown} placeholder={def.placeholder} className="font-sans font-normal text-[12px] leading-[16px] text-[#101828] w-[80px] py-[3px] pr-[10px] outline-none bg-transparent" />
      </span>
    );
  }
  if (value) {
    return (
      <span className="inline-flex items-center rounded-full border border-[#abefc6] bg-[#ecfdf3] pl-[10px] pr-[6px] py-[3px] gap-[4px] hover:bg-[#d1fadf] transition-colors">
        <button onClick={() => { setDraft(value); setEditing(true); }} className="font-sans font-bold text-[12px] leading-[16px] text-[#067647]">
          {def.format(value)}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onChange(""); }} className="flex items-center justify-center text-[#067647] opacity-50 hover:opacity-100 transition-opacity">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M8 2L2 8M2 2L8 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
        </button>
      </span>
    );
  }
  return (
    <button onClick={() => { setDraft(""); setEditing(true); }} className="inline-flex items-center rounded-full border border-dashed border-[#d0d5dd] bg-white px-[10px] py-[3px] font-sans font-normal text-[12px] leading-[16px] text-[#667085] hover:border-[#98a2b3] hover:text-[#344054] transition-colors">
      {def.label}
    </button>
  );
}

function DateConditionPill({ def, value, onChange }: { def: (typeof CONDITION_DEFS)[number]; value?: string; onChange: (value: string) => void }) {
  const [pickerValue, setPickerValue] = useState<DatePickerValue | undefined>(undefined);
  const handleDateChange = (val: DatePickerValue) => { setPickerValue(val); const formatted = formatDatePickerValue(val); if (formatted) onChange(formatted); };

  if (value) {
    return (
      <DatePickerPopover value={pickerValue} onChange={handleDateChange}>
        <span className="inline-flex items-center rounded-full border border-[#abefc6] bg-[#ecfdf3] pl-[10px] pr-[6px] py-[3px] gap-[4px] hover:bg-[#d1fadf] transition-colors cursor-pointer">
          <span className="font-sans font-bold text-[12px] leading-[16px] text-[#067647]">{def.format(value)}</span>
          <button onClick={(e) => { e.stopPropagation(); onChange(""); }} className="flex items-center justify-center text-[#067647] opacity-50 hover:opacity-100 transition-opacity">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M8 2L2 8M2 2L8 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
          </button>
        </span>
      </DatePickerPopover>
    );
  }
  return (
    <DatePickerPopover value={pickerValue} onChange={handleDateChange}>
      <button className="inline-flex items-center rounded-full border border-dashed border-[#d0d5dd] bg-white px-[10px] py-[3px] font-sans font-normal text-[12px] leading-[16px] text-[#667085] hover:border-[#98a2b3] hover:text-[#344054] transition-colors">
        {def.label}
      </button>
    </DatePickerPopover>
  );
}

// Simulated IVR Hull Database
interface IvrVessel { eni: string; naam: string; eigenaar: string }
const ivrDatabase: IvrVessel[] = [
  { eni: "02332456", naam: "Emily", eigenaar: "Van der Berg Shipping B.V." },
  { eni: "02334567", naam: "S.S. Anna", eigenaar: "Rijnvaart Transport N.V." },
  { eni: "02335678", naam: "Bregje", eigenaar: "De Vries Binnenvaart" },
  { eni: "02336789", naam: "Hercules", eigenaar: "Duwvaart Nederland B.V." },
  { eni: "02331111", naam: "Antonia V", eigenaar: "Visscher & Zonen" },
  { eni: "02332222", naam: "Duwbak Alfa-1", eigenaar: "Alfa Duwvaart B.V." },
  { eni: "02333333", naam: "Duwbak Alfa-2", eigenaar: "Alfa Duwvaart B.V." },
  { eni: "02337890", naam: "Orion", eigenaar: "Stervaart Logistics B.V." },
  { eni: "02338901", naam: "Cornelia", eigenaar: "Janssen Scheepvaart" },
  { eni: "02339012", naam: "De Hoop", eigenaar: "Combinatie De Hoop V.O.F." },
];

interface AddInboxItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  itemType: 'lading' | 'vaartuig';
}

export default function AddInboxItemModal({ isOpen, onClose, onSubmit, itemType: initialItemType }: AddInboxItemModalProps) {
  const [itemType, setItemType] = useState<'lading' | 'vaartuig'>(initialItemType);
  const [isRange, setIsRange] = useState(false);
  const [loadTerms, setLoadTerms] = useState<TermijnValue | undefined>();
  const [unloadTerms, setUnloadTerms] = useState<TermijnValue | undefined>();
  const [eniQuery, setEniQuery] = useState('');
  const [selectedVessel, setSelectedVessel] = useState<IvrVessel | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const eniInputRef = useRef<HTMLInputElement>(null);
  const [relatieQuery, setRelatieQuery] = useState('');
  const [selectedRelatie, setSelectedRelatie] = useState<Relatie | null>(null);
  const [showRelatieDropdown, setShowRelatieDropdown] = useState(false);
  const [showNieuweRelatie, setShowNieuweRelatie] = useState(false);
  const relatieInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    relation: '',
    contactPerson: '',
    tonnageMin: '',
    tonnageMax: '',
    cargoType: '',
    cargoSubType: '',
    specificWeight: '',
    loadPort: '',
    unloadPort: '',
    owner: '',
    priority: 1,
  });
  const [conditions, setConditions] = useState<ConditionValues>({});
  const setCondition = (key: ConditionKey, value: string) => setConditions(prev => ({ ...prev, [key]: value || undefined }));

  const eniSearchResults = useMemo(() => {
    const q = eniQuery.replace(/\s/g, '');
    if (q.length < 2) return [];
    return ivrDatabase.filter(
      (v) => v.eni.includes(q) || v.naam.toLowerCase().includes(q.toLowerCase())
    );
  }, [eniQuery]);

  const relatieSearchResults = useMemo(() => {
    if (relatieQuery.length < 1) return mockRelaties.slice(0, 6);
    const q = relatieQuery.toLowerCase();
    return mockRelaties.filter(
      (r) => r.naam.toLowerCase().includes(q) || r.plaats?.toLowerCase().includes(q)
    );
  }, [relatieQuery]);

  // Auto-fill relatie from IVR eigenaar when vessel is selected
  useEffect(() => {
    if (selectedVessel && !selectedRelatie) {
      const eigenaar = selectedVessel.eigenaar.toLowerCase();
      const match = mockRelaties.find((r) => r.naam.toLowerCase() === eigenaar);
      if (match) {
        setSelectedRelatie(match);
        setRelatieQuery('');
        setShowNieuweRelatie(false);
      } else {
        setRelatieQuery(selectedVessel.eigenaar);
        setShowNieuweRelatie(true);
      }
    }
  }, [selectedVessel]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ ...formData, eniNumber: selectedVessel?.eni, ivrNaam: selectedVessel?.naam, relatieId: selectedRelatie?.id, relatieNaam: selectedRelatie?.naam ?? (showNieuweRelatie ? relatieQuery : undefined), loadTerms, unloadTerms, tonnageMax: isRange ? formData.tonnageMax : '', type: itemType, conditions });
    // Reset form
    setEniQuery('');
    setSelectedVessel(null);
    setRelatieQuery('');
    setSelectedRelatie(null);
    setShowNieuweRelatie(false);
    setFormData({
      relation: '',
      contactPerson: '',
      tonnageMin: '',
      tonnageMax: '',
      cargoType: '',
      cargoSubType: '',
      specificWeight: '',
      loadPort: '',
      unloadPort: '',
      owner: '',
      priority: 1,
    });
    setLoadTerms(undefined);
    setUnloadTerms(undefined);
    setConditions({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[128px]">
      {/* Background Overlay */}
      <div 
        className="absolute bg-[#0c111d] inset-0 opacity-70" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[12px] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] w-full max-w-[640px] max-h-[90vh] overflow-auto mx-[16px]">
        {/* Header */}
        <div className="relative shrink-0 w-full">
          <div className="content-stretch flex gap-[16px] items-start pt-[24px] px-[24px] relative w-full">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative">
              <p className="font-sans font-bold leading-[26px] relative shrink-0 text-[#101828] text-[18px] w-full">
                Nieuw item toevoegen aan inbox
              </p>
            </div>
            <button 
              onClick={onClose}
              className="overflow-clip relative shrink-0 size-[24px] hover:opacity-70"
            >
              <div className="absolute inset-[20.83%]">
                <div className="absolute inset-[-10.53%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                    <path d="M13 1L1 13M1 1L13 13" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="h-[20px] shrink-0 w-full" />

        {/* Type selector */}
        <div className="px-[24px]">
          <SegmentedButtonGroup
            items={[
              { value: 'lading', label: 'Lading' },
              { value: 'vaartuig', label: 'Vaartuig' },
            ]}
            value={itemType}
            onChange={(v) => setItemType(v as 'lading' | 'vaartuig')}
            className="w-full"
            fullWidth
          />
        </div>

        {/* Form Content */}
        <div className="px-[24px] py-[24px]">
          <div className="flex flex-col gap-[20px]">
            {/* ENI Lookup (vaartuig only) */}
            {itemType === 'vaartuig' && (
              <div className="flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  {selectedVessel ? 'Geselecteerd vaartuig' : 'ENI-nummer'}
                </p>

                {selectedVessel ? (
                  <div className="bg-[#f9fafb] rounded-[8px] border border-[#d0d5dd] px-[14px] py-[12px] flex items-start gap-[12px]">
                    <div className="flex-1 flex flex-col gap-[2px] min-w-0">
                      <p className="font-sans font-bold leading-[20px] text-[#101828] text-[14px]">
                        {selectedVessel.naam}
                      </p>
                      <p className="font-sans font-normal leading-[20px] text-[#475467] text-[13px]">
                        ENI {selectedVessel.eni} &middot; {selectedVessel.eigenaar}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="xs"
                      icon={
                        <svg fill="none" viewBox="0 0 10 10">
                          <path d={svgPaths.p1ddb9c00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
                        </svg>
                      }
                      onClick={() => {
                        setSelectedVessel(null);
                        setEniQuery('');
                        setTimeout(() => eniInputRef.current?.focus(), 0);
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      ref={eniInputRef}
                      type="text"
                      value={eniQuery}
                      onChange={(e) => {
                        setEniQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                      className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                      placeholder="Zoek op ENI-nummer of naam..."
                    />
                    {showDropdown && eniQuery.length >= 2 && (
                      <div className="absolute z-10 top-[calc(100%+4px)] left-0 w-full bg-white rounded-[8px] border border-[#d0d5dd] shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] max-h-[200px] overflow-auto">
                        {eniSearchResults.length === 0 ? (
                          <div className="px-[12px] py-[10px]">
                            <p className="font-sans font-normal leading-[20px] text-[#475467] text-[13px]">
                              Geen resultaten gevonden
                            </p>
                          </div>
                        ) : (
                          eniSearchResults.map((vessel) => (
                            <button
                              key={vessel.eni}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setSelectedVessel(vessel);
                                setEniQuery('');
                                setShowDropdown(false);
                              }}
                              className="w-full text-left px-[12px] py-[8px] hover:bg-[#f2f4f7] flex flex-col gap-[1px] cursor-pointer first:rounded-t-[8px] last:rounded-b-[8px]"
                            >
                              <p className="font-sans font-bold leading-[20px] text-[#101828] text-[14px]">
                                {vessel.naam}
                              </p>
                              <p className="font-sans font-normal leading-[18px] text-[#475467] text-[13px]">
                                ENI {vessel.eni} &middot; {vessel.eigenaar}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Row 1: Relatie & Contactpersoon */}
            <div className="flex gap-[12px] w-full">
              <div className="flex-1 flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  Relatie
                </p>

                {selectedRelatie || showNieuweRelatie ? (
                  <>
                    <div className="relative w-full">
                      <div className="w-full px-[12px] py-[8px] pr-[36px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] bg-white truncate">
                        {selectedRelatie?.naam ?? relatieQuery}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRelatie(null);
                          setShowNieuweRelatie(false);
                          setRelatieQuery('');
                          setTimeout(() => relatieInputRef.current?.focus(), 0);
                        }}
                        className="absolute right-[10px] top-1/2 -translate-y-1/2 size-[16px] flex items-center justify-center text-[#667085] hover:text-[#344054]"
                      >
                        <svg className="block size-[10px]" fill="none" viewBox="0 0 10 10">
                          <path d={svgPaths.p1ddb9c00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
                        </svg>
                      </button>
                    </div>
                    {showNieuweRelatie && (
                      <p className="font-sans font-normal leading-[18px] text-[#475467] text-[13px]">
                        Wordt aangemaakt met alleen naam.{' '}
                        <button type="button" className="font-bold text-[#1567a4] hover:underline">
                          Details aanvullen
                        </button>
                      </p>
                    )}
                  </>
                ) : (
                  <div className="relative">
                    <input
                      ref={relatieInputRef}
                      type="text"
                      value={relatieQuery}
                      onChange={(e) => {
                        setRelatieQuery(e.target.value);
                        setShowRelatieDropdown(true);
                      }}
                      onFocus={() => setShowRelatieDropdown(true)}
                      onBlur={() => setTimeout(() => setShowRelatieDropdown(false), 150)}
                      className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                      placeholder="Zoek relatie..."
                    />
                    {showRelatieDropdown && (
                      <div className="absolute z-10 top-[calc(100%+4px)] left-0 w-full bg-white rounded-[8px] border border-[#d0d5dd] shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] max-h-[240px] overflow-auto">
                        {relatieSearchResults.map((relatie) => (
                          <button
                            key={relatie.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setSelectedRelatie(relatie);
                              setRelatieQuery('');
                              setShowRelatieDropdown(false);
                            }}
                            className="w-full text-left px-[12px] py-[8px] hover:bg-[#f2f4f7] flex items-center gap-[8px] cursor-pointer first:rounded-t-[8px] last:rounded-b-[8px]"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-sans font-bold leading-[20px] text-[#101828] text-[14px] truncate">
                                {relatie.naam}
                              </p>
                              {relatie.plaats && (
                                <p className="font-sans font-normal leading-[18px] text-[#475467] text-[13px]">
                                  {relatie.plaats}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                        {relatieQuery.length >= 2 && (
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setShowNieuweRelatie(true);
                              setShowRelatieDropdown(false);
                            }}
                            className="w-full text-left px-[12px] py-[8px] hover:bg-[#f2f4f7] flex items-center gap-[8px] cursor-pointer border-t border-[#eaecf0] last:rounded-b-[8px]"
                          >
                            <div className="overflow-clip shrink-0 size-[16px]">
                              <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                                <path d="M8 3.33v9.34M3.33 8h9.34" stroke="#1567A4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
                              </svg>
                            </div>
                            <p className="font-sans font-bold leading-[20px] text-[#1567a4] text-[14px]">
                              "{relatieQuery}" als nieuwe relatie aanmaken
                            </p>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  Contactpersoon (optioneel)
                </p>
                <div className="bg-white relative rounded-[6px] w-full">
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                    placeholder="Selecteer contactpersoon..."
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Tonnage & Ladingsoort */}
            {itemType === 'lading' && (
              <div className="flex gap-[12px] w-full">
                <div className="flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Tonnage
                  </p>
                  <div className="flex gap-[8px] items-center">
                    <div className={`bg-white content-stretch flex items-start relative rounded-[6px] shrink-0 w-[140px]`}>
                      <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-[#d0d5dd]" />
                      <input
                        type="text"
                        value={formData.tonnageMin}
                        onChange={(e) => setFormData({ ...formData, tonnageMin: e.target.value })}
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
                        <div className={`bg-white content-stretch flex items-start relative rounded-[6px] shrink-0 w-[140px]`}>
                          <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border-[#d0d5dd]" />
                          <input
                            type="text"
                            value={formData.tonnageMax}
                            onChange={(e) => setFormData({ ...formData, tonnageMax: e.target.value })}
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
                    onChange={(checked) => setIsRange(checked)}
                    label="Range"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Ladingsoort
                  </p>
                  <div className="bg-white relative rounded-[6px] w-full">
                    <input
                      type="text"
                      value={formData.cargoType}
                      onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                      className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                      placeholder="Bijv. Houtpellets"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Row 3: Subsoort & Soortelijk gewicht */}
            {itemType === 'lading' && (
              <div className="flex gap-[12px] w-full">
                <div className="flex-1 flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Subsoort (optioneel)
                  </p>
                  <div className="bg-white relative rounded-[6px] w-full">
                    <input
                      type="text"
                      value={formData.cargoSubType}
                      onChange={(e) => setFormData({ ...formData, cargoSubType: e.target.value })}
                      className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                      placeholder="Bijv. Naaldhoutpellets"
                    />
                  </div>
                </div>
                <div className="w-[160px] flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Soortelijk gewicht
                  </p>
                  <div className="bg-white relative rounded-[6px] flex items-center overflow-hidden border border-[#d0d5dd]">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.specificWeight}
                      onChange={(e) => setFormData({ ...formData, specificWeight: e.target.value })}
                      className="flex-1 px-[12px] py-[8px] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none"
                      placeholder="0,05"
                    />
                    <div className="px-[12px] py-[8px] bg-[#f9fafb]">
                      <p className="font-sans font-bold leading-[20px] text-[#475467] text-[14px]">
                        ton/m³
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info label */}
            {itemType === 'lading' && formData.tonnageMin && formData.specificWeight && (
              <div className="bg-white flex gap-[4px] items-center rounded-[6px] p-[8px] border border-[#d0d5dd]">
                <div className="overflow-clip relative shrink-0 size-[16px]">
                  <div className="absolute inset-[8.33%]">
                    <div className="absolute inset-[-5%]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
                        <path d={svgPaths.pbb03d00} stroke="#1567A4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="flex-1 font-sans font-normal leading-[20px] text-[#145990] text-[14px]">
                  Benodigde inhoud: {isRange && formData.tonnageMax
                    ? `${(parseFloat(formData.tonnageMin) / parseFloat(formData.specificWeight)).toFixed(0)}–${(parseFloat(formData.tonnageMax) / parseFloat(formData.specificWeight)).toFixed(0)} m³`
                    : `${(parseFloat(formData.tonnageMin) / parseFloat(formData.specificWeight)).toFixed(0)} m³`}
                </p>
              </div>
            )}

            {/* Row 4: Laadlocatie & Laadtermijn */}
            <div className="flex gap-[12px] w-full">
              <div className="flex-1 flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  {itemType === 'lading' ? 'Laadlocatie' : 'Beschikbaar vanaf'}
                </p>
                <div className="bg-white relative rounded-[6px] w-full">
                  <input
                    type="text"
                    value={formData.loadPort}
                    onChange={(e) => setFormData({ ...formData, loadPort: e.target.value })}
                    className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                    placeholder={itemType === 'lading' ? "Bijv. IJmuiden Buitenspuikanaal" : "Bijv. Week 12"}
                  />
                </div>
              </div>
              <div className="w-[270px] flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  {itemType === 'lading' ? 'Laadtermijn' : 'Locatie (optioneel)'}
                </p>
                {itemType === 'lading' ? (
                  <TermijnDropdown
                    value={loadTerms}
                    onChange={setLoadTerms}
                    placeholder="Selecteer termijn..."
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.loadPort}
                    onChange={(e) => setFormData({ ...formData, loadPort: e.target.value })}
                    className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4] bg-white"
                    placeholder="Bijv. ARA gebied"
                  />
                )}
              </div>
            </div>

            {/* Row 5: Loslocatie & Lostermijn */}
            {itemType === 'lading' && (
              <div className="flex gap-[12px] w-full">
                <div className="flex-1 flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Loslocatie
                  </p>
                  <div className="bg-white relative rounded-[6px] w-full">
                    <input
                      type="text"
                      value={formData.unloadPort}
                      onChange={(e) => setFormData({ ...formData, unloadPort: e.target.value })}
                      className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                      placeholder="Bijv. IJmuiden Buitenspuikanaal"
                    />
                  </div>
                </div>
                <div className="w-[270px] flex flex-col gap-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                    Lostermijn
                  </p>
                  <TermijnDropdown
                    value={unloadTerms}
                    onChange={setUnloadTerms}
                    placeholder="Selecteer termijn..."
                  />
                </div>
              </div>
            )}

            {/* Row 6: Eigenaar & Prioriteit */}
            <div className="flex gap-[12px] w-full">
              <div className="flex-1 flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  Eigenaar (optioneel)
                </p>
                <div className="bg-white relative rounded-[6px] w-full">
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1567a4]"
                    placeholder="Selecteer eigenaar..."
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">
                  Prioriteit
                </p>
                <div className="bg-white relative rounded-[6px] w-full border border-[#d0d5dd] px-[12px] py-[8px] flex items-center gap-[8px]">
                  <div className="flex gap-[4px]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFormData({ ...formData, priority: star })}
                        className="overflow-clip relative shrink-0 size-[20px]"
                      >
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                          <g clipPath="url(#clip0_1_39488)">
                            <path d={svgPaths.p2f878000} fill={star <= formData.priority ? "#FDB022" : "#F2F4F7"} />
                          </g>
                          <defs>
                            <clipPath id="clip0_1_39488">
                              <rect fill="white" height="20" width="20" />
                            </clipPath>
                          </defs>
                        </svg>
                      </button>
                    ))}
                  </div>
                  <p className="font-sans font-normal leading-[20px] text-[#101828] text-[14px]">
                    {formData.priority}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Condities (zoekcriteria) */}
          <div className="flex flex-col gap-[10px] pt-[4px]">
            <div className="flex items-center gap-[12px]">
              <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px] shrink-0">
                Zoekcriteria
              </p>
              <div className="flex-1 h-px bg-[#eaecf0]" />
            </div>
            <div className="flex items-center gap-[6px] flex-wrap">
              {CONDITION_DEFS.map(def =>
                def.isTermijn ? (
                  <TermijnPill key={def.key} label={def.label} value={conditions[def.key]} onChange={v => setCondition(def.key, v)} />
                ) : def.isDate ? (
                  <DateConditionPill key={def.key} def={def} value={conditions[def.key]} onChange={v => setCondition(def.key, v)} />
                ) : (
                  <ConditionPill key={def.key} def={def} value={conditions[def.key]} onChange={v => setCondition(def.key, v)} />
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#eaecf0] px-[24px] py-[16px]">
          <div className="flex gap-[12px] justify-end">
            <button 
              onClick={onClose}
              className="bg-white relative rounded-[6px] shrink-0"
            >
              <div className="content-stretch flex items-center justify-center px-[16px] py-[10px] relative rounded-[inherit]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px] whitespace-nowrap">
                  Annuleren
                </p>
              </div>
              <div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
            </button>
            <button 
              onClick={handleSubmit}
              className="bg-[#1567a4] relative rounded-[6px] shrink-0 hover:opacity-90"
            >
              <div className="content-stretch flex items-center justify-center px-[16px] py-[10px] relative rounded-[inherit]">
                <p className="font-sans font-bold leading-[20px] text-white text-[14px] whitespace-nowrap">
                  Item toevoegen
                </p>
              </div>
              <div aria-hidden="true" className="absolute border border-[#1567a4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
