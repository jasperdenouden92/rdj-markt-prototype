import { useState } from "react";
import { useNavigate } from "react-router";
import DetailsSidebar, { DetailsSidebarSection } from "./DetailsSidebar";
import DetailRow from "./DetailRow";
import { useLadingEigenDetail } from "../data/useDetailData";
import * as api from "../data/api";

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

function fmtLiggeld(v: string | number | null): string {
  if (v == null || v === 0) return "—";
  if (typeof v === "string" && v.toUpperCase() === "NLW") return "Nederlands Wettelijk";
  if (typeof v === "number") return fmtCurrency(v);
  return v;
}

function rawLiggeldStr(v: string | number | null): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return String(v).replace(".", ",");
}

function rawStr(n: number | null): string {
  if (n == null) return "";
  return String(n).replace(".", ",");
}

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? null : n;
}

type ConditiesField = "prijs" | "laadtijd" | "liggeldLaden" | "lostijd" | "liggeldLossen" | "deadline";

interface LadingEigenSidebarProps {
  id: string;
  onEdit?: (field: string) => void;
}

export default function LadingEigenSidebar({ id, onEdit }: LadingEigenSidebarProps) {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useLadingEigenDetail(id);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [overig, setOverig] = useState("");

  const getVal = (section: "eigen" | "markt", field: ConditiesField): string | number | null => {
    if (!data) return null;
    if (field === "deadline") {
      if (section === "eigen") return data.deadline !== "—" ? data.deadline : null;
      // Zoekcriteria deadline stored on raw
      return (data.raw as any).zoekDeadline ?? null;
    }
    const rawKey = `raw${section.charAt(0).toUpperCase()}${section.slice(1)}${field.charAt(0).toUpperCase()}${field.slice(1)}` as keyof typeof data;
    return (data[rawKey] as string | number | null) ?? null;
  };

  const saveField = async (section: "eigen" | "markt", field: ConditiesField, input: string) => {
    const isNlw = input.toUpperCase() === "NLW";
    const isStringField = field === "deadline" || isNlw;
    const value = isStringField ? (input || null) : parseNum(input);
    if (section === "eigen") {
      await api.patch("lading_eigen", id, { [field]: value });
    } else {
      const zoekKey = `zoek${field.charAt(0).toUpperCase()}${field.slice(1)}`;
      await api.patch("lading_eigen", id, { [zoekKey]: value });
    }
    refetch();
  };

  const fmtField = (field: ConditiesField, v: string | number | null): string => {
    if (field === "prijs") return fmtPrice(v as number | null);
    if (field === "laadtijd" || field === "lostijd") return fmtHours(v as number | null);
    if (field === "liggeldLaden" || field === "liggeldLossen") return fmtLiggeld(v);
    if (field === "deadline") return v ? String(v) : "—";
    return fmtCurrency(v as number | null);
  };

  const rawFieldStr = (field: ConditiesField, v: string | number | null): string => {
    if (field === "liggeldLaden" || field === "liggeldLossen") return rawLiggeldStr(v);
    if (field === "deadline") return v ? String(v) : "";
    return rawStr(v as number | null);
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
            <DetailRow label="Opdrachtgever" type="linked" value={data.opdrachtgever} onClick={() => navigate(`/crm/relatie/${data.relatieId}`)} />
            <DetailRow label="Contactpersoon" value={data.opdrachtgeverContact} />
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
          {(["prijs", "laadtijd", "liggeldLaden", "lostijd", "liggeldLossen", "deadline"] as ConditiesField[]).map(field => {
            const label = field === "prijs" ? "Prijs" : field === "laadtijd" ? "Laadtijd" : field === "liggeldLaden" ? "Liggeld laden" : field === "lostijd" ? "Lostijd" : field === "liggeldLossen" ? "Liggeld lossen" : "Deadline";
            const eigenVal = getVal("eigen", field);
            const marktVal = getVal("markt", field);
            const canDiff = typeof eigenVal === "number" && typeof marktVal === "number";
            const diff = canDiff ? calcPctDiff(marktVal as number, eigenVal as number) : undefined;
            return (
              <DetailsSidebarSection key={field} title={label}>
                <DetailRow
                  label="Verkoop"
                  value={fmtField(field, eigenVal)}
                  editValue={rawFieldStr(field, eigenVal)}
                  editable
                  onSave={(v) => saveField("eigen", field, v)}
                />
                <DetailRow
                  label="Zoekcriteria"
                  value={fmtField(field, marktVal)}
                  editValue={rawFieldStr(field, marktVal)}
                  subtext={diff?.text}
                  subtextColor={diff?.color}
                  subtextTooltip={diff ? "Vergeleken met verkoop" : undefined}
                  editable
                  onSave={(v) => saveField("markt", field, v)}
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
