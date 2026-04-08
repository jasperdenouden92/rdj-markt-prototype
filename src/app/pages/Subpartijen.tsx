import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";
import type { Column, RowData } from "../components/Table";
import useTableSort from "../components/useTableSort";
import Pagination from "../components/Pagination";
import { subpartijen, partijen } from "../data/entities/partijen";
import { havens } from "../data/entities/havens";
import { mockBijzonderheden } from "../data/mock-contract-data";
import { formatDate } from "../utils/formatDate";

export default function Subpartijen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return subpartijen;
    const q = search.toLowerCase();
    return subpartijen.filter((s) => {
      const partij = partijen.find((p) => p.id === s.partijId);
      return (
        s.naam.toLowerCase().includes(q) ||
        (partij?.naam.toLowerCase().includes(q) ?? false)
      );
    });
  }, [search]);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const columns: Column[] = [
    {
      key: "naam",
      header: "Subpartij",
      type: "leading-text",
      subtextKey: "partijNaam",
      actionLabel: "Openen",
    },
    {
      key: "routeLabel",
      header: "Route",
      type: "text",
      width: "w-[220px]",
    },
    {
      key: "laaddatumLabel",
      header: "Laaddatum",
      type: "deadline",
      expiredKey: "laaddatumExpired",
      width: "w-[140px]",
    },
    {
      key: "losdatumLabel",
      header: "Losdatum",
      type: "deadline",
      expiredKey: "losdatumExpired",
      width: "w-[140px]",
    },
    {
      key: "bijzonderhedenLabel",
      header: "Bijzonderheden",
      type: "text",
      width: "w-[180px]",
    },
  ];

  const tableData: RowData[] = paged.map((s) => {
    const partij = partijen.find((p) => p.id === s.partijId);
    const laadlocatie = partij ? havens.find((h) => h.id === partij.laadlocatieId) : undefined;
    const loslocatie = havens.find((h) => h.id === s.loslocatieId);
    const bijz = s.bijzonderheidIds
      .map((bid) => mockBijzonderheden.find((b) => b.id === bid))
      .filter(Boolean)
      .map((b) => b!.naam);

    return {
      id: s.id,
      naam: s.naam,
      partijNaam: partij?.naam || "—",
      routeLabel: [laadlocatie?.naam, loslocatie?.naam].filter(Boolean).join(" → "),
      laaddatumLabel: formatDate(s.laaddatum),
      laaddatumExpired: s.laaddatum ? new Date(s.laaddatum) < new Date() : false,
      losdatumLabel: formatDate(s.losdatum),
      losdatumExpired: s.losdatum ? new Date(s.losdatum) < new Date() : false,
      bijzonderhedenLabel: bijz.length > 0 ? bijz.join(", ") : "—",
    };
  });

  const { sortedColumns, sortedData } = useTableSort(columns, tableData);

  return (
    <div className="flex min-h-screen bg-rdj-bg-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <div className="pt-[32px] pb-[8px]">
          <PageHeader
            title="Subpartijen"
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
                  placeholder="Zoek op naam..."
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
          data={sortedData}
          hoveredRowId={hoveredRow}
          onRowHover={setHoveredRow}
          onRowClick={(row) => {
            navigate(`/lading/subpartij/${row.id}`);
          }}
        />
      </div>
    </div>
  );
}
