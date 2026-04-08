/**
 * Domain-specific hooks that fetch from the API and transform
 * into the shapes each page expects.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import * as api from "./api";
import { formatDate } from "../utils/formatDate";
import type {
  LadingMarkt, VaartuigMarkt, VaartuigEigen,
  LadingSoort, LadingSubsoort, Haven, Bron, Gebruiker,
  Relatie, Bijzonderheid, ContactPersoon,
  LadingEigen, Partij, Subpartij, Ex,
  Onderhandeling, Bod,
} from "./api";

// ── Lookup maps (cached per fetch) ──
interface LookupMaps {
  relaties: Map<string, Relatie>;
  havens: Map<string, Haven>;
  bronnen: Map<string, Bron>;
  gebruikers: Map<string, Gebruiker>;
  ladingSoorten: Map<string, LadingSoort>;
  ladingSubsoorten: Map<string, LadingSubsoort>;
  bijzonderheden: Map<string, Bijzonderheid>;
  contactPersonen: Map<string, ContactPersoon>;
  partijen: Map<string, Partij>;
  subpartijen: Map<string, Subpartij>;
  exen: Map<string, Ex>;
}

async function fetchLookups(): Promise<LookupMaps> {
  const [relaties, havens, bronnen, gebruikers, ladingSoorten, ladingSubsoorten, bijzonderheden, contactPersonen, partijen, subpartijen, exen] = await Promise.all([
    api.list<Relatie>("relatie"),
    api.list<Haven>("haven"),
    api.list<Bron>("bron"),
    api.list<Gebruiker>("gebruiker"),
    api.list<LadingSoort>("lading_soort"),
    api.list<LadingSubsoort>("lading_subsoort"),
    api.list<Bijzonderheid>("bijzonderheid"),
    api.list<ContactPersoon>("contact_persoon"),
    api.list<Partij>("partij"),
    api.list<Subpartij>("subpartij"),
    api.list<Ex>("ex"),
  ]);

  const toMap = <T extends { id: string }>(arr: T[]) => new Map(arr.map(i => [i.id, i]));
  return {
    relaties: toMap(relaties),
    havens: toMap(havens),
    bronnen: toMap(bronnen),
    gebruikers: toMap(gebruikers),
    ladingSoorten: toMap(ladingSoorten),
    ladingSubsoorten: toMap(ladingSubsoorten),
    bijzonderheden: toMap(bijzonderheden),
    contactPersonen: toMap(contactPersonen),
    partijen: toMap(partijen),
    subpartijen: toMap(subpartijen),
    exen: toMap(exen),
  };
}

// Cache lookups so multiple hooks don't refetch
let lookupCache: { maps: LookupMaps; timestamp: number } | null = null;
const LOOKUP_TTL = 60_000;

async function getLookups(): Promise<LookupMaps> {
  if (lookupCache && Date.now() - lookupCache.timestamp < LOOKUP_TTL) {
    return lookupCache.maps;
  }
  const maps = await fetchLookups();
  lookupCache = { maps, timestamp: Date.now() };
  return maps;
}

export function invalidateLookups() {
  lookupCache = null;
}

function getInitials(naam: string): string {
  return naam.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function formatTonnage(t: number | { min: number; max: number }): string {
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}.000` : `${n}`;
  if (typeof t === "object") return `${fmt(t.min)}–${fmt(t.max)}`;
  return fmt(t);
}


// ── INBOX LADINGEN ──
export interface InboxLadingRow {
  id: string;
  title: string;
  tonnage: string;
  relation: string;
  relationLink: string;
  loadLocation: string;
  loadDate: string;
  unloadLocation: string;
  unloadDate: string;
  source: string;
  sourceDate: string;
  matches: number;
  matchType: 'eigen' | 'interessant' | 'none';
  onderhandelingen: number;
  owner: string;
  ownerInitials?: string;
  priority: number;
}

export function useInboxLadingen() {
  const [data, setData] = useState<InboxLadingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, maps] = await Promise.all([
        api.list<LadingMarkt & { status?: string; laaddatum?: string; losdatum?: string }>("lading_markt"),
        getLookups(),
      ]);

      const inboxItems = items.filter(i => (i as any).status === "inbox");

      const rows: InboxLadingRow[] = inboxItems.map(item => {
        const soort = maps.ladingSoorten.get(item.ladingSoortId);
        const subsoort = maps.ladingSubsoorten.get(item.subsoortId);
        const relatie = maps.relaties.get(item.relatieId);
        const laadlocatie = maps.havens.get(item.laadlocatieId);
        const loslocatie = maps.havens.get(item.loslocatieId);
        const bron = maps.bronnen.get(item.bronId);
        const eigenaar = item.eigenaarId ? maps.gebruikers.get(item.eigenaarId) : null;

        // Find first contact person for relation
        const contactPersoon = relatie?.contactPersoonIds?.[0]
          ? maps.contactPersonen.get(relatie.contactPersoonIds[0])
          : null;

        const soortLabel = subsoort
          ? `${soort?.naam || ""} (${subsoort.naam})`
          : soort?.naam || "";
        const title = item.opmerking || soortLabel;
        const tonnage = `${formatTonnage(item.tonnage)} ton`;

        return {
          id: item.id,
          title,
          tonnage,
          relation: relatie?.naam || "",
          relationLink: contactPersoon?.naam || "",
          loadLocation: laadlocatie?.naam || "",
          loadDate: (item as any).laaddatum ? formatDate((item as any).laaddatum) : "",
          unloadLocation: loslocatie?.naam || "Af te stemmen",
          unloadDate: (item as any).losdatum ? formatDate((item as any).losdatum) : "",
          source: bron?.titel || "",
          sourceDate: bron?.datum ? formatDate(bron.datum) : "",
          matches: (item as any).matches ?? 0,
          matchType: (item as any).matchType ?? 'none',
          onderhandelingen: (item as any).onderhandelingen ?? 0,
          owner: eigenaar?.naam || "",
          ownerInitials: eigenaar ? getInitials(eigenaar.naam) : undefined,
          priority: item.prioriteit,
        };
      });

      if (mountedRef.current) setData(rows);
    } catch (err: any) {
      console.error("useInboxLadingen error:", err);
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ── INBOX VAARTUIGEN ──
export interface InboxVaartuigRow {
  id: string;
  name: string;
  type: string;
  eni?: string;
  relation: string;
  relationContact: string;
  location: string;
  locationDetail: string;
  availableFrom: string;
  cargoTypes: string[];
  tonnage: string;
  capacity: string;
  source: string;
  sourceDate: string;
  matches: number;
  matchType: 'eigen' | 'interessant' | 'none';
  onderhandelingen: number;
  owner: string;
  ownerInitials?: string;
  priority: number;
}

export function useInboxVaartuigen() {
  const [data, setData] = useState<InboxVaartuigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, maps] = await Promise.all([
        api.list<VaartuigMarkt>("vaartuig_markt"),
        getLookups(),
      ]);

      const rows: InboxVaartuigRow[] = items.map(item => {
        const relatie = maps.relaties.get(item.relatieId);
        const locatie = maps.havens.get(item.huidigeLocatieId);
        const bron = maps.bronnen.get(item.bronId);
        const eigenaar = item.eigenaarId ? maps.gebruikers.get(item.eigenaarId) : null;
        const contactPersoon = relatie?.contactPersoonIds?.[0]
          ? maps.contactPersonen.get(relatie.contactPersoonIds[0])
          : null;
        const bijzonderheden = item.bijzonderheidIds
          .map(id => maps.bijzonderheden.get(id))
          .filter(Boolean)
          .map(b => b!.naam.substring(0, 3).toUpperCase());

        return {
          id: item.id,
          name: item.naam,
          type: "Motorschip",
          eni: item.eni,
          relation: relatie?.naam || "",
          relationContact: contactPersoon?.naam || "",
          location: locatie?.naam || "",
          locationDetail: "",
          availableFrom: item.beschikbaarVanaf ? formatDate(item.beschikbaarVanaf) : "-",
          cargoTypes: bijzonderheden.length > 0 ? bijzonderheden : ["KS", "LR", "GMP"],
          tonnage: `${item.groottonnage.toLocaleString("nl-NL")} mt`,
          capacity: `${item.inhoud.toLocaleString("nl-NL")} m³`,
          source: bron?.titel || "",
          sourceDate: bron?.datum ? formatDate(bron.datum) : "",
          matches: (item as any).matches ?? 0,
          matchType: (item as any).matchType ?? 'none',
          onderhandelingen: (item as any).onderhandelingen ?? 0,
          owner: eigenaar?.naam || "",
          ownerInitials: eigenaar ? getInitials(eigenaar.naam) : undefined,
          priority: item.prioriteit,
        };
      });

      if (mountedRef.current) setData(rows);
    } catch (err: any) {
      console.error("useInboxVaartuigen error:", err);
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ── BEVRACHTING (kanban + table) ──
export interface BevrachtingCargo {
  id: string;
  title: string;
  exType?: string;
  code: string;
  company?: string;
  status: "intake" | "werklijst" | "markt" | "gesloten";
  cargo: string;
  weight: string;
  from: string;
  to: string;
  fromDate: string;
  toDate: string;
  urgent?: boolean;
  matches?: number;
  bids?: number;
  priceInfo?: string;
  conditions?: any;
  splitIndex?: number;
  splitOriginId?: string;
  splitColorIndex?: number;
  splitTotalWeight?: string;
}

export interface BevrachtingVessel {
  id: string;
  title: string;
  code: string;
  status: "intake" | "werklijst" | "markt" | "gesloten";
  vesselType: string;
  weight: string;
  from: string;
  to: string;
  fromDate: string;
  toDate: string;
  location?: string;
  locationDate?: string;
  matches?: number;
}

export function useBevrachtingData() {
  const [cargos, setCargos] = useState<BevrachtingCargo[]>([]);
  const [vessels, setVessels] = useState<BevrachtingVessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eigenLadingen, vaartuigenMarkt, vaartuigenEigen, maps] = await Promise.all([
        api.list<LadingEigen & { status?: string }>("lading_eigen"),
        api.list<VaartuigMarkt>("vaartuig_markt"),
        api.list<VaartuigEigen>("vaartuig_eigen"),
        getLookups(),
      ]);

      // Group by subpartijId to detect lots sharing the same subpartij
      const subpartijCounts = new Map<string, number>();
      const subpartijColorIndex = new Map<string, number>();
      let colorIdx = 0;
      for (const item of eigenLadingen) {
        subpartijCounts.set(item.subpartijId, (subpartijCounts.get(item.subpartijId) || 0) + 1);
      }
      // Assign color indices to subpartijen that have multiple lots
      for (const [subId, count] of subpartijCounts) {
        if (count > 1) {
          subpartijColorIndex.set(subId, colorIdx++);
        }
      }
      // Track per-subpartij split index
      const subpartijSplitIdx = new Map<string, number>();

      // Transform eigen ladingen to bevrachting format
      const cargoRows: BevrachtingCargo[] = eigenLadingen.map(item => {
        const partij = maps.partijen.get(item.partijId);
        const subpartij = maps.subpartijen.get(item.subpartijId);
        const relatie = maps.relaties.get(item.relatieId);
        const soort = partij ? maps.ladingSoorten.get(partij.ladingSoortId) : null;
        const subsoort = partij ? maps.ladingSubsoorten.get(partij.subsoortId) : null;
        const ex = partij?.exId ? maps.exen.get(partij.exId) : null;
        const laadlocatie = partij ? maps.havens.get(partij.laadlocatieId) : null;
        const loslocatie = subpartij ? maps.havens.get(subpartij.loslocatieId) : null;

        const soortLabel = subsoort ? `${soort?.naam || ""} (${subsoort.naam})` : soort?.naam || "";
        const cargoStr = `${formatTonnage(item.tonnage)} ton ${soortLabel}`;

        // Derive status from data
        const status: "intake" | "werklijst" | "markt" | "gesloten" =
          (item as any).status || "intake";

        // Lot numbering for subpartijen with multiple lots
        const lotCount = subpartijCounts.get(item.subpartijId) || 1;
        const currentSplitIdx = (subpartijSplitIdx.get(item.subpartijId) || 0) + 1;
        subpartijSplitIdx.set(item.subpartijId, currentSplitIdx);
        const hasMultipleLots = lotCount > 1;

        return {
          id: item.id,
          title: ex ? (ex.type === "opslag" ? ex.naam : `m/v ${ex.naam}`) : subpartij?.naam || item.id,
          exType: ex?.type,
          code: subpartij?.naam || "",
          company: relatie?.naam,
          status,
          cargo: cargoStr,
          weight: cargoStr,
          from: laadlocatie?.naam || "",
          to: loslocatie?.naam || "",
          fromDate: formatDate(subpartij?.laaddatum),
          toDate: subpartij?.losdatum ? formatDate(subpartij.losdatum) : "",
          matches: 0,
          bids: 0,
          ...(hasMultipleLots ? {
            splitIndex: currentSplitIdx,
            splitColorIndex: subpartijColorIndex.get(item.subpartijId) ?? 0,
          } : {}),
        };
      });

      // Transform vaartuigen to bevrachting vessel format
      const vesselRows: BevrachtingVessel[] = vaartuigenEigen.map(item => {
        const locatie = maps.havens.get(item.huidigeLocatieId);
        const status: "intake" | "werklijst" | "markt" | "gesloten" =
          (item as any).status || "intake";

        return {
          id: item.id,
          title: item.naam,
          code: `${item.groottonnage.toLocaleString("nl-NL")} ton`,
          status,
          vesselType: "Motorschip",
          weight: `${item.groottonnage.toLocaleString("nl-NL")} ton`,
          from: locatie?.naam || "",
          to: "",
          fromDate: item.beschikbaarVanaf ? `Sinds ${formatDate(item.beschikbaarVanaf)}` : "",
          toDate: "",
          location: locatie?.naam,
          locationDate: item.beschikbaarVanaf ? `Sinds ${formatDate(item.beschikbaarVanaf)}` : "",
          matches: 0,
        };
      });

      if (mountedRef.current) {
        setCargos(cargoRows);
        setVessels(vesselRows);
      }
    } catch (err: any) {
      console.error("useBevrachtingData error:", err);
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [fetch]);

  return { cargos, setCargos, vessels, setVessels, loading, error, refetch: fetch };
}

// ── Mutation helpers ──
export async function updateLadingMarktPriority(id: string, prioriteit: number) {
  return api.patch("lading_markt", id, { prioriteit });
}

export async function updateLadingMarktStatus(id: string, status: string) {
  return api.patch("lading_markt", id, { status });
}

export async function updateVaartuigMarktPriority(id: string, prioriteit: number) {
  return api.patch("vaartuig_markt", id, { prioriteit });
}

export async function deleteLadingMarkt(id: string) {
  return api.remove("lading_markt", id);
}

export async function deleteVaartuigMarkt(id: string) {
  return api.remove("vaartuig_markt", id);
}