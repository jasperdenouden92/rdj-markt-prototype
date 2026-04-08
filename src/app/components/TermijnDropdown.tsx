import { useState } from "react";
import { nl } from "date-fns/locale";
import { startOfWeek, getISOWeek, isSameWeek } from "date-fns";
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

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mrt", "Apr", "Mei", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
];

const DAY_NAMES_SHORT = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

type TermijnGranularity = "dag" | "week" | "maand" | "kwartaal" | "jaar";

export type TermijnValue =
  | { type: "preset"; value: string; label: string }
  | { type: "date"; date: Date; granularity?: TermijnGranularity; weekNumber?: number };

export function formatDate(date: Date, granularity?: TermijnGranularity): string {
  switch (granularity) {
    case "week":
      return `Week ${getISOWeek(date)}`;
    case "maand":
      return `${MONTH_NAMES_NL[date.getMonth()]} ${date.getFullYear()}`;
    case "kwartaal":
      return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    case "jaar":
      return `${date.getFullYear()}`;
    default: {
      const day = DAY_NAMES_SHORT[date.getDay()];
      const d = date.getDate();
      const month = MONTH_NAMES_NL[date.getMonth()];
      return `${day} ${d} ${month}`;
    }
  }
}

/* ── Granularity segmented control ── */

const GRANULARITY_OPTIONS: { value: TermijnGranularity; label: string }[] = [
  { value: "dag", label: "Dag" },
  { value: "week", label: "Week" },
  { value: "maand", label: "Maand" },
  { value: "kwartaal", label: "Kwartaal" },
  { value: "jaar", label: "Jaar" },
];

function GranularityTabs({ value, onChange }: { value: TermijnGranularity; onChange: (v: TermijnGranularity) => void }) {
  return (
    <div className="px-[16px] pt-[16px] flex">
      {GRANULARITY_OPTIONS.map((opt, i) => {
        const isActive = opt.value === value;
        const isFirst = i === 0;
        const isLast = i === GRANULARITY_OPTIONS.length - 1;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-[6px] py-[6px] font-sans font-bold text-[12px] leading-[20px] border border-rdj-border-primary transition-colors ${
              isFirst ? "rounded-l-[6px]" : "border-l-0"
            } ${isLast ? "rounded-r-[6px]" : ""} ${
              isActive
                ? "bg-rdj-bg-active text-rdj-text-brand"
                : "bg-white text-[#344054] hover:bg-rdj-bg-primary-hover"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Quick-select button labels ── */

function getQuickLabel(granularity: TermijnGranularity): string {
  switch (granularity) {
    case "dag": return "Vandaag";
    case "week": return "Deze week";
    case "maand": return "Deze maand";
    case "kwartaal": return "Dit kwartaal";
    case "jaar": return "Dit jaar";
  }
}

function getInputPlaceholder(granularity: TermijnGranularity): string {
  switch (granularity) {
    case "dag": return "Selecteer dag";
    case "week": return "Selecteer week";
    case "maand": return "Selecteer maand";
    case "kwartaal": return "Selecteer kwartaal";
    case "jaar": return "Selecteer jaar";
  }
}

function formatInputValue(date: Date | undefined, granularity: TermijnGranularity): string {
  if (!date) return "";
  switch (granularity) {
    case "dag":
      return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    case "week":
      return `Week ${getISOWeek(date)} ${date.getFullYear()}`;
    case "maand":
      return `${MONTH_NAMES_NL[date.getMonth()]} ${date.getFullYear()}`;
    case "kwartaal":
      return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    case "jaar":
      return `${date.getFullYear()}`;
  }
}

/* ── Month picker grid ── */

function MonthGrid({ year, selectedMonth, onSelect, onYearChange }: {
  year: number;
  selectedMonth: number | undefined; // 0-11, only highlighted if year matches
  onSelect: (month: number) => void;
  onYearChange: (year: number) => void;
}) {
  return (
    <div className="px-[16px] py-[12px] flex flex-col gap-[8px]">
      <div className="flex items-center justify-between">
        <button onClick={() => onYearChange(year - 1)} className="p-[4px] hover:bg-rdj-bg-primary-hover rounded-[4px] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary">{year}</span>
        <button onClick={() => onYearChange(year + 1)} className="p-[4px] hover:bg-rdj-bg-primary-hover rounded-[4px] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-[4px]">
        {MONTH_NAMES_SHORT.map((name, i) => {
          const isSelected = selectedMonth === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`px-[8px] py-[8px] rounded-[6px] font-sans text-[13px] leading-[20px] transition-colors ${
                isSelected
                  ? "bg-rdj-text-brand text-white font-bold"
                  : "text-rdj-text-primary hover:bg-rdj-bg-primary-hover font-normal"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Quarter picker grid ── */

const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"];
const QUARTER_MONTHS = ["Jan – Mrt", "Apr – Jun", "Jul – Sep", "Okt – Dec"];

function QuarterGrid({ year, selectedQuarter, onSelect, onYearChange }: {
  year: number;
  selectedQuarter: number | undefined; // 0-3
  onSelect: (quarter: number) => void;
  onYearChange: (year: number) => void;
}) {
  return (
    <div className="px-[16px] py-[12px] flex flex-col gap-[8px]">
      <div className="flex items-center justify-between">
        <button onClick={() => onYearChange(year - 1)} className="p-[4px] hover:bg-rdj-bg-primary-hover rounded-[4px] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary">{year}</span>
        <button onClick={() => onYearChange(year + 1)} className="p-[4px] hover:bg-rdj-bg-primary-hover rounded-[4px] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-[4px]">
        {QUARTER_LABELS.map((label, i) => {
          const isSelected = selectedQuarter === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`px-[8px] py-[12px] rounded-[6px] font-sans text-[13px] leading-[20px] transition-colors flex flex-col items-center gap-[2px] ${
                isSelected
                  ? "bg-rdj-text-brand text-white"
                  : "text-rdj-text-primary hover:bg-rdj-bg-primary-hover"
              }`}
            >
              <span className="font-bold">{label}</span>
              <span className={`text-[11px] ${isSelected ? "text-white/70" : "text-rdj-text-tertiary"}`}>{QUARTER_MONTHS[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Year picker grid ── */

function YearGrid({ centerYear, selectedYear, onSelect, onRangeChange }: {
  centerYear: number;
  selectedYear: number | undefined;
  onSelect: (year: number) => void;
  onRangeChange: (delta: number) => void;
}) {
  const startYear = centerYear - 5;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);
  return (
    <div className="px-[16px] py-[12px] flex flex-col gap-[8px]">
      <div className="flex items-center justify-between">
        <button onClick={() => onRangeChange(-12)} className="p-[4px] hover:bg-rdj-bg-primary-hover rounded-[4px] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary">{years[0]} – {years[years.length - 1]}</span>
        <button onClick={() => onRangeChange(12)} className="p-[4px] hover:bg-rdj-bg-primary-hover rounded-[4px] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-[4px]">
        {years.map((y) => {
          const isSelected = selectedYear === y;
          return (
            <button
              key={y}
              onClick={() => onSelect(y)}
              className={`px-[8px] py-[8px] rounded-[6px] font-sans text-[13px] leading-[20px] transition-colors ${
                isSelected
                  ? "bg-rdj-text-brand text-white font-bold"
                  : "text-rdj-text-primary hover:bg-rdj-bg-primary-hover font-normal"
              }`}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Shared calendar popover content ── */

function TermijnCalendarContent({
  selected,
  granularity,
  calMonth,
  pickerYear,
  yearRangeCenter,
  onGranularityChange,
  onDaySelect,
  onWeekSelect,
  onMonthSelect,
  onQuarterSelect,
  onYearSelect,
  onCalMonthChange,
  onPickerYearChange,
  onYearRangeChange,
  onQuickSelect,
  hideMeldenBijAankomst,
}: {
  selected: Date | undefined;
  granularity: TermijnGranularity;
  calMonth: Date;
  pickerYear: number;
  yearRangeCenter: number;
  onGranularityChange: (g: TermijnGranularity) => void;
  onDaySelect: (date: Date | undefined) => void;
  onWeekSelect: (date: Date | undefined) => void;
  onMonthSelect: (month: number) => void;
  onQuarterSelect: (quarter: number) => void;
  onYearSelect: (year: number) => void;
  onCalMonthChange: (date: Date) => void;
  onPickerYearChange: (year: number) => void;
  onYearRangeChange: (delta: number) => void;
  onQuickSelect: () => void;
  hideMeldenBijAankomst?: boolean;
}) {
  const weekModifiers = granularity === "week" && selected
    ? { selectedWeek: (date: Date) => isSameWeek(date, selected, { weekStartsOn: 1 }) }
    : undefined;

  const weekModifiersClassNames = granularity === "week" && selected
    ? { selectedWeek: "!bg-rdj-bg-active !text-rdj-text-brand !rounded-none" }
    : undefined;

  const selectedMonthIndex = selected && granularity === "maand" && selected.getFullYear() === pickerYear
    ? selected.getMonth() : undefined;
  const selectedQuarterIndex = selected && granularity === "kwartaal" && selected.getFullYear() === pickerYear
    ? Math.floor(selected.getMonth() / 3) : undefined;
  const selectedYearValue = selected && granularity === "jaar" ? selected.getFullYear() : undefined;

  return (
    <div className="flex flex-col w-[280px]">
      <GranularityTabs value={granularity} onChange={onGranularityChange} />

      {/* Input + quick button */}
      <div className="px-[16px] pt-[10px] flex items-center gap-[8px]">
        <div className="flex-1 relative">
          <input
            type="text"
            readOnly
            value={formatInputValue(selected, granularity)}
            placeholder={getInputPlaceholder(granularity)}
            className="w-full px-[10px] py-[6px] font-sans font-normal text-[13px] leading-[20px] text-rdj-text-primary border border-rdj-border-primary rounded-[6px] outline-none bg-white placeholder:text-rdj-text-tertiary"
          />
        </div>
        <button
          onClick={onQuickSelect}
          className="px-[10px] py-[6px] font-sans font-bold text-[13px] leading-[20px] text-rdj-text-brand border border-rdj-border-primary rounded-[6px] hover:bg-rdj-bg-primary-hover transition-colors whitespace-nowrap"
        >
          {getQuickLabel(granularity)}
        </button>
      </div>

      {/* Selection area — fixed height to prevent layout shift */}
      <div className="h-[280px] flex flex-col">
        {granularity === "dag" && (
          <Calendar data-annotation-id="termijndropdown-kalender-2"
            mode="single"
            selected={selected}
            onSelect={onDaySelect}
            month={calMonth}
            onMonthChange={onCalMonthChange}
            locale={nl}
            weekStartsOn={1}
            className="px-[12px] pb-[12px]"
            classNames={{
              day_selected: "!bg-rdj-text-brand !text-white hover:!bg-rdj-text-brand hover:!text-white focus:!bg-rdj-text-brand focus:!text-white",
            }}
          />
        )}
        {granularity === "week" && (
          <Calendar data-annotation-id="termijndropdown-kalender"
            mode="single"
            selected={selected}
            onSelect={onWeekSelect}
            month={calMonth}
            onMonthChange={onCalMonthChange}
            locale={nl}
            weekStartsOn={1}
            modifiers={weekModifiers}
            modifiersClassNames={weekModifiersClassNames}
            className="px-[12px] pb-[12px]"
            classNames={{
              day_selected: "!bg-rdj-text-brand !text-white rounded-none hover:!bg-rdj-text-brand hover:!text-white focus:!bg-rdj-text-brand focus:!text-white",
            }}
          />
        )}
        {granularity === "maand" && (
          <MonthGrid
            year={pickerYear}
            selectedMonth={selectedMonthIndex}
            onSelect={onMonthSelect}
            onYearChange={onPickerYearChange}
          />
        )}
        {granularity === "kwartaal" && (
          <QuarterGrid
            year={pickerYear}
            selectedQuarter={selectedQuarterIndex}
            onSelect={onQuarterSelect}
            onYearChange={onPickerYearChange}
          />
        )}
        {granularity === "jaar" && (
          <YearGrid
            centerYear={yearRangeCenter}
            selectedYear={selectedYearValue}
            onSelect={onYearSelect}
            onRangeChange={onYearRangeChange}
          />
        )}
      </div>
    </div>
  );
}

/* ── TermijnPill — pill-shaped trigger with same popover as TermijnDropdown ── */

interface TermijnPillProps {
  label: string;
  value?: string;
  onChange: (displayValue: string) => void;
  variant?: "primary" | "bid";
  hideMeldenBijAankomst?: boolean;
}

export function TermijnPill({ label, value, onChange, variant = "primary", hideMeldenBijAankomst = false }: TermijnPillProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "calendar">("menu");
  const [granularity, setGranularity] = useState<TermijnGranularity>("dag");
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [calMonth, setCalMonth] = useState<Date>(new Date());
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [yearRangeCenter, setYearRangeCenter] = useState(new Date().getFullYear());

  const handlePresetSelect = (option: typeof PRESET_OPTIONS[number]) => {
    onChange(option.label);
    setOpen(false);
    setView("menu");
  };

  const emitAndClose = (date: Date, g: TermijnGranularity) => {
    setSelected(date);
    onChange(formatDate(date, g));
    setOpen(false);
    setView("menu");
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (date) emitAndClose(date, "dag");
  };

  const handleWeekSelect = (date: Date | undefined) => {
    if (!date) return;
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    emitAndClose(weekStart, "week");
  };

  const handleMonthSelect = (month: number) => {
    const d = new Date(pickerYear, month, 1);
    emitAndClose(d, "maand");
  };

  const handleQuarterSelect = (quarter: number) => {
    const d = new Date(pickerYear, quarter * 3, 1);
    emitAndClose(d, "kwartaal");
  };

  const handleYearSelect = (year: number) => {
    const d = new Date(year, 0, 1);
    emitAndClose(d, "jaar");
  };

  const handleQuickSelect = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    switch (granularity) {
      case "dag":
        setCalMonth(today);
        emitAndClose(today, "dag");
        break;
      case "week": {
        const ws = startOfWeek(today, { weekStartsOn: 1 });
        setCalMonth(today);
        emitAndClose(ws, "week");
        break;
      }
      case "maand":
        setPickerYear(today.getFullYear());
        emitAndClose(new Date(today.getFullYear(), today.getMonth(), 1), "maand");
        break;
      case "kwartaal":
        setPickerYear(today.getFullYear());
        emitAndClose(new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1), "kwartaal");
        break;
      case "jaar":
        setYearRangeCenter(today.getFullYear());
        emitAndClose(new Date(today.getFullYear(), 0, 1), "jaar");
        break;
    }
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
            {PRESET_OPTIONS.filter(option => !(hideMeldenBijAankomst && option.value === "melden-bij-aankomst")).map((option) => {
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
          <TermijnCalendarContent
            selected={selected}
            granularity={granularity}
            calMonth={calMonth}
            pickerYear={pickerYear}
            yearRangeCenter={yearRangeCenter}
            onGranularityChange={setGranularity}
            onDaySelect={handleDaySelect}
            onWeekSelect={handleWeekSelect}
            onMonthSelect={handleMonthSelect}
            onQuarterSelect={handleQuarterSelect}
            onYearSelect={handleYearSelect}
            onCalMonthChange={setCalMonth}
            onPickerYearChange={setPickerYear}
            onYearRangeChange={(delta) => setYearRangeCenter(c => c + delta)}
            onQuickSelect={handleQuickSelect}
            hideMeldenBijAankomst={hideMeldenBijAankomst}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

/* ── TermijnDropdown — main dropdown component ── */

interface TermijnDropdownProps {
  value: TermijnValue | undefined;
  onChange: (value: TermijnValue) => void;
  placeholder?: string;
  variant?: "default" | "sidebar";
  hideMeldenBijAankomst?: boolean;
}

export default function TermijnDropdown({ value, onChange, placeholder = "Selecteer...", variant = "default", hideMeldenBijAankomst = false }: TermijnDropdownProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "calendar">("menu");
  const [granularity, setGranularity] = useState<TermijnGranularity>(
    value?.type === "date" ? (value.granularity ?? "dag") : "dag"
  );
  const [selected, setSelected] = useState<Date | undefined>(
    value?.type === "date" ? value.date : undefined
  );
  const [calMonth, setCalMonth] = useState<Date>(
    value?.type === "date" ? value.date : new Date()
  );
  const now = new Date();
  const [pickerYear, setPickerYear] = useState(
    value?.type === "date" ? value.date.getFullYear() : now.getFullYear()
  );
  const [yearRangeCenter, setYearRangeCenter] = useState(
    value?.type === "date" ? value.date.getFullYear() : now.getFullYear()
  );

  const displayValue = value
    ? value.type === "preset"
      ? value.label
      : formatDate(value.date, value.granularity)
    : "";

  const handlePresetSelect = (option: typeof PRESET_OPTIONS[number]) => {
    onChange({ type: "preset", value: option.value, label: option.label });
    setOpen(false);
    setView("menu");
  };

  const emitAndClose = (date: Date, g: TermijnGranularity, weekNumber?: number) => {
    setSelected(date);
    onChange({ type: "date", date, granularity: g, weekNumber });
    setOpen(false);
    setView("menu");
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (date) emitAndClose(date, "dag");
  };

  const handleWeekSelect = (date: Date | undefined) => {
    if (!date) return;
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    emitAndClose(weekStart, "week", getISOWeek(weekStart));
  };

  const handleMonthSelect = (month: number) => {
    emitAndClose(new Date(pickerYear, month, 1), "maand");
  };

  const handleQuarterSelect = (quarter: number) => {
    emitAndClose(new Date(pickerYear, quarter * 3, 1), "kwartaal");
  };

  const handleYearSelect = (year: number) => {
    emitAndClose(new Date(year, 0, 1), "jaar");
  };

  const handleQuickSelect = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    switch (granularity) {
      case "dag":
        setCalMonth(today);
        emitAndClose(today, "dag");
        break;
      case "week": {
        const ws = startOfWeek(today, { weekStartsOn: 1 });
        setCalMonth(today);
        emitAndClose(ws, "week", getISOWeek(ws));
        break;
      }
      case "maand":
        setPickerYear(today.getFullYear());
        emitAndClose(new Date(today.getFullYear(), today.getMonth(), 1), "maand");
        break;
      case "kwartaal":
        setPickerYear(today.getFullYear());
        emitAndClose(new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1), "kwartaal");
        break;
      case "jaar":
        setYearRangeCenter(today.getFullYear());
        emitAndClose(new Date(today.getFullYear(), 0, 1), "jaar");
        break;
    }
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
        {variant === "sidebar" ? (
          <button
            type="button"
            className="w-full rounded-[6px] border border-transparent hover:border-rdj-border-primary hover:bg-rdj-bg-secondary-hover transition-all text-left focus:outline-none"
          >
            <div className="pl-[12px] pr-[6px] py-[8px]">
              <p className={`font-sans leading-[20px] text-[14px] ${displayValue ? "font-bold text-rdj-text-primary" : "font-normal text-rdj-text-tertiary"}`}>
                {displayValue || "Voeg toe"}
              </p>
            </div>
          </button>
        ) : (
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
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-auto p-0 border border-rdj-border-primary rounded-[12px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)]"
      >
        {view === "menu" ? (
          <div className="py-[4px] min-w-[200px]">
            {PRESET_OPTIONS.filter(option => !(hideMeldenBijAankomst && option.value === "melden-bij-aankomst")).map((option) => {
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
          <TermijnCalendarContent
            selected={selected}
            granularity={granularity}
            calMonth={calMonth}
            pickerYear={pickerYear}
            yearRangeCenter={yearRangeCenter}
            onGranularityChange={setGranularity}
            onDaySelect={handleDaySelect}
            onWeekSelect={handleWeekSelect}
            onMonthSelect={handleMonthSelect}
            onQuarterSelect={handleQuarterSelect}
            onYearSelect={handleYearSelect}
            onCalMonthChange={setCalMonth}
            onPickerYearChange={setPickerYear}
            onYearRangeChange={(delta) => setYearRangeCenter(c => c + delta)}
            onQuickSelect={handleQuickSelect}
            hideMeldenBijAankomst={hideMeldenBijAankomst}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
