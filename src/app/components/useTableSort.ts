import { useState, useMemo, useCallback } from "react";
import type { Column, RowData } from "./Table";

type SortDirection = "asc" | "desc";

interface UseTableSortOptions {
  /** Initial column key to sort by */
  initialSortKey?: string;
  /** Initial sort direction (default: "asc") */
  initialDirection?: SortDirection;
}

interface UseTableSortResult {
  /** Data sorted according to current sort state */
  sortedData: RowData[];
  /** Columns with sortActive, sortDirection, and onSort wired up */
  sortedColumns: Column[];
}

/**
 * Hook that adds sorting behaviour to the Table component.
 * Returns sorted data and columns with sort props wired up.
 */
export default function useTableSort(
  columns: Column[],
  data: RowData[],
  options: UseTableSortOptions = {},
): UseTableSortResult {
  const [sortKey, setSortKey] = useState<string | null>(
    options.initialSortKey ?? columns[0]?.key ?? null,
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    options.initialDirection ?? "asc",
  );

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection("asc");
      }
    },
    [sortKey],
  );

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // Handle nullish values — push them to the end
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), "nl", {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDirection]);

  const sortedColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        sortActive: col.key === sortKey,
        sortDirection: col.key === sortKey ? sortDirection : undefined,
        onSort: () => handleSort(col.key),
      })),
    [columns, sortKey, sortDirection, handleSort],
  );

  return { sortedData, sortedColumns };
}
