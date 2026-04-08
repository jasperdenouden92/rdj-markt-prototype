import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import DetailsSidebar, { DetailsSidebarSection } from "./DetailsSidebar";
import DetailRow from "./DetailRow";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";
import { useLadingEigenDetail } from "../data/useDetailData";
import * as api from "../data/api";
import { partijen, subpartijen, exen } from "../data/entities/partijen";
import { ladingenEigen } from "../data/entities/ladingen-eigen";
import { havens } from "../data/entities/havens";
import { mockLadingSoorten, mockBijzonderheden } from "../data/mock-contract-data";
import RelatieHoverCard, { buildRelatieHoverContentById } from "./RelatieHoverCard";

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
  collapsed?: boolean;
}

export default function LadingEigenSidebar({ id, onEdit, collapsed }: LadingEigenSidebarProps) {
  const navigate = useNavigate();
  // Split IDs (e.g. "le-001-2", "le-001-rest") don't exist in the store; use base ID for API calls.
  const baseId = id.replace(/-(rest|[1-9]\d*)$/, '');
  const { data, loading, error, refetch } = useLadingEigenDetail(id);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [overigVerkoop, setOverigVerkoop] = useState("");
  const [overigZoekcriteria, setOverigZoekcriteria] = useState("");
  const [opmerkingen, setOpmerkingen] = useState("");

  // Resolve partij/subpartij data from lading module entities
  const partijData = useMemo(() => {
    if (!data) return null;
    const p = partijen.find((x) => x.id === data.raw.partijId);
    if (!p) return null;
    const ex = p.exId ? exen.find((e) => e.id === p.exId) : null;
    const laadlocatie = havens.find((h) => h.id === p.laadlocatieId);
    const ladingSoort = mockLadingSoorten.find((ls) => ls.id === p.ladingSoortId);
    const subs = subpartijen.filter((s) => p.subpartijIds.includes(s.id));
    return { partij: p, ex, laadlocatie, ladingSoort, subpartijen: subs };
  }, [data]);

  const subpartijData = useMemo(() => {
    if (!data) return null;
    const s = subpartijen.find((x) => x.id === data.raw.subpartijId);
    if (!s) return null;
    const parentPartij = partijen.find((p) => p.id === s.partijId);
    const laadlocatie = parentPartij ? havens.find((h) => h.id === parentPartij.laadlocatieId) : null;
    const loslocatie = havens.find((h) => h.id === s.loslocatieId);
    const bijz = s.bijzonderheidIds
      .map((bid) => mockBijzonderheden.find((b) => b.id === bid))
      .filter(Boolean)
      .map((b) => b!.naam);
    return { subpartij: s, laadlocatie, loslocatie, bijzonderheden: bijz };
  }, [data]);

  const relatieHoverContent = useMemo(
    () => (data ? buildRelatieHoverContentById(data.relatieId) : undefined),
    [data],
  );

  // Derive lot status
  const lotStatus = useMemo(() => {
    const statusMap: Record<string, { label: string; variant: string }> = {
      intake: { label: "Intake", variant: "brand" },
      werklijst: { label: "Werklijst", variant: "warning" },
      markt: { label: "In de markt", variant: "success" },
      gesloten: { label: "Gesloten", variant: "grey" },
    };
    const s = (data?.raw as any)?.status || "intake";
    return statusMap[s] || statusMap.intake;
  }, [data]);

  // Find sibling lots: other lading_eigen items with the same subpartijId (same subpartij, different lots)
  const siblingLots = useMemo(() => {
    if (!data) return [];
    const currentSubpartijId = data.raw.subpartijId;
    // Exclude both the current ID and the base ID (for split items like le-001-2 → le-001)
    const excludeIds = new Set([id, baseId]);
    // All lots for this subpartij (including current) — used for numbering
    const allLots = ladingenEigen.filter((le) => le.subpartijId === currentSubpartijId);
    return allLots
      .filter((le) => !excludeIds.has(le.id))
      .map((le) => {
        const lotIndex = allLots.findIndex((l) => l.id === le.id) + 1;
        const sub = subpartijen.find((s) => s.id === le.subpartijId);
        const parentPartij = partijen.find((p) => p.id === le.partijId);
        const laadlocatie = parentPartij ? havens.find((h) => h.id === parentPartij.laadlocatieId) : null;
        const loslocatie = sub ? havens.find((h) => h.id === sub.loslocatieId) : null;
        const bijz = sub?.bijzonderheidIds
          .map((bid) => mockBijzonderheden.find((b) => b.id === bid))
          .filter(Boolean)
          .map((b) => b!.naam) || [];
        return {
          id: le.id,
          subpartijId: le.subpartijId,
          naam: sub?.naam || le.id,
          lotIndex,
          tonnage: le.tonnage ? `${le.tonnage.toLocaleString("nl-NL")} t` : "—",
          laadlocatie: laadlocatie?.naam || "—",
          loslocatie: loslocatie?.naam || "—",
          laaddatum: sub?.laaddatum || null,
          losdatum: sub?.losdatum || null,
          bijzonderheden: bijz,
          status: ((le as any).status || "intake") as string,
        };
      });
  }, [data, id, baseId]);

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
      await api.patch("lading_eigen", baseId, { [field]: value });
    } else {
      const zoekKey = `zoek${field.charAt(0).toUpperCase()}${field.slice(1)}`;
      await api.patch("lading_eigen", baseId, { [zoekKey]: value });
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
        collapsed={collapsed}
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
        collapsed={collapsed}
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
      collapsed={collapsed}
    >
      {activeTab === "details" && (
        <>
          {/* References: Partij, Subpartij, Overige lots */}
          <DetailsSidebarSection>
            <DetailRow
              label="Partij"
              type="linked"
              value={data.partij}
              onClick={() => navigate(`/lading/partij/${data.raw.partijId}`)}
              hoverContent={partijData ? (
                <PartijHoverCard
                  title={partijData.partij.naam}
                  ladingSoort={partijData.ladingSoort?.naam || "—"}
                  tonnage={partijData.partij.tonnage}
                  laadlocatie={partijData.laadlocatie?.naam || "—"}
                  exNaam={partijData.ex?.naam}
                  exType={partijData.ex?.type}
                  subpartijen={partijData.subpartijen.map((s) => s.naam)}
                />
              ) : undefined}
            />
            <DetailRow
              label="Subpartij"
              type="linked"
              value={data.subpartij}
              onClick={() => navigate(`/lading/subpartij/${data.raw.subpartijId}`)}
              hoverContent={subpartijData ? (
                <SubpartijHoverCard
                  title={subpartijData.subpartij.naam}
                  status={((ladingenEigen.find((le) => le.subpartijId === data.raw.subpartijId) as any)?.status || "intake")}
                  laadlocatie={subpartijData.laadlocatie?.naam || "—"}
                  loslocatie={subpartijData.loslocatie?.naam || "—"}
                  laaddatum={subpartijData.subpartij.laaddatum}
                  losdatum={subpartijData.subpartij.losdatum}
                  bijzonderheden={subpartijData.bijzonderheden}
                />
              ) : undefined}
            />
            {siblingLots.length > 0 && (
              <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full">
                <div className="bg-white content-stretch flex items-center py-[8px] relative rounded-[6px] shrink-0 w-[144px]">
                  <p className="flex-[1_0_0] font-sans font-normal leading-[20px] min-h-px min-w-px relative text-rdj-text-secondary text-[14px]">
                    Overige lots
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
                  {siblingLots.map((lot) => (
                    <HoverCard key={lot.id} openDelay={300} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <div className="px-[12px] py-[8px] w-full">
                          <button
                            type="button"
                            className="content-stretch flex items-center gap-[6px] overflow-clip relative shrink-0 w-full group"
                            onClick={() => navigate(`/markt/bevrachting/lading/${lot.id}`)}
                          >
                            <span className="inline-flex items-center justify-center px-[5px] py-[1px] rounded-[4px] font-sans font-bold text-[10px] leading-[14px] whitespace-nowrap bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]">
                              #{lot.lotIndex}
                            </span>
                            <p className="font-sans font-bold leading-[20px] min-w-0 overflow-hidden text-rdj-text-brand text-[14px] text-ellipsis text-left whitespace-nowrap group-hover:underline">
                              {lot.tonnage}
                            </p>
                            <span className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px] shrink-0">
                              {lot.status === "intake" ? "Intake" : lot.status === "werklijst" ? "Werklijst" : lot.status === "markt" ? "In de markt" : "Gesloten"}
                            </span>
                          </button>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent side="left" align="start" sideOffset={8} className="w-[280px] p-0 border-rdj-border-secondary">
                        <SubpartijHoverCard
                          title={lot.naam}
                          status={lot.status}
                          laadlocatie={lot.laadlocatie}
                          loslocatie={lot.loslocatie}
                          laaddatum={lot.laaddatum}
                          losdatum={lot.losdatum}
                          bijzonderheden={lot.bijzonderheden}
                        />
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              </div>
            )}
          </DetailsSidebarSection>

          {/* Divider */}
          <div className="w-full h-px bg-rdj-border-secondary shrink-0 -mt-[8px]" />

          {/* Lot data — matches bevrachting table columns */}
          <DetailsSidebarSection>
            <DetailRow label="Status" type="badges" badges={[lotStatus.label]} />
            <DetailRow label="Lading" value={data.lading} subtext={data.subsoort !== "—" ? data.subsoort : undefined} />
            <DetailRow
              label="Tonnage"
              value={data.tonnage}
              editValue={data.raw.tonnage ? String(data.raw.tonnage) : ""}
              editable
              onSave={async (v) => {
                const n = parseNum(v);
                if (n != null) { await api.patch("lading_eigen", baseId, { tonnage: n }); refetch(); }
              }}
            />
            <DetailRow label="Laden" value={data.laadlocatie} subtext={data.laaddatum} />
            <DetailRow label="Lossen" value={data.loslocatie} subtext={data.losdatum} />
            <DetailRow
              label="Relatie"
              type="linked"
              value={data.opdrachtgever}
              onClick={() => navigate(`/crm/relatie/${data.relatieId}`)}
              hoverContent={relatieHoverContent}
            />
          </DetailsSidebarSection>

          {/* Divider */}
          <div className="w-full h-px bg-rdj-border-secondary shrink-0 -mt-[8px]" />

          <DetailsSidebarSection>
            <DetailRow label="Eigenaar" type="user" value={data.eigenaar} avatarSrc={data.eigenaarFoto} avatarInitials={data.eigenaarInitials} />
            <DetailRow
              label="Deadline"
              value={data.deadline}
              editValue={data.raw.deadline || ""}
              editable
              onSave={async (v) => {
                await api.patch("lading_eigen", baseId, { deadline: v || null });
                refetch();
              }}
            />
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
            <DetailRow
              label="Verkoop"
              value={overigVerkoop || undefined}
              editValue={overigVerkoop}
              editable
              onSave={(v) => setOverigVerkoop(v)}
            />
            <DetailRow
              label="Zoekcriteria"
              value={overigZoekcriteria || undefined}
              editValue={overigZoekcriteria}
              editable
              onSave={(v) => setOverigZoekcriteria(v)}
            />
          </DetailsSidebarSection>

          {/* Opmerkingen */}
          <DetailsSidebarSection title="Opmerkingen">
            <textarea
              value={opmerkingen}
              onChange={(e) => setOpmerkingen(e.target.value)}
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

/* ── Hover card components ── */

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function PartijHoverCard({ title, ladingSoort, tonnage, laadlocatie, exNaam, exType, subpartijen: subs }: {
  title: string;
  ladingSoort: string;
  tonnage: number;
  laadlocatie: string;
  exNaam?: string;
  exType?: string;
  subpartijen: string[];
}) {
  return (
    <div className="p-[16px]">
      {/* Header */}
      <div className="mb-[12px]">
        <div className="flex items-center gap-[4px]">
          {exType && (
            exType === "opslag" ? (
              <svg className="shrink-0 size-[14px] text-rdj-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
            ) : (
              <svg className="shrink-0 size-[14px] text-rdj-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 17h1m0 0h16m-16 0v-4m16 4v-4m0 0H4m16 0 1.28-5.12a1 1 0 0 0-.97-1.22H6.69a1 1 0 0 0-.97 1.22L7 13M4 13l-1-6h2" /></svg>
            )
          )}
          <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">{title}</p>
        </div>
        <p className="font-sans font-normal leading-[18px] text-rdj-text-secondary text-[12px] mt-[2px]">
          {tonnage.toLocaleString("nl-NL")} t {ladingSoort}{exNaam ? ` · ${exNaam}` : ""}
        </p>
      </div>

      {/* Laadlocatie */}
      <div className="flex items-center gap-[6px] mb-[8px]">
        <div className="shrink-0 w-[14px] flex items-center justify-center">
          <div className="w-[6px] h-[6px] rounded-full border-[1.5px] border-[#667085]" />
        </div>
        <p className="font-sans font-normal leading-[18px] text-[#344054] text-[12px]">{laadlocatie}</p>
      </div>

      {/* Subpartijen */}
      {subs.length > 0 && (
        <div className="pt-[8px] border-t border-rdj-border-secondary">
          <p className="font-sans font-normal leading-[18px] text-rdj-text-tertiary text-[12px] mb-[4px]">
            {subs.length} {subs.length === 1 ? "subpartij" : "subpartijen"}
          </p>
          <div className="space-y-[2px]">
            {subs.map((s, i) => (
              <p key={i} className="font-sans font-normal leading-[18px] text-[#344054] text-[12px] truncate">{s}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  intake: { label: "Intake", bg: "bg-[#EFF8FF]", text: "text-[#175CD3]" },
  werklijst: { label: "Werklijst", bg: "bg-[#FFFAEB]", text: "text-[#B54708]" },
  markt: { label: "In de markt", bg: "bg-[#ECFDF3]", text: "text-[#027A48]" },
  gesloten: { label: "Gesloten", bg: "bg-[#F2F4F7]", text: "text-[#344054]" },
};

function SubpartijHoverCard({ title, status, laadlocatie, loslocatie, laaddatum, losdatum, bijzonderheden }: {
  title: string;
  status: string;
  laadlocatie: string;
  loslocatie: string;
  laaddatum: string | null;
  losdatum: string | null;
  bijzonderheden: string[];
}) {
  const sc = statusConfig[status] || statusConfig.intake;
  return (
    <div className="p-[16px]">
      {/* Header */}
      <div className="mb-[12px]">
        <div className="flex items-center justify-between gap-[8px]">
          <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] truncate min-w-0">{title}</p>
          <span className={`shrink-0 inline-flex items-center rounded-[4px] px-[6px] py-[1px] font-sans font-bold text-[11px] leading-[16px] ${sc.bg} ${sc.text}`}>
            {sc.label}
          </span>
        </div>
      </div>

      {/* Route: laadlocatie (van partij) → loslocatie (van subpartij) */}
      <div className="space-y-[6px]">
        <div className="flex items-center gap-[6px]">
          <div className="shrink-0 w-[14px] flex items-center justify-center">
            <div className="w-[6px] h-[6px] rounded-full border-[1.5px] border-[#667085]" />
          </div>
          <p className="font-sans font-normal leading-[18px] text-[#344054] text-[12px] flex-1 min-w-0 truncate">{laadlocatie}</p>
          <p className="font-sans font-normal leading-[18px] text-rdj-text-tertiary text-[12px] shrink-0">{formatShortDate(laaddatum)}</p>
        </div>
        <div className="flex items-center gap-[6px]">
          <div className="shrink-0 w-[14px] flex items-center justify-center">
            <div className="w-[6px] h-[6px] rounded-full bg-[#667085]" />
          </div>
          <p className="font-sans font-normal leading-[18px] text-[#344054] text-[12px] flex-1 min-w-0 truncate">{loslocatie}</p>
          <p className="font-sans font-normal leading-[18px] text-rdj-text-tertiary text-[12px] shrink-0">{formatShortDate(losdatum)}</p>
        </div>
      </div>

      {/* Bijzonderheden */}
      {bijzonderheden.length > 0 && (
        <div className="flex flex-wrap gap-[4px] mt-[8px] pt-[8px] border-t border-rdj-border-secondary">
          {bijzonderheden.map((b, i) => (
            <span key={i} className="inline-flex items-center bg-[#f2f4f7] rounded-[4px] px-[6px] py-[2px] font-sans font-bold text-[11px] text-rdj-text-primary">
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

