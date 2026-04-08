import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import { Send, MailOpen, Check, X, Ship } from "lucide-react";
import { Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import SegmentedButtonGroup from "../components/SegmentedButtonGroup";
import FilterDropdown from "../components/FilterDropdown";
import Pagination from "../components/Pagination";
import Table from "../components/Table";
import type { Column } from "../components/Table";
import useTableSort from "../components/useTableSort";
import Button from "../components/Button";
import OnderhandelingSidepanel from "../components/OnderhandelingSidepanel";
import svgPaths from "../../imports/svg-q07ncv0e2v";
import imgAvatar from "../../assets/a2737d3b5b234fc04041650cb9f114889c6859da.png";
import { buildRelatieHoverContent } from "../components/RelatieHoverCard";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../components/ui/hover-card";

/* ── Status badge mapping ── */
const statusVariantMap: Record<string, string> = {
  "Via werklijst": "brand",
  "Bod verstuurd": "brand",
  "Bod ontvangen": "brand",
  "Goedgekeurd": "success",
  "Afgewezen": "error",
};

const statusIconMap: Record<string, React.ReactNode | null> = {
  "Via werklijst": null,
  "Bod verstuurd": <Send strokeWidth={2.5} />,
  "Bod ontvangen": <MailOpen strokeWidth={2.5} />,
  "Goedgekeurd": <Check strokeWidth={2.5} />,
  "Afgewezen": <X strokeWidth={2.5} />,
};

const statusTypeMap: Record<string, "default" | "color"> = {
  "Via werklijst": "default",
  "Bod verstuurd": "color",
  "Bod ontvangen": "color",
  "Goedgekeurd": "color",
  "Afgewezen": "color",
};

/** Filter groups: "actief" = Via werklijst + Bod ontvangen + Bod verstuurd */
const activeStatuses = ["Via werklijst", "Bod ontvangen", "Bod verstuurd"];

/* ── Condities types ── */
interface Condities {
  prijs: number;
  laadtijd: number;
  liggeldLaden: number;
  lostijd: number;
  liggeldLossen: number;
  overig?: string;
}

/* ── Condities hover card component ── */
function ConditiesCell({ condities }: { condities: Condities | null }) {
  if (!condities) return <span className="text-rdj-text-tertiary">—</span>;

  const extraCount = [condities.laadtijd, condities.liggeldLaden, condities.lostijd, condities.liggeldLossen, condities.overig].filter(v => v != null).length;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button className="text-left cursor-default">
          <p className="font-sans font-normal text-[14px] leading-[20px] text-rdj-text-primary whitespace-nowrap">
            € {condities.prijs.toFixed(2).replace(".", ",")} /t
          </p>
          {extraCount > 0 && (
            <p className="font-sans font-normal text-[12px] leading-[18px] text-rdj-text-tertiary whitespace-nowrap">
              + {extraCount} condities
            </p>
          )}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="w-auto min-w-[200px] p-0 border-rdj-border-secondary">
        <div className="p-[12px] flex flex-col gap-[8px]">
          <div className="flex justify-between gap-[16px]">
            <span className="font-sans text-[12px] text-rdj-text-secondary">Vrachtprijs</span>
            <span className="font-sans text-[12px] font-bold text-rdj-text-primary">€ {condities.prijs.toFixed(2).replace(".", ",")} /t</span>
          </div>
          <div className="border-t border-rdj-border-secondary" />
          <div className="flex justify-between gap-[16px]">
            <span className="font-sans text-[12px] text-rdj-text-secondary">Laadtijd</span>
            <span className="font-sans text-[12px] font-bold text-rdj-text-primary">{condities.laadtijd} uur</span>
          </div>
          <div className="flex justify-between gap-[16px]">
            <span className="font-sans text-[12px] text-rdj-text-secondary">Liggeld laden</span>
            <span className="font-sans text-[12px] font-bold text-rdj-text-primary">€ {condities.liggeldLaden.toFixed(2).replace(".", ",")} /u</span>
          </div>
          <div className="border-t border-rdj-border-secondary" />
          <div className="flex justify-between gap-[16px]">
            <span className="font-sans text-[12px] text-rdj-text-secondary">Lostijd</span>
            <span className="font-sans text-[12px] font-bold text-rdj-text-primary">{condities.lostijd} uur</span>
          </div>
          <div className="flex justify-between gap-[16px]">
            <span className="font-sans text-[12px] text-rdj-text-secondary">Liggeld lossen</span>
            <span className="font-sans text-[12px] font-bold text-rdj-text-primary">€ {condities.liggeldLossen.toFixed(2).replace(".", ",")} /u</span>
          </div>
          {condities.overig && (
            <>
              <div className="border-t border-rdj-border-secondary" />
              <div className="flex flex-col gap-[2px]">
                <span className="font-sans text-[12px] text-rdj-text-secondary">Overig</span>
                <span className="font-sans text-[12px] text-rdj-text-primary">{condities.overig}</span>
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

/* ── Mock data ── */
const mockOnderhandelingen = [
  {
    id: "ond-l-1",
    // Lading – eigen
    bron: "eigen",
    ladingLabel: "m/v Abis Dover",
    ladingSubtext: "SP-001 · Grind",
    ladingBadge: undefined as string | undefined,
    ladingIcon: "vaartuig" as string | undefined,
    // Tonnage
    tonnage: "1.200 t",
    // Ladingaanbieder
    ladingaanbieder: "Rederij de Jong",
    // Vaartuigaanbieder
    vaartuigaanbieder: "Rijn Transport BV",
    vaartuigaanbiederSubtext: "MS Adriana" as string | undefined,
    // Condities
    inkoopcondities: { prijs: 8.50, laadtijd: 24, liggeldLaden: 12.50, lostijd: 16, liggeldLossen: 15.00, overig: "Voorkeur laden vóór 10:00" } as Condities | null,
    verkoopcondities: { prijs: 7.20, laadtijd: 18, liggeldLaden: 10.00, lostijd: 14, liggeldLossen: 12.00 } as Condities | null,
    // Laden / Lossen
    laadLocatie: "Rotterdam",
    laadDatum: "15 jan 2026, 08:00",
    losLocatie: "Antwerpen",
    losDatum: "16 jan 2026, 14:00",
    // Rest
    deadline: "17 jan 2026",
    status: "Bod verstuurd",
    updateUserInitials: "KN",
    updateUserAvatar: imgAvatar as string | undefined,
    updateDate: "14 jan 2026, 16:32",
  },
  {
    id: "ond-l-2",
    // Lading – markt
    bron: "markt",
    ladingLabel: "Zand",
    ladingSubtext: "",
    ladingBadge: "Markt" as string | undefined,
    ladingIcon: undefined as string | undefined,
    // Tonnage (range)
    tonnage: "800 – 1.000 t",
    // Ladingaanbieder
    ladingaanbieder: "Schippers & Co",
    // Vaartuigaanbieder
    vaartuigaanbieder: "Rederij de Jong",
    vaartuigaanbiederSubtext: undefined as string | undefined,
    // Condities
    inkoopcondities: { prijs: 7.20, laadtijd: 12, liggeldLaden: 10.00, lostijd: 8, liggeldLossen: 10.00 } as Condities | null,
    verkoopcondities: { prijs: 6.80, laadtijd: 10, liggeldLaden: 8.50, lostijd: 8, liggeldLossen: 9.00 } as Condities | null,
    // Laden / Lossen
    laadLocatie: "Duisburg",
    laadDatum: "18 jan 2026, 06:00",
    losLocatie: "Dordrecht",
    losDatum: "19 jan 2026, 10:00",
    // Rest
    deadline: "20 jan 2026",
    status: "Bod ontvangen",
    updateUserInitials: "PJ",
    updateUserAvatar: undefined as string | undefined,
    updateDate: "13 jan 2026, 09:15",
  },
  {
    id: "ond-l-3",
    // Lading – eigen
    bron: "eigen",
    ladingLabel: "m/v Maran Future",
    ladingSubtext: "SP-003 · Steenkool",
    ladingBadge: undefined as string | undefined,
    ladingIcon: "vaartuig" as string | undefined,
    // Tonnage
    tonnage: "2.000 t",
    // Ladingaanbieder
    ladingaanbieder: "Rederij de Jong",
    // Vaartuigaanbieder
    vaartuigaanbieder: "Noord-Zuid Bevrachting",
    vaartuigaanbiederSubtext: "MS Fortuna" as string | undefined,
    // Condities
    inkoopcondities: { prijs: 9.10, laadtijd: 16, liggeldLaden: 14.00, lostijd: 12, liggeldLossen: 13.00 } as Condities | null,
    verkoopcondities: { prijs: 8.20, laadtijd: 14, liggeldLaden: 11.50, lostijd: 10, liggeldLossen: 11.00 } as Condities | null,
    // Laden / Lossen
    laadLocatie: "Amsterdam",
    laadDatum: "20 jan 2026, 07:00",
    losLocatie: "Gent",
    losDatum: "21 jan 2026, 15:00",
    // Rest
    deadline: "22 jan 2026",
    status: "Goedgekeurd",
    updateUserInitials: "PJ",
    updateUserAvatar: imgAvatar as string | undefined,
    updateDate: "15 jan 2026, 11:45",
  },
  {
    id: "ond-l-4",
    // Lading – markt
    bron: "markt",
    ladingLabel: "Mais",
    ladingSubtext: "",
    ladingBadge: "Markt" as string | undefined,
    ladingIcon: undefined as string | undefined,
    // Tonnage (range)
    tonnage: "500 – 700 t",
    // Ladingaanbieder
    ladingaanbieder: "IJsseldelta Scheepvaart",
    // Vaartuigaanbieder
    vaartuigaanbieder: "Rederij de Jong",
    vaartuigaanbiederSubtext: "MS Catharina" as string | undefined,
    // Condities
    inkoopcondities: { prijs: 11.00, laadtijd: 8, liggeldLaden: 20.00, lostijd: 8, liggeldLossen: 20.00 } as Condities | null,
    verkoopcondities: { prijs: 10.20, laadtijd: 8, liggeldLaden: 18.00, lostijd: 6, liggeldLossen: 16.00, overig: "Alleen bij daglicht lossen" } as Condities | null,
    // Laden / Lossen
    laadLocatie: "Terneuzen",
    laadDatum: "22 jan 2026, 09:00",
    losLocatie: "Luik",
    losDatum: "23 jan 2026, 12:00",
    // Rest
    deadline: "24 jan 2026",
    status: "Afgewezen",
    updateUserInitials: "EN",
    updateUserAvatar: undefined as string | undefined,
    updateDate: "16 jan 2026, 14:20",
  },
  {
    id: "ond-l-5",
    // Lading – eigen
    bron: "eigen",
    ladingLabel: "m/v A2B Future",
    ladingSubtext: "SP-005 · Klinker",
    ladingBadge: undefined as string | undefined,
    ladingIcon: "vaartuig" as string | undefined,
    // Tonnage
    tonnage: "1.500 t",
    // Ladingaanbieder
    ladingaanbieder: "Rederij de Jong",
    // Vaartuigaanbieder
    vaartuigaanbieder: "Schippers & Co",
    vaartuigaanbiederSubtext: undefined as string | undefined,
    // Condities
    inkoopcondities: { prijs: 10.25, laadtijd: 20, liggeldLaden: 15.00, lostijd: 16, liggeldLossen: 14.00 } as Condities | null,
    verkoopcondities: { prijs: 9.50, laadtijd: 18, liggeldLaden: 12.00, lostijd: 14, liggeldLossen: 12.50 } as Condities | null,
    // Laden / Lossen
    laadLocatie: "Nijmegen",
    laadDatum: "25 jan 2026, 06:30",
    losLocatie: "Rotterdam",
    losDatum: "25 jan 2026, 18:00",
    // Rest
    deadline: "26 jan 2026",
    status: "Bod verstuurd",
    updateUserInitials: "JK",
    updateUserAvatar: imgAvatar as string | undefined,
    updateDate: "17 jan 2026, 08:00",
  },
  {
    id: "ond-l-6",
    // Lading – markt
    bron: "markt",
    ladingLabel: "Graan",
    ladingSubtext: "",
    ladingBadge: "Markt" as string | undefined,
    ladingIcon: undefined as string | undefined,
    // Tonnage
    tonnage: "900 t",
    // Ladingaanbieder
    ladingaanbieder: "Noord-Zuid Bevrachting",
    // Vaartuigaanbieder
    vaartuigaanbieder: "Rederij de Jong",
    vaartuigaanbiederSubtext: undefined as string | undefined,
    // Condities
    inkoopcondities: { prijs: 6.80, laadtijd: 12, liggeldLaden: 8.00, lostijd: 10, liggeldLossen: 9.00, overig: "Schip moet kruiphoogte < 7m hebben" } as Condities | null,
    verkoopcondities: { prijs: 6.20, laadtijd: 10, liggeldLaden: 7.50, lostijd: 8, liggeldLossen: 8.00 } as Condities | null,
    // Laden / Lossen
    laadLocatie: "Mannheim",
    laadDatum: "28 jan 2026, 07:00",
    losLocatie: "Vlissingen",
    losDatum: "30 jan 2026, 09:00",
    // Rest
    deadline: "31 jan 2026",
    status: "Bod ontvangen",
    updateUserInitials: "KN",
    updateUserAvatar: imgAvatar as string | undefined,
    updateDate: "18 jan 2026, 10:10",
  },
  {
    id: "ond-l-7",
    // Lading – eigen
    bron: "eigen",
    ladingLabel: "m/v Merganser",
    ladingSubtext: "SP-007 · Houtpellets",
    ladingBadge: undefined as string | undefined,
    ladingIcon: "vaartuig" as string | undefined,
    // Tonnage (range)
    tonnage: "1.600 – 2.000 t",
    // Ladingaanbieder
    ladingaanbieder: "Rederij de Jong",
    // Vaartuigaanbieder
    vaartuigaanbieder: "IJsseldelta Scheepvaart",
    vaartuigaanbiederSubtext: "MS Petronella" as string | undefined,
    // Condities – nog geen bod uitgewisseld
    inkoopcondities: null as Condities | null,
    verkoopcondities: null as Condities | null,
    // Laden / Lossen
    laadLocatie: "Rotterdam",
    laadDatum: "2 feb 2026, 10:00",
    losLocatie: "Hamburg",
    losDatum: "5 feb 2026, 08:00",
    // Rest
    deadline: "1 feb 2026",
    status: "Via werklijst",
    updateUserInitials: "KN",
    updateUserAvatar: imgAvatar as string | undefined,
    updateDate: "19 jan 2026, 14:30",
  },
  {
    id: "ond-l-8",
    bron: "markt",
    ladingLabel: "Sojabonen",
    ladingSubtext: "",
    ladingBadge: "Bemiddeling" as string | undefined,
    ladingIcon: undefined as string | undefined,
    // Tonnage
    tonnage: "3.500 t",
    // Ladingaanbieder
    ladingaanbieder: "Cargill European Trading",
    // Vaartuigaanbieder
    vaartuigaanbieder: "Rijn Transport BV",
    vaartuigaanbiederSubtext: "MS De Hoop" as string | undefined,
    // Condities
    inkoopcondities: { prijs: 7.80, laadtijd: 16, liggeldLaden: 12.00, lostijd: 12, liggeldLossen: 11.00 } as Condities | null,
    verkoopcondities: { prijs: 7.00, laadtijd: 14, liggeldLaden: 10.00, lostijd: 10, liggeldLossen: 10.00 } as Condities | null,
    // Laden / Lossen
    laadLocatie: "Rotterdam Botlek",
    laadDatum: "3 feb 2026, 07:00",
    losLocatie: "Basel",
    losDatum: "7 feb 2026, 14:00",
    // Rest
    deadline: "2 feb 2026",
    status: "Bod verstuurd",
    updateUserInitials: "PJ",
    updateUserAvatar: imgAvatar as string | undefined,
    updateDate: "20 jan 2026, 09:30",
  },
  {
    id: "ond-l-9",
    bron: "markt",
    ladingLabel: "Ijzererts",
    ladingSubtext: "",
    ladingBadge: "Bemiddeling" as string | undefined,
    ladingIcon: undefined as string | undefined,
    // Tonnage (range)
    tonnage: "2.500 – 3.000 t",
    // Ladingaanbieder
    ladingaanbieder: "Schippers & Co",
    // Vaartuigaanbieder
    vaartuigaanbieder: "Noord-Zuid Bevrachting",
    vaartuigaanbiederSubtext: "MS Orion" as string | undefined,
    // Condities
    inkoopcondities: { prijs: 9.40, laadtijd: 20, liggeldLaden: 16.00, lostijd: 14, liggeldLossen: 14.00, overig: "Dubbele bodem vereist" } as Condities | null,
    verkoopcondities: { prijs: 8.60, laadtijd: 18, liggeldLaden: 14.00, lostijd: 12, liggeldLossen: 12.00 } as Condities | null,
    // Laden / Lossen
    laadLocatie: "IJmuiden",
    laadDatum: "5 feb 2026, 06:00",
    losLocatie: "Duisburg",
    losDatum: "7 feb 2026, 10:00",
    // Rest
    deadline: "4 feb 2026",
    status: "Bod ontvangen",
    updateUserInitials: "EN",
    updateUserAvatar: undefined as string | undefined,
    updateDate: "21 jan 2026, 15:45",
  },
];

/* ── Filter-dropdown met divider support ── */
function StatusFilterDropdown({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options = [
    { label: "Actief", value: "actief" },
    { label: "Goedgekeurd", value: "goedgekeurd" },
    { label: "Afgewezen", value: "afgewezen" },
    { label: "---", value: "divider" },
    { label: "Alles", value: "alles" },
  ];

  const displayLabel = options.find((o) => o.value === value)?.label || "Actief";

  return (
    <div
      ref={ref}
      className="relative"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-rdj-bg-primary relative rounded-[6px] shrink-0 cursor-pointer"
      >
        <div className="content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[14px] py-[10px] relative rounded-[inherit]">
          <div className="content-stretch flex items-center justify-center px-[2px] relative shrink-0">
            <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">
              {displayLabel}
            </p>
          </div>
          <div className="overflow-clip relative shrink-0 size-[20px]">
            <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]">
              <div className="absolute inset-[-16.67%_-8.33%]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 11.6667 6.66667"
                >
                  <path
                    d="M1.33334 1.33334L5.83334 5.83334L10.3333 1.33334"
                    stroke="#344054"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.66667"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute border border-rdj-border-primary border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
        />
      </button>

      {isOpen && (
        <>
          {/* Click-outside overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-[4px] bg-rdj-bg-primary border border-rdj-border-secondary rounded-[8px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] z-50 min-w-full overflow-hidden">
            {options.map((option, idx) =>
              option.value === "divider" ? (
                <div
                  key={idx}
                  className="border-t border-rdj-border-secondary mx-[4px]"
                />
              ) : (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-[14px] py-[10px] font-sans font-normal text-[14px] leading-[20px] hover:bg-rdj-bg-secondary transition-colors cursor-pointer whitespace-nowrap ${
                    option.value === value
                      ? "text-[#1567a4] bg-[#f0f7fc]"
                      : "text-[#344054]"
                  }`}
                >
                  {option.label}
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Plus icon SVG ── */
const PlusIcon = (
  <svg fill="none" viewBox="0 0 20 20">
    <path
      d="M10 4.167V15.833M4.167 10H15.833"
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.67"
    />
  </svg>
);

export default function Onderhandelingen() {
  const navigate = useNavigate();
  const location = useLocation();

  const [statusFilter, setStatusFilter] = useState("actief");
  const [sourceFilter, setSourceFilter] = useState("alles");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedNegotiation, setSelectedNegotiation] = useState<{ id: string; status: string; bron: string; relatieName?: string; ladingaanbieder?: string; vaartuigaanbieder?: string } | null>(
    null
  );
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});

  const handleStatusChange = (id: string, newStatus: string) => {
    setStatusOverrides(prev => ({ ...prev, [id]: newStatus }));
    setSelectedNegotiation(prev => prev ? { ...prev, status: newStatus } : null);
  };

  // Apply status overrides to mock data
  const dataWithOverrides = mockOnderhandelingen.map(item => ({
    ...item,
    status: statusOverrides[item.id] || item.status,
  }));

  /* ── Filter logic ── */
  const filteredData = dataWithOverrides.filter((item) => {
    if (statusFilter === "actief" && !activeStatuses.includes(item.status))
      return false;
    if (statusFilter === "goedgekeurd" && item.status !== "Goedgekeurd")
      return false;
    if (statusFilter === "afgewezen" && item.status !== "Afgewezen") return false;
    if (sourceFilter !== "alles" && item.bron !== sourceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !item.ladingLabel.toLowerCase().includes(q) &&
        !item.ladingaanbieder.toLowerCase().includes(q) &&
        !item.vaartuigaanbieder.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const totalItems = filteredData.length;
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  /* ── Table columns ── */
  const columns: Column[] = [
    {
      key: "lading",
      header: "Lading",
      type: "leading-text",
      subtextKey: "ladingSubtext",
      badgeKey: "ladingBadge",
      badgeStyleKey: "ladingBadgeStyle",
      iconKey: "ladingIcon",
    },
    {
      key: "tonnage",
      header: "Tonnage",
      type: "text",
      width: "w-[120px]",
      align: "right",
    },
    {
      key: "ladingaanbieder",
      header: "Ladingaanbieder",
      type: "text",
      width: "w-[180px]",
      textColor: "text-rdj-text-brand",
      hoverContentKey: "ladingaanbiederHoverContent",
    },
    {
      key: "vaartuigaanbieder",
      header: "Vaartuigaanbieder",
      type: "text",
      width: "w-[180px]",
      subtextKey: "vaartuigaanbiederSubtext",
      textColor: "text-rdj-text-brand",
      hoverContentKey: "vaartuigaanbiederHoverContent",
    },
    {
      key: "verkoopcondities",
      header: "Verkoopcondities",
      type: "custom",
      width: "w-[160px]",
      render: (row) => <ConditiesCell condities={row._verkoopcondities} />,
    },
    {
      key: "inkoopcondities",
      header: "Inkoopcondities",
      type: "custom",
      width: "w-[160px]",
      render: (row) => <ConditiesCell condities={row._inkoopcondities} />,
    },
    {
      key: "laden",
      header: "Laden",
      type: "text",
      width: "w-[180px]",
      subtextKey: "ladenDate",
    },
    {
      key: "lossen",
      header: "Lossen",
      type: "text",
      width: "w-[180px]",
      subtextKey: "lossenDate",
    },
    {
      key: "deadline",
      header: "Deadline",
      type: "text",
      width: "w-[140px]",
    },
    {
      key: "status",
      header: "Status",
      type: "status",
      width: "w-[160px]",
      variantKey: "statusVariant",
      iconKey: "statusIcon",
      typeKey: "statusType",
      defaultVariant: "grey" as const,
    },
    {
      key: "updateUser",
      header: "Laatste update",
      type: "text",
      width: "w-[180px]",
      subtextKey: "updateDate",
      avatarSrcKey: "updateUserAvatar",
      avatarInitialsKey: "updateUserInitials",
    },
  ];

  /* ── Map rows ── */
  const rows = currentData.map((item) => ({
    id: item.id,
    lading: item.ladingLabel,
    ladingSubtext: item.ladingSubtext || undefined,
    ladingBadge: item.ladingBadge,
    ladingBadgeStyle: item.ladingBadge === "Bemiddeling" ? { backgroundColor: '#EFF8FF', color: '#175CD3', borderColor: '#B2DDFF' } : undefined,
    ladingIcon: item.ladingIcon,
    tonnage: item.tonnage,
    ladingaanbieder: item.ladingaanbieder,
    ladingaanbiederHoverContent: buildRelatieHoverContent(item.ladingaanbieder),
    vaartuigaanbieder: item.vaartuigaanbieder,
    vaartuigaanbiederSubtext: item.vaartuigaanbiederSubtext,
    vaartuigaanbiederHoverContent: item.vaartuigaanbieder !== "—" ? buildRelatieHoverContent(item.vaartuigaanbieder) : undefined,
    // Store condities objects for custom render
    _inkoopcondities: item.inkoopcondities,
    _verkoopcondities: item.verkoopcondities,
    inkoopcondities: item.inkoopcondities ? `€ ${item.inkoopcondities.prijs.toFixed(2).replace(".", ",")} /t` : "—",
    verkoopcondities: item.verkoopcondities ? `€ ${item.verkoopcondities.prijs.toFixed(2).replace(".", ",")} /t` : "—",
    laden: item.laadLocatie,
    ladenDate: item.laadDatum,
    lossen: item.losLocatie,
    lossenDate: item.losDatum,
    deadline: item.deadline,
    status: item.status,
    statusVariant: statusVariantMap[item.status],
    statusIcon: statusIconMap[item.status],
    statusType: statusTypeMap[item.status],
    updateUser: "",
    updateDate: item.updateDate,
    updateUserAvatar: item.updateUserAvatar,
    updateUserInitials: item.updateUserInitials,
    bron: item.bron,
  }));

  const { sortedColumns, sortedData } = useTableSort(columns, rows);

  return (
    <div className="flex min-h-screen bg-rdj-bg-primary">
      <Sidebar />

      <div className="flex-1 overflow-auto pt-[24px]">
        <PageHeader
          title="Onderhandelingen"
          actions={
            <Button
              variant="primary"
              label="Toevoegen"
              leadingIcon={PlusIcon}
            />
          }
          filtersLeft={
            <>
              <StatusFilterDropdown
                value={statusFilter}
                onSelect={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              />
              <SegmentedButtonGroup
                items={[
                  { value: "alles", label: "Alles" },
                  { value: "eigen", label: "Eigen" },
                  { value: "markt", label: "Markt" },
                ]}
                value={sourceFilter}
                onChange={(val) => {
                  setSourceFilter(val);
                  setCurrentPage(1);
                }}
              />
              <FilterDropdown
                label="Jan 1, 2026 &#8211; Jan 31, 2026"
                leadingIcon={
                  <div className="absolute inset-[8.33%_12.5%]">
                    <div className="absolute inset-[-5%_-5.56%]">
                      <svg
                        className="block size-full"
                        fill="none"
                        preserveAspectRatio="none"
                        viewBox="0 0 18.3333 20"
                      >
                        <path
                          d={svgPaths.p16594900}
                          stroke="#344054"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.66667"
                        />
                      </svg>
                    </div>
                  </div>
                }
              />
              <FilterDropdown label="Laadregio" />
              <button className="content-stretch flex gap-[4px] items-center relative shrink-0">
                <div className="overflow-clip relative shrink-0 size-[20px]">
                  <div className="absolute inset-[20.83%]">
                    <div className="absolute inset-[-7.14%]">
                      <svg
                        className="block size-full"
                        fill="none"
                        preserveAspectRatio="none"
                        viewBox="0 0 13.3333 13.3333"
                      >
                        <path
                          d={svgPaths.p1b67fa00}
                          stroke="#1567A4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.66667"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#145990] text-[14px] whitespace-nowrap">
                  Filter
                </p>
              </button>
            </>
          }
          filtersRight={
            <>
              <p className="font-sans font-normal leading-[20px] text-[#344054] text-[14px]">
                Groeperen op regio
              </p>
              <div className="bg-white h-[40px] relative rounded-[6px] shrink-0 max-w-[320px] w-full">
                <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                  <div className="content-stretch flex items-center px-[14px] py-[8px] relative size-full">
                    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative">
                      <div className="overflow-clip relative shrink-0 size-[20px]">
                        <div className="absolute inset-[12.5%]">
                          <div className="absolute inset-[-5.56%]">
                            <svg
                              className="block size-full"
                              fill="none"
                              preserveAspectRatio="none"
                              viewBox="0 0 16.6667 16.6667"
                            >
                              <path
                                d={svgPaths.p3190da80}
                                stroke="#667085"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.66667"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Zoeken"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="flex-[1_0_0] font-sans font-normal h-[18px] leading-[20px] min-h-px min-w-px overflow-hidden text-[#667085] text-[14px] text-ellipsis text-left whitespace-nowrap outline-none border-0 bg-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
                />
              </div>
            </>
          }
        />

        {/* Table area */}
        <div>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />

          <Table
            columns={sortedColumns}
            data={sortedData}
            hoveredRowId={hoveredRow}
            activeRowId={selectedNegotiation?.id ?? null}
            onRowHover={setHoveredRow}
            onRowClick={(row) => {
              const bron = row.bron as string;
              const relatie = bron === "eigen" ? row.vaartuigaanbieder as string : row.ladingaanbieder as string;
              setSelectedNegotiation({ id: row.id, status: row.status as string, bron, relatieName: relatie, ladingaanbieder: row.ladingaanbieder as string, vaartuigaanbieder: row.vaartuigaanbieder as string });
            }}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>

      {/* Negotiation Sidepanel */}
      {selectedNegotiation && (
        <OnderhandelingSidepanel
          negotiationId={selectedNegotiation.id}
          status={selectedNegotiation.status as "Via werklijst" | "Bod verstuurd" | "Bod ontvangen" | "Goedgekeurd" | "Afgewezen"}
          bron={selectedNegotiation.bron as "eigen" | "markt"}
          soort="lading"
          relatieName={selectedNegotiation.relatieName}
          onClose={() => setSelectedNegotiation(null)}
          onStatusChange={handleStatusChange}
        />
      )}
      <Toaster position="top-right" richColors />
    </div>
  );
}
