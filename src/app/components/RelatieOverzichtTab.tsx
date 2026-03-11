import type { Relatie, ContactPersoon } from "../data/api";
import { mockGebruikers } from "../data/mock-relatie-data";

interface RelatieOverzichtTabProps {
  relatie: Relatie;
  contactPersonen: ContactPersoon[];
  onTabChange: (tab: "overzicht" | "ladingen" | "vaartuigen" | "onderhandelingen" | "activiteit") => void;
}

function SectionHeader({ title, count, onViewAll }: { title: string; count?: number; onViewAll?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-[12px]">
      <div className="flex items-center gap-[8px]">
        <p className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary">{title}</p>
        {count !== undefined && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-full px-[6px] bg-[#f2f4f7] font-sans font-bold text-[12px] leading-[16px] text-rdj-text-secondary">
            {count}
          </span>
        )}
      </div>
      {onViewAll && (
        <button onClick={onViewAll} className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-brand hover:underline">
          Alles bekijken
        </button>
      )}
    </div>
  );
}

export default function RelatieOverzichtTab({ relatie, contactPersonen, onTabChange }: RelatieOverzichtTabProps) {
  const eigenaar = mockGebruikers.find((g) => g.id === relatie.eigenaarId);

  return (
    <div className="w-full px-[24px] flex flex-col gap-[32px] pb-[32px]">
      {/* Samenvatting */}
      <div className="bg-[#f9fafb] rounded-[8px] p-[20px]">
        <div className="grid grid-cols-4 gap-[16px]">
          <div>
            <p className="font-sans font-normal text-[12px] leading-[18px] text-rdj-text-secondary uppercase tracking-[0.04em]">Status</p>
            <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary mt-[4px]">
              {relatie.status ? relatie.status.charAt(0).toUpperCase() + relatie.status.slice(1) : "—"}
            </p>
          </div>
          <div>
            <p className="font-sans font-normal text-[12px] leading-[18px] text-rdj-text-secondary uppercase tracking-[0.04em]">Eigenaar</p>
            <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary mt-[4px]">
              {eigenaar?.naam || "—"}
            </p>
          </div>
          <div>
            <p className="font-sans font-normal text-[12px] leading-[18px] text-rdj-text-secondary uppercase tracking-[0.04em]">Contacten</p>
            <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary mt-[4px]">
              {contactPersonen.length}
            </p>
          </div>
          <div>
            <p className="font-sans font-normal text-[12px] leading-[18px] text-rdj-text-secondary uppercase tracking-[0.04em]">Ladinggroepen</p>
            <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary mt-[4px]">
              {relatie.ladingGroepen?.join(", ") || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Contactpersonen */}
      <div>
        <SectionHeader title="Contactpersonen" count={contactPersonen.length} />
        {contactPersonen.length === 0 ? (
          <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">Geen contactpersonen.</p>
        ) : (
          <div className="border border-rdj-border-secondary rounded-[8px] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rdj-border-secondary bg-[#f9fafb]">
                  <th className="text-left px-[12px] py-[8px] font-sans font-bold text-[12px] text-rdj-text-secondary">Naam</th>
                  <th className="text-left px-[12px] py-[8px] font-sans font-bold text-[12px] text-rdj-text-secondary">Functie</th>
                  <th className="text-left px-[12px] py-[8px] font-sans font-bold text-[12px] text-rdj-text-secondary">E-mail</th>
                  <th className="text-left px-[12px] py-[8px] font-sans font-bold text-[12px] text-rdj-text-secondary">Telefoon</th>
                </tr>
              </thead>
              <tbody>
                {contactPersonen.slice(0, 5).map((cp) => (
                  <tr key={cp.id} className="border-b border-rdj-border-secondary last:border-b-0">
                    <td className="px-[12px] py-[10px] font-sans font-bold text-[14px] text-rdj-text-primary">{cp.naam}</td>
                    <td className="px-[12px] py-[10px] font-sans font-normal text-[14px] text-rdj-text-secondary">{cp.functie || "—"}</td>
                    <td className="px-[12px] py-[10px] font-sans font-normal text-[14px] text-rdj-text-brand">{cp.email || "—"}</td>
                    <td className="px-[12px] py-[10px] font-sans font-normal text-[14px] text-rdj-text-primary">{cp.telefoon || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ladingen */}
      <div>
        <SectionHeader title="Ladingen" count={0} onViewAll={() => onTabChange("ladingen")} />
        <div className="border border-rdj-border-secondary rounded-[8px] p-[24px] text-center">
          <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
            Nog geen ladingen gekoppeld aan deze relatie.
          </p>
        </div>
      </div>

      {/* Vaartuigen */}
      <div>
        <SectionHeader title="Vaartuigen" count={0} onViewAll={() => onTabChange("vaartuigen")} />
        <div className="border border-rdj-border-secondary rounded-[8px] p-[24px] text-center">
          <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
            Nog geen vaartuigen gekoppeld aan deze relatie.
          </p>
        </div>
      </div>

      {/* Onderhandelingen */}
      <div>
        <SectionHeader title="Onderhandelingen" count={0} onViewAll={() => onTabChange("onderhandelingen")} />
        <div className="border border-rdj-border-secondary rounded-[8px] p-[24px] text-center">
          <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
            Nog geen onderhandelingen voor deze relatie.
          </p>
        </div>
      </div>
    </div>
  );
}
