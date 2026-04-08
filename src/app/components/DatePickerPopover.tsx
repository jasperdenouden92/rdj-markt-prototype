import { useState } from "react";
import { nl } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

/* ── Types ── */

type DateMode = "ingeschat" | "werkelijk";
type TimeOption = "am" | "pm" | "specifiek";

export interface DatePickerValue {
  date: Date | undefined;
  mode: DateMode;
  time?: string; // HH:mm format
}

/* ── Formatting ── */

const DAY_NAMES_NL = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const MONTH_NAMES_NL = [
  "Jan", "Feb", "Mrt", "Apr", "Mei", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
];

export function formatDatePickerValue(value: DatePickerValue | undefined): string {
  if (!value?.date) return "";
  const d = value.date;
  const dayName = DAY_NAMES_NL[d.getDay()];
  const day = d.getDate();
  const month = MONTH_NAMES_NL[d.getMonth()];
  const timeStr = value.time ? ` ${value.time}` : "";
  return `${dayName} ${day} ${month}${timeStr}`;
}

/* ── Component ── */

interface DatePickerPopoverProps {
  value?: DatePickerValue;
  onChange: (value: DatePickerValue) => void;
  children: React.ReactNode;
  id?: string;
}

export default function DatePickerPopover({ value, onChange, children, id }: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const mode: DateMode = "ingeschat";
  const [selected, setSelected] = useState<Date | undefined>(value?.date);
  const [showTime, setShowTime] = useState(!!value?.time);
  const [timeOption, setTimeOption] = useState<TimeOption>(
    value?.time ? (value.time === "AM" ? "am" : value.time === "PM" ? "pm" : "specifiek") : "specifiek"
  );
  const [timeValue, setTimeValue] = useState(value?.time || "10:00");
  const [month, setMonth] = useState<Date>(value?.date || new Date());

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    if (date) {
      const time = showTime ? getTimeString() : undefined;
      onChange({ date, mode, time });
    }
  };

  const getTimeString = (): string | undefined => {
    if (!showTime) return undefined;
    if (timeOption === "am") return "VM";
    if (timeOption === "pm") return "NM";
    return timeValue;
  };

  const handleTimeToggle = (enabled: boolean) => {
    setShowTime(enabled);
    if (selected) {
      const time = enabled ? (timeOption === "am" ? "VM" : timeOption === "pm" ? "NM" : timeValue) : undefined;
      onChange({ date: selected, mode, time });
    }
  };

  const handleTimeOptionChange = (opt: TimeOption) => {
    setTimeOption(opt);
    if (selected && showTime) {
      const time = opt === "am" ? "VM" : opt === "pm" ? "NM" : timeValue;
      onChange({ date: selected, mode, time });
    }
  };

  const handleTimeValueChange = (val: string) => {
    setTimeValue(val);
    if (selected && showTime && timeOption === "specifiek") {
      onChange({ date: selected, mode, time: val });
    }
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelected(today);
    setMonth(today);
    const time = showTime ? getTimeString() : undefined;
    onChange({ date: today, mode, time });
  };

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
        <div className="flex flex-col w-[280px]">
          {/* Month navigation + Today button */}
          <div className="px-[16px] pt-[16px] flex items-center gap-[8px]">
            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                value={selected ? `${selected.getDate()}-${selected.getMonth() + 1}-${selected.getFullYear()}` : ""}
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
          <Calendar data-annotation-id="datepickerpopover-kalender"
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            locale={nl}
            weekStartsOn={1}
            className="px-[12px] pb-[4px]"
          />

          {/* Divider */}
          <div className="mx-[16px] h-px bg-rdj-border-secondary" />

          {/* Time toggle */}
          <div className="px-[16px] py-[12px] flex flex-col gap-[10px]">
            <div className="flex items-center justify-between">
              <span className="font-sans font-normal text-[13px] leading-[20px] text-rdj-text-secondary">
                Tijd opgeven
              </span>
              <button
                onClick={() => handleTimeToggle(!showTime)}
                className={`relative w-[36px] h-[20px] rounded-full transition-colors ${
                  showTime ? "bg-rdj-text-brand" : "bg-[#d0d5dd]"
                }`}
              >
                <span
                  className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform ${
                    showTime ? "left-[18px]" : "left-[2px]"
                  }`}
                />
              </button>
            </div>

            {showTime && (
              <div className="flex flex-col gap-[8px]">
                <label className="flex items-center gap-[8px] cursor-pointer">
                  <input
                    type="radio"
                    name={`time-option-${id || "default"}`}
                    checked={timeOption === "am"}
                    onChange={() => handleTimeOptionChange("am")}
                    className="w-[16px] h-[16px] accent-rdj-text-brand"
                  />
                  <span className="font-sans font-normal text-[13px] leading-[20px] text-rdj-text-primary">
                    AM <span className="text-rdj-text-tertiary">(Voor 12:00)</span>
                  </span>
                </label>
                <label className="flex items-center gap-[8px] cursor-pointer">
                  <input
                    type="radio"
                    name={`time-option-${id || "default"}`}
                    checked={timeOption === "pm"}
                    onChange={() => handleTimeOptionChange("pm")}
                    className="w-[16px] h-[16px] accent-rdj-text-brand"
                  />
                  <span className="font-sans font-normal text-[13px] leading-[20px] text-rdj-text-primary">
                    PM <span className="text-rdj-text-tertiary">(Na 12:00)</span>
                  </span>
                </label>
                <label className="flex items-center gap-[8px] cursor-pointer">
                  <input
                    type="radio"
                    name={`time-option-${id || "default"}`}
                    checked={timeOption === "specifiek"}
                    onChange={() => handleTimeOptionChange("specifiek")}
                    className="w-[16px] h-[16px] accent-rdj-text-brand"
                  />
                  <span className="font-sans font-normal text-[13px] leading-[20px] text-rdj-text-primary">
                    Specifiek
                  </span>
                </label>

                {timeOption === "specifiek" && (
                  <div className="flex items-center gap-[8px] ml-[24px]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-rdj-text-tertiary shrink-0">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 4.5V8L10.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      type="time"
                      value={timeValue}
                      onChange={(e) => handleTimeValueChange(e.target.value)}
                      className="px-[10px] py-[4px] font-sans font-normal text-[13px] leading-[20px] text-rdj-text-primary border border-rdj-border-primary rounded-[6px] outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
