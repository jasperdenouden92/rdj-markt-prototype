import { useState } from "react";
import type { MailConversatie, MailBericht } from "../data/mock-relatie-data";

interface MailConversatiesProps {
  conversaties: MailConversatie[];
}

function formatDatum(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `Vandaag, ${d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return `Gisteren, ${d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getInitials(naam: string): string {
  return naam.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function truncate(text: string, max: number): string {
  const oneLine = text.replace(/\n/g, " ").trim();
  return oneLine.length > max ? oneLine.slice(0, max) + "..." : oneLine;
}

const envelopeIcon = (
  <svg className="size-[16px]" fill="none" viewBox="0 0 16 16">
    <path d="M2 4L8 8.5L14 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const paperclipIcon = (
  <svg className="size-[14px]" fill="none" viewBox="0 0 16 16">
    <path d="M14 7.5L8.5 13C7.57174 13.9283 6.3261 14.4571 5.025 14.4571C3.7239 14.4571 2.47826 13.9283 1.55 13C0.621742 12.0717 0.0929413 10.8261 0.0929413 9.525C0.0929413 8.2239 0.621742 6.97826 1.55 6.05L7.05 0.55C7.66913 -0.0691268 8.50739 -0.416429 9.38125 -0.416429C10.2551 -0.416429 11.0934 -0.0691268 11.7125 0.55C12.3316 1.16913 12.6789 2.00739 12.6789 2.88125C12.6789 3.75511 12.3316 4.59337 11.7125 5.2125L6.2 10.725C5.89043 11.0346 5.47131 11.2082 5.03437 11.2082C4.59744 11.2082 4.17832 11.0346 3.86875 10.725C3.55918 10.4154 3.38553 9.99631 3.38553 9.55937C3.38553 9.12244 3.55918 8.70332 3.86875 8.39375L8.925 3.35" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
  </svg>
);

export default function MailConversaties({ conversaties }: MailConversatiesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedBerichtId, setExpandedBerichtId] = useState<string | null>(null);

  if (conversaties.length === 0) {
    return (
      <div className="w-full px-[24px] pb-[32px]">
        <div className="py-[48px] text-center">
          <div className="flex justify-center mb-[12px] text-rdj-text-tertiary">
            {envelopeIcon}
          </div>
          <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
            Nog geen mailconversaties gekoppeld.
          </p>
          <p className="font-sans font-normal text-[13px] text-rdj-text-tertiary mt-[4px]">
            Gebruik de Outlook-plugin om e-mails toe te wijzen.
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...conversaties].sort((a, b) => new Date(b.laatsteDatum).getTime() - new Date(a.laatsteDatum).getTime());

  return (
    <div className="w-full px-[24px] pb-[32px]">
      <div className="flex flex-col gap-[1px]">
        {sorted.map((conv) => {
          const isExpanded = expandedId === conv.id;
          const laatsteBericht = conv.berichten[conv.berichten.length - 1];
          const heeftBijlagen = conv.berichten.some((b) => b.bijlagen && b.bijlagen.length > 0);

          return (
            <div key={conv.id} className="border border-rdj-border-secondary rounded-[8px] overflow-hidden mb-[8px]">
              {/* Conversatie header — klik om open/dicht te doen */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : conv.id)}
                className={`w-full text-left px-[16px] py-[12px] flex items-start gap-[12px] hover:bg-[#f9fafb] transition-colors ${!conv.gelezen ? "bg-[#f0f7ff]" : "bg-white"}`}
              >
                {/* Avatar */}
                <div className="shrink-0 size-[36px] rounded-full bg-[#f2f4f7] flex items-center justify-center mt-[2px]">
                  <span className="font-sans font-bold text-[12px] text-rdj-text-secondary">
                    {getInitials(conv.van.naam)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[8px] mb-[2px]">
                    <p className={`font-sans text-[14px] truncate ${!conv.gelezen ? "font-bold text-rdj-text-primary" : "font-bold text-rdj-text-primary"}`}>
                      {conv.van.naam}
                    </p>
                    {!conv.gelezen && (
                      <div className="shrink-0 size-[6px] rounded-full bg-[#1567a4]" />
                    )}
                    {heeftBijlagen && (
                      <span className="shrink-0 text-rdj-text-tertiary">{paperclipIcon}</span>
                    )}
                  </div>
                  <p className={`font-sans text-[14px] leading-[20px] truncate ${!conv.gelezen ? "font-bold text-rdj-text-primary" : "font-normal text-rdj-text-primary"}`}>
                    {conv.onderwerp}
                  </p>
                  <p className="font-sans font-normal text-[13px] leading-[18px] text-rdj-text-secondary truncate mt-[2px]">
                    {truncate(laatsteBericht.inhoud, 100)}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-[4px]">
                  <p className="font-sans font-normal text-[12px] text-rdj-text-tertiary whitespace-nowrap">
                    {formatDatum(conv.laatsteDatum)}
                  </p>
                  <span className="font-sans font-normal text-[11px] text-rdj-text-tertiary bg-[#f2f4f7] rounded-full px-[6px] py-[1px]">
                    {conv.berichten.length}
                  </span>
                </div>
              </button>

              {/* Expanded: alle berichten */}
              {isExpanded && (
                <div className="border-t border-rdj-border-secondary bg-[#fafbfc]">
                  {conv.berichten.map((bericht, idx) => (
                    <BerichtItem
                      key={bericht.id}
                      bericht={bericht}
                      isLast={idx === conv.berichten.length - 1}
                      isExpanded={expandedBerichtId === bericht.id || idx === conv.berichten.length - 1}
                      onToggle={() => setExpandedBerichtId(expandedBerichtId === bericht.id ? null : bericht.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BerichtItem({
  bericht,
  isLast,
  isExpanded,
  onToggle,
}: {
  bericht: MailBericht;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`${!isLast ? "border-b border-rdj-border-secondary" : ""}`}>
      <button
        onClick={onToggle}
        className="w-full text-left px-[16px] py-[12px] flex items-start gap-[12px] hover:bg-[#f2f4f7] transition-colors"
      >
        <div className="shrink-0 size-[32px] rounded-full bg-[#eaecf0] flex items-center justify-center mt-[2px]">
          <span className="font-sans font-bold text-[11px] text-rdj-text-secondary">
            {getInitials(bericht.van.naam)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[8px]">
            <p className="font-sans font-bold text-[13px] text-rdj-text-primary">{bericht.van.naam}</p>
            <p className="font-sans font-normal text-[12px] text-rdj-text-tertiary">{formatDatum(bericht.datum)}</p>
          </div>
          {!isExpanded && (
            <p className="font-sans font-normal text-[13px] text-rdj-text-secondary truncate mt-[2px]">
              {truncate(bericht.inhoud, 120)}
            </p>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-[16px] pb-[16px] ml-[44px]">
          <div className="font-sans font-normal text-[14px] leading-[22px] text-rdj-text-primary whitespace-pre-line">
            {bericht.inhoud}
          </div>
          {bericht.bijlagen && bericht.bijlagen.length > 0 && (
            <div className="flex flex-wrap gap-[8px] mt-[12px]">
              {bericht.bijlagen.map((bijlage, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-[6px] bg-white border border-rdj-border-primary rounded-[6px] px-[10px] py-[6px] hover:bg-[#f9fafb] cursor-pointer transition-colors"
                >
                  {paperclipIcon}
                  <span className="font-sans font-normal text-[13px] text-rdj-text-primary">{bijlage.naam}</span>
                  <span className="font-sans font-normal text-[11px] text-rdj-text-tertiary">{bijlage.grootte}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
