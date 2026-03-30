import { MessageSquareText } from "lucide-react";
import { useAnnotationContext } from "./AnnotationContext";

export default function AnnotationButton() {
  const { annotationMode, setAnnotationMode, panelOpen, setPanelOpen, currentAnnotations, panelCorner } = useAnnotationContext();
  const count = currentAnnotations.length;

  const handleClick = () => {
    if (!annotationMode) {
      setAnnotationMode(true);
      setPanelOpen(true);
    } else {
      setPanelOpen(!panelOpen);
    }
  };

  const horizontalClass = panelCorner.includes("left") ? "left-[24px]" : "right-[24px]";
  const verticalClass = panelCorner.includes("bottom") ? "bottom-[24px]" : "top-[24px]";

  return (
    <div className={`fixed ${horizontalClass} ${verticalClass} z-[9999] transition-all duration-200`}>
      <div className="dark">
        <button
          onClick={handleClick}
          className={`relative flex items-center justify-center size-[48px] rounded-full shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] cursor-pointer transition-colors ${
            annotationMode
              ? "bg-[#1567a4] text-white"
              : "bg-[#1d2939] text-[#98a2b3] hover:text-white"
          }`}
        >
          <MessageSquareText size={20} />

          {/* Count badge */}
          {count > 0 && (
            <span className="absolute -top-[4px] -right-[4px] flex items-center justify-center min-w-[20px] h-[20px] px-[5px] rounded-full bg-[#1567a4] text-white text-[11px] font-sans font-bold leading-none border-2 border-[#1d2939]">
              {count}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
