import { useState, useRef, useEffect, type ReactNode } from "react";

/**
 * SectionHeader — title bar above a content section (e.g. table).
 *
 * Left side:  section title
 * Right side: optional filter dropdown (tertiary brand) + optional add button (secondary icon-only)
 */

export interface SectionHeaderProps {
  /** Section title */
  title: string;

  /** Filter dropdown — tertiary brand button with chevron-down trailing */
  filterLabel?: string;
  filterOptions?: string[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;

  /** Add button — icon-only with plus */
  onAdd?: () => void;
  addTooltip?: string;
  /** Use primary (brand) style for the add button */
  addPrimary?: boolean;

  /** Completely custom right-side content (overrides filter + add) */
  actions?: ReactNode;
}

export default function SectionHeader({
  title,
  filterLabel,
  filterOptions,
  filterValue,
  onFilterChange,
  onAdd,
  addTooltip,
  addPrimary,
  actions,
}: SectionHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const displayLabel = filterValue || filterLabel || "Filter";

  return (
    <div className="flex items-center justify-between px-[24px] py-[12px]">
      {/* Title */}
      <p className="font-sans font-bold leading-[26px] text-rdj-text-primary text-[18px]">
        {title}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-[6px]">
        {actions ? (
          actions
        ) : (
          <>
            {/* Filter dropdown — tertiary brand button */}
            {(filterLabel || filterOptions) && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="content-stretch flex gap-[6px] items-center justify-center overflow-clip relative shrink-0 cursor-pointer"
                >
                  <p className="font-sans font-bold leading-[20px] relative shrink-0 text-rdj-text-brand text-[14px] whitespace-nowrap">
                    {displayLabel}
                  </p>
                  {/* Chevron down */}
                  <div className="overflow-clip relative shrink-0 size-[20px]">
                    <svg
                      className="block size-full"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="var(--color-rdj-text-brand)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.66667"
                      />
                    </svg>
                  </div>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && filterOptions && filterOptions.length > 0 && (
                  <div className="absolute right-0 top-full mt-[4px] bg-white rounded-[8px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] border border-rdj-border-secondary z-20 min-w-[200px] py-[4px]">
                    {filterOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          onFilterChange?.(option);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-[14px] py-[10px] font-sans font-normal text-[14px] leading-[20px] hover:bg-rdj-bg-primary-hover transition-colors ${
                          option === filterValue
                            ? "text-rdj-text-brand font-bold font-sans"
                            : "text-rdj-text-primary"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add button */}
            {onAdd && (
              <button
                onClick={onAdd}
                title={addTooltip}
                className={`relative rounded-[6px] shrink-0 transition-colors cursor-pointer ${addPrimary ? "bg-[#1567a4] hover:opacity-90 text-white" : "bg-white hover:bg-rdj-bg-primary-hover"}`}
              >
                <div className="content-stretch flex items-center justify-center overflow-clip p-[8px] relative rounded-[inherit]">
                  <div className="overflow-clip relative shrink-0 size-[20px]">
                    <svg
                      className="block size-full"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M10 4.16667V15.8333M4.16667 10H15.8333"
                        stroke={addPrimary ? "white" : "var(--color-rdj-text-primary)"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.66667"
                      />
                    </svg>
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="absolute border border-rdj-border-primary border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
                />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
