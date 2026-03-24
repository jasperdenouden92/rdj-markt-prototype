import { useState } from "react";
import { useNavigate } from "react-router";
import DetailsSidebar, { DetailsSidebarSection } from "./DetailsSidebar";
import DetailRow from "./DetailRow";
import { useLadingMarktDetail } from "../data/useDetailData";

/**
 * LadingMarktSidebar — detail sidebar for a markt-lading.
 * Condities tab: Inkoop + Zoekcriteria with inline editing (local state only).
 */

function calcPctDiff(
  zoek: number | null | undefined,
  inkoop: number | null | undefined,
): { text: string; color: string } | undefined {
  if (zoek == null || inkoop == null || inkoop === 0) return undefined;
  const pct = ((zoek - inkoop) / Math.abs(inkoop)) * 100;
  const rounded = Math.round(pct);
  if (rounded === 0) return undefined;
  const sign = rounded > 0 ? "+" : "";
  return {
    text: `${sign}${rounded}%`,
    color: rounded < 0 ? "#F79009" : "",
  };
}

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

function rawStr(n: number | null): string {
  if (n == null) return "";
  return String(n).replace(".", ",");
}

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? null : n;
}

type ConditiesField = "prijs" | "laadtijd" | "liggeldLaden" | "lostijd" | "liggeldLossen";

interface Overrides {
  inkoopPrijs?: number | null;
  inkoopLaadtijd?: number | null;
  inkoopLiggeldLaden?: number | null;
  inkoopLostijd?: number | null;
  inkoopLiggeldLossen?: number | null;
  zoekcriteriaPrijs?: number | null;
  zoekcriteriaLaadtijd?: number | null;
  zoekcriteriaLiggeldLaden?: number | null;
  zoekcriteriaLostijd?: number | null;
  zoekcriteriaLiggeldLossen?: number | null;
}

const fieldLabels: Record<ConditiesField, string> = {
  prijs: "Prijs",
  laadtijd: "Laadtijd",
  liggeldLaden: "Liggeld laden",
  lostijd: "Lostijd",
  liggeldLossen: "Liggeld lossen",
};

interface LadingMarktSidebarProps {
  id: string;
  onEdit?: (field: string) => void;
}

export default function LadingMarktSidebar({ id, onEdit }: LadingMarktSidebarProps) {
  const navigate = useNavigate();
  const { data, loading, error } = useLadingMarktDetail(id);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [overrides, setOverrides] = useState<Overrides>({});
  const [overig, setOverig] = useState("");

  const getVal = (section: "inkoop" | "zoekcriteria", field: ConditiesField): number | null => {
    const key = `${section}${field.charAt(0).toUpperCase()}${field.slice(1)}` as keyof Overrides;
    if (key in overrides) return overrides[key] ?? null;
    if (!data) return null;
    const rawKey = `raw${section.charAt(0).toUpperCase()}${section.slice(1)}${field.charAt(0).toUpperCase()}${field.slice(1)}` as keyof typeof data;
    const val = (data[rawKey] as number | null) ?? null;
    // Fallback: prefill zoekcriteria with inkoop when no data available
    if (val == null && section === "zoekcriteria") {
      const inkoopKey = `rawInkoop${field.charAt(0).toUpperCase()}${field.slice(1)}` as keyof typeof data;
      return (data[inkoopKey] as number | null) ?? null;
    }
    return val;
  };

  const saveField = (section: "inkoop" | "zoekcriteria", field: ConditiesField, input: string) => {
    const num = parseNum(input);
    const key = `${section}${field.charAt(0).toUpperCase()}${field.slice(1)}` as keyof Overrides;
    setOverrides(prev => ({ ...prev, [key]: num }));
  };

  const fmt = (field: ConditiesField, n: number | null): string => {
    if (field === "prijs") return fmtPrice(n);
    if (field === "laadtijd" || field === "lostijd") return fmtHours(n);
    return fmtCurrency(n);
  };

  if (loading) {
    return (
      <DetailsSidebar
        tabs={[
          { id: "details", label: "Details" },
          { id: "condities", label: "Condities" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="flex items-center justify-center py-[40px] w-full">
          <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[14px]">
            Laden...
          </p>
        </div>
      </DetailsSidebar>
    );
  }

  if (error || !data) {
    return (
      <DetailsSidebar
        tabs={[
          { id: "details", label: "Details" },
          { id: "condities", label: "Condities" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="flex items-center justify-center py-[40px] w-full">
          <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[14px]">
            {error || "Geen data gevonden"}
          </p>
        </div>
      </DetailsSidebar>
    );
  }

  const stars = Array.from({ length: 5 }, (_, i) => i < data.prioriteit);

  return (
    <DetailsSidebar
      tabs={[
        { id: "details", label: "Details" },
        { id: "condities", label: "Condities" },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "details" && (
        <>
          <DetailsSidebarSection>
            <DetailRow label="Tonnage" value={data.tonnage} editable onEdit={() => onEdit?.("tonnage")} />
            <DetailRow label="Lading" value={data.lading} editable onEdit={() => onEdit?.("lading")} />
            <DetailRow label="Subsoort" value={data.subsoort} editable onEdit={() => onEdit?.("subsoort")} />
            <DetailRow label="Soortelijk gewicht" value={data.soortelijkGewicht} editable onEdit={() => onEdit?.("soortelijkGewicht")} />
            <DetailRow label="Inhoud" value={data.inhoud} editable onEdit={() => onEdit?.("inhoud")} />
            <DetailRow label="Bijzonderheden" type="badges" badges={data.bijzonderheden} editable onEdit={() => onEdit?.("bijzonderheden")} />
            <DetailRow label="Laadhaven" value={data.laadhaven} editable onEdit={() => onEdit?.("laadhaven")} />
            <DetailRow label="Laaddatum" value={data.laaddatum} editable onEdit={() => onEdit?.("laaddatum")} />
            <DetailRow label="Loshaven" value={data.loshaven} editable onEdit={() => onEdit?.("loshaven")} />
            <DetailRow label="Losdatum" value={data.losdatum} editable onEdit={() => onEdit?.("losdatum")} />
            <DetailRow label="Bron" type="linked" value={data.bron} subtext={data.bronDatum} />
            <DetailRow label="Relatie" type="linked" value={data.relatie} onClick={() => navigate(`/crm/relatie/${data.relatieId}`)} />
            <DetailRow label="Contactpersoon" value={data.contactpersoon} />
          </DetailsSidebarSection>

          {/* Divider */}
          <div className="w-full h-px bg-rdj-border-secondary shrink-0 -mt-[8px]" />

          <DetailsSidebarSection>
            <DetailRow label="Eigenaar" type="user" value={data.eigenaar} avatarInitials={data.eigenaarInitials} />
            <DetailRow
              label="Prioriteit"
              value={
                stars.map((filled) => filled ? "★" : "☆").join("")
              }
              editable
              onEdit={() => onEdit?.("prioriteit")}
            />
          </DetailsSidebarSection>
        </>
      )}

      {activeTab === "condities" && (
        <>
          {(["prijs", "laadtijd", "liggeldLaden", "lostijd", "liggeldLossen"] as ConditiesField[]).map(field => {
            return (
              <DetailsSidebarSection key={field} title={fieldLabels[field]}>
                <DetailRow
                  label="Zoekcriteria"
                  value={fmt(field, getVal("zoekcriteria", field))}
                  editValue={rawStr(getVal("zoekcriteria", field))}
                  editable
                  onSave={(v) => saveField("zoekcriteria", field, v)}
                />
              </DetailsSidebarSection>
            );
          })}

          {/* Overig */}
          <DetailsSidebarSection title="Overig">
            <textarea
              value={overig}
              onChange={(e) => setOverig(e.target.value)}
              placeholder="Voeg opmerkingen toe..."
              rows={3}
              className="w-full px-[12px] py-[8px] font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px] bg-transparent border border-transparent rounded-[6px] outline-none resize-none transition-all hover:border-rdj-border-primary hover:bg-rdj-bg-secondary-hover focus:border-rdj-border-brand focus:bg-white placeholder:text-rdj-text-tertiary"
            />
          </DetailsSidebarSection>
        </>
      )}
    </DetailsSidebar>
  );
}
