import { useState, useMemo } from "react";
import { Send, MailOpen, Check, X } from "lucide-react";
import ModelessPanel from "./ModelessPanel";
import type { PageTab } from "./PageHeader";
import Badge from "./Badge";
import Table from "./Table";
import type { Column, RowData } from "./Table";
import useTableSort from "./useTableSort";
import Pagination from "./Pagination";
import Button from "./Button";
import ActivityFeed from "./ActivityFeed";
import NegotiationDialog from "./NegotiationDialog";
import ConversationDialog from "./ConversationDialog";
import { DetailsSidebarSection } from "./DetailsSidebar";
import DetailRow from "./DetailRow";
import { useNavigate } from "react-router";
import { useBevrachtingLadingSummary, useLadingEigenDetail, useLadingMarktDetail } from "../data/useDetailData";
import { updateLadingMarktPriority } from "../data/useMarktData";
import { mockMatches, mockNegotiations } from "../data/mock-data";
import { mockRelaties } from "../data/mock-relatie-data";
import svgPaths from "../../imports/svg-62fj7rjvas";
import imgAvatar from "../../assets/a2737d3b5b234fc04041650cb9f114889c6859da.png";
import imgAvatar1 from "../../assets/3627de284acb374a4d9313b3c2dbaeeb87a48224.png";
import imgAvatar2 from "../../assets/e7809035038b3816de2a1d67c5de86ebeed325d0.png";
import imgAvatar3 from "../../assets/bf485cb6f98c12534c69bc81459ce34f2e24e4a8.png";
import imgAvatar4 from "../../assets/9e45f45f537bea4bf653bc0307471e5ff5545f63.png";

const negotiationStatusVariantMap: Record<string, string> = {
  "Via werklijst": "brand",
  "Bod verstuurd": "brand",
  "Bod ontvangen": "brand",
  "Goedgekeurd": "success",
  "Afgewezen": "error",
  "Afgekeurd": "error",
};

const negotiationStatusIconMap: Record<string, React.ReactNode | null> = {
  "Via werklijst": null,
  "Bod verstuurd": <Send strokeWidth={2.5} />,
  "Bod ontvangen": <MailOpen strokeWidth={2.5} />,
  "Goedgekeurd": <Check strokeWidth={2.5} />,
  "Afgewezen": <X strokeWidth={2.5} />,
  "Afgekeurd": <X strokeWidth={2.5} />,
};

const negotiationStatusTypeMap: Record<string, "default" | "color"> = {
  "Via werklijst": "default",
  "Bod verstuurd": "color",
  "Bod ontvangen": "color",
  "Goedgekeurd": "color",
  "Afgewezen": "color",
  "Afgekeurd": "color",
};

interface LadingDetailPanelProps {
  id: string;
  onClose: () => void;
}

export default function LadingDetailPanel({ id, onClose }: LadingDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'matches' | 'onderhandelingen' | 'activiteit'>('matches');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedNegotiationId, setSelectedNegotiationId] = useState<string | null>(null);
  const [conversationDialog, setConversationDialog] = useState<{ relatieId: string; relatieName: string; matchName?: string } | null>(null);

  const [matchPage, setMatchPage] = useState(1);
  const [matchRowsPerPage, setMatchRowsPerPage] = useState(50);
  const [negPage, setNegPage] = useState(1);
  const [negRowsPerPage, setNegRowsPerPage] = useState(50);

  const { data: summary, loading: summaryLoading } = useBevrachtingLadingSummary(id);
  const avatars = [imgAvatar, imgAvatar1, imgAvatar2, imgAvatar3, imgAvatar4];

  const titleBadge = summary ? (
    <Badge label={summary.status} variant={summary.statusVariant} size="lg" dot />
  ) : null;

  const tabs: PageTab[] = [
    { label: 'Matches', path: '#matches', isActive: activeTab === 'matches', badge: String(mockMatches.length) },
    { label: 'Onderhandelingen', path: '#onderhandelingen', isActive: activeTab === 'onderhandelingen', badge: String(mockNegotiations.length) },
    { label: 'Activiteit', path: '#activiteit', isActive: activeTab === 'activiteit' },
  ];

  const matchColumns: Column[] = [
    { key: 'name', header: 'Vaartuig', type: 'leading-text', subtextKey: 'type', badgeKey: 'eigenBadge', actionLabel: 'Onderhandeling' },
    { key: 'company', header: 'Relatie', type: 'text', subtextKey: 'contactPersoon', textColor: 'text-rdj-text-brand', width: 'w-[160px]', onClickKey: 'onRelatieClick' },
    { key: 'location', header: 'Locatie', type: 'text', subtextKey: 'locationDate', width: 'w-[160px]' },
    { key: 'distance', header: 'Groottonnage', type: 'text', align: 'right', width: 'w-[100px]' },
    { key: 'matchPercentage', header: 'Match', type: 'progress', align: 'right', width: 'w-[100px]' },
  ];

  const sourceIcon = (
    <svg fill="none" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
    </svg>
  );

  const navigate = useNavigate();
  const matchTableData: RowData[] = mockMatches.map((match) => ({
    id: match.id,
    name: match.name,
    type: match.type,
    eigenBadge: match.isEigen ? undefined : 'Markt',
    company: match.company,
    contactPersoon: match.contactPersoon || match.companyLocation,
    onRelatieClick: () => { const rel = mockRelaties.find(r => r.naam === match.company); if (rel) navigate(`/crm/relatie/${rel.id}`); },
    location: match.location,
    locationDate: match.locationDate || '',
    distance: match.distance,
    inhoud: match.inhoud || '',
    source: match.source || match.cargoType,
    sourceDate: match.sourceDate || match.cargoDate,
    sourceIcon: sourceIcon,
    sourceIconVariant: 'grey',
    matchPercentage: match.matchPercentage,
  }));

  const negColumns: Column[] = [
    { key: 'company', header: 'Relatie', type: 'leading-text', actionLabel: 'Openen' },
    { key: 'freightPrice', header: 'Vrachtprijs', type: 'text', subtextKey: 'freightPriceDiff', align: 'right', width: 'w-[140px]' },
    { key: 'tonnage', header: 'Tonnage', type: 'text', align: 'right', width: 'w-[100px]' },
    { key: 'deadline', header: 'Deadline', type: 'deadline', expiredKey: 'deadlineExpired', editable: true, width: 'w-[140px]' },
    { key: 'status', header: 'Status', type: 'status', variantKey: 'statusVariant', iconKey: 'statusIcon', typeKey: 'statusType', width: 'w-[140px]' },
  ];

  const negTableData: RowData[] = mockNegotiations.map((neg, idx) => ({
    id: neg.id,
    company: neg.company,
    freightPrice: neg.freightPrice || '—',
    freightPriceDiff: neg.freightPriceDiff || '',
    tonnage: neg.tonnage,
    deadline: neg.deadline,
    deadlineExpired: neg.deadlineExpired,
    status: neg.status,
    statusVariant: negotiationStatusVariantMap[neg.status] || 'grey',
    statusIcon: negotiationStatusIconMap[neg.status] || null,
    statusType: negotiationStatusTypeMap[neg.status] || 'default',
    contactName: neg.contact.name,
    contactDate: neg.contact.date,
    contactAvatar: avatars[idx % avatars.length],
  }));

  const { sortedColumns: sortedMatchColumns, sortedData: sortedMatchData } = useTableSort(matchColumns, matchTableData);
  const { sortedColumns: sortedNegColumns, sortedData: sortedNegData } = useTableSort(negColumns, negTableData);

  const actions = (
    <>
      <Button
        variant="secondary"
        label="Uit markt halen"
        leadingIcon={
          <svg fill="none" viewBox="-0.5 -0.5 12.5 12.5">
            <path d={svgPaths.p3f40eb80} stroke="#B42318" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        }
        className="[&_p]:!text-[#b42318] [&_svg_path]:!stroke-[#b42318] [&_div>div]:!size-[12px] [&_div]:!gap-[2px]"
      />
      <Button variant="primary" label="Bewerken" />
    </>
  );

  return (
    <>
      <ModelessPanel
        title={summaryLoading ? "Laden..." : (summary?.title || "—")}
        subtitle={
          summaryLoading ? undefined : (
            <span className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
              {summary?.subtitle || ""}
            </span>
          )
        }
        onClose={onClose}
        sidebar={<LadingEigenSidebarContent id={id} />}
      >
        <div className="flex flex-col py-[16px]">
          {/* Status badge */}
          {titleBadge && (
            <div className="mb-[16px] px-[24px]">
              {titleBadge}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-[4px] border-b border-rdj-border-secondary mb-[16px] px-[24px]">
            {tabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => {
                  const tabKey = tab.path.replace('#', '') as 'matches' | 'onderhandelingen' | 'activiteit';
                  setActiveTab(tabKey);
                }}
                className={`flex items-center gap-[8px] px-[12px] py-[10px] text-[14px] font-sans font-bold leading-[20px] relative ${
                  tab.isActive
                    ? 'text-rdj-text-brand'
                    : 'text-rdj-text-tertiary hover:text-rdj-text-secondary'
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className={`text-[12px] font-bold px-[6px] py-[1px] rounded-full ${
                    tab.isActive ? 'bg-rdj-bg-brand text-rdj-text-brand' : 'bg-rdj-bg-secondary text-rdj-text-tertiary'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.isActive && (
                  <div className="absolute bottom-0 left-[12px] right-[12px] h-[2px] bg-rdj-text-brand rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'matches' && (
            <>
              <Pagination
                currentPage={matchPage}
                totalItems={mockMatches.length}
                rowsPerPage={matchRowsPerPage}
                onPageChange={setMatchPage}
                onRowsPerPageChange={setMatchRowsPerPage}
              />
              <Table
                columns={sortedMatchColumns}
                data={sortedMatchData}
                hoveredRowId={hoveredRow}
                onRowHover={setHoveredRow}
                onRowAction={(row) => {
                  const relatie = mockRelaties.find(r => r.naam === row.company);
                  setConversationDialog({
                    relatieId: relatie?.id || "rel-001",
                    relatieName: (row.company as string) || "Onbekend",
                    matchName: row.name as string,
                  });
                }}
              />
            </>
          )}

          {activeTab === 'onderhandelingen' && (
            <>
              <Pagination
                currentPage={negPage}
                totalItems={mockNegotiations.length}
                rowsPerPage={negRowsPerPage}
                onPageChange={setNegPage}
                onRowsPerPageChange={setNegRowsPerPage}
              />
              <Table
                columns={sortedNegColumns}
                data={sortedNegData}
                hoveredRowId={hoveredRow}
                onRowHover={setHoveredRow}
                onRowClick={(row) => setSelectedNegotiationId(row.id)}
              />
            </>
          )}

          {activeTab === 'activiteit' && (
            <div className="w-full px-[24px]">
              <ActivityFeed />
            </div>
          )}
        </div>
      </ModelessPanel>

      {/* Negotiation dialog on top */}
      {selectedNegotiationId && (
        <NegotiationDialog
          negotiationId={selectedNegotiationId}
          onClose={() => setSelectedNegotiationId(null)}
        />
      )}

      {/* Conversation dialog */}
      {conversationDialog && (
        <ConversationDialog
          relatieId={conversationDialog.relatieId}
          relatieName={conversationDialog.relatieName}
          preSelectedMatchName={conversationDialog.matchName}
          preSelectedOriginId={conversationDialog.matchName ? id : undefined}
          preSelectedItemId={conversationDialog.matchName ? undefined : id}
          preSelectedItemType={conversationDialog.matchName ? undefined : "lading"}
          onClose={() => setConversationDialog(null)}
        />
      )}
    </>
  );
}

/* ── Inline sidebar content ── */

function LadingEigenSidebarContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const eigenResult = useLadingEigenDetail(id);
  const marktResult = useLadingMarktDetail(id);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [localPriority, setLocalPriority] = useState<number | null>(null);
  const [overig, setOverig] = useState("");

  const loading = eigenResult.loading || marktResult.loading;
  const data = eigenResult.data;
  const marktData = marktResult.data;
  const isMarkt = !data && !!marktData;
  const priority = localPriority ?? marktData?.prioriteit ?? 0;

  const handleRate = (value: number) => {
    setLocalPriority(value);
    updateLadingMarktPriority(id, value).catch(console.error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-[40px] w-full">
        <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[14px]">Laden...</p>
      </div>
    );
  }

  if (!data && !marktData) {
    return (
      <div className="flex items-center justify-center py-[40px] w-full">
        <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[14px]">{eigenResult.error || "Geen data gevonden"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[16px] p-[24px] pt-[16px]">
      {/* Tab bar */}
      <div className="flex gap-[4px] border-b border-rdj-border-secondary">
        {[
          { id: "details", label: "Details" },
          { id: "condities", label: "Condities" },
        ].map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-[12px] py-[8px] text-[14px] font-sans font-bold leading-[20px] rounded-[4px] ${
                isActive ? 'bg-rdj-bg-brand text-rdj-text-primary' : 'text-rdj-text-tertiary'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "details" && !isMarkt && data && (
        <>
          <DetailsSidebarSection>
            <DetailRow label="Partij" type="linked" value={data.partij} />
            <DetailRow label="Subpartij" type="linked" value={data.subpartij} />
            <DetailRow label="Tonnage" value={data.tonnage} editable />
            <DetailRow label="Ex." value={data.ex} subtext={data.exType} />
            <DetailRow label="Lading" value={data.lading} editable />
            <DetailRow label="Subsoort" value={data.subsoort} editable />
            <DetailRow label="Soortelijk gewicht" value={data.soortelijkGewicht} editable />
            <DetailRow label="Inhoud" value={data.inhoud} editable />
            <DetailRow label="Bijzonderheden" type="badges" badges={data.bijzonderheden} editable />
            <DetailRow label="Laadlocatie" value={data.laadlocatie} editable />
            <DetailRow label="Laaddatum" value={data.laaddatum} editable />
            <DetailRow label="Loslocatie" value={data.loslocatie} editable />
            <DetailRow label="Losdatum" value={data.losdatum} editable />
            <DetailRow label="Relatie" type="linked" value={data.relatie} onClick={() => navigate(`/crm/relatie/${data.raw.relatieId}`)} />
            <DetailRow label="Contactpersoon" value={data.contactpersoon} />
          </DetailsSidebarSection>
          <div className="w-full h-px bg-rdj-border-secondary shrink-0" />
          <DetailsSidebarSection>
            <DetailRow label="Eigenaar" type="user" value={data.eigenaar} avatarSrc={data.eigenaarFoto} avatarInitials={data.eigenaarInitials} />
            <DetailRow label="Deadline" value={data.deadline} editable />
          </DetailsSidebarSection>
        </>
      )}

      {activeTab === "details" && isMarkt && marktData && (
        <>
          <DetailsSidebarSection>
            <DetailRow label="Prioriteit" type="rating" rating={priority} onRate={handleRate} />
            <DetailRow label="Tonnage" value={marktData.tonnage} editable />
            <DetailRow label="Lading" value={marktData.lading} editable />
            <DetailRow label="Subsoort" value={marktData.subsoort} editable />
            <DetailRow label="Soortelijk gewicht" value={marktData.soortelijkGewicht} editable />
            <DetailRow label="Inhoud" value={marktData.inhoud} editable />
            <DetailRow label="Bijzonderheden" type="badges" badges={marktData.bijzonderheden} editable />
            <DetailRow label="Laadlocatie" value={marktData.laadlocatie} editable />
            <DetailRow label="Laaddatum" value={marktData.laaddatum} editable />
            <DetailRow label="Loslocatie" value={marktData.loslocatie} editable />
            <DetailRow label="Losdatum" value={marktData.losdatum} editable />
            <DetailRow label="Bron" value={marktData.bron} />
            <DetailRow label="Relatie" type="linked" value={marktData.relatie} onClick={() => navigate(`/crm/relatie/${marktData.raw.relatieId}`)} />
            <DetailRow label="Contactpersoon" value={marktData.contactpersoon} />
          </DetailsSidebarSection>
          <div className="w-full h-px bg-rdj-border-secondary shrink-0" />
          <DetailsSidebarSection>
            <DetailRow label="Eigenaar" type="user" value={marktData.eigenaar} avatarSrc={marktData.eigenaarFoto} avatarInitials={marktData.eigenaarInitials} />
          </DetailsSidebarSection>
        </>
      )}

      {activeTab === "condities" && !isMarkt && data && (
        <>
          <DetailsSidebarSection title="Prijs">
            <DetailRow label="Verkoop" value={data.eigenPrijs} editable />
            <DetailRow label="Zoekcriteria" value={data.marktPrijs} />
          </DetailsSidebarSection>
          <DetailsSidebarSection title="Laadtijd">
            <DetailRow label="Verkoop" value={data.eigenLaadtijd} editable />
            <DetailRow label="Zoekcriteria" value={data.marktLaadtijd} />
          </DetailsSidebarSection>
          <DetailsSidebarSection title="Liggeld laden">
            <DetailRow label="Verkoop" value={data.eigenLiggeldLaden} editable />
            <DetailRow label="Zoekcriteria" value={data.marktLiggeldLaden} />
          </DetailsSidebarSection>
          <DetailsSidebarSection title="Lostijd">
            <DetailRow label="Verkoop" value={data.eigenLostijd} editable />
            <DetailRow label="Zoekcriteria" value={data.marktLostijd} />
          </DetailsSidebarSection>
          <DetailsSidebarSection title="Liggeld lossen">
            <DetailRow label="Verkoop" value={data.eigenLiggeldLossen} editable />
            <DetailRow label="Zoekcriteria" value={data.marktLiggeldLossen} />
          </DetailsSidebarSection>
          <DetailsSidebarSection title="Overig">
            <textarea
              value={overig}
              onChange={(e) => setOverig(e.target.value)}
              placeholder="Voeg opmerkingen toe..."
              rows={3}
              className="w-full px-[12px] py-[8px] font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px] bg-transparent border border-transparent rounded-[6px] outline-none resize-none transition-all hover:border-rdj-border-primary hover:bg-rdj-bg-secondary-hover focus:border-rdj-border-brand focus:bg-white placeholder:text-rdj-text-tertiary"
            />
          </DetailsSidebarSection>
        </>
      )}

      {activeTab === "condities" && isMarkt && marktData && (
        <>
          <DetailsSidebarSection title="Prijs">
            <DetailRow label="Inkoop" value={marktData.prijs} editable />
            <DetailRow label="Zoekcriteria" value={marktData.prijs} />
          </DetailsSidebarSection>
          <DetailsSidebarSection title="Laadtijd">
            <DetailRow label="Inkoop" value={marktData.laadtijd} editable />
            <DetailRow label="Zoekcriteria" value={marktData.laadtijd} />
          </DetailsSidebarSection>
          <DetailsSidebarSection title="Liggeld laden">
            <DetailRow label="Inkoop" value={marktData.liggeldLaden} editable />
            <DetailRow label="Zoekcriteria" value={marktData.liggeldLaden} />
          </DetailsSidebarSection>
          <DetailsSidebarSection title="Lostijd">
            <DetailRow label="Inkoop" value={marktData.lostijd} editable />
            <DetailRow label="Zoekcriteria" value={marktData.lostijd} />
          </DetailsSidebarSection>
          <DetailsSidebarSection title="Liggeld lossen">
            <DetailRow label="Inkoop" value={marktData.liggeldLossen} editable />
            <DetailRow label="Zoekcriteria" value={marktData.liggeldLossen} />
          </DetailsSidebarSection>
          <DetailsSidebarSection title="Overig">
            <textarea
              value={overig}
              onChange={(e) => setOverig(e.target.value)}
              placeholder="Voeg opmerkingen toe..."
              rows={3}
              className="w-full px-[12px] py-[8px] font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px] bg-transparent border border-transparent rounded-[6px] outline-none resize-none transition-all hover:border-rdj-border-primary hover:bg-rdj-bg-secondary-hover focus:border-rdj-border-brand focus:bg-white placeholder:text-rdj-text-tertiary"
            />
          </DetailsSidebarSection>
        </>
      )}
    </div>
  );
}
