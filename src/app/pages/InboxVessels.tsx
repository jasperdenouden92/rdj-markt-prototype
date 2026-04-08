import svgPaths from "../../imports/svg-gjl6m1r792";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast, Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import VesselMapView from "../components/VesselMapView";
import SegmentedButtonGroup from "../components/SegmentedButtonGroup";
import PageHeader from "../components/PageHeader";
import FilterDropdown from "../components/FilterDropdown";
import AddInboxItemModal from "../components/AddInboxItemModal";
import Pagination from "../components/Pagination";
import Table from "../components/Table";
import type { Column } from "../components/Table";
import useTableSort from "../components/useTableSort";
import { useInboxVaartuigen, updateVaartuigMarktPriority } from "../data/useMarktData";
import { mockRelaties } from "../data/mock-relatie-data";
import * as apiClient from "../data/api";

type InboxSubView = 'te-beoordelen' | 'interessant' | 'archief';

interface VesselItem {
  id: string;
  name: string;
  type: string;
  eni?: string;
  relation: string;
  relationContact: string;
  location: string;
  locationDetail: string;
  availableFrom: string;
  cargoTypes: string[];
  tonnage: string;
  capacity: string;
  source: string;
  sourceDate: string;
  matches: number;
  matchType: 'eigen' | 'interessant' | 'none';
  onderhandelingen: number;
  owner: string;
  priority: number;
  selected?: boolean;
}

const mockVesselData: VesselItem[] = [
  {
    id: '1',
    name: 'Te bepalen naam',
    type: 'Motorschip',
    relation: 'Andermans B.V.',
    relationContact: 'Cees Andoormans',
    location: 'Europahafen (Maassluis)',
    locationDetail: 'Ondervang',
    availableFrom: '31 Dec, 2025',
    cargoTypes: ['KS', 'LR', 'GMP', 'LP'],
    tonnage: '3.519 mt',
    capacity: '4.200 m³',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 4,
    matchType: 'interessant',
    onderhandelingen: 0,
    owner: '',
    priority: 0,
  },
  {
    id: '2',
    name: 'Agast',
    type: 'Motorschip',
    relation: 'Markel Freight B.V.',
    relationContact: 'H.Q. Duivenvoorde',
    location: 'Europahafen (Maassluis)',
    locationDetail: '',
    availableFrom: '13 Jan, 2025 14:45',
    cargoTypes: ['KS', 'LR', 'GMP'],
    tonnage: '2.985 mt',
    capacity: '4.200 m³',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 7,
    matchType: 'eigen',
    onderhandelingen: 3,
    owner: 'avatar1',
    priority: 4,
  },
  {
    id: '3',
    name: 'Adonai',
    type: 'Motorschip',
    relation: 'Buiten Onszelf N.V.',
    relationContact: 'Lisa Aelbrechtse',
    location: 'Europahafen (Maassluis)',
    locationDetail: 'Ondervang',
    availableFrom: '18 Jan, 2025 00:30',
    cargoTypes: ['KS', 'LR', 'GMP'],
    tonnage: '3.655 mt',
    capacity: '4.200 m³',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 7,
    matchType: 'eigen',
    onderhandelingen: 2,
    owner: '',
    priority: 3,
  },
  {
    id: '4',
    name: 'Antoine V',
    type: 'Motorschip',
    relation: 'Trans Logistics Group',
    relationContact: '',
    location: 'Europahafen (Maassluis)',
    locationDetail: '',
    availableFrom: '18 Jan, 2025 00:30',
    cargoTypes: ['KS', 'LR', 'GMP'],
    tonnage: '3.795 mt',
    capacity: '4.200 m³',
    source: 'Pager de Jong',
    sourceDate: 'Do 3 Feb 12:44',
    matches: 8,
    matchType: 'interessant',
    onderhandelingen: 2,
    owner: 'avatar2',
    priority: 2,
  },
  {
    id: '5',
    name: 'Agnes',
    type: 'Motorschip',
    relation: 'Markel Freight B.V.',
    relationContact: 'Freya Hendriksmith',
    location: 'Europahafen (Maassluis)',
    locationDetail: '',
    availableFrom: '-',
    cargoTypes: ['KS', 'LR', 'GMP'],
    tonnage: '2.835 mt',
    capacity: '4.200 m³',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 9,
    matchType: 'eigen',
    onderhandelingen: 2,
    owner: '',
    priority: 0,
  },
  {
    id: '6',
    name: 'Te bepalen naam',
    type: 'Motorschip',
    relation: 'Cargo Solutions Ltd.',
    relationContact: 'Marie Thomas',
    location: 'Europahafen (Maassluis)',
    locationDetail: '',
    availableFrom: '20 Jan, 2025 11:00',
    cargoTypes: ['KS', 'LR', 'GMP'],
    tonnage: '3.795 mt',
    capacity: '4.200 m³',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 4,
    matchType: 'none',
    onderhandelingen: 0,
    owner: '',
    priority: 0,
  },
  {
    id: '7',
    name: 'Ambulant',
    type: 'Motorschip',
    relation: 'Eco Transport GmbH',
    relationContact: 'Anna Müller',
    location: 'Europahafen (Maassluis)',
    locationDetail: '',
    availableFrom: '18 Jan, 2025',
    cargoTypes: ['KS', 'LR', 'GMP'],
    tonnage: '2.929 mt',
    capacity: '4.200 m³',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 2,
    matchType: 'none',
    onderhandelingen: 0,
    owner: '',
    priority: 1,
  },
  {
    id: '8',
    name: 'Te bepalen naam',
    type: 'Duwbak',
    relation: 'Global Shipping Inc.',
    relationContact: 'Raj Patel',
    location: 'Europahafen (Maassluis)',
    locationDetail: 'Ondervang',
    availableFrom: '',
    cargoTypes: ['KS', 'LR', 'GMP'],
    tonnage: '3.519 mt',
    capacity: '4.200 m³',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 10,
    matchType: 'eigen',
    onderhandelingen: 1,
    owner: '',
    priority: 0,
  },
  {
    id: '9',
    name: 'Annemarie',
    type: 'Motorschip',
    relation: 'Trans Logistics Group',
    relationContact: '',
    location: 'Europahafen (Maassluis)',
    locationDetail: '',
    availableFrom: '23 Jan, 2025 17:05',
    cargoTypes: ['KS', 'LR', 'GMP'],
    tonnage: '2.958 mt',
    capacity: '4.200 m³',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 1,
    matchType: 'none',
    onderhandelingen: 0,
    owner: '',
    priority: 0,
  },
  // Interessant (priority >= 3)
  {
    id: '10',
    name: 'Beatrix',
    type: 'Motorschip',
    relation: 'Van Dijk Shipping B.V.',
    relationContact: 'P. van Dijk',
    location: 'Dordrecht Zeehaven',
    locationDetail: '',
    availableFrom: '25 Jan, 2025 08:00',
    cargoTypes: ['KS', 'LR', 'GMP', 'LP'],
    tonnage: '3.800 mt',
    capacity: '4.500 m³',
    source: 'Pager de Jong',
    sourceDate: 'Ma 9 Feb 10:30',
    matches: 6,
    matchType: 'eigen',
    onderhandelingen: 4,
    owner: 'avatar1',
    priority: 5,
  },
  {
    id: '11',
    name: 'Cornelia',
    type: 'Duwbak',
    relation: 'Rijnvaart Transport N.V.',
    relationContact: 'Lisa Ashbourne',
    location: 'Rotterdam Botlek',
    locationDetail: 'Kade 7',
    availableFrom: '22 Jan, 2025 14:00',
    cargoTypes: ['KS', 'GMP'],
    tonnage: '4.200 mt',
    capacity: '5.100 m³',
    source: 'Automatische feed',
    sourceDate: 'Za 8 Feb 16:00',
    matches: 8,
    matchType: 'interessant',
    onderhandelingen: 1,
    owner: '',
    priority: 3,
  },
  // Archief (priority 1-2)
  {
    id: '12',
    name: 'De Hoop',
    type: 'Motorschip',
    relation: 'Limber Benelux N.V.',
    relationContact: 'K. van Hoorn',
    location: 'Antwerpen Kanaaldok',
    locationDetail: '',
    availableFrom: '15 Jan, 2025',
    cargoTypes: ['KS', 'LR'],
    tonnage: '2.100 mt',
    capacity: '2.800 m³',
    source: 'Automatische feed',
    sourceDate: 'Do 5 Feb 12:44',
    matches: 2,
    matchType: 'none',
    onderhandelingen: 0,
    owner: '',
    priority: 2,
  },
  {
    id: '13',
    name: 'Eendracht',
    type: 'Motorschip',
    relation: 'Jansen Bevrachting B.V.',
    relationContact: 'P. Janssen',
    location: 'Nijmegen Waal',
    locationDetail: '',
    availableFrom: '12 Jan, 2025 06:00',
    cargoTypes: ['KS', 'LR', 'GMP'],
    tonnage: '3.100 mt',
    capacity: '3.900 m³',
    source: 'Pager de Jong',
    sourceDate: 'Wo 4 Feb 11:15',
    matches: 3,
    matchType: 'interessant',
    onderhandelingen: 1,
    owner: '',
    priority: 1,
  },
];

export default function InboxVessels() {
  const navigate = useNavigate();
  const { data: apiVessels, loading, error, refetch } = useInboxVaartuigen();
  const [localItems, setLocalItems] = useState<VesselItem[] | null>(null);
  const vesselItems: VesselItem[] = localItems ?? apiVessels.map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    eni: a.eni,
    relation: a.relation,
    relationContact: a.relationContact,
    location: a.location,
    locationDetail: a.locationDetail,
    availableFrom: a.availableFrom,
    cargoTypes: a.cargoTypes,
    tonnage: a.tonnage,
    capacity: a.capacity,
    source: a.source,
    sourceDate: a.sourceDate,
    matches: a.matches,
    matchType: a.matchType,
    onderhandelingen: a.onderhandelingen,
    owner: a.owner,
    priority: a.priority,
  }));
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [subView, setSubView] = useState<InboxSubView>('te-beoordelen');
  const [showAddModal, setShowAddModal] = useState(false);
  const filteredItems = vesselItems.filter(item => {
    if (subView === 'te-beoordelen') return item.priority === 0;
    if (subView === 'interessant') return item.priority >= 3;
    return item.priority >= 1 && item.priority <= 2; // archief
  });
  const [searchParams] = useSearchParams();
  const viewMode = (searchParams.get('view') === 'map' ? 'map' : 'list') as 'list' | 'map';
  const setViewMode = (val: 'list' | 'map') => {
    navigate(val === 'map' ? '/markt/inbox/vaartuigen?view=map' : '/markt/inbox/vaartuigen', { replace: true });
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const totalItems = filteredItems.length;

  const handleRate = (rowId: string, value: number) => {
    setLocalItems(vesselItems.map(i => i.id === rowId ? { ...i, priority: value } : i));
    updateVaartuigMarktPriority(rowId, value).catch(console.error);
  };

  const columns: Column[] = [
    { key: 'name', header: 'Naam', type: 'leading-text', subtextKey: 'typeWithEni', dotKey: 'isNew' },
    { key: 'location', header: 'Locatie', type: 'text', width: 'w-[140px]', editable: true },
    { key: 'availableFromDate', header: 'Beschikbaar vanaf', type: 'text', width: 'w-[140px]', subtextKey: 'availableFromTime', editable: true },
    { key: 'cargoTypesBadges', header: 'Bijzonderheden', type: 'badges', width: 'w-[160px]' },
    { key: 'tonnage', header: 'Groottonnage', type: 'text', width: 'w-[100px]', align: 'right', editable: true },
    { key: 'capacity', header: 'Inhoud', type: 'text', width: 'w-[90px]', align: 'right', editable: true },
    { key: 'relation', header: 'Relatie', type: 'text', width: 'w-[180px]', textColor: 'text-rdj-text-brand', subtextKey: 'relationContact', onClickKey: 'onRelatieClick' },
    { key: 'source', header: 'Bron', type: 'text', width: 'w-[140px]', subtextKey: 'sourceDate', featuredIconKey: 'sourceIcon', featuredIconVariantKey: 'sourceIconVariant', featuredIconDefaultVariant: 'grey' as const, avatarSrcKey: 'sourceAvatarSrc' },
    {
      key: 'matches', header: 'Matches', type: 'custom', width: 'w-[100px]',
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
    { key: 'ownerLabel', header: 'Eigenaar', type: 'text', width: 'w-[80px]', avatarInitialsKey: 'ownerInitials', editable: true },
    { key: 'priority', header: 'Prioriteit', type: 'rating', width: 'w-[140px]', onRate: handleRate, editable: true },
  ];

  const tableData = filteredItems.map(item => {
    // Split availableFrom into date and time parts
    const parts = item.availableFrom.match(/^(.+?)(\s+\d{1,2}:\d{2})?$/);
    const availableFromDate = parts ? parts[1] : item.availableFrom;
    const availableFromTime = parts && parts[2] ? parts[2].trim() : undefined;

    return {
      id: item.id,
      name: item.name,
      type: item.type,
      typeWithEni: [item.type, item.eni].filter(Boolean).join(' · '),
      isNew: item.id === '1',
      relation: item.relation,
      relationContact: item.relationContact,
      onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === item.relation); if (rel) navigate(`/crm/relatie/${rel.id}`); },
      location: item.location,
      availableFromDate,
      availableFromTime,
      cargoTypesBadges: item.cargoTypes,
      tonnage: item.tonnage,
      capacity: item.capacity,
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
    };
  });

  const { sortedColumns, sortedData } = useTableSort(columns, tableData, {
    initialSortKey: "name",
    initialDirection: "desc",
  });

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="flex min-h-screen bg-rdj-bg-primary">
        <Sidebar />
        
        <div className={`flex-1 ${viewMode === 'map' ? 'flex flex-col overflow-hidden' : 'overflow-auto'} pt-[24px]`}>
          <PageHeader
            title="Markt aanbod"
            actions={
              <button onClick={() => setShowAddModal(true)} className="bg-[#1567a4] relative rounded-[6px] shrink-0 hover:opacity-90">
                <div className="content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[14px] py-[10px] relative rounded-[inherit]">
                  <div className="overflow-clip relative shrink-0 size-[20px]"><div className="absolute inset-[16.67%]"><div className="absolute inset-[-6.25%]"><svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18"><path d="M9 3.75V14.25M3.75 9H14.25" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" /></svg></div></div></div>
                  <div className="content-stretch flex items-center justify-center px-[2px] relative shrink-0"><p className="font-sans font-bold leading-[20px] relative shrink-0 text-[14px] text-white whitespace-nowrap">Toevoegen</p></div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#1567a4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
              </button>
            }
            tabs={[
              { label: 'Ladingen', path: viewMode === 'map' ? '/markt/inbox/ladingen?view=map' : '/markt/inbox/ladingen', isActive: false },
              { label: 'Vaartuigen', path: viewMode === 'map' ? '/markt/inbox/vaartuigen?view=map' : '/markt/inbox/vaartuigen', isActive: true },
            ]}
            filtersLeft={
              <>
                <SegmentedButtonGroup
                  items={[
                    { label: 'Te beoordelen', value: 'te-beoordelen', count: vesselItems.filter(i => i.priority === 0).length },
                    { label: 'Interessant', value: 'interessant', count: vesselItems.filter(i => i.priority >= 3).length },
                    { label: 'Archief', value: 'archief', count: vesselItems.filter(i => i.priority >= 1 && i.priority <= 2).length },
                  ]}
                  value={subView}
                  onChange={(val) => setSubView(val as InboxSubView)}
                />
                <FilterDropdown
                  label="Filter"
                  variant="tertiary"
                  options={['Relatie', 'Regio', 'Tonnage', 'Type vaartuig', 'Beschikbaarheid']}
                />
              </>
            }
            filtersRight={
              <>
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

          {/* Sub-filter row: Relatie / Regio */}
          <div className="px-[24px] pt-[12px] pb-[4px] flex gap-[8px] items-center">
            <FilterDropdown label="Relatie" />
            <FilterDropdown label="Regio" />
          </div>

          {/* Content: Map or Table */}
          {viewMode === 'map' ? (
            <div className="flex-1 px-[24px] pt-[16px] pb-[24px] min-h-0">
              <VesselMapView />
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
              onRowClick={(row) => navigate(`/markt/inbox/vaartuig/${row.id}`)}
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

      <AddInboxItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={() => { setShowAddModal(false); toast.success('Vaartuig toegevoegd aan inbox'); }}
        itemType="vaartuig"
      />
    </>
  );
}