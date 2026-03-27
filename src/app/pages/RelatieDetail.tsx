import { useState, useMemo, useCallback } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import type { PageTab } from "../components/PageHeader";
import Badge from "../components/Badge";
import Button from "../components/Button";
import ActivityFeed from "../components/ActivityFeed";
import RelatieDetailSidebar from "../components/RelatieDetailSidebar";
import RelatieOverzichtTab from "../components/RelatieOverzichtTab";
import RelatieFormDialog from "../components/RelatieFormDialog";
import SectionHeader from "../components/SectionHeader";
import Table from "../components/Table";
import type { Column, RowData } from "../components/Table";
import { mockRelaties, mockContactPersonen, mockRelatieLadingen, mockRelatieVaartuigen, mockMailConversaties, mockGespreksverslagen, VAARTUIG_STATUS_MAP } from "../data/mock-relatie-data";
import type { Gespreksverslag } from "../data/mock-relatie-data";
import { mockContracten, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_VARIANT_MAP } from "../data/mock-contract-data";
import MailConversaties from "../components/MailConversaties";
import Gespreksverslagen from "../components/Gespreksverslagen";
import type { Relatie } from "../data/api";

const statusVariantMap: Record<string, "success" | "grey" | "brand"> = {
  actief: "success",
  inactief: "grey",
  prospect: "brand",
};

const ladingStatusMap: Record<string, { label: string; variant: "success" | "warning" | "brand" | "grey" }> = {
  intake: { label: "Intake", variant: "brand" },
  werklijst: { label: "Werklijst", variant: "warning" },
  markt: { label: "In de markt", variant: "success" },
  gesloten: { label: "Gesloten", variant: "grey" },
};

const vaartuigStatusMap: Record<string, { label: string; variant: "success" | "warning" | "brand" | "grey" }> = {
  beschikbaar: { label: "Beschikbaar", variant: "success" },
  onderweg: { label: "Onderweg", variant: "brand" },
  beladen: { label: "Beladen", variant: "warning" },
  in_onderhoud: { label: "In onderhoud", variant: "grey" },
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

const chevronSvg = (
  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.33333 9.33333">
    <path d="M0.666664 8.66667L4.66666 4.66667L0.666664 0.666668" stroke="var(--stroke-0, #D0D5DD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
  </svg>
);

export default function RelatieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isBevrachterContext = location.pathname.startsWith("/markt/bevrachters");
  const backPath = isBevrachterContext ? "/markt/bevrachters" : "/crm/relaties";
  const backModule = isBevrachterContext ? "Markt" : "CRM";
  const backSection = isBevrachterContext ? "Bevrachters" : "Relaties";
  const initialTab = (location.hash.replace("#", "") || "overzicht") as "overzicht" | "ladingen" | "vaartuigen" | "deals" | "mail" | "gesprekken" | "activiteit";
  const [activeTab, setActiveTab] = useState<"overzicht" | "ladingen" | "vaartuigen" | "deals" | "mail" | "gesprekken" | "activiteit">(initialTab);
  const [dealFilter, setDealFilter] = useState<"alle" | "spot" | "contract">("alle");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [relaties, setRelaties] = useState<Relatie[]>(mockRelaties);

  const relatie = useMemo(() => relaties.find((r) => r.id === id), [relaties, id]);
  const contactPersonen = useMemo(
    () => mockContactPersonen.filter((cp) => cp.relatieId === id),
    [id]
  );
  const relatieAllDeals = useMemo(
    () => mockContracten.filter((c) => c.relatieId === id),
    [id]
  );
  const relatieLadingen = useMemo(
    () => mockRelatieLadingen.filter((l) => l.relatieId === id),
    [id]
  );
  const relatieVaartuigen = useMemo(
    () => mockRelatieVaartuigen.filter((v) => v.relatieId === id),
    [id]
  );
  const [mailConversaties, setMailConversaties] = useState(mockMailConversaties);
  const relatieMail = useMemo(
    () => mailConversaties.filter((m) => m.relatieId === id),
    [mailConversaties, id]
  );
  const relatieDeals = relatieAllDeals;
  const handleLinkDeal = useCallback((mailId: string, dealId: string | undefined) => {
    setMailConversaties((prev) => {
      const updated = prev.map((m) => m.id === mailId ? { ...m, contractId: dealId } : m);
      // Also update the mock source so other pages see the change
      mockMailConversaties.splice(0, mockMailConversaties.length, ...updated);
      return updated;
    });
  }, []);

  const [verslagen, setVerslagen] = useState(
    () => mockGespreksverslagen.filter((v) => v.relatieId === id)
  );
  const handleAddVerslag = useCallback((data: Omit<Gespreksverslag, "id" | "aanmaakDatum">) => {
    const newVerslag: Gespreksverslag = {
      ...data,
      id: `gv-${Date.now()}`,
      aanmaakDatum: new Date().toISOString(),
    };
    mockGespreksverslagen.push(newVerslag);
    setVerslagen((prev) => [...prev, newVerslag]);
  }, []);

  if (!relatie) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-sans font-bold text-[20px] text-rdj-text-primary">Relatie niet gevonden</p>
            <Link to={backPath} className="font-sans text-[14px] text-rdj-text-brand hover:underline mt-2 block">
              Terug naar overzicht
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumb = (
    <div className="content-stretch flex flex-col gap-[20px] items-start pt-[24px] relative shrink-0 w-full">
      <div className="content-stretch flex gap-[20px] items-start relative shrink-0 w-full">
        <div className="content-stretch flex items-center pl-[24px] relative shrink-0">
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
            <Link to={backPath} className="content-stretch flex items-center justify-center p-[4px] relative rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] whitespace-nowrap">{backModule}</p>
            </Link>
            <div className="overflow-clip relative shrink-0 size-[16px]">
              <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4">
                <div className="absolute inset-[-8.33%_-16.67%]">{chevronSvg}</div>
              </div>
            </div>
            <Link to={backPath} className="content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] whitespace-nowrap">{backSection}</p>
            </Link>
            <div className="overflow-clip relative shrink-0 size-[16px]">
              <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4">
                <div className="absolute inset-[-8.33%_-16.67%]">{chevronSvg}</div>
              </div>
            </div>
            <div className="bg-[#f9fafb] content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#344054] text-[14px] whitespace-nowrap">
                {relatie.naam}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="h-px relative shrink-0 w-full bg-rdj-border-secondary" />
    </div>
  );

  const titleBadge = relatie.status ? (
    <Badge
      label={relatie.status.charAt(0).toUpperCase() + relatie.status.slice(1)}
      variant={statusVariantMap[relatie.status] || "grey"}
      size="lg"
      dot
    />
  ) : null;

  const subtitle = [relatie.adres, [relatie.postcode, relatie.plaats].filter(Boolean).join(" "), relatie.land]
    .filter(Boolean)
    .join(", ");

  const tabs: PageTab[] = [
    { label: "Overzicht", path: "#overzicht", isActive: activeTab === "overzicht" },
    { label: "Ladingen", path: "#ladingen", isActive: activeTab === "ladingen", badge: String(relatieLadingen.length) },
    { label: "Vaartuigen", path: "#vaartuigen", isActive: activeTab === "vaartuigen", badge: String(relatieVaartuigen.length) },
    { label: "Deals", path: "#deals", isActive: activeTab === "deals", badge: String(relatieAllDeals.length) },
    { label: "Mail", path: "#mail", isActive: activeTab === "mail", badge: String(relatieMail.length) },
    { label: "Gesprekken", path: "#gesprekken", isActive: activeTab === "gesprekken", badge: String(verslagen.length) },
    { label: "Activiteit", path: "#activiteit", isActive: activeTab === "activiteit" },
  ];

  const actions = (
    <>
      <Button variant="secondary" label="Archiveren" />
      <Button variant="primary" label="Bewerken" onClick={() => setShowEditDialog(true)} />
    </>
  );

  const handleSaveRelatie = (data: Partial<Relatie>) => {
    setRelaties((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
    setShowEditDialog(false);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {breadcrumb}

        <div className="content-stretch flex items-stretch justify-center relative shrink-0 w-full min-h-[calc(100vh-65px)]">
          <div className="flex-[1_0_0] min-h-px min-w-px relative">
            <div className="flex flex-col items-center size-full">
              <div className="content-stretch flex flex-col items-center py-[24px] relative w-full">
                <div className="content-stretch flex flex-col gap-[0px] items-start max-w-[1116px] pt-[24px] relative shrink-0 w-full">
                  <PageHeader
                    title={relatie.naam}
                    titleBadge={titleBadge}
                    subtitle={subtitle}
                    actions={actions}
                    tabs={tabs}
                    onTabClick={(tab: PageTab) => {
                      const tabKey = tab.path.replace("#", "") as typeof activeTab;
                      setActiveTab(tabKey);
                    }}
                  />

                  <div className="w-full pt-[20px]">
                    {activeTab === "overzicht" && (
                      <RelatieOverzichtTab
                        relatie={relatie}
                        contactPersonen={contactPersonen}
                      />
                    )}

                    {activeTab === "ladingen" && (() => {
                      const ladingenColumns: Column[] = [
                        { key: "titel", header: "Lading", type: "leading-text", subtextKey: "product" },
                        { key: "route", header: "Route", type: "text", width: "w-[200px]" },
                        { key: "tonnage", header: "Tonnage", type: "text", width: "w-[120px]" },
                        { key: "laaddatum", header: "Laaddatum", type: "text", width: "w-[140px]" },
                        { key: "matches", header: "Matches", type: "text", width: "w-[120px]" },
                        { key: "statusLabel", header: "Status", type: "status", variantKey: "statusVariant", defaultVariant: "grey", width: "w-[120px]" },
                      ];
                      const ladingenData: RowData[] = relatieLadingen.map((l) => {
                        const s = ladingStatusMap[l.status] || { label: l.status, variant: "grey" };
                        return {
                          id: l.id,
                          titel: l.titel,
                          product: l.product,
                          route: `${l.laadhaven} → ${l.loshaven}`,
                          tonnage: String(l.tonnage),
                          laaddatum: formatDate(l.laaddatum),
                          matches: l.matches > 0 ? `${l.matches} match${l.matches !== 1 ? "es" : ""}` : "—",
                          statusLabel: s.label,
                          statusVariant: s.variant,
                        };
                      });
                      return (
                        <div className="w-full pb-[32px]">
                          <SectionHeader title="Ladingen" />
                          {relatieLadingen.length === 0 ? (
                            <div className="py-[48px] text-center">
                              <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
                                Nog geen ladingen gekoppeld aan deze relatie.
                              </p>
                            </div>
                          ) : (
                            <Table
                              columns={ladingenColumns}
                              data={ladingenData}
                              onRowClick={(row) => navigate(`/crm/relatie/${id}/lading/${row.id}`)}
                            />
                          )}
                        </div>
                      );
                    })()}

                    {activeTab === "vaartuigen" && (() => {
                      const vaartuigenColumns: Column[] = [
                        { key: "naam", header: "Vaartuig", type: "leading-text" },
                        { key: "type", header: "Type", type: "text", width: "w-[160px]" },
                        { key: "capaciteit", header: "Capaciteit", type: "text", width: "w-[120px]" },
                        { key: "locatie", header: "Locatie", type: "text", width: "w-[160px]" },
                        { key: "matches", header: "Matches", type: "text", width: "w-[120px]" },
                        { key: "statusLabel", header: "Status", type: "status", variantKey: "statusVariant", defaultVariant: "grey", width: "w-[120px]" },
                      ];
                      const vaartuigenData: RowData[] = relatieVaartuigen.map((v) => {
                        const s = vaartuigStatusMap[v.status] || { label: v.status, variant: "grey" };
                        return {
                          id: v.id,
                          naam: v.naam,
                          type: v.type,
                          capaciteit: v.capaciteit,
                          locatie: v.locatie,
                          matches: v.matches > 0 ? `${v.matches} match${v.matches !== 1 ? "es" : ""}` : "—",
                          statusLabel: s.label,
                          statusVariant: s.variant,
                        };
                      });
                      return (
                        <div className="w-full pb-[32px]">
                          <SectionHeader title="Vaartuigen" />
                          {relatieVaartuigen.length === 0 ? (
                            <div className="py-[48px] text-center">
                              <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
                                Nog geen vaartuigen gekoppeld aan deze relatie.
                              </p>
                            </div>
                          ) : (
                            <Table
                              columns={vaartuigenColumns}
                              data={vaartuigenData}
                              onRowClick={(row) => navigate(`/crm/relatie/${id}/vaartuig/${row.id}`)}
                            />
                          )}
                        </div>
                      );
                    })()}

                    {activeTab === "deals" && (() => {
                      const filterLabels: Record<string, string> = { alle: "Alles", spot: "Spot", contract: "Contract" };
                      const filteredDeals = dealFilter === "alle"
                        ? relatieAllDeals
                        : relatieAllDeals.filter((c) => c.type === dealFilter);
                      const dealsColumns: Column[] = [
                        { key: "titel", header: "Titel", type: "leading-text", subtextKey: "subtitel" },
                        ...(dealFilter === "alle" ? [{ key: "typeLabel", header: "Type", type: "status" as const, variantKey: "typeVariant", defaultVariant: "grey" as const, width: "w-[120px]" }] : []),
                        { key: "routePeriode", header: "Route / Periode", type: "text", width: "w-[220px]" },
                        { key: "statusLabel", header: "Status", type: "status", variantKey: "statusVariant", defaultVariant: "grey", width: "w-[140px]" },
                        { key: "waarde", header: "Waarde", type: "text", width: "w-[120px]" },
                      ];
                      const dealsData: RowData[] = filteredDeals.map((c) => ({
                        id: c.id,
                        titel: c.titel,
                        subtitel: c.type === "contract" && c.routes && c.routes.length > 0
                          ? `${c.routes.length} route${c.routes.length > 1 ? "s" : ""}`
                          : undefined,
                        typeLabel: c.type === "spot" ? "Spot" : "Contract",
                        typeVariant: c.type === "spot" ? "grey" : "brand",
                        routePeriode: c.type === "spot"
                          ? ([c.laadhavenNaam, c.loshavenNaam].filter(Boolean).join(" → ") || "—")
                          : (c.startDatum && c.eindDatum ? `${formatDate(c.startDatum)} – ${formatDate(c.eindDatum)}` : "—"),
                        statusLabel: CONTRACT_STATUS_LABELS[c.status] || "—",
                        statusVariant: (CONTRACT_STATUS_VARIANT_MAP[c.status] || "grey"),
                        waarde: c.waarde ? new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(c.waarde) : "—",
                      }));
                      return (
                        <div className="w-full pb-[32px]">
                          <SectionHeader
                            title="Deals"
                            filterLabel={filterLabels[dealFilter]}
                            filterOptions={["Alles", "Spot", "Contract"]}
                            filterValue={filterLabels[dealFilter]}
                            onFilterChange={(v) => {
                              const key = v === "Alles" ? "alle" : v.toLowerCase();
                              setDealFilter(key as "alle" | "spot" | "contract");
                            }}
                          />
                          {filteredDeals.length === 0 ? (
                            <div className="py-[48px] text-center">
                              <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
                                Geen deals gevonden.
                              </p>
                            </div>
                          ) : (
                            <Table
                              columns={dealsColumns}
                              data={dealsData}
                              onRowClick={(row) => navigate(`/crm/deal/${row.id}`)}
                            />
                          )}
                        </div>
                      );
                    })()}

                    {activeTab === "mail" && (
                      <MailConversaties conversaties={relatieMail} deals={relatieDeals} onLinkDeal={handleLinkDeal} />
                    )}

                    {activeTab === "gesprekken" && (
                      <Gespreksverslagen verslagen={verslagen} contactPersonen={contactPersonen} onAdd={handleAddVerslag} />
                    )}

                    {activeTab === "activiteit" && (
                      <div className="w-full px-[24px]">
                        <ActivityFeed />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <RelatieDetailSidebar relatie={relatie} contactPersonen={contactPersonen} />
        </div>
      </div>

      {showEditDialog && (
        <RelatieFormDialog
          relatie={relatie}
          onSave={handleSaveRelatie}
          onClose={() => setShowEditDialog(false)}
        />
      )}
    </div>
  );
}
