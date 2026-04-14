import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Send, MailOpen, Check, X, PanelRight } from "lucide-react";
import { toast, Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import type { PageTab } from "../components/PageHeader";
import Table from "../components/Table";
import type { Column, RowData } from "../components/Table";
import Pagination from "../components/Pagination";
import useTableSort from "../components/useTableSort";
import Button from "../components/Button";
import VaartuigMarktSidebar from "../components/VaartuigMarktSidebar";
import OnderhandelingSidepanel from "../components/OnderhandelingSidepanel";
import ConversationDialog from "../components/ConversationDialog";
import BrokerDialog from "../components/BrokerDialog";
import ActivityFeed from "../components/ActivityFeed";
import SectionHeader from "../components/SectionHeader";
import LastActivityButton from "../components/LastActivityButton";
import { useInboxVaartuigSummary } from "../data/useDetailData";
import { mockRelaties } from "../data/mock-relatie-data";
import svgPaths from "../../imports/svg-62fj7rjvas";
import imgAvatar from "../../assets/a2737d3b5b234fc04041650cb9f114889c6859da.png";
import imgAvatar1 from "../../assets/3627de284acb374a4d9313b3c2dbaeeb87a48224.png";
import imgAvatar2 from "../../assets/e7809035038b3816de2a1d67c5de86ebeed325d0.png";
import imgAvatar3 from "../../assets/bf485cb6f98c12534c69bc81459ce34f2e24e4a8.png";
import imgAvatar4 from "../../assets/9e45f45f537bea4bf653bc0307471e5ff5545f63.png";

/* ── Status variant map ── */
const negotiationStatusVariantMap: Record<string, string> = {
  "In onderhandeling": "brand",
  "Geaccepteerd": "success",
  "Geweigerd": "error",
};

/* ── Inbox status mapping ── */
function toInboxStatus(raw: string): string {
  if (raw === "Via werklijst" || raw === "In onderhandeling") return "In onderhandeling";
  if (raw === "Goedgekeurd") return "Geaccepteerd";
  if (raw === "Afgewezen" || raw === "Afgekeurd") return "Geweigerd";
  return raw;
}

const negotiationStatusIconMap: Record<string, React.ReactNode | null> = {
  "In onderhandeling": <Send strokeWidth={2.5} />,
  "Geaccepteerd": <Check strokeWidth={2.5} />,
  "Geweigerd": <X strokeWidth={2.5} />,
};

const negotiationStatusTypeMap: Record<string, "default" | "color"> = {
  "In onderhandeling": "color",
  "Geaccepteerd": "color",
  "Geweigerd": "color",
};

/* ── Match percentage donut ── */
function MatchDonut({ percentage, color }: { percentage: number; color: string }) {
  const r = 6;
  const circ = 2 * Math.PI * r;
  const filled = (percentage / 100) * circ;
  return (
    <svg className="block size-[16px]" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r={r} stroke="#EAECF0" strokeWidth="2.5" fill="none" />
      <circle cx="8" cy="8" r={r} stroke={color} strokeWidth="2.5" fill="none"
        strokeDasharray={`${filled} ${circ - filled}`} strokeDashoffset={circ * 0.25} strokeLinecap="round" />
    </svg>
  );
}

function getMatchColor(pct: number): string {
  if (pct >= 80) return "#17B26A";
  if (pct >= 60) return "#F79009";
  return "#D92D20";
}

/* ── Breadcrumb chevron ── */
function BreadcrumbChevron() {
  return (
    <svg className="block size-[16px]" fill="none" viewBox="0 0 16 16">
      <path d="M6 4L10 8L6 12" stroke="#D0D5DD" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" />
    </svg>
  );
}

/* ── Source icons ── */
const automatischeFeedIcon = (
  <svg fill="none" viewBox="0 0 14.6667 12.0001">
    <path d={svgPaths.p29cbab00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
  </svg>
);

const planningIcon = (
  <svg fill="none" viewBox="0 0 18.0002 22">
    <path d={svgPaths.p20684dc0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

function getSourceIconForCargo(isEigen: boolean) {
  return isEigen ? planningIcon : automatischeFeedIcon;
}

function getSourceVariantForCargo(isEigen: boolean): 'grey' | 'brand' {
  return isEigen ? 'brand' : 'grey';
}

export default function InboxVesselDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTabRaw] = useState<'matches' | 'onderhandelingen' | 'activiteit'>('onderhandelingen');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedNegotiation, setSelectedNegotiation] = useState<{ id: string; status: string; bron: string; relatieName?: string; bemiddeling?: { inkoopRelatie: string; verkoopRelatie: string } } | null>(null);
  const setActiveTab = (tab: typeof activeTab) => { setActiveTabRaw(tab); setSelectedNegotiation(null); };
  const [conversationDialog, setConversationDialog] = useState<{ relatieId: string; relatieName: string; matchName?: string; itemType?: "lading" | "vaartuig" | "relatie-vaartuig" | "relatie-lading"; rightName?: string } | null>(null);
  const [brokerDialog, setBrokerDialog] = useState<{ relatieA: { id: string; name: string }; vesselName: string; vesselSubtitle: string; relatieB: { id: string; name: string }; cargoName: string; cargoSubtitle: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [matchFilter, setMatchFilter] = useState("Alles");
  const [negFilter, setNegFilter] = useState("Actief");
  const [activityFilter, setActivityFilter] = useState("Alle activiteit");
  const { data: summary, loading: summaryLoading } = useInboxVaartuigSummary(id);
  const avatars = [imgAvatar, imgAvatar1, imgAvatar2, imgAvatar3, imgAvatar4];

  /* Pagination state per tab */
  const [matchPage, setMatchPage] = useState(1);
  const [matchRowsPerPage, setMatchRowsPerPage] = useState(50);
  const [negPage, setNegPage] = useState(1);
  const [negRowsPerPage, setNegRowsPerPage] = useState(50);

  const handleArchive = () => {
    toast.success("Vaartuig gearchiveerd", { description: "Het vaartuig is verwijderd uit de inbox.", duration: 3000 });
    navigate("/markt/inbox/vaartuigen");
  };

  // Table columns for cargo matches (ladingen die passen bij dit vaartuig)
  const matchColumns: Column[] = [
    { key: "lading", header: "Lading", type: "leading-text", subtextKey: "ladingSubtext", maxWidth: "max-w-[480px]", badgeKey: "sourceBadge", actionLabel: "Onderhandeling", actionCompletedKey: "actionCompletedLabel" },
    { key: "tonnage", header: "Tonnage", type: "text", width: "w-[120px]", align: "right" },
    { key: "relatie", header: "Relatie", type: "text", subtextKey: "relatieContact", textColor: "text-rdj-text-brand", width: "w-[180px]", onClickKey: "onRelatieClick" },
    { key: "laden", header: "Laden", type: "text", subtextKey: "ladenDatum", width: "w-[140px]" },
    { key: "lossen", header: "Lossen", type: "text", subtextKey: "lossenDatum", width: "w-[140px]" },
    { key: "source", header: "Bron", type: "text", subtextKey: "sourceDate", featuredIconKey: "sourceIcon", featuredIconVariantKey: "sourceIconVariant", width: "w-[180px]" },
    {
      key: "matchPct", header: "Match", type: "custom", width: "w-[80px]",
      sortActive: true, sortDirection: "desc",
      render: (row: RowData) => {
        const pct = row.matchPct as number;
        const color = getMatchColor(pct);
        return (
          <div className="flex items-center justify-end gap-[6px]">
            <MatchDonut percentage={pct} color={color} />
            <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">{pct}%</p>
          </div>
        );
      },
    },
  ];

  // Mock match data — eigen ladingen + markt ladingen
  const matchRows: RowData[] = [
    { id: "1", lading: "Graan Rotterdam Q1", ladingSubtext: "3.500 ton Graan", isEigen: true, tonnage: "3.500 ton", relatie: "—", relatieContact: "", laden: "Rotterdam", ladenDatum: "Ma 17 Mrt 2026", lossen: "Krefeld", lossenDatum: "Do 20 Mrt 2026", matchPct: 92, matchStatus: "openstaand" },
    { id: "2", lading: "Houtpellets Salzgitter", ladingSubtext: "2.000 ton Houtpellets (DSIT)", isEigen: true, tonnage: "2.000 ton", relatie: "—", relatieContact: "", laden: "Salzgitter Stichkanal", ladenDatum: "Vr 14 Mrt 2026", lossen: "Hamburg Veddelkanal", lossenDatum: "Di 18 Mrt 2026", matchPct: 90, matchStatus: "aangeboden" },
    { id: "3", lading: "Staal", ladingSubtext: "3.000 ton", isEigen: false, tonnage: "3.000 ton", relatie: "Janlow B.V.", relatieContact: "Pieter Jansen", laden: "Dordrecht", ladenDatum: "Za 15 Mrt 2026", lossen: "Antwerpen", lossenDatum: "Ma 17 Mrt 2026", matchPct: 75, matchStatus: "openstaand", onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === "Janlow B.V."); if (rel) navigate(`/crm/relatie/${rel.id}`); } },
    { id: "4", lading: "Sojabonen Botlek", ladingSubtext: "3.500 ton Sojabonen", isEigen: true, tonnage: "3.500 ton", relatie: "—", relatieContact: "", laden: "Rotterdam Botlek", ladenDatum: "Zo 16 Mrt 2026", lossen: "Basel", lossenDatum: "Do 20 Mrt 2026", matchPct: 70, matchStatus: "openstaand" },
    { id: "5", lading: "Sojabonen", ladingSubtext: "3.500 ton", isEigen: false, tonnage: "3.500 ton", relatie: "Cargill N.V.", relatieContact: "Sophie van Dam", laden: "Rotterdam Botlek", ladenDatum: "Zo 16 Mrt 2026", lossen: "Basel", lossenDatum: "Do 20 Mrt 2026", matchPct: 60, matchStatus: "openstaand", onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === "Cargill N.V."); if (rel) navigate(`/crm/relatie/${rel.id}`); } },
  ].map(row => ({
    ...row,
    sourceBadge: row.isEigen ? undefined : "Markt",
    source: row.isEigen ? "Laadplanning" : "Automatische feed",
    sourceDate: row.isEigen ? "Do 6 Mrt 08:00" : "Do 6 Mrt 12:44",
    sourceIcon: getSourceIconForCargo(row.isEigen as boolean),
    sourceIconVariant: getSourceVariantForCargo(row.isEigen as boolean),
  }));

  /* ── Vessel-specific negotiations with cargo info ── */
  const vesselNegotiations = [
    { id: 'N001', aanbod: 'Houtpellets Salzgitter', aanbodSubtext: '2.000 ton Houtpellets', bron: 'eigen' as const, company: 'Provaart Logistics BV', freightPrice: '€3,50/ton', freightPriceDiff: '+12,5%', tonnage: '2.000 ton', deadline: 'Za 14 Mrt, 16:00', deadlineExpired: true, status: 'In onderhandeling', contact: { name: 'Eric Nieuwkoop', date: 'Ma 9 Mrt 07:28' } },
    { id: 'N002', aanbod: 'Staal Dordrecht', aanbodSubtext: '3.000 ton Staal', bron: 'markt' as const, company: 'Janlow B.V.', ladingRelatie: 'Janlow B.V.', freightPrice: '€3,00/ton', freightPriceDiff: '-3,2%', tonnage: '3.000 ton', deadline: 'Morgen, 9:00', deadlineExpired: true, status: 'In onderhandeling', contact: { name: 'Pelger de Jong', date: 'Di 10 Mrt 19:53' }, bemiddeling: { inkoopRelatie: 'Janlow B.V.', verkoopRelatie: 'Provaart Logistics BV' } as const },
    { id: 'N003', aanbod: 'Grind Amsterdam', aanbodSubtext: '1.200 ton Grind', bron: 'eigen' as const, company: 'Rederij Alfa', freightPrice: '€2,80/ton', freightPriceDiff: '-9,7%', tonnage: '1.200 ton', deadline: 'Morgen, 10:00', status: 'In onderhandeling', contact: { name: 'Khoa Nguyen', date: 'Zo 8 Mrt 01:31' } },
    { id: 'N004', aanbod: 'Sojabonen Rotterdam', aanbodSubtext: '3.500 ton Sojabonen', bron: 'markt' as const, company: 'Cargill N.V.', ladingRelatie: 'Cargill N.V.', freightPrice: '€3,00/ton', freightPriceDiff: '0,0%', tonnage: '3.500 ton', deadline: 'Morgen, 11:00', status: 'In onderhandeling', contact: { name: 'Eric Nieuwkoop', date: 'Za 7 Mrt 18:39' } },
    { id: 'N005', aanbod: 'Kunstmest Terneuzen', aanbodSubtext: '2.500 ton Kunstmest', bron: 'eigen' as const, company: 'Cargill N.V.', freightPrice: '€3,25/ton', freightPriceDiff: '+4,8%', tonnage: '2.500 ton', deadline: 'Do 19 Mrt, 11:15', status: 'Goedgekeurd', contact: { name: 'Pelger de Jong', date: 'Vr 6 Mrt 11:47' } },
  ];

  /* ── Tabs ── */
  const tabs: PageTab[] = [
    { label: 'Onderhandelingen', path: '#onderhandelingen', isActive: activeTab === 'onderhandelingen', badge: String(vesselNegotiations.length) },
    { label: 'Matches', path: '#matches', isActive: activeTab === 'matches', badge: String(matchRows.length) },
    { label: 'Activiteit', path: '#activiteit', isActive: activeTab === 'activiteit' },
  ];

  /* ── Negotiations table ── */
  const negColumns: Column[] = [
    { key: 'aanbod', header: 'Aanbod', type: 'leading-text', actionLabel: 'Openen', subtextKey: 'aanbodSubtext', badgeKey: 'aanbodBadge', badgeStyleKey: 'aanbodBadgeStyle' },
    { key: 'freightPrice', header: 'Vrachtprijs', type: 'text', subtextKey: 'freightPriceDiff', subtextColorKey: 'freightPriceDiffColor', subtextTooltipKey: 'freightPriceDiffTooltip', width: 'w-[140px]' },
    { key: 'tonnage', header: 'Tonnage', type: 'text', align: 'right', width: 'w-[120px]' },
    { key: 'deadline', header: 'Deadline', type: 'deadline', expiredKey: 'deadlineExpired', editable: true, width: 'w-[160px]' },
    { key: 'status', header: 'Status', type: 'status', variantKey: 'statusVariant', iconKey: 'statusIcon', typeKey: 'statusType', width: 'w-[160px]' },
    { key: 'contactName', header: 'Laatste update', type: 'text', subtextKey: 'contactDate', avatarSrcKey: 'contactAvatar', width: 'w-[200px]' },
  ];

  const negTableData: RowData[] = vesselNegotiations.map((neg, idx) => ({
    id: neg.id,
    aanbod: neg.aanbod,
    aanbodSubtext: ('bemiddeling' in neg && neg.bemiddeling) ? (
      <>{neg.aanbodSubtext} · Bemiddeling met {neg.bemiddeling.verkoopRelatie}</>
    ) : neg.bron === 'markt' && neg.ladingRelatie ? (
      <>{neg.aanbodSubtext} · <span
        className="text-rdj-text-brand cursor-pointer hover:underline"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          const rel = mockRelaties.find(r => r.naam === neg.ladingRelatie);
          if (rel) navigate(`/crm/relatie/${rel.id}`);
        }}
      >{neg.ladingRelatie}</span></>
    ) : neg.aanbodSubtext,
    aanbodBadge: ('bemiddeling' in neg && neg.bemiddeling) ? 'Bemiddeling' : neg.bron === 'markt' ? 'Marktlading' : undefined,
    aanbodBadgeStyle: ('bemiddeling' in neg && neg.bemiddeling) ? { backgroundColor: '#EFF8FF', color: '#175CD3', borderColor: '#B2DDFF' } : undefined,
    company: neg.company,
    bron: neg.bron,
    freightPrice: neg.freightPrice || '—',
    freightPriceDiff: neg.freightPriceDiff || '',
    freightPriceDiffColor: neg.freightPriceDiff?.startsWith('+') ? '#F79009' : neg.freightPriceDiff?.startsWith('-') ? '#17B26A' : undefined,
    freightPriceDiffTooltip: neg.freightPriceDiff && neg.freightPriceDiff !== '' && neg.freightPriceDiff !== '0,0%' && neg.freightPriceDiff !== '+0,0%' ? 'Vergeleken met verkoop' : undefined,
    tonnage: neg.tonnage,
    deadline: neg.deadline,
    deadlineExpired: neg.deadlineExpired,
    status: toInboxStatus(neg.status),
    statusVariant: negotiationStatusVariantMap[toInboxStatus(neg.status)] || 'grey',
    statusIcon: negotiationStatusIconMap[toInboxStatus(neg.status)] || null,
    statusType: negotiationStatusTypeMap[toInboxStatus(neg.status)] || 'default',
    contactName: neg.contact.name,
    contactDate: neg.contact.date,
    contactAvatar: avatars[idx % avatars.length],
    bemiddelingBadge: ('bemiddeling' in neg && neg.bemiddeling) ? 'Bemiddeling' : undefined,
    bemiddelingBadgeStyle: ('bemiddeling' in neg && neg.bemiddeling) ? { backgroundColor: '#EFF8FF', color: '#175CD3', borderColor: '#B2DDFF' } : undefined,
  }));

  const activeNegStatuses = ["In onderhandeling"];

  const filteredMatchRows = matchFilter === "Alles"
    ? matchRows.map((row) => row.matchStatus === 'aangeboden'
        ? { ...row, _muted: true, actionCompletedLabel: 'Aangeboden' }
        : row)
    : matchRows.filter((row) => row.matchStatus === matchFilter.toLowerCase());

  const filteredNegData = negFilter === "Alles"
    ? negTableData
    : negFilter === "Actief"
      ? negTableData.filter((row) => activeNegStatuses.includes(row.status as string))
      : negFilter === "Geaccepteerd"
        ? negTableData.filter((row) => row.status === "Geaccepteerd")
        : negTableData.filter((row) => row.status === "Geweigerd");

  const { sortedData: sortedMatchData, sortedColumns: sortedMatchColumns } = useTableSort(matchColumns, filteredMatchRows);
  const { sortedData: sortedNegData, sortedColumns: sortedNegColumns } = useTableSort(negColumns, filteredNegData);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="flex min-h-screen bg-white">
        <Sidebar data-annotation-id="inboxvesseldetail-navigatie" />

        <div className="flex-1 flex min-h-0 min-w-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-between gap-[8px] px-[24px] pt-[24px] pb-[20px] border-b border-rdj-border-secondary">
            <div className="flex items-center gap-[8px]">
              <button onClick={() => navigate("/markt/inbox/vaartuigen")} className="flex items-center justify-center p-[4px] rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
                <p className="font-sans font-bold leading-[20px] text-rdj-text-secondary text-[14px] whitespace-nowrap">Markt</p>
              </button>
              <BreadcrumbChevron />
              <button onClick={() => navigate("/markt/inbox/vaartuigen")} className="flex items-center justify-center px-[8px] py-[4px] rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
                <p className="font-sans font-bold leading-[20px] text-rdj-text-secondary text-[14px] whitespace-nowrap">Markt aanbod</p>
              </button>
              <BreadcrumbChevron />
              <div className="bg-rdj-bg-secondary flex items-center justify-center px-[8px] py-[4px] rounded-[6px] shrink-0">
                <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] whitespace-nowrap">
                  {summaryLoading ? "..." : (summary?.breadcrumbLabel || id)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-[8px]">
              <LastActivityButton maxAvatars={3} />
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className={`p-[8px] rounded-[8px] transition-colors shrink-0 ${sidebarOpen ? 'bg-rdj-bg-active text-rdj-text-brand' : 'hover:bg-rdj-bg-primary-hover text-rdj-text-secondary'}`}
              >
                <PanelRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-stretch w-full min-h-[calc(100vh-65px)]">
          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            {/* Page content with max width */}
            <div className="flex flex-col items-center size-full">
              <div className="flex flex-col items-center py-[24px] w-full">
                <div className="flex flex-col gap-[0px] items-start pt-[24px] w-full">
                  <PageHeader
                    title={summaryLoading ? "Laden..." : (summary?.title || "—")}
                    subtitle={
                      summaryLoading ? undefined : (
                        <p className="font-sans font-normal leading-[24px] text-rdj-text-secondary text-[16px]">
                          {summary?.subtitle || ""}
                        </p>
                      )
                    }
                    actions={
                      <Button variant="secondary" label="Archiveren" onClick={handleArchive}
                        leadingIcon={<svg fill="none" viewBox="0 0 14 14"><path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" /></svg>}
                      />
                    }
                    tabs={tabs}
                    onTabClick={(tab: PageTab) => {
                      const tabKey = tab.path.replace('#', '') as 'matches' | 'onderhandelingen' | 'activiteit';
                      setActiveTab(tabKey);
                    }}
                  />

                  {/* Tab Content */}
                  <div className="w-full pt-[20px]">
                    {activeTab === 'matches' && (
                      <>
                        <SectionHeader
                          title="Matches"
                          filterLabel={matchFilter}
                          filterOptions={["Alles", "Openstaand", "Aangeboden"]}
                          filterValue={matchFilter}
                          onFilterChange={setMatchFilter}
                        />
                        <Pagination data-annotation-id="inboxvesseldetail-paginering-2"
                          currentPage={matchPage}
                          totalItems={filteredMatchRows.length}
                          rowsPerPage={matchRowsPerPage}
                          onPageChange={setMatchPage}
                          onRowsPerPageChange={setMatchRowsPerPage}
                        />
                        <Table data-annotation-id="inboxvesseldetail-tabel-2"
                          columns={sortedMatchColumns}
                          data={sortedMatchData}
                          hoveredRowId={hoveredRow}
                          onRowHover={setHoveredRow}
                          onRowAction={(row) => {
                            if (row.isEigen) {
                              // Eigen lading: open conversation with the vaartuig owner
                              setConversationDialog({
                                relatieId: summary?.relatieId || "",
                                relatieName: summary?.relatieName || "Onbekend",
                                matchName: summary?.title,
                                itemType: "relatie-vaartuig",
                                rightName: row.lading as string,
                              });
                            } else {
                              // Markt lading: open broker dialog (two relaties)
                              const relatieB = mockRelaties.find(r => r.naam === row.relatie);
                              setBrokerDialog({
                                relatieA: { id: summary?.relatieId || "", name: summary?.relatieName || "Onbekend" },
                                vesselName: summary?.title || "—",
                                vesselSubtitle: summary?.subtitle || "",
                                relatieB: { id: relatieB?.id || "", name: (row.relatie as string) || "Onbekend" },
                                cargoName: row.lading as string,
                                cargoSubtitle: row.ladingSubtext as string || "",
                              });
                            }
                          }}
                        />
                      </>
                    )}

                    {activeTab === 'onderhandelingen' && (
                      <>
                        <SectionHeader
                          title="Onderhandelingen"
                          filterLabel={negFilter}
                          filterOptions={["Alles", "Actief", "Geaccepteerd", "Geweigerd"]}
                          filterValue={negFilter}
                          onFilterChange={setNegFilter}
                          onAdd={() => setConversationDialog({ relatieId: "", relatieName: "" })}
                          addTooltip="Onderhandeling starten"
                          addPrimary
                        />
                        <Pagination data-annotation-id="inboxvesseldetail-paginering"
                          currentPage={negPage}
                          totalItems={filteredNegData.length}
                          rowsPerPage={negRowsPerPage}
                          onPageChange={setNegPage}
                          onRowsPerPageChange={setNegRowsPerPage}
                        />
                        <Table data-annotation-id="inboxvesseldetail-tabel"
                          columns={sortedNegColumns}
                          data={sortedNegData}
                          hoveredRowId={hoveredRow}
                          onRowHover={setHoveredRow}
                          activeRowId={selectedNegotiation?.id ?? null}
                          onRowClick={(row) => {
                            const neg = vesselNegotiations.find(n => n.id === row.id);
                            setSelectedNegotiation({ id: row.id, status: row.status as string, bron: "markt", relatieName: summary?.relatieName, bemiddeling: ('bemiddeling' in (neg || {}) && (neg as any)?.bemiddeling) ? (neg as any).bemiddeling : undefined });
                          }}
                        />
                      </>
                    )}

                    {activeTab === 'activiteit' && (
                      <>
                        <SectionHeader
                          title="Activiteit"
                          filterLabel={activityFilter}
                          filterOptions={["Alle activiteit", "Jouw activiteit"]}
                          filterValue={activityFilter}
                          onFilterChange={setActivityFilter}
                        />
                        <div className="w-full px-[24px]">
                          <ActivityFeed filter={activityFilter === "Jouw activiteit" ? "mine" : "all"} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>
          </div>

          {/* Right sidebar */}
          <VaartuigMarktSidebar id={id!} collapsed={!sidebarOpen} />
        </div>
      </div>

      {/* Negotiation Sidebar */}
      {selectedNegotiation && (
        <OnderhandelingSidepanel
          negotiationId={selectedNegotiation.id}
          status={selectedNegotiation.status as any}
          bron={selectedNegotiation.bron as any}
          soort="vaartuig"
          relatieName={selectedNegotiation.relatieName}
          bemiddeling={selectedNegotiation.bemiddeling}
          onClose={() => setSelectedNegotiation(null)}
        />
      )}

      {/* Conversation dialog */}
      {conversationDialog && (
        <ConversationDialog
          relatieId={conversationDialog.relatieId}
          relatieName={conversationDialog.relatieName}
          preSelectedMatchName={conversationDialog.matchName}
          preSelectedItemType={conversationDialog.itemType}
          preSelectedRightName={conversationDialog.rightName}
          onClose={() => setConversationDialog(null)}
        />
      )}

      {/* Broker dialog (markt-markt matches) */}
      {brokerDialog && (
        <BrokerDialog
          relatieA={brokerDialog.relatieA}
          vesselName={brokerDialog.vesselName}
          vesselSubtitle={brokerDialog.vesselSubtitle}
          relatieB={brokerDialog.relatieB}
          cargoName={brokerDialog.cargoName}
          cargoSubtitle={brokerDialog.cargoSubtitle}
          onClose={() => setBrokerDialog(null)}
        />
      )}
    </>
  );
}
