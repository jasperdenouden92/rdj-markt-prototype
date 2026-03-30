import { useMemo } from "react";
import { useParams, Link } from "react-router";
import Sidebar from "../components/Sidebar";
import { subpartijen, partijen } from "../data/entities/partijen";
import { havens } from "../data/entities/havens";
import { mockBijzonderheden, mockLadingSoorten, mockLadingSubsoorten } from "../data/mock-contract-data";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
}

const chevronSvg = (
  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.33333 9.33333">
    <path d="M0.666664 8.66667L4.66666 4.66667L0.666664 0.666668" stroke="var(--stroke-0, #D0D5DD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
  </svg>
);

export default function SubpartijDetail() {
  const { id } = useParams();

  const subpartij = useMemo(() => subpartijen.find((s) => s.id === id), [id]);
  const partij = useMemo(() => subpartij ? partijen.find((p) => p.id === subpartij.partijId) : undefined, [subpartij]);
  const laadhaven = useMemo(() => partij ? havens.find((h) => h.id === partij.laadhavenId) : undefined, [partij]);
  const loshaven = useMemo(() => subpartij ? havens.find((h) => h.id === subpartij.loshavenId) : undefined, [subpartij]);
  const ladingSoort = useMemo(() => partij ? mockLadingSoorten.find((ls) => ls.id === partij.ladingSoortId) : undefined, [partij]);
  const subsoort = useMemo(() => partij?.subsoortId ? mockLadingSubsoorten.find((s) => s.id === partij.subsoortId) : undefined, [partij]);
  const bijzonderheden = useMemo(() =>
    (subpartij?.bijzonderheidIds || [])
      .map((bid) => mockBijzonderheden.find((b) => b.id === bid))
      .filter(Boolean),
    [subpartij]
  );

  if (!subpartij) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-sans font-bold text-[20px] text-rdj-text-primary">Subpartij niet gevonden</p>
            <Link to="/lading/subpartijen" className="font-sans text-[14px] text-rdj-text-brand hover:underline mt-2 block">
              Terug naar overzicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtitle = [laadhaven?.naam, loshaven?.naam].filter(Boolean).join(" → ");

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Breadcrumb */}
        <div className="flex flex-col gap-[20px] items-start pt-[24px] w-full">
          <div className="flex items-center gap-[8px] pl-[24px]">
            <Link to="/lading/subpartijen" className="flex items-center justify-center p-[4px] rounded-[6px] hover:bg-rdj-bg-primary-hover">
              <p className="font-sans font-bold leading-[20px] text-[#475467] text-[14px] whitespace-nowrap">Lading</p>
            </Link>
            <div className="overflow-clip shrink-0 size-[16px]"><div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4 relative"><div className="absolute inset-[-8.33%_-16.67%]">{chevronSvg}</div></div></div>
            <Link to="/lading/subpartijen" className="flex items-center justify-center p-[4px] rounded-[6px] hover:bg-rdj-bg-primary-hover">
              <p className="font-sans font-bold leading-[20px] text-[#475467] text-[14px] whitespace-nowrap">Subpartijen</p>
            </Link>
            <div className="overflow-clip shrink-0 size-[16px]"><div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4 relative"><div className="absolute inset-[-8.33%_-16.67%]">{chevronSvg}</div></div></div>
            <div className="bg-[#f9fafb] flex items-center justify-center px-[8px] py-[4px] rounded-[6px]">
              <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px] whitespace-nowrap">{subpartij.naam}</p>
            </div>
          </div>
          <div className="h-px w-full bg-rdj-border-secondary" />
        </div>

        <div className="flex items-stretch min-h-[calc(100vh-65px)]">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="max-w-[900px] mx-auto px-[24px] py-[32px]">
              {/* Header */}
              <div className="mb-[32px]">
                <h1 className="font-sans font-bold text-[24px] leading-[32px] text-rdj-text-primary">{subpartij.naam}</h1>
                <p className="font-sans font-normal text-[14px] leading-[20px] text-rdj-text-secondary mt-[4px]">{subtitle}</p>
              </div>

              {/* Partij link */}
              {partij && (
                <div className="mb-[32px]">
                  <h2 className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary mb-[16px]">Partij</h2>
                  <Link
                    to={`/lading/partij/${partij.id}`}
                    className="flex items-center justify-between bg-[#f9fafb] border border-rdj-border-primary rounded-[8px] p-[12px] hover:bg-[#f2f4f7] transition-colors group"
                  >
                    <div className="flex flex-col gap-[2px]">
                      <p className="font-sans font-bold text-[14px] text-rdj-text-primary group-hover:text-rdj-text-brand">{partij.naam}</p>
                      <p className="font-sans font-normal text-[12px] text-rdj-text-secondary">
                        {ladingSoort?.naam || "—"}
                      </p>
                    </div>
                    <svg className="size-[16px] text-rdj-text-tertiary group-hover:text-rdj-text-brand shrink-0" fill="none" viewBox="0 0 16 16">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[320px] shrink-0 border-l border-rdj-border-secondary bg-white">
            <div className="flex border-b border-rdj-border-secondary">
              <div className="flex-1 py-[12px] font-sans font-bold text-[13px] text-center border-b-2 text-rdj-text-brand border-[#1567a4]">
                Details
              </div>
            </div>

            <div className="p-[24px] flex flex-col gap-[20px]">
              <div className="flex flex-col gap-[12px]">
                {partij && (
                  <DetailRow label="Partij">
                    <Link to={`/lading/partij/${partij.id}`} className="font-sans font-bold text-[14px] text-rdj-text-brand hover:underline">
                      {partij.naam}
                    </Link>
                  </DetailRow>
                )}
                {ladingSoort && (
                  <DetailRow label="Lading">
                    <p className="font-sans font-bold text-[14px] text-rdj-text-primary">{ladingSoort.naam}</p>
                  </DetailRow>
                )}
                {subsoort && (
                  <DetailRow label="Subsoort">
                    <p className="font-sans font-bold text-[14px] text-rdj-text-primary">{subsoort.naam}</p>
                  </DetailRow>
                )}
                <DetailRow label="Laadhaven">
                  <p className="font-sans font-bold text-[14px] text-rdj-text-primary">{laadhaven?.naam || "—"}</p>
                </DetailRow>
                <DetailRow label="Loshaven">
                  <p className="font-sans font-bold text-[14px] text-rdj-text-primary">{loshaven?.naam || "—"}</p>
                </DetailRow>
                <DetailRow label="Laaddatum">
                  <p className="font-sans font-bold text-[14px] text-rdj-text-primary">{formatDate(subpartij.laaddatum)}</p>
                </DetailRow>
                <DetailRow label="Losdatum">
                  <p className="font-sans font-bold text-[14px] text-rdj-text-primary">{formatDate(subpartij.losdatum)}</p>
                </DetailRow>
              </div>

              {bijzonderheden.length > 0 && (
                <>
                  <div className="h-px w-full bg-rdj-border-secondary" />
                  <div className="flex flex-col gap-[8px]">
                    <p className="font-sans font-normal text-[14px] text-rdj-text-secondary">Bijzonderheden</p>
                    <div className="flex flex-wrap gap-[4px]">
                      {bijzonderheden.map((b) => b && (
                        <span key={b.id} className="inline-flex items-center bg-[#f2f4f7] rounded-[4px] px-[8px] py-[2px] font-sans font-bold text-[12px] text-rdj-text-primary">
                          {b.naam}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-[16px]">
      <p className="font-sans font-normal text-[14px] text-rdj-text-secondary w-[120px] shrink-0">{label}</p>
      {children}
    </div>
  );
}
