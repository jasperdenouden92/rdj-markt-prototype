import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Send, MailOpen, Check, X } from "lucide-react";
import { toast, Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import type { PageTab } from "../components/PageHeader";
import Table from "../components/Table";
import type { Column, RowData } from "../components/Table";
import Pagination from "../components/Pagination";
import Button from "../components/Button";
import VaartuigMarktSidebar from "../components/VaartuigMarktSidebar";
import OnderhandelingSidepanel from "../components/OnderhandelingSidepanel";
import ConversationDialog from "../components/ConversationDialog";
import ActivityFeed from "../components/ActivityFeed";
import { useInboxVaartuigSummary } from "../data/useDetailData";
import { mockNegotiations } from "../data/mock-data";
import { mockRelaties } from "../data/mock-relatie-data";
import imgAvatar from "../../assets/a2737d3b5b234fc04041650cb9f114889c6859da.png";
import imgAvatar1 from "../../assets/3627de284acb374a4d9313b3c2dbaeeb87a48224.png";
import imgAvatar2 from "../../assets/e7809035038b3816de2a1d67c5de86ebeed325d0.png";
import imgAvatar3 from "../../assets/bf485cb6f98c12534c69bc81459ce34f2e24e4a8.png";
import imgAvatar4 from "../../assets/9e45f45f537bea4bf653bc0307471e5ff5545f63.png";

/* ── Status variant map ── */
const negotiationStatusVariantMap: Record<string, string> = {
  "Via werklijst": "brand",
  "Bod verstuurd": "brand",
  "Bod ontvangen": "brand",
  "Goedgekeurd": "success",
  "Afgewezen": "error",
  "Afgekeurd": "error",
};

const negotiationStatusIconMap: Record<string, React.ReactNode | null> = {
  "Via werklijst": null,
  "Bod verstuurd": <Send strokeWidth={2.5} />,
  "Bod ontvangen": <MailOpen strokeWidth={2.5} />,
  "Goedgekeurd": <Check strokeWidth={2.5} />,
  "Afgewezen": <X strokeWidth={2.5} />,
  "Afgekeurd": <X strokeWidth={2.5} />,
};

const negotiationStatusTypeMap: Record<string, "default" | "color"> = {
  "Via werklijst": "default",
  "Bod verstuurd": "color",
  "Bod ontvangen": "color",
  "Goedgekeurd": "color",
  "Afgewezen": "color",
  "Afgekeurd": "color",
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

export default function InboxVesselDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTabRaw] = useState<'matches' | 'onderhandelingen' | 'activiteit'>('matches');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedNegotiation, setSelectedNegotiation] = useState<{ id: string; status: string; bron: string } | null>(null);
  const setActiveTab = (tab: typeof activeTab) => { setActiveTabRaw(tab); setSelectedNegotiation(null); };
  const [conversationDialog, setConversationDialog] = useState<{ relatieId: string; relatieName: string; matchName?: string } | null>(null);
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
    { key: "lading", header: "Lading", type: "leading-text", subtextKey: "ladingSubtext", actionLabel: "Onderhandeling" },
    { key: "relatie", header: "Relatie", type: "text", subtextKey: "relatieContact", textColor: "text-rdj-text-brand", width: "w-[180px]", onClickKey: "onRelatieClick" },
    { key: "laden", header: "Laden", type: "text", subtextKey: "ladenDatum", width: "w-[140px]" },
    { key: "lossen", header: "Lossen", type: "text", subtextKey: "lossenDatum", width: "w-[140px]" },
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

  // Mock match data for vessel
  const matchRows: RowData[] = [
    { id: "1", lading: "Houtpellets Salzgitter", ladingSubtext: "2.000 ton · Houtpellets (DSIT)", relatie: "Provaart Logistics BV", relatieContact: "Jan de Vries", laden: "Salzgitter Stichkanal", ladenDatum: "Vr 14 Mrt 2026", lossen: "Hamburg Veddelkanal", lossenDatum: "Di 18 Mrt 2026", matchPct: 90, onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === "Provaart Logistics BV"); if (rel) navigate(`/crm/relatie/${rel.id}`); } },
    { id: "2", lading: "Staal Dordrecht–Antwerpen", ladingSubtext: "3.000 ton · Staal", relatie: "Janlow B.V.", relatieContact: "Pieter Jansen", laden: "Dordrecht", ladenDatum: "Za 15 Mrt 2026", lossen: "Antwerpen", lossenDatum: "Ma 17 Mrt 2026", matchPct: 75, onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === "Janlow B.V."); if (rel) navigate(`/crm/relatie/${rel.id}`); } },
    { id: "3", lading: "Sojabonen Rotterdam", ladingSubtext: "3.500 ton · Sojabonen", relatie: "Cargill N.V.", relatieContact: "Sophie van Dam", laden: "Rotterdam Botlek", ladenDatum: "Zo 16 Mrt 2026", lossen: "Basel", lossenDatum: "Do 20 Mrt 2026", matchPct: 60, onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === "Cargill N.V."); if (rel) navigate(`/crm/relatie/${rel.id}`); } },
  ];

  /* ── Tabs ── */
  const tabs: PageTab[] = [
    { label: 'Matches', path: '#matches', isActive: activeTab === 'matches', badge: String(matchRows.length) },
    { label: 'Onderhandelingen', path: '#onderhandelingen', isActive: activeTab === 'onderhandelingen', badge: String(mockNegotiations.length) },
    { label: 'Activiteit', path: '#activiteit', isActive: activeTab === 'activiteit' },
  ];

  /* ── Negotiations table ── */
  const negColumns: Column[] = [
    { key: 'company', header: 'Relatie', type: 'leading-text', actionLabel: 'Openen' },
    { key: 'freightPrice', header: 'Vrachtprijs', type: 'text', subtextKey: 'freightPriceDiff', subtextColorKey: 'freightPriceDiffColor', subtextTooltipKey: 'freightPriceDiffTooltip', align: 'right', width: 'w-[160px]' },
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
    status: neg.status,
    statusVariant: negotiationStatusVariantMap[neg.status] || 'grey',
    statusIcon: negotiationStatusIconMap[neg.status] || null,
    statusType: negotiationStatusTypeMap[neg.status] || 'default',
    contactName: neg.contact.name,
    contactDate: neg.contact.date,
    contactAvatar: avatars[idx % avatars.length],
  }));

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
                        <Pagination
                          currentPage={matchPage}
                          totalItems={matchRows.length}
                          rowsPerPage={matchRowsPerPage}
                          onPageChange={setMatchPage}
                          onRowsPerPageChange={setMatchRowsPerPage}
                        />
                        <Table
                          columns={matchColumns}
                          data={matchRows}
                          hoveredRowId={hoveredRow}
                          onRowHover={setHoveredRow}
                          onRowClick={(row) => {
                            const relatie = mockRelaties.find(r => r.naam === row.relatie);
                            setConversationDialog({
                              relatieId: relatie?.id || "rel-001",
                              relatieName: (row.relatie as string) || "Onbekend",
                              matchName: row.lading as string,
                            });
                          }}
                        />
                      </>
                    )}

                    {activeTab === 'onderhandelingen' && (
                      <>
                        <Pagination
                          currentPage={negPage}
                          totalItems={mockNegotiations.length}
                          rowsPerPage={negRowsPerPage}
                          onPageChange={setNegPage}
                          onRowsPerPageChange={setNegRowsPerPage}
                        />
                        <Table
                          columns={negColumns}
                          data={negTableData}
                          hoveredRowId={hoveredRow}
                          onRowHover={setHoveredRow}
                          activeRowId={selectedNegotiation?.id ?? null}
                          onRowClick={(row) => setSelectedNegotiation({ id: row.id, status: row.status as string, bron: "markt" })}
                        />
                      </>
                    )}

                    {activeTab === 'activiteit' && (
                      <div className="w-full px-[24px]">
                        <ActivityFeed />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <VaartuigMarktSidebar id={id!} />
        </div>
      </div>

      {/* Negotiation Sidebar */}
      {selectedNegotiation && (
        <OnderhandelingSidepanel
          negotiationId={selectedNegotiation.id}
          status={selectedNegotiation.status as any}
          bron={selectedNegotiation.bron as any}
          onClose={() => setSelectedNegotiation(null)}
        />
      )}

      {/* Conversation dialog */}
      {conversationDialog && (
        <ConversationDialog
          relatieId={conversationDialog.relatieId}
          relatieName={conversationDialog.relatieName}
          preSelectedMatchName={conversationDialog.matchName}
          preSelectedOriginId={id}
          onClose={() => setConversationDialog(null)}
        />
      )}
    </>
  );
}
