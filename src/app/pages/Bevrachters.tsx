import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import type { Column, RowData } from "../components/Table";
import Pagination from "../components/Pagination";
import FilterDropdown from "../components/FilterDropdown";
import Button from "../components/Button";
import ConversationDialog from "../components/ConversationDialog";
import useTableSort from "../components/useTableSort";
import { mockRelaties, mockContactPersonen, mockGebruikers, mockRelatieCounts } from "../data/mock-relatie-data";
import { mockTaken } from "../data/mock-taken-data";
import { formatDate } from "../utils/formatDate";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function isDateExpired(dateStr?: string, daysThreshold = 30): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  return diff > daysThreshold * 24 * 60 * 60 * 1000;
}

export default function Bevrachters() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [soortRelatieFilter, setSoortRelatieFilter] = useState<string[]>([]);
  const [eigenaarFilter, setEigenaarFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [conversationRelatie, setConversationRelatie] = useState<{ id: string; naam: string } | null>(null);

  const relaties = useMemo(
    () => mockRelaties.filter((r) => r.status === "actief"),
    []
  );

  const eigenaarOptions = useMemo(
    () => ["Alle eigenaren", ...mockGebruikers.map((g) => g.naam)],
    []
  );
  const soortRelatieOptions = ["Alle relaties", "Bevrachters", "Lading eigenaren", "Vaartuig eigenaren"];
  const soortRelatieValueMap: Record<string, string> = {
    "Bevrachters": "bevrachter",
    "Lading eigenaren": "lading-eigenaar",
    "Vaartuig eigenaren": "scheepseigenaar",
  };

  const filtered = useMemo(() => {
    return relaties.filter((r) => {
      if (search && !r.naam.toLowerCase().includes(search.toLowerCase())) return false;
      if (soortRelatieFilter.length > 0) {
        const filterValues = soortRelatieFilter.map((label) => soortRelatieValueMap[label]).filter(Boolean);
        if (!filterValues.some((v) => (r.soortRelatie || []).includes(v))) return false;
      }
      if (eigenaarFilter.length > 0) {
        const eigenaar = mockGebruikers.find((g) => g.id === r.eigenaarId);
        if (!eigenaar || !eigenaarFilter.includes(eigenaar.naam)) return false;
      }
      return true;
    });
  }, [relaties, search, soortRelatieFilter, eigenaarFilter]);


  const onderhandelingIcon = (
    <svg className="size-[16px]" fill="none" viewBox="0 0 20 20">
      <path
        d="M4 4C3.44772 4 3 4.44772 3 5V13C3 13.5523 3.44772 14 4 14H6V16.5L9.5 14H16C16.5523 14 17 13.5523 17 13V5C17 4.44772 16.5523 4 16 4H4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10 7V11M8 9H12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const columns: Column[] = [
    {
      key: "naam",
      header: "Bedrijfsnaam",
      type: "leading-text",
      subtextKey: "plaatsLabel",
      actionLabel: "Openen",
      extraActionsKey: "extraActions",
      minWidth: "min-w-[480px]",
    },
    {
      key: "ladingenBadge",
      header: "Ladingen",
      type: "badges",
      defaultVariant: "grey",
      maxVisible: 1,
      width: "w-[100px]",
    },
    {
      key: "vaartuigenBadge",
      header: "Vaartuigen",
      type: "badges",
      defaultVariant: "grey",
      maxVisible: 1,
      width: "w-[100px]",
    },
    {
      key: "onderhandelingenBadge",
      header: "Onderhandelingen",
      type: "badges",
      defaultVariant: "grey",
      maxVisible: 1,
      width: "w-[130px]",
    },
    {
      key: "takenBadge",
      header: "Taken",
      type: "badges",
      defaultVariant: "grey",
      maxVisible: 1,
      width: "w-[80px]",
    },
    {
      key: "eigenaarNaam",
      header: "Eigenaar",
      type: "text",
      avatarSrcKey: "eigenaarFoto",
      avatarInitialsKey: "eigenaarInitials",
      width: "w-[160px]",
    },
    {
      key: "laatsteContactLabel",
      header: "Laatste contact",
      type: "deadline",
      expiredKey: "contactExpired",
      width: "w-[140px]",
    },
  ];

  const allTableData: RowData[] = useMemo(() => filtered.map((r) => {
    const eigenaar = mockGebruikers.find((g) => g.id === r.eigenaarId);
    const counts = mockRelatieCounts[r.id] || { ladingen: 0, vaartuigen: 0, onderhandelingen: 0 };
    const openTakenCount = mockTaken.filter((t) => t.relatieId === r.id && t.status === "open").length;
    return {
      id: r.id,
      naam: r.naam,
      plaatsLabel: [r.plaats, r.land].filter(Boolean).join(", ") || "—",
      extraActions: (
        <Button
          variant="secondary"
          size="sm"
          icon={onderhandelingIcon}
          title="Gesprek starten"
          onClick={(e) => {
            e.stopPropagation();
            setConversationRelatie({ id: r.id, naam: r.naam });
          }}
        />
      ),
      ladingenBadge: counts.ladingen > 0 ? [String(counts.ladingen)] : [],
      vaartuigenBadge: counts.vaartuigen > 0 ? [String(counts.vaartuigen)] : [],
      onderhandelingenBadge: counts.onderhandelingen > 0 ? [String(counts.onderhandelingen)] : [],
      takenBadge: openTakenCount > 0 ? [String(openTakenCount)] : [],
      eigenaarNaam: eigenaar?.naam || "—",
      eigenaarInitials: eigenaar ? getInitials(eigenaar.naam) : undefined,
      eigenaarFoto: eigenaar?.profielfoto || undefined,
      laatsteContactLabel: formatDate(r.laatsteContact),
      contactExpired: isDateExpired(r.laatsteContact),
    };
  }), [filtered, onderhandelingIcon]);

  const { sortedData, sortedColumns } = useTableSort(columns, allTableData, {
    initialSortKey: "naam",
    initialDirection: "asc",
  });

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  return (
    <div className="flex min-h-screen bg-rdj-bg-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <div className="pt-[32px] pb-[8px]">
          <PageHeader
            title="Relaties"
            filtersLeft={
              <>
                <FilterDropdown
                  label="Relatiesoort"
                  options={soortRelatieOptions}
                  allLabel="Alle relaties"
                  selectedValues={soortRelatieFilter}
                  onMultiSelect={(v) => { setSoortRelatieFilter(v); setCurrentPage(1); }}
                />
                <FilterDropdown
                  label="Eigenaar"
                  options={eigenaarOptions}
                  allLabel="Alle eigenaren"
                  selectedValues={eigenaarFilter}
                  onMultiSelect={(v) => { setEigenaarFilter(v); setCurrentPage(1); }}
                />
              </>
            }
            filtersRight={
              <div className="relative">
                <div className="absolute left-[12px] top-1/2 -translate-y-1/2 size-[16px] text-[#667085]">
                  <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                    <path d="M14 14L10.0667 10.0667M11.3333 6.66667C11.3333 9.244 9.244 11.3333 6.66667 11.3333C4.08934 11.3333 2 9.244 2 6.66667C2 4.08934 4.08934 2 6.66667 2C9.244 2 11.3333 4.08934 11.3333 6.66667Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Zoek op bedrijfsnaam..."
                  className="bg-rdj-bg-primary border border-rdj-border-primary rounded-[6px] pl-[36px] pr-[12px] py-[8px] font-sans font-normal text-[14px] leading-[20px] text-rdj-text-primary placeholder:text-rdj-text-tertiary focus:outline-none focus:border-[#1567a4] focus:ring-1 focus:ring-[#1567a4] w-[240px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
                />
              </div>
            }
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
        />

        <Table
          columns={sortedColumns}
          data={pagedData}
          hoveredRowId={hoveredRow}
          onRowHover={setHoveredRow}
          onRowClick={(row) => navigate(`/markt/relaties/${row.id}`)}
        />
      </div>

      {conversationRelatie && (
        <ConversationDialog
          relatieId={conversationRelatie.id}
          relatieName={conversationRelatie.naam}
          onClose={() => setConversationRelatie(null)}
        />
      )}
    </div>
  );
}
