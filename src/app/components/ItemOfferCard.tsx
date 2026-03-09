import { useState, useEffect, useRef, useCallback } from "react";
import { list, type VaartuigEigen, type VaartuigMarkt, type LadingEigen, type LadingMarkt } from "../data/api";
import Button from "./Button";

/**
 * ItemOfferCard — component to select a vaartuig (when on a lading) or a lading (when on a vaartuig).
 *
 * Empty state:  label + secondary brand button with plus icon
 * Attached:     label + card showing the item, with tertiary icon-only detach button top-right
 */

interface ItemOption {
  id: string;
  naam: string;
  subtext: string;
  meta?: string;
}

type ItemType = "vaartuig" | "lading";

interface ItemOfferCardProps {
  /** Which item type to search for */
  type: ItemType;
  /** Currently selected item (null = empty state) */
  value: ItemOption | null;
  /** Called when user selects/deselects an item */
  onChange: (item: ItemOption | null) => void;
  /** Optional label above the component */
  label?: string;
}

/* ── Plus icon ── */
const PlusIcon = () => (
  <svg fill="none" viewBox="0 0 20 20">
    <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

/* ── X / unlink icon ── */
const UnlinkIcon = () => (
  <svg fill="none" viewBox="0 0 20 20">
    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
  </svg>
);

export default function ItemOfferCard({ type, value, onChange, label }: ItemOfferCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<ItemOption[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    setLoading(true);
    try {
      if (type === "vaartuig") {
        const [eigenList, marktList] = await Promise.all([
          list<VaartuigEigen>("vaartuig_eigen").catch(() => [] as VaartuigEigen[]),
          list<VaartuigMarkt>("vaartuig_markt").catch(() => [] as VaartuigMarkt[]),
        ]);
        const combined: ItemOption[] = [
          ...eigenList.map(v => ({
            id: v.id,
            naam: v.naam,
            subtext: `${v.groottonnage.toLocaleString("nl-NL")} ton · Eigen`,
            meta: `${v.lengte}m × ${v.breedte}m`,
          })),
          ...marktList.map(v => ({
            id: v.id,
            naam: v.naam,
            subtext: `${v.groottonnage.toLocaleString("nl-NL")} ton · Markt`,
            meta: `${v.lengte}m × ${v.breedte}m`,
          })),
        ];
        if (q) {
          const lower = q.toLowerCase();
          setOptions(combined.filter(o => o.naam.toLowerCase().includes(lower)));
        } else {
          setOptions(combined.slice(0, 8));
        }
      } else {
        const [eigenList, marktList] = await Promise.all([
          list<LadingEigen>("lading_eigen").catch(() => [] as LadingEigen[]),
          list<LadingMarkt>("lading_markt").catch(() => [] as LadingMarkt[]),
        ]);
        const combined: ItemOption[] = [
          ...eigenList.map(l => ({
            id: l.id,
            naam: `${l.tonnage.toLocaleString("nl-NL")} ton`,
            subtext: "Eigen",
            meta: l.id,
          })),
          ...marktList.map(l => ({
            id: l.id,
            naam: `${l.tonnage.toLocaleString("nl-NL")} ton`,
            subtext: "Markt",
            meta: l.id,
          })),
        ];
        if (q) {
          const lower = q.toLowerCase();
          setOptions(combined.filter(o => o.naam.toLowerCase().includes(lower) || o.meta?.toLowerCase().includes(lower)));
        } else {
          setOptions(combined.slice(0, 8));
        }
      }
    } catch (err) {
      console.error(`ItemOfferCard search error for ${type}:`, err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 250);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setSearchQuery("");
    doSearch("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSelect = (item: ItemOption) => {
    onChange(item);
    setIsOpen(false);
    setSearchQuery("");
  };

  const buttonLabel = type === "vaartuig" ? "Vaartuig toevoegen" : "Lading toevoegen";

  // ── EMPTY STATE ──
  if (!value && !isOpen) {
    return (
      <div className="flex flex-col gap-[6px]">
        {label && (
          <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px]">
            {label}
          </p>
        )}
        <Button
          variant="secondary"
          label={buttonLabel}
          leadingIcon={<PlusIcon />}
          onClick={handleOpen}
          className="[&_p]:!text-rdj-text-brand [&_svg_path]:!stroke-rdj-fg-brand"
        />
      </div>
    );
  }

  // ── SEARCH STATE ──
  if (!value && isOpen) {
    return (
      <div ref={wrapperRef} className="flex flex-col gap-[6px]">
        {label && (
          <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px]">
            {label}
          </p>
        )}
        <div className="relative">
          {/* Search input */}
          <div className="bg-white border border-rdj-fg-brand ring-1 ring-rdj-fg-brand rounded-[8px] flex items-center px-[14px] py-[10px] gap-[8px]">
            <div className="overflow-clip relative shrink-0 size-[20px]">
              <svg className="block size-full" fill="none" viewBox="0 0 20 20">
                <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={`Zoek een ${type}...`}
              className="flex-1 font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] text-rdj-text-primary text-[14px] outline-none border-0 bg-transparent placeholder:text-rdj-text-tertiary"
            />
          </div>

          {/* Dropdown */}
          <div className="absolute z-50 top-full left-0 right-0 mt-[4px] bg-white border border-rdj-border-secondary rounded-[8px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] max-h-[280px] overflow-y-auto">
            {loading ? (
              <div className="px-[14px] py-[10px]">
                <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] text-rdj-text-tertiary text-[14px]">Laden...</p>
              </div>
            ) : options.length === 0 ? (
              <div className="px-[14px] py-[10px]">
                <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] text-rdj-text-tertiary text-[14px]">
                  Geen {type === "vaartuig" ? "vaartuigen" : "ladingen"} gevonden
                </p>
              </div>
            ) : (
              <>
                {!searchQuery && (
                  <div className="px-[14px] pt-[8px] pb-[4px]">
                    <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[18px] text-rdj-text-tertiary text-[12px] uppercase tracking-wide">
                      {type === "vaartuig" ? "Beschikbare vaartuigen" : "Beschikbare ladingen"}
                    </p>
                  </div>
                )}
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className="w-full text-left px-[14px] py-[10px] flex flex-col gap-[2px] hover:bg-rdj-bg-primary-hover transition-colors"
                  >
                    <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] text-rdj-text-primary text-[14px]">
                      {option.naam}
                    </p>
                    <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[18px] text-rdj-text-secondary text-[12px]">
                      {option.subtext}{option.meta ? ` · ${option.meta}` : ""}
                    </p>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── ATTACHED STATE ──
  return (
    <div className="flex flex-col gap-[6px]">
      {label && (
        <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px]">
          {label}
        </p>
      )}
      <div className="bg-white relative rounded-[10px] w-full">
        <div aria-hidden="true" className="absolute border border-rdj-border-secondary border-solid inset-0 pointer-events-none rounded-[10px]" />
        <div className="flex items-start p-[16px]">
          <div className="flex flex-1 flex-col gap-[2px] items-start justify-center min-w-0">
            <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] text-rdj-text-primary text-[14px]">
              {value!.naam}
            </p>
            <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[18px] text-rdj-text-secondary text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
              {value!.subtext}{value!.meta ? ` · ${value!.meta}` : ""}
            </p>
          </div>
          {/* Detach button — tertiary icon-only */}
          <Button
            variant="tertiary-gray"
            size="sm"
            icon={<UnlinkIcon />}
            onClick={() => onChange(null)}
          />
        </div>
      </div>
    </div>
  );
}
