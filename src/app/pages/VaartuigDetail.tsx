import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Send, MailOpen, Check, X, PanelRight, ListTodo } from "lucide-react";
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
  { id: 'VM001', ladingId: 'le-001', cargo: '3.000 ton Houtpellets (DSIT)', exNaam: 'Houtpellets Salzgitter', company: 'Provaart Logistics BV', contactPersoon: 'Jan de Vries', laadLocatie: 'Salzgitter Stichkanal', laadDatum: 'Vr 14 Mrt 10:00', losLocatie: 'Hamburg Veddelkanal', losDatum: 'Di 18 Mrt 14:00', matchPercentage: 92, isEigen: true, source: 'Laadplanning', sourceDate: 'Do 6 Mrt 12:44' },
  { id: 'VM002', ladingId: 'rl-004', cargo: '3.000 ton Staal', company: 'Janlow B.V.', contactPersoon: 'Pieter Jansen', laadLocatie: 'Dordrecht', laadDatum: 'Za 15 Mrt 06:00', losLocatie: 'Antwerpen', losDatum: 'Ma 17 Mrt 14:00', matchPercentage: 85, isEigen: false, source: 'Automatische feed', sourceDate: 'Do 6 Mrt 15:45' },
  { id: 'VM003', ladingId: 'rl-006', cargo: '3.500 ton Sojabonen', company: 'Cargill N.V.', contactPersoon: 'Sophie van Dam', laadLocatie: 'Rotterdam Botlek', laadDatum: 'Zo 16 Mrt 08:00', losLocatie: 'Basel', losDatum: 'Do 20 Mrt', matchPercentage: 78, isEigen: false, source: 'Automatische feed', sourceDate: 'Do 6 Mrt 10:30' },
  { id: 'VM004', ladingId: 'rl-002', cargo: '3.000 ton Graan', company: 'Provaart Logistics BV', contactPersoon: 'Maria Bakker', laadLocatie: 'Rotterdam', laadDatum: 'Di 18 Mrt 08:00', losLocatie: 'Krefeld', losDatum: 'Vr 21 Mrt', matchPercentage: 65, isEigen: false, source: 'Automatische feed', sourceDate: 'Vr 7 Mrt 09:15' },
];

/* ── Mock onderhandelingen ── */
const vesselNegotiations = [
  { id: 'VN001', company: 'Provaart Logistics BV', cargo: '2.000 ton Houtpellets (DSIT)', price: '€3,50 per ton', priceDiff: '+4,2%', laadLocatie: 'Salzgitter Stichkanal', laadDatum: 'Ma 12 Jan 10:00', losLocatie: 'Hamburg Veddelkanal', losDatum: 'Vr 16 Jan 14:00', deadline: 'Za 14 Feb, 16:00', deadlineExpired: true, status: 'Bod ontvangen', contact: { name: 'Eric Nieuwkoop', date: 'Ma 9 Feb 07:28' }, bemiddeling: { inkoopRelatie: 'Provaart Logistics BV', verkoopRelatie: 'Rederij van Dam' } as const },
  { id: 'VN002', company: 'Janlow B.V.', cargo: '3.000 ton Houtpellets', price: '€3,00 per ton', priceDiff: '-2,1%', laadLocatie: 'Rotterdam Europoort', laadDatum: 'Do 15 Jan 08:00', losLocatie: 'Mannheim', losDatum: 'Af te stemmen', deadline: 'Morgen, 10:00', deadlineExpired: false, status: 'Via werklijst', contact: { name: 'Pelger de Jong', date: 'Di 10 Feb 19:53' } },
  { id: 'VN003', company: 'Cargill N.V.', cargo: '2.000 ton Koolraapzaad', price: '', priceDiff: '', laadLocatie: 'Bremerhaven', laadDatum: 'Ma 19 Jan', losLocatie: 'Duisburg', losDatum: 'Wo 21 Jan', deadline: 'Do 19 Feb, 11:15', deadlineExpired: false, status: 'Via werklijst', contact: { name: 'Khoa Nguyen', date: 'Zo 8 Feb 01:31' }, bemiddeling: { inkoopRelatie: 'Cargill N.V.', verkoopRelatie: 'Rederij Alfa' } as const },
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
  "Via werklijst": <ListTodo strokeWidth={2.5} />,
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

/* ── Source icons ── */
const automatischeFeedIcon = (
  <svg fill="none" viewBox="0 0 14.6667 12.0001">
    <path d={svgPaths.p29cbab00} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
  </svg>
);

const handmatigIcon = (
  <svg fill="none" viewBox="0 0 14.219 14.219">
    <path d="M0.917365 11.296C0.947994 11.0204 0.963308 10.8826 1.00501 10.7537C1.04201 10.6394 1.09429 10.5307 1.16043 10.4304C1.23497 10.3173 1.33304 10.2193 1.52916 10.0231L10.3334 1.21895C11.0697 0.482571 12.2636 0.482572 13 1.21895C13.7364 1.95533 13.7364 3.14924 13 3.88562L4.19582 12.6898C3.9997 12.8859 3.90164 12.984 3.7886 13.0585C3.6883 13.1247 3.57953 13.1769 3.46524 13.2139C3.33641 13.2556 3.19858 13.271 2.92292 13.3016L0.666671 13.5523L0.917365 11.296Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
  </svg>
);

const vlootIcon = (
  <svg fill="none" viewBox="0 0 22 22">
    <path d={svgPaths.p22d4a480} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const planningIcon = (
  <svg fill="none" viewBox="0 0 18.0002 22">
    <path d={svgPaths.p20684dc0} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

function getSourceIcon(source: string) {
  if (source === 'Eigen vloot') return vlootIcon;
  if (source === 'Laadplanning') return planningIcon;
  if (source === 'Handmatig ingevoerd') return handmatigIcon;
  return automatischeFeedIcon;
}

function getSourceVariant(source: string): 'grey' | 'brand' {
  if (source === 'Eigen vloot' || source === 'Laadplanning') return 'brand';
  return 'grey';
}

export default function VaartuigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTabRaw] = useState<'matches' | 'onderhandelingen' | 'activiteit'>('onderhandelingen');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedNegotiation, setSelectedNegotiation] = useState<{ id: string; status: string; bron: string; relatieName?: string; bemiddeling?: { inkoopRelatie: string; verkoopRelatie: string } } | null>(null);
  const setActiveTab = (tab: typeof activeTab) => { setActiveTabRaw(tab); setSelectedNegotiation(null); };
  const [conversationDialog, setConversationDialog] = useState<{ relatieId: string; relatieName: string; matchName?: string; matchLadingId?: string; isMatch?: boolean } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    { label: 'Onderhandelingen', path: '#onderhandelingen', isActive: activeTab === 'onderhandelingen', badge: String(vesselNegotiations.length) },
    { label: 'Matches', path: '#matches', isActive: activeTab === 'matches', badge: String(vesselMatches.length) },
    { label: 'Activiteit', path: '#activiteit', isActive: activeTab === 'activiteit' },
  ];

  /* ── Matches table columns ── */
  const matchColumns: Column[] = [
    { key: 'cargoTitle', header: 'Lading', type: 'leading-text', subtextKey: 'cargoSubtitle', maxWidth: 'max-w-[480px]', badgeKey: 'eigenBadge', actionLabel: 'Onderhandeling', actionLabelKey: 'actionLabel', actionCompletedKey: 'actionCompletedLabel' },
    { key: 'tonnage', header: 'Tonnage', type: 'text', width: 'w-[120px]', align: 'right' },
    { key: 'company', header: 'Relatie', type: 'text', subtextKey: 'contactPersoon', textColor: 'text-rdj-text-brand', width: 'w-[180px]', onClickKey: 'onRelatieClick' },
    { key: 'laadLocatie', header: 'Laden', type: 'text', subtextKey: 'laadDatum', width: 'w-[180px]' },
    { key: 'losLocatie', header: 'Lossen', type: 'text', subtextKey: 'losDatum', width: 'w-[180px]' },
    { key: 'source', header: 'Bron', type: 'text', subtextKey: 'sourceDate', featuredIconKey: 'sourceIcon', featuredIconVariantKey: 'sourceIconVariant', width: 'w-[180px]' },
    { key: 'matchPercentage', header: 'Match', type: 'progress', align: 'right', width: 'w-[100px]' },
  ];

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
      actionLabel: m.isEigen ? 'Openen' : undefined,
      ladingId: m.isEigen ? m.ladingId : undefined,
      matchStatus: idx < 2 ? 'aangeboden' : 'openstaand',
      company: m.isEigen ? 'Rederij de Jong' : m.company,
      contactPersoon: m.isEigen ? undefined : m.contactPersoon,
      onRelatieClick: m.isEigen ? undefined : (() => { const rel = mockRelaties.find(r => r.naam === m.company); if (rel) navigate(`/crm/relatie/${rel.id}`); }),
      laadLocatie: m.laadLocatie,
      laadDatum: m.laadDatum,
      losLocatie: m.losLocatie,
      losDatum: m.losDatum,
      source: m.source,
      sourceDate: m.sourceDate,
      sourceIcon: getSourceIcon(m.source),
      sourceIconVariant: getSourceVariant(m.source),
      matchPercentage: m.matchPercentage,
    };
  });

  /* ── Onderhandelingen table columns ── */
  const negColumns: Column[] = [
    { key: 'company', header: 'Relatie', type: 'leading-text', subtextKey: 'cargo', badgeKey: 'bemiddelingBadge', badgeStyleKey: 'bemiddelingBadgeStyle', actionLabel: 'Openen' },
    { key: 'freightPrice', header: 'Vrachtprijs', type: 'text', width: 'w-[140px]', subtextKey: 'priceDiff', subtextColorKey: 'priceDiffColor', subtextTooltipKey: 'priceDiffTooltip', align: 'right' },
    { key: 'laadLocatie', header: 'Laden', type: 'text', subtextKey: 'laadDatum', width: 'w-[180px]' },
    { key: 'losLocatie', header: 'Lossen', type: 'text', subtextKey: 'losDatum', width: 'w-[180px]' },
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
    laadLocatie: b.laadLocatie,
    laadDatum: b.laadDatum,
    losLocatie: b.losLocatie,
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
      <Sidebar data-annotation-id="vaartuigdetail-navigatie" />

      <div className="flex-1 flex min-h-0 min-w-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
          {breadcrumb}

          <div className="content-stretch flex items-stretch justify-center relative shrink-0 w-full min-h-[calc(100vh-65px)]">
            <div className="flex-[1_0_0] min-h-px min-w-px relative">
              <div className="flex flex-col items-center size-full">
                <div className="content-stretch flex flex-col items-center py-[24px] relative w-full">
                  <div className="content-stretch flex flex-col gap-[0px] items-start pt-[24px] relative shrink-0 w-full">
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
                          <Pagination data-annotation-id="vaartuigdetail-paginering-2"
                            currentPage={matchPage}
                            totalItems={filteredMatchData.length}
                            rowsPerPage={matchRowsPerPage}
                            onPageChange={setMatchPage}
                            onRowsPerPageChange={setMatchRowsPerPage}
                          />
                          <Table data-annotation-id="vaartuigdetail-tabel-2"
                            columns={sortedMatchColumns}
                            data={sortedMatchData}
                            hoveredRowId={hoveredRow}
                            onRowHover={setHoveredRow}
                            onRowClick={(row) => {
                              if (row.ladingId) {
                                navigate(`/markt/bevrachting/lading/${row.ladingId}`);
                                return;
                              }
                              const relatie = mockRelaties.find(r => r.naam === row.company);
                              const match = vesselMatches.find(m => m.id === row.id);
                              setConversationDialog({
                                relatieId: relatie?.id || "rel-001",
                                relatieName: (row.company as string) || "Onbekend",
                                matchName: row.cargoTitle as string,
                                matchLadingId: match?.ladingId,
                                isMatch: true,
                              });
                            }}
                            onRowAction={(row) => {
                              if (row.ladingId) {
                                navigate(`/markt/bevrachting/lading/${row.ladingId}`);
                                return;
                              }
                              const relatie = mockRelaties.find(r => r.naam === row.company);
                              const match = vesselMatches.find(m => m.id === row.id);
                              setConversationDialog({
                                relatieId: relatie?.id || "rel-001",
                                relatieName: (row.company as string) || "Onbekend",
                                matchName: row.cargoTitle as string,
                                matchLadingId: match?.ladingId,
                                isMatch: true,
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
                          <Pagination data-annotation-id="vaartuigdetail-paginering"
                            currentPage={negPage}
                            totalItems={filteredNegData.length}
                            rowsPerPage={negRowsPerPage}
                            onPageChange={setNegPage}
                            onRowsPerPageChange={setNegRowsPerPage}
                          />
                          <Table data-annotation-id="vaartuigdetail-tabel"
                            columns={sortedNegColumns}
                            data={sortedNegData}
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
          </div>
        </div>

        {/* Right Sidebar */}
        {detectedType === 'markt'
          ? <VaartuigMarktSidebar id={id!} collapsed={!sidebarOpen} />
          : <VaartuigEigenSidebar id={id!} collapsed={!sidebarOpen} />
        }
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
          preSelectedItemId={conversationDialog.isMatch ? undefined : id}
          preSelectedLeftId={conversationDialog.isMatch ? conversationDialog.matchLadingId : undefined}
          preSelectedOriginId={conversationDialog.isMatch ? id : undefined}
          preSelectedItemType={conversationDialog.isMatch ? "relatie-lading" : "vaartuig"}
          onClose={() => setConversationDialog(null)}
        />
      )}
    </div>
  );
}