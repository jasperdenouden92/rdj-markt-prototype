import { useState, useMemo } from "react";
import { PanelRight } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Table, { type Column } from "../components/Table";
import ActivityFeed from "../components/ActivityFeed";
import { mockRelaties, mockContactPersonen, mockRelatieLadingen } from "../data/mock-relatie-data";
import { mockContracten, mockLadingSoorten, mockLadingSubsoorten, mockBijzonderheden } from "../data/mock-contract-data";
import { partijen, subpartijen, exen } from "../data/entities/partijen";
import { havens } from "../data/entities/havens";
import { ladingenEigen } from "../data/entities/ladingen-eigen";
import { formatDate } from "../utils/formatDate";

const chevronSvg = (
  <svg className="shrink-0 size-[16px]" fill="none" viewBox="0 0 16 16">
    <path d="M6 12L10 8L6 4" stroke="#D0D5DD" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

interface PendingSubpartij {
  id: string;
  naam: string;
  tonnage: string;
  laaddatum: string;
  losdatum: string;
  loslocatie: string;
}

export default function LadingModuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"details" | "logistiek" | "tijden">("details");
  const [pendingSubpartijen, setPendingSubpartijen] = useState<PendingSubpartij[]>([]);

  // Try mockRelatieLadingen first, fall back to partij entity
  const rlLading = useMemo(() => mockRelatieLadingen.find((l) => l.id === id), [id]);
  const partij = useMemo(() => !rlLading ? partijen.find((p) => p.id === id) : undefined, [id, rlLading]);

  // Build a unified "lading" view from whichever source matched
  const lading = useMemo(() => {
    if (rlLading) return rlLading;
    if (!partij) return undefined;
    // Build lading-like object from partij data
    const le = ladingenEigen.find((l) => l.partijId === partij.id);
    const subs = subpartijen.filter((s) => s.partijId === partij.id);
    const laadlocatie = havens.find((h) => h.id === partij.laadlocatieId);
    const loslocatie = subs[0] ? havens.find((h) => h.id === subs[0].loslocatieId) : undefined;
    const ex = partij.exId ? exen.find((e) => e.id === partij.exId) : undefined;
    return {
      id: partij.id,
      relatieId: le?.relatieId || "",
      titel: partij.naam,
      ladingSoortId: partij.ladingSoortId,
      subsoortId: partij.subsoortId,
      laadlocatie: laadlocatie?.naam || "—",
      loslocatie: loslocatie?.naam || "—",
      tonnage: `${partij.tonnage.toLocaleString("nl-NL")} ton`,
      product: "",
      laaddatum: subs[0]?.laaddatum || undefined,
      losdatum: subs[0]?.losdatum || undefined,
      status: le?.status || "intake",
      matches: 0,
      onderhandelingen: 0,
      exNaam: ex ? `m/v ${ex.naam}` : undefined,
      exType: ex?.type,
      bijzonderheidIds: subs.flatMap((s) => s.bijzonderheidIds),
      _subpartijen: subs,
    } as typeof rlLading & { _subpartijen?: typeof subs };
  }, [rlLading, partij]);

  const relatie = useMemo(() => lading ? mockRelaties.find((r) => r.id === lading.relatieId) : undefined, [lading]);
  const contract = useMemo(() => lading?.contractId ? mockContracten.find((c) => c.id === lading.contractId) : undefined, [lading]);
  const ladingSoort = useMemo(() => lading?.ladingSoortId ? mockLadingSoorten.find((ls) => ls.id === lading.ladingSoortId) : undefined, [lading]);
  const subsoort = useMemo(() => lading?.subsoortId ? mockLadingSubsoorten.find((s) => s.id === lading.subsoortId) : undefined, [lading]);
  const contactPersoon = useMemo(() => {
    if (!lading?.contactPersoonId) {
      return relatie ? mockContactPersonen.find((cp) => cp.relatieId === relatie.id) : undefined;
    }
    return mockContactPersonen.find((cp) => cp.id === lading.contactPersoonId);
  }, [lading, relatie]);

  const tonnageNumber = useMemo(() => {
    if (!lading) return 0;
    const num = parseFloat(lading.tonnage.replace(/[^\d.,]/g, "").replace(".", "").replace(",", "."));
    return isNaN(num) ? 0 : num;
  }, [lading]);

  const sg = lading?.soortelijkGewicht || ladingSoort?.soortelijkGewicht || 0;
  const inhoud = tonnageNumber && sg ? Math.round(tonnageNumber / sg) : 0;

  const subpartijTableData = useMemo(() => [
    ...((lading as any)?._subpartijen ?? []).map((sub: any) => ({
      id: sub.id,
      naam: sub.naam,
      tonnageDisplay: sub.tonnage != null ? `${sub.tonnage.toLocaleString("nl-NL")} t` : "—",
      laaddatumDisplay: sub.laaddatum ? formatDate(sub.laaddatum) : "—",
      losdatumDisplay: sub.losdatum ? formatDate(sub.losdatum) : "—",
      loslocatieDisplay: havens.find((h) => h.id === sub.loslocatieId)?.naam ?? "—",
      _pending: false,
    })),
    ...pendingSubpartijen.map((sub) => ({
      id: sub.id,
      naam: sub.naam,
      tonnageDisplay: sub.tonnage,
      laaddatumDisplay: sub.laaddatum,
      losdatumDisplay: sub.losdatum,
      loslocatieDisplay: sub.loslocatie,
      _pending: true,
    })),
  ], [lading, pendingSubpartijen]);

  const subpartijColumns = useMemo((): Column[] => [
    {
      key: "naam",
      header: "Subpartij",
      type: "leading-text",
      minWidth: "min-w-[120px]",
    },
    {
      key: "tonnageDisplay",
      header: "Tonnage",
      type: "custom",
      width: "w-[120px]",
      render: (row) => row._pending ? (
        <input
          type="text"
          inputMode="numeric"
          value={row.tonnageDisplay}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            const val = raw ? Number(raw).toLocaleString('nl-NL') : '';
            setPendingSubpartijen((prev) => prev.map((s) => s.id === row.id ? { ...s, tonnage: val } : s));
          }}
          placeholder="Tonnage"
          className="w-full font-sans font-normal text-[14px] text-rdj-text-primary border border-rdj-border-primary rounded-[6px] px-[8px] py-[4px] outline-none focus:border-[#1570ef] bg-white"
        />
      ) : (
        <p className="font-sans font-normal text-[14px] text-rdj-text-primary">{row.tonnageDisplay}</p>
      ),
    },
    {
      key: "laaddatumDisplay",
      header: "Laaddatum",
      type: "custom",
      width: "w-[130px]",
      render: (row) => row._pending ? (
        <input
          type="text"
          value={row.laaddatumDisplay}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setPendingSubpartijen((prev) => prev.map((s) => s.id === row.id ? { ...s, laaddatum: e.target.value } : s))}
          placeholder="DD-MM-YYYY"
          className="w-full font-sans font-normal text-[14px] text-rdj-text-primary border border-rdj-border-primary rounded-[6px] px-[8px] py-[4px] outline-none focus:border-[#1570ef] bg-white"
        />
      ) : (
        <p className="font-sans font-normal text-[14px] text-rdj-text-primary">{row.laaddatumDisplay}</p>
      ),
    },
    {
      key: "losdatumDisplay",
      header: "Losdatum",
      type: "custom",
      width: "w-[130px]",
      render: (row) => row._pending ? (
        <input
          type="text"
          value={row.losdatumDisplay}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setPendingSubpartijen((prev) => prev.map((s) => s.id === row.id ? { ...s, losdatum: e.target.value } : s))}
          placeholder="DD-MM-YYYY"
          className="w-full font-sans font-normal text-[14px] text-rdj-text-primary border border-rdj-border-primary rounded-[6px] px-[8px] py-[4px] outline-none focus:border-[#1570ef] bg-white"
        />
      ) : (
        <p className="font-sans font-normal text-[14px] text-rdj-text-primary">{row.losdatumDisplay}</p>
      ),
    },
    {
      key: "loslocatieDisplay",
      header: "Loslocatie",
      type: "custom",
      render: (row) => row._pending ? (
        <input
          type="text"
          value={row.loslocatieDisplay}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setPendingSubpartijen((prev) => prev.map((s) => s.id === row.id ? { ...s, loslocatie: e.target.value } : s))}
          placeholder="Loslocatie"
          className="w-full font-sans font-normal text-[14px] text-rdj-text-primary border border-rdj-border-primary rounded-[6px] px-[8px] py-[4px] outline-none focus:border-[#1570ef] bg-white"
        />
      ) : (
        <p className="font-sans font-normal text-[14px] text-rdj-text-primary">{row.loslocatieDisplay}</p>
      ),
    },
  ], [setPendingSubpartijen]);

  if (!lading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar data-annotation-id="ladingmoduledetail-navigatie-2" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-sans font-bold text-[20px] text-rdj-text-primary">Lading niet gevonden</p>
            <Link to="/lading/partijen" className="font-sans text-[14px] text-rdj-text-brand hover:underline mt-2 block">
              Terug naar overzicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtitle = `Vanuit ${lading.laadlocatie}${lading.aankomst ? ` · Verwachte start op ${formatDate(lading.aankomst)}` : lading.laaddatum ? ` · Verwachte start op ${formatDate(lading.laaddatum)}` : ""}`;

  const bijzonderheden = (lading.bijzonderheidIds || [])
    .map((id) => mockBijzonderheden.find((b) => b.id === id))
    .filter(Boolean);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar data-annotation-id="ladingmoduledetail-navigatie" />

      <div className="flex-1 flex min-h-0 min-w-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
        {/* Breadcrumb */}
        <div className="flex flex-col gap-[20px] items-start pt-[24px] w-full">
          <div className="flex items-center justify-between gap-[8px] px-[24px] w-full">
            <div className="flex items-center gap-[8px]">
              <Link to="/lading" className="flex items-center justify-center p-[4px] rounded-[6px] hover:bg-rdj-bg-primary-hover">
                <p className="font-sans font-bold leading-[20px] text-[#475467] text-[14px] whitespace-nowrap">Lading</p>
              </Link>
              {chevronSvg}
              <div className="bg-[#f9fafb] flex items-center justify-center px-[8px] py-[4px] rounded-[6px]">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px] whitespace-nowrap">{lading.titel}</p>
              </div>
              {/* Prev/next arrows */}
              <div className="flex items-center gap-[4px] ml-[8px]">
                <button className="size-[24px] flex items-center justify-center rounded-[4px] border border-rdj-border-primary text-rdj-text-secondary hover:bg-rdj-bg-primary-hover">
                  <svg className="size-[12px]" fill="none" viewBox="0 0 12 12"><path d="M7.5 9L4.5 6L7.5 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
                </button>
                <button className="size-[24px] flex items-center justify-center rounded-[4px] border border-rdj-border-primary text-rdj-text-secondary hover:bg-rdj-bg-primary-hover">
                  <svg className="size-[12px]" fill="none" viewBox="0 0 12 12"><path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
                </button>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className={`p-[8px] rounded-[8px] transition-colors shrink-0 ${sidebarOpen ? 'bg-rdj-bg-active text-rdj-text-brand' : 'hover:bg-rdj-bg-primary-hover text-rdj-text-secondary'}`}
            >
              <PanelRight size={20} />
            </button>
          </div>
          <div className="h-px w-full bg-rdj-border-secondary" />
        </div>

        <div className="flex items-stretch min-h-[calc(100vh-65px)]">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="max-w-[900px] mx-auto px-[24px] py-[32px]">
              {/* Header */}
              <div className="flex items-start justify-between mb-[32px]">
                <div>
                  <h1 className="font-sans font-bold text-[24px] leading-[32px] text-rdj-text-primary">{lading.titel}</h1>
                  <p className="font-sans font-normal text-[14px] leading-[20px] text-rdj-text-secondary mt-[4px]">{subtitle}</p>
                </div>
                <div className="flex items-center gap-[8px]">
                  <Button variant="secondary" label="Acties" trailingIcon={
                    <svg className="size-[12px]" fill="none" viewBox="0 0 12 12"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
                  } />
                  <Button variant="primary" label="Bewerken" />
                </div>
              </div>

              {/* Verdeling */}
              <div className="mb-[32px]">
                <h2 className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary mb-[16px]">Verdeling</h2>

                <div className="flex items-baseline justify-between mb-[8px]">
                  <div>
                    <span className="font-sans font-normal text-[12px] text-rdj-text-secondary">Verdeeld</span>
                    <p className="font-sans font-bold text-[24px] leading-[32px] text-rdj-text-primary">0 t</p>
                  </div>
                  <div className="text-right">
                    <span className="font-sans font-normal text-[12px] text-rdj-text-secondary">Te verdelen</span>
                    <p className="font-sans font-bold text-[24px] leading-[32px] text-rdj-text-primary">{tonnageNumber > 0 ? `${tonnageNumber.toLocaleString("nl-NL")} t` : lading.tonnage}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-[8px] bg-[#eaecf0] rounded-full overflow-hidden mb-[8px]">
                  <div className="h-full bg-[#1567a4] rounded-full" style={{ width: "0%" }} />
                </div>

                {/* Regie legend */}
                <div className="flex items-center gap-[16px]">
                  <div className="flex items-center gap-[6px]">
                    <div className="size-[8px] rounded-full bg-[#F79009]" />
                    <span className="font-sans text-[13px] text-rdj-text-secondary">Duwvaart</span>
                    <span className="font-sans font-bold text-[13px] text-rdj-text-primary">0 t</span>
                    <span className="font-sans text-[13px] text-rdj-text-tertiary">0%</span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <div className="size-[8px] rounded-full bg-[#F04438]" />
                    <span className="font-sans text-[13px] text-rdj-text-secondary">Binnenvaart</span>
                    <span className="font-sans font-bold text-[13px] text-rdj-text-primary">0 t</span>
                    <span className="font-sans text-[13px] text-rdj-text-tertiary">0%</span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <div className="size-[8px] rounded-full bg-[#1567a4]" />
                    <span className="font-sans text-[13px] text-rdj-text-secondary">Flex</span>
                    <span className="font-sans font-bold text-[13px] text-rdj-text-primary">0 t</span>
                    <span className="font-sans text-[13px] text-rdj-text-tertiary">0%</span>
                  </div>
                </div>
              </div>

              {/* Subpartijen */}
              <div className="mb-[32px]">
                <div className="flex items-center justify-between mb-[16px]">
                  <h2 className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary">Subpartijen</h2>
                  <Button variant="secondary" label="Plannen" leadingIcon={
                    <svg className="size-[14px]" fill="none" viewBox="0 0 16 16">
                      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M5 8H11M8 5V11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                    </svg>
                  } />
                </div>

                <Table
                  columns={subpartijColumns}
                  data={subpartijTableData}
                  onRowClick={(row) => { if (!row._pending) navigate(`/lading/subpartij/${row.id}`); }}
                />

                {/* Add button */}
                <div className="py-[16px] px-[12px]">
                  <button
                    onClick={() => {
                      const existingCount = ((lading as any)?._subpartijen?.length ?? 0) + pendingSubpartijen.length;
                      const partijNaam = (lading as any)?.naam ?? 'SUB';
                      const naam = `${partijNaam}-${String(existingCount + 1).padStart(2, '0')}`;
                      setPendingSubpartijen(prev => [...prev, { id: `pending-${Date.now()}`, naam, tonnage: '', laaddatum: '', losdatum: '', loslocatie: '' }]);
                    }}
                    className="flex items-center gap-[6px] text-rdj-text-brand font-sans font-bold text-[14px] hover:underline"
                  >
                    <svg className="size-[14px]" fill="none" viewBox="0 0 16 16">
                      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                    Subpartij toevoegen
                  </button>
                </div>
              </div>

              {/* Activiteit */}
              <div>
                <div className="flex items-center justify-between mb-[16px]">
                  <h2 className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary">Activiteit</h2>
                  <button className="flex items-center gap-[4px] font-sans font-bold text-[14px] text-rdj-text-brand hover:underline">
                    Alle activiteit
                    <svg className="size-[12px]" fill="none" viewBox="0 0 12 12"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
                  </button>
                </div>
                <ActivityFeed />
              </div>
            </div>
          </div>

        </div>
        </div>

          {/* Right Sidebar */}
          <div
            className={`shrink-0 overflow-hidden transition-[width] duration-150 ease-out bg-white ${sidebarOpen ? "border-l border-rdj-border-secondary" : "border-l-0"}`}
            style={{ width: sidebarOpen ? 320 : 0 }}
          >
            <div className="w-[320px] h-full overflow-y-auto">
            {/* Sidebar tabs */}
            <div className="flex border-b border-rdj-border-secondary">
              {(["details", "logistiek", "tijden"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSidebarTab(tab)}
                  className={`flex-1 py-[12px] font-sans font-bold text-[13px] text-center border-b-2 transition-colors ${
                    sidebarTab === tab
                      ? "text-rdj-text-brand border-[#1567a4]"
                      : "text-rdj-text-secondary border-transparent hover:text-rdj-text-primary"
                  }`}
                >
                  {tab === "details" ? "Details" : tab === "logistiek" ? "Logistiek" : "Tijden"}
                </button>
              ))}
            </div>

            <div className="p-[24px] flex flex-col gap-[20px]">
              {sidebarTab === "details" && (
                <>
                  {/* Notitie / info */}
                  {lading.notitie && (
                    <p className="font-sans font-normal text-[13px] leading-[20px] text-rdj-text-secondary italic">
                      {lading.notitie}
                    </p>
                  )}

                  {/* Details rows */}
                  <div className="flex flex-col gap-[12px]">
                    <DetailRow label="Tonnage" value={lading.tonnage} />
                    <DetailRow label="Lading" value={ladingSoort ? `${ladingSoort.naam}${ladingSoort.subsoortIds.length > 0 ? ` (${ladingSoort.id.replace("ls-", "0")})` : ""}` : lading.product} />
                    {subsoort && (
                      <DetailRow label="Soort" value={subsoort.naam} />
                    )}
                    <DetailRow label="Soortelijk gewicht" value={sg ? `${String(sg).replace(".", ",")} t/m³` : "—"} />
                    {inhoud > 0 && (
                      <DetailRow label="Inhoud" value={`${inhoud.toLocaleString("nl-NL")} m³`} />
                    )}

                    {/* Bijzonderheden */}
                    {bijzonderheden.length > 0 && (
                      <div className="flex items-start gap-[16px]">
                        <p className="font-sans font-normal text-[14px] text-rdj-text-secondary w-[120px] shrink-0">Bijzonderheden</p>
                        <div className="flex flex-wrap gap-[4px]">
                          {bijzonderheden.map((b) => b && (
                            <span key={b.id} className="inline-flex items-center bg-[#f2f4f7] rounded-[4px] px-[8px] py-[2px] font-sans font-bold text-[12px] text-rdj-text-primary">
                              {b.naam}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="h-px w-full bg-rdj-border-secondary" />

                  {/* Relatie */}
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex items-start gap-[16px]">
                      <p className="font-sans font-normal text-[14px] text-rdj-text-secondary w-[120px] shrink-0">Relatie</p>
                      {relatie ? (
                        <Link to={`/crm/relatie/${relatie.id}`} className="font-sans font-bold text-[14px] text-rdj-text-brand hover:underline">
                          {relatie.naam}
                        </Link>
                      ) : (
                        <p className="font-sans font-bold text-[14px] text-rdj-text-primary">—</p>
                      )}
                    </div>

                    {/* Contactgegevens */}
                    {contactPersoon && (
                      <div className="flex items-start gap-[16px]">
                        <p className="font-sans font-normal text-[14px] text-rdj-text-secondary w-[120px] shrink-0">Contactgegevens</p>
                        <div className="flex flex-col gap-[2px]">
                          <p className="font-sans font-bold text-[14px] text-rdj-text-primary">{contactPersoon.naam}</p>
                          <a href={`mailto:${contactPersoon.email}`} className="font-sans font-normal text-[13px] text-rdj-text-brand hover:underline">{contactPersoon.email}</a>
                          <p className="font-sans font-normal text-[13px] text-rdj-text-secondary">{contactPersoon.telefoon}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contract blok */}
                  {contract && (
                    <>
                      <div className="h-px w-full bg-rdj-border-secondary" />
                      <div className="flex flex-col gap-[8px]">
                        <p className="font-sans font-bold text-[14px] text-rdj-text-primary">Gekoppelde deal</p>
                        <Link
                          to={`/crm/deal/${contract.id}`}
                          className="flex items-center justify-between bg-[#f9fafb] border border-rdj-border-primary rounded-[8px] p-[12px] hover:bg-[#f2f4f7] transition-colors group"
                        >
                          <div className="flex flex-col gap-[2px]">
                            <p className="font-sans font-bold text-[14px] text-rdj-text-primary group-hover:text-rdj-text-brand">{contract.titel}</p>
                            <p className="font-sans font-normal text-[12px] text-rdj-text-secondary">
                              {contract.type === "contract" ? "Contract" : "Spot"}{contract.soort ? ` · ${contract.soort}` : ""}
                            </p>
                          </div>
                          <svg className="size-[16px] text-rdj-text-tertiary group-hover:text-rdj-text-brand shrink-0" fill="none" viewBox="0 0 16 16">
                            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                          </svg>
                        </Link>
                      </div>
                    </>
                  )}
                </>
              )}

              {sidebarTab === "logistiek" && (
                <div className="flex flex-col gap-[12px]">
                  <DetailRow label="Laadlocatie" value={lading.laadlocatie || "—"} />
                  {lading.laadterminal && <DetailRow label="Laadterminal" value={lading.laadterminal} />}
                  <DetailRow label="Loslocatie" value={lading.loslocatie || "—"} />
                  {lading.losterminal && <DetailRow label="Losterminal" value={lading.losterminal} />}
                  {lading.lostermijn && <DetailRow label="Lostermijn" value={lading.lostermijn} />}
                  <DetailRow label="Regie" value={lading.regie ? (lading.regie === "flex" ? "Flex" : lading.regie === "duwvaart" ? "Duwvaart" : "Binnenvaart") : "Flex"} />
                  {lading.exType && (
                    <DetailRow label="Ex." value={`${lading.exType === "zeeboot" ? "Zeeboot" : lading.exType === "opslag" ? "Opslag" : "Vloot"}${lading.exNaam ? ` — ${lading.exNaam}` : ""}`} />
                  )}
                  {lading.controleOrganisatie && <DetailRow label="Controleorganisatie" value={lading.controleOrganisatie} />}
                </div>
              )}

              {sidebarTab === "tijden" && (
                <div className="flex flex-col gap-[12px]">
                  <DetailRow label="Aankomst" value={lading.aankomst ? formatDate(lading.aankomst) : formatDate(lading.laaddatum)} />
                  {lading.startLaden && <DetailRow label="Start laden" value={formatDate(lading.startLaden)} />}
                  {lading.startLossen && <DetailRow label="Start lossen" value={formatDate(lading.startLossen)} />}
                  {lading.eindeLossen && <DetailRow label="Einde lossen" value={formatDate(lading.eindeLossen)} />}
                </div>
              )}
            </div>
          </div>
          </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-[16px]">
      <p className="font-sans font-normal text-[14px] text-rdj-text-secondary w-[120px] shrink-0">{label}</p>
      <p className="font-sans font-bold text-[14px] text-rdj-text-primary">{value}</p>
    </div>
  );
}
