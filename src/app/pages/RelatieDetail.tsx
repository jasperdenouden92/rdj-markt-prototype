import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import type { PageTab } from "../components/PageHeader";
import Badge from "../components/Badge";
import Button from "../components/Button";
import ActivityFeed from "../components/ActivityFeed";
import RelatieDetailSidebar from "../components/RelatieDetailSidebar";
import RelatieOverzichtTab from "../components/RelatieOverzichtTab";
import RelatieFormDialog from "../components/RelatieFormDialog";
import { mockRelaties, mockContactPersonen } from "../data/mock-relatie-data";
import type { Relatie } from "../data/api";

const statusVariantMap: Record<string, "success" | "grey" | "brand"> = {
  actief: "success",
  inactief: "grey",
  prospect: "brand",
};

const chevronSvg = (
  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.33333 9.33333">
    <path d="M0.666664 8.66667L4.66666 4.66667L0.666664 0.666668" stroke="var(--stroke-0, #D0D5DD)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
  </svg>
);

export default function RelatieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overzicht" | "ladingen" | "vaartuigen" | "onderhandelingen" | "activiteit">("overzicht");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [relaties, setRelaties] = useState<Relatie[]>(mockRelaties);

  const relatie = useMemo(() => relaties.find((r) => r.id === id), [relaties, id]);
  const contactPersonen = useMemo(
    () => mockContactPersonen.filter((cp) => cp.relatieId === id),
    [id]
  );

  if (!relatie) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="font-sans font-bold text-[20px] text-rdj-text-primary">Relatie niet gevonden</p>
            <Link to="/crm/relaties" className="font-sans text-[14px] text-rdj-text-brand hover:underline mt-2 block">
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
            <Link to="/crm/relaties" className="content-stretch flex items-center justify-center p-[4px] relative rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] whitespace-nowrap">CRM</p>
            </Link>
            <div className="overflow-clip relative shrink-0 size-[16px]">
              <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4">
                <div className="absolute inset-[-8.33%_-16.67%]">{chevronSvg}</div>
              </div>
            </div>
            <Link to="/crm/relaties" className="content-stretch flex items-center justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0 hover:bg-rdj-bg-primary-hover">
              <p className="font-sans font-bold leading-[20px] relative shrink-0 text-[#475467] text-[14px] whitespace-nowrap">Relaties</p>
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
    { label: "Ladingen", path: "#ladingen", isActive: activeTab === "ladingen", badge: "0" },
    { label: "Vaartuigen", path: "#vaartuigen", isActive: activeTab === "vaartuigen", badge: "0" },
    { label: "Onderhandelingen", path: "#onderhandelingen", isActive: activeTab === "onderhandelingen", badge: "0" },
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
                        onTabChange={setActiveTab}
                      />
                    )}

                    {activeTab === "ladingen" && (
                      <div className="w-full px-[24px] py-[48px] text-center">
                        <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
                          Nog geen ladingen gekoppeld aan deze relatie.
                        </p>
                      </div>
                    )}

                    {activeTab === "vaartuigen" && (
                      <div className="w-full px-[24px] py-[48px] text-center">
                        <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
                          Nog geen vaartuigen gekoppeld aan deze relatie.
                        </p>
                      </div>
                    )}

                    {activeTab === "onderhandelingen" && (
                      <div className="w-full px-[24px] py-[48px] text-center">
                        <p className="font-sans font-normal text-[14px] text-rdj-text-tertiary">
                          Nog geen onderhandelingen voor deze relatie.
                        </p>
                      </div>
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
