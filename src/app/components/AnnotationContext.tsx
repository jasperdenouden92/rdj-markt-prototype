import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useLocation } from "react-router";
import { annotations, getAnnotationsForContext, type Annotation } from "../data/annotations";

export type PanelCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface AnnotationContextValue {
  annotationMode: boolean;
  setAnnotationMode: (on: boolean) => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  panelCorner: PanelCorner;
  setPanelCorner: (corner: PanelCorner) => void;
  activeAnnotationId: string | null;
  setActiveAnnotationId: (id: string | null) => void;
  hoveredAnnotationId: string | null;
  setHoveredAnnotationId: (id: string | null) => void;
  pushContext: (context: string) => void;
  popContext: () => void;
  currentContext: string;
  currentAnnotations: Annotation[];
  allAnnotations: Annotation[];
}

const VALID_CORNERS: PanelCorner[] = ["top-left", "top-right", "bottom-left", "bottom-right"];
const LS_KEY = "annotation-panel-corner";

function readCorner(): PanelCorner {
  const stored = localStorage.getItem(LS_KEY);
  return stored && VALID_CORNERS.includes(stored as PanelCorner) ? (stored as PanelCorner) : "top-left";
}

const AnnotationContext = createContext<AnnotationContextValue | null>(null);

export function useAnnotationContext() {
  const ctx = useContext(AnnotationContext);
  if (!ctx) throw new Error("useAnnotationContext must be used within AnnotationProvider");
  return ctx;
}

/** Safe version that returns null outside provider (for optional marker usage) */
export function useAnnotationContextSafe() {
  return useContext(AnnotationContext);
}

export function AnnotationProvider({ children }: { children: ReactNode }) {
  const [annotationMode, setAnnotationMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelCorner, setPanelCornerState] = useState<PanelCorner>(readCorner);
  const setPanelCorner = useCallback((corner: PanelCorner) => {
    setPanelCornerState(corner);
    localStorage.setItem(LS_KEY, corner);
  }, []);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);
  const [contextStack, setContextStack] = useState<string[]>([]);
  const { pathname } = useLocation();

  // Base context is the current route pathname (stripped of leading slash)
  const baseContext = pathname.replace(/^\//, "");

  // Top of the stack, or route-based
  const currentContext = contextStack.length > 0 ? contextStack[contextStack.length - 1] : baseContext;

  const currentAnnotations = useMemo(
    () => getAnnotationsForContext(currentContext),
    [currentContext]
  );

  const pushContext = useCallback((context: string) => {
    setContextStack((prev) => [...prev, context]);
  }, []);

  const popContext = useCallback(() => {
    setContextStack((prev) => prev.slice(0, -1));
  }, []);

  // Clear context stack on route change
  useEffect(() => {
    setContextStack([]);
  }, [pathname]);

  // Keyboard shortcut: Cmd+. to toggle annotation mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        setAnnotationMode((prev) => {
          const next = !prev;
          if (!next) setPanelOpen(false);
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const value = useMemo<AnnotationContextValue>(
    () => ({
      annotationMode,
      setAnnotationMode,
      panelOpen,
      setPanelOpen,
      panelCorner,
      setPanelCorner,
      activeAnnotationId,
      setActiveAnnotationId,
      hoveredAnnotationId,
      setHoveredAnnotationId,
      pushContext,
      popContext,
      currentContext,
      currentAnnotations,
      allAnnotations: annotations,
    }),
    [annotationMode, panelOpen, panelCorner, activeAnnotationId, hoveredAnnotationId, currentContext, currentAnnotations, pushContext, popContext]
  );

  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  );
}
