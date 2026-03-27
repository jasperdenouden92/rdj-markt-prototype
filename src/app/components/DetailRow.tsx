import { useState, useRef, useEffect, type ReactNode } from "react";
import StarRating from "./StarRating";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

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
}: DetailRowProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  const valueContent = (
    <>
      {type === "default" && <DefaultValue value={value} subtext={subtext} subtextColor={subtextColor} subtextTooltip={subtextTooltip} editable={editable} />}
      {type === "linked" && (
        <LinkedValue value={value} subtext={subtext} subtextColor={subtextColor} subtextTooltip={subtextTooltip} onClick={onClick} />
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
      {editable && editing ? (
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