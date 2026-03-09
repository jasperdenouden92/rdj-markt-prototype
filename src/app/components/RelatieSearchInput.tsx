import { useState, useEffect, useRef, useCallback } from "react";
import { list, type Relatie } from "../data/api";

interface RelatieOption {
  id: string;
  naam: string;
}

interface RelatieSearchInputProps {
  /** Currently selected relatie (null = nothing selected) */
  value: RelatieOption | null;
  /** Called when user selects a relatie */
  onSelect: (relatie: RelatieOption | null) => void;
  /** Called when user clicks "Relatie toevoegen" */
  onAddNew?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Label above the input */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
}

// Fake recent relaties (shown when dropdown opens without search)
const RECENT_RELATIES: RelatieOption[] = [
  { id: "recent-1", naam: "Provaart Logistics BV" },
  { id: "recent-2", naam: "Janlow B.V." },
  { id: "recent-3", naam: "Cargill N.V." },
  { id: "recent-4", naam: "De Volharding C.V." },
  { id: "recent-5", naam: "Rederij Alfa" },
];

export default function RelatieSearchInput({
  value,
  onSelect,
  onAddNew,
  placeholder = "Zoek een relatie...",
  label,
  required = false,
}: RelatieSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiRelaties, setApiRelaties] = useState<RelatieOption[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search relaties from API with debounce
  const searchRelaties = useCallback(async (query: string) => {
    if (!query.trim()) {
      setApiRelaties([]);
      return;
    }
    setLoading(true);
    try {
      const all = await list<Relatie>("relatie");
      const q = query.toLowerCase();
      const filtered = all
        .filter((r) => r.naam.toLowerCase().includes(q))
        .map((r) => ({ id: r.id, naam: r.naam }));
      setApiRelaties(filtered);
    } catch (err) {
      console.error("Error searching relaties:", err);
      setApiRelaties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim()) {
      debounceRef.current = setTimeout(() => searchRelaties(searchQuery), 250);
    } else {
      setApiRelaties([]);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, searchRelaties]);

  const handleSelect = (relatie: RelatieOption) => {
    onSelect(relatie);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  // Which items to show in the dropdown
  const isSearching = searchQuery.trim().length > 0;
  const displayItems = isSearching ? apiRelaties : RECENT_RELATIES;
  const sectionLabel = isSearching ? "Zoekresultaten" : "Recent";

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px] mb-[6px]">
          {label}{required && " *"}
        </p>
      )}

      {/* Selected state: show chip */}
      {value ? (
        <div
          className="bg-white border border-[#d0d5dd] rounded-[6px] w-full px-[12px] py-[8px] flex items-center justify-between cursor-pointer hover:border-[#98a2b3] transition-colors"
          onClick={() => {
            onSelect(null);
            setSearchQuery("");
            setTimeout(() => {
              setIsOpen(true);
              inputRef.current?.focus();
            }, 0);
          }}
        >
          <div className="flex items-center gap-[8px]">
            {/* Building icon */}
            <div className="shrink-0 size-[20px] text-[#667085]">
              <svg className="block size-full" fill="none" viewBox="0 0 20 20">
                <path
                  d="M3.33333 17.5H16.6667M5 17.5V4.16667C5 3.72464 5.17559 3.30072 5.48816 2.98816C5.80072 2.67559 6.22464 2.5 6.66667 2.5H13.3333C13.7754 2.5 14.1993 2.67559 14.5118 2.98816C14.8244 3.30072 15 3.72464 15 4.16667V17.5M8.33333 6.66667H11.6667M8.33333 10H11.6667M8.33333 13.3333H11.6667"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <p className="font-sans font-normal leading-[20px] text-[#101828] text-[14px]">
              {value.naam}
            </p>
          </div>
          {/* Clear button */}
          <button
            onClick={handleClear}
            className="shrink-0 size-[16px] text-[#98a2b3] hover:text-[#475467] transition-colors"
          >
            <svg className="block size-full" fill="none" viewBox="0 0 16 16">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      ) : (
        /* Input state: search field */
        <div
          className={`bg-white border rounded-[6px] w-full px-[12px] py-[8px] flex items-center gap-[8px] transition-colors ${
            isOpen ? "border-[#1567a4] ring-1 ring-[#1567a4]" : "border-[#d0d5dd]"
          }`}
        >
          {/* Search icon */}
          <div className="shrink-0 size-[16px] text-[#667085]">
            <svg className="block size-full" fill="none" viewBox="0 0 16 16">
              <path
                d="M14 14L10.0667 10.0667M11.3333 6.66667C11.3333 9.244 9.244 11.3333 6.66667 11.3333C4.08934 11.3333 2 9.244 2 6.66667C2 4.08934 4.08934 2 6.66667 2C9.244 2 11.3333 4.08934 11.3333 6.66667Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="flex-1 font-sans font-normal leading-[20px] text-[#101828] text-[14px] focus:outline-none placeholder:text-[#667085] bg-transparent"
          />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && !value && (
        <div className="absolute z-50 top-full left-0 right-0 mt-[4px] bg-white border border-[#eaecf0] rounded-[8px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] overflow-hidden">
          {/* Section header */}
          <div className="px-[12px] pt-[8px] pb-[4px]">
            <p className="font-sans font-bold leading-[18px] text-[#667085] text-[12px] uppercase tracking-[0.04em]">
              {sectionLabel}
            </p>
          </div>

          {/* Results */}
          <div className="max-h-[240px] overflow-y-auto">
            {loading ? (
              <div className="px-[12px] py-[10px]">
                <p className="font-sans font-normal leading-[20px] text-[#667085] text-[14px]">
                  Zoeken...
                </p>
              </div>
            ) : displayItems.length === 0 && isSearching ? (
              <div className="px-[12px] py-[10px]">
                <p className="font-sans font-normal leading-[20px] text-[#667085] text-[14px]">
                  Geen relaties gevonden
                </p>
              </div>
            ) : (
              displayItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-[12px] py-[8px] flex items-center gap-[8px] hover:bg-[#f9fafb] transition-colors"
                >
                  {/* Building icon */}
                  <div className="shrink-0 size-[20px] text-[#667085]">
                    <svg className="block size-full" fill="none" viewBox="0 0 20 20">
                      <path
                        d="M3.33333 17.5H16.6667M5 17.5V4.16667C5 3.72464 5.17559 3.30072 5.48816 2.98816C5.80072 2.67559 6.22464 2.5 6.66667 2.5H13.3333C13.7754 2.5 14.1993 2.67559 14.5118 2.98816C14.8244 3.30072 15 3.72464 15 4.16667V17.5M8.33333 6.66667H11.6667M8.33333 10H11.6667M8.33333 13.3333H11.6667"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <p className="font-sans font-normal leading-[20px] text-[#344054] text-[14px]">
                    {item.naam}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Divider + Relatie toevoegen */}
          <div className="border-t border-[#eaecf0]">
            <button
              onClick={() => {
                setIsOpen(false);
                onAddNew?.();
              }}
              className="w-full text-left px-[12px] py-[10px] flex items-center gap-[8px] hover:bg-[#f9fafb] transition-colors"
            >
              {/* Plus icon */}
              <div className="shrink-0 size-[20px] text-[#145990]">
                <svg className="block size-full" fill="none" viewBox="0 0 20 20">
                  <path
                    d="M10 4.16667V15.8333M4.16667 10H15.8333"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.66667"
                  />
                </svg>
              </div>
              <p className="font-sans font-bold leading-[20px] text-[#145990] text-[14px]">
                Relatie toevoegen
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}