export interface Annotation {
  /** UUID — generate with crypto.randomUUID() */
  id: string;
  /** Route pattern ("markt/bevrachting/ladingen") or "dialog:conversation" / "panel:onderhandeling" / "global" */
  target: string;
  /** Optional: when set, an AnnotationMarker with matching annotationId exists in JSX */
  elementId?: string;
  title: string;
  body: string;
  author: string;
  date: string;
}

/**
 * Match a pathname against a route pattern.
 * Supports :param wildcards (e.g., "markt/bevrachting/lading/:id" matches "/markt/bevrachting/lading/cargo-001").
 */
function matchRoute(pathname: string, pattern: string): boolean {
  const pathSegments = pathname.replace(/^\//, "").split("/");
  const patternSegments = pattern.replace(/^\//, "").split("/");

  if (pathSegments.length !== patternSegments.length) return false;

  return patternSegments.every(
    (seg, i) => seg.startsWith(":") || seg === pathSegments[i]
  );
}

export function getAnnotationsForRoute(pathname: string): Annotation[] {
  return annotations.filter(
    (a) => a.target === "global" || matchRoute(pathname, a.target)
  );
}

export function getAnnotationsForContext(context: string): Annotation[] {
  if (context.startsWith("dialog:") || context.startsWith("panel:")) {
    return annotations.filter(
      (a) => a.target === "global" || a.target === context
    );
  }
  return getAnnotationsForRoute(context);
}

export function getAnnotationById(id: string): Annotation | undefined {
  return annotations.find((a) => a.id === id);
}

// ---------------------------------------------------------------------------
// Annotations — add entries here
// ---------------------------------------------------------------------------

export const annotations: Annotation[] = [
  {
    id: "8ebcb7e9-732f-4a06-9884-7b13561af95d",
    target: "markt/inbox/ladingen",
    title: "Herhaald aanbod wordt opnieuw beoordeeld",
    body: "Aanbod dat nog een keer wordt aangeboden (zowel lading als vaartuigen) door een relatie, worden opnieuw getoond onder 'Te beoordelen'. De prioriteit status wordt weggehaald zodat er opnieuw een beoordeling plaats moet vinden. Zo zorgen we ervoor dat er altijd actueel gekeken wordt naar markt aanbod.",
    author: "Elwin",
    date: "2026-03-30",
  },
  {
    id: "7f82648d-b174-4030-9eb8-9309efaf4ccd",
    target: "markt/bevrachting/ladingen",
    elementId: "first-intake-cargo",
    title: "Subpartijen opsplitsen op werklijst",
    body: "Subpartijen die op de markt gezet zijn kunnen verder opgesplitst worden zodra ze op de werklijst gezet worden. De opgesplitste delen noemen we vervolgens 'Lots' om het onderscheid duidelijk te maken.",
    author: "Elwin",
    date: "2026-03-30",
  },
  {
    id: "ea14da61-d6cc-4f2f-be4d-f7e1e852905e",
    target: "markt/bevrachting/ladingen",
    elementId: "werklijst-email-button",
    title: "Standaard ontvangers bij werklijst uitsturen",
    body: "Bij het uitsturen van de werklijst worden de standaard ontvangers bepaald op basis van het type aanbod. Stuur je alleen ladingen uit, dan gaat de werklijst naar de standaard scheepseigenaren. Stuur je alleen vaartuigen uit, dan naar de standaard lading-eigenaren. Bij een gecombineerde werklijst (ladingen én vaartuigen) worden beide groepen toegevoegd. Of een relatie als standaard ontvanger fungeert, stel je in via het relatiescherm bij het toewijzen van de rol.",
    author: "Jasper",
    date: "2026-04-14",
  },
];
