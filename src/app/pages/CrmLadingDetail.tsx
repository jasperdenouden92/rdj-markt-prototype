import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { PanelRight } from "lucide-react";
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
import ConversationDialog from "../components/ConversationDialog";
import { mockRelaties, mockRelatieLadingen, mockRelatieLadingMatches } from "../data/mock-relatie-data";
import { formatDate } from "../utils/formatDate";

const ladingStatusMap: Record<string, { label: string; variant: "success" | "warning" | "brand" | "grey" }> = {
  intake: { label: "Intake", variant: "brand" },
  werklijst: { label: "Werklijst", variant: "warning" },
  markt: { label: "In de markt", variant: "success" },
  gesloten: { label: "Gesloten", variant: "grey" },
};

const chevronSvg = (
  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.33333 9.33333">
    <path d="M0.666664 8.66667L4.66666 4.66667L0.666664 0.666668" stroke="var(--stroke-0, #D0D5DD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
  </svg>
);

export default function CrmLadingDetail() {
  const { id, relatieId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"matches" | "onderhandelingen" | "activiteit">("onderhandelingen");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [matchPage, setMatchPage] = useState(1);
  const [matchRowsPerPage, setMatchRowsPerPage] = useState(50);
  const [matchFilter, setMatchFilter] = useState("Alles");
  const [negFilter, setNegFilter] = useState("Actief");
  const [activityFilter, setActivityFilter] = useState("Alle activiteit");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversationDialog, setConversationDialog] = useState<{ relatieId: string; relatieName: string; matchName?: string } | null>(null);

  const lading = useMemo(() => mockRelatieLadingen.find((l) => l.id === id), [id]);
  const relatie = useMemo(() => mockRelaties.find((r) => r.id === (relatieId || lading?.relatieId)), [relatieId, lading]);
  const matches = useMemo(() => mockRelatieLadingMatches.filter((m) => m.ladingId === id), [id]);

  if (!lading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-sans font-bold text-[20px] text-rdj-text-primary">Lading niet gevonden</p>
            <Link to={relatie ? `/crm/relatie/${relatie.id}` : "/crm/relaties"} className="font-sans text-[14px] text-rdj-text-brand hover:underline mt-2 block">
              Terug
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = ladingStatusMap[lading.status] || { label: lading.status, variant: "grey" as const };

  const breadcrumb = (
    <div className="content-stretch flex flex-col gap-[20px] items-start pt-[24px] relative shrink-0 w-full">
      <div className="content-stretch flex gap-[20px] items-center justify-between relative shrink-0 w-full px-[24px]">
        <div className="content-stretch flex items-center relative shrink-0">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
            <Link to="/crm/relaties" className="content-stretch flex items-center justify-center p-[4px] relative rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] whitespace-nowrap">CRM</p>
            </Link>
            <div className="overflow-clip relative shrink-0 size-[16px]"><div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4"><div className="absolute inset-[-8.33%_-16.67%]">{chevronSvg}</div></div></div>
            {relatie && (
              <>
                <Link to={`/crm/relatie/${relatie.id}`} className="content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
                  <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] whitespace-nowrap">{relatie.naam}</p>
                </Link>
                <div className="overflow-clip relative shrink-0 size-[16px]"><div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4"><div className="absolute inset-[-8.33%_-16.67%]">{chevronSvg}</div></div></div>
              </>
            )}
            <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">{lading.titel}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className={`p-[8px] rounded-[8px] transition-colors shrink-0 ${sidebarOpen ? 'bg-rdj-bg-active text-rdj-text-brand' : 'hover:bg-rdj-bg-primary-hover text-rdj-text-secondary'}`}
        >
          <PanelRight size={20} />
        </button>
      </div>
      <div className="h-px relative shrink-0 w-full bg-rdj-border-secondary" />
    </div>
  );

  const titleBadge = <Badge label={statusInfo.label} variant={statusInfo.variant} size="lg" dot />;
  const subtitle = `${lading.tonnage} ${lading.product} vanuit ${lading.laadlocatie} naar ${lading.loslocatie}`;

  const tabs: PageTab[] = [
    { label: "Onderhandelingen", path: "#onderhandelingen", isActive: activeTab === "onderhandelingen", badge: String(lading.onderhandelingen) },
    { label: "Matches", path: "#matches", isActive: activeTab === "matches", badge: String(matches.length) },
    { label: "Activiteit", path: "#activiteit", isActive: activeTab === "activiteit" },
  ];

  const sourceIcon = (
    <svg fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
    </svg>
  );

  const matchColumns: Column[] = [
    { key: "name", header: "Vaartuig", type: "leading-text", subtextKey: "type", badgeKey: "eigenBadge", actionLabel: "Onderhandeling", actionCompletedKey: "actionCompletedLabel" },
    { key: "company", header: "Relatie", type: "text", subtextKey: "contactPersoon", textColor: "text-rdj-text-brand", width: "w-[180px]", onClickKey: "onRelatieClick" },
    { key: "location", header: "Locatie", type: "text", subtextKey: "locationDate", width: "w-[200px]" },
    { key: "distance", header: "Groottonnage", type: "text", align: "right", width: "w-[120px]" },
    { key: "inhoud", header: "Inhoud", type: "text", align: "right", width: "w-[100px]" },
    { key: "source", header: "Bron", type: "text", subtextKey: "sourceDate", featuredIconKey: "sourceIcon", featuredIconVariantKey: "sourceIconVariant", width: "w-[180px]" },
    { key: "matchPercentage", header: "Match", type: "progress", align: "right", width: "w-[100px]" },
  ];

  const matchTableData: RowData[] = matches.map((m, idx) => ({
    id: m.id,
    name: m.vaartuigNaam,
    type: m.vaartuigType,
    eigenBadge: m.isEigen ? undefined : "Markt",
    matchStatus: idx < 2 ? 'aangeboden' : 'openstaand',
    company: m.relatie,
    contactPersoon: m.contactPersoon,
    onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === m.relatie); if (rel) navigate(`/crm/relatie/${rel.id}`); },
    location: m.locatie,
    locationDate: m.locatieDatum,
    distance: m.groottonnage,
    inhoud: m.inhoud,
    source: m.bron,
    sourceDate: m.bronDatum,
    sourceIcon: sourceIcon,
    sourceIconVariant: "grey",
    matchPercentage: m.matchPercentage,
  }));

  const filteredMatchData = matchFilter === "Alles"
    ? matchTableData.map((row) => row.matchStatus === 'aangeboden'
        ? { ...row, _muted: true, actionCompletedLabel: 'Aangeboden' }
        : row)
    : matchTableData.filter((row) => row.matchStatus === matchFilter.toLowerCase());

  const { sortedData: sortedMatchData, sortedColumns: sortedMatchColumns } = useTableSort(matchColumns, filteredMatchData);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex min-h-0 min-w-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
          {breadcrumb}

          <div className="content-stretch flex items-stretch justify-center relative shrink-0 w-full min-h-[calc(100vh-65px)]">
            <div className="flex-[1_0_0] min-h-px min-w-px relative">
              <div className="flex flex-col items-center size-full">
                <div className="content-stretch flex flex-col items-center py-[24px] relative w-full">
                  <div className="content-stretch flex flex-col gap-[0px] items-start max-w-[1116px] pt-[24px] relative shrink-0 w-full">
                    <PageHeader
                      title={lading.titel}
                      titleBadge={titleBadge}
                      subtitle={subtitle}
                      actions={<Button variant="primary" label="Bewerken" />}
                      tabs={tabs}
                      onTabClick={(tab: PageTab) => {
                        const tabKey = tab.path.replace("#", "") as typeof activeTab;
                        setActiveTab(tabKey);
                      }}
                    />

                    <div className="w-full pt-[20px]">
                      {activeTab === "matches" && (
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
                            onRowAction={(row) => {
                              const rel = mockRelaties.find(r => r.naam === row.company);
                              setConversationDialog({
                                relatieId: rel?.id || relatie?.id || "",
                                relatieName: (row.company as string) || relatie?.naam || "",
                                matchName: row.name as string,
                              });
                            }}
                          />
                        </>
                      )}

                      {activeTab === "onderhandelingen" && (
                        <>
                          <SectionHeader
                            title="Onderhandelingen"
                            filterLabel={negFilter}
                            filterOptions={["Alles", "Actief", "Goedgekeurd", "Afgewezen"]}
                            filterValue={negFilter}
                            onFilterChange={setNegFilter}
                            onAdd={() => setConversationDialog({ relatieId: relatie?.id || "", relatieName: relatie?.naam || "" })}
                            addTooltip="Onderhandeling starten"
                          />
                          <div className="w-full px-[24px] py-[48px] text-center">
                            <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
                              Nog geen onderhandelingen gestart voor deze lading.
                            </p>
                          </div>
                        </>
                      )}

                      {activeTab === "activiteit" && (
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
        <div
          className={`shrink-0 overflow-hidden transition-[width] duration-150 ease-out bg-white ${sidebarOpen ? "border-l border-rdj-border-secondary" : "border-l-0"}`}
          style={{ width: sidebarOpen ? 320 : 0 }}
        >
          <div className="w-[320px] h-full overflow-y-auto">
            <div className="p-[24px] flex flex-col gap-[24px]">
              <div>
                <p className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary mb-[16px]">Details</p>
                <div className="flex flex-col gap-[12px]">
                  <div>
                    <p className="font-sans font-normal text-[12px] text-rdj-text-secondary uppercase tracking-[0.04em]">Tonnage</p>
                    <p className="font-sans font-bold text-[14px] text-rdj-text-primary mt-[2px]">{lading.tonnage}</p>
                  </div>
                  <div>
                    <p className="font-sans font-normal text-[12px] text-rdj-text-secondary uppercase tracking-[0.04em]">Product</p>
                    <p className="font-sans font-bold text-[14px] text-rdj-text-primary mt-[2px]">{lading.product}</p>
                  </div>
                  <div>
                    <p className="font-sans font-normal text-[12px] text-rdj-text-secondary uppercase tracking-[0.04em]">Laadlocatie</p>
                    <p className="font-sans font-bold text-[14px] text-rdj-text-primary mt-[2px]">{lading.laadlocatie}</p>
                  </div>
                  <div>
                    <p className="font-sans font-normal text-[12px] text-rdj-text-secondary uppercase tracking-[0.04em]">Loslocatie</p>
                    <p className="font-sans font-bold text-[14px] text-rdj-text-primary mt-[2px]">{lading.loslocatie}</p>
                  </div>
                  <div>
                    <p className="font-sans font-normal text-[12px] text-rdj-text-secondary uppercase tracking-[0.04em]">Laaddatum</p>
                    <p className="font-sans font-bold text-[14px] text-rdj-text-primary mt-[2px]">{formatDate(lading.laaddatum)}</p>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-rdj-border-secondary" />

              <div>
                <p className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary mb-[16px]">Relatie</p>
                <div className="flex flex-col gap-[12px]">
                  <div>
                    <p className="font-sans font-normal text-[12px] text-rdj-text-secondary uppercase tracking-[0.04em]">Bedrijf</p>
                    {relatie ? (
                      <Link to={`/crm/relatie/${relatie.id}`} className="font-sans font-bold text-[14px] text-rdj-text-brand hover:underline mt-[2px] block">
                        {relatie.naam}
                      </Link>
                    ) : (
                      <p className="font-sans font-bold text-[14px] text-rdj-text-primary mt-[2px]">—</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation dialog */}
      {conversationDialog && (
        <ConversationDialog
          relatieId={conversationDialog.relatieId}
          relatieName={conversationDialog.relatieName}
          preSelectedMatchName={conversationDialog.matchName}
          preSelectedOriginId={conversationDialog.matchName ? id : undefined}
          preSelectedItemId={conversationDialog.matchName ? undefined : id}
          preSelectedItemType={conversationDialog.matchName ? undefined : "lading"}
          onClose={() => setConversationDialog(null)}
        />
      )}
    </div>
  );
}
