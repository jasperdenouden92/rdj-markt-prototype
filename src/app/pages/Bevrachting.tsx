import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast, Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import DroppableColumn from "../components/DroppableColumn";
import ConditionsModal, { ConditionsData } from "../components/ConditionsModal";
import VesselRemarksModal from "../components/VesselRemarksModal";
import EmailWerklijstModal from "../components/EmailWerklijstModal";
import AddEigenAanbodModal from "../components/AddEigenAanbodModal";
import FilterDropdown from "../components/FilterDropdown";
import SegmentedButtonGroup from "../components/SegmentedButtonGroup";
import Table from "../components/Table";
import type { Column } from "../components/Table";
import useTableSort from "../components/useTableSort";
import Pagination from "../components/Pagination";
import { mockCargos, mockVessels, Cargo, Vessel } from "../data/mock-data";
import * as api from "../data/api";
import { splitColors } from "../utils/splitColors";
import { mockRelaties } from "../data/mock-relatie-data";
import { buildRelatieHoverContent } from "../components/RelatieHoverCard";
import imgEricNieuwkoop from "../../assets/a2737d3b5b234fc04041650cb9f114889c6859da.png";
import imgKhoaNguyen from "../../assets/3627de284acb374a4d9313b3c2dbaeeb87a48224.png";
import imgPelgerDeJong from "../../assets/e7809035038b3816de2a1d67c5de86ebeed325d0.png";
import imgJanWillemVdKraan from "../../assets/9e45f45f537bea4bf653bc0307471e5ff5545f63.png";
import svgPaths from "../../imports/svg-5lxjaeghl9";
import FloatingActionBar from "../components/FloatingActionBar";
import { useBevrachtingData, type BevrachtingCargo, type BevrachtingVessel } from "../data/useMarktData";
import { AnnotationMarker } from "@jasperdenouden92/annotations";

/* ── Status mapping for table view ── */
const statusLabelMap: Record<string, string> = {
  intake: "Intake",
  werklijst: "Werklijst",
  markt: "In de markt",
  gesloten: "Gesloten",
};
const statusVariantMap: Record<string, string> = {
  intake: "brand",
  werklijst: "warning",
  markt: "success",
  gesloten: "grey",
};

export default function Bevrachting() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.includes('/vaartuigen') ? 'vaartuigen' : 'ladingen';
  const { cargos: apiCargos, vessels: apiVessels, loading: apiLoading } = useBevrachtingData();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [modalCargo, setModalCargo] = useState<Cargo | null>(null);
  const [modalVessel, setModalVessel] = useState<Vessel | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  
  const intakeCargos = cargos.filter(c => c.status === 'intake');
  const werklijstCargos = cargos.filter(c => c.status === 'werklijst');
  const marktCargos = cargos.filter(c => c.status === 'markt');
  const geslotenCargos = cargos.filter(c => c.status === 'gesloten');

  const intakeVessels = vessels.filter(v => v.status === 'intake');
  const werklijstVessels = vessels.filter(v => v.status === 'werklijst');
  const marktVessels = vessels.filter(v => v.status === 'markt');
  const geslotenVessels = vessels.filter(v => v.status === 'gesloten');

  const handleDrop = (cargoId: string, newStatus: 'intake' | 'werklijst' | 'markt' | 'gesloten') => {
    const cargo = cargos.find(c => c.id === cargoId);
    if (!cargo) return;

    // If moving to werklijst, show modal
    if (newStatus === 'werklijst' && cargo.status !== 'werklijst') {
      setModalCargo(cargo);
      return;
    }

    // Otherwise just update status
    setCargos(cargos.map(c => 
      c.id === cargoId ? { ...c, status: newStatus } : c
    ));
  };

  const handleVesselDrop = (vesselId: string, newStatus: 'intake' | 'werklijst' | 'markt' | 'gesloten') => {
    const vessel = vessels.find(v => v.id === vesselId);
    if (!vessel) return;

    // If moving to werklijst, show remarks modal
    if (newStatus === 'werklijst' && vessel.status !== 'werklijst') {
      setModalVessel(vessel);
      return;
    }

    setVessels(vessels.map(v =>
      v.id === vesselId ? { ...v, status: newStatus } : v
    ));
  };

  const handleSaveVesselRemarks = (remarks: string) => {
    if (!modalVessel) return;
    setVessels(vessels.map(v =>
      v.id === modalVessel.id ? { ...v, status: 'werklijst' as const, werklijstRemarks: remarks } : v
    ));
    // Persist to in-memory store so the detail page picks it up
    api.patch("vaartuig_eigen", modalVessel.id, { opmerkingMarkt: remarks }).catch(() => {
      // Also try markt variant in case this vessel comes from there
      api.patch("vaartuig_markt", modalVessel.id, { opmerkingMarkt: remarks }).catch(() => {});
    });
    setModalVessel(null);
  };

  const handleSaveConditions = (conditions: ConditionsData) => {
    if (!modalCargo) return;

    // Parse tonnage from the cargo weight string (current card's weight, not the original total)
    // Support range format "0–500 ton X" — use the highest number as total
    const rangeWeightMatch = modalCargo.weight.match(/^([\d.,]+)\s*[–-]\s*([\d.,]+)\s*ton/);
    const singleWeightMatch = modalCargo.weight.match(/([\d.]+)\s*ton/);
    const totalTonnage = rangeWeightMatch
      ? parseFloat(rangeWeightMatch[2].replace(/\./g, ''))
      : (singleWeightMatch ? parseFloat(singleWeightMatch[1].replace(/\./g, '')) : 0);

    // The original total weight (before any splits)
    const originalTotalWeight = modalCargo.splitTotalWeight || modalCargo.weight;

    const minVal = parseFloat(conditions.tonnageMin.replace(/\./g, '').replace(',', '.')) || 0;
    const maxVal = conditions.tonnageMax.trim()
      ? parseFloat(conditions.tonnageMax.replace(/\./g, '').replace(',', '.')) || 0
      : 0;
    const isRange = maxVal > 0 && maxVal !== minVal;

    // Remaining is based on minVal for ranges (max remaining when least goes to werklijst)
    const remainingMax = totalTonnage - minVal;
    const remainingMin = isRange ? totalTonnage - maxVal : remainingMax;
    // There's a remaining split when min > 0 but less than the full cargo.
    // When min is 0 (e.g. rest card "0–3.000"), the card just moves entirely.
    const hasRemaining = minVal > 0 && minVal < totalTonnage;

    // Extract cargo type from weight string (e.g. "Houtpellets (DSIT)")
    const typeMatch = modalCargo.weight.match(/[\d.]+\s*ton\s+(.+)/);
    const cargoType = typeMatch ? typeMatch[1] : '';

    const formatTonnage = (t: number) =>
      t.toLocaleString('nl-NL', { maximumFractionDigits: 0 });

    // Determine the split origin and next split number
    const originId = modalCargo.splitOriginId || modalCargo.id;
    const existingSplits = cargos.filter(c => c.splitOriginId === originId || c.id === originId);
    const maxSplitIndex = existingSplits.reduce((max, c) => Math.max(max, c.splitIndex ?? 0), 0);

    // Assign a color index for this split group (based on how many distinct origins exist)
    const existingOrigins = new Set(cargos.filter(c => c.splitOriginId).map(c => c.splitOriginId!));
    const splitColorIndex = modalCargo.splitColorIndex ?? (existingOrigins.has(originId)
      ? cargos.find(c => c.splitOriginId === originId || (c.id === originId && c.splitColorIndex != null))?.splitColorIndex ?? existingOrigins.size
      : existingOrigins.size);

    if (hasRemaining) {
      const isFirstSplit = maxSplitIndex === 0;
      const nextSplitIndex = isFirstSplit ? 2 : maxSplitIndex + 1;

      // Remaining card shows a range if werklijst was a range, otherwise fixed
      const remainingWeightBase = isRange && remainingMin !== remainingMax
        ? `${formatTonnage(remainingMin)}–${formatTonnage(remainingMax)} ton ${cargoType}`
        : `${formatTonnage(remainingMax)} ton ${cargoType}`;

      // Parse original total for "(van X ton)" display
      const origMatch = originalTotalWeight.match(/([\d.]+)\s*ton/);
      const origTotal = origMatch ? parseFloat(origMatch[1].replace(/\./g, '')) : totalTonnage;

      // The werklijst card is the split-off (#2, #3, ...)
      const werklijstCard: Cargo = {
        ...modalCargo,
        id: `${originId}-${nextSplitIndex}`,
        status: 'werklijst' as const,
        splitIndex: nextSplitIndex,
        splitOriginId: originId,
        splitColorIndex,
        splitTotalWeight: originalTotalWeight,
        conditions: {
          ...modalCargo.conditions,
          markt: conditions,
        },
      };

      // The original card stays in intake as #1 with remaining tonnage
      const intakeCard: Cargo = {
        ...modalCargo,
        id: isFirstSplit ? modalCargo.id : `${originId}-rest`,
        cargo: `${remainingWeightBase} (van ${formatTonnage(origTotal)} ton)`,
        weight: remainingWeightBase,
        status: 'intake' as const,
        splitIndex: 1,
        splitOriginId: originId,
        splitColorIndex,
        splitTotalWeight: originalTotalWeight,
        conditions: undefined,
      };

      setCargos(cargos.flatMap(c =>
        c.id === modalCargo.id ? [intakeCard, werklijstCard] : [c]
      ));
    } else {
      // Full tonnage goes to werklijst — no split
      const werklijstCard: Cargo = {
        ...modalCargo,
        status: 'werklijst' as const,
        splitIndex: maxSplitIndex > 0 ? maxSplitIndex + 1 : undefined,
        splitOriginId: modalCargo.splitOriginId,
        splitColorIndex: modalCargo.splitColorIndex,
        conditions: {
          ...modalCargo.conditions,
          markt: conditions,
        },
      };
      setCargos(cargos.map(c =>
        c.id === modalCargo.id ? werklijstCard : c
      ));
    }

    setModalCargo(null);
  };

  const handleSendEmail = () => {
    // Move all werklijst items to markt
    setCargos(cargos.map(c => 
      c.status === 'werklijst' ? { ...c, status: 'markt' } : c
    ));
    setVessels(vessels.map(v => 
      v.status === 'werklijst' ? { ...v, status: 'markt' } : v
    ));

    // Show success toast
    toast.success('Werklijst succesvol verzonden', {
      description: 'De werklijst is gemaild en alle items zijn naar de markt verplaatst.',
      duration: 4000,
    });
  };

  const tableColumns: Column[] = [
    { key: 'subpartij', header: 'Subpartij', type: 'leading-text', subtextKey: 'subpartijEx', badgeKey: 'leadingBadge', badgeStyleKey: 'leadingBadgeStyle', iconKey: 'exTypeIcon' },
    { key: 'statusLabel', header: 'Status', type: 'status', width: 'w-[140px]', variantKey: 'statusVariant' },
    { key: 'ladingType', header: 'Lading', type: 'text', width: 'w-[160px]', subtextKey: 'ladingSG' },
    { key: 'tonnage', header: 'Tonnage', type: 'text', width: 'w-[120px]', align: 'right' },
    { key: 'laden', header: 'Laden', type: 'text', width: 'w-[180px]', subtextKey: 'ladenDate' },
    { key: 'lossen', header: 'Lossen', type: 'text', width: 'w-[180px]', subtextKey: 'lossenDate' },
    { key: 'relatie', header: 'Relatie', type: 'text', width: 'w-[180px]', textColor: 'text-rdj-text-brand', onClickKey: 'onRelatieClick', hoverContentKey: 'relatieHoverContent' },
    { key: 'biedingenBadges', header: 'Biedingen', type: 'badges', width: 'w-[100px]' },
    { key: 'matchesBadges', header: 'Matches', type: 'badges', width: 'w-[100px]' },
    { key: 'deadline', header: 'Deadline', type: 'text', width: 'w-[140px]' },
    { key: 'eigenaarLabel', header: 'Eigenaar', type: 'text', width: 'w-[60px]', avatarSrcKey: 'eigenaarFoto', avatarInitialsKey: 'eigenaarInitials' },
  ];

  const vesselTableColumns: Column[] = [
    { key: 'vaartuig', header: 'Vaartuig', type: 'leading-text', subtextKey: 'vaartuigType', badgeKey: 'leadingBadge' },
    { key: 'huidigeLocatie', header: 'Huidige locatie', type: 'text', width: 'w-[160px]' },
    { key: 'beschikbaarVanaf', header: 'Beschikbaar vanaf', type: 'text', width: 'w-[140px]' },
    { key: 'statusLabel', header: 'Status', type: 'status', width: 'w-[140px]', variantKey: 'statusVariant' },
    { key: 'bijzonderhedenBadges', header: 'Bijzonderheden', type: 'badges', width: 'w-[160px]' },
    { key: 'binding', header: 'Binding', type: 'text', width: 'w-[100px]' },
    { key: 'groottonnage', header: 'Groottonnage', type: 'text', width: 'w-[100px]', align: 'right' },
    { key: 'inhoud', header: 'Inhoud', type: 'text', width: 'w-[90px]', align: 'right' },
    { key: 'biedingenBadges', header: 'Biedingen', type: 'badges', width: 'w-[100px]' },
    { key: 'matchesBadges', header: 'Matches', type: 'badges', width: 'w-[100px]' },
    { key: 'deadline', header: 'Deadline', type: 'text', width: 'w-[140px]' },
    { key: 'eigenaarLabel', header: 'Eigenaar', type: 'text', width: 'w-[60px]', avatarSrcKey: 'eigenaarFoto', avatarInitialsKey: 'eigenaarInitials' },
  ];

  const tableData = cargos.map(c => {
    // Extract cargo type from weight string
    const cargoMatch = c.cargo.match(/[\d.]+\s*ton\s+(.+)/);
    const rawType = cargoMatch ? cargoMatch[1] : c.cargo;
    const sgMatch = rawType.match(/\(([^)]+)\)/);
    const ladingType = rawType.replace(/\s*\([^)]+\)/, '').trim();
    const ladingSG = sgMatch ? `SG ${sgMatch[1]}` : '';

    // Extract tonnage - show range from conditions if available
    let tonnage: string;
    if (c.conditions?.markt) {
      const { tonnageMin, tonnageMax } = c.conditions.markt;
      tonnage = tonnageMax ? `${tonnageMin}–${tonnageMax} t` : `${tonnageMin} t`;
    } else {
      const tonMatch = c.weight.match(/([\d.]+)\s*ton/);
      tonnage = tonMatch ? `${tonMatch[1]} t` : c.weight;
    }

    // Mock deadlines per status
    const deadlineMap: Record<string, string> = {
      intake: '',
      werklijst: 'Vandaag, 17:00',
      markt: 'Morgen, 12:00',
      gesloten: 'Verlopen',
    };

    // Mock owner data
    const owners = [
      { initials: 'KN', foto: imgKhoaNguyen },
      { initials: 'PJ', foto: imgPelgerDeJong },
      { initials: 'JK', foto: imgJanWillemVdKraan },
      { initials: '', foto: '' },
      { initials: 'EN', foto: imgEricNieuwkoop },
      { initials: 'PJ', foto: imgPelgerDeJong },
    ];
    const ownerIdx = parseInt(c.id.replace(/\D/g, ''), 10) % owners.length;

    return {
      id: c.id,
      subpartij: c.title,
      subpartijEx: c.code,
      exTypeIcon: c.exType,
      statusLabel: statusLabelMap[c.status],
      statusVariant: statusVariantMap[c.status],
      ladingType,
      ladingSG,
      tonnage,
      laden: c.from,
      ladenDate: c.fromDate,
      lossen: c.to,
      lossenDate: c.toDate,
      relatie: c.company ?? '',
      onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === c.company); if (rel) navigate(`/crm/relatie/${rel.id}`); },
      relatieHoverContent: buildRelatieHoverContent(c.company),
      biedingenBadges: c.bids != null ? [`${c.bids}`] : [],
      matchesBadges: c.matches != null ? [`${c.matches}`] : [],
      deadline: deadlineMap[c.status] ?? '',
      eigenaarLabel: '',
      eigenaarInitials: owners[ownerIdx].initials || undefined,
      eigenaarFoto: owners[ownerIdx].foto || undefined,
      leadingBadge: c.splitIndex != null ? `#${c.splitIndex}` : (c.status === 'markt' ? 'Markt' : undefined),
      leadingBadgeStyle: c.splitIndex != null && c.splitColorIndex != null ? (() => {
        const color = splitColors[c.splitColorIndex % splitColors.length];
        return { backgroundColor: color.bg, color: color.text, borderColor: color.border };
      })() : undefined,
    };
  });

  const bijzonderhedenOptions = [['KS', 'LR', 'GMP', 'LP'], ['KS', 'LR', 'GMP'], ['KS', 'LR'], ['GMP', 'LP'], ['KS']];
  const bindingOptions = ['Vast', 'Regie', 'Flex', 'Vast', 'Regie'];
  const vesselTableData = vessels.map((v, idx) => {
    const deadlineMap: Record<string, string> = {
      intake: '',
      werklijst: 'Vandaag, 17:00',
      markt: 'Morgen, 12:00',
      gesloten: 'Verlopen',
    };
    const vesselOwners = [
      { initials: 'KN', foto: imgKhoaNguyen },
      { initials: 'PJ', foto: imgPelgerDeJong },
      { initials: 'JK', foto: imgJanWillemVdKraan },
      { initials: 'EN', foto: imgEricNieuwkoop },
    ];
    const ownerIdx = idx % vesselOwners.length;
    const tonMatch = v.weight.match(/([\d.]+)/);
    const tonnageNum = tonMatch ? tonMatch[1] : v.weight;
    const capacityMap: Record<string, string> = { 'VSL001': '4.200 m³', 'VSL002': '3.500 m³', 'VSL003': '4.200 m³', 'VSL004': '4.200 m³' };
    const bidsCount = [3, 0, 1, 5];

    return {
      id: v.id,
      vaartuig: v.title,
      vaartuigType: v.vesselType === 'Motorschip' ? 'Motorvaartuig' : 'Duwbak',
      huidigeLocatie: v.location ?? v.from ?? '',
      beschikbaarVanaf: v.fromDate?.replace('Sinds ', '') ?? '',
      statusLabel: statusLabelMap[v.status],
      statusVariant: statusVariantMap[v.status],
      bijzonderhedenBadges: bijzonderhedenOptions[idx % bijzonderhedenOptions.length],
      binding: bindingOptions[idx % bindingOptions.length],
      groottonnage: `${tonnageNum} mt`,
      inhoud: capacityMap[v.id] ?? '3.800 m³',
      biedingenBadges: bidsCount[idx % bidsCount.length] > 0 ? [`${bidsCount[idx % bidsCount.length]}`] : [],
      matchesBadges: v.matches != null ? [`${v.matches}`] : [],
      deadline: deadlineMap[v.status] ?? '',
      eigenaarLabel: '',
      eigenaarInitials: vesselOwners[ownerIdx].initials,
      eigenaarFoto: vesselOwners[ownerIdx].foto,
      leadingBadge: v.status === 'markt' ? 'Markt' : undefined,
    };
  });

  const { sortedColumns: sortedCargoColumns, sortedData: sortedCargoData } = useTableSort(tableColumns, tableData);
  const { sortedColumns: sortedVesselColumns, sortedData: sortedVesselData } = useTableSort(vesselTableColumns, vesselTableData);

  // Load from API when data arrives, fallback to mock data if API returns empty
  useEffect(() => {
    if (apiLoading || apiLoaded) return;
    setApiLoaded(true);
    setCargos(apiCargos.length > 0 ? apiCargos as unknown as Cargo[] : mockCargos);
    setVessels(apiVessels.length > 0 ? apiVessels as unknown as Vessel[] : mockVessels);
  }, [apiCargos, apiVessels, apiLoading, apiLoaded]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Toaster position="top-right" richColors />
      <div className="flex min-h-screen bg-rdj-bg-primary">
        <Sidebar data-annotation-id="bevrachting-navigatie" />
        
        <div className="flex-1 overflow-auto pt-[24px]">
          {/* Header Section */}
          <PageHeader
            title="Eigen aanbod"
            titleMeta={
              <p className="font-sans font-normal leading-[0] overflow-hidden relative shrink-0 text-[#344054] text-[12px] text-ellipsis whitespace-nowrap">
                <span className="leading-[18px]">{`Laatste werklijst gemaild `}</span>
                <span className="font-sans font-bold leading-[18px]">vandaag om 9:00</span>
                <span className="leading-[18px]">{` door `}</span>
                <span className="font-sans font-bold leading-[18px]">Khoa Nguyen</span>
              </p>
            }
            actions={
              <>
                <button onClick={() => setShowEmailModal(true)} className="bg-rdj-bg-primary relative rounded-[6px] shrink-0">
                  <div className="content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[14px] py-[10px] relative rounded-[inherit]">
                    <div className="overflow-clip relative shrink-0 size-[20px]"><div className="absolute inset-[9.96%_9.96%_9.91%_9.9%]"><div className="absolute inset-[-5.2%]"><svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.6933 17.6933"><path d={svgPaths.p31aa2800} stroke="var(--stroke-0, #344054)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" /></svg></div></div></div>
                    <div className="content-stretch flex items-center justify-center px-[2px] relative shrink-0"><p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">Werklijst e-mailen</p></div>
                  </div>
                  <div aria-hidden="true" className="absolute border border-rdj-border-primary border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
                </button>
                <button onClick={() => setShowAddModal(true)} className="bg-[#1567a4] relative rounded-[6px] shrink-0">
                  <div className="content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[14px] py-[10px] relative rounded-[inherit]">
                    <div className="overflow-clip relative shrink-0 size-[20px]"><div className="absolute inset-[20.83%]"><div className="absolute inset-[-7.14%]"><svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333"><path d={svgPaths.p1b67fa00} stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" /></svg></div></div></div>
                    <div className="content-stretch flex items-center justify-center px-[2px] relative shrink-0"><p className="font-sans font-bold leading-[20px] relative shrink-0 text-[14px] text-white whitespace-nowrap">Toevoegen</p></div>
                  </div>
                  <div aria-hidden="true" className="absolute border border-[#1567a4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
                </button>
              </>
            }
            tabs={[
              { label: 'Ladingen', path: '/markt/bevrachting/ladingen', isActive: activeTab === 'ladingen' },
              { label: 'Vaartuigen', path: '/markt/bevrachting/vaartuigen', isActive: activeTab === 'vaartuigen' },
            ]}
          />

          {/* Filters - Bevrachting-specific with extra top padding */}
          <div className="relative shrink-0 w-full pt-[32px]">
            <div className="flex flex-row items-center size-full">
              <div className="content-stretch flex gap-[16px] items-center px-[24px] relative w-full">
                <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
                  <FilterDropdown
                    label="Jan 1, 2026 &#8211; Jan 31, 2026"
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
                  <FilterDropdown label="Laadregio" />
                  <FilterDropdown label="Losregio" />
                </div>
                <button className="content-stretch flex gap-[4px] items-center relative shrink-0"><div className="overflow-clip relative shrink-0 size-[20px]"><div className="absolute inset-[12.5%]"><div className="absolute inset-[-5.56%]"><svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667"><path d={svgPaths.p3190da80} stroke="var(--stroke-0, #1567A4)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" /></svg></div></div></div><div className="content-stretch flex items-center justify-center px-[2px] relative shrink-0"><p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#145990] text-[14px] whitespace-nowrap">Filter</p></div></button>
                <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center justify-end min-h-px min-w-px relative">
                  <SegmentedButtonGroup
                    items={[
                      { value: 'kanban', icon: (<svg fill="none" viewBox="0 0 20 20"><rect x="2.5" y="2.5" width="6" height="15" rx="1" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" /><rect x="11.5" y="2.5" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" /></svg>) },
                      { value: 'table', icon: (<svg fill="none" viewBox="0 0 20 20"><path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.67" /></svg>) },
                    ]}
                    value={viewMode}
                    onChange={(val) => setViewMode(val as 'kanban' | 'table')}
                  />
                  <div className="bg-white h-[40px] relative rounded-[6px] shrink-0 max-w-[320px] w-full"><div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full"><div className="content-stretch flex items-center px-[14px] py-[8px] relative size-full"><div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative"><div className="overflow-clip relative shrink-0 size-[20px]"><div className="absolute inset-[12.5%]"><div className="absolute inset-[-5.56%]"><svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667"><path d={svgPaths.p3190da80} stroke="var(--stroke-0, #667085)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" /></svg></div></div></div><p className="flex-[1_0_0] font-sans font-normal h-[18px] leading-[20px] min-h-px min-w-px overflow-hidden relative text-[#667085] text-[14px] text-ellipsis text-left whitespace-nowrap">Zoeken</p></div></div></div><div aria-hidden="true" className="absolute border border-[#d0d5dd] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content: Kanban or Table */}
          {viewMode === 'kanban' ? (
          <div className="px-[24px] py-[24px]">
            <div className="grid grid-cols-4 gap-[16px] items-start">
              {activeTab === 'ladingen' ? (
                <>
                  <DroppableColumn
                    title="Intake"
                    status="intake"
                    items={intakeCargos}
                    onDrop={handleDrop}
                    type="cargo"
                    wrapCard={(card, _item, index) =>
                      index === 0 ? (
                        <AnnotationMarker key="first-intake-cargo" annotationId="7f82648d-b174-4030-9eb8-9309efaf4ccd">
                          {card}
                        </AnnotationMarker>
                      ) : card
                    }
                  />
                  <DroppableColumn
                    title="Werklijst"
                    status="werklijst"
                    items={werklijstCargos}
                    onDrop={handleDrop}
                    type="cargo"
                  />
                  <DroppableColumn
                    title="In de markt"
                    status="markt"
                    items={marktCargos}
                    onDrop={handleDrop}
                    type="cargo"
                  />
                  <DroppableColumn
                    title="Gesloten"
                    status="gesloten"
                    items={geslotenCargos}
                    onDrop={handleDrop}
                    type="cargo"
                  />
                </>
              ) : (
                <>
                  <DroppableColumn
                    title="Intake"
                    status="intake"
                    items={intakeVessels}
                    onDrop={handleVesselDrop}
                    type="vessel"
                  />
                  <DroppableColumn
                    title="Werklijst"
                    status="werklijst"
                    items={werklijstVessels}
                    onDrop={handleVesselDrop}
                    type="vessel"
                  />
                  <DroppableColumn
                    title="In de markt"
                    status="markt"
                    items={marktVessels}
                    onDrop={handleVesselDrop}
                    type="vessel"
                  />
                  <DroppableColumn
                    title="Gesloten"
                    status="gesloten"
                    items={geslotenVessels}
                    onDrop={handleVesselDrop}
                    type="vessel"
                  />
                </>
              )}
            </div>
          </div>
          ) : (
          <div>
            <Pagination data-annotation-id="bevrachting-paginering-2"
              currentPage={currentPage}
              totalItems={activeTab === 'ladingen' ? cargos.length : vessels.length}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={setRowsPerPage}
            />
            <Table data-annotation-id="bevrachting-tabel"
              columns={activeTab === 'ladingen' ? sortedCargoColumns : sortedVesselColumns}
              data={activeTab === 'ladingen' ? sortedCargoData : sortedVesselData}
              onRowClick={(row) => navigate(`/markt/bevrachting/${activeTab === 'ladingen' ? 'lading' : 'vaartuig'}/${row.id}`)}
              hoveredRowId={hoveredRow}
              onRowHover={setHoveredRow}
            />
            <Pagination data-annotation-id="bevrachting-paginering"
              currentPage={currentPage}
              totalItems={activeTab === 'ladingen' ? cargos.length : vessels.length}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </div>
          )}
        </div>
        
        {/* Conditions Modal */}
        {modalCargo && (
          <ConditionsModal
            cargo={modalCargo}
            onClose={() => setModalCargo(null)}
            onSave={handleSaveConditions}
          />
        )}

        {/* Vessel Remarks Modal */}
        {modalVessel && (
          <VesselRemarksModal
            vessel={modalVessel}
            onClose={() => setModalVessel(null)}
            onSave={handleSaveVesselRemarks}
          />
        )}

        {/* Email Werklijst Modal */}
        {showEmailModal && (
          <EmailWerklijstModal
            onClose={() => setShowEmailModal(false)}
            onSend={handleSendEmail}
          />
        )}

        {/* Add Eigen Aanbod Modal */}
        <AddEigenAanbodModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={() => setShowAddModal(false)}
        />
      </div>

      {/* Multi-select Action Bar */}
      {viewMode === 'table' && selectedItems.length > 0 && (
        <FloatingActionBar
          selectedCount={selectedItems.length}
          totalCount={cargos.length}
          itemLabel="ladingen"
          onSelectAll={() => {
            if (selectedItems.length === cargos.length) {
              setSelectedItems([]);
            } else {
              setSelectedItems(cargos.map(c => c.id));
            }
          }}
          onArchive={() => setSelectedItems([])}
          onNegotiate={() => setSelectedItems([])}
        />
      )}

    </DndProvider>
  );
}