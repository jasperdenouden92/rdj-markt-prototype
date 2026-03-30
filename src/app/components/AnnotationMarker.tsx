import { type ReactNode } from "react";
import { MessageSquareText } from "lucide-react";
import { useAnnotationContextSafe } from "./AnnotationContext";

type MarkerPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";

interface AnnotationMarkerProps {
  annotationId: string;
  position?: MarkerPosition;
  children: ReactNode;
}

const positionClasses: Record<MarkerPosition, string> = {
  "top-right": "-top-[8px] -right-[8px]",
  "top-left": "-top-[8px] -left-[8px]",
  "bottom-right": "-bottom-[8px] -right-[8px]",
  "bottom-left": "-bottom-[8px] -left-[8px]",
};

export default function AnnotationMarker({
  annotationId,
  position = "top-right",
  children,
}: AnnotationMarkerProps) {
  const ctx = useAnnotationContextSafe();

  // If no context provider, just render children
  if (!ctx) return <>{children}</>;

  const { annotationMode, activeAnnotationId, setActiveAnnotationId, hoveredAnnotationId, setHoveredAnnotationId, setPanelOpen } = ctx;

  if (!annotationMode) return <>{children}</>;

  const isActive = activeAnnotationId === annotationId;
  const isHovered = hoveredAnnotationId === annotationId;
  const showRing = isActive || isHovered;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAnnotationId(annotationId);
    setPanelOpen(true);
  };

  return (
    <div className="relative">
      {/* Focus ring around the wrapped element */}
      {showRing && (
        <div className="absolute inset-[-4px] rounded-[8px] border-2 border-[#1567a4] pointer-events-none z-10 shadow-[0_0_0_4px_rgba(21,103,164,0.15)]" />
      )}
      {children}
      <button
        onClick={handleClick}
        onMouseEnter={() => setHoveredAnnotationId(annotationId)}
        onMouseLeave={() => setHoveredAnnotationId(null)}
        className={`absolute ${positionClasses[position]} z-20 flex items-center justify-center size-[22px] rounded-full cursor-pointer transition-all bg-[#1567a4] text-white hover:scale-110 ${
          isActive ? "scale-110" : ""
        }`}
      >
        <MessageSquareText size={12} />
      </button>
    </div>
  );
}
