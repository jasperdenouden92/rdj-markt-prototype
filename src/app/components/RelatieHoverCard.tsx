import type { ReactNode } from "react";
import { mockRelaties, mockContactPersonen } from "../data/mock-relatie-data";

const relatieStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
  actief: { label: "Actief", bg: "bg-[#ECFDF3]", text: "text-[#027A48]" },
  inactief: { label: "Inactief", bg: "bg-[#F2F4F7]", text: "text-[#344054]" },
  prospect: { label: "Prospect", bg: "bg-[#FFFAEB]", text: "text-[#B54708]" },
};

const soortRelatieLabels: Record<string, string> = {
  "lading-eigenaar": "Lading-eigenaar",
  bevrachter: "Bevrachter",
  scheepseigenaar: "Scheepseigenaar",
  controleorganisatie: "Controleorganisatie",
  terminal: "Terminal",
};

export interface RelatieHoverCardProps {
  naam: string;
  status?: "actief" | "inactief" | "prospect";
  soortRelatie?: string[];
  plaats?: string;
  telefoon?: string;
  email?: string;
  ladingGroepen?: string[];
  contactPersoon?: string;
  contactFunctie?: string;
}

export default function RelatieHoverCard({
  naam,
  status,
  soortRelatie,
  plaats,
  telefoon,
  email,
  ladingGroepen,
  contactPersoon,
  contactFunctie,
}: RelatieHoverCardProps) {
  const sc = status ? (relatieStatusConfig[status] || relatieStatusConfig.actief) : null;
  return (
    <div className="p-[16px]">
      {/* Header */}
      <div className="mb-[12px]">
        <div className="flex items-center justify-between gap-[8px]">
          <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] truncate min-w-0">{naam}</p>
          {sc && (
            <span className={`shrink-0 inline-flex items-center rounded-[4px] px-[6px] py-[1px] font-sans font-bold text-[11px] leading-[16px] ${sc.bg} ${sc.text}`}>
              {sc.label}
            </span>
          )}
        </div>
        {soortRelatie && soortRelatie.length > 0 && (
          <p className="font-sans font-normal leading-[18px] text-rdj-text-secondary text-[12px] mt-[2px]">
            {soortRelatie.map((s) => soortRelatieLabels[s] || s).join(" · ")}
          </p>
        )}
      </div>

      {/* Contact info */}
      {(contactPersoon || plaats || telefoon || email) && (
        <div className="space-y-[6px] mb-[8px]">
          {contactPersoon && (
            <div className="flex items-center gap-[6px]">
              <svg className="shrink-0 size-[14px] text-rdj-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
              <p className="font-sans font-normal leading-[18px] text-[#344054] text-[12px] truncate">
                {contactPersoon}{contactFunctie ? ` · ${contactFunctie}` : ""}
              </p>
            </div>
          )}
          {plaats && (
            <div className="flex items-center gap-[6px]">
              <svg className="shrink-0 size-[14px] text-rdj-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
              <p className="font-sans font-normal leading-[18px] text-[#344054] text-[12px]">{plaats}</p>
            </div>
          )}
          {telefoon && (
            <div className="flex items-center gap-[6px]">
              <svg className="shrink-0 size-[14px] text-rdj-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" /></svg>
              <p className="font-sans font-normal leading-[18px] text-[#344054] text-[12px]">{telefoon}</p>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-[6px]">
              <svg className="shrink-0 size-[14px] text-rdj-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
              <p className="font-sans font-normal leading-[18px] text-[#344054] text-[12px] truncate">{email}</p>
            </div>
          )}
        </div>
      )}

      {/* Lading groepen */}
      {ladingGroepen && ladingGroepen.length > 0 && (
        <div className="flex flex-wrap gap-[4px] pt-[8px] border-t border-rdj-border-secondary">
          {ladingGroepen.map((g, i) => (
            <span key={i} className="inline-flex items-center bg-[#f2f4f7] rounded-[4px] px-[6px] py-[2px] font-sans font-bold text-[11px] text-rdj-text-primary">
              {g}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Resolve a relatie by name and return <RelatieHoverCard /> props, or null if not found. */
export function buildRelatieHoverContent(relatieName: string | undefined | null): ReactNode {
  if (!relatieName) return undefined;
  const relatie = mockRelaties.find((r) => r.naam === relatieName);
  if (!relatie) return undefined;
  const cp = relatie.contactPersoonIds[0]
    ? mockContactPersonen.find((c) => c.id === relatie.contactPersoonIds[0])
    : undefined;
  return (
    <RelatieHoverCard
      naam={relatie.naam}
      status={relatie.status}
      soortRelatie={relatie.soortRelatie}
      plaats={relatie.plaats}
      telefoon={relatie.telefoon}
      email={relatie.email}
      ladingGroepen={relatie.ladingGroepen}
      contactPersoon={cp?.naam}
      contactFunctie={cp?.functie}
    />
  );
}

/** Resolve a relatie by ID and return <RelatieHoverCard /> props, or null if not found. */
export function buildRelatieHoverContentById(relatieId: string | undefined | null): ReactNode {
  if (!relatieId) return undefined;
  const relatie = mockRelaties.find((r) => r.id === relatieId);
  if (!relatie) return undefined;
  const cp = relatie.contactPersoonIds[0]
    ? mockContactPersonen.find((c) => c.id === relatie.contactPersoonIds[0])
    : undefined;
  return (
    <RelatieHoverCard
      naam={relatie.naam}
      status={relatie.status}
      soortRelatie={relatie.soortRelatie}
      plaats={relatie.plaats}
      telefoon={relatie.telefoon}
      email={relatie.email}
      ladingGroepen={relatie.ladingGroepen}
      contactPersoon={cp?.naam}
      contactFunctie={cp?.functie}
    />
  );
}
