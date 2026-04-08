import { useState } from "react";
import { nl } from "date-fns/locale";
import { startOfWeek, getISOWeek, isSameWeek } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

/* ── Types ── */

type DatePickerMode = "dag" | "week";

export interface SmartDatePickerValue {
  mode: DatePickerMode;
  date: Date; // For dag: the selected day. For week: the Monday of the selected week.
  weekNumber?: number; // Only set in week mode
}

/* ── Formatting ── */

const DAY_NAMES_NL = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const MONTH_NAMES_NL = [
  "Jan", "Feb", "Mrt", "Apr", "Mei", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
];

export function formatSmartDatePickerValue(value: SmartDatePickerValue | undefined): string {
  if (!value) return "";
  if (value.mode === "week") {
    return `Week ${value.weekNumber ?? getISOWeek(value.date)}`;
  }
  const d = value.date;
  const dayName = DAY_NAMES_NL[d.getDay()];
  const day = d.getDate();
  const month = MONTH_NAMES_NL[d.getMonth()];
  return `${dayName} ${day} ${month}`;
}

/* ── Component ── */

interface SmartDatePickerProps {
  value?: SmartDatePickerValue;
  onChange: (value: SmartDatePickerValue) => void;
  children: React.ReactNode;
}

export default function SmartDatePicker({ value, onChange, children }: SmartDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DatePickerMode>(value?.mode ?? "dag");
  const [selected, setSelected] = useState<Date | undefined>(value?.date);
  const [month, setMonth] = useState<Date>(value?.date ?? new Date());

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return;
    setSelected(date);
    onChange({ mode: "dag", date });
  };

  const handleWeekSelect = (date: Date | undefined) => {
    if (!date) return;
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    setSelected(weekStart);
    onChange({ mode: "week", date: weekStart, weekNumber: getISOWeek(weekStart) });
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (mode === "dag") {
      setSelected(today);
      setMonth(today);
      onChange({ mode: "dag", date: today });
    } else {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      setSelected(weekStart);
      setMonth(today);
      onChange({ mode: "week", date: weekStart, weekNumber: getISOWeek(weekStart) });
    }
  };

  const handleModeChange = (newMode: DatePickerMode) => {
    setMode(newMode);
    // Re-emit value with new mode if we have a selection
    if (selected) {
      if (newMode === "week") {
        const weekStart = startOfWeek(selected, { weekStartsOn: 1 });
        setSelected(weekStart);
        onChange({ mode: "week", date: weekStart, weekNumber: getISOWeek(weekStart) });
      } else {
        onChange({ mode: "dag", date: selected });
      }
    }
  };

  // Week-mode: highlight entire week row
  const weekModifiers = mode === "week" && selected
    ? {
        selectedWeek: (date: Date) =>
          isSameWeek(date, selected, { weekStartsOn: 1 }),
      }
    : undefined;

  const weekModifiersClassNames = mode === "week" && selected
    ? {
        selectedWeek: "!bg-rdj-bg-active !text-rdj-text-brand !rounded-none",
      }
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-auto p-0 border border-rdj-border-primary rounded-[12px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)]"
      >
        <div className="flex flex-col w-[248px]">
          {/* Mode tabs */}
          <div className="px-[16px] pt-[16px] flex">
            <button
              onClick={() => handleModeChange("dag")}
              className={`flex-1 px-[16px] py-[6px] font-sans font-bold text-[13px] leading-[20px] border border-rdj-border-primary rounded-l-[6px] transition-colors ${
                mode === "dag"
                  ? "bg-rdj-bg-active text-rdj-text-brand"
                  : "bg-white text-[#344054] hover:bg-rdj-bg-primary-hover"
              }`}
            >
              Dag
            </button>
            <button
              onClick={() => handleModeChange("week")}
              className={`flex-1 px-[16px] py-[6px] font-sans font-bold text-[13px] leading-[20px] border border-rdj-border-primary border-l-0 rounded-r-[6px] transition-colors ${
                mode === "week"
                  ? "bg-rdj-bg-active text-rdj-text-brand"
                  : "bg-white text-[#344054] hover:bg-rdj-bg-primary-hover"
              }`}
            >
              Week
            </button>
          </div>

          {/* Date display + Today/Deze week button */}
          <div className="px-[16px] pt-[10px] flex items-center gap-[8px]">
            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                value={
                  selected
                    ? mode === "week"
                      ? `Week ${getISOWeek(selected)} ${selected.getFullYear()}`
                      : `${selected.getDate()}-${selected.getMonth() + 1}-${selected.getFullYear()}`
                    : ""
                }
                placeholder={mode === "dag" ? "Selecteer datum" : "Selecteer week"}
                className="w-full px-[10px] py-[6px] font-sans font-normal text-[13px] leading-[20px] text-rdj-text-primary border border-rdj-border-primary rounded-[6px] outline-none bg-white placeholder:text-rdj-text-tertiary"
              />
            </div>
            <button
              onClick={handleToday}
              className="px-[10px] py-[6px] font-sans font-bold text-[13px] leading-[20px] text-rdj-text-brand border border-rdj-border-primary rounded-[6px] hover:bg-rdj-bg-primary-hover transition-colors whitespace-nowrap"
            >
              {mode === "dag" ? "Vandaag" : "Deze week"}
            </button>
          </div>

          {/* Calendar */}
          {mode === "dag" ? (
            <Calendar data-annotation-id="smartdatepicker-kalender-2"
              mode="single"
              selected={selected}
              onSelect={handleDaySelect}
              month={month}
              onMonthChange={setMonth}
              locale={nl}
              weekStartsOn={1}
              className="px-[12px] pb-[12px]"
              classNames={{
                day_selected: "!bg-rdj-text-brand !text-white hover:!bg-rdj-text-brand hover:!text-white focus:!bg-rdj-text-brand focus:!text-white",
              }}
            />
          ) : (
            <Calendar data-annotation-id="smartdatepicker-kalender"
              mode="single"
              selected={selected}
              onSelect={handleWeekSelect}
              month={month}
              onMonthChange={setMonth}
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
