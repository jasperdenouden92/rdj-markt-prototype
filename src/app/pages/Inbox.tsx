import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast, Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import AddInboxItemModal from "../components/AddInboxItemModal";
import InboxMapView from "../components/InboxMapView";
import SegmentedButtonGroup from "../components/SegmentedButtonGroup";
import PageHeader from "../components/PageHeader";
import FilterDropdown from "../components/FilterDropdown";
import Pagination from "../components/Pagination";
import Table from "../components/Table";
import type { Column } from "../components/Table";
import useTableSort from "../components/useTableSort";
import svgPaths from "../../imports/svg-5yigdc067t";
import { useInboxLadingen, updateLadingMarktPriority } from "../data/useMarktData";
import { mockRelaties } from "../data/mock-relatie-data";
import { buildRelatieHoverContent } from "../components/RelatieHoverCard";
import * as apiClient from "../data/api";

type InboxSubView = 'te-beoordelen' | 'interessant' | 'archief';

interface InboxItem {
  id: string;
  title: string;
  tonnage?: string;
  relation: string;
  relationLink: string;
  loadLocation: string;
  loadDate: string;
  unloadLocation: string;
  unloadDate: string;
  source: string;
  sourceDate: string;
  matches: number;
  /** Best match type: 'eigen' = match with own item, 'interessant' = match with prio>=3, 'none' = no qualifying match */
  matchType: 'eigen' | 'interessant' | 'none';
  onderhandelingen: number;
  owner: string;
  priority: number;
  selected?: boolean;
}

const mockInboxData: InboxItem[] = [
  // Te beoordelen (priority 0)
  {
    id: '1',
    title: 'Af te stemmen ton Houtpellets (0571)',
    relation: 'Van Dijk Shipping B.V.',
    relationLink: '',
    loadLocation: 'Rotterdam Europoort',
    loadDate: 'Do 15 Jan',
    unloadLocation: 'Af te stemmen',
    unloadDate: '',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 4,
    matchType: 'interessant',
    onderhandelingen: 0,
    owner: '',
    priority: 0,
  },
  {
    id: '6',
    title: '2.500 ton Graan (0412)',
    relation: 'Limber Benelux N.V.',
    relationLink: 'K. van Hoorn',
    loadLocation: 'Antwerpen Kanaaldok',
    loadDate: 'Ma 19 Jan',
    unloadLocation: 'Krefeld Rheinhafen',
    unloadDate: 'Wo 21 Jan',
    source: 'Automatische feed',
    sourceDate: 'Vr 6 Feb 09:15',
    matches: 3,
    matchType: 'none',
    onderhandelingen: 0,
    owner: '',
    priority: 0,
  },
  {
    id: '7',
    title: '1.800 ton Koolzaad (0298)',
    relation: 'Cargo Solutions Ltd.',
    relationLink: 'Marie Thomas',
    loadLocation: 'Gent Zeehaven',
    loadDate: 'Di 20 Jan',
    unloadLocation: 'Mannheim Industriehafen',
    unloadDate: 'Za 24 Jan',
    source: 'Pager de Jong',
    sourceDate: 'Vr 6 Feb 11:30',
    matches: 5,
    matchType: 'eigen',
    onderhandelingen: 1,
    owner: '',
    priority: 0,
  },
  {
    id: '8',
    title: '4.000 ton Steenkool (0633)',
    relation: 'Eco Transport GmbH',
    relationLink: 'Anna Müller',
    loadLocation: 'Amsterdam Westhaven',
    loadDate: 'Wo 21 Jan',
    unloadLocation: 'Duisburg Ruhrort',
    unloadDate: 'Vr 23 Jan',
    source: 'Automatische feed',
    sourceDate: 'Za 7 Feb 08:00',
    matches: 6,
    matchType: 'eigen',
    onderhandelingen: 2,
    owner: '',
    priority: 0,
  },
  {
    id: '9',
    title: '900 ton Sojameel (0187)',
    relation: 'Global Shipping Inc.',
    relationLink: 'Raj Patel',
    loadLocation: 'Terneuzen Kanaalzone',
    loadDate: 'Do 22 Jan',
    unloadLocation: 'Basel Rheinhafen',
    unloadDate: 'Di 27 Jan',
    source: 'Automatische feed',
    sourceDate: 'Za 7 Feb 14:20',
    matches: 2,
    matchType: 'none',
    onderhandelingen: 0,
    owner: '',
    priority: 0,
  },
  {
    id: '10',
    title: '3.200 ton Ijzererts (0744)',
    relation: 'Trans Logistics Group',
    relationLink: '',
    loadLocation: 'IJmuiden Zeehaven',
    loadDate: '',
    unloadLocation: 'Af te stemmen',
    unloadDate: '',
    source: 'Automatische feed',
    sourceDate: 'Ma 9 Feb 10:00',
    matches: 1,
    matchType: 'none',
    onderhandelingen: 0,
    owner: '',
    priority: 0,
  },
  // Interessant (priority >= 3)
  {
    id: '2',
    title: '1.000 - 3.500 ton Houtpellets (0571)',
    relation: 'Rijnvaart Transport N.V.',
    relationLink: 'Lisa Ashbourne',
    loadLocation: 'Amsterdam Westhaven',
    loadDate: 'Do 15 Jan',
    unloadLocation: 'Nijmegen Waal',
    unloadDate: 'Za 17 Jan',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 7,
    matchType: 'eigen',
    onderhandelingen: 3,
    owner: '',
    priority: 4,
  },
  {
    id: '3',
    title: '3.000 ton Houtpellets (0571)',
    relation: 'Van Dijk Shipping B.V.',
    relationLink: 'Wanda in \'t Veld',
    loadLocation: 'Dordrecht Zeehaven',
    loadDate: '',
    unloadLocation: 'Den Bosch Diezehaven',
    unloadDate: 'Week 7 of 8',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 13:24',
    matches: 7,
    matchType: 'interessant',
    onderhandelingen: 2,
    owner: 'avatar1',
    priority: 3,
  },
  {
    id: '11',
    title: '2.000 ton Mais (0355)',
    relation: 'Markel Freight B.V.',
    relationLink: 'H.Q. Duivenvoorde',
    loadLocation: 'Rotterdam Botlek',
    loadDate: 'Ma 19 Jan',
    unloadLocation: 'Strasbourg Port du Rhin',
    unloadDate: 'Do 22 Jan',
    source: 'Pager de Jong',
    sourceDate: 'Do 5 Feb 16:00',
    matches: 9,
    matchType: 'eigen',
    onderhandelingen: 4,
    owner: 'avatar1',
    priority: 5,
  },
  {
    id: '12',
    title: '1.500 ton Kunstmest (0499)',
    relation: 'Andermans B.V.',
    relationLink: 'Cees Andoormans',
    loadLocation: 'Moerdijk Industriehaven',
    loadDate: 'Di 20 Jan',
    unloadLocation: 'Keulen Niehl',
    unloadDate: 'Do 22 Jan',
    source: 'Automatische feed',
    sourceDate: 'Vr 6 Feb 07:30',
    matches: 4,
    matchType: 'interessant',
    onderhandelingen: 1,
    owner: 'avatar2',
    priority: 3,
  },
  // Archief (priority 1-2)
  {
    id: '4',
    title: '3.000 ton Houtpellets (0571)',
    relation: 'Jansen Bevrachting B.V.',
    relationLink: 'P. Janssen',
    loadLocation: 'Moerdijk Industriehaven',
    loadDate: 'Do 15 Jan',
    unloadLocation: 'Groningen Eemskanaal',
    unloadDate: 'Ma 19 Jan',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 7,
    matchType: 'eigen',
    onderhandelingen: 2,
    owner: '',
    priority: 2,
  },
  {
    id: '5',
    title: '3.000 ton Houtpellets (0571)',
    relation: 'Jansen Bevrachting B.V.',
    relationLink: 'L. de Vries',
    loadLocation: 'Terneuzen Kanaalzone',
    loadDate: 'Vr 16 Jan',
    unloadLocation: 'Zwolle IJssel',
    unloadDate: 'Za 17 Jan',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 8,
    matchType: 'interessant',
    onderhandelingen: 3,
    owner: 'avatar2',
    priority: 1,
  },
  {
    id: '13',
    title: '800 ton Zand (0122)',
    relation: 'Buiten Onszelf N.V.',
    relationLink: 'Lisa Aelbrechtse',
    loadLocation: 'Dordrecht Zeehaven',
    loadDate: 'Wo 14 Jan',
    unloadLocation: 'Utrecht Lage Weide',
    unloadDate: 'Do 15 Jan',
    source: 'Automatische feed',
    sourceDate: 'Di 3 Feb 15:00',
    matches: 1,
    matchType: 'none',
    onderhandelingen: 0,
    owner: '',
    priority: 1,
  },
  {
    id: '14',
    title: '2.200 ton Grind (0266)',
    relation: 'Eco Transport GmbH',
    relationLink: 'Anna Müller',
    loadLocation: 'Lobith Rijnhaven',
    loadDate: 'Do 15 Jan',
    unloadLocation: 'Nijmegen Waal',
    unloadDate: 'Vr 16 Jan',
    source: 'Pager de Jong',
    sourceDate: 'Wo 4 Feb 09:45',
    matches: 3,
    matchType: 'none',
    onderhandelingen: 1,
    owner: '',
    priority: 2,
  },
];

export default function Inbox() {
  const navigate = useNavigate();
  const { data: apiItems, loading, error, refetch } = useInboxLadingen();
  const [localItems, setLocalItems] = useState<InboxItem[] | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemType, setItemType] = useState<'lading' | 'vaartuig'>('lading');
  const [subView, setSubView] = useState<InboxSubView>('te-beoordelen');
  const inboxItems = localItems ?? apiItems.map(a => ({
    id: a.id,
    title: a.title,
    tonnage: a.tonnage,
    relation: a.relation,
    relationLink: a.relationLink,
    loadLocation: a.loadLocation,
    loadDate: a.loadDate,
    unloadLocation: a.unloadLocation,
    unloadDate: a.unloadDate,
    source: a.source,
    sourceDate: a.sourceDate,
    matches: a.matches,
    matchType: a.matchType,
    onderhandelingen: a.onderhandelingen,
    owner: a.owner,
    priority: a.priority,
  }));
  const filteredItems = inboxItems.filter(item => {
    if (subView === 'te-beoordelen') return item.priority === 0;
    if (subView === 'interessant') return item.priority >= 3;
    return item.priority >= 1 && item.priority <= 2; // archief
  });
  const [searchParams] = useSearchParams();
  const viewMode = (searchParams.get('view') === 'map' ? 'map' : 'list') as 'list' | 'map';
  const setViewMode = (val: 'list' | 'map') => {
    navigate(val === 'map' ? '/markt/inbox/ladingen?view=map' : '/markt/inbox/ladingen', { replace: true });
  };
  const [mapMode, setMapMode] = useState<'laden' | 'lossen'>('laden');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const totalItems = filteredItems.length;

  const handleAddItem = async (data: any) => {
    try {
      // Create in the API
      const newItem = await apiClient.create("lading_markt", {
        opmerking: data.type === 'lading' ? `${data.tonnage} ton ${data.cargoType}` : '',
        tonnage: parseInt(data.tonnage) || 0,
        status: 'inbox',
        relatieId: '',
        eigenaarId: null,
        prioriteit: data.priority || 0,
        prijs: null,
        laadtijd: null,
        liggeldLaden: 0,
        lostijd: null,
        liggeldLossen: 0,
        laaddatum: '',
        losdatum: '',
      });
      
      // Refresh from API
      setLocalItems(null);
      refetch();
      
      toast.success(`${data.type === 'lading' ? 'Lading' : 'Vaartuig'} toegevoegd aan inbox`, {
        description: 'Het item is nu zichtbaar in de inbox lijst.',
        duration: 3000,
      });
    } catch (err: any) {
      toast.error('Fout bij toevoegen', { description: err.message });
    }
  };

  const handleRate = (rowId: string, value: number) => {
    setLocalItems(inboxItems.map(i => i.id === rowId ? { ...i, priority: value } : i));
    // Persist to server
    updateLadingMarktPriority(rowId, value).catch(console.error);
  };

  const columns: Column[] = [
    { key: 'ladingSoort', header: 'Lading', type: 'leading-text', maxWidth: 'max-w-[480px]' },
    { key: 'tonnage', header: 'Tonnage', type: 'text', width: 'w-[120px]', align: 'right' },
    { key: 'loadLocation', header: 'Laden', type: 'text', width: 'w-[180px]', editable: true, subtextKey: 'loadDate' },
    { key: 'unloadLocation', header: 'Lossen', type: 'text', width: 'w-[180px]', editable: true, subtextKey: 'unloadDate' },
    { key: 'relation', header: 'Relatie', type: 'text', width: 'w-[180px]', textColor: 'text-rdj-text-brand', subtextKey: 'relationLink', onClickKey: 'onRelatieClick', hoverContentKey: 'relatieHoverContent' },
    { key: 'source', header: 'Bron', type: 'text', width: 'w-[180px]', subtextKey: 'sourceDate', featuredIconKey: 'sourceIcon', featuredIconVariantKey: 'sourceIconVariant', featuredIconDefaultVariant: 'grey' as const },
    {
      key: 'matches', header: 'Matches', type: 'custom', width: 'w-[120px]',
      render: (row) => {
        const count = row.matches as number;
        const matchType = row.matchType as string;
        if (!count) return null;
        const bg = matchType === 'eigen'
          ? 'bg-[#eff8ff] text-[#175cd3] border-[#b2ddff]'
          : matchType === 'interessant'
          ? 'bg-[#fffaeb] text-[#b54708] border-[#fedf89]'
          : 'bg-white text-[#344054] border-[#d0d5dd]';
        return (
          <span className={`inline-flex items-center gap-[4px] rounded-full border px-[10px] py-[2px] font-sans font-bold text-[13px] leading-[20px] ${bg}`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.25 6.417h3.5M5.25 8.75h2.333M9.333 2.917H11.2c.653 0 .98 0 1.232.127.222.112.403.293.515.515.127.252.127.578.127 1.232v5.834c0 .653 0 .98-.127 1.232a1.167 1.167 0 0 1-.515.515c-.252.128-.579.128-1.232.128H2.8c-.653 0-.98 0-1.232-.128a1.167 1.167 0 0 1-.515-.515C.927 11.605.927 11.278.927 10.625V4.79c0-.654 0-.98.127-1.232.112-.222.293-.403.515-.515.252-.127.579-.127 1.232-.127h1.866m0-1.75h4.666c.327 0 .49 0 .616.064.11.056.201.146.258.258.063.126.063.29.063.616v.812c0 .327 0 .49-.063.616a.583.583 0 0 1-.258.258c-.126.063-.29.063-.616.063H4.667c-.327 0-.49 0-.616-.063a.583.583 0 0 1-.258-.258c-.063-.126-.063-.29-.063-.616v-.812c0-.327 0-.49.063-.616a.583.583 0 0 1 .258-.258c.126-.064.29-.064.616-.064Z" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {count}
          </span>
        );
      },
    },
    {
      key: 'onderhandelingen', header: 'Onderhandelingen', type: 'custom', width: 'w-[140px]',
      render: (row) => {
        const count = row.onderhandelingen as number;
        if (!count) return null;
        return (
          <span className="inline-flex items-center gap-[4px] rounded-full border px-[10px] py-[2px] font-sans font-bold text-[13px] leading-[20px] bg-white text-[#344054] border-[#d0d5dd]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4.667 5.25h4.666M4.667 7.583h2.916M7 12.25c2.9 0 5.25-2.35 5.25-5.25S9.9 1.75 7 1.75 1.75 4.1 1.75 7c0 .93.243 1.804.669 2.56.09.16.135.24.152.305a.52.52 0 0 1 .015.165c-.008.068-.037.14-.094.286l-.742 1.855c-.082.204-.123.306-.098.38a.292.292 0 0 0 .164.164c.074.025.176-.016.38-.098l1.855-.742c.145-.058.218-.087.286-.094a.52.52 0 0 1 .165.015c.065.017.145.062.305.152A5.222 5.222 0 0 0 7 12.25Z" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {count}
          </span>
        );
      },
    },
    { key: 'ownerLabel', header: 'Eigenaar', type: 'text', width: 'w-[80px]', avatarSrcKey: 'ownerAvatarSrc', avatarInitialsKey: 'ownerInitials', editable: true },
    { key: 'priority', header: 'Prioriteit', type: 'rating', width: 'w-[140px]', onRate: handleRate, editable: true },
  ];

  const tableData = filteredItems.map(item => {
    return {
    id: item.id,
    ladingSoort: item.title,
    tonnage: item.tonnage,
    relation: item.relation,
    relationLink: item.relationLink,
    onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === item.relation); if (rel) navigate(`/crm/relatie/${rel.id}`); },
    relatieHoverContent: buildRelatieHoverContent(item.relation),
    loadLocation: item.loadLocation,
    loadDate: item.loadDate,
    unloadLocation: item.unloadLocation,
    unloadDate: item.unloadDate,
    source: item.source,
    sourceDate: item.sourceDate,
    sourceIcon: item.source === 'Handmatig ingevoerd'
      ? <svg fill="none" viewBox="0 0 14.219 14.219"><path d="M0.917365 11.296C0.947994 11.0204 0.963308 10.8826 1.00501 10.7537C1.04201 10.6394 1.09429 10.5307 1.16043 10.4304C1.23497 10.3173 1.33304 10.2193 1.52916 10.0231L10.3334 1.21895C11.0697 0.482571 12.2636 0.482572 13 1.21895C13.7364 1.95533 13.7364 3.14924 13 3.88562L4.19582 12.6898C3.9997 12.8859 3.90164 12.984 3.7886 13.0585C3.6883 13.1247 3.57953 13.1769 3.46524 13.2139C3.33641 13.2556 3.19858 13.271 2.92292 13.3016L0.666671 13.5523L0.917365 11.296Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333"/></svg>
      : <svg fill="none" viewBox="0 0 14.6667 12.0001"><path d="M1.00001 6.00009H3.25466C3.71146 6.00009 4.12906 6.25818 4.33335 6.66676C4.53764 7.07533 4.95523 7.33342 5.41204 7.33342H9.25466C9.71146 7.33342 10.1291 7.07533 10.3333 6.66676C10.5376 6.25818 10.9552 6.00009 11.412 6.00009H13.6667M5.31106 0.666756H9.35564C10.0736 0.666756 10.4325 0.666756 10.7494 0.776065C11.0297 0.87273 11.2849 1.03049 11.4967 1.23792C11.7362 1.47249 11.8967 1.79356 12.2178 2.43567L13.6622 5.32442C13.7882 5.57641 13.8512 5.70241 13.8956 5.83445C13.9351 5.95172 13.9635 6.0724 13.9807 6.19493C14 6.33291 14 6.47377 14 6.75551V8.13342C14 9.25353 14 9.81358 13.782 10.2414C13.5903 10.6177 13.2843 10.9237 12.908 11.1154C12.4802 11.3334 11.9201 11.3334 10.8 11.3334H3.86668C2.74658 11.3334 2.18652 11.3334 1.7587 11.1154C1.38238 10.9237 1.07641 10.6177 0.884668 10.2414C0.666681 9.81358 0.666681 9.25353 0.666681 8.13342V6.75551C0.666681 6.47377 0.666681 6.33291 0.685997 6.19493C0.703151 6.0724 0.731639 5.95172 0.771094 5.83445C0.815521 5.70241 0.87852 5.57641 1.00451 5.32442L2.44889 2.43567C2.76995 1.79355 2.93048 1.47249 3.16998 1.23792C3.38177 1.03049 3.63702 0.87273 3.91727 0.776065C4.23418 0.666756 4.59314 0.666756 5.31106 0.666756Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333"/></svg>,
    sourceIconVariant: 'grey' as const,
    matches: item.matches,
    matchType: item.matchType,
    onderhandelingen: item.onderhandelingen,
    ownerLabel: '',
    ownerInitials: item.owner ? 'PJ' : undefined,
    priority: item.priority,
  }; });

  const { sortedColumns, sortedData } = useTableSort(columns, tableData);

  return (
    <>
      <Toaster position="top-right" richColors />
      <AddInboxItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItem}
        itemType={itemType}
      />
      <div className="flex min-h-screen bg-rdj-bg-primary">
        <Sidebar />
        
        <div className={`flex-1 ${viewMode === 'map' ? 'flex flex-col overflow-hidden' : 'overflow-auto'} pt-[24px]`}>
          <PageHeader
            title="Markt aanbod"
            actions={
              <button 
                onClick={() => { setItemType('lading'); setShowAddModal(true); }}
                className="bg-[#1567a4] relative rounded-[6px] shrink-0 hover:opacity-90 cursor-pointer"
              >
                <div className="content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[14px] py-[10px] relative rounded-[inherit]">
                  <div className="overflow-clip relative shrink-0 size-[20px]">
                    <div className="absolute inset-[20.83%]">
                      <div className="absolute inset-[-7.14%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
                          <path d={svgPaths.p1b67fa00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex items-center justify-center px-[2px] relative shrink-0">
                    <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[14px] text-white whitespace-nowrap">Toevoegen</p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#1567a4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
              </button>
            }
            tabs={[
              { label: 'Ladingen', path: viewMode === 'map' ? '/markt/inbox/ladingen?view=map' : '/markt/inbox/ladingen', isActive: true },
              { label: 'Vaartuigen', path: viewMode === 'map' ? '/markt/inbox/vaartuigen?view=map' : '/markt/inbox/vaartuigen', isActive: false },
            ]}
            filtersLeft={
              <>
                <SegmentedButtonGroup
                  items={[
                    { label: 'Te beoordelen', value: 'te-beoordelen', count: inboxItems.filter(i => i.priority === 0).length },
                    { label: 'Interessant', value: 'interessant', count: inboxItems.filter(i => i.priority >= 3).length },
                    { label: 'Archief', value: 'archief', count: inboxItems.filter(i => i.priority >= 1 && i.priority <= 2).length },
                  ]}
                  value={subView}
                  onChange={(val) => setSubView(val as InboxSubView)}
                />
                <FilterDropdown
                  label="Start laden: 13 Jan 2026 en eerder"
                  leadingIcon={
                    <div className="absolute inset-[8.33%_12.5%]">
                      <div className="absolute inset-[-5%_-5.56%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 18.3333">
                          <path d={svgPaths.p16594900} stroke="#344054" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                        </svg>
                      </div>
                    </div>
                  }
                />
                <FilterDropdown
                  label="Filter"
                  variant="tertiary"
                  options={['Relatie', 'Laadregio', 'Losregio', 'Ladingsoort', 'Tonnage', 'Deadline']}
                />
              </>
            }
            filtersRight={
              <>
                {viewMode === 'list' && (
                  <>
                    <p className="font-sans font-normal leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Groeperen:</p>
                    <FilterDropdown label="Geen groupering" />
                  </>
                )}
                {viewMode === 'map' && (
                  <SegmentedButtonGroup items={[{ label: 'Laden', value: 'laden' }, { label: 'Lossen', value: 'lossen' }]} value={mapMode} onChange={(val) => setMapMode(val as 'laden' | 'lossen')} />
                )}
                <SegmentedButtonGroup
                  items={[
                    { value: 'list', icon: (<svg fill="none" viewBox="0 0 20 20"><path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" /></svg>) },
                    { value: 'map', icon: (<svg fill="none" viewBox="0 0 20 20"><path d="M7.5 17.5L2.5 15V2.5L7.5 5M7.5 17.5L12.5 15M7.5 17.5V5M12.5 15L17.5 17.5V5L12.5 2.5M12.5 15V2.5M7.5 5L12.5 2.5" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
                  ]}
                  value={viewMode}
                  onChange={(val) => setViewMode(val as 'list' | 'map')}
                />
                <div className="bg-rdj-bg-primary h-[40px] relative rounded-[6px] shrink-0 max-w-[320px] w-full"><div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full"><div className="content-stretch flex items-center px-[14px] py-[8px] relative size-full"><div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative"><div className="overflow-clip relative shrink-0 size-[20px]"><div className="absolute inset-[12.5%]"><div className="absolute inset-[-5.56%]"><svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667"><path d={svgPaths.p3190da80} stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" /></svg></div></div></div><p className="flex-[1_0_0] font-sans font-normal h-[18px] leading-[20px] min-h-px min-w-px overflow-hidden relative text-rdj-text-tertiary text-[14px] text-ellipsis text-left whitespace-nowrap">Zoeken</p></div></div></div><div aria-hidden="true" className="absolute border border-rdj-border-primary border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" /></div>
              </>
            }
          />

          {/* Sub-filter row: Relatie / Laadregio / Losregio */}
          <div className="px-[24px] pt-[12px] pb-[4px] flex gap-[8px] items-center">
            <FilterDropdown label="Relatie" />
            <FilterDropdown label="Laadregio" />
            <FilterDropdown label="Losregio" />
          </div>

          {/* Content: Table or Map */}
          {viewMode === 'map' ? (
            <div className="flex-1 px-[24px] pt-[16px] pb-[24px] min-h-0">
              <InboxMapView
                mode={mapMode}
              />
            </div>
          ) : (
          <div className="">
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
              onRowClick={(row) => navigate(`/markt/inbox/lading/${row.id}`)}
              hoveredRowId={hoveredRow}
              onRowHover={setHoveredRow}
            />

            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </div>
          )}
        </div>
      </div>

    </>
  );
}