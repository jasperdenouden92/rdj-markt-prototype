import { useState } from "react";
import { X, Check, ArrowRight, Send, MailOpen } from "lucide-react";
import ModelessPanel from "./ModelessPanel";
import { DetailsSidebarSection } from "./DetailsSidebar";
import DetailRow from "./DetailRow";
import Button from "./Button";
import Badge, { type BadgeVariant, type BadgeType } from "./Badge";

/**
 * OnderhandelingSidepanel — modeless panel for a negotiation with 4 tabs:
 * Condities, Vaartuig, Lading, Activiteit.
 *
 * Condities shows all three variants: Inkoop, Verkoop, Zoekcriteria.
 */

type ConditiesField = "prijs" | "laadtijd" | "liggeldLaden" | "lostijd" | "liggeldLossen";

const fieldLabels: Record<ConditiesField, string> = {
  prijs: "Prijs",
  laadtijd: "Laadtijd",
  liggeldLaden: "Liggeld laden",
  lostijd: "Lostijd",
  liggeldLossen: "Liggeld lossen",
};

/* ── Mock condities data ── */
const mockCondities: Record<ConditiesField, { inkoop: number | null; verkoop: number | null; zoekcriteria: number | null }> = {
  prijs: { inkoop: 8.50, verkoop: 7.20, zoekcriteria: 8.00 },
  laadtijd: { inkoop: 24, verkoop: 18, zoekcriteria: 20 },
  liggeldLaden: { inkoop: 12.50, verkoop: 10.00, zoekcriteria: 11.00 },
  lostijd: { inkoop: 16, verkoop: 14, zoekcriteria: 16 },
  liggeldLossen: { inkoop: 15.00, verkoop: 12.00, zoekcriteria: 13.50 },
};

/* ── Mock vaartuig data ── */
const mockVaartuig = {
  beschikbaarVanaf: "12 jan 2026, 08:00",
  huidigeLocatie: "Rotterdam",
  eni: "02333517",
  vlag: "NL",
  meetbrief: "S2-3284",
  groottonnage: "2.850 t",
  inhoud: "2.200 m³",
  lengte: "110,00 m",
  breedte: "11,45 m",
  diepgang: "3,20 m",
  kruiphoogte: "7,50 m",
  bijzonderheden: ["Dubbelwandig", "Verwarmd"],
  relatie: "Rederij Alfa",
  relatieId: "rel-1",
  contactpersoon: "Jan de Vries",
  eigenaar: "Khoa Nguyen",
  eigenaarInitials: "KN",
};

/* ── Mock lading data ── */
const mockLading = {
  partij: "Eur-01",
  subpartij: "SP-001",
  tonnage: "1.200 t",
  ex: "Ex Eur-01",
  exType: "Partij",
  lading: "Grind",
  subsoort: "Riviergrind",
  soortelijkGewicht: "1,65 t/m³",
  inhoud: "727 m³",
  bijzonderheden: ["Stofvrij"],
  laadhaven: "Rotterdam Waalhaven",
  laaddatum: "15 jan 2026, 08:00",
  loshaven: "Antwerpen",
  losdatum: "16 jan 2026, 14:00",
  relatie: "Rederij de Jong",
  relatieId: "rel-2",
  contactpersoon: "Pieter Jansen",
  eigenaar: "Erick Nieuwkoop",
  eigenaarInitials: "EN",
  deadline: "17 jan 2026",
};

/* ── Mock activiteit data (alleen wijzigingen) ── */
const mockActiviteit = [
  {
    id: "1",
    user: "Khoa Nguyen",
    initials: "KN",
    action: 'heeft de vrachtprijs gewijzigd naar "€8,50 per ton"',
    timestamp: "Vandaag, 14:22",
  },
  {
    id: "2",
    user: "Erick Nieuwkoop",
    initials: "EN",
    action: "heeft de laaddatum gewijzigd naar \"15 jan 2026, 08:00\"",
    timestamp: "Vandaag, 09:15",
  },
  {
    id: "3",
    user: "Khoa Nguyen",
    initials: "KN",
    action: 'heeft de loshaven gewijzigd naar "Antwerpen"',
    timestamp: "Gisteren, 16:32",
    detail: "Was: Rotterdam Europoort",
  },
  {
    id: "4",
    user: "Michiel den Hond",
    initials: "MH",
    action: "heeft het bod bijgewerkt",
    timestamp: "Ma 20 Jan, 11:04",
    detail: "Tonnage aangepast van 1.000 t naar 1.200 t",
  },
  {
    id: "5",
    user: "Erick Nieuwkoop",
    initials: "EN",
    action: "heeft de onderhandeling gestart",
    timestamp: "Vr 17 Jan, 08:47",
  },
];

/* ── Helpers ── */
function fmtPrice(n: number | null): string {
  if (n == null) return "—";
  return `€${n.toFixed(2).replace(".", ",")} per ton`;
}
function fmtHours(n: number | null): string {
  if (n == null) return "—";
  return `${n} uur`;
}
function fmtCurrency(n: number | null): string {
  if (n == null || n === 0) return "—";
  return `€${n.toFixed(2).replace(".", ",")} per uur`;
}
function fmt(field: ConditiesField, n: number | null): string {
  if (field === "prijs") return fmtPrice(n);
  if (field === "laadtijd" || field === "lostijd") return fmtHours(n);
  return fmtCurrency(n);
}
function calcPctDiff(
  a: number | null | undefined,
  b: number | null | undefined,
): { text: string; color: string } | undefined {
  if (a == null || b == null || b === 0) return undefined;
  const pct = ((a - b) / Math.abs(b)) * 100;
  const rounded = Math.round(pct);
  if (rounded === 0) return undefined;
  const sign = rounded > 0 ? "+" : "";
  return {
    text: `${sign}${rounded}%`,
    color: rounded > 0 ? "#F79009" : "",
  };
}

type Tab = "condities" | "vaartuig" | "lading" | "activiteit";

type NegotiationStatus = "Via werklijst" | "Bod verstuurd" | "Bod ontvangen" | "Goedgekeurd" | "Afgewezen";

const activeStatuses: NegotiationStatus[] = ["Via werklijst", "Bod verstuurd", "Bod ontvangen"];

const statusBadgeConfig: Record<NegotiationStatus, { variant: BadgeVariant; type: BadgeType; icon: React.ReactNode | null }> = {
  "Via werklijst": { variant: "brand", type: "default", icon: null },
  "Bod verstuurd": { variant: "brand", type: "color", icon: <Send strokeWidth={2.5} /> },
  "Bod ontvangen": { variant: "brand", type: "color", icon: <MailOpen strokeWidth={2.5} /> },
  "Goedgekeurd": { variant: "success", type: "color", icon: <Check strokeWidth={2.5} /> },
  "Afgewezen": { variant: "error", type: "color", icon: <X strokeWidth={2.5} /> },
};

type NegotiationBron = "eigen" | "markt";

interface OnderhandelingSidepanelProps {
  negotiationId: string;
  status: NegotiationStatus;
  bron: NegotiationBron;
  initialTab?: Tab;
  onClose: () => void;
}

export default function OnderhandelingSidepanel({ negotiationId, status, bron, initialTab, onClose }: OnderhandelingSidepanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? "condities");
  const [overig, setOverig] = useState("");
  const isActive = activeStatuses.includes(status);

  const tabs: { id: Tab; label: string }[] = [
    { id: "condities", label: "Condities" },
    { id: "vaartuig", label: "Vaartuig" },
    { id: "lading", label: "Lading" },
    { id: "activiteit", label: "Activiteit" },
  ];

  return (
    <ModelessPanel
      initialWidth={480}
      resizable={false}
      title="Onderhandeling met Rederij Alfa"
      subtitle={
        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[8px] items-start">
            <span>1.200 t Grind · MS Adriana</span>
            <Badge
              label={status}
              variant={statusBadgeConfig[status].variant}
              type={statusBadgeConfig[status].type}
              icon={statusBadgeConfig[status].icon ?? undefined}
            />
          </div>
          {/* Tab bar */}
          <div className="flex gap-[4px] h-[40px] items-center">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-full relative rounded-[4px] shrink-0 ${
                    isActive ? "bg-rdj-bg-brand" : ""
                  }`}
                >
                  <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                    <div className="flex h-full items-center justify-center px-[12px] py-[8px]">
                      <p
                        className={`font-sans font-bold leading-[20px] text-[14px] whitespace-nowrap ${
                          isActive ? "text-rdj-text-primary" : "text-rdj-text-tertiary"
                        }`}
                      >
                        {tab.label}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      }
      onClose={onClose}
      footer={
        isActive ? (
          <div className="border-t border-rdj-border-secondary px-[24px] py-[16px] flex gap-[12px]">
            <Button
              variant="secondary-destructive"
              label="Afwijzen"
              leadingIcon={<X strokeWidth={2.5} />}
              fullWidth
            />
            <Button
              variant="primary"
              label="Goedkeuren"
              leadingIcon={<Check strokeWidth={2.5} />}
              fullWidth
            />
          </div>
        ) : status === "Goedgekeurd" ? (
          <div className="border-t border-rdj-border-secondary px-[24px] py-[16px]">
            <Button
              variant="primary"
              label="Doorsturen naar laadplanning"
              leadingIcon={<ArrowRight strokeWidth={2.5} />}
              fullWidth
            />
          </div>
        ) : undefined
      }
    >
      {/* Tab content */}
      <div className="flex flex-col gap-[16px] p-[24px]">
        {activeTab === "condities" && <ConditiesTab bron={bron} overig={overig} onOverigChange={setOverig} />}
        {activeTab === "vaartuig" && <VaartuigTab />}
        {activeTab === "lading" && <LadingTab />}
        {activeTab === "activiteit" && <ActiviteitTab />}
      </div>
    </ModelessPanel>
  );
}

/* ── Condities Tab ── */
function ConditiesTab({ bron, overig, onOverigChange }: { bron: NegotiationBron; overig: string; onOverigChange: (v: string) => void }) {
  // Markt: inkoop → zoekcriteria → verkoop
  // Eigen: verkoop → zoekcriteria → inkoop
  const isMarkt = bron === "markt";
  const baseLabel = isMarkt ? "Inkoop" : "Verkoop";
  const compareLabel = isMarkt ? "Verkoop" : "Inkoop";
  const baseKey = isMarkt ? "inkoop" : "verkoop";
  const compareKey = isMarkt ? "verkoop" : "inkoop";

  return (
    <>
      {(["prijs", "laadtijd", "liggeldLaden", "lostijd", "liggeldLossen"] as ConditiesField[]).map((field) => {
        const vals = mockCondities[field];
        const baseVal = vals[baseKey];
        const zoekVal = vals.zoekcriteria;
        const compareVal = vals[compareKey];
        const diffZoek = calcPctDiff(zoekVal, baseVal);
        const diffCompare = calcPctDiff(compareVal, baseVal);
        return (
          <DetailsSidebarSection key={field} title={fieldLabels[field]}>
            <DetailRow label={baseLabel} value={fmt(field, baseVal)} />
            <DetailRow
              label="Zoekcriteria"
              value={fmt(field, zoekVal)}
              subtext={diffZoek?.text}
              subtextColor={diffZoek?.color}
              subtextTooltip={diffZoek ? `Vergeleken met ${baseLabel.toLowerCase()}` : undefined}
            />
            <DetailRow
              label={compareLabel}
              value={fmt(field, compareVal)}
              subtext={diffCompare?.text}
              subtextColor={diffCompare?.color}
              subtextTooltip={diffCompare ? `Vergeleken met ${baseLabel.toLowerCase()}` : undefined}
            />
          </DetailsSidebarSection>
        );
      })}

      <DetailsSidebarSection title="Overig">
        <textarea
          value={overig}
          onChange={(e) => onOverigChange(e.target.value)}
          placeholder="Voeg opmerkingen toe..."
          rows={3}
          className="w-full px-[12px] py-[8px] font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px] bg-transparent border border-transparent rounded-[6px] outline-none resize-none transition-all hover:border-rdj-border-primary hover:bg-rdj-bg-secondary-hover focus:border-rdj-border-brand focus:bg-white placeholder:text-rdj-text-tertiary"
        />
      </DetailsSidebarSection>
    </>
  );
}

/* ── Vaartuig Tab ── */
function VaartuigTab() {
  return (
    <>
      <DetailsSidebarSection>
        <DetailRow label="Beschikbaar vanaf" value={mockVaartuig.beschikbaarVanaf} />
        <DetailRow label="Huidige locatie" value={mockVaartuig.huidigeLocatie} />
        <DetailRow label="ENI" value={mockVaartuig.eni} />
        <DetailRow label="Vlag" value={mockVaartuig.vlag} />
        <DetailRow label="Meetbrief" value={mockVaartuig.meetbrief} />
        <DetailRow label="Groottonnage" value={mockVaartuig.groottonnage} />
        <DetailRow label="Inhoud" value={mockVaartuig.inhoud} />
        <DetailRow label="Lengte" value={mockVaartuig.lengte} />
        <DetailRow label="Breedte" value={mockVaartuig.breedte} />
        <DetailRow label="Diepgang" value={mockVaartuig.diepgang} />
        <DetailRow label="Kruiphoogte" value={mockVaartuig.kruiphoogte} />
        <DetailRow label="Bijzonderheden" type="badges" badges={mockVaartuig.bijzonderheden} />
        <DetailRow label="Relatie" type="linked" value={mockVaartuig.relatie} />
        <DetailRow label="Contactpersoon" value={mockVaartuig.contactpersoon} />
      </DetailsSidebarSection>

      <div className="w-full h-px bg-rdj-border-secondary shrink-0" />

      <DetailsSidebarSection>
        <DetailRow label="Eigenaar" type="user" value={mockVaartuig.eigenaar} avatarInitials={mockVaartuig.eigenaarInitials} />
      </DetailsSidebarSection>
    </>
  );
}

/* ── Lading Tab ── */
function LadingTab() {
  return (
    <>
      <DetailsSidebarSection>
        <DetailRow label="Partij" type="linked" value={mockLading.partij} />
        <DetailRow label="Subpartij" type="linked" value={mockLading.subpartij} />
        <DetailRow label="Tonnage" value={mockLading.tonnage} />
        <DetailRow label="Ex." value={mockLading.ex} subtext={mockLading.exType} />
        <DetailRow label="Lading" value={mockLading.lading} />
        <DetailRow label="Subsoort" value={mockLading.subsoort} />
        <DetailRow label="Soortelijk gewicht" value={mockLading.soortelijkGewicht} />
        <DetailRow label="Inhoud" value={mockLading.inhoud} />
        <DetailRow label="Bijzonderheden" type="badges" badges={mockLading.bijzonderheden} />
        <DetailRow label="Laadhaven" value={mockLading.laadhaven} />
        <DetailRow label="Laaddatum" value={mockLading.laaddatum} />
        <DetailRow label="Loshaven" value={mockLading.loshaven} />
        <DetailRow label="Losdatum" value={mockLading.losdatum} />
        <DetailRow label="Relatie" type="linked" value={mockLading.relatie} />
        <DetailRow label="Contactpersoon" value={mockLading.contactpersoon} />
      </DetailsSidebarSection>

      <div className="w-full h-px bg-rdj-border-secondary shrink-0" />

      <DetailsSidebarSection>
        <DetailRow label="Eigenaar" type="user" value={mockLading.eigenaar} avatarInitials={mockLading.eigenaarInitials} />
        <DetailRow label="Deadline" value={mockLading.deadline} />
      </DetailsSidebarSection>
    </>
  );
}

/* ── Activiteit Tab ── */
function ActiviteitTab() {
  return (
    <div className="flex flex-col">
      {mockActiviteit.map((event, index) => (
        <div key={event.id} className="flex gap-[12px] relative">
          {/* Timeline line */}
          {index < mockActiviteit.length - 1 && (
            <div className="absolute left-[15px] top-[36px] bottom-0 w-px bg-rdj-border-secondary" />
          )}

          {/* Avatar */}
          <div className="relative rounded-full shrink-0 size-[32px] bg-rdj-bg-secondary flex items-center justify-center z-[1]">
            <p className="font-sans font-bold text-rdj-text-primary text-[12px]">
              {event.initials}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 pb-[20px]">
            <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
              <span className="font-sans font-bold text-rdj-text-primary">
                {event.user}
              </span>{" "}
              {event.action}
            </p>
            <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px] mt-[2px]">
              {event.timestamp}
            </p>
            {event.detail && (
              <div className="mt-[8px] bg-rdj-bg-secondary rounded-[8px] px-[12px] py-[8px]">
                <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                  {event.detail}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
