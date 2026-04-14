import { useState, useMemo } from "react";
import { PanelRight, Scale, Copy, Upload, Trash2 } from "lucide-react";
import { Toaster } from "sonner";
import { useParams, Link } from "react-router";
import AnnotationMarker from "../components/AnnotationMarker";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import ToewijzenAanMarktDialog from "../components/ToewijzenAanMarktDialog";
import Table, { type Column } from "../components/Table";
import ActivityFeed from "../components/ActivityFeed";
import { subpartijen, partijen, exen } from "../data/entities/partijen";
import { havens } from "../data/entities/havens";
import { ladingenEigen } from "../data/entities/ladingen-eigen";
import { mockRelaties, mockContactPersonen } from "../data/mock-relatie-data";
import { mockBijzonderheden, mockLadingSoorten, mockLadingSubsoorten } from "../data/mock-contract-data";
import { formatDate } from "../utils/formatDate";

const chevronSvg = (
  <svg className="shrink-0 size-[16px]" fill="none" viewBox="0 0 16 16">
    <path d="M6 12L10 8L6 4" stroke="#D0D5DD" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const anchorIcon = (
  <svg className="size-[14px] shrink-0 text-rdj-text-tertiary" fill="none" viewBox="0 0 16 16">
    <circle cx="8" cy="4" r="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 6v8M4 10c0 2 1.5 3 4 3s4-1 4-3M4 14h8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
  </svg>
);

interface MockPlanningRow {
  id: string;
  dossier: string;
  naam: string;
  scheepstype: string;
  marktBadge?: string;
  marktBadgeVariant?: "brand" | "grey";
  laadgewicht: number;
  laadgewichtDelta: number;
  laadtermijn: string;
  lostermijn: string;
  laadlocatie: string;
  loslocatie: string;
  statusLabel: string;
  statusVariant: "grey" | "brand" | "success" | "warning" | "error";
}

const mockPlanningRows: MockPlanningRow[] = [
  {
    id: "plan-001",
    dossier: "26.03.101",
    naam: "Antonia V",
    scheepstype: "Motorschip",
    laadgewicht: 1200,
    laadgewichtDelta: -3.22,
    laadtermijn: "Wo 18 Mrt 10:00",
    lostermijn: "Za 21 Mrt 10:00",
    laadlocatie: "Rotterdam Botlekkaai",
    loslocatie: "Hamburg Veddel kanal",
    statusLabel: "Te laden",
    statusVariant: "grey",
  },
  {
    id: "plan-002",
    dossier: "26.03.102",
    naam: "Duwbak Alfa-1",
    scheepstype: "Duwbak",
    marktBadge: "Markt",
    marktBadgeVariant: "brand",
    laadgewicht: 800,
    laadgewichtDelta: 2.0,
    laadtermijn: "Wo 18 Mrt 11:00",
    lostermijn: "Za 21 Mrt 10:00",
    laadlocatie: "Rotterdam Botlekkaai",
    loslocatie: "Hamburg Veddel kanal",
    statusLabel: "Besteld",
    statusVariant: "brand",
  },
  {
    id: "plan-003",
    dossier: "26.03.103",
    naam: "Duwbak Alfa-2",
    scheepstype: "Duwbak",
    laadgewicht: 600,
    laadgewichtDelta: 5.82,
    laadtermijn: "Wo 18 Mrt 12:00",
    lostermijn: "Za 21 Mrt 10:00",
    laadlocatie: "Rotterdam Botlekkaai",
    loslocatie: "Hamburg Veddel kanal",
    statusLabel: "In belading",
    statusVariant: "warning",
  },
  {
    id: "plan-004",
    dossier: "26.03.105",
    naam: "Fluvius I",
    scheepstype: "Duwbak",
    laadgewicht: 550,
    laadgewichtDelta: -5.55,
    laadtermijn: "Wo 18 Mrt 10:05",
    lostermijn: "Za 21 Mrt 10:00",
    laadlocatie: "Rotterdam Botlekkaai",
    loslocatie: "Hamburg Veddel kanal",
    statusLabel: "Geladen",
    statusVariant: "success",
  },
  {
    id: "plan-005",
    dossier: "26.03.106",
    naam: "Zoel",
    scheepstype: "Motorschip",
    laadgewicht: 790,
    laadgewichtDelta: 0,
    laadtermijn: "Wo 18 Mrt 10:05",
    lostermijn: "Za 21 Mrt 10:00",
    laadlocatie: "Rotterdam Botlekkaai",
    loslocatie: "Hamburg Veddel kanal",
    statusLabel: "In opslag",
    statusVariant: "grey",
  },
];

const planningColumns: Column[] = [
  {
    key: "dossier",
    header: "Dossier",
    type: "text",
    width: "w-[100px]",
  },
  {
    key: "naam",
    header: "Naam",
    type: "leading-text",
    subtextKey: "scheepstype",
    badgeKey: "marktBadge",
    badgeVariantKey: "marktBadgeVariant",
    minWidth: "min-w-[120px]",
  },
  {
    key: "laadgewichtDisplay",
    header: "Laadgewicht",
    type: "custom",
    width: "w-[130px]",
    render: (row: MockPlanningRow & { laadgewichtDisplay: string }) => (
      <div className="flex flex-col gap-[1px]">
        <p className="font-sans font-normal text-[14px] text-rdj-text-primary">{row.laadgewichtDisplay}</p>
        {row.laadgewichtDelta !== 0 && (
          <p className={`font-sans font-normal text-[12px] leading-[16px] ${row.laadgewichtDelta < 0 ? "text-[#f04438]" : "text-[#17b26a]"}`}>
            {row.laadgewichtDelta > 0 ? "+" : ""}{row.laadgewichtDelta.toFixed(2).replace(".", ",")}%
          </p>
        )}
      </div>
    ),
  },
  {
    key: "laadtermijn",
    header: "Laadtermijn",
    type: "text",
    width: "w-[140px]",
  },
  {
    key: "lostermijn",
    header: "Lostermijn",
    type: "text",
    width: "w-[140px]",
  },
  {
    key: "locatie",
    header: "Locatie (incl. laadlocaal)",
    type: "custom",
    width: "w-[190px]",
    render: (row: MockPlanningRow) => (
      <div className="flex items-start gap-[6px]">
        <div className="mt-[1px]">{anchorIcon}</div>
        <div className="flex flex-col gap-[1px]">
          <p className="font-sans font-normal text-[13px] leading-[18px] text-rdj-text-primary">{row.laadlocatie}</p>
          <p className="font-sans font-normal text-[13px] leading-[18px] text-rdj-text-secondary">{row.loslocatie}</p>
        </div>
      </div>
    ),
  },
  {
    key: "statusLabel",
    header: "Status",
    type: "status",
    variantKey: "statusVariant",
    defaultType: "default",
    dot: true,
  },
];

export default function SubpartijDetail() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"details" | "conditie" | "klant" | "taken">("details");
  const [showMarktDialog, setShowMarktDialog] = useState(false);
  const [marktTonnage, setMarktTonnage] = useState(0);

  const subpartij = useMemo(() => subpartijen.find((s) => s.id === id), [id]);
  const partij = useMemo(() => subpartij ? partijen.find((p) => p.id === subpartij.partijId) : undefined, [subpartij]);
  const ex = useMemo(() => partij?.exId ? exen.find((e) => e.id === partij.exId) : undefined, [partij]);
  const laadlocatie = useMemo(() => partij ? havens.find((h) => h.id === partij.laadlocatieId) : undefined, [partij]);
  const loslocatie = useMemo(() => subpartij ? havens.find((h) => h.id === subpartij.loslocatieId) : undefined, [subpartij]);
  const ladingSoort = useMemo(() => partij ? mockLadingSoorten.find((ls) => ls.id === partij.ladingSoortId) : undefined, [partij]);
  const subsoort = useMemo(() => partij?.subsoortId ? mockLadingSubsoorten.find((s) => s.id === partij.subsoortId) : undefined, [partij]);

  const loten = useMemo(() => ladingenEigen.filter((le) => le.subpartijId === id), [id]);
  const relatie = useMemo(() => {
    const le = loten[0];
    return le ? mockRelaties.find((r) => r.id === le.relatieId) : undefined;
  }, [loten]);
  const contactPersoon = useMemo(() => relatie ? mockContactPersonen.find((cp) => cp.relatieId === relatie.id) : undefined, [relatie]);

  const bijzonderheden = useMemo(() =>
    (subpartij?.bijzonderheidIds || [])
      .map((bid) => mockBijzonderheden.find((b) => b.id === bid))
      .filter(Boolean),
    [subpartij]
  );

  const planningTableData = useMemo(() =>
    mockPlanningRows.map((row) => ({
      ...row,
      laadgewichtDisplay: `${row.laadgewicht.toLocaleString("nl-NL")} t`,
    })),
    []
  );

  const sg = ladingSoort?.soortelijkGewicht || 0;
  const inhoud = subpartij?.tonnage && sg ? Math.round(subpartij.tonnage / sg) : 0;

  const exPrefix = ex?.type === "zeeboot" ? "i m/v" : ex?.type === "opslag" ? "Opslag" : "m/v";
  const titleEx = ex ? `${exPrefix} ${ex.naam}` : undefined;
  const title = [titleEx, relatie?.naam].filter(Boolean).join(" — ");

  const laaddatumFormatted = subpartij?.laaddatum ? formatDate(subpartij.laaddatum) : undefined;
  const losdatumFormatted = subpartij?.losdatum ? formatDate(subpartij.losdatum) : undefined;
  const subtitle = [
    laadlocatie ? `Vanuit ${laadlocatie.naam}` : undefined,
    laaddatumFormatted ? `op ${laaddatumFormatted}` : undefined,
    loslocatie ? `naar ${loslocatie.naam}` : undefined,
    losdatumFormatted ? `op ${losdatumFormatted}` : undefined,
  ].filter(Boolean).join(" ");

  if (!subpartij) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-sans font-bold text-[20px] text-rdj-text-primary">Subpartij niet gevonden</p>
            <Link to="/lading" className="font-sans text-[14px] text-rdj-text-brand hover:underline mt-2 block">
              Terug naar lading
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

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
                {partij && (
                  <Link to={`/lading/partij/${partij.id}`} className="flex items-center justify-center p-[4px] rounded-[6px] hover:bg-rdj-bg-primary-hover">
                    <p className="font-sans font-bold leading-[20px] text-[#475467] text-[14px] whitespace-nowrap">{partij.naam}</p>
                  </Link>
                )}
                {chevronSvg}
                <div className="bg-[#f9fafb] flex items-center justify-center px-[8px] py-[4px] rounded-[6px]">
                  <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px] whitespace-nowrap">{subpartij.naam}</p>
                </div>
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
                className={`p-[8px] rounded-[8px] transition-colors shrink-0 ${sidebarOpen ? "bg-rdj-bg-active text-rdj-text-brand" : "hover:bg-rdj-bg-primary-hover text-rdj-text-secondary"}`}
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
                    <h1 className="font-sans font-bold text-[24px] leading-[32px] text-rdj-text-primary">{title || subpartij.naam}</h1>
                    {subtitle && <p className="font-sans font-normal text-[14px] leading-[20px] text-rdj-text-secondary mt-[4px]">{subtitle}</p>}
                  </div>
                  <div className="flex items-center gap-[8px] shrink-0 ml-[24px]">
                    <AnnotationMarker annotationId="516af18a-88c4-4961-91b5-22e88b1dc26e">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" label="Acties" trailingIcon={
                          <svg className="size-[12px]" fill="none" viewBox="0 0 12 12"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
                        } />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[200px] border-[#eaecf0] bg-white shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)]">
                        <DropdownMenuItem onClick={() => setShowMarktDialog(true)}>
                          <Scale size={14} className="mr-2" />
                          Toewijzen aan markt…
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy size={14} className="mr-2" />
                          Dupliceren
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Upload size={14} className="mr-2" />
                          Exporteren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-[#D92D20] focus:text-[#D92D20]">
                          <Trash2 size={14} className="mr-2" />
                          Verwijderen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </AnnotationMarker>
                    <Button variant="primary" label="Bevrachten" />
                  </div>
                </div>

                {/* Loten / Planning */}
                <div className="mb-[32px]">
                  <div className="flex items-center justify-between mb-[16px]">
                    <h2 className="font-sans font-bold text-[16px] leading-[24px] text-rdj-text-primary">Planning</h2>
                    <Button variant="secondary" label="Planner" leadingIcon={
                      <svg className="size-[14px]" fill="none" viewBox="0 0 16 16">
                        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M5 8H11M8 5V11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                    } />
                  </div>

                  <Table columns={planningColumns} data={planningTableData} />
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
              {(["details", "conditie", "klant", "taken"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSidebarTab(tab)}
                  className={`flex-1 py-[12px] font-sans font-bold text-[13px] text-center border-b-2 transition-colors capitalize ${
                    sidebarTab === tab
                      ? "text-rdj-text-brand border-[#1567a4]"
                      : "text-rdj-text-secondary border-transparent hover:text-rdj-text-primary"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-[24px] flex flex-col gap-[20px]">
              {sidebarTab === "details" && (
                <>
                  <div className="flex flex-col gap-[12px]">
                    {subpartij.tonnage != null && (
                      <DetailRow
                        label="Tonnage"
                        value={
                          marktTonnage > 0
                            ? `${(subpartij.tonnage - marktTonnage).toLocaleString("nl-NL")} van ${subpartij.tonnage.toLocaleString("nl-NL")} t`
                            : `${subpartij.tonnage.toLocaleString("nl-NL")} t`
                        }
                      />
                    )}
                    {ladingSoort && (
                      <DetailRow label="Lading" value={ladingSoort.naam} />
                    )}
                    {subsoort && (
                      <DetailRow label="Subsoort" value={subsoort.naam} />
                    )}
                    {sg > 0 && (
                      <DetailRow label="Soortelijk gewicht" value={`${String(sg).replace(".", ",")} t/m³`} />
                    )}
                    {inhoud > 0 && (
                      <DetailRow label="Inhoud" value={`${inhoud.toLocaleString("nl-NL")} m³`} />
                    )}
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

                  <div className="flex flex-col gap-[12px]">
                    <DetailRow label="Laadlocatie" value={laadlocatie?.naam || "—"} />
                    <DetailRow label="Loslocatie" value={loslocatie?.naam || "—"} />
                    {subpartij.laaddatum && <DetailRow label="Laaddatum" value={formatDate(subpartij.laaddatum)} />}
                    {subpartij.losdatum && <DetailRow label="Losdatum" value={formatDate(subpartij.losdatum)} />}
                  </div>

                  {ex && (
                    <>
                      <div className="h-px w-full bg-rdj-border-secondary" />
                      <DetailRow label="Ex." value={`${ex.type === "zeeboot" ? "Zeeboot" : ex.type === "opslag" ? "Opslag" : "Vloot"} — ${ex.naam}`} />
                    </>
                  )}
                </>
              )}

              {sidebarTab === "conditie" && (
                <div className="flex flex-col gap-[12px]">
                  {loten[0] ? (
                    <>
                      <DetailRow label="Prijs" value={`€ ${loten[0].prijs?.toFixed(2).replace(".", ",") ?? "—"} /t`} />
                      <DetailRow label="Laadtijd" value={loten[0].laadtijd ? `${loten[0].laadtijd} uur` : "—"} />
                      <DetailRow label="Liggeld laden" value={loten[0].liggeldLaden ? `€ ${loten[0].liggeldLaden} /dag` : "—"} />
                      <DetailRow label="Lostijd" value={loten[0].lostijd ? `${loten[0].lostijd} uur` : "—"} />
                      <DetailRow label="Liggeld lossen" value={loten[0].liggeldLossen ? `€ ${loten[0].liggeldLossen} /dag` : "—"} />
                    </>
                  ) : (
                    <p className="font-sans font-normal text-[14px] text-rdj-text-secondary">Geen conditie beschikbaar</p>
                  )}
                </div>
              )}

              {sidebarTab === "klant" && (
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
              )}

              {sidebarTab === "taken" && (
                <div className="flex flex-col items-center gap-[8px] py-[16px]">
                  <p className="font-sans font-bold text-[14px] text-rdj-text-primary">Geen taken</p>
                  <p className="font-sans font-normal text-[13px] text-rdj-text-secondary text-center">Er zijn nog geen taken aangemaakt voor deze subpartij.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" richColors />
      <ToewijzenAanMarktDialog
        isOpen={showMarktDialog}
        onClose={() => setShowMarktDialog(false)}
        onSave={(t) => setMarktTonnage(t)}
        subpartijId={subpartij.id}
        subpartijNaam={subpartij.naam}
        subpartijTonnage={subpartij.tonnage ?? 0}
      />
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
