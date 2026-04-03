import { useState } from "react";
import { nl } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export const PRESET_OPTIONS = [
  { value: "af-te-stemmen", label: "Af te stemmen" },
  { value: "melden-bij-aankomst", label: "Melden bij aankomst" },
  { value: "opslag", label: "Opslag" },
] as const;

const MONTH_NAMES_NL = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

const DAY_NAMES_SHORT = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

export function formatDate(date: Date): string {
  const day = DAY_NAMES_SHORT[date.getDay()];
  const d = date.getDate();
  const month = MONTH_NAMES_NL[date.getMonth()];
  return `${day} ${d} ${month}`;
}

export type TermijnValue =
  | { type: "preset"; value: string; label: string }
  | { type: "date"; date: Date };

interface TermijnDropdownProps {
  value: TermijnValue | undefined;
  onChange: (value: TermijnValue) => void;
  placeholder?: string;
}

/* ── TermijnPill — pill-shaped trigger with same popover as TermijnDropdown ── */

interface TermijnPillProps {
  label: string;
  value?: string;
  onChange: (displayValue: string) => void;
  variant?: "primary" | "bid";
}

export function TermijnPill({ label, value, onChange, variant = "primary" }: TermijnPillProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "calendar">("menu");
  const [calDate, setCalDate] = useState<Date | undefined>(undefined);
  const [month, setMonth] = useState<Date>(new Date());

  const handlePresetSelect = (option: typeof PRESET_OPTIONS[number]) => {
    onChange(option.label);
    setOpen(false);
    setView("menu");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCalDate(date);
      onChange(formatDate(date));
      setOpen(false);
      setView("menu");
    }
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setMonth(today);
    handleDateSelect(today);
  };

  const filledClass = variant === "bid"
    ? "border-[#b2ddff] bg-[#eff8ff] text-[#175cd3] hover:bg-[#d1e9ff]"
    : "border-[#abefc6] bg-[#ecfdf3] text-[#067647] hover:bg-[#d1fadf]";

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setView("menu"); }}>
      <PopoverTrigger asChild>
        {value ? (
          <span className={`inline-flex items-center rounded-full border pl-[10px] pr-[6px] py-[3px] gap-[4px] font-bold font-sans text-[12px] leading-[16px] transition-colors cursor-pointer ${filledClass}`}>
            <span>{value}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M8 2L2 8M2 2L8 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
            </button>
          </span>
        ) : (
          <button className="inline-flex items-center rounded-full border font-normal border-dashed border-[#d0d5dd] bg-white text-rdj-text-tertiary hover:border-[#98a2b3] hover:text-[#344054] px-[10px] py-[3px] font-sans text-[12px] leading-[16px] transition-colors">
            {label}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-auto p-0 border border-rdj-border-primary rounded-[12px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)]"
      >
        {view === "menu" ? (
          <div className="py-[4px] min-w-[200px]">
            {PRESET_OPTIONS.map((option) => {
              const isSelected = value === option.label;
              return (
                <button
                  key={option.value}
                  onClick={() => handlePresetSelect(option)}
                  className="w-full px-[16px] py-[10px] text-left font-sans font-normal text-[14px] leading-[20px] text-[#101828] hover:bg-[#f9fafb] flex items-center justify-between"
                >
                  {option.label}
                  {isSelected && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <path d="M3 8.5L6.5 12L13 4" stroke="#1567A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => setView("calendar")}
              className="w-full px-[16px] py-[10px] text-left font-sans font-normal text-[14px] leading-[20px] text-[#101828] hover:bg-[#f9fafb]"
            >
              Datum...
            </button>
          </div>
        ) : (
          <div className="flex flex-col w-[280px]">
            <div className="px-[16px] pt-[16px] flex items-center gap-[8px]">
              <div className="flex-1 relative">
                <input
                  type="text"
                  readOnly
                  value={calDate ? `${calDate.getDate()}-${calDate.getMonth() + 1}-${calDate.getFullYear()}` : ""}
                  placeholder="Selecteer datum"
                  className="w-full px-[10px] py-[6px] font-sans font-normal text-[13px] leading-[20px] text-rdj-text-primary border border-rdj-border-primary rounded-[6px] outline-none bg-white placeholder:text-rdj-text-tertiary"
                />
              </div>
              <button
                onClick={handleToday}
                className="px-[10px] py-[6px] font-sans font-bold text-[13px] leading-[20px] text-rdj-text-brand border border-rdj-border-primary rounded-[6px] hover:bg-rdj-bg-primary-hover transition-colors whitespace-nowrap"
              >
                Vandaag
              </button>
            </div>
            <Calendar
              mode="single"
              selected={calDate}
              onSelect={handleDateSelect}
              month={month}
              onMonthChange={setMonth}
              locale={nl}
              weekStartsOn={1}
              className="px-[12px] pb-[12px]"
            />
            <div className="mx-[16px] h-px bg-rdj-border-secondary" />
            <div className="px-[16px] py-[12px] flex items-center justify-between">
              <span className="font-sans font-normal text-[13px] leading-[20px] text-rdj-text-secondary">Tijd opgeven</span>
              <div className="relative w-[36px] h-[20px] rounded-full bg-[#d0d5dd] cursor-not-allowed">
                <span className="absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default function TermijnDropdown({ value, onChange, placeholder = "Selecteer..." }: TermijnDropdownProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "calendar">("menu");
  const [month, setMonth] = useState<Date>(
    value?.type === "date" ? value.date : new Date()
  );

  const displayValue = value
    ? value.type === "preset"
      ? value.label
      : formatDate(value.date)
    : "";

  const handlePresetSelect = (option: typeof PRESET_OPTIONS[number]) => {
    onChange({ type: "preset", value: option.value, label: option.label });
    setOpen(false);
    setView("menu");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange({ type: "date", date });
      setOpen(false);
      setView("menu");
    }
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setMonth(today);
    handleDateSelect(today);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setView("menu");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full px-[12px] py-[8px] rounded-[6px] border border-[#d0d5dd] font-sans font-normal leading-[20px] text-[14px] text-left focus:outline-none focus:ring-2 focus:ring-[#1567a4] bg-white flex items-center justify-between"
        >
          <span className={displayValue ? "text-[#101828]" : "text-[#667085]"}>
            {displayValue || placeholder}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 ml-[8px]">
            <path d="M4 6L8 10L12 6" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-auto p-0 border border-rdj-border-primary rounded-[12px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)]"
      >
        {view === "menu" ? (
          <div className="py-[4px] min-w-[200px]">
            {PRESET_OPTIONS.map((option) => {
              const isSelected = value?.type === "preset" && value.value === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handlePresetSelect(option)}
                  className="w-full px-[16px] py-[10px] text-left font-sans font-normal text-[14px] leading-[20px] text-[#101828] hover:bg-[#f9fafb] flex items-center justify-between"
                >
                  {option.label}
                  {isSelected && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <path d="M3 8.5L6.5 12L13 4" stroke="#1567A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => setView("calendar")}
              className="w-full px-[16px] py-[10px] text-left font-sans font-normal text-[14px] leading-[20px] text-[#101828] hover:bg-[#f9fafb]"
            >
              Datum...
            </button>
          </div>
        ) : (
          <div className="flex flex-col w-[280px]">
            {/* Header with input + Today button */}
            <div className="px-[16px] pt-[16px] flex items-center gap-[8px]">
              <div className="flex-1 relative">
                <input
                  type="text"
                  readOnly
                  value={
                    value?.type === "date"
                      ? `${value.date.getDate()}-${value.date.getMonth() + 1}-${value.date.getFullYear()}`
                      : ""
                  }
                  placeholder="Selecteer datum"
                  className="w-full px-[10px] py-[6px] font-sans font-normal text-[13px] leading-[20px] text-rdj-text-primary border border-rdj-border-primary rounded-[6px] outline-none bg-white placeholder:text-rdj-text-tertiary"
                />
              </div>
              <button
                onClick={handleToday}
                className="px-[10px] py-[6px] font-sans font-bold text-[13px] leading-[20px] text-rdj-text-brand border border-rdj-border-primary rounded-[6px] hover:bg-rdj-bg-primary-hover transition-colors whitespace-nowrap"
              >
                Vandaag
              </button>
            </div>

            {/* Calendar */}
            <Calendar
              mode="single"
              selected={value?.type === "date" ? value.date : undefined}
              onSelect={handleDateSelect}
              month={month}
              onMonthChange={setMonth}
              locale={nl}
              weekStartsOn={1}
              className="px-[12px] pb-[12px]"
            />

            {/* Divider */}
            <div className="mx-[16px] h-px bg-rdj-border-secondary" />

            {/* Toggle for time - matching DatePickerPopover pattern */}
            <div className="px-[16px] py-[12px] flex items-center justify-between">
              <span className="font-sans font-normal text-[13px] leading-[20px] text-rdj-text-secondary">
                Tijd opgeven
              </span>
              <div className="relative w-[36px] h-[20px] rounded-full bg-[#d0d5dd] cursor-not-allowed">
                <span className="absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
