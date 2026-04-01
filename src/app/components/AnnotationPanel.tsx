import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { X, Search, MapPin, GripVertical } from "lucide-react";
import { useAnnotationContext, type PanelCorner } from "./AnnotationContext";
import { type Annotation } from "../data/annotations";

const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 640;
const PANEL_INSET = 16;

function cornerPosition(corner: PanelCorner) {
  const isLeft = corner.includes("left");
  const isTop = corner.includes("top");
  return {
    left: isLeft ? PANEL_INSET : window.innerWidth - PANEL_WIDTH - PANEL_INSET,
    top: isTop ? PANEL_INSET : window.innerHeight - PANEL_HEIGHT - PANEL_INSET,
  };
}

function snapToCorner(x: number, y: number): PanelCorner {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const isLeft = x + PANEL_WIDTH / 2 < cx;
  const isTop = y + PANEL_HEIGHT / 2 < cy;
  if (isLeft && isTop) return "top-left";
  if (!isLeft && isTop) return "top-right";
  if (isLeft && !isTop) return "bottom-left";
  return "bottom-right";
}

export default function AnnotationPanel() {
  const {
    panelOpen,
    setPanelOpen,
    panelCorner,
    setPanelCorner,
    activeAnnotationId,
    setActiveAnnotationId,
    hoveredAnnotationId,
    setHoveredAnnotationId,
    currentAnnotations,
    allAnnotations,
    annotationMode,
    setAnnotationMode,
  } = useAnnotationContext();

  const [filter, setFilter] = useState<"page" | "all">("page");
  const [search, setSearch] = useState("");
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Drag state
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, panelX: 0, panelY: 0 });

  // Auto-scroll to active annotation
  useEffect(() => {
    if (activeAnnotationId && cardRefs.current[activeAnnotationId]) {
      cardRefs.current[activeAnnotationId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeAnnotationId]);

  // Reset filter when panel opens
  useEffect(() => {
    if (panelOpen) {
      setFilter("page");
      setSearch("");
    }
  }, [panelOpen]);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const pos = cornerPosition(panelCorner);
      setDragging(true);
      dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, panelX: pos.left, panelY: pos.top };
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    },
    [panelCorner]
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;
      setDragPos({
        x: Math.max(0, Math.min(window.innerWidth - PANEL_WIDTH, dragStart.current.panelX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - PANEL_HEIGHT, dragStart.current.panelY + dy)),
      });
    };

    const handleUp = () => {
      setDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      if (dragPos) {
        setPanelCorner(snapToCorner(dragPos.x, dragPos.y));
      }
      setDragPos(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, dragPos, setPanelCorner]);

  if (!panelOpen || !annotationMode) return null;

  const baseList = filter === "page" ? currentAnnotations : allAnnotations;
  const searchLower = search.toLowerCase();
  const filteredAnnotations = search
    ? baseList.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.body.toLowerCase().includes(searchLower)
      )
    : baseList;

  const handleClose = () => {
    setPanelOpen(false);
    setAnnotationMode(false);
    setActiveAnnotationId(null);
  };

  const resting = cornerPosition(panelCorner);
  const currentX = dragging && dragPos ? dragPos.x : resting.left;
  const currentY = dragging && dragPos ? dragPos.y : resting.top;
  const animationClass = dragging ? "" : "transition-[left,top] duration-200 ease-out";

  return (
    <div
      style={{
        left: `${currentX}px`,
        top: `${currentY}px`,
        width: `${PANEL_WIDTH}px`,
        height: `${PANEL_HEIGHT}px`,
      }}
      className={`fixed z-[9999] ${animationClass}`}
    >
      <div className="dark h-full">
        <div className="h-full flex flex-col bg-[#1d2939] rounded-[16px] border border-[#475467] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.18),0px_8px_8px_-4px_rgba(16,24,40,0.08)] overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#475467] px-[20px] py-[14px] shrink-0">
            <div className="flex items-center justify-between">
              {/* Drag handle + title */}
              <div className="flex items-center gap-[8px]">
                <div
                  onMouseDown={handleDragStart}
                  className="p-[4px] -ml-[4px] rounded-[6px] hover:bg-[#344054] cursor-grab active:cursor-grabbing transition-colors"
                >
                  <GripVertical size={16} className="text-[#667085]" />
                </div>
                <p className="font-sans font-bold leading-[28px] text-white text-[18px]">
                  Annotaties
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-[8px] rounded-[8px] hover:bg-[#344054] transition-colors cursor-pointer"
              >
                <X size={20} className="text-[#98a2b3]" />
              </button>
            </div>

            {/* Filter tabs */}
            <div className="mt-[12px] flex gap-[4px]">
              <button
                onClick={() => setFilter("page")}
                className={`px-[12px] py-[6px] rounded-[6px] font-sans font-bold text-[13px] leading-[18px] transition-colors cursor-pointer ${
                  filter === "page"
                    ? "bg-[#344054] text-white"
                    : "text-[#98a2b3] hover:text-white"
                }`}
              >
                Deze pagina
                <span className={`ml-[6px] text-[11px] font-medium ${filter === "page" ? "text-[#98a2b3]" : "text-[#667085]"}`}>
                  {currentAnnotations.length}
                </span>
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-[12px] py-[6px] rounded-[6px] font-sans font-bold text-[13px] leading-[18px] transition-colors cursor-pointer ${
                  filter === "all"
                    ? "bg-[#344054] text-white"
                    : "text-[#98a2b3] hover:text-white"
                }`}
              >
                Alles
                <span className={`ml-[6px] text-[11px] font-medium ${filter === "all" ? "text-[#98a2b3]" : "text-[#667085]"}`}>
                  {allAnnotations.length}
                </span>
              </button>
            </div>

            {/* Search */}
            <div className="mt-[12px] relative">
              <Search size={16} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Zoeken..."
                className="w-full bg-[#344054] border border-[#475467] rounded-[6px] pl-[32px] pr-[12px] py-[8px] text-[13px] leading-[18px] text-white placeholder-[#667085] font-sans outline-none focus:border-[#1567a4] transition-colors"
              />
            </div>
          </div>

          {/* Annotation list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredAnnotations.length === 0 ? (
              <div className="px-[24px] py-[40px] text-center">
                <p className="font-sans text-[14px] text-[#667085]">
                  {search ? "Geen resultaten gevonden" : "Geen annotaties op deze pagina"}
                </p>
              </div>
            ) : (
              <div className="py-[8px]">
                {filteredAnnotations.map((annotation) => {
                  const hasElement = !!annotation.elementId;
                  return (
                    <AnnotationCard
                      key={annotation.id}
                      annotation={annotation}
                      isActive={hasElement && activeAnnotationId === annotation.id}
                      isHovered={hasElement && hoveredAnnotationId === annotation.id}
                      onClick={hasElement ? () => setActiveAnnotationId(annotation.id === activeAnnotationId ? null : annotation.id) : undefined}
                      onHover={hasElement ? (hovered) => setHoveredAnnotationId(hovered ? annotation.id : null) : undefined}
                      ref={(el) => { cardRefs.current[annotation.id] = el; }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

import { Link } from "react-router";

/** Map route segments to readable labels */
const segmentLabels: Record<string, string> = {
  markt: "Markt",
  bevrachting: "Eigen aanbod",
  inbox: "Markt aanbod",
  onderhandelingen: "Onderhandelingen",
  ladingen: "Ladingen",
  vaartuigen: "Vaartuigen",
  relaties: "Relaties",
  database: "Database",
  crm: "CRM",
  relaties: "Relaties",
  relatie: "Relatie",
  taken: "Taken",
  deals: "Deals",
  deal: "Deal",
  vloot: "Vloot",
  lading: "Lading",
  partijen: "Partijen",
  partij: "Partij",
  subpartijen: "Subpartijen",
  subpartij: "Subpartij",
};

const contextLabels: Record<string, string> = {
  "dialog:conversation": "Gespreksdialoog",
  "panel:onderhandeling": "Onderhandeling",
  global: "Globaal",
};

function targetToBreadcrumbs(target: string): { label: string; href: string }[] {
  if (contextLabels[target]) {
    return [{ label: contextLabels[target], href: "#" }];
  }

  const segments = target.replace(/^\//, "").split("/");
  const crumbs: { label: string; href: string }[] = [];
  let path = "";

  for (const seg of segments) {
    if (seg.startsWith(":")) continue; // skip dynamic params
    path += `/${seg}`;
    const label = segmentLabels[seg] || seg;
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

interface AnnotationCardProps {
  annotation: Annotation;
  isActive: boolean;
  isHovered: boolean;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
}

const AnnotationCard = forwardRef<HTMLDivElement, AnnotationCardProps>(
  function AnnotationCard({ annotation, isActive, isHovered, onClick, onHover }, ref) {
    const showRing = isActive || isHovered;
    const breadcrumbs = targetToBreadcrumbs(annotation.target);

    return (
      <div
        ref={ref}
        onClick={onClick}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
        className={`mx-[8px] px-[16px] py-[12px] rounded-[8px] transition-all ${
          onClick ? "cursor-pointer" : ""
        } ${
          showRing
            ? "ring-2 ring-[#1567a4] shadow-[0_0_0_4px_rgba(21,103,164,0.15)] bg-[#344054]"
            : onClick ? "hover:bg-[#344054]/50" : ""
        }`}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-[4px] mb-[6px] flex-wrap">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-[4px]">
                {i > 0 && <span className="text-[#475467] text-[11px]">/</span>}
                {isLast && crumb.href !== "#" ? (
                  <Link
                    to={crumb.href}
                    onClick={(e) => e.stopPropagation()}
                    className="font-sans text-[11px] leading-[16px] text-[#667085] hover:text-[#98a2b3] underline decoration-[#475467] underline-offset-2 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-sans text-[11px] leading-[16px] text-[#475467]">
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </div>

        <div className="flex items-start gap-[8px]">
          <p className="font-sans font-bold text-[14px] leading-[20px] text-white flex-1 min-w-0">
            {annotation.title}
          </p>
          {annotation.elementId && (
            <MapPin size={14} className="text-[#667085] shrink-0 mt-[3px]" />
          )}
        </div>

        <p className="font-sans text-[13px] leading-[18px] text-[#98a2b3] mt-[4px]">
          {annotation.body}
        </p>

        <div className="flex items-center gap-[8px] mt-[8px]">
          <p className="font-sans text-[12px] leading-[16px] text-[#667085]">
            {annotation.author}
          </p>
          <span className="text-[#475467]">&middot;</span>
          <p className="font-sans text-[12px] leading-[16px] text-[#667085]">
            {new Date(annotation.date).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    );
  }
);
