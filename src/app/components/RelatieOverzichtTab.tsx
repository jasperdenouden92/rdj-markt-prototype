import type { Relatie, ContactPersoon, Contract } from "../data/api";
import { mockContracten } from "../data/mock-contract-data";
import { mockRelatieLadingen, mockRelatieVaartuigen, mockMailConversaties } from "../data/mock-relatie-data";
import type { RelatieLading, MailConversatie } from "../data/mock-relatie-data";
import type { RelatieVaartuig } from "../data/mock-relatie-data";

interface RelatieOverzichtTabProps {
  relatie: Relatie;
  contactPersonen: ContactPersoon[];
  onTabChange: (tab: "overzicht" | "ladingen" | "vaartuigen" | "spot" | "contracten" | "mail" | "activiteit") => void;
}

interface SummaryItem {
  icon: "warning" | "ship" | "mail" | "contract" | "info";
  text: string;
}

function dagenGeleden(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function generateAiSummary(
  _relatie: Relatie,
  ctx: {
    activeLadingen: number;
    activeSpot: number;
    activeContracten: number;
    relatieLadingen: RelatieLading[];
    relatieSpot: Contract[];
    relatieContracten: Contract[];
    relatieVaartuigen: RelatieVaartuig[];
    relatieMail: MailConversatie[];
    contactPersonen: ContactPersoon[];
  }
): SummaryItem[] {
  const items: SummaryItem[] = [];

  // Deals die aandacht nodig hebben — concreet benoemen
  for (const deal of [...ctx.relatieSpot, ...ctx.relatieContracten]) {
    if (deal.status === "aandacht_nodig") {
      items.push({ icon: "warning", text: `"${deal.titel}" vraagt aandacht` });
    }
    if (deal.status === "in_onderhandeling") {
      const dagen = dagenGeleden(deal.laatsteUpdate);
      const contact = ctx.contactPersonen.find((cp) => cp.id === deal.contactPersoonId);
      const naam = contact?.naam.split(" ")[0] || "de klant";
      if (dagen > 0) {
        items.push({ icon: "warning", text: `Ons bod op "${deal.titel}" ligt al ${dagen} dagen bij ${naam}` });
      } else {
        items.push({ icon: "ship", text: `"${deal.titel}" is vandaag bijgewerkt — in onderhandeling met ${naam}` });
      }
    }
  }

  // Ladingen met matches op eigen vaartuigen
  const marktLadingen = ctx.relatieLadingen.filter((l) => l.status === "markt");
  for (const lading of marktLadingen) {
    if (lading.matches && lading.matches > 0) {
      items.push({ icon: "ship", text: `"${lading.titel}" staat in de markt met ${lading.matches} match${lading.matches > 1 ? "es" : ""}` });
    }
  }

  // Laatste mail — focus op inhoud, niet op metadata
  if (ctx.relatieMail.length > 0) {
    const sorted = [...ctx.relatieMail].sort((a, b) => new Date(b.laatsteDatum).getTime() - new Date(a.laatsteDatum).getTime());
    const laatste = sorted[0];
    const laatsteBericht = laatste.berichten[laatste.berichten.length - 1];
    const naam = laatsteBericht.van.naam.split(" ")[0];
    const inhoud = extractInsight(laatsteBericht.inhoud);
    items.push({ icon: "mail", text: `In laatste mail gaf ${naam} aan: "${inhoud}"` });
  }

  if (items.length === 0) {
    items.push({ icon: "info", text: "Geen openstaande zaken" });
  }

  return items;
}

function extractInsight(text: string): string {
  const clean = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  // Strip greeting lines
  const stripped = clean
    .replace(/^(Hoi|Beste|Hallo|Dear|Geachte)[^,.]*[,.]\s*/i, "")
    .replace(/^(Bedankt voor[^.]*\.\s*)/i, "");
  // Get first meaningful sentence
  const match = stripped.match(/^.{15,100}[.!?]/);
  if (match) return match[0];
  return stripped.length > 80 ? stripped.slice(0, 80) + "..." : stripped;
}

export default function RelatieOverzichtTab({ relatie, contactPersonen, onTabChange }: RelatieOverzichtTabProps) {
  const relatieSpot = mockContracten.filter((c) => c.relatieId === relatie.id && c.type === "spot");
  const relatieContracten = mockContracten.filter((c) => c.relatieId === relatie.id && c.type === "contract");
  const relatieLadingen = mockRelatieLadingen.filter((l) => l.relatieId === relatie.id);
  const relatieVaartuigen = mockRelatieVaartuigen.filter((v) => v.relatieId === relatie.id);
  const relatieMail = mockMailConversaties.filter((m) => m.relatieId === relatie.id);

  const activeLadingen = relatieLadingen.filter((l) => l.status !== "gesloten").length;
  const activeSpot = relatieSpot.filter((c) => c.status !== "verloren" && c.status !== "gewonnen").length;
  const activeContracten = relatieContracten.filter((c) => c.status !== "verloren").length;

  return (
    <div className="w-full px-[24px] flex flex-col gap-[32px] pb-[32px]">
      {/* AI Summary */}
      <div>
        <div className="flex items-center gap-[8px] mb-[12px]">
          <div className="size-[20px] text-[#1567a4]">
            <svg className="size-full" fill="none" viewBox="0 0 20 20">
              <path d="M10 2L12.09 7.26L18 8.27L13.82 12.14L14.94 18.02L10 15.27L5.06 18.02L6.18 12.14L2 8.27L7.91 7.26L10 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary">AI Samenvatting</p>
        </div>
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[16px] flex flex-col gap-[8px]">
          {generateAiSummary(relatie, { activeLadingen, activeSpot, activeContracten, relatieLadingen, relatieSpot, relatieContracten, relatieVaartuigen, relatieMail, contactPersonen }).map((item, i) => (
            <div key={i} className="flex items-start gap-[8px]">
              <span className="shrink-0 mt-[3px]">
                {item.icon === "warning" ? (
                  <svg className="size-[14px] text-[#dc6803]" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M8 5.5V8.5M8 10.5H8.005" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" /></svg>
                ) : item.icon === "mail" ? (
                  <svg className="size-[14px] text-[#1567a4]" fill="none" viewBox="0 0 16 16"><rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M2.5 4.5L8 8.5L13.5 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
                ) : item.icon === "ship" ? (
                  <svg className="size-[14px] text-[#1567a4]" fill="none" viewBox="0 0 16 16"><path d="M3 10L4.5 6H11.5L13 10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /><path d="M8 3.5V6M6 6V5H10V6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /><path d="M2 12.5C3.5 11.5 5.5 11.5 8 12.5C10.5 11.5 12.5 11.5 14 12.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" /></svg>
                ) : item.icon === "contract" ? (
                  <svg className="size-[14px] text-[#667085]" fill="none" viewBox="0 0 16 16"><rect x="3.5" y="2" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M6 5.5H10M6 8H10M6 10.5H8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" /></svg>
                ) : (
                  <svg className="size-[14px] text-[#667085]" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M8 5.5V8.5M8 10.5H8.005" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" /></svg>
                )}
              </span>
              <p className="font-sans font-normal text-[14px] leading-[20px] text-rdj-text-primary">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Taken (placeholder) */}
      <div>
        <div className="flex items-center justify-between mb-[12px]">
          <div className="flex items-center gap-[8px]">
            <p className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary">Taken</p>
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-full px-[6px] bg-[#f2f4f7] font-sans font-bold text-[12px] leading-[16px] text-rdj-text-secondary">
              0
            </span>
          </div>
          <button className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-brand hover:underline">
            + Taak toevoegen
          </button>
        </div>
        <div className="border border-rdj-border-secondary rounded-[8px] p-[24px] text-center">
          <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
            Nog geen openstaande taken voor deze relatie.
          </p>
        </div>
      </div>

      {/* Contactpersonen */}
      <div>
        <div className="flex items-center justify-between mb-[12px]">
          <div className="flex items-center gap-[8px]">
            <p className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary">Contactpersonen</p>
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-full px-[6px] bg-[#f2f4f7] font-sans font-bold text-[12px] leading-[16px] text-rdj-text-secondary">
              {contactPersonen.length}
            </span>
          </div>
        </div>
        {contactPersonen.length === 0 ? (
          <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">Geen contactpersonen.</p>
        ) : (
          <div className="border border-rdj-border-secondary rounded-[8px] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rdj-border-secondary bg-[#f9fafb]">
                  <th className="text-left px-[12px] py-[8px] font-sans font-bold text-[12px] text-rdj-text-secondary">Naam</th>
                  <th className="text-left px-[12px] py-[8px] font-sans font-bold text-[12px] text-rdj-text-secondary">Functie</th>
                  <th className="text-left px-[12px] py-[8px] font-sans font-bold text-[12px] text-rdj-text-secondary">E-mail</th>
                  <th className="text-left px-[12px] py-[8px] font-sans font-bold text-[12px] text-rdj-text-secondary">Telefoon</th>
                </tr>
              </thead>
              <tbody>
                {contactPersonen.slice(0, 5).map((cp) => (
                  <tr key={cp.id} className="border-b border-rdj-border-secondary last:border-b-0">
                    <td className="px-[12px] py-[10px] font-sans font-bold text-[14px] text-rdj-text-primary">{cp.naam}</td>
                    <td className="px-[12px] py-[10px] font-sans font-normal text-[14px] text-rdj-text-secondary">{cp.functie || "—"}</td>
                    <td className="px-[12px] py-[10px] font-sans font-normal text-[14px] text-rdj-text-brand">{cp.email || "—"}</td>
                    <td className="px-[12px] py-[10px] font-sans font-normal text-[14px] text-rdj-text-primary">{cp.telefoon || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Snelkoppelingen naar tabs */}
      <div>
        <p className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary mb-[12px]">Overzicht</p>
        <div className="grid grid-cols-2 gap-[12px]">
          {[
            { label: "Ladingen", count: relatieLadingen.length, tab: "ladingen" as const },
            { label: "Vaartuigen", count: relatieVaartuigen.length, tab: "vaartuigen" as const },
            { label: "Spot deals", count: relatieSpot.length, tab: "spot" as const },
            { label: "Contracten", count: relatieContracten.length, tab: "contracten" as const },
            { label: "Mail", count: relatieMail.length, tab: "mail" as const },
          ].map((item) => (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className="flex items-center justify-between border border-rdj-border-secondary rounded-[8px] p-[12px] hover:bg-[#f9fafb] transition-colors text-left group"
            >
              <div>
                <p className="font-sans font-bold text-[14px] text-rdj-text-primary group-hover:text-rdj-text-brand">{item.label}</p>
                <p className="font-sans font-normal text-[13px] text-rdj-text-secondary">{item.count} item{item.count !== 1 ? "s" : ""}</p>
              </div>
              <svg className="size-[16px] text-rdj-text-tertiary group-hover:text-rdj-text-brand shrink-0" fill="none" viewBox="0 0 16 16">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
