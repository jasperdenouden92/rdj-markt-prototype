/**
 * Hooks for fetching fully resolved detail data for each of the 4 entity variants.
 * Used by the reusable sidebar components.
 */

import { useState, useEffect, useRef } from "react";
import * as api from "./api";
import { formatDate } from "../utils/formatDate";
import { getMarktToewijzing } from "./markt-toewijzing-store";
import type {
  LadingMarkt, LadingEigen, VaartuigMarkt, VaartuigEigen,
  LadingSoort, LadingSubsoort, Haven, Bron, Gebruiker,
  Relatie, Bijzonderheid, ContactPersoon, Partij, Subpartij, Ex,
} from "./api";

// ── Shared lookup cache ──
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

let lookupCache: { maps: LookupMaps; timestamp: number } | null = null;
const LOOKUP_TTL = 60_000;

async function getLookups(): Promise<LookupMaps> {
  if (lookupCache && Date.now() - lookupCache.timestamp < LOOKUP_TTL) {
    return lookupCache.maps;
  }
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
  const maps: LookupMaps = {
    relaties: toMap(relaties), havens: toMap(havens), bronnen: toMap(bronnen),
    gebruikers: toMap(gebruikers), ladingSoorten: toMap(ladingSoorten),
    ladingSubsoorten: toMap(ladingSubsoorten), bijzonderheden: toMap(bijzonderheden),
    contactPersonen: toMap(contactPersonen), partijen: toMap(partijen),
    subpartijen: toMap(subpartijen), exen: toMap(exen),
  };
  lookupCache = { maps, timestamp: Date.now() };
  return maps;
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("nl-NL");
}

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  return `€${n.toFixed(2).replace(".", ",")} per ton`;
}

function fmtHours(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${n} uur`;
}

function fmtCurrency(n: number | null | undefined): string {
  if (n == null || n === 0) return "—";
  return `€${n.toFixed(2).replace(".", ",")} per uur`;
}

function fmtLiggeld(v: string | number | null | undefined): string {
  if (v == null || v === 0) return "—";
  if (typeof v === "string" && v.toUpperCase() === "NLW") return "Nederlands Wettelijk";
  if (typeof v === "number") return fmtCurrency(v);
  return v;
}

// ── Resolved detail shapes ──

export interface ResolvedLadingMarkt {
  raw: LadingMarkt & { status?: string; laaddatum?: string; losdatum?: string };
  tonnage: string;
  lading: string;
  subsoort: string;
  soortelijkGewicht: string;
  inhoud: string;
  bijzonderheden: string[];
  laadlocatie: string;
  laadlocatieCity: string;
  laaddatum: string;
  loslocatie: string;
  loslocatieCity: string;
  losdatum: string;
  bron: string;
  bronDatum: string;
  relatieId: string;
  relatie: string;
  contactpersoon: string;
  eigenaar: string;
  eigenaarInitials: string;
  eigenaarFoto: string;
  prioriteit: number;
  // Condities inkoop
  inkoopPrijs: string;
  inkoopLaadtijd: string;
  inkoopLiggeldLaden: string;
  inkoopLostijd: string;
  inkoopLiggeldLossen: string;
  // Condities zoekcriteria (from related lading_eigen if any)
  zoekcriteriaPrijs: string;
  zoekcriteriaLaadtijd: string;
  zoekcriteriaLiggeldLaden: string;
  zoekcriteriaLostijd: string;
  zoekcriteriaLiggeldLossen: string;
  // ID of related lading_eigen (for patching zoekcriteria)
  eigenLadingId: string | null;
  // Raw numeric values for percentage diff
  rawInkoopPrijs: number | null;
  rawInkoopLaadtijd: number | null;
  rawInkoopLiggeldLaden: number;
  rawInkoopLostijd: number | null;
  rawInkoopLiggeldLossen: number;
  rawZoekcriteriaPrijs: number | null;
  rawZoekcriteriaLaadtijd: number | null;
  rawZoekcriteriaLiggeldLaden: number;
  rawZoekcriteriaLostijd: number | null;
  rawZoekcriteriaLiggeldLossen: number;
}

export interface ResolvedLadingEigen {
  raw: LadingEigen;
  partij: string;
  subpartij: string;
  tonnage: string;
  ex: string;
  exType: string;
  lading: string;
  subsoort: string;
  soortelijkGewicht: string;
  inhoud: string;
  bijzonderheden: string[];
  laadlocatie: string;
  laadlocatieCity: string;
  laaddatum: string;
  loslocatie: string;
  loslocatieCity: string;
  losdatum: string;
  relatieId: string;
  opdrachtgever: string;
  opdrachtgeverContact: string;
  eigenaar: string;
  eigenaarInitials: string;
  eigenaarFoto: string;
  deadline: string;
  // Condities eigen
  eigenPrijs: string;
  eigenLaadtijd: string;
  eigenLiggeldLaden: string;
  eigenLostijd: string;
  eigenLiggeldLossen: string;
  // Condities markt (from related lading_markt if any, otherwise blank)
  marktPrijs: string;
  marktLaadtijd: string;
  marktLiggeldLaden: string;
  marktLostijd: string;
  marktLiggeldLossen: string;
  // ID of related lading_markt (for patching zoekcriteria)
  marktLadingId: string | null;
  // Raw numeric values for percentage diff calculation
  rawEigenPrijs: number | null;
  rawEigenLaadtijd: number | null;
  rawEigenLiggeldLaden: string | number | null;
  rawEigenLostijd: number | null;
  rawEigenLiggeldLossen: string | number | null;
  rawMarktPrijs: number | null;
  rawMarktLaadtijd: number | null;
  rawMarktLiggeldLaden: string | number | null;
  rawMarktLostijd: number | null;
  rawMarktLiggeldLossen: string | number | null;
}

export interface ResolvedVaartuigMarkt {
  raw: VaartuigMarkt;
  naam: string;
  beschikbaarVanaf: string;
  huidigeLocatie: string;
  eni: string;
  vlag: string;
  meetbrief: string;
  groottonnage: string;
  inhoud: string;
  lengte: string;
  breedte: string;
  diepgang: string;
  kruiphoogte: string;
  bijzonderheden: string[];
  bron: string;
  bronDatum: string;
  relatieId: string;
  relatie: string;
  contactpersoon: string;
  eigenaar: string;
  eigenaarInitials: string;
  eigenaarFoto: string;
  prioriteit: number;
  opmerkingMarkt: string;
}

export interface ResolvedVaartuigEigen {
  raw: VaartuigEigen;
  naam: string;
  beschikbaarVanaf: string;
  huidigeLocatie: string;
  eni: string;
  vlag: string;
  meetbrief: string;
  groottonnage: string;
  inhoud: string;
  lengte: string;
  breedte: string;
  diepgang: string;
  kruiphoogte: string;
  bijzonderheden: string[];
  relatieId: string;
  relatie: string;
  contactpersoon: string;
  eigenaar: string;
  eigenaarInitials: string;
  eigenaarFoto: string;
  deadline: string;
  opmerkingMarkt: string;
}

function getInitials(naam: string): string {
  return naam.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

// ── Hooks ──

export function useLadingMarktDetail(id: string | undefined) {
  const [data, setData] = useState<ResolvedLadingMarkt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refetch = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    mountedRef.current = true;
    if (!id) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [item, maps] = await Promise.all([
          api.get<LadingMarkt & { status?: string; laaddatum?: string; losdatum?: string }>("lading_markt", id),
          getLookups(),
        ]);

        const soort = maps.ladingSoorten.get(item.ladingSoortId);
        const subsoort = maps.ladingSubsoorten.get(item.subsoortId);
        const relatie = maps.relaties.get(item.relatieId);
        const laadlocatie = maps.havens.get(item.laadlocatieId);
        const loslocatie = maps.havens.get(item.loslocatieId);
        const bron = maps.bronnen.get(item.bronId);
        const eigenaar = item.eigenaarId ? maps.gebruikers.get(item.eigenaarId) : null;
        const contact = relatie?.contactPersoonIds?.[0]
          ? maps.contactPersonen.get(relatie.contactPersoonIds[0])
          : null;
        const bijz = item.bijzonderheidIds
          .map(bid => maps.bijzonderheden.get(bid))
          .filter(Boolean)
          .map(b => b!.naam);

        // Try to find a related eigen lading for zoekcriteria
        let eigenLading: LadingEigen | null = null;
        try {
          const allEigen = await api.list<LadingEigen>("lading_eigen");
          eigenLading = allEigen.find(el => {
            const p = maps.partijen.get(el.partijId);
            return p?.ladingSoortId === item.ladingSoortId && el.relatieId === item.relatieId;
          }) || null;
        } catch { /* no eigen data available */ }

        const tonnageIsRange = typeof item.tonnage === "object";
        const resolved: ResolvedLadingMarkt = {
          raw: item,
          tonnage: tonnageIsRange
            ? `${formatTonnage(item.tonnage)} t`
            : `${fmt(item.tonnage as number)} t`,
          lading: soort?.naam || "—",
          subsoort: subsoort?.naam || "—",
          soortelijkGewicht: soort?.soortelijkGewicht ? `${soort.soortelijkGewicht.toFixed(2).replace(".", ",")} t/m³` : "—",
          inhoud: !tonnageIsRange && item.tonnage && soort?.soortelijkGewicht ? `${Math.round((item.tonnage as number) / soort.soortelijkGewicht).toLocaleString("nl-NL")} m³` : "—",
          bijzonderheden: bijz,
          laadlocatie: laadlocatie?.naam || "—",
          laadlocatieCity: "",
          laaddatum: item.laaddatum || "Af te stemmen",
          loslocatie: loslocatie?.naam || "—",
          loslocatieCity: "",
          losdatum: item.losdatum || "Af te stemmen",
          bron: bron?.titel || "—",
          bronDatum: bron?.datum || "",
          relatieId: item.relatieId,
          relatie: relatie?.naam || "—",
          contactpersoon: contact?.naam || "—",
          eigenaar: eigenaar?.naam || "—",
          eigenaarInitials: eigenaar ? getInitials(eigenaar.naam) : "",
          eigenaarFoto: eigenaar?.profielfoto || "",
          prioriteit: item.prioriteit,
          inkoopPrijs: fmtPrice(item.prijs),
          inkoopLaadtijd: fmtHours(item.laadtijd),
          inkoopLiggeldLaden: fmtLiggeld(item.liggeldLaden),
          inkoopLostijd: fmtHours(item.lostijd),
          inkoopLiggeldLossen: fmtLiggeld(item.liggeldLossen),
          eigenLadingId: eigenLading?.id ?? null,
          zoekcriteriaPrijs: eigenLading ? fmtPrice(eigenLading.prijs) : "—",
          zoekcriteriaLaadtijd: eigenLading ? fmtHours(eigenLading.laadtijd) : "—",
          zoekcriteriaLiggeldLaden: eigenLading ? fmtLiggeld(eigenLading.liggeldLaden) : "—",
          zoekcriteriaLostijd: eigenLading ? fmtHours(eigenLading.lostijd) : "—",
          zoekcriteriaLiggeldLossen: eigenLading ? fmtLiggeld(eigenLading.liggeldLossen) : "—",
          rawInkoopPrijs: item.prijs,
          rawInkoopLaadtijd: item.laadtijd,
          rawInkoopLiggeldLaden: item.liggeldLaden,
          rawInkoopLostijd: item.lostijd,
          rawInkoopLiggeldLossen: item.liggeldLossen,
          rawZoekcriteriaPrijs: eigenLading?.prijs ?? null,
          rawZoekcriteriaLaadtijd: eigenLading?.laadtijd ?? null,
          rawZoekcriteriaLiggeldLaden: eigenLading?.liggeldLaden ?? null,
          rawZoekcriteriaLostijd: eigenLading?.lostijd ?? null,
          rawZoekcriteriaLiggeldLossen: eigenLading?.liggeldLossen ?? null,
        };

        if (mountedRef.current) setData(resolved);
      } catch (err: any) {
        console.error("useLadingMarktDetail error:", err);
        if (mountedRef.current) setError(err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => { mountedRef.current = false; };
  }, [id, refreshKey]);

  return { data, loading, error, refetch };
}

export function useLadingEigenDetail(id: string | undefined) {
  const [data, setData] = useState<ResolvedLadingEigen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refetch = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    mountedRef.current = true;
    if (!id) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Split IDs (e.g. "le-001-2", "le-001-rest") don't exist in the store;
        // fall back to the base entity ID by stripping the split suffix.
        const baseId = id.replace(/-(rest|[1-9]\d*)$/, '');
        const maps = await getLookups();
        let item: LadingEigen;
        try {
          item = await api.get<LadingEigen>("lading_eigen", id);
        } catch {
          item = await api.get<LadingEigen>("lading_eigen", baseId);
        }

        const partij = maps.partijen.get(item.partijId);
        const subpartij = maps.subpartijen.get(item.subpartijId);
        const ex = partij?.exId ? maps.exen.get(partij.exId) : null;
        const soort = partij ? maps.ladingSoorten.get(partij.ladingSoortId) : null;
        const subsoort = partij ? maps.ladingSubsoorten.get(partij.subsoortId) : null;
        const relatie = maps.relaties.get(item.relatieId);
        const laadlocatie = partij ? maps.havens.get(partij.laadlocatieId) : null;
        const loslocatie = subpartij ? maps.havens.get(subpartij.loslocatieId) : null;
        const eigenaar = maps.gebruikers.get(item.eigenaarId);
        const contact = relatie?.contactPersoonIds?.[0]
          ? maps.contactPersonen.get(relatie.contactPersoonIds[0])
          : null;
        const bijz = subpartij?.bijzonderheidIds
          ?.map(bid => maps.bijzonderheden.get(bid))
          .filter(Boolean)
          .map(b => b!.naam) || [];

        // Try to find a related markt lading for comparison condities
        let marktLading: (LadingMarkt & { status?: string }) | null = null;
        try {
          const allMarkt = await api.list<LadingMarkt & { status?: string }>("lading_markt");
          // Match on same soort + relatie as a heuristic
          marktLading = allMarkt.find(ml =>
            ml.ladingSoortId === partij?.ladingSoortId && ml.relatieId === item.relatieId
          ) || null;
        } catch { /* no markt data available */ }

        const resolved: ResolvedLadingEigen = {
          raw: item,
          partij: partij?.naam || "—",
          subpartij: subpartij?.naam || "—",
          tonnage: `${fmt(item.tonnage)} t`,
          ex: ex?.naam || "—",
          exType: ex?.type || "",
          lading: soort?.naam || "—",
          subsoort: subsoort?.naam || "—",
          soortelijkGewicht: soort?.soortelijkGewicht ? `${soort.soortelijkGewicht.toFixed(2).replace(".", ",")} t/m³` : "—",
          inhoud: item.tonnage && soort?.soortelijkGewicht ? `${Math.round(item.tonnage / soort.soortelijkGewicht).toLocaleString("nl-NL")} m³` : "—",
          bijzonderheden: bijz,
          laadlocatie: laadlocatie?.naam || "—",
          laadlocatieCity: "",
          laaddatum: subpartij?.laaddatum || "Af te stemmen",
          loslocatie: loslocatie?.naam || "—",
          loslocatieCity: "",
          losdatum: subpartij?.losdatum || "Af te stemmen",
          relatieId: item.relatieId,
          opdrachtgever: relatie?.naam || "—",
          opdrachtgeverContact: contact?.naam || "—",
          eigenaar: eigenaar?.naam || "—",
          eigenaarInitials: eigenaar ? getInitials(eigenaar.naam) : "",
          eigenaarFoto: eigenaar?.profielfoto || "",
          deadline: item.deadline || "—",
          eigenPrijs: fmtPrice(item.prijs),
          eigenLaadtijd: fmtHours(item.laadtijd),
          eigenLiggeldLaden: fmtLiggeld(item.liggeldLaden),
          eigenLostijd: fmtHours(item.lostijd),
          eigenLiggeldLossen: fmtLiggeld(item.liggeldLossen),
          marktLadingId: marktLading?.id ?? null,
          marktPrijs: fmtPrice(item.zoekPrijs ?? marktLading?.prijs ?? null),
          marktLaadtijd: fmtHours(item.zoekLaadtijd ?? marktLading?.laadtijd ?? null),
          marktLiggeldLaden: fmtLiggeld(item.zoekLiggeldLaden ?? marktLading?.liggeldLaden ?? null),
          marktLostijd: fmtHours(item.zoekLostijd ?? marktLading?.lostijd ?? null),
          marktLiggeldLossen: fmtLiggeld(item.zoekLiggeldLossen ?? marktLading?.liggeldLossen ?? null),
          rawEigenPrijs: item.prijs,
          rawEigenLaadtijd: item.laadtijd,
          rawEigenLiggeldLaden: item.liggeldLaden,
          rawEigenLostijd: item.lostijd,
          rawEigenLiggeldLossen: item.liggeldLossen,
          rawMarktPrijs: item.zoekPrijs ?? marktLading?.prijs ?? null,
          rawMarktLaadtijd: item.zoekLaadtijd ?? marktLading?.laadtijd ?? null,
          rawMarktLiggeldLaden: item.zoekLiggeldLaden ?? marktLading?.liggeldLaden ?? null,
          rawMarktLostijd: item.zoekLostijd ?? marktLading?.lostijd ?? null,
          rawMarktLiggeldLossen: item.zoekLiggeldLossen ?? marktLading?.liggeldLossen ?? null,
        };

        if (mountedRef.current) setData(resolved);
      } catch (err: any) {
        console.error("useLadingEigenDetail error:", err);
        if (mountedRef.current) setError(err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => { mountedRef.current = false; };
  }, [id, refreshKey]);

  return { data, loading, error, refetch };
}

export function useVaartuigMarktDetail(id: string | undefined) {
  const [data, setData] = useState<ResolvedVaartuigMarkt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!id) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [item, maps] = await Promise.all([
          api.get<VaartuigMarkt>("vaartuig_markt", id),
          getLookups(),
        ]);

        const locatie = maps.havens.get(item.huidigeLocatieId);
        const bron = maps.bronnen.get(item.bronId);
        const relatie = maps.relaties.get(item.relatieId);
        const eigenaar = item.eigenaarId ? maps.gebruikers.get(item.eigenaarId) : null;
        const contact = relatie?.contactPersoonIds?.[0]
          ? maps.contactPersonen.get(relatie.contactPersoonIds[0])
          : null;
        const bijz = item.bijzonderheidIds
          .map(bid => maps.bijzonderheden.get(bid))
          .filter(Boolean)
          .map(b => b!.naam);

        const resolved: ResolvedVaartuigMarkt = {
          raw: item,
          naam: item.naam,
          beschikbaarVanaf: item.beschikbaarVanaf || "—",
          huidigeLocatie: locatie?.naam || "—",
          eni: item.eni || "—",
          vlag: item.vlag || "—",
          meetbrief: item.meetbrief || "—",
          groottonnage: `${item.groottonnage.toLocaleString("nl-NL")} mt`,
          inhoud: `${item.inhoud.toLocaleString("nl-NL")} m³`,
          lengte: `${fmt(item.lengte)} m`,
          breedte: `${fmt(item.breedte)} m`,
          diepgang: `${fmt(item.diepgang)} m`,
          kruiphoogte: `${fmt(item.kruiphoogte)} m`,
          bijzonderheden: bijz,
          bron: bron?.titel || "—",
          bronDatum: bron?.datum || "",
          relatieId: item.relatieId,
          relatie: relatie?.naam || "—",
          contactpersoon: contact?.naam || "—",
          eigenaar: eigenaar?.naam || "—",
          eigenaarInitials: eigenaar ? getInitials(eigenaar.naam) : "",
          eigenaarFoto: eigenaar?.profielfoto || "",
          prioriteit: item.prioriteit,
          opmerkingMarkt: item.opmerkingMarkt || "",
        };

        if (mountedRef.current) setData(resolved);
      } catch (err: any) {
        console.error("useVaartuigMarktDetail error:", err);
        if (mountedRef.current) setError(err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => { mountedRef.current = false; };
  }, [id]);

  return { data, loading, error };
}

export function useVaartuigEigenDetail(id: string | undefined) {
  const [data, setData] = useState<ResolvedVaartuigEigen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!id) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [item, maps] = await Promise.all([
          api.get<VaartuigEigen>("vaartuig_eigen", id),
          getLookups(),
        ]);

        const locatie = maps.havens.get(item.huidigeLocatieId);
        const eigenaar = maps.gebruikers.get(item.eigenaarId);
        const bijz = item.bijzonderheidIds
          .map(bid => maps.bijzonderheden.get(bid))
          .filter(Boolean)
          .map(b => b!.naam);

        const resolved: ResolvedVaartuigEigen = {
          raw: item,
          naam: item.naam,
          beschikbaarVanaf: item.beschikbaarVanaf || "—",
          huidigeLocatie: locatie?.naam || "—",
          eni: item.eni || "—",
          vlag: item.vlag || "—",
          meetbrief: item.meetbrief || "—",
          groottonnage: `${item.groottonnage.toLocaleString("nl-NL")} mt`,
          inhoud: `${item.inhoud.toLocaleString("nl-NL")} m³`,
          lengte: `${fmt(item.lengte)} m`,
          breedte: `${fmt(item.breedte)} m`,
          diepgang: `${fmt(item.diepgang)} m`,
          kruiphoogte: `${fmt(item.kruiphoogte)} m`,
          bijzonderheden: bijz,
          relatieId: item.relatieId,
          relatie: maps.relaties.get(item.relatieId)?.naam || "—",
          contactpersoon: maps.contactPersonen.get(maps.relaties.get(item.relatieId)?.contactPersoonIds?.[0] || "")?.naam || "—",
          eigenaar: eigenaar?.naam || "—",
          eigenaarInitials: eigenaar ? getInitials(eigenaar.naam) : "",
          eigenaarFoto: eigenaar?.profielfoto || "",
          deadline: item.deadline || "—",
          opmerkingMarkt: item.opmerkingMarkt || "",
        };

        if (mountedRef.current) setData(resolved);
      } catch (err: any) {
        console.error("useVaartuigEigenDetail error:", err);
        if (mountedRef.current) setError(err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => { mountedRef.current = false; };
  }, [id]);

  return { data, loading, error };
}

/**
 * Unified hook for inbox detail pages - resolves a lading_markt with full summary.
 */
export interface InboxLadingSummary {
  title: string;
  subtitle: string;
  breadcrumbLabel: string;
  relatieId: string;
  relatieName: string;
}

export function useInboxLadingSummary(id: string | undefined) {
  const [data, setData] = useState<InboxLadingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!id) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [item, maps] = await Promise.all([
          api.get<LadingMarkt & { laaddatum?: string; losdatum?: string }>("lading_markt", id),
          getLookups(),
        ]);

        const soort = maps.ladingSoorten.get(item.ladingSoortId);
        const subsoort = maps.ladingSubsoorten.get(item.subsoortId);
        const laadlocatie = maps.havens.get(item.laadlocatieId);
        const loslocatie = maps.havens.get(item.loslocatieId);
        const relatie = maps.relaties.get(item.relatieId);

        const soortLabel = subsoort ? `${soort?.naam || ""} (${subsoort.naam})` : soort?.naam || "";
        const title = `${formatTonnage(item.tonnage)} ton ${soortLabel}`;

        const resolved: InboxLadingSummary = {
          title,
          subtitle: `Vanuit ${laadlocatie?.naam || "—"} (${item.laaddatum ? formatDate(item.laaddatum) : "Af te stemmen"}) naar ${loslocatie?.naam || "—"} (${item.losdatum ? formatDate(item.losdatum) : "Af te stemmen"})`,
          breadcrumbLabel: title.substring(0, 20),
          relatieId: item.relatieId,
          relatieName: relatie?.naam || "—",
        };

        if (mountedRef.current) setData(resolved);
      } catch (err: any) {
        console.error("useInboxLadingSummary error:", err);
        if (mountedRef.current) setError(err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => { mountedRef.current = false; };
  }, [id]);

  return { data, loading, error };
}

/**
 * Unified hook for inbox vessel detail pages - resolves a vaartuig_markt with full summary.
 */
export interface InboxVaartuigSummary {
  title: string;
  subtitle: string;
  breadcrumbLabel: string;
  relatieId: string;
  relatieName: string;
}

export function useInboxVaartuigSummary(id: string | undefined) {
  const [data, setData] = useState<InboxVaartuigSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!id) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [item, maps] = await Promise.all([
          api.get<VaartuigMarkt>("vaartuig_markt", id),
          getLookups(),
        ]);

        const locatie = maps.havens.get(item.huidigeLocatieId);
        const relatie = maps.relaties.get(item.relatieId);

        const resolved: InboxVaartuigSummary = {
          title: item.naam,
          subtitle: `Motorschip in ${locatie?.naam || "—"} · Beschikbaar op ${item.beschikbaarVanaf ? formatDate(item.beschikbaarVanaf) : "Af te stemmen"}`,
          breadcrumbLabel: item.naam,
          relatieId: item.relatieId,
          relatieName: relatie?.naam || "—",
        };

        if (mountedRef.current) setData(resolved);
      } catch (err: any) {
        console.error("useInboxVaartuigSummary error:", err);
        if (mountedRef.current) setError(err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => { mountedRef.current = false; };
  }, [id]);

  return { data, loading, error };
}

/**
 * Hook for bevrachting lading detail - resolves an eigen lading with full summary.
 */
export interface BevrachtingLadingSummary {
  title: string;
  exType?: string;
  subtitle: string;
  status: string;
  statusVariant: "success" | "warning" | "brand" | "grey";
  breadcrumbLabel: string;
}

export function useBevrachtingLadingSummary(id: string | undefined) {
  const [data, setData] = useState<BevrachtingLadingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!id) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const maps = await getLookups();
        let resolved: BevrachtingLadingSummary;

        // Try lading_eigen first, then fall back to lading_markt
        // Split IDs (e.g. "le-001-2") don't exist in the store; strip suffix to get base ID.
        const baseId = id.replace(/-(rest|[1-9]\d*)$/, '');
        try {
          let item: LadingEigen & { status?: string };
          try {
            item = await api.get<LadingEigen & { status?: string }>("lading_eigen", id);
          } catch {
            item = await api.get<LadingEigen & { status?: string }>("lading_eigen", baseId);
          }

          const partij = maps.partijen.get(item.partijId);
          const subpartij = maps.subpartijen.get(item.subpartijId);
          const ex = partij?.exId ? maps.exen.get(partij.exId) : null;
          const soort = partij ? maps.ladingSoorten.get(partij.ladingSoortId) : null;
          const subsoort = partij ? maps.ladingSubsoorten.get(partij.subsoortId) : null;
          const laadlocatie = partij ? maps.havens.get(partij.laadlocatieId) : null;
          const loslocatie = subpartij ? maps.havens.get(subpartij.loslocatieId) : null;

          const soortLabel = subsoort ? `${soort?.naam || ""} (${subsoort.naam})` : soort?.naam || "";
          const title = ex ? (ex.type === "opslag" ? ex.naam : `m/v ${ex.naam}`) : subpartij?.naam || id || "—";
          const status = (item as any).status || "intake";

          const toewijzing = getMarktToewijzing(item.subpartijId);
          const tonnageLabel = toewijzing
            ? `${toewijzing.marktTonnage.toLocaleString("nl-NL")} van ${toewijzing.subpartijTonnage.toLocaleString("nl-NL")} ton`
            : `${formatTonnage(item.tonnage)} ton`;

          resolved = {
            title,
            exType: ex?.type,
            subtitle: `${tonnageLabel} ${soortLabel} vanuit ${laadlocatie?.naam || "—"} (${subpartij?.laaddatum ? formatDate(subpartij.laaddatum) : "Af te stemmen"}) naar ${loslocatie?.naam || "—"} (${subpartij?.losdatum ? formatDate(subpartij.losdatum) : "Af te stemmen"})`,
            status: status === "inbox" ? "Inbox" : status === "markt" ? "In de markt" : status === "werklijst" ? "Werklijst" : status === "intake" ? "Intake" : "Gesloten",
            statusVariant: status === "inbox" ? "grey" : status === "markt" ? "success" : status === "werklijst" ? "warning" : status === "intake" ? "brand" : "grey",
            breadcrumbLabel: title.substring(0, 20),
          };
        } catch {
          const item = await api.get<LadingMarkt & { status?: string; laaddatum?: string; losdatum?: string }>("lading_markt", id);

          const soort = maps.ladingSoorten.get(item.ladingSoortId);
          const subsoort = maps.ladingSubsoorten.get(item.subsoortId);
          const laadlocatie = maps.havens.get(item.laadlocatieId);
          const loslocatie = maps.havens.get(item.loslocatieId);

          const soortLabel = subsoort ? `${soort?.naam || ""} (${subsoort.naam})` : soort?.naam || "";
          const title = `${formatTonnage(item.tonnage)} ton ${soortLabel}` || id || "—";
          const status = (item as any).status || "inbox";

          resolved = {
            title,
            subtitle: `vanuit ${laadlocatie?.naam || "—"} (${item.laaddatum ? formatDate(item.laaddatum) : "Af te stemmen"}) naar ${loslocatie?.naam || "—"} (${item.losdatum ? formatDate(item.losdatum) : "Af te stemmen"})`,
            status: status === "inbox" ? "Inbox" : status === "markt" ? "In de markt" : status === "werklijst" ? "Werklijst" : status === "intake" ? "Intake" : "Gesloten",
            statusVariant: status === "inbox" ? "grey" : status === "markt" ? "success" : status === "werklijst" ? "warning" : status === "intake" ? "brand" : "grey",
            breadcrumbLabel: title.substring(0, 20),
          };
        }

        if (mountedRef.current) setData(resolved);
      } catch (err: any) {
        console.error("useBevrachtingLadingSummary error:", err);
        if (mountedRef.current) setError(err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => { mountedRef.current = false; };
  }, [id]);

  return { data, loading, error };
}

/**
 * Hook for bevrachting vaartuig detail - resolves an eigen vaartuig with full summary.
 */
export interface BevrachtingVaartuigSummary {
  title: string;
  subtitle: string;
  status: string;
  statusVariant: "success" | "warning" | "brand" | "grey";
  breadcrumbLabel: string;
}

export function useBevrachtingVaartuigSummary(id: string | undefined) {
  const [data, setData] = useState<BevrachtingVaartuigSummary | null>(null);
  const [detectedType, setDetectedType] = useState<"eigen" | "markt">("eigen");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!id) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const maps = await getLookups();
        let item: (VaartuigEigen | VaartuigMarkt) & { status?: string };
        let type: "eigen" | "markt" = "eigen";

        // Try eigen first, then markt
        try {
          item = await api.get<VaartuigEigen & { status?: string }>("vaartuig_eigen", id);
          type = "eigen";
        } catch {
          item = await api.get<VaartuigMarkt & { status?: string }>("vaartuig_markt", id);
          type = "markt";
        }

        const locatie = maps.havens.get(item.huidigeLocatieId);
        const status = (item as any).status || "intake";

        const resolved: BevrachtingVaartuigSummary = {
          title: item.naam,
          subtitle: `Motorschip · ${item.groottonnage.toLocaleString("nl-NL")} ton · ${locatie?.naam || "—"} (${item.beschikbaarVanaf ? formatDate(item.beschikbaarVanaf) : "Af te stemmen"})`,
          status: status === "inbox" ? "Inbox" : status === "markt" ? "In de markt" : status === "werklijst" ? "Werklijst" : status === "intake" ? "Intake" : "Gesloten",
          statusVariant: status === "inbox" ? "grey" : status === "markt" ? "success" : status === "werklijst" ? "warning" : status === "intake" ? "brand" : "grey",
          breadcrumbLabel: item.naam,
        };

        if (mountedRef.current) {
          setDetectedType(type);
          setData(resolved);
        }
      } catch (err: any) {
        console.error("useBevrachtingVaartuigSummary error:", err);
        if (mountedRef.current) setError(err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => { mountedRef.current = false; };
  }, [id]);

  return { data, detectedType, loading, error };
}

function formatTonnage(t: number | { min: number; max: number }): string {
  const fmtNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}.000` : `${n}`;
  if (typeof t === "object") return `${fmtNum(t.min)}–${fmtNum(t.max)}`;
  return fmtNum(t);
}

