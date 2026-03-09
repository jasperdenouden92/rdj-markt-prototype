import { useState, useRef, useEffect } from "react";
import svgPaths from "../../imports/svg-97w2qbrm42";

interface PaginationProps {
  /** Current page (1-based) */
  currentPage: number;
  /** Total number of items */
  totalItems: number;
  /** Rows per page */
  rowsPerPage: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when rows per page changes */
  onRowsPerPageChange: (rowsPerPage: number) => void;
  /** Available rows per page options */
  rowsPerPageOptions?: number[];
}

function PaginationDropdown({
  value,
  options,
  onSelect,
  width = "w-[80px]",
}: {
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  width?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex flex-col items-start relative shrink-0 ${width}`}
      >
        <div className="bg-rdj-bg-primary relative rounded-[6px] shrink-0 w-full">
          <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative w-full">
              <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative">
                <p className="font-sans font-normal leading-[20px] relative shrink-0 text-rdj-text-primary text-[14px] text-left whitespace-nowrap">
                  {value}
                </p>
              </div>
              <div className="overflow-clip relative shrink-0 size-[20px]">
                <div className="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]">
                  <div className="absolute inset-[-16.67%_-8.33%]">
                    <svg
                      className="block size-full"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 11.6667 6.66667"
                    >
                      <path
                        d={svgPaths.p1b1fa300}
                        stroke="#667085"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.66667"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute border border-rdj-border-primary border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-[4px] bg-rdj-bg-primary border border-rdj-border-secondary rounded-[8px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] z-50 min-w-full overflow-hidden">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-[12px] py-[8px] font-sans font-normal text-[14px] leading-[20px] hover:bg-rdj-bg-secondary transition-colors cursor-pointer whitespace-nowrap ${
                option === value
                  ? "text-[#1567a4] bg-[#f0f7fc]"
                  : "text-rdj-text-primary"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString("nl-NL");
}

export default function Pagination({
  currentPage,
  totalItems,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="content-stretch flex items-center justify-between px-[24px] py-[20px] relative w-full">
      {/* Left: rows per page */}
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
        <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">
          Regels per pagina
        </p>
        <PaginationDropdown
          value={String(rowsPerPage)}
          options={rowsPerPageOptions.map(String)}
          onSelect={(val) => {
            onRowsPerPageChange(Number(val));
            onPageChange(1);
          }}
          width="w-[80px]"
        />
      </div>

      {/* Right: navigation */}
      <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
        {/* Item range text */}
        <p className="font-sans font-normal leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">
          {formatNumber(startItem)} tot {formatNumber(endItem)} van{" "}
          {formatNumber(totalItems)}
        </p>

        {/* Previous button */}
        <button
          onClick={() => canGoPrev && onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className={`flex items-center justify-center p-[8px] rounded-[6px] shrink-0 ${
            canGoPrev
              ? "cursor-pointer hover:bg-[#f2f4f7]"
              : "opacity-40 cursor-not-allowed"
          }`}
        >
          <div className="overflow-clip relative shrink-0 size-[20px]">
            <div className="absolute inset-[20.83%]">
              <div className="absolute inset-[-7.14%]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 13.3333 13.3333"
                >
                  <path
                    d={svgPaths.p3ba8b580}
                    stroke="#475467"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.66667"
                  />
                </svg>
              </div>
            </div>
          </div>
        </button>

        {/* Page dropdown */}
        <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
          <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">
            Pagina
          </p>
          <PaginationDropdown
            value={String(currentPage)}
            options={Array.from({ length: totalPages }, (_, i) =>
              String(i + 1)
            )}
            onSelect={(val) => onPageChange(Number(val))}
            width="w-[64px]"
          />
          <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">
            van {totalPages}
          </p>
        </div>

        {/* Next button */}
        <button
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={`flex items-center justify-center p-[8px] rounded-[6px] shrink-0 ${
            canGoNext
              ? "cursor-pointer hover:bg-[#f2f4f7]"
              : "opacity-40 cursor-not-allowed"
          }`}
        >
          <div className="overflow-clip relative shrink-0 size-[20px]">
            <div className="absolute inset-[20.83%]">
              <div className="absolute inset-[-7.14%]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 13.3333 13.3333"
                >
                  <path
                    d={svgPaths.p19aed710}
                    stroke="#475467"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.66667"
                  />
                </svg>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}