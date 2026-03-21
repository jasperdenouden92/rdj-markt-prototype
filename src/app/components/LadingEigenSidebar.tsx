import { useState } from "react";
import { useNavigate } from "react-router";
import DetailsSidebar, { DetailsSidebarSection } from "./DetailsSidebar";
import DetailRow from "./DetailRow";
import { useLadingEigenDetail } from "../data/useDetailData";

/**
 * LadingEigenSidebar — detail sidebar for an eigen-lading.
 * Condities tab: Verkoop + Zoekcriteria with inline editing (local state only).
 */

function calcPctDiff(
  markt: number | null | undefined,
  eigen: number | null | undefined,
): { text: string; color: string } | undefined {
  if (markt == null || eigen == null || eigen === 0) return undefined;
  const pct = ((markt - eigen) / Math.abs(eigen)) * 100;
  const rounded = Math.round(pct);
  if (rounded === 0) return undefined;
  const sign = rounded > 0 ? "+" : "";
  return {
    text: `${sign}${rounded}%`,
    color: rounded > 0 ? "#F79009" : "",
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
  eigenPrijs?: number | null;
  eigenLaadtijd?: number | null;
  eigenLiggeldLaden?: number | null;
  eigenLostijd?: number | null;
  eigenLiggeldLossen?: number | null;
  marktPrijs?: number | null;
  marktLaadtijd?: number | null;
  marktLiggeldLaden?: number | null;
  marktLostijd?: number | null;
  marktLiggeldLossen?: number | null;
}

interface LadingEigenSidebarProps {
  id: string;
  onEdit?: (field: string) => void;
}

export default function LadingEigenSidebar({ id, onEdit }: LadingEigenSidebarProps) {
  const navigate = useNavigate();
  const { data, loading, error } = useLadingEigenDetail(id);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [overrides, setOverrides] = useState<Overrides>({});

  const getVal = (section: "eigen" | "markt", field: ConditiesField): number | null => {
    const key = `${section}${field.charAt(0).toUpperCase()}${field.slice(1)}` as keyof Overrides;
    if (key in overrides) return overrides[key] ?? null;
    if (!data) return null;
    const rawKey = `raw${section.charAt(0).toUpperCase()}${section.slice(1)}${field.charAt(0).toUpperCase()}${field.slice(1)}` as keyof typeof data;
    return (data[rawKey] as number | null) ?? null;
  };

  const saveField = (section: "eigen" | "markt", field: ConditiesField, input: string) => {
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
            <DetailRow label="Partij" type="linked" value={data.partij} />
            <DetailRow label="Subpartij" type="linked" value={data.subpartij} />
            <DetailRow label="Tonnage" value={data.tonnage} editable onEdit={() => onEdit?.("tonnage")} />
            <DetailRow label="Ex." value={data.ex} subtext={data.exType} />
            <DetailRow label="Lading" value={data.lading} editable onEdit={() => onEdit?.("lading")} />
            <DetailRow label="Subsoort" value={data.subsoort} editable onEdit={() => onEdit?.("subsoort")} />
            <DetailRow label="Soortelijk gewicht" value={data.soortelijkGewicht} editable onEdit={() => onEdit?.("soortelijkGewicht")} />
            <DetailRow label="Inhoud" value={data.inhoud} editable onEdit={() => onEdit?.("inhoud")} />
            <DetailRow label="Bijzonderheden" type="badges" badges={data.bijzonderheden} editable onEdit={() => onEdit?.("bijzonderheden")} />
            <DetailRow label="Laadhaven" value={data.laadhaven} editable onEdit={() => onEdit?.("laadhaven")} />
            <DetailRow label="Laaddatum" value={data.laaddatum} editable onEdit={() => onEdit?.("laaddatum")} />
            <DetailRow label="Loshaven" value={data.loshaven} editable onEdit={() => onEdit?.("loshaven")} />
            <DetailRow label="Losdatum" value={data.losdatum} editable onEdit={() => onEdit?.("losdatum")} />
            <DetailRow label="Relatie" type="linked" value={data.relatie} onClick={() => navigate(`/crm/relatie/${data.relatieId}`)} />
            <DetailRow label="Contactpersoon" value={data.contactpersoon} />
          </DetailsSidebarSection>

          {/* Divider */}
          <div className="w-full h-px bg-rdj-border-secondary shrink-0 -mt-[8px]" />

          <DetailsSidebarSection>
            <DetailRow label="Eigenaar" type="user" value={data.eigenaar} avatarInitials={data.eigenaarInitials} />
            <DetailRow label="Deadline" value={data.deadline} editable onEdit={() => onEdit?.("deadline")} />
          </DetailsSidebarSection>
        </>
      )}

      {activeTab === "condities" && (
        <>
          {/* Verkoop condities */}
          <DetailsSidebarSection title="Verkoop">
            {(["prijs", "laadtijd", "liggeldLaden", "lostijd", "liggeldLossen"] as ConditiesField[]).map(field => (
              <DetailRow
                key={field}
                label={field === "prijs" ? "Prijs" : field === "laadtijd" ? "Laadtijd" : field === "liggeldLaden" ? "Liggeld laden" : field === "lostijd" ? "Lostijd" : "Liggeld lossen"}
                value={fmt(field, getVal("eigen", field))}
                editValue={rawStr(getVal("eigen", field))}
                editable
                onSave={(v) => saveField("eigen", field, v)}
              />
            ))}
          </DetailsSidebarSection>

          {/* Zoekcriteria condities */}
          <DetailsSidebarSection title="Zoekcriteria">
            {(["prijs", "laadtijd", "liggeldLaden", "lostijd", "liggeldLossen"] as ConditiesField[]).map(field => {
              const diff = calcPctDiff(getVal("markt", field), getVal("eigen", field));
              return (
                <DetailRow
                  key={field}
                  label={field === "prijs" ? "Prijs" : field === "laadtijd" ? "Laadtijd" : field === "liggeldLaden" ? "Liggeld laden" : field === "lostijd" ? "Lostijd" : "Liggeld lossen"}
                  value={fmt(field, getVal("markt", field))}
                  editValue={rawStr(getVal("markt", field))}
                  subtext={diff?.text}
                  subtextColor={diff?.color}
                  subtextTooltip={diff ? "Vergeleken met verkoop" : undefined}
                  editable
                  onSave={(v) => saveField("markt", field, v)}
                />
              );
            })}
          </DetailsSidebarSection>
        </>
      )}
    </DetailsSidebar>
  );
}
