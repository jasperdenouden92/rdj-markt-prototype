import { useState, useEffect } from "react";
import { X, Check, ArrowRight, Send, MailOpen, PenLine, ListTodo, Calendar, Pencil, MessageSquare, FileText, ClipboardList, ShoppingBag, UserX, MoreHorizontal, Download, Upload, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
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
import DatePickerPopover, { formatDatePickerValue, type DatePickerValue } from "./DatePickerPopover";
import SectionHeader from "./SectionHeader";

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

const mockOverig: { inkoop: string | null; verkoop: string | null; zoekcriteria: string | null } = {
  inkoop: "Voorkeur laden vóór 10:00",
  verkoop: null,
  zoekcriteria: "Schip moet kruiphoogte < 7m hebben",
};

/* ── Mock negotiation meta ── */
const mockNegotiationMeta = {
  laadgereed: "Wo 15 Jan",
  losgereed: "Do 16 Jan",
  eigenaar: "Khoa Nguyen",
  eigenaarInitials: "KN",
  eigenaarFoto: imgKhoaNguyen,
};

/* ── Mock vaartuig data ── */
const mockVaartuig = {
  beschikbaarVanaf: "Ma 12 Jan, 08:00",
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
  laadlocatie: "Rotterdam Waalhaven",
  laaddatum: "Do 15 Jan, 08:00",
  loslocatie: "Antwerpen",
  losdatum: "Vr 16 Jan, 14:00",
  opdrachtgever: "Rederij de Jong",
  opdrachtgeverId: "rel-2",
  opdrachtgeverContact: "Pieter Jansen",
  eigenaar: "Eric Nieuwkoop",
  eigenaarInitials: "EN",
  eigenaarFoto: imgEricNieuwkoop,
  laadgereed: "Wo 15 Jan",
  losgereed: "Do 16 Jan",
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
    title: "Bod toegevoegd",
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
    title: "Bod toegevoegd",
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

type SideTab = "vaartuig" | "lading";

type NegotiationStatus = "Via werklijst" | "In onderhandeling" | "Goedgekeurd" | "Afgewezen";

const activeStatuses: NegotiationStatus[] = ["Via werklijst", "In onderhandeling"];

const statusBadgeConfig: Record<NegotiationStatus, { variant: BadgeVariant; type: BadgeType; icon: React.ReactNode | null }> = {
  "Via werklijst": { variant: "brand", type: "default", icon: <ListTodo strokeWidth={2.5} /> },
  "In onderhandeling": { variant: "brand", type: "color", icon: <Send strokeWidth={2.5} /> },
  "Goedgekeurd": { variant: "success", type: "color", icon: <Check strokeWidth={2.5} /> },
  "Afgewezen": { variant: "error", type: "color", icon: <X strokeWidth={2.5} /> },
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
  /** Initial sidebar tab (defaults to "vaartuig") */
  initialSideTab?: SideTab;
  /** Bemiddeling mode with two relatie names */
  bemiddeling?: {
    inkoopRelatie: string;
    verkoopRelatie: string;
  };
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}


type BemiddelingStatus = "Aangeboden" | "Goedgekeurd" | "Afgewezen";
const bemiddelingStatusOptions: BemiddelingStatus[] = ["Aangeboden", "Goedgekeurd", "Afgewezen"];
const bemiddelingStatusConfig: Record<BemiddelingStatus, { variant: BadgeVariant; type: BadgeType }> = {
  Aangeboden: { variant: "brand", type: "color" },
  Goedgekeurd: { variant: "success", type: "color" },
  Afgewezen: { variant: "error", type: "color" },
};

export default function OnderhandelingSidepanel({ negotiationId, status: initialStatus, bron, soort, relatieName, subtitle: subtitleText, initialSideTab, bemiddeling, onClose, onStatusChange }: OnderhandelingSidepanelProps) {
  const isBemiddeling = !!bemiddeling;
  const [sideTab, setSideTab] = useState<SideTab>(initialSideTab || "vaartuig");
  const [overig, setOverig] = useState("");
  const [currentStatus, setCurrentStatus] = useState<NegotiationStatus>(initialStatus);
  const [laadgereed, setLaadgereed] = useState(mockNegotiationMeta.laadgereed);
  const [losgereed, setLosgereed] = useState(mockNegotiationMeta.losgereed);
  const [laadgereedPicker, setLaadgereedPicker] = useState<DatePickerValue | undefined>(undefined);
  const [losgereedPicker, setLosgereedPicker] = useState<DatePickerValue | undefined>(undefined);
  const isActive = activeStatuses.includes(currentStatus);
  const [conditiesOverrides, setConditiesOverrides] = useState<Partial<Record<ConditiesField, number | null>>>({});
  const [extraEvents, setExtraEvents] = useState<ActivityEvent[]>([]);
  const allEvents = [...extraEvents, ...mockActiviteit];
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [bemiddelingInkoopStatus, setBemiddelingInkoopStatus] = useState<BemiddelingStatus>("Aangeboden");
  const [bemiddelingVerkoopStatus, setBemiddelingVerkoopStatus] = useState<BemiddelingStatus>("Aangeboden");
  const bothApproved = isBemiddeling && bemiddelingInkoopStatus === "Goedgekeurd" && bemiddelingVerkoopStatus === "Goedgekeurd";
  const [dealBevestigd, setDealBevestigd] = useState(false);

  // --- Post-approval action states ---
  type CharterStatus = "not_generated" | "generated" | "sent";
  type ActionRowStatus = "pending" | "completed";
  const [charterStatus, setCharterStatus] = useState<CharterStatus>("not_generated");
  const [laadplanningStatus, setLaadplanningStatus] = useState<ActionRowStatus>("pending");
  const [rejectBidsStatus, setRejectBidsStatus] = useState<ActionRowStatus>("pending");
  const [removeMarketStatus, setRemoveMarketStatus] = useState<ActionRowStatus>("pending");
  const [showRejectEmailModal, setShowRejectEmailModal] = useState(false);
  const [showCharterSendModal, setShowCharterSendModal] = useState(false);
  const [charterSentMeta, setCharterSentMeta] = useState<{ timestamp: string; user: string } | null>(null);

  const handleApprove = (options: ApprovalOptions) => {
    setShowApprovalDialog(false);
    setCurrentStatus("Goedgekeurd");
    onStatusChange?.(negotiationId, "Goedgekeurd");
    if (isBemiddeling) setDealBevestigd(true);

    if (options.generateCharter) {
      setCharterStatus("generated");
      toast.success("Charter gegenereerd");
    }
    if (options.sendToLoadPlanning) {
      setLaadplanningStatus("completed");
      toast.success("Lading doorgestuurd naar laadplanning");
    }
    if (options.removeFromMarket) {
      setRemoveMarketStatus("completed");
      toast.success("Partij uit de markt gehaald");
    }
    if (options.rejectOtherBids) {
      setRejectBidsStatus("completed");
      toast.success("Andere biedingen afgewezen", { description: options.sendRejectionEmail ? "Afwijzingsmails verstuurd" : undefined });
    }

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
    { id: "vaartuig", label: "Vaartuig" },
    { id: "lading", label: "Lading" },
  ];

  // Count completed post-approval actions
  const completedCount = [
    charterStatus === "sent" ? 1 : 0,
    laadplanningStatus === "completed" ? 1 : 0,
    rejectBidsStatus === "completed" ? 1 : 0,
    removeMarketStatus === "completed" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  const showRemoveMarket = bron !== "markt";
  const totalActions = showRemoveMarket ? 4 : 3;

  const charterFileName = `charter_${negotiationId.slice(0, 8)}.pdf`;

  const actionRowIcon = (done: boolean) =>
    done ? (
      <div className="flex items-center justify-center size-[32px] rounded-full bg-[#ECFDF3] shrink-0">
        <Check size={16} strokeWidth={2.5} className="text-[#17B26A]" />
      </div>
    ) : (
      <FeaturedIcon icon={<X strokeWidth={2.5} />} variant="grey" size={32} />
    );

  const approvedActionsFooter = (
    <div className="border-t border-rdj-border-secondary">
      {/* Header */}
      <div className="px-[24px] pt-[16px] pb-[8px] flex items-center justify-between">
        <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary">Acties</p>
        <p className="font-sans font-normal text-[12px] leading-[16px] text-rdj-text-tertiary">{completedCount} van {totalActions}</p>
      </div>

      {/* Charter row */}
      <div className="px-[24px] py-[10px] flex items-start gap-[12px]">
        {charterStatus === "sent" ? (
          <div className="flex items-center justify-center size-[32px] rounded-full bg-[#ECFDF3] shrink-0">
            <Check size={16} strokeWidth={2.5} className="text-[#17B26A]" />
          </div>
        ) : charterStatus === "generated" ? (
          <FeaturedIcon icon={<FileText strokeWidth={2.5} />} variant="brand" size={32} />
        ) : (
          <FeaturedIcon icon={<X strokeWidth={2.5} />} variant="grey" size={32} />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary">Charter</p>
          <p className="font-sans font-normal text-[12px] leading-[16px] text-rdj-text-tertiary">
            {charterStatus === "not_generated"
              ? "Nog niet gegenereerd"
              : charterStatus === "generated"
                ? "Versie 1 gegenereerd"
                : charterSentMeta
                  ? `Versie 1 verstuurd op ${charterSentMeta.timestamp} door ${charterSentMeta.user}`
                  : `Versie 1 verstuurd naar ${relatieName || "relatie"}`}
          </p>
        </div>
        {charterStatus !== "not_generated" && (
          <button
            onClick={() => toast.success("Document geopend")}
            className="flex items-center gap-[6px] shrink-0 group/file"
          >
            <FileText size={14} strokeWidth={2} className="text-rdj-text-tertiary shrink-0" />
            <span className="font-sans font-normal text-[13px] leading-[18px] text-rdj-text-brand group-hover/file:underline whitespace-nowrap">
              {charterFileName}
            </span>
          </button>
        )}
        {charterStatus === "not_generated" ? (
          <Button
            variant="secondary"
            size="sm"
            label="Genereren"
            leadingIcon={<FileText size={14} strokeWidth={2.5} />}
            onClick={() => {
              setCharterStatus("generated");
              toast.success("Charter gegenereerd");
            }}
          />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-[6px] rounded-[6px] hover:bg-rdj-bg-primary-hover transition-colors shrink-0">
                <MoreHorizontal size={16} className="text-rdj-text-tertiary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px] border-[#eaecf0] bg-white shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)]">
              {charterStatus === "generated" && (
                <DropdownMenuItem onClick={() => setShowCharterSendModal(true)}>
                  <Send size={14} className="mr-2" />
                  Verzenden
                </DropdownMenuItem>
              )}
              {charterStatus === "generated" && (
                <DropdownMenuItem onClick={() => {
                  const now = new Date();
                  const ts = now.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }) + " " + now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
                  setCharterSentMeta({ timestamp: ts, user: mockNegotiationMeta.eigenaar });
                  setCharterStatus("sent");
                  toast.success("Charter gemarkeerd als verzonden");
                }}>
                  <Check size={14} className="mr-2" />
                  Markeer als verzonden
                </DropdownMenuItem>
              )}
              {charterStatus === "sent" && (
                <DropdownMenuItem onClick={() => {
                  setCharterStatus("generated");
                  setCharterSentMeta(null);
                  toast.success("Charter gemarkeerd als niet verzonden");
                }}>
                  <X size={14} className="mr-2" />
                  Markeer als niet verzonden
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => toast.success("Charter gedownload")}>
                <Download size={14} className="mr-2" />
                Downloaden
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[#D92D20] focus:text-[#D92D20]" onClick={() => {
                setCharterStatus("not_generated");
                toast.success("Charter verwijderd");
              }}>
                <X size={14} className="mr-2" />
                Verwijderen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Laadplanning row */}
      <div className="px-[24px] py-[10px] flex items-center gap-[12px]">
        {actionRowIcon(laadplanningStatus === "completed")}
        <div className="flex-1 min-w-0">
          <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary">Laadplanning</p>
          <p className="font-sans font-normal text-[12px] leading-[16px] text-rdj-text-tertiary">
            {laadplanningStatus === "completed" ? "Doorgestuurd naar laadplanning" : "Nog niet doorgestuurd"}
          </p>
        </div>
        {laadplanningStatus === "pending" ? (
          <Button
            variant="secondary"
            size="sm"
            label="Doorsturen"
            leadingIcon={<ClipboardList size={14} strokeWidth={2.5} />}
            onClick={() => {
              setLaadplanningStatus("completed");
              toast.success("Lading doorgestuurd naar laadplanning");
            }}
          />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-[6px] rounded-[6px] hover:bg-rdj-bg-primary-hover transition-colors shrink-0">
                <MoreHorizontal size={16} className="text-rdj-text-tertiary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px] border-[#eaecf0] bg-white shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)]">
              <DropdownMenuItem onClick={() => toast.success("Navigeren naar laadplanning...")}>
                <ExternalLink size={14} className="mr-2" />
                Bekijk in laadplanning
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Andere biedingen afwijzen row */}
      <div className="px-[24px] py-[10px] flex items-center gap-[12px]">
        {actionRowIcon(rejectBidsStatus === "completed")}
        <div className="flex-1 min-w-0">
          <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary">Andere biedingen afwijzen</p>
          <p className="font-sans font-normal text-[12px] leading-[16px] text-rdj-text-tertiary">
            {rejectBidsStatus === "completed" ? "Afwijzingsmails verstuurd" : "Nog niet afgewezen"}
          </p>
        </div>
        {rejectBidsStatus === "pending" && (
          <Button
            variant="secondary"
            size="sm"
            label="Afwijzen"
            leadingIcon={<UserX size={14} strokeWidth={2.5} />}
            onClick={() => setShowRejectEmailModal(true)}
          />
        )}
      </div>

      {/* Partij uit markt halen row */}
      {showRemoveMarket && (
        <div className="px-[24px] py-[10px] pb-[16px] flex items-center gap-[12px]">
          {actionRowIcon(removeMarketStatus === "completed")}
          <div className="flex-1 min-w-0">
            <p className="font-sans font-bold text-[14px] leading-[20px] text-rdj-text-primary">Partij uit de markt halen</p>
            <p className="font-sans font-normal text-[12px] leading-[16px] text-rdj-text-tertiary">
              {removeMarketStatus === "completed" ? "Partij uit de markt gehaald" : "Partij staat nog in de markt"}
            </p>
          </div>
          {removeMarketStatus === "pending" && (
            <Button
              variant="secondary"
              size="sm"
              label="Uit markt halen"
              leadingIcon={<ShoppingBag size={14} strokeWidth={2.5} />}
              onClick={() => {
                setRemoveMarketStatus("completed");
                toast.success("Partij uit de markt gehaald");
              }}
            />
          )}
        </div>
      )}
    </div>
  );

  return (<>
    <ModelessPanel
      initialWidth={900}
      resizable
      title={isBemiddeling ? `Bemiddeling met ${bemiddeling.inkoopRelatie} en ${bemiddeling.verkoopRelatie}` : `Onderhandeling met ${relatieName || "Rederij Alfa"}`}
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
            <DatePickerPopover
              id="sidepanel-laadgereed"
              value={laadgereedPicker}
              onChange={(val) => {
                setLaadgereedPicker(val);
                setLaadgereed(formatDatePickerValue(val));
              }}
            >
              <button className="flex items-center gap-[6px] hover:bg-rdj-bg-primary-hover rounded-[4px] px-[4px] py-[2px] -mx-[4px] transition-colors">
                <Calendar data-annotation-id="onderhandelingsidepanel-kalender-2" size={14} className="text-rdj-text-tertiary shrink-0" />
                <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                  Laden: {laadgereed}
                </p>
              </button>
            </DatePickerPopover>
            <DatePickerPopover
              id="sidepanel-losgereed"
              value={losgereedPicker}
              onChange={(val) => {
                setLosgereedPicker(val);
                setLosgereed(formatDatePickerValue(val));
              }}
            >
              <button className="flex items-center gap-[6px] hover:bg-rdj-bg-primary-hover rounded-[4px] px-[4px] py-[2px] -mx-[4px] transition-colors">
                <Calendar data-annotation-id="onderhandelingsidepanel-kalender" size={14} className="text-rdj-text-tertiary shrink-0" />
                <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                  Lossen: {losgereed}
                </p>
              </button>
            </DatePickerPopover>
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
        dealBevestigd ? (
          approvedActionsFooter
        ) : bothApproved ? (
          <div className="border-t border-rdj-border-secondary px-[24px] py-[16px] flex gap-[12px] justify-end">
            <Button
              variant="secondary-destructive"
              label="Deal afwijzen"
              leadingIcon={<X strokeWidth={2.5} />}
              onClick={handleReject}
            />
            <Button
              variant="primary"
              label="Deal bevestigen"
              leadingIcon={<Check strokeWidth={2.5} />}
              onClick={() => setShowApprovalDialog(true)}
            />
          </div>
        ) : isBemiddeling ? undefined : isActive ? (
          <div className="border-t border-rdj-border-secondary px-[24px] py-[16px] flex gap-[12px] justify-end">
            <Button
              variant="secondary-destructive"
              label="Afwijzen"
              leadingIcon={<X strokeWidth={2.5} />}
              onClick={handleReject}
            />
            <Button
              variant="primary"
              label="Goedkeuren"
              leadingIcon={<Check strokeWidth={2.5} />}
              onClick={() => setShowApprovalDialog(true)}
            />
          </div>
        ) : currentStatus === "Goedgekeurd" ? (
          approvedActionsFooter
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
            {sideTab === "vaartuig" && <VaartuigTab />}
            {sideTab === "lading" && <LadingTab />}
          </div>
        </div>
      }
    >
      {/* Main section: Condities */}
      <div className="flex flex-col gap-[16px] p-[24px]">
        <ConditiesTab bron={bron} soort={soort} overig={overig} onOverigChange={setOverig} overrides={conditiesOverrides} onEditSave={handleConditiesSave} bemiddeling={bemiddeling} inkoopStatus={bemiddelingInkoopStatus} verkoopStatus={bemiddelingVerkoopStatus} onInkoopStatusChange={setBemiddelingInkoopStatus} onVerkoopStatusChange={setBemiddelingVerkoopStatus} />
      </div>
      <div className="w-full h-px bg-rdj-border-secondary" />
      <SectionHeader title="Activiteit" />
      <div className="px-[24px] pb-[24px]">
        <ActiviteitTab events={allEvents} />
      </div>
    </ModelessPanel>
    <ApprovalConfirmationDialog
      open={showApprovalDialog}
      onClose={() => setShowApprovalDialog(false)}
      onConfirm={handleApprove}
      relatieName={relatieName}
      hideRemoveFromMarket={bron === "markt"}
    />
    {showRejectEmailModal && (
      <RejectBidsEmailModal
        onClose={() => setShowRejectEmailModal(false)}
        onSend={() => {
          setRejectBidsStatus("completed");
          toast.success("Afwijzingsmails verstuurd");
          setShowRejectEmailModal(false);
        }}
      />
    )}
    {showCharterSendModal && (
      <CharterSendEmailModal
        relatieName={relatieName || "Rederij Alfa"}
        charterFileName={charterFileName}
        onClose={() => setShowCharterSendModal(false)}
        onSend={() => {
          const now = new Date();
          const ts = now.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }) + " " + now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
          setCharterSentMeta({ timestamp: ts, user: mockNegotiationMeta.eigenaar });
          setCharterStatus("sent");
          toast.success("Charter verzonden", { description: `Verstuurd naar ${relatieName || "relatie"}` });
          setShowCharterSendModal(false);
        }}
      />
    )}
  </>
  );
}

/* ── Condities content ── */
/**
 * Four modes based on bron + soort + bemiddeling:
 *   Mode A (eigen lading): Verkoop · Zoekcriteria · Inkoop (focus)
 *   Mode B (markt vaartuig): Verkoop · Inkoop (focus)
 *   Mode C (eigen vaartuig / markt lading): Zoekcriteria · Verkoop (focus)
 *   Mode D (bemiddeling): Verkoop · Inkoop (both editable, with relatie names + per-column status)
 */

function ConditiesTab({ bron, soort, overig, onOverigChange, overrides, onEditSave, bemiddeling, inkoopStatus, verkoopStatus, onInkoopStatusChange, onVerkoopStatusChange }: { bron: NegotiationBron; soort: NegotiationSoort; overig: string; onOverigChange: (v: string) => void; overrides: Partial<Record<ConditiesField, number | null>>; onEditSave: (updates: Partial<Record<ConditiesField, number | null>>, opmerking: string) => void; bemiddeling?: { inkoopRelatie: string; verkoopRelatie: string }; inkoopStatus?: BemiddelingStatus; verkoopStatus?: BemiddelingStatus; onInkoopStatusChange?: (s: BemiddelingStatus) => void; onVerkoopStatusChange?: (s: BemiddelingStatus) => void }) {
  const isBemiddeling = !!bemiddeling;
  const modeA = !isBemiddeling && bron === "eigen" && soort === "lading";
  const modeB = !isBemiddeling && bron === "markt" && soort === "vaartuig";
  // modeC = everything else (eigen vaartuig / markt lading), not bemiddeling
  const focusIsInkoop = modeA || modeB;
  const [editOpen, setEditOpen] = useState(false);
  const [editColumn, setEditColumn] = useState<"inkoop" | "verkoop">("inkoop");

  // Date state for laadgereed/losgereed
  const [laadgereedInkoop, setLaadgereedInkoop] = useState(mockNegotiationMeta.laadgereed);
  const [losgereedInkoop, setLosgereedInkoop] = useState(mockNegotiationMeta.losgereed);
  const [laadgereedVerkoop, setLaadgereedVerkoop] = useState(mockNegotiationMeta.laadgereed);
  const [losgereedVerkoop, setLosgereedVerkoop] = useState(mockNegotiationMeta.losgereed);
  const [laadgereedZoek, setLaadgereedZoek] = useState(mockNegotiationMeta.laadgereed);
  const [losgereedZoek, setLosgereedZoek] = useState(mockNegotiationMeta.losgereed);
  const [laadgereedPickerInkoop, setLaadgereedPickerInkoop] = useState<DatePickerValue | undefined>();
  const [losgereedPickerInkoop, setLosgereedPickerInkoop] = useState<DatePickerValue | undefined>();
  const [laadgereedPickerVerkoop, setLaadgereedPickerVerkoop] = useState<DatePickerValue | undefined>();
  const [losgereedPickerVerkoop, setLosgereedPickerVerkoop] = useState<DatePickerValue | undefined>();
  const [laadgereedPickerZoek, setLaadgereedPickerZoek] = useState<DatePickerValue | undefined>();
  const [losgereedPickerZoek, setLosgereedPickerZoek] = useState<DatePickerValue | undefined>();

  const fields: ConditiesField[] = ["prijs", "laadtijd", "liggeldLaden", "lostijd", "liggeldLossen"];

  // Get value with overrides applied
  const getVal = (field: ConditiesField, key: "inkoop" | "verkoop" | "zoekcriteria"): number | null => {
    if (key === "inkoop" && (focusIsInkoop || isBemiddeling) && field in overrides) return overrides[field] ?? mockCondities[field].inkoop;
    if (key === "verkoop" && (!focusIsInkoop || isBemiddeling) && field in overrides) return overrides[field] ?? mockCondities[field].verkoop;
    return mockCondities[field][key];
  };

  const gridCols = (modeA) ? "grid-cols-[1fr_1fr_1fr_1fr]" : "grid-cols-[1fr_1fr_1fr]";

  // Focus column position: always the last column
  const focusLeft = modeA ? "left-[75%]" : "left-[66.67%]";
  const focusWidth = modeA ? "w-[25%]" : "w-[33.33%]";

  // Helper: date picker cell
  const DateCell = ({ value, pickerValue, onPickerChange, onValueChange, px }: { value: string; pickerValue: DatePickerValue | undefined; onPickerChange: (v: DatePickerValue) => void; onValueChange: (v: string) => void; px?: boolean }) => (
    <DatePickerPopover value={pickerValue} onChange={(val) => { onPickerChange(val); onValueChange(formatDatePickerValue(val)); }}>
      <button className={`font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px] hover:text-rdj-text-brand transition-colors ${px ? "px-[8px]" : ""}`}>
        {value}
      </button>
    </DatePickerPopover>
  );

  // Bemiddeling mode (Mode D)
  if (isBemiddeling) {
    return (
      <>
        <div className="relative">
          {/* Blue background for both Verkoop and Inkoop columns */}
          <div className="absolute left-[33.33%] w-[33.33%] top-0 bottom-0 bg-rdj-bg-brand rounded-l-[8px]" />
          <div className="absolute left-[66.67%] w-[33.33%] top-0 bottom-0 bg-rdj-bg-brand rounded-r-[8px]" />

          {/* Column headers */}
          <div className="relative grid grid-cols-[1fr_1fr_1fr] gap-[8px] px-[4px] py-[4px]">
            <div />
            <div className="px-[8px]">
              <div className="flex items-center gap-[4px]">
                <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px]">Verkoop</p>
                <button onClick={() => { setEditColumn("verkoop"); setEditOpen(true); }} className="text-rdj-text-tertiary hover:text-rdj-text-brand transition-colors">
                  <Pencil size={12} strokeWidth={2} />
                </button>
              </div>
              <p className="font-sans font-normal leading-[16px] text-rdj-text-tertiary text-[11px] truncate">{bemiddeling.verkoopRelatie}</p>
            </div>
            <div className="px-[8px]">
              <div className="flex items-center gap-[4px]">
                <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px]">Inkoop</p>
                <button onClick={() => { setEditColumn("inkoop"); setEditOpen(true); }} className="text-rdj-text-tertiary hover:text-rdj-text-brand transition-colors">
                  <Pencil size={12} strokeWidth={2} />
                </button>
              </div>
              <p className="font-sans font-normal leading-[16px] text-rdj-text-tertiary text-[11px] truncate">{bemiddeling.inkoopRelatie}</p>
            </div>
          </div>

          <div className="relative w-full h-px bg-rdj-border-secondary" />

          {/* Value rows */}
          {fields.map((field) => {
            const verkoopVal = getVal(field, "verkoop");
            const inkoopVal = getVal(field, "inkoop");
            const diffInkoop = field === "prijs" ? calcPctDiff(inkoopVal, verkoopVal) : undefined;
            return (
              <div key={field} className="relative grid grid-cols-[1fr_1fr_1fr] gap-[8px] py-[8px] px-[4px]">
                <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                  {fieldLabels[field]}
                </p>
                <div className="px-[8px]">
                  <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">
                    {fmt(field, verkoopVal)}
                  </p>
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
          })}

          {/* Laadgereed row */}
          <div className="relative grid grid-cols-[1fr_1fr_1fr] gap-[8px] py-[8px] px-[4px]">
            <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Laadgereed</p>
            <div className="px-[8px]"><DateCell value={laadgereedVerkoop} pickerValue={laadgereedPickerVerkoop} onPickerChange={setLaadgereedPickerVerkoop} onValueChange={setLaadgereedVerkoop} /></div>
            <div className="px-[8px]"><DateCell value={laadgereedInkoop} pickerValue={laadgereedPickerInkoop} onPickerChange={setLaadgereedPickerInkoop} onValueChange={setLaadgereedInkoop} /></div>
          </div>

          {/* Losgereed row */}
          <div className="relative grid grid-cols-[1fr_1fr_1fr] gap-[8px] py-[8px] px-[4px]">
            <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Losgereed</p>
            <div className="px-[8px]"><DateCell value={losgereedVerkoop} pickerValue={losgereedPickerVerkoop} onPickerChange={setLosgereedPickerVerkoop} onValueChange={setLosgereedVerkoop} /></div>
            <div className="px-[8px]"><DateCell value={losgereedInkoop} pickerValue={losgereedPickerInkoop} onPickerChange={setLosgereedPickerInkoop} onValueChange={setLosgereedInkoop} /></div>
          </div>

          {/* Overig row — last before status */}
          {(mockOverig.verkoop || mockOverig.inkoop) && (
            <div className="relative grid grid-cols-[1fr_1fr_1fr] gap-[8px] py-[8px] px-[4px]">
              <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Overig</p>
              <div className="px-[8px]">
                <p className="font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px]">{mockOverig.verkoop || "—"}</p>
              </div>
              <div className="px-[8px]">
                <p className="font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px]">{mockOverig.inkoop || "—"}</p>
              </div>
            </div>
          )}

          {/* Status row */}
          <div className="relative w-full h-px bg-rdj-border-secondary my-[4px]" />
          <div className="relative grid grid-cols-[1fr_1fr_1fr] gap-[8px] py-[8px] px-[4px]">
            <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Status</p>
            <div className="px-[8px]">
              <StatusDropdown value={verkoopStatus!} onChange={onVerkoopStatusChange!} />
            </div>
            <div className="px-[8px]">
              <StatusDropdown value={inkoopStatus!} onChange={onInkoopStatusChange!} />
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-rdj-border-secondary" />

        <DetailsSidebarSection title="Opmerkingen">
          <textarea
            value={overig}
            onChange={(e) => onOverigChange(e.target.value)}
            placeholder="Voeg opmerkingen toe..."
            rows={3}
            className="w-full px-[12px] py-[8px] font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px] bg-transparent border border-transparent rounded-[6px] outline-none resize-none transition-all hover:border-rdj-border-primary hover:bg-rdj-bg-secondary-hover focus:border-rdj-border-brand focus:bg-white placeholder:text-rdj-text-tertiary"
          />
        </DetailsSidebarSection>

        {editOpen && (
          <EditConditiesDialog
            fields={fields}
            focusLabel={editColumn === "inkoop" ? "Inkoop" : "Verkoop"}
            currentValues={Object.fromEntries(fields.map(f => [f, getVal(f, editColumn)])) as Record<ConditiesField, number | null>}
            laadgereedValue={editColumn === "inkoop" ? laadgereedInkoop : laadgereedVerkoop}
            losgereedValue={editColumn === "inkoop" ? losgereedInkoop : losgereedVerkoop}
            onSave={(updates, opmerking, dateUpdates) => {
              onEditSave(updates, opmerking);
              if (dateUpdates?.laadgereed) { if (editColumn === "inkoop") setLaadgereedInkoop(dateUpdates.laadgereed); else setLaadgereedVerkoop(dateUpdates.laadgereed); }
              if (dateUpdates?.losgereed) { if (editColumn === "inkoop") setLosgereedInkoop(dateUpdates.losgereed); else setLosgereedVerkoop(dateUpdates.losgereed); }
              setEditOpen(false);
            }}
            onClose={() => setEditOpen(false)}
          />
        )}
      </>
    );
  }

  // Regular modes (A, B, C)
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

        {/* Laadgereed / Losgereed date rows */}
        {modeA ? (
          <>
            <div className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Laadgereed</p>
              <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">{laadgereedVerkoop}</p>
              <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">{laadgereedZoek}</p>
              <div className="px-[8px]"><DateCell value={laadgereedInkoop} pickerValue={laadgereedPickerInkoop} onPickerChange={setLaadgereedPickerInkoop} onValueChange={setLaadgereedInkoop} /></div>
            </div>
            <div className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Losgereed</p>
              <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">{losgereedVerkoop}</p>
              <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">{losgereedZoek}</p>
              <div className="px-[8px]"><DateCell value={losgereedInkoop} pickerValue={losgereedPickerInkoop} onPickerChange={setLosgereedPickerInkoop} onValueChange={setLosgereedInkoop} /></div>
            </div>
          </>
        ) : modeB ? (
          <>
            <div className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Laadgereed</p>
              <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">{laadgereedVerkoop}</p>
              <div className="px-[8px]"><DateCell value={laadgereedInkoop} pickerValue={laadgereedPickerInkoop} onPickerChange={setLaadgereedPickerInkoop} onValueChange={setLaadgereedInkoop} /></div>
            </div>
            <div className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Losgereed</p>
              <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">{losgereedVerkoop}</p>
              <div className="px-[8px]"><DateCell value={losgereedInkoop} pickerValue={losgereedPickerInkoop} onPickerChange={setLosgereedPickerInkoop} onValueChange={setLosgereedInkoop} /></div>
            </div>
          </>
        ) : (
          <>
            <div className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Laadgereed</p>
              <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">{laadgereedZoek}</p>
              <div className="px-[8px]"><DateCell value={laadgereedVerkoop} pickerValue={laadgereedPickerVerkoop} onPickerChange={setLaadgereedPickerVerkoop} onValueChange={setLaadgereedVerkoop} /></div>
            </div>
            <div className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Losgereed</p>
              <p className="font-sans font-bold leading-[20px] text-rdj-text-primary text-[14px]">{losgereedZoek}</p>
              <div className="px-[8px]"><DateCell value={losgereedVerkoop} pickerValue={losgereedPickerVerkoop} onPickerChange={setLosgereedPickerVerkoop} onValueChange={setLosgereedVerkoop} /></div>
            </div>
          </>
        )}

        {/* Overig row — always last */}
        {modeA && (mockOverig.verkoop || mockOverig.zoekcriteria || mockOverig.inkoop) && (
          <div className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
            <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Overig</p>
            <p className="font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px]">{mockOverig.verkoop || "—"}</p>
            <p className="font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px]">{mockOverig.zoekcriteria || "—"}</p>
            <div className="px-[8px]">
              <p className="font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px]">{mockOverig.inkoop || "—"}</p>
            </div>
          </div>
        )}
        {modeB && (mockOverig.verkoop || mockOverig.inkoop) && (
          <div className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
            <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Overig</p>
            <p className="font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px]">{mockOverig.verkoop || "—"}</p>
            <div className="px-[8px]">
              <p className="font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px]">{mockOverig.inkoop || "—"}</p>
            </div>
          </div>
        )}
        {!modeA && !modeB && (mockOverig.zoekcriteria || mockOverig.verkoop) && (
          <div className={`relative grid ${gridCols} gap-[8px] py-[8px] px-[4px]`}>
            <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">Overig</p>
            <p className="font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px]">{mockOverig.zoekcriteria || "—"}</p>
            <div className="px-[8px]">
              <p className="font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px]">{mockOverig.verkoop || "—"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Divider before opmerkingen */}
      <div className="w-full h-px bg-rdj-border-secondary" />

      <DetailsSidebarSection title="Opmerkingen">
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
          laadgereedValue={focusIsInkoop ? laadgereedInkoop : laadgereedVerkoop}
          losgereedValue={focusIsInkoop ? losgereedInkoop : losgereedVerkoop}
          onSave={(updates, opmerking, dateUpdates) => {
            onEditSave(updates, opmerking);
            if (dateUpdates?.laadgereed) { if (focusIsInkoop) setLaadgereedInkoop(dateUpdates.laadgereed); else setLaadgereedVerkoop(dateUpdates.laadgereed); }
            if (dateUpdates?.losgereed) { if (focusIsInkoop) setLosgereedInkoop(dateUpdates.losgereed); else setLosgereedVerkoop(dateUpdates.losgereed); }
            setEditOpen(false);
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}

/* ── Status Dropdown for Bemiddeling ── */
function StatusDropdown({ value, onChange }: { value: BemiddelingStatus; onChange: (v: BemiddelingStatus) => void }) {
  const cfg = bemiddelingStatusConfig[value];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as BemiddelingStatus)}
      className="appearance-none cursor-pointer rounded-full border px-[8px] py-[2px] font-sans font-bold text-[12px] leading-[18px] outline-none transition-colors"
      style={{
        backgroundColor: cfg.variant === "brand" ? "#EFF8FF" : cfg.variant === "success" ? "#ECFDF3" : "#FEF3F2",
        color: cfg.variant === "brand" ? "#175CD3" : cfg.variant === "success" ? "#067647" : "#B42318",
        borderColor: cfg.variant === "brand" ? "#B2DDFF" : cfg.variant === "success" ? "#ABEFC6" : "#FECDCA",
      }}
    >
      {bemiddelingStatusOptions.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

/* ── Edit Condities Dialog ── */
function EditConditiesDialog({ fields, focusLabel, currentValues, laadgereedValue, losgereedValue, onSave, onClose }: {
  fields: ConditiesField[];
  focusLabel: string;
  currentValues: Record<ConditiesField, number | null>;
  laadgereedValue?: string;
  losgereedValue?: string;
  onSave: (updates: Partial<Record<ConditiesField, number | null>>, opmerking: string, dateUpdates?: { laadgereed?: string; losgereed?: string }) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<ConditiesField, string>>(
    Object.fromEntries(fields.map(f => [f, currentValues[f] != null ? String(currentValues[f]) : ""])) as Record<ConditiesField, string>
  );
  const [opmerking, setOpmerking] = useState("");
  const [laadgereedPicker, setLaadgereedPicker] = useState<DatePickerValue | undefined>();
  const [losgereedPicker, setLosgereedPicker] = useState<DatePickerValue | undefined>();
  const [laadgereedText, setLaadgereedText] = useState(laadgereedValue || "");
  const [losgereedText, setLosgereedText] = useState(losgereedValue || "");

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
    const dateUpdates: { laadgereed?: string; losgereed?: string } = {};
    if (laadgereedText !== (laadgereedValue || "")) dateUpdates.laadgereed = laadgereedText;
    if (losgereedText !== (losgereedValue || "")) dateUpdates.losgereed = losgereedText;
    onSave(updates, opmerking.trim(), Object.keys(dateUpdates).length > 0 ? dateUpdates : undefined);
  };

  return (
    <Dialog data-annotation-id="onderhandelingsidepanel-modal" open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{focusLabel} bewerken</DialogTitle>
        </DialogHeader>

        <form data-annotation-id="onderhandelingsidepanel-formulier" onSubmit={handleSubmit} className="flex flex-col gap-[12px] pt-[4px]">
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

          {/* Laadgereed */}
          <div className="flex flex-col gap-[4px]">
            <Label className="font-sans font-bold text-[13px] text-[#344054]">Laadgereed</Label>
            <DatePickerPopover value={laadgereedPicker} onChange={(val) => { setLaadgereedPicker(val); setLaadgereedText(formatDatePickerValue(val)); }}>
              <button type="button" className="w-full text-left px-[12px] py-[8px] font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px] border border-[#d0d5dd] rounded-[8px] hover:border-[#98a2b3] transition-colors">
                {laadgereedText || "Selecteer datum"}
              </button>
            </DatePickerPopover>
          </div>

          {/* Losgereed */}
          <div className="flex flex-col gap-[4px]">
            <Label className="font-sans font-bold text-[13px] text-[#344054]">Losgereed</Label>
            <DatePickerPopover value={losgereedPicker} onChange={(val) => { setLosgereedPicker(val); setLosgereedText(formatDatePickerValue(val)); }}>
              <button type="button" className="w-full text-left px-[12px] py-[8px] font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px] border border-[#d0d5dd] rounded-[8px] hover:border-[#98a2b3] transition-colors">
                {losgereedText || "Selecteer datum"}
              </button>
            </DatePickerPopover>
          </div>

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
        <DetailRow label="Laadlocatie" value={mockLading.laadlocatie} />
        <DetailRow label="Laaddatum" value={mockLading.laaddatum} />
        <DetailRow label="Loslocatie" value={mockLading.loslocatie} />
        <DetailRow label="Losdatum" value={mockLading.losdatum} />
      </DetailsSidebarSection>

      <div className="w-full h-px bg-rdj-border-secondary shrink-0" />

      <DetailsSidebarSection>
        <DetailRow label="Eigenaar" type="user" value={mockLading.eigenaar} avatarSrc={mockLading.eigenaarFoto} avatarInitials={mockLading.eigenaarInitials} />
        <DetailRow label="Laadgereed" value={mockLading.laadgereed} />
        <DetailRow label="Losgereed" value={mockLading.losgereed} />
      </DetailsSidebarSection>
    </>
  );
}

/* ── Activity title → icon mapping ── */
const activityIconMap: Record<string, React.ReactNode> = {
  "Bod bijgewerkt": <PenLine size={16} strokeWidth={2} />,
  "Bod toegevoegd": <Send size={16} strokeWidth={2} />,
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

/* ── Reject Bids Email Modal ── */

const MOCK_OTHER_BIDDERS = [
  { name: "Van Oord B.V.", email: "bevrachting@vanoord.nl" },
  { name: "Boskalis", email: "chartering@boskalis.com" },
  { name: "Damen Shipyards", email: "logistics@damen.com" },
];

function RejectBidsEmailModal({ onClose, onSend }: { onClose: () => void; onSend: () => void }) {
  const [recipients, setRecipients] = useState(MOCK_OTHER_BIDDERS.map(b => b.email));
  const [removedRecipients, setRemovedRecipients] = useState<string[]>([]);
  const [subject] = useState("Afwijzing bieding — 1.200 t Grind, Rotterdam → Antwerpen");
  const [message] = useState(`Geachte relatie,

Hierbij delen wij u mede dat uw bieding op bovengenoemde lading helaas niet is geaccepteerd. De opdracht is aan een andere partij gegund.

Wij hopen in de toekomst opnieuw met u samen te kunnen werken.

Met vriendelijke groet,
Rederij de Jong`);

  const removeRecipient = (email: string) => {
    setRecipients(prev => prev.filter(r => r !== email));
    setRemovedRecipients(prev => [...prev, email]);
  };

  const addRecipient = (email: string) => {
    setRecipients(prev => [...prev, email]);
    setRemovedRecipients(prev => prev.filter(r => r !== email));
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#0c111d] opacity-70 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[10px] max-w-[600px] w-full max-h-[90vh] overflow-auto shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
          {/* Header */}
          <div className="relative shrink-0 w-full">
            <div className="content-stretch flex gap-[16px] items-start pt-[24px] px-[24px] relative w-full">
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative">
                <p className="font-sans font-bold leading-[26px] text-[#101828] text-[18px] w-full">
                  Andere biedingen afwijzen
                </p>
                <p className="font-sans font-normal leading-[20px] text-[#475467] text-[14px] w-full">
                  Verstuur een afwijzingsmail naar de andere bieders op deze partij.
                </p>
              </div>
              <button onClick={onClose} className="absolute flex items-center justify-center p-[8px] right-[12px] rounded-[6px] size-[44px] top-[12px] hover:bg-rdj-bg-primary-hover transition-colors">
                <X size={20} className="text-[#98A2B3]" />
              </button>
            </div>
            <div className="h-[20px] shrink-0 w-full" />
            <div className="h-px w-full bg-[#eaecf0]" />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-[24px] p-[24px] w-full">
            {/* Ontvangers */}
            <div className="flex flex-col gap-[8px] w-full">
              <div className="flex items-center justify-between w-full">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Ontvangers</p>
                {removedRecipients.length > 0 && (
                  <div className="flex gap-[8px] items-center">
                    {removedRecipients.map(email => {
                      const bidder = MOCK_OTHER_BIDDERS.find(b => b.email === email);
                      return (
                        <button
                          key={email}
                          onClick={() => addRecipient(email)}
                          className="flex gap-[4px] items-center text-[#1567a4] hover:underline"
                        >
                          <span className="font-sans font-bold text-[12px] leading-[16px]">+ {bidder?.name || email}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {recipients.length > 0 ? (
                <div className="bg-white relative rounded-[6px] w-full">
                  <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                    <div className="flex gap-[8px] items-center px-[12px] py-[8px] w-full">
                      <div className="flex flex-[1_0_0] flex-wrap gap-[6px] items-center min-w-0">
                        {recipients.map(email => {
                          const bidder = MOCK_OTHER_BIDDERS.find(b => b.email === email);
                          return (
                            <div key={email} className="bg-white flex gap-[3px] items-center pl-[9px] pr-[4px] py-[2px] rounded-[4px] shrink-0 relative">
                              <div aria-hidden="true" className="absolute border border-[#d0d5dd] inset-0 pointer-events-none rounded-[4px]" />
                              <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px] whitespace-nowrap">
                                {bidder?.name || email}
                              </p>
                              <p className="font-sans font-normal leading-[20px] text-[#667085] text-[12px] whitespace-nowrap">
                                ({email})
                              </p>
                              <button onClick={() => removeRecipient(email)} className="flex flex-col items-start p-[2px] rounded-[3px] shrink-0">
                                <X size={12} className="text-[#98A2B3]" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div aria-hidden="true" className="absolute border border-[#d0d5dd] inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
                </div>
              ) : (
                <div className="flex flex-col gap-[6px] w-full">
                  <div className="bg-white relative rounded-[6px] w-full">
                    <div className="flex items-center px-[12px] py-[8px] w-full">
                      <p className="font-sans font-normal leading-[20px] text-[#667085] text-[14px]">
                        Geen ontvangers geselecteerd
                      </p>
                    </div>
                    <div aria-hidden="true" className="absolute border border-[#fda29b] inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
                  </div>
                  <p className="font-sans font-normal leading-[20px] text-[#d92d20] text-[14px]">
                    Selecteer ten minste 1 ontvanger.
                  </p>
                </div>
              )}
            </div>

            {/* Onderwerp */}
            <div className="flex flex-col gap-[6px] w-full">
              <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Onderwerp</p>
              <div className="bg-white relative rounded-[6px] w-full">
                <div aria-hidden="true" className="absolute border border-[#d0d5dd] inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
                <div className="flex items-center px-[14px] py-[10px] w-full">
                  <p className="font-sans font-normal leading-[20px] text-[#101828] text-[14px]">{subject}</p>
                </div>
              </div>
            </div>

            {/* Bericht */}
            <div className="flex flex-col gap-[6px] h-[200px] w-full">
              <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Bericht</p>
              <div className="bg-white flex-[1_0_0] relative rounded-[6px] w-full">
                <div className="overflow-clip rounded-[inherit] size-full">
                  <div className="flex items-start px-[14px] py-[12px] size-full">
                    <p className="flex-[1_0_0] font-sans font-normal h-full leading-[20px] text-[#101828] text-[14px] whitespace-pre-wrap">
                      {message}
                    </p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#d0d5dd] inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="h-px w-full bg-[#eaecf0]" />
          <div className="flex items-center justify-end p-[24px] gap-[12px]">
            <Button variant="secondary" label="Annuleren" onClick={onClose} />
            <Button
              variant="primary"
              label="Verzenden"
              leadingIcon={<Send size={16} strokeWidth={2.5} />}
              disabled={recipients.length === 0}
              onClick={onSend}
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Charter Send Email Modal ── */

function CharterSendEmailModal({
  relatieName,
  charterFileName,
  onClose,
  onSend,
}: {
  relatieName: string;
  charterFileName: string;
  onClose: () => void;
  onSend: () => void;
}) {
  const contactEmail = `bevrachting@${relatieName.toLowerCase().replace(/\s+/g, "")}.nl`;
  const [recipients, setRecipients] = useState([contactEmail]);
  const [removedRecipients, setRemovedRecipients] = useState<string[]>([]);
  const [attachments, setAttachments] = useState([charterFileName]);
  const [subject] = useState(`Charter — 1.200 t Grind, Rotterdam → Antwerpen`);
  const [message] = useState(`Geachte ${relatieName},

Bijgevoegd vindt u het chartercontract behorende bij bovengenoemde partij. Wij verzoeken u dit document te ondertekenen en retour te zenden.

Mocht u vragen hebben, neem dan gerust contact met ons op.

Met vriendelijke groet,
Rederij de Jong`);

  const removeRecipient = (email: string) => {
    setRecipients(prev => prev.filter(r => r !== email));
    setRemovedRecipients(prev => [...prev, email]);
  };

  const addRecipient = (email: string) => {
    setRecipients(prev => [...prev, email]);
    setRemovedRecipients(prev => prev.filter(r => r !== email));
  };

  const removeAttachment = (name: string) => {
    setAttachments(prev => prev.filter(a => a !== name));
  };

  const addExtraAttachment = () => {
    const name = `bijlage_${attachments.length}.pdf`;
    setAttachments(prev => [...prev, name]);
    toast.success(`${name} toegevoegd`);
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#0c111d] opacity-70 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[10px] max-w-[600px] w-full max-h-[90vh] overflow-auto shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]">
          {/* Header */}
          <div className="relative shrink-0 w-full">
            <div className="flex gap-[16px] items-start pt-[24px] px-[24px] w-full">
              <div className="flex flex-[1_0_0] flex-col gap-[4px] items-start">
                <p className="font-sans font-bold leading-[26px] text-[#101828] text-[18px] w-full">
                  Charter verzenden
                </p>
                <p className="font-sans font-normal leading-[20px] text-[#475467] text-[14px] w-full">
                  Verstuur het charter naar {relatieName}.
                </p>
              </div>
              <button onClick={onClose} className="absolute flex items-center justify-center p-[8px] right-[12px] rounded-[6px] size-[44px] top-[12px] hover:bg-rdj-bg-primary-hover transition-colors">
                <X size={20} className="text-[#98A2B3]" />
              </button>
            </div>
            <div className="h-[20px] shrink-0 w-full" />
            <div className="h-px w-full bg-[#eaecf0]" />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-[24px] p-[24px] w-full">
            {/* Ontvangers */}
            <div className="flex flex-col gap-[8px] w-full">
              <div className="flex items-center justify-between w-full">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Ontvangers</p>
                {removedRecipients.length > 0 && (
                  <div className="flex gap-[8px] items-center">
                    {removedRecipients.map(email => (
                      <button
                        key={email}
                        onClick={() => addRecipient(email)}
                        className="flex gap-[4px] items-center text-[#1567a4] hover:underline"
                      >
                        <span className="font-sans font-bold text-[12px] leading-[16px]">+ {email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {recipients.length > 0 ? (
                <div className="bg-white relative rounded-[6px] w-full">
                  <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                    <div className="flex gap-[8px] items-center px-[12px] py-[8px] w-full">
                      <div className="flex flex-[1_0_0] flex-wrap gap-[6px] items-center min-w-0">
                        {recipients.map(email => (
                          <div key={email} className="bg-white flex gap-[3px] items-center pl-[9px] pr-[4px] py-[2px] rounded-[4px] shrink-0 relative">
                            <div aria-hidden="true" className="absolute border border-[#d0d5dd] inset-0 pointer-events-none rounded-[4px]" />
                            <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px] whitespace-nowrap">{email}</p>
                            <button onClick={() => removeRecipient(email)} className="flex items-start p-[2px] rounded-[3px] shrink-0">
                              <X size={12} className="text-[#98A2B3]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div aria-hidden="true" className="absolute border border-[#d0d5dd] inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
                </div>
              ) : (
                <div className="flex flex-col gap-[6px] w-full">
                  <div className="bg-white relative rounded-[6px] w-full">
                    <div className="flex items-center px-[12px] py-[8px] w-full">
                      <p className="font-sans font-normal leading-[20px] text-[#667085] text-[14px]">Geen ontvangers geselecteerd</p>
                    </div>
                    <div aria-hidden="true" className="absolute border border-[#fda29b] inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
                  </div>
                  <p className="font-sans font-normal leading-[20px] text-[#d92d20] text-[14px]">Selecteer ten minste 1 ontvanger.</p>
                </div>
              )}
            </div>

            {/* Onderwerp */}
            <div className="flex flex-col gap-[6px] w-full">
              <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Onderwerp</p>
              <div className="bg-white relative rounded-[6px] w-full">
                <div aria-hidden="true" className="absolute border border-[#d0d5dd] inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
                <div className="flex items-center px-[14px] py-[10px] w-full">
                  <p className="font-sans font-normal leading-[20px] text-[#101828] text-[14px]">{subject}</p>
                </div>
              </div>
            </div>

            {/* Bericht */}
            <div className="flex flex-col gap-[6px] h-[180px] w-full">
              <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Bericht</p>
              <div className="bg-white flex-[1_0_0] relative rounded-[6px] w-full">
                <div className="overflow-clip rounded-[inherit] size-full">
                  <div className="flex items-start px-[14px] py-[12px] size-full">
                    <p className="flex-[1_0_0] font-sans font-normal h-full leading-[20px] text-[#101828] text-[14px] whitespace-pre-wrap">
                      {message}
                    </p>
                  </div>
                </div>
                <div aria-hidden="true" className="absolute border border-[#d0d5dd] inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]" />
              </div>
            </div>

            {/* Bijlagen */}
            <div className="flex flex-col gap-[8px] w-full">
              <div className="flex items-center justify-between w-full">
                <p className="font-sans font-bold leading-[20px] text-[#344054] text-[14px]">Bijlagen</p>
                <button onClick={addExtraAttachment} className="flex gap-[4px] items-center text-[#1567a4] hover:underline">
                  <span className="font-sans font-bold text-[13px] leading-[18px]">+ Bijlage toevoegen</span>
                </button>
              </div>
              <div className="flex flex-col gap-[6px]">
                {attachments.map(name => (
                  <div key={name} className="flex items-center gap-[8px] px-[12px] py-[8px] bg-[#F9FAFB] rounded-[6px]">
                    <FileText size={16} strokeWidth={2} className="text-rdj-text-tertiary shrink-0" />
                    <span className="flex-1 font-sans font-normal text-[14px] leading-[20px] text-rdj-text-primary truncate">{name}</span>
                    {name !== charterFileName && (
                      <button onClick={() => removeAttachment(name)} className="shrink-0 p-[2px] hover:bg-rdj-bg-primary-hover rounded-[4px] transition-colors">
                        <X size={14} className="text-[#98A2B3]" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="h-px w-full bg-[#eaecf0]" />
          <div className="flex items-center justify-end p-[24px] gap-[12px]">
            <Button variant="secondary" label="Annuleren" onClick={onClose} />
            <Button
              variant="primary"
              label="Verzenden"
              leadingIcon={<Send size={16} strokeWidth={2.5} />}
              disabled={recipients.length === 0}
              onClick={onSend}
            />
          </div>
        </div>
      </div>
    </>
  );
}
