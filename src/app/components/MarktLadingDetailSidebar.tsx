import { useState } from "react";
import DetailsSidebar, { DetailsSidebarSection } from "./DetailsSidebar";
import DetailRow from "./DetailRow";

interface MarktCargoData {
  vesselName: string;
  vesselCompany: string;
  status: string;
  cargo: string;
  from: string;
  fromDate: string;
  to: string;
  toDate: string;
  contact: string;
}

interface MarktLadingDetailSidebarProps {
  cargoData: MarktCargoData;
}

export default function MarktLadingDetailSidebar({
  cargoData,
}: MarktLadingDetailSidebarProps) {
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
      {/* Header with vessel info — rendered above tabs content */}
      <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-full -mt-[8px] mb-[4px]">
        <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[32px] text-rdj-text-primary text-[24px] w-full">
          {cargoData.vesselName} - {cargoData.vesselCompany}
        </p>
        <div className="bg-white content-stretch flex gap-[6px] items-center px-[8px] py-[2px] relative rounded-[4px] shrink-0">
          <div
            aria-hidden="true"
            className="absolute border border-rdj-border-primary border-solid inset-0 pointer-events-none rounded-[4px]"
          />
          <div className="relative shrink-0 size-[8px]">
            <svg
              className="absolute block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 6 6"
            >
              <circle cx="3" cy="3" fill="#2E90FA" r="3" />
            </svg>
          </div>
          <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-rdj-text-primary text-[14px] text-center whitespace-nowrap">
            {cargoData.status}
          </p>
        </div>
      </div>

      {/* Cargo summary */}
      <div className="content-stretch flex flex-col gap-[16px] items-start min-w-[320px] relative shrink-0 w-full -mt-[8px] mb-[4px]">
        <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[24px] relative text-rdj-text-secondary text-[16px] w-full">
          <span className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold">
            {cargoData.cargo}
          </span>
          {" vanuit "}
          <span className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold">
            {cargoData.from} ({cargoData.fromDate})
          </span>
          {" naar "}
          <span className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold">
            {cargoData.to} ({cargoData.toDate})
          </span>
        </p>
      </div>

      {activeTab === "details" && (
        <DetailsSidebarSection>
          <DetailRow label="Tonnage" value="Voeg toe" />
          <DetailRow label="Lading" value="Voeg toe" />
          <DetailRow label="Subsoort" value="Voeg toe" />
          <DetailRow label="Soortelijk gewicht" value="Voeg toe" />
          <DetailRow label="Inhoud" value="Voeg toe" />
          <DetailRow label="Bijzonderheden" value="Dataselect" />
          <DetailRow label="Laadhaven" value="Dataselect" />
          <DetailRow label="Laaddatum" value="Dataselect" />
          <DetailRow label="Loshaven" value="Dataselect" />
          <DetailRow label="Losdatum" value="Dataselect" />
          <DetailRow
            label="Bron"
            type="linked"
            value="FW: 2150 to 2300 to Raps..."
            subtext="Do 12 Feb 15:09"
          />
          <DetailRow
            label="Relatie"
            type="linked"
            value="Pelger de Jong"
          />
          <DetailRow label="Contactpersoon" value={cargoData.contact} />
          <DetailRow label="Prioriteit" value="Voeg toe" />
        </DetailsSidebarSection>
      )}

      {activeTab === "condities" && (
        <DetailsSidebarSection>
          <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] text-rdj-text-secondary text-[14px] w-full">
            Hier komen de condities zodra je deze hebt ingevuld.
          </p>
        </DetailsSidebarSection>
      )}
    </DetailsSidebar>
  );
}
