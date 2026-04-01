import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Send, MailOpen, Check, X, Ship, Warehouse, PanelRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import type { PageTab } from "../components/PageHeader";
import Badge from "../components/Badge";
import Table from "../components/Table";
import type { Column, RowData } from "../components/Table";
import Pagination from "../components/Pagination";
import useTableSort from "../components/useTableSort";
import Button from "../components/Button";
import ActivityFeed from "../components/ActivityFeed";
import SectionHeader from "../components/SectionHeader";
import LadingEigenSidebar from "../components/LadingEigenSidebar";
import OnderhandelingSidepanel from "../components/OnderhandelingSidepanel";
import ConversationDialog from "../components/ConversationDialog";
import { useBevrachtingLadingSummary } from "../data/useDetailData";
import { mockMatches, mockNegotiations } from "../data/mock-data";
import { mockRelaties } from "../data/mock-relatie-data";
import LastActivityButton from "../components/LastActivityButton";
import svgPaths from "../../imports/svg-62fj7rjvas";
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

export default function LadingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTabRaw] = useState<'matches' | 'onderhandelingen' | 'activiteit'>('onderhandelingen');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedNegotiation, setSelectedNegotiation] = useState<{ id: string; status: string; bron: string; relatieName?: string; bemiddeling?: { inkoopRelatie: string; verkoopRelatie: string } } | null>(null);
  const setActiveTab = (tab: typeof activeTab) => { setActiveTabRaw(tab); setSelectedNegotiation(null); };
  const [conversationDialog, setConversationDialog] = useState<{ relatieId: string; relatieName: string; matchName?: string } | null>(null);
  const [sidebarKey, setSidebarKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [matchFilter, setMatchFilter] = useState("Alles");
  const [negFilter, setNegFilter] = useState("Actief");
  const [activityFilter, setActivityFilter] = useState("Alle activiteit");

  /* Pagination state per tab */
  const [matchPage, setMatchPage] = useState(1);
  const [matchRowsPerPage, setMatchRowsPerPage] = useState(50);
  const [negPage, setNegPage] = useState(1);
  const [negRowsPerPage, setNegRowsPerPage] = useState(50);

  const { data: summary, loading: summaryLoading } = useBevrachtingLadingSummary(id);
  const avatars = [imgAvatar, imgAvatar1, imgAvatar2, imgAvatar3, imgAvatar4];

  /* ── Breadcrumb ── */
  const breadcrumb = (
    <div className="content-stretch flex flex-col gap-[20px] items-start pt-[24px] relative shrink-0 w-full">
      <div className="content-stretch flex gap-[20px] items-center justify-between relative shrink-0 w-full px-[24px]">
        <div className="content-stretch flex items-center relative shrink-0">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
            <Link to="/markt/bevrachting" className="content-stretch flex items-center justify-center p-[4px] relative rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] whitespace-nowrap">Markt</p>
            </Link>
            <div className="overflow-clip relative shrink-0 size-[16px]">
              <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4">
                <div className="absolute inset-[-8.33%_-16.67%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.33333 9.33333">
                    <path d={svgPaths.p3ec8f700} stroke="var(--stroke-0, #D0D5DD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </svg>
                </div>
              </div>
            </div>
            <Link to="/markt/bevrachting" className="content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] whitespace-nowrap">Eigen aanbod</p>
            </Link>
            <div className="overflow-clip relative shrink-0 size-[16px]">
              <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4">
                <div className="absolute inset-[-8.33%_-16.67%]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.33333 9.33333">
                    <path d={svgPaths.p3ec8f700} stroke="var(--stroke-0, #D0D5DD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">
                {summaryLoading ? "..." : (summary?.breadcrumbLabel || id)}
              </p>
            </div>
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
      <div className="h-px relative shrink-0 w-full bg-rdj-border-secondary" />
    </div>
  );

  /* ── Subtitle ── */
  const subtitle = summaryLoading ? undefined : (
    <p className="font-sans font-normal leading-[24px] text-rdj-text-secondary text-[16px]">
      {summary?.subtitle || ""}
    </p>
  );

  /* ── Title badge (status) ── */
  const titleBadge = summary ? (
    <Badge label={summary.status} variant={summary.statusVariant} size="lg" dot />
  ) : null;

  /* ── Tabs ── */
  const tabs: PageTab[] = [
    { label: 'Onderhandelingen', path: '#onderhandelingen', isActive: activeTab === 'onderhandelingen', badge: String(mockNegotiations.length) },
    { label: 'Matches', path: '#matches', isActive: activeTab === 'matches', badge: String(mockMatches.length) },
    { label: 'Activiteit', path: '#activiteit', isActive: activeTab === 'activiteit' },
  ];

  /* ── Matches table ── */
  const matchColumns: Column[] = [
    { key: 'name', header: 'Vaartuig', type: 'leading-text', subtextKey: 'type', badgeKey: 'eigenBadge', actionLabel: 'Onderhandeling', actionCompletedKey: 'actionCompletedLabel' },
    { key: 'company', header: 'Relatie', type: 'text', subtextKey: 'contactPersoon', textColor: 'text-rdj-text-brand', width: 'w-[180px]', onClickKey: 'onRelatieClick' },
    { key: 'location', header: 'Locatie', type: 'text', subtextKey: 'locationDate', width: 'w-[200px]' },
    { key: 'distance', header: 'Groottonnage', type: 'text', align: 'right', width: 'w-[120px]' },
    { key: 'inhoud', header: 'Inhoud', type: 'text', align: 'right', width: 'w-[100px]' },
    { key: 'source', header: 'Bron', type: 'text', subtextKey: 'sourceDate', featuredIconKey: 'sourceIcon', featuredIconVariantKey: 'sourceIconVariant', width: 'w-[180px]' },
    { key: 'matchPercentage', header: 'Match', type: 'progress', align: 'right', width: 'w-[100px]' },
  ];

  const sourceIcon = (
    <svg fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
    </svg>
  );

  const activeNegStatuses = ["Via werklijst", "Bod verstuurd", "Bod ontvangen"];

  const matchTableData: RowData[] = mockMatches.map((match, idx) => ({
    id: match.id,
    name: match.name,
    type: match.type,
    eigenBadge: match.isEigen ? undefined : 'Markt',
    matchStatus: idx < 2 ? 'aangeboden' : 'openstaand',
    company: match.company,
    contactPersoon: match.contactPersoon || match.companyLocation,
    onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === match.company); if (rel) navigate(`/crm/relatie/${rel.id}`); },
    location: match.location,
    locationDate: match.locationDate || '',
    distance: match.distance,
    inhoud: match.inhoud || '',
    source: match.source || match.cargoType,
    sourceDate: match.sourceDate || match.cargoDate,
    sourceIcon: sourceIcon,
    sourceIconVariant: 'grey',
    matchPercentage: match.matchPercentage,
  }));

  /* ── Negotiations table ── */
  const negColumns: Column[] = [
    { key: 'company', header: 'Relatie', type: 'leading-text', subtextKey: 'companySubtext', badgeKey: 'bemiddelingBadge', badgeStyleKey: 'bemiddelingBadgeStyle', actionLabel: 'Openen' },
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
    companySubtext: neg.bemiddeling ? `Bemiddeling met ${neg.bemiddeling.inkoopRelatie} en ${neg.bemiddeling.verkoopRelatie}` : undefined,
    bemiddelingBadge: neg.bemiddeling ? 'Bemiddeling' : undefined,
    bemiddelingBadgeStyle: neg.bemiddeling ? { backgroundColor: '#EFF8FF', color: '#175CD3', borderColor: '#B2DDFF' } : undefined,
  }));

  const filteredMatchData = matchFilter === "Alles"
    ? matchTableData.map((row) => row.matchStatus === 'aangeboden'
        ? { ...row, _muted: true, actionCompletedLabel: 'Aangeboden' }
        : row)
    : matchTableData.filter((row) => row.matchStatus === matchFilter.toLowerCase());

  const filteredNegData = negFilter === "Alles"
    ? negTableData
    : negFilter === "Actief"
      ? negTableData.filter((row) => activeNegStatuses.includes(row.status as string))
      : negFilter === "Goedgekeurd"
        ? negTableData.filter((row) => row.status === "Goedgekeurd")
        : negTableData.filter((row) => row.status === "Afgewezen" || row.status === "Afgekeurd");

  const { sortedData: sortedMatchData, sortedColumns: sortedMatchColumns } = useTableSort(matchColumns, filteredMatchData);
  const { sortedData: sortedNegData, sortedColumns: sortedNegColumns } = useTableSort(negColumns, filteredNegData);

  /* ── Actions ── */
  const actions = (
    <>
      <Button
        variant="secondary"
        label="Uit markt halen"
        leadingIcon={
          <svg fill="none" viewBox="-0.5 -0.5 12.5 12.5">
            <path d={svgPaths.p3f40eb80} stroke="#B42318" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        }
        className="[&_p]:!text-[#b42318] [&_svg_path]:!stroke-[#b42318] [&_div>div]:!size-[12px] [&_div]:!gap-[2px]"
      />
      <Button variant="primary" label="Bewerken" />
    </>
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 overflow-auto min-w-0">
          {breadcrumb}

          <div className="content-stretch flex items-stretch justify-center relative shrink-0 w-full min-h-[calc(100vh-65px)]">
            <div className="flex-[1_0_0] min-h-px min-w-px relative">
              <div className="flex flex-col items-center size-full">
                <div className="content-stretch flex flex-col items-center py-[24px] relative w-full">
                  <div className="content-stretch flex flex-col gap-[0px] items-start max-w-[1116px] pt-[24px] relative shrink-0 w-full">
                    <PageHeader
                      title={summaryLoading ? "Laden..." : (summary?.title || "—")}
                      titleIcon={summary?.exType ? (
                        summary.exType === "opslag" ? (
                          <Warehouse className="size-[24px] text-rdj-text-tertiary" />
                        ) : (
                          <Ship className="size-[24px] text-rdj-text-tertiary" />
                        )
                      ) : undefined}
                      titleBadge={titleBadge}
                      subtitle={subtitle}
                      actions={actions}
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
                            totalItems={filteredMatchData.length}
                            rowsPerPage={matchRowsPerPage}
                            onPageChange={setMatchPage}
                            onRowsPerPageChange={setMatchRowsPerPage}
                          />
                          <Table
                            columns={sortedMatchColumns}
                            data={sortedMatchData}
                            hoveredRowId={hoveredRow}
                            onRowHover={setHoveredRow}
                            onRowClick={(row) => {
                              const relatie = mockRelaties.find(r => r.naam === row.company);
                              setConversationDialog({
                                relatieId: relatie?.id || "rel-001",
                                relatieName: (row.company as string) || "Onbekend",
                                matchName: row.name as string,
                              });
                            }}
                            onRowAction={(row) => {
                              const relatie = mockRelaties.find(r => r.naam === row.company);
                              setConversationDialog({
                                relatieId: relatie?.id || "rel-001",
                                relatieName: (row.company as string) || "Onbekend",
                                matchName: row.name as string,
                              });
                            }}
                          />
                        </>
                      )}

                      {activeTab === 'onderhandelingen' && (
                        <>
                          <SectionHeader
                            title="Onderhandelingen"
                            filterLabel={negFilter}
                            filterOptions={["Alles", "Actief", "Goedgekeurd", "Afgewezen"]}
                            filterValue={negFilter}
                            onFilterChange={setNegFilter}
                            onAdd={() => setConversationDialog({ relatieId: "", relatieName: "" })}
                            addTooltip="Onderhandeling starten"
                          />
                          <Pagination
                            currentPage={negPage}
                            totalItems={filteredNegData.length}
                            rowsPerPage={negRowsPerPage}
                            onPageChange={setNegPage}
                            onRowsPerPageChange={setNegRowsPerPage}
                          />
                          <Table
                            columns={sortedNegColumns}
                            data={sortedNegData}
                            hoveredRowId={hoveredRow}
                            onRowHover={setHoveredRow}
                            activeRowId={selectedNegotiation?.id ?? null}
                            onRowClick={(row) => {
                              const neg = mockNegotiations.find(n => n.id === row.id);
                              setSelectedNegotiation({ id: row.id, status: row.status as string, bron: "eigen", relatieName: row.company as string, bemiddeling: neg?.bemiddeling });
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

        {/* Right Sidebar */}
        <LadingEigenSidebar key={sidebarKey} id={id!} collapsed={!sidebarOpen} />
      </div>

      {/* Negotiation Sidebar */}
      {selectedNegotiation && (
        <OnderhandelingSidepanel
          negotiationId={selectedNegotiation.id}
          status={selectedNegotiation.status as any}
          bron={selectedNegotiation.bron as any}
          soort="lading"
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
          preSelectedItemId={id}
          preSelectedItemType="lading"
          onClose={() => { setConversationDialog(null); setSidebarKey(k => k + 1); }}
        />
      )}
    </div>
  );
}