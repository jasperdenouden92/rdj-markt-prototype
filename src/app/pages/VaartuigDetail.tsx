import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Send, MailOpen, Check, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import type { PageTab } from "../components/PageHeader";
import Badge from "../components/Badge";
import Table from "../components/Table";
import type { Column, RowData } from "../components/Table";
import Pagination from "../components/Pagination";
import Button from "../components/Button";
import ActivityFeed from "../components/ActivityFeed";
import SectionHeader from "../components/SectionHeader";
import VaartuigEigenSidebar from "../components/VaartuigEigenSidebar";
import VaartuigMarktSidebar from "../components/VaartuigMarktSidebar";
import OnderhandelingSidepanel from "../components/OnderhandelingSidepanel";
import ConversationDialog from "../components/ConversationDialog";
import { useBevrachtingVaartuigSummary } from "../data/useDetailData";
import { mockRelaties } from "../data/mock-relatie-data";
import LastActivityButton from "../components/LastActivityButton";
import svgPaths from "../../imports/svg-62fj7rjvas";
import imgAvatar from "../../assets/a2737d3b5b234fc04041650cb9f114889c6859da.png";
import imgAvatar1 from "../../assets/3627de284acb374a4d9313b3c2dbaeeb87a48224.png";
import imgAvatar2 from "../../assets/e7809035038b3816de2a1d67c5de86ebeed325d0.png";
import imgAvatar3 from "../../assets/bf485cb6f98c12534c69bc81459ce34f2e24e4a8.png";
import imgAvatar4 from "../../assets/9e45f45f537bea4bf653bc0307471e5ff5545f63.png";

/* ── Mock vessel matches (ladingen die passen bij dit vaartuig) ── */
const vesselMatches = [
  { id: 'VM001', cargo: '3.000 ton Houtpellets (DSIT)', exNaam: 'Houtpellets Salzgitter', company: 'Provaart Logistics BV', contactPersoon: 'Jan de Vries', laadHaven: 'Salzgitter Stichkanal', laadDatum: 'Vr 14 Mrt 10:00', losHaven: 'Hamburg Veddelkanal', losDatum: 'Di 18 Mrt 14:00', matchPercentage: 92, isEigen: true, source: 'Automatische feed', sourceDate: 'Do 6 Mrt 12:44' },
  { id: 'VM002', cargo: '3.000 ton Staal', company: 'Janlow B.V.', contactPersoon: 'Pieter Jansen', laadHaven: 'Dordrecht', laadDatum: 'Za 15 Mrt 06:00', losHaven: 'Antwerpen', losDatum: 'Ma 17 Mrt 14:00', matchPercentage: 85, isEigen: false, source: 'Automatische feed', sourceDate: 'Do 6 Mrt 15:45' },
  { id: 'VM003', cargo: '3.500 ton Sojabonen', company: 'Cargill N.V.', contactPersoon: 'Sophie van Dam', laadHaven: 'Rotterdam Botlek', laadDatum: 'Zo 16 Mrt 08:00', losHaven: 'Basel', losDatum: 'Do 20 Mrt', matchPercentage: 78, isEigen: false, source: 'Automatische feed', sourceDate: 'Do 6 Mrt 10:30' },
  { id: 'VM004', cargo: '3.000 ton Graan', company: 'Provaart Logistics BV', contactPersoon: 'Maria Bakker', laadHaven: 'Rotterdam', laadDatum: 'Di 18 Mrt 08:00', losHaven: 'Krefeld', losDatum: 'Vr 21 Mrt', matchPercentage: 65, isEigen: false, source: 'Automatische feed', sourceDate: 'Vr 7 Mrt 09:15' },
];

/* ── Mock onderhandelingen ── */
const vesselNegotiations = [
  { id: 'VN001', company: 'Provaart Logistics BV', cargo: '2.000 ton Houtpellets (DSIT)', price: '€3,50 per ton', priceDiff: '+4,2%', laadHaven: 'Salzgitter Stichkanal', laadDatum: 'Ma 12 Jan 10:00', losHaven: 'Hamburg Veddelkanal', losDatum: 'Vr 16 Jan 14:00', deadline: 'Za 14 Feb, 16:00', deadlineExpired: true, status: 'Bod ontvangen', contact: { name: 'Eric Nieuwkoop', date: 'Ma 9 Feb 07:28' }, bemiddeling: { inkoopRelatie: 'Provaart Logistics BV', verkoopRelatie: 'Rederij van Dam' } as const },
  { id: 'VN002', company: 'Janlow B.V.', cargo: '3.000 ton Houtpellets', price: '€3,00 per ton', priceDiff: '-2,1%', laadHaven: 'Rotterdam Europoort', laadDatum: 'Do 15 Jan 08:00', losHaven: 'Mannheim', losDatum: 'Af te stemmen', deadline: 'Morgen, 10:00', deadlineExpired: false, status: 'Via werklijst', contact: { name: 'Pelger de Jong', date: 'Di 10 Feb 19:53' } },
  { id: 'VN003', company: 'Cargill N.V.', cargo: '2.000 ton Koolraapzaad', price: '', priceDiff: '', laadHaven: 'Bremerhaven', laadDatum: 'Ma 19 Jan', losHaven: 'Duisburg', losDatum: 'Wo 21 Jan', deadline: 'Do 19 Feb, 11:15', deadlineExpired: false, status: 'Via werklijst', contact: { name: 'Khoa Nguyen', date: 'Zo 8 Feb 01:31' }, bemiddeling: { inkoopRelatie: 'Cargill N.V.', verkoopRelatie: 'Rederij Alfa' } as const },
];

const statusVariantMap: Record<string, string> = {
  "Via werklijst": "brand",
  "Bod verstuurd": "brand",
  "Bod ontvangen": "brand",
  "Goedgekeurd": "success",
  "Afgewezen": "error",
  "Afgekeurd": "error",
};

const statusIconMap: Record<string, React.ReactNode | null> = {
  "Via werklijst": null,
  "Bod verstuurd": <Send strokeWidth={2.5} />,
  "Bod ontvangen": <MailOpen strokeWidth={2.5} />,
  "Goedgekeurd": <Check strokeWidth={2.5} />,
  "Afgewezen": <X strokeWidth={2.5} />,
  "Afgekeurd": <X strokeWidth={2.5} />,
};

const statusTypeMap: Record<string, "default" | "color"> = {
  "Via werklijst": "default",
  "Bod verstuurd": "color",
  "Bod ontvangen": "color",
  "Goedgekeurd": "color",
  "Afgewezen": "color",
  "Afgekeurd": "color",
};

export default function VaartuigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTabRaw] = useState<'matches' | 'onderhandelingen' | 'activiteit'>('onderhandelingen');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedNegotiation, setSelectedNegotiation] = useState<{ id: string; status: string; bron: string; relatieName?: string; bemiddeling?: { inkoopRelatie: string; verkoopRelatie: string } } | null>(null);
  const setActiveTab = (tab: typeof activeTab) => { setActiveTabRaw(tab); setSelectedNegotiation(null); };
  const [conversationDialog, setConversationDialog] = useState<{ relatieId: string; relatieName: string; matchName?: string } | null>(null);
  const [matchFilter, setMatchFilter] = useState("Alles");
  const [negFilter, setNegFilter] = useState("Actief");
  const [activityFilter, setActivityFilter] = useState("Alle activiteit");

  /* Pagination state per tab */
  const [matchPage, setMatchPage] = useState(1);
  const [matchRowsPerPage, setMatchRowsPerPage] = useState(50);
  const [negPage, setNegPage] = useState(1);
  const [negRowsPerPage, setNegRowsPerPage] = useState(50);

  const { data: summary, detectedType, loading: summaryLoading } = useBevrachtingVaartuigSummary(id);
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
            <Link to="/markt/bevrachting/vaartuigen" className="content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
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
        <LastActivityButton maxAvatars={3} />
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
    { label: 'Onderhandelingen', path: '#onderhandelingen', isActive: activeTab === 'onderhandelingen', badge: String(vesselNegotiations.length) },
    { label: 'Matches', path: '#matches', isActive: activeTab === 'matches', badge: String(vesselMatches.length) },
    { label: 'Activiteit', path: '#activiteit', isActive: activeTab === 'activiteit' },
  ];

  /* ── Matches table columns ── */
  const matchColumns: Column[] = [
    { key: 'cargoTitle', header: 'Lading', type: 'leading-text', subtextKey: 'cargoSubtitle', maxWidth: 'max-w-[480px]', badgeKey: 'eigenBadge', actionLabel: 'Onderhandeling', actionCompletedKey: 'actionCompletedLabel' },
    { key: 'tonnage', header: 'Tonnage', type: 'text', width: 'w-[120px]', align: 'right' },
    { key: 'company', header: 'Relatie', type: 'text', subtextKey: 'contactPersoon', textColor: 'text-rdj-text-brand', width: 'w-[180px]', onClickKey: 'onRelatieClick' },
    { key: 'laadHaven', header: 'Laden', type: 'text', subtextKey: 'laadDatum', width: 'w-[180px]' },
    { key: 'losHaven', header: 'Lossen', type: 'text', subtextKey: 'losDatum', width: 'w-[180px]' },
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

  const matchTableData: RowData[] = vesselMatches.map((m, idx) => {
    const tonnageMatch = m.cargo.match(/^([\d.,\s\-]+ton)\s+(.+)$/);
    const tonnage = tonnageMatch ? tonnageMatch[1].trim() : '';
    const ladingSoort = tonnageMatch ? tonnageMatch[2] : m.cargo;
    return {
    id: m.id,
    cargoTitle: m.isEigen ? m.exNaam ?? ladingSoort : ladingSoort,
    cargoSubtitle: m.isEigen ? `${tonnage} ${ladingSoort}`.trim() : tonnage,
    tonnage,
    eigenBadge: m.isEigen ? undefined : 'Markt',
    matchStatus: idx < 2 ? 'aangeboden' : 'openstaand',
    company: m.company,
    contactPersoon: m.contactPersoon,
    onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === m.company); if (rel) navigate(`/crm/relatie/${rel.id}`); },
    laadHaven: m.laadHaven,
    laadDatum: m.laadDatum,
    losHaven: m.losHaven,
    losDatum: m.losDatum,
    source: m.source,
    sourceDate: m.sourceDate,
    sourceIcon: sourceIcon,
    sourceIconVariant: 'grey',
    matchPercentage: m.matchPercentage,
  }; });

  /* ── Onderhandelingen table columns ── */
  const negColumns: Column[] = [
    { key: 'company', header: 'Relatie', type: 'leading-text', subtextKey: 'cargo', badgeKey: 'bemiddelingBadge', badgeStyleKey: 'bemiddelingBadgeStyle', actionLabel: 'Openen' },
    { key: 'freightPrice', header: 'Vrachtprijs', type: 'text', width: 'w-[140px]', subtextKey: 'priceDiff', subtextColorKey: 'priceDiffColor', subtextTooltipKey: 'priceDiffTooltip', align: 'right' },
    { key: 'laadHaven', header: 'Laden', type: 'text', subtextKey: 'laadDatum', width: 'w-[180px]' },
    { key: 'losHaven', header: 'Lossen', type: 'text', subtextKey: 'losDatum', width: 'w-[180px]' },
    { key: 'deadline', header: 'Deadline', type: 'deadline', expiredKey: 'deadlineExpired', editable: true, width: 'w-[160px]' },
    { key: 'status', header: 'Status', type: 'status', variantKey: 'statusVariant', iconKey: 'statusIcon', typeKey: 'statusType', width: 'w-[160px]' },
    { key: 'contactName', header: 'Laatste update', type: 'text', subtextKey: 'contactDate', avatarSrcKey: 'contactAvatar', width: 'w-[200px]' },
  ];

  const negTableData: RowData[] = vesselNegotiations.map((b, idx) => ({
    id: b.id,
    company: b.company,
    cargo: 'bemiddeling' in b && b.bemiddeling ? `Bemiddeling met ${b.bemiddeling.verkoopRelatie}` : b.cargo,
    bemiddelingBadge: 'bemiddeling' in b && b.bemiddeling ? 'Bemiddeling' : undefined,
    bemiddelingBadgeStyle: 'bemiddeling' in b && b.bemiddeling ? 'brand-color' : undefined,
    freightPrice: b.price || '—',
    priceDiff: b.priceDiff,
    priceDiffColor: b.priceDiff?.startsWith('+') ? '#F79009' : undefined,
    priceDiffTooltip: b.priceDiff && b.priceDiff !== '' ? 'Vergeleken met inkoop' : undefined,
    laadHaven: b.laadHaven,
    laadDatum: b.laadDatum,
    losHaven: b.losHaven,
    losDatum: b.losDatum,
    deadline: b.deadline,
    deadlineExpired: b.deadlineExpired,
    status: b.status,
    statusVariant: statusVariantMap[b.status] || 'grey',
    statusIcon: statusIconMap[b.status] || null,
    statusType: statusTypeMap[b.status] || 'default',
    contactName: b.contact.name,
    contactDate: b.contact.date,
    contactAvatar: avatars[idx % avatars.length],
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

      <div className="flex-1 overflow-auto">
        {breadcrumb}

        <div className="content-stretch flex items-stretch justify-center relative shrink-0 w-full min-h-[calc(100vh-65px)]">
          <div className="flex-[1_0_0] min-h-px min-w-px relative">
            <div className="flex flex-col items-center size-full">
              <div className="content-stretch flex flex-col items-center py-[24px] relative w-full">
                <div className="content-stretch flex flex-col gap-[0px] items-start max-w-[1116px] pt-[24px] relative shrink-0 w-full">
                  <PageHeader
                    title={summaryLoading ? "Laden..." : (summary?.title || "—")}
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
                          columns={matchColumns}
                          data={filteredMatchData}
                          hoveredRowId={hoveredRow}
                          onRowHover={setHoveredRow}
                          onRowClick={(row) => {
                            const relatie = mockRelaties.find(r => r.naam === row.company);
                            setConversationDialog({
                              relatieId: relatie?.id || "rel-001",
                              relatieName: (row.company as string) || "Onbekend",
                              matchName: row.cargoTitle as string,
                            });
                          }}
                          onRowAction={(row) => {
                            const relatie = mockRelaties.find(r => r.naam === row.company);
                            setConversationDialog({
                              relatieId: relatie?.id || "rel-001",
                              relatieName: (row.company as string) || "Onbekend",
                              matchName: row.cargoTitle as string,
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
                          columns={negColumns}
                          data={filteredNegData}
                          hoveredRowId={hoveredRow}
                          onRowHover={setHoveredRow}
                          activeRowId={selectedNegotiation?.id ?? null}
                          onRowClick={(row) => {
                            const neg = vesselNegotiations.find(n => n.id === row.id);
                            setSelectedNegotiation({
                              id: row.id,
                              status: row.status as string,
                              bron: "eigen",
                              relatieName: row.company as string,
                              bemiddeling: neg && 'bemiddeling' in neg ? neg.bemiddeling as { inkoopRelatie: string; verkoopRelatie: string } : undefined,
                            });
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

          {/* Right Sidebar */}
          {detectedType === 'markt'
            ? <VaartuigMarktSidebar id={id!} />
            : <VaartuigEigenSidebar id={id!} />
          }
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
          preSelectedItemId={id}
          preSelectedItemType="vaartuig"
          onClose={() => setConversationDialog(null)}
        />
      )}
    </div>
  );
}