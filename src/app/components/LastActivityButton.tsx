import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Button from "./Button";
import { formatDateRelative } from "../utils/formatDate";
import StackedAvatars from "./StackedAvatars";
import imgEricNieuwkoop from "../../assets/a2737d3b5b234fc04041650cb9f114889c6859da.png";
import imgKhoaNguyen from "../../assets/3627de284acb374a4d9313b3c2dbaeeb87a48224.png";
import imgPelgerDeJong from "../../assets/e7809035038b3816de2a1d67c5de86ebeed325d0.png";
import imgJanWillemVdKraan from "../../assets/9e45f45f537bea4bf653bc0307471e5ff5545f63.png";

/* ── Helpers ── */

function formatRelativeDatum(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Zojuist";
  if (diffMins < 60) return `${diffMins} min geleden`;
  if (diffHours < 24) return `${diffHours} uur geleden`;
  if (diffDays === 1) return "Gisteren";
  if (diffDays < 7) return `${diffDays} dagen geleden`;
  const days = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
  const months = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}


/* ── Types ── */

interface ActivityLogEntry {
  id: string;
  user: string;
  initials: string;
  avatar: string;
  action: string;
  timestamp: string;
  detail?: string;
}

/* ── Mock data ── */

const MOCK_CONVERSATION_ACTIVITY: ActivityLogEntry[] = [
  { id: "ca-1", user: "Jan-Willem van der Kraan", initials: "JK", avatar: imgJanWillemVdKraan, action: "heeft gebeld met contactpersoon", timestamp: "2026-03-27T09:15:00" },
  { id: "ca-2", user: "Khoa Nguyen", initials: "KN", avatar: imgKhoaNguyen, action: "heeft condities aangepast", timestamp: "2026-03-26T16:32:00", detail: "Prijs gewijzigd naar €4,50 per ton" },
  { id: "ca-3", user: "Eric Nieuwkoop", initials: "EN", avatar: imgEricNieuwkoop, action: "heeft lading aangeboden", timestamp: "2026-03-25T11:04:00" },
  { id: "ca-4", user: "Pelger de Jong", initials: "PJ", avatar: imgPelgerDeJong, action: "heeft gesprek gestart", timestamp: "2026-03-24T08:47:00" },
];

/* ── Component ── */

interface LastActivityButtonProps {
  /** Relatie ID for the "Meer details" navigation */
  relatieId?: string;
  /** Called before navigating away (e.g. to close a parent dialog) */
  onNavigateAway?: () => void;
  /** Max stacked avatars to show (default 3) */
  maxAvatars?: number;
  /** Avatar size in px (default 28) */
  avatarSize?: number;
}

export default function LastActivityButton({ relatieId, onNavigateAway, maxAvatars = 3, avatarSize = 28 }: LastActivityButtonProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const lastEvent = MOCK_CONVERSATION_ACTIVITY[0];

  // Deduplicate users for stacked avatars (keep first occurrence = most recent)
  const uniqueUsers: { src: string; name: string }[] = [];
  const seen = new Set<string>();
  for (const event of MOCK_CONVERSATION_ACTIVITY) {
    if (!seen.has(event.user)) {
      seen.add(event.user);
      uniqueUsers.push({ src: event.avatar, name: event.user });
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-[8px] cursor-pointer rounded-[6px] hover:bg-rdj-bg-primary-hover transition-colors px-[8px] py-[4px] -mx-[8px]"
        onClick={() => setOpen(!open)}
      >
        <span className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-secondary whitespace-nowrap">
          {formatRelativeDatum(lastEvent.timestamp)}
        </span>
        <StackedAvatars avatars={uniqueUsers} max={maxAvatars} size={avatarSize} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-[8px] z-50 bg-white border border-rdj-border-secondary rounded-[12px] shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] w-[380px]">
          <div className="px-[16px] pt-[16px] pb-[12px] border-b border-rdj-border-secondary">
            <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary">Activiteit</p>
          </div>
          <div className="px-[16px] py-[12px] max-h-[320px] overflow-y-auto">
            <div className="flex flex-col">
              {MOCK_CONVERSATION_ACTIVITY.map((event, index) => (
                <div key={event.id} className="flex gap-[10px] relative">
                  {index < MOCK_CONVERSATION_ACTIVITY.length - 1 && (
                    <div className="absolute left-[13px] top-[32px] bottom-0 w-px bg-rdj-border-secondary" />
                  )}
                  <div className="relative rounded-full shrink-0 size-[28px] bg-[#f2f4f7] overflow-hidden z-[1]">
                    <img alt="" src={event.avatar} className="absolute inset-0 size-full object-cover rounded-full" />
                  </div>
                  <div className="flex-1 pb-[16px]">
                    <p className="font-sans font-normal leading-[18px] text-rdj-text-secondary text-[13px]">
                      <span className="font-bold text-rdj-text-primary">{event.user}</span>{" "}
                      {event.action}
                    </p>
                    <p className="font-sans font-normal text-rdj-text-tertiary text-[12px] mt-[2px]">
                      {formatDateRelative(event.timestamp)}
                    </p>
                    {event.detail && (
                      <div className="mt-[6px] bg-rdj-bg-secondary rounded-[6px] px-[10px] py-[6px]">
                        <p className="font-sans font-normal text-rdj-text-secondary text-[13px]">
                          {event.detail}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {relatieId && (
            <div className="px-[16px] py-[12px] border-t border-rdj-border-secondary">
              <Button
                variant="tertiary-gray"
                size="sm"
                label="Meer details"
                onClick={() => {
                  setOpen(false);
                  onNavigateAway?.();
                  navigate(`/markt/relaties/${relatieId}#activiteit`);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
