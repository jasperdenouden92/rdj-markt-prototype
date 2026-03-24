import { useState } from "react";
import { useNavigate } from "react-router";
import { Ship, Package } from "lucide-react";
import Button from "./Button";

/* ── Condition definitions (same as ConversationDialog) ── */

type ConditionKey = "prijs" | "laadtijd" | "liggeldLaden" | "lostijd" | "liggeldLossen" | "overig";

interface ConditionValues {
  prijs?: string;
  laadtijd?: string;
  liggeldLaden?: string;
  lostijd?: string;
  liggeldLossen?: string;
  overig?: string;
}

const CONDITION_DEFS: { key: ConditionKey; label: string; placeholder: string; format: (v: string) => string }[] = [
  { key: "prijs", label: "Prijs", placeholder: "bijv. 4,00", format: v => `\u20AC${v} /ton` },
  { key: "laadtijd", label: "Laadtijd", placeholder: "bijv. 12", format: v => `${v} uur laden` },
  { key: "liggeldLaden", label: "Liggeld laden", placeholder: "bijv. 25", format: v => `\u20AC${v} liggeld laden` },
  { key: "lostijd", label: "Lostijd", placeholder: "bijv. 8", format: v => `${v} uur lossen` },
  { key: "liggeldLossen", label: "Liggeld lossen", placeholder: "bijv. 25", format: v => `\u20AC${v} liggeld lossen` },
  { key: "overig", label: "Overig", placeholder: "vrije tekst", format: v => v },
];

/* ── Types ── */

interface BrokerDialogProps {
  relatieA: { id: string; name: string };
  vesselName: string;
  vesselSubtitle: string;
  relatieB: { id: string; name: string };
  cargoName: string;
  cargoSubtitle: string;
  onClose: () => void;
}

/* ── Editable condition pill ── */

function ConditionPill({
  def,
  value,
  onChange,
}: {
  def: typeof CONDITION_DEFS[number];
  value?: string;
  onChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  if (editing) {
    return (
      <div className="flex items-center gap-[6px] rounded-[6px] border border-rdj-border-brand bg-white px-[8px] py-[4px]">
        <span className="font-sans font-medium text-[12px] text-rdj-text-secondary whitespace-nowrap">{def.label}:</span>
        <input
          autoFocus
          className="font-sans text-[12px] leading-[16px] text-rdj-text-primary w-[60px] outline-none bg-transparent"
          placeholder={def.placeholder}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => { onChange(draft); setEditing(false); }}
          onKeyDown={e => { if (e.key === "Enter") { onChange(draft); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
        />
      </div>
    );
  }

  if (value) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="rounded-[6px] border border-[#abefc6] bg-[#ecfdf3] px-[8px] py-[4px] font-sans font-medium text-[12px] text-[#067647] whitespace-nowrap hover:bg-[#d1fadf] transition-colors"
      >
        {def.format(value)}
      </button>
    );
  }

  return (
    <button
      onClick={() => { setDraft(""); setEditing(true); }}
      className="rounded-[6px] border border-dashed border-rdj-border-primary px-[8px] py-[4px] font-sans font-medium text-[12px] text-rdj-text-tertiary whitespace-nowrap hover:bg-rdj-bg-secondary-hover transition-colors"
    >
      + {def.label}
    </button>
  );
}

/* ── Main component ── */

export default function BrokerDialog({
  relatieA,
  vesselName,
  vesselSubtitle,
  relatieB,
  cargoName,
  cargoSubtitle,
  onClose,
}: BrokerDialogProps) {
  const navigate = useNavigate();
  const [inkoopConditions, setInkoopConditions] = useState<ConditionValues>({});
  const [verkoopConditions, setVerkoopConditions] = useState<ConditionValues>({});

  const setInkoop = (key: ConditionKey, value: string) =>
    setInkoopConditions(prev => ({ ...prev, [key]: value || undefined }));
  const setVerkoop = (key: ConditionKey, value: string) =>
    setVerkoopConditions(prev => ({ ...prev, [key]: value || undefined }));

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto flex flex-col bg-white w-full max-w-[960px] h-full shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
        {/* Header */}
        <div className="border-b border-rdj-border-secondary px-[32px] py-[20px] shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-[4px]">
              <p className="font-sans font-bold text-[18px] leading-[28px] text-rdj-text-primary">
                Bemiddeling: {cargoName} &harr; {vesselName}
              </p>
              <p className="font-sans font-normal text-[14px] leading-[20px] text-rdj-text-secondary">
                Koppel een marktlading aan een marktvaartuig via twee relaties.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-[8px] rounded-[8px] hover:bg-rdj-bg-primary-hover transition-colors shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body: two columns */}
        <div className="flex flex-1 min-h-0">
          {/* Left column — Relatie A (vaartuigeigenaar) */}
          <div className="w-[50%] flex flex-col border-r border-rdj-border-secondary min-w-0 overflow-y-auto">
            {/* Column header */}
            <div className="px-[24px] py-[16px] border-b border-rdj-border-secondary bg-rdj-bg-secondary">
              <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary">
                Inkoop &mdash;{" "}
                <span
                  className="text-rdj-text-brand cursor-pointer hover:underline"
                  onClick={() => navigate(`/crm/relatie/${relatieA.id}`)}
                >
                  {relatieA.name}
                </span>
              </p>
              <p className="font-sans font-normal text-[12px] leading-[16px] text-rdj-text-tertiary mt-[2px]">
                Vaartuigeigenaar
              </p>
            </div>

            {/* Vessel card */}
            <div className="px-[24px] py-[16px]">
              <div className="flex items-start gap-[12px] rounded-[8px] border border-rdj-border-secondary p-[16px] bg-white">
                <div className="flex items-center justify-center size-[36px] rounded-[8px] bg-rdj-bg-secondary shrink-0">
                  <Ship className="size-[18px] text-rdj-text-tertiary" />
                </div>
                <div className="flex flex-col gap-[2px] min-w-0">
                  <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary truncate">{vesselName}</p>
                  <p className="font-sans font-normal text-[13px] leading-[18px] text-rdj-text-secondary truncate">{vesselSubtitle}</p>
                </div>
              </div>
            </div>

            {/* Inkoop condities */}
            <div className="px-[24px] pb-[24px]">
              <p className="font-sans font-bold text-[11px] leading-[16px] text-rdj-text-tertiary uppercase tracking-[0.5px] mb-[10px]">
                Inkoop condities
              </p>
              <div className="flex flex-wrap gap-[6px]">
                {CONDITION_DEFS.map(def => (
                  <ConditionPill
                    key={def.key}
                    def={def}
                    value={inkoopConditions[def.key]}
                    onChange={v => setInkoop(def.key, v)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right column — Relatie B (ladingeigenaar) */}
          <div className="w-[50%] flex flex-col min-w-0 overflow-y-auto">
            {/* Column header */}
            <div className="px-[24px] py-[16px] border-b border-rdj-border-secondary bg-rdj-bg-secondary">
              <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary">
                Verkoop &mdash;{" "}
                <span
                  className="text-rdj-text-brand cursor-pointer hover:underline"
                  onClick={() => navigate(`/crm/relatie/${relatieB.id}`)}
                >
                  {relatieB.name}
                </span>
              </p>
              <p className="font-sans font-normal text-[12px] leading-[16px] text-rdj-text-tertiary mt-[2px]">
                Ladingeigenaar
              </p>
            </div>

            {/* Cargo card */}
            <div className="px-[24px] py-[16px]">
              <div className="flex items-start gap-[12px] rounded-[8px] border border-rdj-border-secondary p-[16px] bg-white">
                <div className="flex items-center justify-center size-[36px] rounded-[8px] bg-rdj-bg-secondary shrink-0">
                  <Package className="size-[18px] text-rdj-text-tertiary" />
                </div>
                <div className="flex flex-col gap-[2px] min-w-0">
                  <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary truncate">{cargoName}</p>
                  <p className="font-sans font-normal text-[13px] leading-[18px] text-rdj-text-secondary truncate">{cargoSubtitle}</p>
                </div>
              </div>
            </div>

            {/* Verkoop condities */}
            <div className="px-[24px] pb-[24px]">
              <p className="font-sans font-bold text-[11px] leading-[16px] text-rdj-text-tertiary uppercase tracking-[0.5px] mb-[10px]">
                Verkoop condities
              </p>
              <div className="flex flex-wrap gap-[6px]">
                {CONDITION_DEFS.map(def => (
                  <ConditionPill
                    key={def.key}
                    def={def}
                    value={verkoopConditions[def.key]}
                    onChange={v => setVerkoop(def.key, v)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-rdj-border-secondary px-[32px] py-[16px] flex items-center justify-end gap-[12px] shrink-0">
          <Button variant="secondary" label="Annuleren" onClick={onClose} />
          <Button variant="primary" label="Opslaan" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
