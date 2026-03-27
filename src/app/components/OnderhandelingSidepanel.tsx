import { useState } from "react";
import { X, Check, ArrowRight, Send, MailOpen, PenLine, ListTodo, Calendar, Pencil, MessageSquare, FileText, Truck, ShoppingBag, UserX } from "lucide-react";
import { toast } from "sonner";
import ApprovalConfirmationDialog, { type ApprovalOptions } from "./ApprovalConfirmationDialog";
import ModelessPanel from "./ModelessPanel";
import { DetailsSidebarSection } from "./DetailsSidebar";
import DetailRow from "./DetailRow";
import FeaturedIcon from "./FeaturedIcon";
import Button from "./Button";
import Badge, { type BadgeVariant, type BadgeType } from "./Badge";
import imgEricNieuwkoop from "../../assets/a2737d3b5b234fc04041650cb9f114889c6859da.png";
import imgKhoaNguyen from "../../assets/3627de284acb374a4d9313b3c2dbaeeb87a48224.png";
import imgPelgerDeJong from "../../assets/e7809035038b3816de2a1d67c5de86ebeed325d0.png";
import imgJanWillemVdKraan from "../../assets/9e45f45f537bea4bf653bc0307471e5ff5545f63.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

/**
 * OnderhandelingSidepanel — modeless panel for a negotiation.
 *
 * Main section: header with deadline/eigenaar, condities content, approve/reject footer.
 * Side section (sidebar): tabs for Activiteit, Vaartuig, Lading.
 */

type ConditiesField = "prijs" | "laadtijd" | "liggeldLaden" | "lostijd" | "liggeldLossen";

const fieldLabels: Record<ConditiesField, string> = {
  prijs: "Prijs",
  laadtijd: "Laadtijd",
  liggeldLaden: "Liggeld laden",
  lostijd: "Lostijd",
  liggeldLossen: "Liggeld lossen",
};

/* ── Mock condities data ── */
const mockCondities: Record<ConditiesField, { inkoop: number | null; verkoop: number | null; zoekcriteria: number | null }> = {
  prijs: { inkoop: 8.50, verkoop: 7.20, zoekcriteria: 8.00 },
  laadtijd: { inkoop: 24, verkoop: 18, zoekcriteria: 20 },
  liggeldLaden: { inkoop: 12.50, verkoop: 10.00, zoekcriteria: 11.00 },
  lostijd: { inkoop: 16, verkoop: 14, zoekcriteria: 16 },
  liggeldLossen: { inkoop: 15.00, verkoop: 12.00, zoekcriteria: 13.50 },
};

/* ── Mock negotiation meta ── */
const mockNegotiationMeta = {
  deadline: "17 jan 2026",
  eigenaar: "Khoa Nguyen",
  eigenaarInitials: "KN",
  eigenaarFoto: imgKhoaNguyen,
};

/* ── Mock vaartuig data ── */
const mockVaartuig = {
  beschikbaarVanaf: "12 jan 2026, 08:00",
  huidigeLocatie: "Rotterdam",
  eni: "02333517",
  vlag: "NL",
  meetbrief: "S2-3284",
  groottonnage: "2.850 t",
  inhoud: "2.200 m³",
  lengte: "110,00 m",
  breedte: "11,45 m",
  diepgang: "3,20 m",
  kruiphoogte: "7,50 m",
  bijzonderheden: ["Dubbelwandig", "Verwarmd"],
  relatie: "Rederij Alfa",
  relatieId: "rel-1",
  contactpersoon: "Jan de Vries",
  eigenaar: "Khoa Nguyen",
  eigenaarInitials: "KN",
  eigenaarFoto: imgKhoaNguyen,
};

/* ── Mock lading data ── */
const mockLading = {
  partij: "Eur-01",
  subpartij: "SP-001",
  tonnage: "1.200 t",
  ex: "Ex Eur-01",
  exType: "Partij",
  lading: "Grind",
  subsoort: "Riviergrind",
  soortelijkGewicht: "1,65 t/m³",
  inhoud: "727 m³",
  bijzonderheden: ["Stofvrij"],
  laadhaven: "Rotterdam Waalhaven",
  laaddatum: "15 jan 2026, 08:00",
  loshaven: "Antwerpen",
  losdatum: "16 jan 2026, 14:00",
  opdrachtgever: "Rederij de Jong",
  opdrachtgeverId: "rel-2",
  opdrachtgeverContact: "Pieter Jansen",
  eigenaar: "Eric Nieuwkoop",
  eigenaarInitials: "EN",
  eigenaarFoto: imgEricNieuwkoop,
  deadline: "17 jan 2026",
};

/* ── Mock activiteit data (onderhandelingsstappen) ── */
interface ActivityChange {
  label: string;
  value: string;
  oldValue?: string;
}

interface ActivityEvent {
  id: string;
  user: string;
  initials: string;
  avatar?: string;
  title: string;
  timestamp: string;
  message?: string;
  changes?: ActivityChange[];
}

const mockActiviteit: ActivityEvent[] = [
  {
    id: "1",
    user: "Khoa Nguyen",
    initials: "KN",
    avatar: imgKhoaNguyen,
    title: "Bod bijgewerkt",
    timestamp: "Vandaag, 14:22",
    message: "Lading aangepast.",
    changes: [
      { label: "Lading", value: "2.000 ton Houtpellets", oldValue: "Houtpellets 3.000 ton" },
    ],
  },
  {
    id: "2",
    user: "Eric Nieuwkoop",
    initials: "EN",
    avatar: imgEricNieuwkoop,
    title: "Bod ontvangen",
    timestamp: "Vandaag, 09:15",
    message: "Lading toegevoegd.",
    changes: [
      { label: "Lading", value: "2.000 ton Houtpellets" },
    ],
  },
  {
    id: "3",
    user: "Khoa Nguyen",
    initials: "KN",
    avatar: imgKhoaNguyen,
    title: "Bod verstuurd",
    timestamp: "Gisteren, 16:32",
    message: "Voor het eerst gesproken.",
    changes: [
      { label: "Vrachtprijs", value: "€3,50 per ton" },
      { label: "Laagwater toeslag", value: "Basis IJsselkop · m Twentekanaal\n2,50m / 10% per dm" },
      { label: "Laden", value: "Sluipner\nJan 4, 2025 10:00" },
      { label: "Lossen", value: "IJmuiden\nMelden bij aankomst" },
    ],
  },
  {
    id: "4",
    user: "Eric Nieuwkoop",
    initials: "EN",
    avatar: imgEricNieuwkoop,
    title: "Via werklijst",
    timestamp: "Ma 20 Jan, 11:04",
    message: "Ik bijgevoegd beschikbare vaartuigen en lading van dinsdag 27 januari. Bij interesse, neem contact op met bevrachting@rederijdejong.nl of bel +31 (0)10-2311510.",
  },
];

/* ── Helpers ── */
function fmtPrice(n: number | null): string {
  if (n == null) return "—";
  return `€${n.toFixed(2).replace(".", ",")} per ton`;
}
function fmtHours(n: number | null): string {
  if (n == null) return "—";
  return `${n} uur`;
}
function fmtCurrency(n: number | null): string {
  if (n == null || n === 0) return "—";
  return `€${n.toFixed(2).replace(".", ",")} per uur`;
}
function fmt(field: ConditiesField, n: number | null): string {
  if (field === "prijs") return fmtPrice(n);
  if (field === "laadtijd" || field === "lostijd") return fmtHours(n);
  return fmtCurrency(n);
}
function calcPctDiff(
  a: number | null | undefined,
  b: number | null | undefined,
): { text: string; color: string } | undefined {
  if (a == null || b == null || b === 0) return undefined;
  const pct = ((a - b) / Math.abs(b)) * 100;
  const rounded = Math.round(pct);
  if (rounded === 0) return undefined;
  const sign = rounded > 0 ? "+" : "";
  return {
    text: `${sign}${rounded}%`,
    color: rounded > 0 ? "#F79009" : "#17B26A",
  };
}

type SideTab = "activiteit" | "vaartuig" | "lading";

type NegotiationStatus = "Via werklijst" | "Bod verstuurd" | "Bod ontvangen" | "Openstaand bod" | "Goedgekeurd" | "Afgewezen" | "In onderhandeling" | "Geaccepteerd" | "Geweigerd";

const activeStatuses: NegotiationStatus[] = ["Via werklijst", "Bod verstuurd", "Bod ontvangen", "Openstaand bod", "In onderhandeling"];

const statusBadgeConfig: Record<NegotiationStatus, { variant: BadgeVariant; type: BadgeType; icon: React.ReactNode | null }> = {
  "Via werklijst": { variant: "brand", type: "default", icon: null },
  "Bod verstuurd": { variant: "brand", type: "color", icon: <Send strokeWidth={2.5} /> },
  "Bod ontvangen": { variant: "brand", type: "color", icon: <MailOpen strokeWidth={2.5} /> },
  "Openstaand bod": { variant: "brand", type: "color", icon: <Send strokeWidth={2.5} /> },
  "Goedgekeurd": { variant: "success", type: "color", icon: <Check strokeWidth={2.5} /> },
  "Afgewezen": { variant: "error", type: "color", icon: <X strokeWidth={2.5} /> },
  "In onderhandeling": { variant: "brand", type: "color", icon: <Send strokeWidth={2.5} /> },
  "Geaccepteerd": { variant: "success", type: "color", icon: <Check strokeWidth={2.5} /> },
  "Geweigerd": { variant: "error", type: "color", icon: <X strokeWidth={2.5} /> },
};

type NegotiationBron = "eigen" | "markt";
type NegotiationSoort = "lading" | "vaartuig";

interface OnderhandelingSidepanelProps {
  negotiationId: string;
  status: NegotiationStatus;
  bron: NegotiationBron;
  soort: NegotiationSoort;
  /** Relatie name shown in the title */
  relatieName?: string;
  /** Subtitle description (e.g. "1.200 t Grind · MS Adriana") */
  subtitle?: string;
  /** Initial sidebar tab (defaults to "activiteit") */
  initialSideTab?: SideTab;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}

type ApprovalAction = "generateCharter" | "sendToLoadPlanning" | "removeFromMarket" | "rejectOtherBids";

const approvalActionConfig: { key: ApprovalAction; label: string; icon: React.ReactNode; toastMsg: (relatieName?: string) => string }[] = [
  { key: "generateCharter", label: "Charter genereren & verzenden", icon: <FileText size={16} strokeWidth={2.5} />, toastMsg: (r) => `Charter gegenereerd en verstuurd naar ${r || "relatie"}` },
  { key: "sendToLoadPlanning", label: "Doorsturen naar laadplanning", icon: <Truck size={16} strokeWidth={2.5} />, toastMsg: () => "Lading doorgestuurd naar laadplanning" },
  { key: "removeFromMarket", label: "Partij uit de markt halen", icon: <ShoppingBag size={16} strokeWidth={2.5} />, toastMsg: () => "Partij uit de markt gehaald" },
  { key: "rejectOtherBids", label: "Andere biedingen afwijzen", icon: <UserX size={16} strokeWidth={2.5} />, toastMsg: () => "Andere biedingen afgewezen" },
];

export default function OnderhandelingSidepanel({ negotiationId, status: initialStatus, bron, soort, relatieName, subtitle: subtitleText, initialSideTab, onClose, onStatusChange }: OnderhandelingSidepanelProps) {
  const [sideTab, setSideTab] = useState<SideTab>(initialSideTab || "activiteit");
  const [overig, setOverig] = useState("");
  const [currentStatus, setCurrentStatus] = useState<NegotiationStatus>(initialStatus);
  const isActive = activeStatuses.includes(currentStatus);
  const [conditiesOverrides, setConditiesOverrides] = useState<Partial<Record<ConditiesField, number | null>>>({});
  const [extraEvents, setExtraEvents] = useState<ActivityEvent[]>([]);
  const allEvents = [...extraEvents, ...mockActiviteit];
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [completedActions, setCompletedActions] = useState<Set<ApprovalAction>>(new Set());

  const handleApprove = (options: ApprovalOptions) => {
    setShowApprovalDialog(false);
    setCurrentStatus("Goedgekeurd");
    onStatusChange?.(negotiationId, "Goedgekeurd");

    const completed = new Set<ApprovalAction>();
    if (options.generateCharter) {
      completed.add("generateCharter");
      toast.success("Charter gegenereerd", { description: `Verstuurd naar ${relatieName || "relatie"}` });
    }
    if (options.sendToLoadPlanning) {
      completed.add("sendToLoadPlanning");
      toast.success("Lading doorgestuurd naar laadplanning");
    }
    if (options.removeFromMarket) {
      completed.add("removeFromMarket");
      toast.success("Partij uit de markt gehaald");
    }
    if (options.rejectOtherBids) {
      completed.add("rejectOtherBids");
      toast.success("Andere biedingen afgewezen", { description: options.sendRejectionEmail ? "Afwijzingsmails verstuurd" : undefined });
    }
    setCompletedActions(completed);

    // Add activity event
    setExtraEvents(prev => [{
      id: `evt-${Date.now()}`,
      user: mockNegotiationMeta.eigenaar,
      initials: mockNegotiationMeta.eigenaarInitials,
      avatar: mockNegotiationMeta.eigenaarFoto,
      title: "Onderhandeling goedgekeurd",
      timestamp: "Zojuist",
    }, ...prev]);
  };

  const handleReject = () => {
    setCurrentStatus("Afgewezen");
    onStatusChange?.(negotiationId, "Afgewezen");
    toast.success("Onderhandeling afgewezen");
    setExtraEvents(prev => [{
      id: `evt-${Date.now()}`,
      user: mockNegotiationMeta.eigenaar,
      initials: mockNegotiationMeta.eigenaarInitials,
      avatar: mockNegotiationMeta.eigenaarFoto,
      title: "Onderhandeling afgewezen",
      timestamp: "Zojuist",
    }, ...prev]);
  };

  const handlePostApprovalAction = (action: typeof approvalActionConfig[number]) => {
    setCompletedActions(prev => new Set(prev).add(action.key));
    toast.success(action.toastMsg(relatieName));
  };

  const handleConditiesSave = (updates: Partial<Record<ConditiesField, number | null>>, opmerking: string) => {
    setConditiesOverrides(prev => ({ ...prev, ...updates }));
    // Build changes list for activity
    const changes: ActivityChange[] = [];
    const focusInkoop = (bron === "eigen" && soort === "lading") || (bron === "markt" && soort === "vaartuig");
    const colLabel = focusInkoop ? "Inkoop" : "Verkoop";
    for (const [field, val] of Object.entries(updates)) {
      if (val != null) {
        changes.push({ label: `${colLabel} ${fieldLabels[field as ConditiesField].toLowerCase()}`, value: fmt(field as ConditiesField, val) });
      }
    }
    const newEvent: ActivityEvent = {
      id: `evt-${Date.now()}`,
      user: mockNegotiationMeta.eigenaar,
      initials: mockNegotiationMeta.eigenaarInitials,
      avatar: mockNegotiationMeta.eigenaarFoto,
      title: "Bod bijgewerkt",
      timestamp: "Zojuist",
      message: opmerking || undefined,
      changes: changes.length > 0 ? changes : undefined,
    };
    setExtraEvents(prev => [newEvent, ...prev]);
  };

  const sideTabs: { id: SideTab; label: string }[] = [
    { id: "activiteit", label: "Activiteit" },
    { id: "vaartuig", label: "Vaartuig" },
    { id: "lading", label: "Lading" },
  ];

  return (<>
    <ModelessPanel
      initialWidth={600}
      resizable
      title={`Onderhandeling met ${relatieName || "Rederij Alfa"}`}
      subtitle={
        <div className="flex flex-col gap-[8px]">
          <span>{subtitleText || "1.200 t Grind · MS Adriana"}</span>
          <div className="flex items-center gap-[12px] flex-wrap">
            <Badge
              label={currentStatus}
              variant={statusBadgeConfig[currentStatus].variant}
              type={statusBadgeConfig[currentStatus].type}
              icon={statusBadgeConfig[currentStatus].icon ?? undefined}
            />
            <div className="flex items-center gap-[6px]">
              <Calendar size={14} className="text-rdj-text-tertiary shrink-0" />
              <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                {mockNegotiationMeta.deadline}
              </p>
            </div>
            <div className="flex items-center gap-[6px]">
              <div className="relative rounded-full shrink-0 size-[20px] bg-rdj-bg-secondary overflow-hidden">
                <img alt="" src={mockNegotiationMeta.eigenaarFoto} className="absolute inset-0 size-full object-cover rounded-full" />
              </div>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                {mockNegotiationMeta.eigenaar}
              </p>
            </div>
          </div>
        </div>
      }
      onClose={onClose}
      footer={
        isActive ? (
          <div className="border-t border-rdj-border-secondary px-[24px] py-[16px] flex gap-[12px]">
            <Button
              variant="secondary-destructive"
              label="Afwijzen"
              leadingIcon={<X strokeWidth={2.5} />}
              fullWidth
              onClick={handleReject}
            />
            <Button
              variant="primary"
              label="Goedkeuren"
              leadingIcon={<Check strokeWidth={2.5} />}
              fullWidth
              onClick={() => setShowApprovalDialog(true)}
            />
          </div>
        ) : currentStatus === "Goedgekeurd" ? (
          <div className="border-t border-rdj-border-secondary px-[24px] py-[16px] flex flex-col gap-[8px]">
            {approvalActionConfig.map(action => {
              const done = completedActions.has(action.key);
              return done ? (
                <div key={action.key} className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[6px] bg-rdj-bg-secondary">
                  <Check size={16} strokeWidth={2.5} className="text-[#17B26A] shrink-0" />
                  <span className="font-sans font-normal text-rdj-text-tertiary text-[14px] leading-[20px]">{action.label}</span>
                </div>
              ) : (
                <Button
                  key={action.key}
                  variant="secondary"
                  label={action.label}
                  leadingIcon={action.icon}
                  fullWidth
                  onClick={() => handlePostApprovalAction(action)}
                />
              );
            })}
          </div>
        ) : undefined
      }
      sidebar={
        <div className="flex flex-col h-full">
          {/* Side tab bar */}
          <div className="flex gap-[4px] h-[40px] items-center px-[16px] pt-[16px] shrink-0">
            {sideTabs.map((tab) => {
              const active = tab.id === sideTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSideTab(tab.id)}
                  className={`h-full relative rounded-[4px] shrink-0 ${
                    active ? "bg-rdj-bg-brand" : ""
                  }`}
                >
                  <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
                    <div className="flex h-full items-center justify-center px-[12px] py-[8px]">
                      <p
                        className={`font-sans font-bold leading-[20px] text-[14px] whitespace-nowrap ${
                          active ? "text-rdj-text-primary" : "text-rdj-text-tertiary"
                        }`}
                      >
                        {tab.label}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Side tab content */}
          <div className="flex flex-col gap-[16px] p-[16px] flex-1 overflow-y-auto">
            {sideTab === "activiteit" && <ActiviteitTab events={allEvents} />}
            {sideTab === "vaartuig" && <VaartuigTab />}
            {sideTab === "lading" && <LadingTab />}
          </div>
        </div>
      }
    >
      {/* Main section: Condities */}
      <div className="flex flex-col gap-[16px] p-[24px]">
        <ConditiesTab bron={bron} soort={soort} overig={overig} onOverigChange={setOverig} overrides={conditiesOverrides} onEditSave={handleConditiesSave} />
      </div>
    </ModelessPanel>
    <ApprovalConfirmationDialog
      open={showApprovalDialog}
      onClose={() => setShowApprovalDialog(false)}
      onConfirm={handleApprove}
      relatieName={relatieName}
    />
  </>
  );
}

/* ── Condities content ── */
/**
 * Three modes based on bron + soort:
 *   Mode A (eigen lading): Verkoop · Zoekcriteria · Inkoop (focus)
 *   Mode B (markt vaartuig): Verkoop · Inkoop (focus)
 *   Mode C (eigen vaartuig / markt lading): Zoekcriteria · Verkoop (focus)
 */
function ConditiesTab({ bron, soort, overig, onOverigChange, overrides, onEditSave }: { bron: NegotiationBron; soort: NegotiationSoort; overig: string; onOverigChange: (v: string) => void; overrides: Partial<Record<ConditiesField, number | null>>; onEditSave: (updates: Partial<Record<ConditiesField, number | null>>, opmerking: string) => void }) {
  const modeA = bron === "eigen" && soort === "lading";
  const modeB = bron === "markt" && soort === "vaartuig";
  // modeC = everything else (eigen vaartuig / markt lading)
  const focusIsInkoop = modeA || modeB;
  const [editOpen, setEditOpen] = useState(false);

  const fields: ConditiesField[] = ["prijs", "laadtijd", "liggeldLaden", "lostijd", "liggeldLossen"];

  // Get value with overrides applied
  const getVal = (field: ConditiesField, key: "inkoop" | "verkoop" | "zoekcriteria"): number | null => {
    if (key === "inkoop" && focusIsInkoop && field in overrides) return overrides[field] ?? mockCondities[field].inkoop;
    if (key === "verkoop" && !focusIsInkoop && field in overrides) return overrides[field] ?? mockCondities[field].verkoop;
    return mockCondities[field][key];
  };

  const gridCols = modeA ? "grid-cols-[1fr_1fr_1fr_1fr]" : "grid-cols-[1fr_1fr_1fr]";

  // Focus column position: always the last column
  const focusLeft = modeA ? "left-[75%]" : "left-[66.67%]";
  const focusWidth = modeA ? "w-[25%]" : "w-[33.33%]";

  return (
    <>
      {/* Condities table with focus column background */}
      <div className="relative">
        {/* Full-height focus column background */}
        <div className={`absolute ${focusLeft} ${focusWidth} top-0 bottom-0 bg-rdj-bg-brand rounded-[8px]`} />

        {/* Column headers */}
        <div className={`relative grid ${gridCols} gap-[8px] px-[4px] py-[4px]`}>
          <div />
          {modeA ? (
            <>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px]">Verkoop</p>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px]">Zoekcriteria</p>
              <div className="flex items-center gap-[4px] px-[8px]">
                <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px]">Inkoop</p>
                <button onClick={() => setEditOpen(true)} className="text-rdj-text-tertiary hover:text-rdj-text-brand transition-colors">
                  <Pencil size={12} strokeWidth={2} />
                </button>
              </div>
            </>
          ) : modeB ? (
            <>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px]">Verkoop</p>
              <div className="flex items-center gap-[4px] px-[8px]">
                <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px]">Inkoop</p>
                <button onClick={() => setEditOpen(true)} className="text-rdj-text-tertiary hover:text-rdj-text-brand transition-colors">
                  <Pencil size={12} strokeWidth={2} />
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px]">Zoekcriteria</p>
              <div className="flex items-center gap-[4px] px-[8px]">
                <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px]">Verkoop</p>
                <button onClick={() => setEditOpen(true)} className="text-rdj-text-tertiary hover:text-rdj-text-brand transition-colors">
                  <Pencil size={12} strokeWidth={2} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="relative w-full h-px bg-rdj-border-secondary" />

        {/* Rows */}
        {fields.map((field) => {
          if (modeA) {
            const verkoopVal = getVal(field, "verkoop");
            const zoekVal = getVal(field, "zoekcriteria");
            const inkoopVal = getVal(field, "inkoop");
            const diffZoek = field === "prijs" ? calcPctDiff(zoekVal, verkoopVal) : undefined;
            const diffInkoop = field === "prijs" ? calcPctDiff(inkoopVal, verkoopVal) : undefined;
            return (
              <div key={field} className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
                <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                  {fieldLabels[field]}
                </p>
                <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">
                  {fmt(field, verkoopVal)}
                </p>
                <div>
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">
                    {fmt(field, zoekVal)}
                  </p>
                  {diffZoek && (
                    <p className="font-sans font-normal leading-[18px] text-[12px]" style={diffZoek.color ? { color: diffZoek.color } : undefined}>
                      {diffZoek.text}
                    </p>
                  )}
                </div>
                <div className="px-[8px]">
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">
                    {fmt(field, inkoopVal)}
                  </p>
                  {diffInkoop && (
                    <p className="font-sans font-normal leading-[18px] text-[12px]" style={diffInkoop.color ? { color: diffInkoop.color } : undefined}>
                      {diffInkoop.text}
                    </p>
                  )}
                </div>
              </div>
            );
          } else if (modeB) {
            const verkoopVal = getVal(field, "verkoop");
            const inkoopVal = getVal(field, "inkoop");
            const diffInkoop = field === "prijs" ? calcPctDiff(inkoopVal, verkoopVal) : undefined;
            return (
              <div key={field} className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
                <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                  {fieldLabels[field]}
                </p>
                <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">
                  {fmt(field, verkoopVal)}
                </p>
                <div className="px-[8px]">
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">
                    {fmt(field, inkoopVal)}
                  </p>
                  {diffInkoop && (
                    <p className="font-sans font-normal leading-[18px] text-[12px]" style={diffInkoop.color ? { color: diffInkoop.color } : undefined}>
                      {diffInkoop.text}
                    </p>
                  )}
                </div>
              </div>
            );
          } else {
            const zoekVal = getVal(field, "zoekcriteria");
            const verkoopVal = getVal(field, "verkoop");
            const diffVerkoop = field === "prijs" ? calcPctDiff(verkoopVal, zoekVal) : undefined;
            return (
              <div key={field} className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
                <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                  {fieldLabels[field]}
                </p>
                <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">
                  {fmt(field, zoekVal)}
                </p>
                <div className="px-[8px]">
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">
                    {fmt(field, verkoopVal)}
                  </p>
                  {diffVerkoop && (
                    <p className="font-sans font-normal leading-[18px] text-[12px]" style={diffVerkoop.color ? { color: diffVerkoop.color } : undefined}>
                      {diffVerkoop.text}
                    </p>
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Divider before overig */}
      <div className="w-full h-px bg-rdj-border-secondary" />

      <DetailsSidebarSection title="Overig">
        <textarea
          value={overig}
          onChange={(e) => onOverigChange(e.target.value)}
          placeholder="Voeg opmerkingen toe..."
          rows={3}
          className="w-full px-[12px] py-[8px] font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px] bg-transparent border border-transparent rounded-[6px] outline-none resize-none transition-all hover:border-rdj-border-primary hover:bg-rdj-bg-secondary-hover focus:border-rdj-border-brand focus:bg-white placeholder:text-rdj-text-tertiary"
        />
      </DetailsSidebarSection>

      {/* Edit focus column dialog */}
      {editOpen && (
        <EditConditiesDialog
          fields={fields}
          focusLabel={focusIsInkoop ? "Inkoop" : "Verkoop"}
          currentValues={Object.fromEntries(fields.map(f => [f, focusIsInkoop ? getVal(f, "inkoop") : getVal(f, "verkoop")])) as Record<ConditiesField, number | null>}
          onSave={(updates, opmerking) => { onEditSave(updates, opmerking); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}

/* ── Edit Condities Dialog ── */
function EditConditiesDialog({ fields, focusLabel, currentValues, onSave, onClose }: {
  fields: ConditiesField[];
  focusLabel: string;
  currentValues: Record<ConditiesField, number | null>;
  onSave: (updates: Partial<Record<ConditiesField, number | null>>, opmerking: string) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<ConditiesField, string>>(
    Object.fromEntries(fields.map(f => [f, currentValues[f] != null ? String(currentValues[f]) : ""])) as Record<ConditiesField, string>
  );
  const [opmerking, setOpmerking] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<Record<ConditiesField, number | null>> = {};
    for (const field of fields) {
      const raw = values[field].trim().replace(",", ".");
      const num = raw === "" ? null : parseFloat(raw);
      if (num !== currentValues[field]) {
        updates[field] = isNaN(num as number) ? null : num;
      }
    }
    onSave(updates, opmerking.trim());
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{focusLabel} bewerken</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[12px] pt-[4px]">
          {fields.map(field => (
            <div key={field} className="flex flex-col gap-[4px]">
              <Label htmlFor={`edit-${field}`} className="font-sans font-bold text-[13px] text-[#344054]">
                {fieldLabels[field]}
              </Label>
              <Input
                id={`edit-${field}`}
                value={values[field]}
                onChange={(e) => setValues(prev => ({ ...prev, [field]: e.target.value }))}
                placeholder={field === "prijs" ? "0,00" : field === "laadtijd" || field === "lostijd" ? "Uren" : "0,00"}
                autoFocus={field === "prijs"}
              />
            </div>
          ))}

          {/* Divider */}
          <div className="w-full h-px bg-rdj-border-secondary" />

          {/* Opmerking */}
          <div className="flex flex-col gap-[4px]">
            <Label htmlFor="edit-opmerking" className="font-sans font-bold text-[13px] text-[#344054]">
              Opmerking
            </Label>
            <textarea
              id="edit-opmerking"
              value={opmerking}
              onChange={(e) => setOpmerking(e.target.value)}
              placeholder="Bijv. 'Laadtijd aangepast naar wens relatie.'"
              rows={2}
              className="w-full px-[12px] py-[8px] font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px] border border-[#d0d5dd] rounded-[8px] outline-none resize-none transition-all focus:border-rdj-border-brand focus:ring-1 focus:ring-rdj-border-brand placeholder:text-rdj-text-tertiary"
            />
          </div>

          <div className="flex gap-[12px] pt-[4px]">
            <Button variant="secondary" label="Annuleren" fullWidth onClick={onClose} />
            <Button variant="primary" label="Opslaan" fullWidth type="submit" />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ── Vaartuig Tab ── */
function VaartuigTab() {
  return (
    <>
      <DetailsSidebarSection>
        <DetailRow label="Beschikbaar vanaf" value={mockVaartuig.beschikbaarVanaf} />
        <DetailRow label="Huidige locatie" value={mockVaartuig.huidigeLocatie} />
        <DetailRow label="ENI" value={mockVaartuig.eni} />
        <DetailRow label="Vlag" value={mockVaartuig.vlag} />
        <DetailRow label="Meetbrief" value={mockVaartuig.meetbrief} />
        <DetailRow label="Groottonnage" value={mockVaartuig.groottonnage} />
        <DetailRow label="Inhoud" value={mockVaartuig.inhoud} />
        <DetailRow label="Lengte" value={mockVaartuig.lengte} />
        <DetailRow label="Breedte" value={mockVaartuig.breedte} />
        <DetailRow label="Diepgang" value={mockVaartuig.diepgang} />
        <DetailRow label="Kruiphoogte" value={mockVaartuig.kruiphoogte} />
        <DetailRow label="Bijzonderheden" type="badges" badges={mockVaartuig.bijzonderheden} />
        <DetailRow label="Relatie" type="linked" value={mockVaartuig.relatie} />
        <DetailRow label="Contactpersoon" value={mockVaartuig.contactpersoon} />
      </DetailsSidebarSection>

      <div className="w-full h-px bg-rdj-border-secondary shrink-0" />

      <DetailsSidebarSection>
        <DetailRow label="Eigenaar" type="user" value={mockVaartuig.eigenaar} avatarSrc={mockVaartuig.eigenaarFoto} avatarInitials={mockVaartuig.eigenaarInitials} />
      </DetailsSidebarSection>
    </>
  );
}

/* ── Lading Tab ── */
function LadingTab() {
  return (
    <>
      <DetailsSidebarSection>
        <DetailRow label="Partij" type="linked" value={mockLading.partij} />
        <DetailRow label="Subpartij" type="linked" value={mockLading.subpartij} />
        <DetailRow label="Opdrachtgever" type="linked" value={mockLading.opdrachtgever} />
        <DetailRow label="Contactpersoon" value={mockLading.opdrachtgeverContact} />
        <DetailRow label="Tonnage" value={mockLading.tonnage} />
        <DetailRow label="Ex." value={mockLading.ex} subtext={mockLading.exType} />
        <DetailRow label="Lading" value={mockLading.lading} />
        <DetailRow label="Subsoort" value={mockLading.subsoort} />
        <DetailRow label="Soortelijk gewicht" value={mockLading.soortelijkGewicht} />
        <DetailRow label="Inhoud" value={mockLading.inhoud} />
        <DetailRow label="Bijzonderheden" type="badges" badges={mockLading.bijzonderheden} />
        <DetailRow label="Laadhaven" value={mockLading.laadhaven} />
        <DetailRow label="Laaddatum" value={mockLading.laaddatum} />
        <DetailRow label="Loshaven" value={mockLading.loshaven} />
        <DetailRow label="Losdatum" value={mockLading.losdatum} />
      </DetailsSidebarSection>

      <div className="w-full h-px bg-rdj-border-secondary shrink-0" />

      <DetailsSidebarSection>
        <DetailRow label="Eigenaar" type="user" value={mockLading.eigenaar} avatarSrc={mockLading.eigenaarFoto} avatarInitials={mockLading.eigenaarInitials} />
        <DetailRow label="Deadline" value={mockLading.deadline} />
      </DetailsSidebarSection>
    </>
  );
}

/* ── Activity title → icon mapping ── */
const activityIconMap: Record<string, React.ReactNode> = {
  "Bod bijgewerkt": <PenLine size={16} strokeWidth={2} />,
  "Bod ontvangen": <MailOpen size={16} strokeWidth={2} />,
  "Bod verstuurd": <Send size={16} strokeWidth={2} />,
  "Via werklijst": <ListTodo size={16} strokeWidth={2} />,
};

/* ── Activiteit Tab ── */
function ActiviteitTab({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="flex flex-col">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-[12px] relative">
          {/* Timeline line */}
          {index < events.length - 1 && (
            <div className="absolute left-[16px] top-[36px] bottom-0 w-px bg-rdj-border-secondary" />
          )}

          {/* Featured icon on timeline */}
          <div className="shrink-0 z-[1]">
            <FeaturedIcon
              icon={activityIconMap[event.title] ?? <ListTodo size={16} strokeWidth={2} />}
              variant="brand"
              size={32}
            />
          </div>

          {/* Content */}
          <div className="flex-1 pb-[24px] min-w-0">
            {/* Header: title + timestamp + avatar */}
            <div className="flex items-center gap-[6px] min-h-[32px]">
              <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">
                {event.title}
              </p>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px] flex-1">
                {event.timestamp}
              </p>
              {/* Avatar */}
              <div className="relative rounded-full shrink-0 size-[28px] bg-rdj-bg-secondary overflow-hidden">
                {event.avatar ? (
                  <img alt="" src={event.avatar} className="absolute inset-0 size-full object-cover rounded-full" />
                ) : (
                  <div className="flex items-center justify-center size-full">
                    <p className="font-sans font-bold text-rdj-text-primary text-[10px]">{event.initials}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card with message + changes */}
            {(event.message || (event.changes && event.changes.length > 0)) && (
              <div className="mt-[8px] border border-rdj-border-secondary rounded-[8px] overflow-hidden shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
                {event.message && (
                  <div className="px-[16px] py-[12px]">
                    <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                      &ldquo;{event.message}&rdquo;
                    </p>
                  </div>
                )}

                {event.changes && event.changes.length > 0 && (
                  <div className={`flex flex-col gap-[8px] px-[16px] py-[12px] ${event.message ? "border-t border-rdj-border-secondary" : ""}`}>
                    {event.changes.map((change, i) => (
                      <div key={i} className="flex gap-[12px]">
                        <p className="font-sans font-normal leading-[18px] text-rdj-text-tertiary text-[12px] w-[120px] shrink-0">
                          {change.label}
                        </p>
                        <div className="flex-1">
                          <p className="font-sans font-normal leading-[18px] text-rdj-text-primary text-[12px] whitespace-pre-line">
                            {change.oldValue && (
                              <span className="line-through text-rdj-text-tertiary">{change.oldValue} </span>
                            )}
                            <span className="font-bold">{change.value}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
