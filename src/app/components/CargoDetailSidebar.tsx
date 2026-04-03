import { useState } from "react";
import DetailsSidebar, { DetailsSidebarSection } from "./DetailsSidebar";
import DetailRow from "./DetailRow";

interface CargoDetailSidebarProps {
  cargoData: {
    partij: string;
    subpartij: string;
    tonnage: string;
    ex: string;
    exType: string;
    lading: string;
    subsoort: string;
    soortelijkGewicht: string;
    inhoud: string;
    bijzonderheden: string[];
    laadlocatie: string;
    laadlocatieCity: string;
    laaddatum: string;
    loslocatie: string;
    loslocatieCity: string;
    losdatum: string;
    relatie: string;
    contactpersoon: string;
    evenaar: string;
  };
}

export default function CargoDetailSidebar({
  cargoData,
}: CargoDetailSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("details");

  return (
    <DetailsSidebar
      tabs={[
        { id: "details", label: "Details" },
        { id: "condities", label: "Condities" },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "details" && (
        <DetailsSidebarSection
          description={
            cargoData.partij === "CRG164"
              ? "Partij krijgt voorrang ten op zichte van de andere partijen in april."
              : undefined
          }
        >
          <DetailRow
            label="Partij"
            type="linked"
            value={cargoData.partij}
          />
          <DetailRow
            label="Subpartij"
            type="linked"
            value={cargoData.subpartij}
          />
          <DetailRow label="Tonnage" value={cargoData.tonnage} editable />
          <DetailRow
            label="Ex."
            value={cargoData.ex}
            subtext={cargoData.exType}
          />
          <DetailRow label="Lading" value={cargoData.lading} editable />
          <DetailRow label="Subsoort" value={cargoData.subsoort} editable />
          <DetailRow
            label="Soortelijk gewicht"
            value={cargoData.soortelijkGewicht}
            editable
          />
          <DetailRow label="Inhoud" value={cargoData.inhoud} editable />
          <DetailRow
            label="Bijzonderheden"
            type="badges"
            badges={cargoData.bijzonderheden}
            editable
          />
          <DetailRow
            label="Laadlocatie"
            value={cargoData.laadlocatie}
            subtext={cargoData.laadlocatieCity}
            editable
          />
          <DetailRow label="Laaddatum" value={cargoData.laaddatum} editable />
          <DetailRow
            label="Loslocatie"
            value={cargoData.loslocatie}
            subtext={cargoData.loslocatieCity}
            editable
          />
          <DetailRow label="Losdatum" value={cargoData.losdatum} editable />
          <DetailRow label="Relatie" value={cargoData.relatie} />
          <DetailRow label="Contactpersoon" value={cargoData.contactpersoon} />
          <DetailRow
            label="Eigenaar"
            type="user"
            value={cargoData.evenaar}
          />
        </DetailsSidebarSection>
      )}

      {activeTab === "condities" && (
        <DetailsSidebarSection>
          <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px] text-center w-full">
            Condities worden hier getoond
          </p>
        </DetailsSidebarSection>
      )}
    </DetailsSidebar>
  );
}