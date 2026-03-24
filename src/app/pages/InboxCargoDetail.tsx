import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Send, MailOpen, Check, X } from "lucide-react";
import { toast, Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import type { PageTab } from "../components/PageHeader";
import Badge from "../components/Badge";
import Table from "../components/Table";
import type { Column, RowData } from "../components/Table";
import Pagination from "../components/Pagination";
import Button from "../components/Button";
import LadingMarktSidebar from "../components/LadingMarktSidebar";
import StartNegotiationSidebar from "../components/StartNegotiationSidebar";
import OnderhandelingSidepanel from "../components/OnderhandelingSidepanel";
import ConversationDialog from "../components/ConversationDialog";
import BrokerDialog from "../components/BrokerDialog";
import ActivityFeed from "../components/ActivityFeed";
import SectionHeader from "../components/SectionHeader";
import { useInboxLadingSummary } from "../data/useDetailData";
import { mockNegotiations } from "../data/mock-data";
import { mockRelaties } from "../data/mock-relatie-data";
import imgAvatar from "../../assets/a2737d3b5b234fc04041650cb9f114889c6859da.png";
import imgAvatar1 from "../../assets/3627de284acb374a4d9313b3c2dbaeeb87a48224.png";
import imgAvatar2 from "../../assets/e7809035038b3816de2a1d67c5de86ebeed325d0.png";
import imgAvatar3 from "../../assets/bf485cb6f98c12534c69bc81459ce34f2e24e4a8.png";
import imgAvatar4 from "../../assets/9e45f45f537bea4bf653bc0307471e5ff5545f63.png";

/* ── Inbox status mapping: marktaanbod uses In onderhandeling / Geaccepteerd / Geweigerd ── */
function toInboxStatus(raw: string): string {
  if (raw === "Via werklijst" || raw === "Bod verstuurd" || raw === "Bod ontvangen") return "In onderhandeling";
  if (raw === "Goedgekeurd") return "Geaccepteerd";
  if (raw === "Afgewezen" || raw === "Afgekeurd") return "Geweigerd";
  return raw;
}

const negotiationStatusVariantMap: Record<string, string> = {
  "In onderhandeling": "brand",
  "Geaccepteerd": "success",
  "Geweigerd": "error",
};

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

export default function InboxCargoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTabRaw] = useState<'matches' | 'onderhandelingen' | 'activiteit'>('matches');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [offeredMatches, setOfferedMatches] = useState<Set<string>>(new Set());
  const [selectedNegotiation, setSelectedNegotiation] = useState<{ id: string; status: string; bron: string; relatieName?: string } | null>(null);
  const setActiveTab = (tab: typeof activeTab) => { setActiveTabRaw(tab); setSelectedNegotiation(null); };
  const [conversationDialog, setConversationDialog] = useState<{ relatieId: string; relatieName: string; matchName?: string; itemType?: "lading" | "vaartuig" | "relatie-vaartuig" | "relatie-lading"; rightName?: string } | null>(null);
  const [brokerDialog, setBrokerDialog] = useState<{ relatieA: { id: string; name: string }; vesselName: string; vesselSubtitle: string; relatieB: { id: string; name: string }; cargoName: string; cargoSubtitle: string } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [matchFilter, setMatchFilter] = useState("Alles");
  const [negFilter, setNegFilter] = useState("Actief");
  const [activityFilter, setActivityFilter] = useState("Alle activiteit");
  const { data: summary, loading: summaryLoading } = useInboxLadingSummary(id);
  const avatars = [imgAvatar, imgAvatar1, imgAvatar2, imgAvatar3, imgAvatar4];

  /* Pagination state per tab */
  const [matchPage, setMatchPage] = useState(1);
  const [matchRowsPerPage, setMatchRowsPerPage] = useState(50);
  const [negPage, setNegPage] = useState(1);
  const [negRowsPerPage, setNegRowsPerPage] = useState(50);

  useEffect(() => {
    const stored = localStorage.getItem(`offered-matches-${id}`);
    if (stored) setOfferedMatches(new Set(JSON.parse(stored)));
  }, [id]);

  // Table columns for vessel matches
  const matchColumns: Column[] = [
    { key: "name", header: "Naam", type: "leading-text", subtextKey: "subtype", badgeKey: "sourceBadge", actionLabel: "Onderhandeling", actionCompletedKey: "actionCompletedLabel" },
    { key: "company", header: "Relatie", type: "text", subtextKey: "contact", textColor: "text-rdj-text-brand", width: "w-[180px]", onClickKey: "onRelatieClick" },
    { key: "location", header: "Locatie", type: "text", subtextKey: "locationDate", width: "w-[200px]" },
    { key: "capacity", header: "Groottonnage", type: "text", width: "w-[140px]" },
    { key: "content", header: "Inhoud", type: "text", width: "w-[100px]" },
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

  // Mock match data — eigen vaartuigen + markt vaartuigen
  const matchRows: RowData[] = [
    { id: "1", name: "Antonia V", subtype: "Motorschip · 4.200 mt", isEigen: true, company: "—", contact: "", location: "Rotterdam", locationDate: "Vanaf Vr 14 Mrt, 2026", capacity: "4.200 mt", content: "5.200 m³", matchPct: 95, matchStatus: "openstaand" },
    { id: "2", name: "Emily", subtype: "Motorschip", isEigen: false, company: "Provaart Logistics BV", contact: "Jan de Vries", location: "Waalhaven", locationDate: "Vanaf Wo 12 Mrt, 2026", capacity: "3.000 mt", content: "3.800 m³", matchPct: 90, matchStatus: offeredMatches.has("2") ? "aangeboden" : "openstaand", onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === "Provaart Logistics BV"); if (rel) navigate(`/crm/relatie/${rel.id}`); } },
    { id: "3", name: "Duwbak Alfa-1", subtype: "Duwbak · 2.000 mt", isEigen: true, company: "—", contact: "", location: "Dordrecht", locationDate: "Vanaf Di 1 Apr, 2026", capacity: "2.000 mt", content: "2.400 m³", matchPct: 82, matchStatus: "openstaand" },
    { id: "4", name: "S.S. Anna", subtype: "Motorschip", isEigen: false, company: "Janlow B.V.", contact: "Pieter Jansen", location: "Bremerhaven", locationDate: "Vanaf Vr 14 Mrt, 2026", capacity: "2.500 mt", content: "3.000 m³", matchPct: 78, matchStatus: offeredMatches.has("4") ? "aangeboden" : "openstaand", onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === "Janlow B.V."); if (rel) navigate(`/crm/relatie/${rel.id}`); } },
  ].map(row => ({ ...row, sourceBadge: row.isEigen ? undefined : "Markt" }));

  const handleMatchClick = (row: RowData) => {
    setSelectedMatch({ id: row.id, name: row.name as string, company: row.company as string, contact: row.contact as string, location: row.location as string, locationDate: row.locationDate as string, capacity: row.capacity as string, content: row.content as string, matchPercentage: `${row.matchPct}%` });
  };

  const handleArchive = () => {
    toast.success("Lading gearchiveerd", { description: "De lading is verwijderd uit de inbox.", duration: 3000 });
    navigate("/markt/inbox/ladingen");
  };


  /* ── Tabs ── */
  const tabs: PageTab[] = [
    { label: 'Matches', path: '#matches', isActive: activeTab === 'matches', badge: String(matchRows.length) },
    { label: 'Onderhandelingen', path: '#onderhandelingen', isActive: activeTab === 'onderhandelingen', badge: String(mockNegotiations.length) },
    { label: 'Activiteit', path: '#activiteit', isActive: activeTab === 'activiteit' },
  ];

  /* ── Negotiations table ── */
  const negColumns: Column[] = [
    { key: 'freightPrice', header: 'Vrachtprijs', type: 'leading-text', actionLabel: 'Openen', subtextKey: 'freightPriceDiff', subtextColorKey: 'freightPriceDiffColor', subtextTooltipKey: 'freightPriceDiffTooltip' },
    { key: 'tonnage', header: 'Tonnage', type: 'text', align: 'right', width: 'w-[120px]' },
    { key: 'deadline', header: 'Deadline', type: 'deadline', expiredKey: 'deadlineExpired', editable: true, width: 'w-[160px]' },
    { key: 'status', header: 'Status', type: 'status', variantKey: 'statusVariant', iconKey: 'statusIcon', typeKey: 'statusType', width: 'w-[160px]' },
    { key: 'contactName', header: 'Laatste update', type: 'text', subtextKey: 'contactDate', avatarSrcKey: 'contactAvatar', width: 'w-[200px]' },
  ];

  const negTableData: RowData[] = mockNegotiations.map((neg, idx) => ({
    id: neg.id,
    company: neg.company,
    freightPrice: neg.freightPrice || '—',
    freightPriceDiff: neg.freightPriceDiff || '',
    freightPriceDiffColor: neg.freightPriceDiff?.startsWith('+') ? '#F79009' : undefined,
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
  }));

  const activeNegStatuses = ["In onderhandeling"];

  const filteredMatchRows = matchFilter === "Alles"
    ? matchRows.map((row) => row.matchStatus === "aangeboden"
        ? { ...row, _muted: true, actionCompletedLabel: 'Aangeboden' }
        : row)
    : matchFilter === "Aangeboden"
      ? matchRows.filter((row) => row.matchStatus === "aangeboden")
      : matchRows.filter((row) => row.matchStatus !== "aangeboden");

  const filteredNegData = negFilter === "Alles"
    ? negTableData
    : negFilter === "Actief"
      ? negTableData.filter((row) => activeNegStatuses.includes(row.status as string))
      : negFilter === "Geaccepteerd"
        ? negTableData.filter((row) => row.status === "Geaccepteerd")
        : negTableData.filter((row) => row.status === "Geweigerd");

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="flex min-h-screen bg-white">
        <Sidebar />

        <div className="flex-1 overflow-auto flex">
          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-[8px] px-[24px] pt-[24px] pb-[20px] border-b border-rdj-border-secondary">
              <button onClick={() => navigate("/markt/inbox/ladingen")} className="flex items-center justify-center p-[4px] rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
                <p className="font-sans font-bold leading-[20px] text-rdj-text-secondary text-[14px] whitespace-nowrap">Markt</p>
              </button>
              <BreadcrumbChevron />
              <button onClick={() => navigate("/markt/inbox/ladingen")} className="flex items-center justify-center px-[8px] py-[4px] rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
                <p className="font-sans font-bold leading-[20px] text-rdj-text-secondary text-[14px] whitespace-nowrap">Markt aanbod</p>
              </button>
              <BreadcrumbChevron />
              <div className="bg-rdj-bg-secondary flex items-center justify-center px-[8px] py-[4px] rounded-[6px] shrink-0">
                <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] whitespace-nowrap">
                  {summaryLoading ? "..." : (summary?.breadcrumbLabel || id)}
                </p>
              </div>
            </div>

            {/* Page content with max width */}
            <div className="flex flex-col items-center size-full">
              <div className="flex flex-col items-center py-[24px] w-full">
                <div className="flex flex-col gap-[0px] items-start max-w-[1116px] pt-[24px] w-full">
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
                        <Pagination
                          currentPage={matchPage}
                          totalItems={filteredMatchRows.length}
                          rowsPerPage={matchRowsPerPage}
                          onPageChange={setMatchPage}
                          onRowsPerPageChange={setMatchRowsPerPage}
                        />
                        <Table
                          columns={matchColumns}
                          data={filteredMatchRows}
                          hoveredRowId={hoveredRow}
                          onRowHover={setHoveredRow}
                          onRowAction={(row) => {
                            if (row.isEigen) {
                              // Eigen vaartuig: open conversation with the lading owner
                              setConversationDialog({
                                relatieId: summary?.relatieId || "",
                                relatieName: summary?.relatieName || "Onbekend",
                                matchName: summary?.title,
                                itemType: "relatie-lading",
                                rightName: row.name as string,
                              });
                            } else {
                              // Markt vaartuig: open broker dialog (two relaties)
                              const relatieA = mockRelaties.find(r => r.naam === row.company);
                              setBrokerDialog({
                                relatieA: { id: relatieA?.id || "", name: (row.company as string) || "Onbekend" },
                                vesselName: row.name as string,
                                vesselSubtitle: (row.subtype as string) || "",
                                relatieB: { id: summary?.relatieId || "", name: summary?.relatieName || "Onbekend" },
                                cargoName: summary?.title || "—",
                                cargoSubtitle: summary?.subtitle || "",
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
                        <Pagination
                          currentPage={negPage}
                          totalItems={filteredNegData.length}
                          rowsPerPage={negRowsPerPage}
                          onPageChange={setNegPage}
                          onRowsPerPageChange={setNegRowsPerPage}
                        />
                        <Table
                          columns={negColumns}
                          data={filteredNegData}
                          hoveredRowId={hoveredRow}
                          onRowHover={setHoveredRow}
                          activeRowId={selectedNegotiation?.id ?? null}
                          onRowClick={(row) => setSelectedNegotiation({ id: row.id, status: row.status as string, bron: "markt", relatieName: summary?.relatieName })}
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

          {/* Right sidebar */}
          <LadingMarktSidebar id={id!} />
        </div>
      </div>

      {/* Start Negotiation Sidebar */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/20">
          <StartNegotiationSidebar match={selectedMatch} onClose={() => setSelectedMatch(null)} offeredMatches={offeredMatches} setOfferedMatches={setOfferedMatches} />
        </div>
      )}

      {/* Negotiation Sidebar */}
      {selectedNegotiation && (
        <OnderhandelingSidepanel
          negotiationId={selectedNegotiation.id}
          status={selectedNegotiation.status as any}
          bron={selectedNegotiation.bron as any}
          soort="lading"
          relatieName={selectedNegotiation.relatieName}
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
