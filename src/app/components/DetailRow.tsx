import { useState, useRef, useEffect, type ReactNode } from "react";
import StarRating from "./StarRating";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { nl } from "date-fns/locale";
import { PRESET_OPTIONS, formatDate } from "./TermijnDropdown";

/**
 * DetailRow — a label + value row for detail sidebars.
 *
 * Types:
 *   default  — plain text, optional subtext
 *   linked   — text in brand color (clickable), optional subtext
 *   badges   — wrapping badge list
 *   user     — avatar (image or initials) + text
 */

export type DetailRowType = "default" | "linked" | "badges" | "user" | "rating";

export interface DetailRowProps {
  /** Left-side label */
  label: string;

  /** Row type — determines how the value is rendered */
  type?: DetailRowType;

  /** Primary value text (default / linked / user) */
  value?: string;

  /** Secondary line below value (default / linked) */
  subtext?: string;

  /** Badge strings (type = badges) */
  badges?: string[];

  /** Avatar image source (type = user) */
  avatarSrc?: string;

  /** Avatar initials fallback (type = user) */
  avatarInitials?: string;

  /** Click handler — only applies to linked rows */
  onClick?: () => void;

  /** Label width — defaults to w-[144px] */
  labelWidth?: string;

  /** Show editable hover box on the value area */
  editable?: boolean;

  /** Callback when the editable value area is clicked */
  onEdit?: () => void;

  /** Rating value (type = rating) */
  rating?: number;

  /** Rating change handler (type = rating) */
  onRate?: (value: number) => void;

  /** Callback when an inline edit is saved. If provided, clicking an editable field opens an inline input. */
  onSave?: (value: string) => void;

  /** Value shown in the input when editing (e.g. raw number "12" instead of formatted "12 uur") */
  editValue?: string;

  /** Optional color override for the subtext */
  subtextColor?: string;

  /** Optional tooltip shown on hover of the subtext */
  subtextTooltip?: string;

  /** Optional hover card content shown on hover of linked rows */
  hoverContent?: ReactNode;

  /** When provided, clicking the editable area opens a termijn dropdown instead of a text input */
  onTermijnChange?: (value: string) => void;

  /** Current termijn display value (used alongside onTermijnChange) */
  termijnValue?: string;
}

export default function DetailRow({
  label,
  type = "default",
  value,
  subtext,
  badges,
  avatarSrc,
  avatarInitials,
  onClick,
  labelWidth = "w-[144px]",
  editable = false,
  onEdit,
  rating,
  onRate,
  onSave,
  editValue: editValueProp,
  subtextColor,
  subtextTooltip,
  hoverContent,
  onTermijnChange,
  termijnValue,
}: DetailRowProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Termijn popover state
  const [termijnOpen, setTermijnOpen] = useState(false);
  const [termijnView, setTermijnView] = useState<"menu" | "calendar">("menu");
  const [termijnCalDate, setTermijnCalDate] = useState<Date | undefined>(undefined);
  const [termijnMonth, setTermijnMonth] = useState<Date>(new Date());

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleStartEdit = () => {
    if (onSave) {
      setEditValue(editValueProp ?? value ?? "");
      setEditing(true);
    } else {
      onEdit?.();
    }
  };

  const handleCommit = () => {
    setEditing(false);
    if (editValue !== (value || "")) {
      onSave?.(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommit();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  };

  const handleTermijnPreset = (option: typeof PRESET_OPTIONS[number]) => {
    onTermijnChange?.(option.label);
    setTermijnOpen(false);
    setTermijnView("menu");
  };

  const handleTermijnDate = (date: Date | undefined) => {
    if (date) {
      setTermijnCalDate(date);
      onTermijnChange?.(formatDate(date));
      setTermijnOpen(false);
      setTermijnView("menu");
    }
  };

  const handleTermijnToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setTermijnMonth(today);
    handleTermijnDate(today);
  };

  const valueContent = (
    <>
      {type === "default" && <DefaultValue value={value} subtext={subtext} subtextColor={subtextColor} subtextTooltip={subtextTooltip} editable={editable} />}
      {type === "linked" && (
        hoverContent ? (
          <HoverCard openDelay={300} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div>
                <LinkedValue value={value} subtext={subtext} subtextColor={subtextColor} subtextTooltip={subtextTooltip} onClick={onClick} />
              </div>
            </HoverCardTrigger>
            <HoverCardContent side="left" align="start" sideOffset={8} className="w-[280px] p-0 border-rdj-border-secondary">
              {hoverContent}
            </HoverCardContent>
          </HoverCard>
        ) : (
          <LinkedValue value={value} subtext={subtext} subtextColor={subtextColor} subtextTooltip={subtextTooltip} onClick={onClick} />
        )
      )}
      {type === "badges" && <BadgesValue badges={badges} editable={editable} />}
      {type === "user" && (
        <UserValue
          value={value}
          avatarSrc={avatarSrc}
          avatarInitials={avatarInitials}
        />
      )}
      {type === "rating" && (
        <div className="px-[12px] py-[6px]">
          <StarRating value={rating ?? 0} onChange={onRate} />
        </div>
      )}
    </>
  );

  return (
    <div className="content-stretch flex gap-[16px] items-start relative shrink-0 w-full group/detail-row">
      {/* Label */}
      <div
        className={`bg-white content-stretch flex items-center py-[8px] relative rounded-[6px] shrink-0 ${labelWidth}`}
      >
        <p className="flex-[1_0_0] font-sans font-normal leading-[20px] min-h-px min-w-px relative text-rdj-text-secondary text-[14px]">
          {label}
        </p>
      </div>

      {/* Value */}
      {onTermijnChange ? (
        <Popover open={termijnOpen} onOpenChange={(o) => { setTermijnOpen(o); if (!o) setTermijnView("menu"); }}>
          <PopoverTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setTermijnOpen(true); }}
              className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative cursor-pointer"
            >
              <div className="rounded-[6px] w-full border border-transparent transition-all group-hover/detail-row:border-rdj-border-primary group-hover/detail-row:bg-rdj-bg-secondary-hover">
                <div className="pl-[12px] pr-[6px] py-[8px]">
                  <p className={`font-sans leading-[20px] text-[14px] ${termijnValue ? "font-bold text-rdj-text-primary" : "font-normal text-rdj-text-tertiary"}`}>
                    {termijnValue || "Voeg toe"}
                  </p>
                </div>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={4} className="w-auto p-0 border border-rdj-border-primary rounded-[12px] shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)]">
            {termijnView === "menu" ? (
              <div className="py-[4px] min-w-[200px]">
                {PRESET_OPTIONS.map((option) => (
                  <button key={option.value} onClick={() => handleTermijnPreset(option)} className="w-full px-[16px] py-[10px] text-left font-sans font-normal text-[14px] leading-[20px] text-[#101828] hover:bg-[#f9fafb] flex items-center justify-between">
                    {option.label}
                    {termijnValue === option.label && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                        <path d="M3 8.5L6.5 12L13 4" stroke="#1567A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
                <button onClick={() => setTermijnView("calendar")} className="w-full px-[16px] py-[10px] text-left font-sans font-normal text-[14px] leading-[20px] text-[#101828] hover:bg-[#f9fafb]">
                  Datum...
                </button>
              </div>
            ) : (
              <div className="flex flex-col w-[280px]">
                <div className="px-[16px] pt-[16px] flex items-center gap-[8px]">
                  <input type="text" readOnly value={termijnCalDate ? `${termijnCalDate.getDate()}-${termijnCalDate.getMonth() + 1}-${termijnCalDate.getFullYear()}` : ""} placeholder="Selecteer datum" className="flex-1 px-[10px] py-[6px] font-sans font-normal text-[13px] leading-[20px] text-rdj-text-primary border border-rdj-border-primary rounded-[6px] outline-none bg-white placeholder:text-rdj-text-tertiary" />
                  <button onClick={handleTermijnToday} className="px-[10px] py-[6px] font-sans font-bold text-[13px] leading-[20px] text-rdj-text-brand border border-rdj-border-primary rounded-[6px] hover:bg-rdj-bg-primary-hover transition-colors whitespace-nowrap">Vandaag</button>
                </div>
                <Calendar mode="single" selected={termijnCalDate} onSelect={handleTermijnDate} month={termijnMonth} onMonthChange={setTermijnMonth} locale={nl} weekStartsOn={1} className="px-[12px] pb-[12px]" />
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
      ) : editable && editing ? (
        <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
          <div className="rounded-[6px] w-full border border-rdj-border-brand bg-white">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleCommit}
              onKeyDown={handleKeyDown}
              className="w-full px-[12px] py-[7px] font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] bg-transparent outline-none rounded-[6px]"
            />
          </div>
        </div>
      ) : editable ? (
        <div
          className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative cursor-pointer"
          onClick={handleStartEdit}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStartEdit();
            }
          }}
        >
          <div className="rounded-[6px] w-full border border-transparent transition-all group-hover/detail-row:border-rdj-border-primary group-hover/detail-row:bg-rdj-bg-secondary-hover">
            {valueContent}
          </div>
        </div>
      ) : (
        <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
          {valueContent}
        </div>
      )}
    </div>
  );
}

/* ── Value renderers ── */

function SubtextWithTooltip({ subtext, subtextColor, subtextTooltip }: { subtext: string; subtextColor?: string; subtextTooltip?: string }) {
  if (!subtextTooltip) {
    return (
      <p
        className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]"
        style={subtextColor ? { color: subtextColor } : undefined}
      >
        {subtext}
      </p>
    );
  }
  return (
    <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="cursor-default"
            style={subtextColor ? { color: subtextColor } : undefined}
          >
            {subtext}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">{subtextTooltip}</TooltipContent>
      </Tooltip>
    </p>
  );
}

function DefaultValue({
  value,
  subtext,
  subtextColor,
  subtextTooltip,
  editable,
}: {
  value?: string;
  subtext?: string;
  subtextColor?: string;
  subtextTooltip?: string;
  editable?: boolean;
}) {
  const isEmpty = !value || value === "—";
  return (
    <div className="bg-white relative rounded-[6px] shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex flex-col justify-center pl-[12px] pr-[6px] py-[8px] relative w-full">
          <p className={`font-sans leading-[20px] text-[14px] ${isEmpty && editable ? "font-normal text-rdj-text-tertiary" : "font-bold text-rdj-text-primary"}`}>
            {isEmpty && editable ? "Voeg toe" : (value || "—")}
          </p>
          {subtext && (
            <SubtextWithTooltip subtext={subtext} subtextColor={subtextColor} subtextTooltip={subtextTooltip} />
          )}
        </div>
      </div>
    </div>
  );
}

function LinkedValue({
  value,
  subtext,
  subtextColor,
  subtextTooltip,
  onClick,
}: {
  value?: string;
  subtext?: string;
  subtextColor?: string;
  subtextTooltip?: string;
  onClick?: () => void;
}) {
  return (
    <div className="content-stretch flex flex-col items-start px-[12px] py-[8px] relative w-full">
      <button
        onClick={onClick}
        className="content-stretch flex items-center gap-[6px] overflow-clip relative shrink-0 w-full group"
        type="button"
      >
        <p className="flex-[1_0_0] font-sans font-bold leading-[20px] min-h-px min-w-px overflow-hidden relative text-rdj-text-brand text-[14px] text-ellipsis text-left whitespace-nowrap group-hover:underline">
          {value || "—"}
        </p>
      </button>
      {subtext && (
        <SubtextWithTooltip subtext={subtext} subtextColor={subtextColor} subtextTooltip={subtextTooltip} />
      )}
    </div>
  );
}

function BadgesValue({ badges, editable }: { badges?: string[]; editable?: boolean }) {
  if (!badges || badges.length === 0) {
    return (
      <div className="px-[12px] py-[8px]">
        <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[14px]">
          {editable ? "Voeg toe" : "—"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white relative rounded-[6px] shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pl-[12px] pr-[6px] py-[8px] relative w-full">
          <div className="content-stretch flex flex-wrap gap-[4px] items-start relative w-full">
            {badges.map((badge, i) => (
              <div
                key={i}
                className="bg-white content-stretch flex items-center px-[6px] py-[2px] relative rounded-[4px] shrink-0"
              >
                <div
                  aria-hidden="true"
                  className="absolute border border-rdj-border-primary border-solid inset-0 pointer-events-none rounded-[4px]"
                />
                <p className="font-sans font-bold leading-[18px] relative shrink-0 text-rdj-text-primary text-[12px] text-center whitespace-nowrap">
                  {badge}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserValue({
  value,
  avatarSrc,
  avatarInitials,
}: {
  value?: string;
  avatarSrc?: string;
  avatarInitials?: string;
}) {
  const initials =
    avatarInitials ||
    (value
      ? value
          .split(" ")
          .map((w) => w[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "");

  return (
    <div className="content-stretch flex items-center gap-[8px] px-[12px] py-[6px] relative w-full">
      {/* Avatar */}
      <div className="relative rounded-full shrink-0 size-[28px] bg-rdj-bg-secondary overflow-hidden">
        {avatarSrc ? (
          <img
            alt=""
            className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-full size-full"
            src={avatarSrc}
          />
        ) : (
          <div className="flex items-center justify-center size-full">
            <p className="font-sans font-bold text-[11px] text-rdj-text-secondary leading-none">
              {initials}
            </p>
          </div>
        )}
      </div>

      {/* Name */}
      <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] truncate min-w-0">
        {value || "—"}
      </p>
    </div>
  );
}