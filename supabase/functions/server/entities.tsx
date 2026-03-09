/**
 * Entity definitions for Rederij de Jong market module.
 * Each entity has a prefix used as KV key namespace.
 */

export const ENTITY_PREFIXES: Record<string, string> = {
  relatie: "relatie:",
  contact_persoon: "contact_persoon:",
  lading_soort: "lading_soort:",
  lading_subsoort: "lading_subsoort:",
  bijzonderheid: "bijzonderheid:",
  haven: "haven:",
  bron: "bron:",
  gebruiker: "gebruiker:",
  lading_markt: "lading_markt:",
  partij: "partij:",
  ex: "ex:",
  subpartij: "subpartij:",
  lading_eigen: "lading_eigen:",
  vaartuig_markt: "vaartuig_markt:",
  vaartuig_eigen: "vaartuig_eigen:",
  onderhandeling: "onderhandeling:",
  bod: "bod:",
};

export const VALID_ENTITIES = Object.keys(ENTITY_PREFIXES);

export function generateId(): string {
  return crypto.randomUUID();
}
