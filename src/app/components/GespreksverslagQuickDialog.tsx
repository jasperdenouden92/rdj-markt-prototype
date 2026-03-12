import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import type { ContactPersoon } from "../data/api";
import type { Gespreksverslag } from "../data/mock-relatie-data";
import { mockRelatieLadingen, mockRelatieVaartuigen } from "../data/mock-relatie-data";
import type { RelatieLading, RelatieVaartuig } from "../data/mock-relatie-data";
import { mockLadingSoorten } from "../data/mock-contract-data";
import { mockTaken } from "../data/mock-taken-data";
import type { Taak } from "../data/mock-taken-data";

type Tab = "aanbieden" | "ladinguitvraag";
type AanbiedStatus = "aangeboden" | "niet-geinteresseerd" | "geinteresseerd";

interface GespreksverslagQuickDialogProps {
  relatieId: string;
  relatieNaam: string;
  contactPersonen: ContactPersoon[];
  onSave: (verslag: Omit<Gespreksverslag, "id" | "aanmaakDatum">) => void;
  onClose: () => void;
}

interface LadingUitvraagRij {
  id: string;
  tonnage: string;
  ladingType: string;
  van: string;
  naar: string;
  prijs: string;
  condities: string;
  toonCondities: boolean;
}

function getInitials(naam: string): string {
  return naam.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const statusBadge: Record<string, { label: string; cls: string }> = {
  // Bevrachting (aanbieden)
  intake: { label: "Intake", cls: "bg-[#f2f4f7] text-rdj-text-secondary" },
  werklijst: { label: "Werklijst", cls: "bg-[#fffaeb] text-[#b54708]" },
  markt: { label: "Markt", cls: "bg-[#ecfdf3] text-[#067647]" },
  // Ladinguitvraag
  inbox: { label: "Inbox", cls: "bg-[#f2f4f7] text-rdj-text-secondary" },
  pijplijn: { label: "Pijplijn", cls: "bg-[#e3effb] text-[#1567a4]" },
};


function legeUitvraagRij(): LadingUitvraagRij {
  return { id: `lr-${Date.now()}-${Math.random()}`, tonnage: "", ladingType: "", van: "", naar: "", prijs: "", condities: "", toonCondities: false };
}

function formatShortDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function formatRoute(laadhaven: string, laaddatum?: string, loshaven?: string, losdatum?: string): string {
  const laad = laaddatum ? `${laadhaven} (${formatShortDate(laaddatum)})` : laadhaven;
  const los = loshaven ? (losdatum ? `${loshaven} (${formatShortDate(losdatum)})` : loshaven) : "";
  return los ? `${laad} → ${los}` : laad;
}

function formatDeadline(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function GespreksverslagQuickDialog({
  relatieId,
  relatieNaam,
  contactPersonen,
  onSave,
  onClose,
}: GespreksverslagQuickDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>("aanbieden");
  const [contactPersoonId, setContactPersoonId] = useState(contactPersonen[0]?.id || "");
  const [datum, setDatum] = useState(toDatetimeLocal(new Date()));
  const [inhoud, setInhoud] = useState("");
  const [showCpDropdown, setShowCpDropdown] = useState(false);
  const cpRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Aanbieden state
  const [aanbiedStatussen, setAanbiedStatussen] = useState<Record<string, AanbiedStatus>>({});

  // Pre-filled ladinguitvraag state (bekende ladingen van deze relatie)
  const [bekendePrijzen, setBekendePrijzen] = useState<Record<string, string>>({});
  const [bekendeCondities, setBekendeCondities] = useState<Record<string, string>>({});
  const [bekendeToonCondities, setBekendeToonCondities] = useState<Record<string, boolean>>({});

  // Ladinguitvraag state
  const [uitvraagRijen, setUitvraagRijen] = useState<LadingUitvraagRij[]>([legeUitvraagRij()]);

  // Taken state
  const [nieuweTaakTekst, setNieuweTaakTekst] = useState("");
  const [nieuweTaakDeadline, setNieuweTaakDeadline] = useState("");
  const [showTaakForm, setShowTaakForm] = useState(false);
  const [localTaken, setLocalTaken] = useState<Taak[]>(() =>
    mockTaken.filter((t) => t.relatieId === relatieId && t.status === "open")
  );

  const selectedCp = contactPersonen.find((cp) => cp.id === contactPersoonId);

  // Aanbieden: ladingen/vaartuigen op bevrachting (intake, werklijst, markt)
  const bevrachtingLadingen = mockRelatieLadingen.filter(
    (l) => l.status === "intake" || l.status === "werklijst" || l.status === "markt"
  );
  const bevrachtingVaartuigen = mockRelatieVaartuigen.filter(
    (v) => v.status === "intake" || v.status === "werklijst" || v.status === "markt"
  );

  // Ladinguitvraag: bekende ladingen van deze relatie (inbox, pijplijn)
  const bekendeLadingen = mockRelatieLadingen.filter(
    (l) => l.relatieId === relatieId && (l.status === "inbox" || l.status === "pijplijn")
  );

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showCpDropdown) return;
    function handleClick(e: MouseEvent) {
      if (cpRef.current && !cpRef.current.contains(e.target as Node)) {
        setShowCpDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showCpDropdown]);

  // Build inhoud from all tabs
  const buildInhoud = () => {
    const parts: string[] = [];
    if (inhoud.trim()) parts.push(inhoud.trim());

    const aangeboden = Object.entries(aanbiedStatussen);
    if (aangeboden.length > 0) {
      parts.push("--- Aangeboden ---");
      for (const [itemId, status] of aangeboden) {
        const lading = bevrachtingLadingen.find((l) => l.id === itemId);
        const vaartuig = bevrachtingVaartuigen.find((v) => v.id === itemId);
        const label = lading ? `${lading.product} ${lading.tonnage} (${lading.laadhaven} → ${lading.loshaven})` : vaartuig ? `${vaartuig.naam} (${vaartuig.capaciteit})` : itemId;
        const statusLabel = status === "aangeboden" ? "Aangeboden" : status === "niet-geinteresseerd" ? "Niet geïnteresseerd" : "Geïnteresseerd + bod";
        parts.push(`• ${label}: ${statusLabel}`);
      }
    }

    // Bekende ladingen met prijs/condities
    const bekendeMetPrijs = bekendeLadingen.filter((l) => bekendePrijzen[l.id] || bekendeCondities[l.id]);
    const ingevuldeRijen = uitvraagRijen.filter((r) => r.tonnage || r.ladingType || r.van || r.naar);
    if (bekendeMetPrijs.length > 0 || ingevuldeRijen.length > 0) {
      parts.push("--- Ladinguitvraag ---");
      for (const l of bekendeMetPrijs) {
        const details = `${l.product} ${l.tonnage} (${l.laadhaven} → ${l.loshaven})`;
        const extra = [bekendePrijzen[l.id] && `€${bekendePrijzen[l.id]}`, bekendeCondities[l.id]].filter(Boolean).join(", ");
        parts.push(`• ${details}: ${extra}`);
      }
      for (const r of ingevuldeRijen) {
        const details = [r.tonnage, r.ladingType, r.van && `van ${r.van}`, r.naar && `naar ${r.naar}`, r.prijs && `€${r.prijs}`].filter(Boolean).join(", ");
        parts.push(`• ${details}${r.condities ? ` (${r.condities})` : ""}`);
      }
    }

    return parts.join("\n");
  };

  const canSubmit = contactPersoonId && (inhoud.trim() || Object.keys(aanbiedStatussen).length > 0 || uitvraagRijen.some((r) => r.tonnage || r.ladingType) || bekendeLadingen.some((l) => bekendePrijzen[l.id] || bekendeCondities[l.id]));

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSave({
      relatieId,
      contactPersoonId,
      gebruikerId: "usr-001",
      datum,
      inhoud: buildInhoud(),
    });
    onClose();
  };

  const setAanbiedStatus = (itemId: string, status: AanbiedStatus) => {
    setAanbiedStatussen((prev) => {
      if (prev[itemId] === status) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: status };
    });
  };

  const updateUitvraagRij = (id: string, field: keyof LadingUitvraagRij, value: string | boolean) => {
    setUitvraagRijen((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const addUitvraagRij = () => {
    setUitvraagRijen((prev) => [...prev, legeUitvraagRij()]);
  };

  const removeUitvraagRij = (id: string) => {
    setUitvraagRijen((prev) => prev.length > 1 ? prev.filter((r) => r.id !== id) : prev);
  };

  const handleAddTaak = () => {
    if (!nieuweTaakTekst.trim()) return;
    const newTaak: Taak = {
      id: `taak-${Date.now()}`,
      omschrijving: nieuweTaakTekst.trim(),
      deadline: nieuweTaakDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: "open",
      type: "handmatig",
      relatieId,
      eigenaarId: "usr-001",
      aanmaakDatum: new Date().toISOString().slice(0, 10),
    };
    mockTaken.push(newTaak);
    setLocalTaken((prev) => [...prev, newTaak]);
    setNieuweTaakTekst("");
    setNieuweTaakDeadline("");
    setShowTaakForm(false);
  };

  const handleToggleTaak = (taakId: string) => {
    const taak = mockTaken.find((t) => t.id === taakId);
    if (taak) {
      taak.status = taak.status === "open" ? "voltooid" : "open";
      taak.voltooiDatum = taak.status === "voltooid" ? new Date().toISOString().slice(0, 10) : undefined;
    }
    setLocalTaken((prev) => prev.map((t) => t.id === taakId ? { ...t, status: t.status === "open" ? "voltooid" : "open" } : t));
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "aanbieden", label: "Aanbieden" },
    { key: "ladinguitvraag", label: "Ladinguitvraag" },
  ];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[1200px] p-0 gap-0 overflow-visible h-[85vh] flex flex-col">
        <DialogHeader className="px-[20px] pt-[20px] pb-0 shrink-0">
          <DialogTitle className="font-sans font-bold text-[16px] text-rdj-text-primary">
            Gespreksverslag — {relatieNaam}
          </DialogTitle>
        </DialogHeader>

        {/* Two-column layout */}
        <div className="flex-1 flex min-h-0 overflow-hidden border-t border-rdj-border-secondary mt-[12px]">
          {/* Left column: CP + datum, Notities, Taken */}
          <div className="w-[400px] shrink-0 border-r border-rdj-border-secondary flex flex-col overflow-y-auto">
            {/* Contactpersoon + datum */}
            <div className="px-[20px] pt-[14px] pb-[10px] flex items-center gap-[10px]">
              <div className="relative" ref={cpRef}>
                <button
                  onClick={() => setShowCpDropdown(!showCpDropdown)}
                  className="flex items-center gap-[8px] px-[10px] py-[6px] rounded-[6px] border border-rdj-border-primary hover:border-[#98a2b3] transition-colors bg-white"
                >
                  <div className="size-[24px] rounded-full bg-[#f2f4f7] flex items-center justify-center">
                    <span className="font-sans font-bold text-[9px] text-rdj-text-secondary">
                      {selectedCp ? getInitials(selectedCp.naam) : "?"}
                    </span>
                  </div>
                  <span className="font-sans font-bold text-[13px] text-rdj-text-primary">
                    {selectedCp?.naam || "Kies contactpersoon"}
                  </span>
                  <svg className="size-[12px] text-rdj-text-tertiary" fill="none" viewBox="0 0 12 12">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </button>
                {showCpDropdown && (
                  <div className="absolute top-full left-0 mt-[4px] z-50 bg-white border border-rdj-border-secondary rounded-[8px] shadow-lg py-[4px] min-w-[220px]">
                    {contactPersonen.map((cp) => (
                      <button
                        key={cp.id}
                        onClick={() => { setContactPersoonId(cp.id); setShowCpDropdown(false); }}
                        className={`w-full text-left px-[12px] py-[8px] hover:bg-[#f9fafb] transition-colors flex items-center gap-[8px] ${cp.id === contactPersoonId ? "bg-[#f0f7ff]" : ""}`}
                      >
                        <div className="size-[24px] rounded-full bg-[#f2f4f7] flex items-center justify-center">
                          <span className="font-sans font-bold text-[9px] text-rdj-text-secondary">{getInitials(cp.naam)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-sans font-bold text-[13px] text-rdj-text-primary truncate">{cp.naam}</p>
                          {cp.functie && <p className="font-sans font-normal text-[11px] text-rdj-text-tertiary">{cp.functie}</p>}
                        </div>
                      </button>
                    ))}
                    {contactPersonen.length === 0 && (
                      <p className="px-[12px] py-[8px] font-sans font-normal text-[13px] text-rdj-text-tertiary">
                        Geen contactpersonen
                      </p>
                    )}
                  </div>
                )}
              </div>

              <input
                type="datetime-local"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="font-sans font-normal text-[13px] text-rdj-text-secondary border border-rdj-border-primary rounded-[6px] px-[10px] py-[6px] bg-white"
              />
            </div>

            {/* Notities */}
            <div className="px-[20px] pb-[10px]">
              <p className="font-sans font-bold text-[12px] text-rdj-text-secondary uppercase tracking-wide mb-[8px]">
                Notities
              </p>
              <textarea
                ref={textareaRef}
                value={inhoud}
                onChange={(e) => setInhoud(e.target.value)}
                placeholder="Notities..."
                rows={4}
                className="w-full font-sans font-normal text-[14px] leading-[22px] text-rdj-text-primary placeholder:text-rdj-text-tertiary border border-rdj-border-primary rounded-[8px] px-[12px] py-[10px] outline-none focus:border-[#1567a4] focus:ring-1 focus:ring-[#1567a4] resize-none"
              />
            </div>

            {/* Taken */}
            <div className="px-[20px] pb-[16px] flex-1">
              <p className="font-sans font-bold text-[12px] text-rdj-text-secondary uppercase tracking-wide mb-[8px]">
                Taken
                {localTaken.filter((t) => t.status === "open").length > 0 && (
                  <span className="ml-[6px] inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-[4px] font-sans font-bold text-[11px] bg-[#e3effb] text-[#1567a4]">
                    {localTaken.filter((t) => t.status === "open").length}
                  </span>
                )}
              </p>

              {/* Takenlijst */}
              <div className="flex flex-col gap-[4px] mb-[10px]">
                {localTaken.length === 0 && (
                  <p className="py-[12px] font-sans font-normal text-[13px] text-rdj-text-tertiary">
                    Geen open taken voor deze relatie.
                  </p>
                )}
                {localTaken.map((taak) => (
                  <div
                    key={taak.id}
                    className={`flex items-start gap-[8px] px-[8px] py-[6px] rounded-[6px] hover:bg-[#f9fafb] transition-colors ${taak.status === "voltooid" ? "opacity-50" : ""}`}
                  >
                    <button
                      onClick={() => handleToggleTaak(taak.id)}
                      className={`size-[18px] shrink-0 mt-[1px] rounded-[4px] border flex items-center justify-center transition-colors ${
                        taak.status === "voltooid"
                          ? "bg-[#1567a4] border-[#1567a4] text-white"
                          : "border-rdj-border-primary hover:border-[#98a2b3]"
                      }`}
                    >
                      {taak.status === "voltooid" && (
                        <svg className="size-[12px]" fill="none" viewBox="0 0 12 12">
                          <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-sans font-normal text-[13px] leading-[18px] text-rdj-text-primary ${taak.status === "voltooid" ? "line-through" : ""}`}>
                        {taak.omschrijving}
                      </p>
                      <p className={`font-sans font-normal text-[11px] mt-[2px] ${isOverdue(taak.deadline) && taak.status === "open" ? "text-[#d92d20]" : "text-rdj-text-tertiary"}`}>
                        {formatDeadline(taak.deadline)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Nieuwe taak toevoegen */}
              {!showTaakForm ? (
                <button
                  onClick={() => setShowTaakForm(true)}
                  className="flex items-center gap-[6px] px-[8px] py-[6px] rounded-[6px] border border-dashed border-rdj-border-primary hover:border-[#1567a4] hover:bg-[#f9fafb] transition-colors"
                >
                  <svg className="size-[14px] text-[#145990]" fill="none" viewBox="0 0 14 14">
                    <path d="M7 3V11M3 7H11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                  <span className="font-sans font-bold text-[13px] text-[#145990]">Taak toevoegen</span>
                </button>
              ) : (
                <div className="border border-rdj-border-secondary rounded-[8px] p-[10px] bg-[#f9fafb]">
                  <input
                    type="text"
                    value={nieuweTaakTekst}
                    onChange={(e) => setNieuweTaakTekst(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddTaak(); }}
                    placeholder="Omschrijving taak..."
                    autoFocus
                    className="w-full font-sans font-normal text-[13px] text-rdj-text-primary placeholder:text-rdj-text-tertiary border border-rdj-border-primary rounded-[6px] px-[8px] py-[6px] outline-none focus:border-[#1567a4] focus:ring-1 focus:ring-[#1567a4] bg-white"
                  />
                  <div className="flex items-center gap-[6px] mt-[6px]">
                    <input
                      type="date"
                      value={nieuweTaakDeadline}
                      onChange={(e) => setNieuweTaakDeadline(e.target.value)}
                      className="font-sans font-normal text-[12px] text-rdj-text-secondary border border-rdj-border-primary rounded-[6px] px-[6px] py-[4px] bg-white"
                    />
                    <div className="flex-1" />
                    <button
                      onClick={() => { setShowTaakForm(false); setNieuweTaakTekst(""); setNieuweTaakDeadline(""); }}
                      className="px-[10px] py-[4px] rounded-[6px] font-sans font-bold text-[12px] text-rdj-text-secondary hover:bg-[#f2f4f7] transition-colors"
                    >
                      Annuleren
                    </button>
                    <button
                      onClick={handleAddTaak}
                      disabled={!nieuweTaakTekst.trim()}
                      className={`px-[10px] py-[4px] rounded-[6px] font-sans font-bold text-[12px] transition-colors ${
                        nieuweTaakTekst.trim()
                          ? "bg-[#1567a4] text-white hover:bg-[#125a8f]"
                          : "bg-[#e2e8f0] text-rdj-text-tertiary cursor-not-allowed"
                      }`}
                    >
                      Toevoegen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Aanbieden / Ladinguitvraag tabs */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-rdj-border-secondary px-[20px] shrink-0">
              <div className="flex gap-[16px]">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`py-[10px] px-[2px] font-sans font-bold text-[13px] leading-[18px] transition-colors ${
                      activeTab === t.key
                        ? "text-rdj-text-brand border-b-2 border-[#1567a4]"
                        : "text-rdj-text-tertiary hover:text-rdj-text-secondary"
                    }`}
                  >
                    {t.label}
                    {t.key === "aanbieden" && Object.keys(aanbiedStatussen).length > 0 && (
                      <span className="ml-[6px] inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-[4px] font-sans font-bold text-[11px] bg-[#e3effb] text-[#1567a4]">
                        {Object.keys(aanbiedStatussen).length}
                      </span>
                    )}
                    {t.key === "ladinguitvraag" && uitvraagRijen.some((r) => r.tonnage || r.ladingType) && (
                      <span className="ml-[6px] inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-[4px] font-sans font-bold text-[11px] bg-[#e3effb] text-[#1567a4]">
                        {uitvraagRijen.filter((r) => r.tonnage || r.ladingType).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "aanbieden" && (
                <div className="px-[20px] py-[12px]">
                  {/* Ladingen */}
                  {bevrachtingLadingen.length > 0 && (
                    <div className="mb-[16px]">
                      <p className="font-sans font-bold text-[12px] text-rdj-text-secondary uppercase tracking-wide mb-[8px]">
                        Ladingen
                      </p>
                      <div className="flex flex-col gap-[4px]">
                        {bevrachtingLadingen.map((lading) => {
                          const currentStatus = aanbiedStatussen[lading.id];
                          const badge = statusBadge[lading.status];
                          return (
                            <AanbiedRij
                              key={lading.id}
                              id={lading.id}
                              label={`${lading.exNaam || lading.titel} · ${lading.tonnage} ${lading.product}`}
                              route={formatRoute(lading.laadhaven, lading.laaddatum, lading.loshaven, lading.losdatum)}
                              badge={badge}
                              currentStatus={currentStatus}
                              onSetStatus={setAanbiedStatus}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Vaartuigen */}
                  {bevrachtingVaartuigen.length > 0 && (
                    <div>
                      <p className="font-sans font-bold text-[12px] text-rdj-text-secondary uppercase tracking-wide mb-[8px]">
                        Vaartuigen
                      </p>
                      <div className="flex flex-col gap-[4px]">
                        {bevrachtingVaartuigen.map((vaartuig) => {
                          const currentStatus = aanbiedStatussen[vaartuig.id];
                          const badge = statusBadge[vaartuig.status];
                          return (
                            <AanbiedRij
                              key={vaartuig.id}
                              id={vaartuig.id}
                              label={`${vaartuig.naam} · ${vaartuig.capaciteit}`}
                              route={`${vaartuig.locatie} (${formatShortDate(vaartuig.beschikbaarVanaf)})`}
                              badge={badge}
                              currentStatus={currentStatus}
                              onSetStatus={setAanbiedStatus}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {bevrachtingLadingen.length === 0 && bevrachtingVaartuigen.length === 0 && (
                    <p className="py-[32px] text-center font-sans font-normal text-[14px] text-rdj-text-tertiary">
                      Geen ladingen of vaartuigen op bevrachting.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "ladinguitvraag" && (
                <div className="px-[20px] py-[12px]">
                  {/* Bekende ladingen van deze relatie */}
                  {bekendeLadingen.length > 0 && (
                    <div className="mb-[16px]">
                      <p className="font-sans font-bold text-[12px] text-rdj-text-secondary uppercase tracking-wide mb-[8px]">
                        Bekende ladingen
                      </p>
                      <div className="flex flex-col gap-[4px]">
                        {bekendeLadingen.map((lading) => {
                          const badge = statusBadge[lading.status];
                          const toonCond = bekendeToonCondities[lading.id] || false;
                          return (
                            <div key={lading.id} className="rounded-[8px] hover:bg-[#f9fafb] transition-colors">
                              <div className="flex items-center gap-[10px] px-[10px] py-[6px]">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-[6px]">
                                    <p className="font-sans font-bold text-[13px] text-rdj-text-primary truncate">{lading.product}</p>
                                    {(lading.prioriteit ?? 0) > 0 && (
                                      <span className="shrink-0 flex items-center gap-[1px]">
                                        {Array.from({ length: lading.prioriteit ?? 0 }).map((_, i) => (
                                          <svg key={i} className="size-[12px] text-[#FDB022]" viewBox="0 0 12 12" fill="currentColor">
                                            <path d="M6 1l1.545 3.13L11 4.635 8.5 7.07l.59 3.44L6 8.885 2.91 10.51l.59-3.44L1 4.635l3.455-.505L6 1z" />
                                          </svg>
                                        ))}
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-sans font-normal text-[12px] text-rdj-text-secondary truncate">
                                    {lading.tonnage} · {lading.laadhaven} → {lading.loshaven}
                                  </p>
                                </div>
                                {badge && (
                                  <span className={`shrink-0 inline-flex items-center rounded-[4px] px-[5px] py-[1px] font-sans font-bold text-[11px] ${badge.cls}`}>
                                    {badge.label}
                                  </span>
                                )}
                                <input
                                  type="text"
                                  value={bekendePrijzen[lading.id] || ""}
                                  onChange={(e) => setBekendePrijzen((prev) => ({ ...prev, [lading.id]: e.target.value }))}
                                  placeholder="€/ton"
                                  className="w-[80px] shrink-0 font-sans font-normal text-[13px] text-rdj-text-primary placeholder:text-rdj-text-tertiary border border-rdj-border-primary rounded-[6px] px-[8px] py-[5px] outline-none focus:border-[#1567a4] focus:ring-1 focus:ring-[#1567a4]"
                                />
                                <button
                                  onClick={() => setBekendeToonCondities((prev) => ({ ...prev, [lading.id]: !prev[lading.id] }))}
                                  className={`size-[28px] shrink-0 rounded-[6px] flex items-center justify-center transition-colors ${toonCond ? "bg-[#e3effb] text-[#1567a4]" : "hover:bg-[#f2f4f7] text-rdj-text-tertiary"}`}
                                  title="Condities"
                                >
                                  <svg className="size-[14px]" fill="none" viewBox="0 0 14 14">
                                    <path d="M2 4H12M2 7H12M2 10H12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
                                    <circle cx="5" cy="4" r="1.2" fill="currentColor" />
                                    <circle cx="9" cy="7" r="1.2" fill="currentColor" />
                                    <circle cx="6" cy="10" r="1.2" fill="currentColor" />
                                  </svg>
                                </button>
                              </div>
                              {toonCond && (
                                <div className="px-[10px] pb-[6px]">
                                  <input
                                    type="text"
                                    value={bekendeCondities[lading.id] || ""}
                                    onChange={(e) => setBekendeCondities((prev) => ({ ...prev, [lading.id]: e.target.value }))}
                                    placeholder="Extra condities (bijv. laadtijd, liggeld, bijzonderheden...)"
                                    className="w-full font-sans font-normal text-[13px] text-rdj-text-primary placeholder:text-rdj-text-tertiary border border-rdj-border-primary rounded-[6px] px-[8px] py-[5px] outline-none focus:border-[#1567a4] focus:ring-1 focus:ring-[#1567a4]"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Nieuwe ladingen */}
                  {bekendeLadingen.length > 0 && (
                    <p className="font-sans font-bold text-[12px] text-rdj-text-secondary uppercase tracking-wide mb-[8px]">
                      Nieuwe ladingen
                    </p>
                  )}
                  <div className="flex flex-col gap-[8px]">
                    {/* Header */}
                    <div className="flex items-center gap-[8px] px-[4px]">
                      <span className="font-sans font-bold text-[11px] text-rdj-text-tertiary uppercase w-[80px]">Tonnage</span>
                      <span className="font-sans font-bold text-[11px] text-rdj-text-tertiary uppercase w-[110px]">Type</span>
                      <span className="font-sans font-bold text-[11px] text-rdj-text-tertiary uppercase flex-1">Van</span>
                      <span className="font-sans font-bold text-[11px] text-rdj-text-tertiary uppercase flex-1">Naar</span>
                      <span className="font-sans font-bold text-[11px] text-rdj-text-tertiary uppercase w-[80px]">Prijs</span>
                      <span className="w-[56px]" />
                    </div>

                    {uitvraagRijen.map((rij) => (
                      <div key={rij.id}>
                        <div className="flex items-center gap-[8px]">
                          <input
                            type="text"
                            value={rij.tonnage}
                            onChange={(e) => updateUitvraagRij(rij.id, "tonnage", e.target.value)}
                            placeholder="2.000 t"
                            className="w-[80px] font-sans font-normal text-[13px] text-rdj-text-primary placeholder:text-rdj-text-tertiary border border-rdj-border-primary rounded-[6px] px-[8px] py-[6px] outline-none focus:border-[#1567a4] focus:ring-1 focus:ring-[#1567a4]"
                          />
                          <select
                            value={rij.ladingType}
                            onChange={(e) => updateUitvraagRij(rij.id, "ladingType", e.target.value)}
                            className="w-[110px] font-sans font-normal text-[13px] text-rdj-text-primary border border-rdj-border-primary rounded-[6px] px-[8px] py-[6px] outline-none focus:border-[#1567a4] focus:ring-1 focus:ring-[#1567a4] bg-white appearance-none"
                          >
                            <option value="">Type...</option>
                            {mockLadingSoorten.map((s) => (
                              <option key={s.id} value={s.naam}>{s.naam}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={rij.van}
                            onChange={(e) => updateUitvraagRij(rij.id, "van", e.target.value)}
                            placeholder="Laadhaven"
                            className="flex-1 min-w-0 font-sans font-normal text-[13px] text-rdj-text-primary placeholder:text-rdj-text-tertiary border border-rdj-border-primary rounded-[6px] px-[8px] py-[6px] outline-none focus:border-[#1567a4] focus:ring-1 focus:ring-[#1567a4]"
                          />
                          <input
                            type="text"
                            value={rij.naar}
                            onChange={(e) => updateUitvraagRij(rij.id, "naar", e.target.value)}
                            placeholder="Loshaven"
                            className="flex-1 min-w-0 font-sans font-normal text-[13px] text-rdj-text-primary placeholder:text-rdj-text-tertiary border border-rdj-border-primary rounded-[6px] px-[8px] py-[6px] outline-none focus:border-[#1567a4] focus:ring-1 focus:ring-[#1567a4]"
                          />
                          <input
                            type="text"
                            value={rij.prijs}
                            onChange={(e) => updateUitvraagRij(rij.id, "prijs", e.target.value)}
                            placeholder="€/ton"
                            className="w-[80px] font-sans font-normal text-[13px] text-rdj-text-primary placeholder:text-rdj-text-tertiary border border-rdj-border-primary rounded-[6px] px-[8px] py-[6px] outline-none focus:border-[#1567a4] focus:ring-1 focus:ring-[#1567a4]"
                          />
                          <div className="flex items-center gap-[4px] w-[56px]">
                            <button
                              onClick={() => updateUitvraagRij(rij.id, "toonCondities", !rij.toonCondities)}
                              className={`size-[28px] rounded-[6px] flex items-center justify-center transition-colors ${rij.toonCondities ? "bg-[#e3effb] text-[#1567a4]" : "hover:bg-[#f2f4f7] text-rdj-text-tertiary"}`}
                              title="Condities"
                            >
                              <svg className="size-[14px]" fill="none" viewBox="0 0 14 14">
                                <path d="M2 4H12M2 7H12M2 10H12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
                                <circle cx="5" cy="4" r="1.2" fill="currentColor" />
                                <circle cx="9" cy="7" r="1.2" fill="currentColor" />
                                <circle cx="6" cy="10" r="1.2" fill="currentColor" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeUitvraagRij(rij.id)}
                              className="size-[28px] rounded-[6px] flex items-center justify-center hover:bg-[#fef3f2] text-rdj-text-tertiary hover:text-[#d92d20] transition-colors"
                              title="Verwijderen"
                            >
                              <svg className="size-[14px]" fill="none" viewBox="0 0 14 14">
                                <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {rij.toonCondities && (
                          <div className="mt-[6px] ml-[4px]">
                            <input
                              type="text"
                              value={rij.condities}
                              onChange={(e) => updateUitvraagRij(rij.id, "condities", e.target.value)}
                              placeholder="Extra condities (bijv. laadtijd, liggeld, bijzonderheden...)"
                              className="w-full font-sans font-normal text-[13px] text-rdj-text-primary placeholder:text-rdj-text-tertiary border border-rdj-border-primary rounded-[6px] px-[8px] py-[6px] outline-none focus:border-[#1567a4] focus:ring-1 focus:ring-[#1567a4]"
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={addUitvraagRij}
                      className="flex items-center gap-[6px] px-[8px] py-[6px] rounded-[6px] border border-dashed border-rdj-border-primary hover:border-[#1567a4] hover:bg-[#f9fafb] transition-colors self-start"
                    >
                      <svg className="size-[14px] text-[#145990]" fill="none" viewBox="0 0 14 14">
                        <path d="M7 3V11M3 7H11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                      <span className="font-sans font-bold text-[13px] text-[#145990]">Rij toevoegen</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acties */}
        <div className="px-[20px] py-[12px] border-t border-rdj-border-secondary flex items-center justify-end gap-[8px] shrink-0">
          <button
            onClick={onClose}
            className="px-[12px] py-[6px] rounded-[6px] font-sans font-bold text-[13px] text-rdj-text-secondary hover:bg-[#f2f4f7] transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-[12px] py-[6px] rounded-[6px] font-sans font-bold text-[13px] transition-colors ${
              canSubmit
                ? "bg-[#1567a4] text-white hover:bg-[#125a8f]"
                : "bg-[#e2e8f0] text-rdj-text-tertiary cursor-not-allowed"
            }`}
          >
            Opslaan
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────
   Aanbied-rij component
   ───────────────────────────────────────────── */

function AanbiedRij({
  id,
  label,
  route,
  badge,
  currentStatus,
  onSetStatus,
}: {
  id: string;
  label: string;
  route: string;
  badge: { label: string; cls: string };
  currentStatus?: AanbiedStatus;
  onSetStatus: (id: string, status: AanbiedStatus) => void;
}) {

  const actionButtons: { status: AanbiedStatus; title: string; activeCls: string; inactiveCls: string; icon: React.ReactNode }[] = [
    {
      status: "aangeboden",
      title: "Aangeboden",
      activeCls: "bg-[#e3effb] text-[#1567a4] border-[#1567a4]",
      inactiveCls: "border-rdj-border-primary text-rdj-text-tertiary hover:border-[#98a2b3] hover:text-rdj-text-secondary",
      icon: (
        <svg className="size-[14px]" fill="none" viewBox="0 0 14 14">
          <rect x="1.5" y="3" width="11" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <path d="M1.5 4L7 8L12.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      status: "niet-geinteresseerd",
      title: "Niet geïnteresseerd",
      activeCls: "bg-[#fef3f2] text-[#d92d20] border-[#d92d20]",
      inactiveCls: "border-rdj-border-primary text-rdj-text-tertiary hover:border-[#98a2b3] hover:text-rdj-text-secondary",
      icon: (
        <svg className="size-[14px]" fill="none" viewBox="0 0 14 14">
          <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      status: "geinteresseerd",
      title: "Geïnteresseerd / bod",
      activeCls: "bg-[#ecfdf3] text-[#067647] border-[#067647]",
      inactiveCls: "border-rdj-border-primary text-rdj-text-tertiary hover:border-[#98a2b3] hover:text-rdj-text-secondary",
      icon: (
        <svg className="size-[14px]" fill="none" viewBox="0 0 14 14">
          <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`flex items-center gap-[8px] px-[10px] py-[5px] rounded-[6px] transition-colors ${currentStatus ? "bg-[#f9fafb]" : "hover:bg-[#f9fafb]"}`}>
      <p className="font-sans font-bold text-[13px] text-rdj-text-primary truncate shrink-0">{label}</p>
      <span className="font-sans font-normal text-[12px] text-rdj-text-secondary truncate">{route}</span>
      <div className="flex-1" />
      {badge && (
        <span className={`shrink-0 inline-flex items-center rounded-[4px] px-[5px] py-[1px] font-sans font-bold text-[11px] ${badge.cls}`}>
          {badge.label}
        </span>
      )}
      <div className="flex items-center gap-[4px] shrink-0">
        {actionButtons.map((btn) => (
          <button
            key={btn.status}
            onClick={(e) => { e.stopPropagation(); onSetStatus(id, btn.status); }}
            title={btn.title}
            className={`size-[28px] rounded-[6px] border flex items-center justify-center transition-colors ${
              currentStatus === btn.status ? btn.activeCls : btn.inactiveCls
            }`}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
