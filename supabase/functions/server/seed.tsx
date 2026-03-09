/**
 * Seed data for Rederij de Jong market module.
 * Returns all entities keyed by prefix for bulk insert.
 */

import { generateId } from "./entities.tsx";
import * as kv from "./kv_store.tsx";

// Pre-generate stable IDs so relations work
const ids = {
  // Relaties
  rel_janlow: generateId(),
  rel_provaart: generateId(),
  rel_limber: generateId(),
  rel_cargill: generateId(),
  rel_agrodelta: generateId(),
  rel_vandijk: generateId(),
  rel_freight_ooc: generateId(),
  rel_janson: generateId(),
  rel_volharding: generateId(),
  rel_alfa: generateId(),
  rel_abel: generateId(),
  rel_vaartwat: generateId(),
  rel_plavo: generateId(),
  rel_blauwegolf: generateId(),
  rel_ijsseldelta: generateId(),
  rel_nieuwehanse: generateId(),
  rel_andermans: generateId(),
  rel_markel: generateId(),
  rel_buiten: generateId(),
  rel_rdj: generateId(),
  rel_cargo_solutions: generateId(),

  // Contact personen
  cp_erick: generateId(),
  cp_michiel: generateId(),
  cp_khoa: generateId(),
  cp_feiger: generateId(),
  cp_janwillem: generateId(),
  cp_lisa: generateId(),
  cp_class: generateId(),
  cp_mira: generateId(),
  cp_rcl: generateId(),

  // Lading soorten
  ls_houtpellets: generateId(),
  ls_koolraapzaad: generateId(),
  ls_graan: generateId(),
  ls_zand: generateId(),
  ls_steenkool: generateId(),

  // Lading subsoorten
  lss_houtpellets_dsit: generateId(),
  lss_houtpellets_enplus: generateId(),
  lss_koolraapzaad_std: generateId(),
  lss_graan_tarwe: generateId(),
  lss_graan_gerst: generateId(),
  lss_zand_bouw: generateId(),
  lss_steenkool_antraciet: generateId(),

  // Bijzonderheden
  bz_kraanschip: generateId(),
  bz_grijperkraanschip: generateId(),
  bz_stofvrij: generateId(),
  bz_gewassen: generateId(),
  bz_dubbele_huid: generateId(),
  bz_luikenkap: generateId(),
  bz_adnr: generateId(),

  // Havens
  hv_rotterdam: generateId(),
  hv_europoort: generateId(),
  hv_mannheim: generateId(),
  hv_salzgitter: generateId(),
  hv_hamburg: generateId(),
  hv_waalhaven: generateId(),
  hv_bremerhaven: generateId(),
  hv_groningen: generateId(),
  hv_antwerpen: generateId(),
  hv_duisburg: generateId(),
  hv_maasvlakte: generateId(),
  hv_dordrecht: generateId(),

  // Bronnen
  br_auto_feed: generateId(),
  br_email: generateId(),
  br_telefoon: generateId(),
  br_handmatig: generateId(),

  // Gebruikers
  gb_erick: generateId(),
  gb_michiel: generateId(),
  gb_khoa: generateId(),
  gb_janwillem: generateId(),
  gb_lisa: generateId(),

  // Ex (zeeboten)
  ex_abis_dover: generateId(),
  ex_maran_future: generateId(),
  ex_a2b_future: generateId(),
  ex_theadora: generateId(),
  ex_merganser: generateId(),

  // Partijen
  prt_1: generateId(),
  prt_2: generateId(),
  prt_3: generateId(),

  // Subpartijen
  sprt_1a: generateId(),
  sprt_1b: generateId(),
  sprt_2a: generateId(),
  sprt_3a: generateId(),

  // Lading markt
  lm_1: generateId(),
  lm_2: generateId(),
  lm_3: generateId(),
  lm_4: generateId(),
  lm_5: generateId(),
  lm_6: generateId(),

  // Lading eigen
  le_1: generateId(),
  le_2: generateId(),
  le_3: generateId(),

  // Vaartuig markt
  vm_1: generateId(),
  vm_2: generateId(),
  vm_3: generateId(),
  vm_4: generateId(),
  vm_5: generateId(),

  // Vaartuig eigen
  ve_1: generateId(),
  ve_2: generateId(),

  // Biedingen
  bod_1: generateId(),
  bod_2: generateId(),
  bod_3: generateId(),
  bod_4: generateId(),
  bod_5: generateId(),
  bod_6: generateId(),
  bod_7: generateId(),
  bod_8: generateId(),
  bod_9: generateId(),

  // Onderhandelingen
  ond_1: generateId(),
  ond_2: generateId(),
  ond_3: generateId(),
  ond_4: generateId(),
  ond_5: generateId(),
  ond_6: generateId(),
  ond_7: generateId(),
  ond_8: generateId(),
  ond_9: generateId(),
};

function buildSeedData() {
  const keys: string[] = [];
  const values: any[] = [];

  function add(prefix: string, id: string, data: any) {
    keys.push(`${prefix}${id}`);
    values.push({ id, ...data });
  }

  // ── Relaties ──
  const relaties = [
    [ids.rel_janlow, "Janlow B.V.", [ids.cp_class]],
    [ids.rel_provaart, "Provaart Logistics BV", [ids.cp_erick]],
    [ids.rel_limber, "Limber Benelux N.V.", []],
    [ids.rel_cargill, "Cargill N.V.", []],
    [ids.rel_agrodelta, "Agro Delta Groep", []],
    [ids.rel_vandijk, "Van Dijk Shipping B.V.", []],
    [ids.rel_freight_ooc, "Freight OOC GmbH", []],
    [ids.rel_janson, "Janson & Janson B.V.", [ids.cp_erick]],
    [ids.rel_volharding, "De Volharding C.V.", [ids.cp_michiel]],
    [ids.rel_alfa, "Rederij Alfa", [ids.cp_khoa]],
    [ids.rel_abel, "Rederij Abel", [ids.cp_feiger]],
    [ids.rel_vaartwat, "Vaart Wat B.V.", [ids.cp_michiel]],
    [ids.rel_plavo, "Plavo Shipping", [ids.cp_khoa]],
    [ids.rel_blauwegolf, "De Blauwe Golf B.V.", [ids.cp_khoa]],
    [ids.rel_ijsseldelta, "IJsseldelta Transport", [ids.cp_janwillem]],
    [ids.rel_nieuwehanse, "De Nieuwe Hanse N.V.", [ids.cp_erick]],
    [ids.rel_andermans, "Andermans B.V.", [ids.cp_class]],
    [ids.rel_markel, "Markel Freight B.V.", [ids.cp_rcl]],
    [ids.rel_buiten, "Buiten Omzelf N.V.", [ids.cp_lisa]],
    [ids.rel_rdj, "Rederij de Jong", [ids.cp_lisa, ids.cp_feiger]],
    [ids.rel_cargo_solutions, "Cargo Solutions Ltd.", [ids.cp_mira]],
  ] as const;
  for (const [id, naam, contactPersoonIds] of relaties) {
    add("relatie:", id, { naam, contactPersoonIds });
  }

  // ── Contact personen ──
  const contactPersonen = [
    [ids.cp_erick, "Erick Nieuwkoop", "erick@provaart.nl", "+31 6 1234 5678", ids.rel_provaart],
    [ids.cp_michiel, "Michiel den Hond", "michiel@volharding.nl", "+31 6 2345 6789", ids.rel_volharding],
    [ids.cp_khoa, "Khoa Nguyen", "khoa@rederij-alfa.nl", "+31 6 3456 7890", ids.rel_alfa],
    [ids.cp_feiger, "Feiger de Jong", "feiger@rdj.nl", "+31 6 4567 8901", ids.rel_rdj],
    [ids.cp_janwillem, "Jan Willem van der Kraan", "jw@ijsseldelta.nl", "+31 6 5678 9012", ids.rel_ijsseldelta],
    [ids.cp_lisa, "Lisa Abraham", "lisa@rdj.nl", "+31 6 6789 0123", ids.rel_rdj],
    [ids.cp_class, "Class Alexiaan", "class@andermans.nl", "+31 6 7890 1234", ids.rel_andermans],
    [ids.cp_mira, "Mira Thompson", "mira@cargosolutions.com", "+44 7 700 1234", ids.rel_cargo_solutions],
    [ids.cp_rcl, "RCL Riverwoon", "rcl@markelfreight.nl", "+31 6 8901 2345", ids.rel_markel],
  ] as const;
  for (const [id, naam, email, telefoon, relatieId] of contactPersonen) {
    add("contact_persoon:", id, { naam, email, telefoon, relatieId });
  }

  // ── Lading soorten ──
  const ladingSoorten = [
    [ids.ls_houtpellets, "Houtpellets", 0.65, [ids.lss_houtpellets_dsit, ids.lss_houtpellets_enplus]],
    [ids.ls_koolraapzaad, "Koolraapzaad", 0.72, [ids.lss_koolraapzaad_std]],
    [ids.ls_graan, "Graan", 0.78, [ids.lss_graan_tarwe, ids.lss_graan_gerst]],
    [ids.ls_zand, "Zand", 1.60, [ids.lss_zand_bouw]],
    [ids.ls_steenkool, "Steenkool", 1.10, [ids.lss_steenkool_antraciet]],
  ] as const;
  for (const [id, naam, soortelijkGewicht, subsoortIds] of ladingSoorten) {
    add("lading_soort:", id, { naam, soortelijkGewicht, subsoortIds });
  }

  // ── Lading subsoorten ──
  const ladingSubsoorten = [
    [ids.lss_houtpellets_dsit, "DSIT", 0.65, ids.ls_houtpellets],
    [ids.lss_houtpellets_enplus, "ENplus A1", 0.68, ids.ls_houtpellets],
    [ids.lss_koolraapzaad_std, "Standaard", 0.72, ids.ls_koolraapzaad],
    [ids.lss_graan_tarwe, "Tarwe", 0.78, ids.ls_graan],
    [ids.lss_graan_gerst, "Gerst", 0.62, ids.ls_graan],
    [ids.lss_zand_bouw, "Bouwzand", 1.60, ids.ls_zand],
    [ids.lss_steenkool_antraciet, "Antraciet", 1.10, ids.ls_steenkool],
  ] as const;
  for (const [id, naam, soortelijkGewicht, ladingSoortId] of ladingSubsoorten) {
    add("lading_subsoort:", id, { naam, soortelijkGewicht, ladingSoortId });
  }

  // ── Bijzonderheden ──
  const bijzonderheden = [
    [ids.bz_kraanschip, "Kraanschip"],
    [ids.bz_grijperkraanschip, "Grijperkraanschip"],
    [ids.bz_stofvrij, "Stofvrij laden"],
    [ids.bz_gewassen, "Gewassen ruimen"],
    [ids.bz_dubbele_huid, "Dubbele huid"],
    [ids.bz_luikenkap, "Luikenkap"],
    [ids.bz_adnr, "ADNR certificaat"],
  ] as const;
  for (const [id, naam] of bijzonderheden) {
    add("bijzonderheid:", id, { naam });
  }

  // ── Havens ──
  const havens = [
    [ids.hv_rotterdam, "Rotterdam", { lat: 51.9225, lng: 4.4792 }],
    [ids.hv_europoort, "Rotterdam Europoort", { lat: 51.9567, lng: 4.1500 }],
    [ids.hv_mannheim, "Mannheim", { lat: 49.4875, lng: 8.4660 }],
    [ids.hv_salzgitter, "Salzgitter Stichkanal", { lat: 52.1525, lng: 10.3292 }],
    [ids.hv_hamburg, "Hamburg Veddelkanal", { lat: 53.5236, lng: 10.0189 }],
    [ids.hv_waalhaven, "Waalhaven", { lat: 51.8930, lng: 4.4411 }],
    [ids.hv_bremerhaven, "Bremerhaven", { lat: 53.5396, lng: 8.5809 }],
    [ids.hv_groningen, "Groningen", { lat: 53.2194, lng: 6.5665 }],
    [ids.hv_antwerpen, "Antwerpen", { lat: 51.2194, lng: 4.4025 }],
    [ids.hv_duisburg, "Duisburg", { lat: 51.4344, lng: 6.7623 }],
    [ids.hv_maasvlakte, "Europahaven (Maasvlakte)", { lat: 51.9500, lng: 4.0333 }],
    [ids.hv_dordrecht, "Dordrecht", { lat: 51.8133, lng: 4.6690 }],
  ] as const;
  for (const [id, naam, geolocatie] of havens) {
    add("haven:", id, { naam, geolocatie });
  }

  // ── Bronnen ──
  const bronnen = [
    [ids.br_auto_feed, "Automatische feed", "2025-02-05"],
    [ids.br_email, "E-mail", "2025-02-04"],
    [ids.br_telefoon, "Telefoon", "2025-02-03"],
    [ids.br_handmatig, "Handmatig", "2025-01-28"],
  ] as const;
  for (const [id, titel, datum] of bronnen) {
    add("bron:", id, { titel, datum });
  }

  // ── Gebruikers ──
  const gebruikers = [
    [ids.gb_erick, "Erick Nieuwkoop", ""],
    [ids.gb_michiel, "Michiel den Hond", ""],
    [ids.gb_khoa, "Khoa Nguyen", ""],
    [ids.gb_janwillem, "Jan Willem van der Kraan", ""],
    [ids.gb_lisa, "Lisa Abraham", ""],
  ] as const;
  for (const [id, naam, profielfoto] of gebruikers) {
    add("gebruiker:", id, { naam, profielfoto });
  }

  // ── Ex (zeeboten) ──
  const exen = [
    [ids.ex_abis_dover, "Abis Dover", "Zeeboot"],
    [ids.ex_maran_future, "Maran Future", "Zeeboot"],
    [ids.ex_a2b_future, "A2B Future", "Zeeboot"],
    [ids.ex_theadora, "Theadora Oldendorff", "Zeeboot"],
    [ids.ex_merganser, "Merganser", "Zeeboot"],
  ] as const;
  for (const [id, naam, type] of exen) {
    add("ex:", id, { naam, type });
  }

  // ── Partijen ──
  add("partij:", ids.prt_1, {
    naam: "JA0092",
    ladingSoortId: ids.ls_houtpellets,
    subsoortId: ids.lss_houtpellets_dsit,
    exId: ids.ex_abis_dover,
    laadhavenId: ids.hv_salzgitter,
    subpartijIds: [ids.sprt_1a, ids.sprt_1b],
  });
  add("partij:", ids.prt_2, {
    naam: "PRO029",
    ladingSoortId: ids.ls_houtpellets,
    subsoortId: ids.lss_houtpellets_dsit,
    exId: ids.ex_maran_future,
    laadhavenId: ids.hv_salzgitter,
    subpartijIds: [ids.sprt_2a],
  });
  add("partij:", ids.prt_3, {
    naam: "UN762",
    ladingSoortId: ids.ls_koolraapzaad,
    subsoortId: ids.lss_koolraapzaad_std,
    exId: ids.ex_a2b_future,
    laadhavenId: ids.hv_salzgitter,
    subpartijIds: [ids.sprt_3a],
  });

  // ── Subpartijen ──
  add("subpartij:", ids.sprt_1a, {
    naam: "JA0092-01",
    partijId: ids.prt_1,
    bijzonderheidIds: [ids.bz_kraanschip],
    loshavenId: ids.hv_hamburg,
    laaddatum: "2025-01-12T10:00:00",
    losdatum: "2025-01-20",
  });
  add("subpartij:", ids.sprt_1b, {
    naam: "JA0092-02",
    partijId: ids.prt_1,
    bijzonderheidIds: [ids.bz_stofvrij],
    loshavenId: ids.hv_mannheim,
    laaddatum: "2025-01-15",
    losdatum: "2025-01-22",
  });
  add("subpartij:", ids.sprt_2a, {
    naam: "PRO029-01",
    partijId: ids.prt_2,
    bijzonderheidIds: [],
    loshavenId: ids.hv_hamburg,
    laaddatum: "2025-01-12T10:00:00",
    losdatum: "2025-01-20",
  });
  add("subpartij:", ids.sprt_3a, {
    naam: "UN762-02",
    partijId: ids.prt_3,
    bijzonderheidIds: [ids.bz_gewassen],
    loshavenId: ids.hv_hamburg,
    laaddatum: null,
    losdatum: "2025-01-20",
  });

  // ── Lading markt ──
  const ladingMarkt = [
    {
      id: ids.lm_1, opmerking: "Af te stemmen", tonnage: 3000, status: "inbox",
      ladingSoortId: ids.ls_houtpellets, subsoortId: ids.lss_houtpellets_dsit,
      bijzonderheidIds: [ids.bz_kraanschip], laadhavenId: ids.hv_europoort,
      loshavenId: ids.hv_mannheim, bronId: ids.br_auto_feed,
      relatieId: ids.rel_vandijk, eigenaarId: ids.gb_erick, prioriteit: 3,
      prijs: 3.00, laadtijd: 4, liggeldLaden: 0, lostijd: 8, liggeldLossen: 0,
      laaddatum: "2026-01-15", losdatum: "",
    },
    {
      id: ids.lm_2, opmerking: "", tonnage: 2000, status: "inbox",
      ladingSoortId: ids.ls_houtpellets, subsoortId: ids.lss_houtpellets_dsit,
      bijzonderheidIds: [], laadhavenId: ids.hv_salzgitter,
      loshavenId: ids.hv_hamburg, bronId: ids.br_auto_feed,
      relatieId: ids.rel_provaart, eigenaarId: ids.gb_michiel, prioriteit: 2,
      prijs: 3.00, laadtijd: 4, liggeldLaden: 0, lostijd: 8, liggeldLossen: 0,
      laaddatum: "2026-01-15", losdatum: "2026-01-17",
    },
    {
      id: ids.lm_3, opmerking: "", tonnage: 500, status: "inbox",
      ladingSoortId: ids.ls_koolraapzaad, subsoortId: ids.lss_koolraapzaad_std,
      bijzonderheidIds: [ids.bz_gewassen], laadhavenId: ids.hv_dordrecht,
      loshavenId: ids.hv_groningen, bronId: ids.br_auto_feed,
      relatieId: ids.rel_limber, eigenaarId: null, prioriteit: 0,
      prijs: null, laadtijd: null, liggeldLaden: 0, lostijd: null, liggeldLossen: 0,
      laaddatum: "", losdatum: "Week 7 of 8",
    },
    {
      id: ids.lm_4, opmerking: "", tonnage: 3000, status: "inbox",
      ladingSoortId: ids.ls_houtpellets, subsoortId: ids.lss_houtpellets_enplus,
      bijzonderheidIds: [ids.bz_stofvrij], laadhavenId: ids.hv_europoort,
      loshavenId: ids.hv_mannheim, bronId: ids.br_email,
      relatieId: ids.rel_cargill, eigenaarId: ids.gb_khoa, prioriteit: 1,
      prijs: 3.50, laadtijd: 2, liggeldLaden: 150, lostijd: 4, liggeldLossen: 200,
      laaddatum: "2026-01-15", losdatum: "2026-01-19",
    },
    {
      id: ids.lm_5, opmerking: "", tonnage: 3000, status: "inbox",
      ladingSoortId: ids.ls_houtpellets, subsoortId: ids.lss_houtpellets_dsit,
      bijzonderheidIds: [], laadhavenId: ids.hv_antwerpen,
      loshavenId: ids.hv_duisburg, bronId: ids.br_telefoon,
      relatieId: ids.rel_agrodelta, eigenaarId: ids.gb_erick, prioriteit: 0,
      prijs: 3.00, laadtijd: 2, liggeldLaden: 0, lostijd: 2, liggeldLossen: 0,
      laaddatum: "2026-01-16", losdatum: "2026-01-17",
    },
    {
      id: ids.lm_6, opmerking: "", tonnage: 4000, status: "pijplijn",
      ladingSoortId: ids.ls_graan, subsoortId: ids.lss_graan_tarwe,
      bijzonderheidIds: [ids.bz_stofvrij, ids.bz_luikenkap], laadhavenId: ids.hv_antwerpen,
      loshavenId: ids.hv_duisburg, bronId: ids.br_auto_feed,
      relatieId: ids.rel_freight_ooc, eigenaarId: ids.gb_lisa, prioriteit: 1,
      prijs: 4.20, laadtijd: 6, liggeldLaden: 200, lostijd: 6, liggeldLossen: 200,
      laaddatum: "2026-01-14T10:05", losdatum: "",
      pijplijnStatus: "markt",
    },
  ];
  for (const item of ladingMarkt) {
    const { id: itemId, ...rest } = item;
    add("lading_markt:", itemId, rest);
  }

  // ── Lading eigen ──
  const ladingEigen = [
    {
      id: ids.le_1, opmerking: "Subpartij 01 van JA0092",
      partijId: ids.prt_1, subpartijId: ids.sprt_1a, tonnage: 3000,
      relatieId: ids.rel_rdj, eigenaarId: ids.gb_erick,
      deadline: "2025-01-20", prijs: 3.00, laadtijd: 4, liggeldLaden: 0,
      lostijd: 8, liggeldLossen: 0,
    },
    {
      id: ids.le_2, opmerking: "1.000 van 2.000 ton",
      partijId: ids.prt_2, subpartijId: ids.sprt_2a, tonnage: 1000,
      relatieId: ids.rel_rdj, eigenaarId: ids.gb_michiel,
      deadline: "2025-01-20", prijs: 3.00, laadtijd: 4, liggeldLaden: 0,
      lostijd: 8, liggeldLossen: 0,
    },
    {
      id: ids.le_3, opmerking: "Koolraapzaad UN762",
      partijId: ids.prt_3, subpartijId: ids.sprt_3a, tonnage: 500,
      relatieId: ids.rel_rdj, eigenaarId: ids.gb_khoa,
      deadline: "2025-01-20", prijs: null, laadtijd: null, liggeldLaden: 0,
      lostijd: null, liggeldLossen: 0,
    },
  ];
  for (const item of ladingEigen) {
    const { id: itemId, ...rest } = item;
    add("lading_eigen:", itemId, rest);
  }

  // ── Vaartuig markt ──
  const vaartuigMarkt = [
    {
      id: ids.vm_1, naam: "Aar", opmerking: "",
      beschikbaarVanaf: "2025-12-21", huidigeLocatieId: ids.hv_maasvlakte,
      eni: "02325678", vlag: "NL", meetbrief: "NL-2019-1234",
      groottonnage: 3519, inhoud: 4200, lengte: 110, breedte: 11.45,
      diepgang: 3.50, kruiphoogte: 7.20,
      bijzonderheidIds: [ids.bz_dubbele_huid], bronId: ids.br_auto_feed,
      relatieId: ids.rel_andermans, eigenaarId: ids.gb_erick, prioriteit: 2,
    },
    {
      id: ids.vm_2, naam: "Agaat", opmerking: "",
      beschikbaarVanaf: "2025-01-13", huidigeLocatieId: ids.hv_maasvlakte,
      eni: "02326789", vlag: "NL", meetbrief: "NL-2020-5678",
      groottonnage: 2085, inhoud: 2500, lengte: 86, breedte: 9.50,
      diepgang: 2.80, kruiphoogte: 6.10,
      bijzonderheidIds: [], bronId: ids.br_auto_feed,
      relatieId: ids.rel_markel, eigenaarId: ids.gb_michiel, prioriteit: 1,
    },
    {
      id: ids.vm_3, naam: "Adonai", opmerking: "",
      beschikbaarVanaf: "2025-01-13", huidigeLocatieId: ids.hv_maasvlakte,
      eni: "02327890", vlag: "NL", meetbrief: "NL-2018-9012",
      groottonnage: 3865, inhoud: 4600, lengte: 110, breedte: 11.45,
      diepgang: 3.60, kruiphoogte: 7.50,
      bijzonderheidIds: [ids.bz_kraanschip], bronId: ids.br_auto_feed,
      relatieId: ids.rel_buiten, eigenaarId: ids.gb_lisa, prioriteit: 1,
    },
    {
      id: ids.vm_4, naam: "Amber", opmerking: "",
      beschikbaarVanaf: "2025-01-13", huidigeLocatieId: ids.hv_maasvlakte,
      eni: "02328901", vlag: "NL", meetbrief: "NL-2021-3456",
      groottonnage: 3795, inhoud: 4500, lengte: 105, breedte: 11.40,
      diepgang: 3.40, kruiphoogte: 7.00,
      bijzonderheidIds: [], bronId: ids.br_auto_feed,
      relatieId: ids.rel_cargo_solutions, eigenaarId: ids.gb_khoa, prioriteit: 0,
    },
    {
      id: ids.vm_5, naam: "Emily", opmerking: "",
      beschikbaarVanaf: "2025-01-12", huidigeLocatieId: ids.hv_waalhaven,
      eni: "02329012", vlag: "NL", meetbrief: "NL-2017-7890",
      groottonnage: 3000, inhoud: 3600, lengte: 100, breedte: 11.00,
      diepgang: 3.20, kruiphoogte: 6.80,
      bijzonderheidIds: [ids.bz_luikenkap], bronId: ids.br_telefoon,
      relatieId: ids.rel_vandijk, eigenaarId: null, prioriteit: 0,
    },
  ];
  for (const item of vaartuigMarkt) {
    const { id: itemId, ...rest } = item;
    add("vaartuig_markt:", itemId, rest);
  }

  // ── Vaartuig eigen ──
  const vaartuigEigen = [
    {
      id: ids.ve_1, naam: "Antonia V", opmerking: "Eigen vloot",
      beschikbaarVanaf: "2025-01-13", huidigeLocatieId: ids.hv_maasvlakte,
      eni: "02330123", vlag: "NL", meetbrief: "NL-2016-1234",
      groottonnage: 3795, inhoud: 4500, lengte: 105, breedte: 11.40,
      diepgang: 3.40, kruiphoogte: 7.00,
      bijzonderheidIds: [ids.bz_dubbele_huid], relatieId: ids.rel_rdj, eigenaarId: ids.gb_lisa,
      deadline: "2025-02-01",
    },
    {
      id: ids.ve_2, naam: "S.S. Anna", opmerking: "Eigen vloot",
      beschikbaarVanaf: "2025-02-23", huidigeLocatieId: ids.hv_bremerhaven,
      eni: "02331234", vlag: "NL", meetbrief: "NL-2019-5678",
      groottonnage: 2500, inhoud: 3000, lengte: 86, breedte: 9.50,
      diepgang: 2.80, kruiphoogte: 6.10,
      bijzonderheidIds: [], relatieId: ids.rel_rdj, eigenaarId: ids.gb_michiel,
      deadline: "2025-03-01",
    },
  ];
  for (const item of vaartuigEigen) {
    const { id: itemId, ...rest } = item;
    add("vaartuig_eigen:", itemId, rest);
  }

  // ── Biedingen ──
  const biedingen = [
    {
      id: ids.bod_1, opmerking: "", ladingId: ids.le_2, ladingType: "eigen",
      vaartuigId: ids.vm_1, vaartuigType: "markt",
      vrachtprijs: 3.50, tonnage: 2000,
      laaddatum: "2025-01-12T10:00:00", losdatum: "2025-01-20T18:00:00",
      laadtijd: 4, liggeldLaden: 0, lostijd: 8, liggeldLossen: 0,
      laagwaterToeslag: 0, status: "verstuurd",
    },
    {
      id: ids.bod_2, opmerking: "", ladingId: ids.le_2, ladingType: "eigen",
      vaartuigId: ids.vm_2, vaartuigType: "markt",
      vrachtprijs: 3.00, tonnage: 2000,
      laaddatum: "2025-02-10T08:00:00", losdatum: "2025-02-15T12:00:00",
      laadtijd: 4, liggeldLaden: 0, lostijd: 8, liggeldLossen: 0,
      laagwaterToeslag: 0, status: "verstuurd",
    },
    {
      id: ids.bod_3, opmerking: "", ladingId: ids.le_2, ladingType: "eigen",
      vaartuigId: ids.vm_3, vaartuigType: "markt",
      vrachtprijs: 2.80, tonnage: 2000,
      laaddatum: "2025-02-08T06:00:00", losdatum: "2025-02-12T10:00:00",
      laadtijd: 4, liggeldLaden: 0, lostijd: 8, liggeldLossen: 0,
      laagwaterToeslag: 0, status: "verstuurd",
    },
    {
      id: ids.bod_4, opmerking: "", ladingId: ids.le_2, ladingType: "eigen",
      vaartuigId: null, vaartuigType: null,
      vrachtprijs: 3.00, tonnage: 2000,
      laaddatum: "2025-02-07T08:00:00", losdatum: "2025-02-14T16:00:00",
      laadtijd: 4, liggeldLaden: 0, lostijd: 8, liggeldLossen: 0,
      laagwaterToeslag: 0, status: "ontvangen",
    },
    {
      id: ids.bod_5, opmerking: "", ladingId: ids.le_2, ladingType: "eigen",
      vaartuigId: null, vaartuigType: null,
      vrachtprijs: 3.25, tonnage: 2000,
      laaddatum: "2025-02-06T09:00:00", losdatum: "2025-02-13T14:00:00",
      laadtijd: 4, liggeldLaden: 0, lostijd: 8, liggeldLossen: 0,
      laagwaterToeslag: 0, status: "verstuurd",
    },
    {
      id: ids.bod_6, opmerking: "", ladingId: ids.le_2, ladingType: "eigen",
      vaartuigId: null, vaartuigType: null,
      vrachtprijs: 2.95, tonnage: 2000,
      laaddatum: "2025-02-06T07:00:00", losdatum: "2025-02-12T18:00:00",
      laadtijd: 4, liggeldLaden: 0, lostijd: 8, liggeldLossen: 0,
      laagwaterToeslag: 0, status: "verstuurd",
    },
    {
      id: ids.bod_7, opmerking: "", ladingId: ids.le_2, ladingType: "eigen",
      vaartuigId: null, vaartuigType: null,
      vrachtprijs: 3.10, tonnage: 2000,
      laaddatum: "2025-02-05T10:00:00", losdatum: "2025-02-10T12:00:00",
      laadtijd: 4, liggeldLaden: 0, lostijd: 8, liggeldLossen: 0,
      laagwaterToeslag: 0, status: "goedgekeurd",
    },
    {
      id: ids.bod_8, opmerking: "", ladingId: ids.le_2, ladingType: "eigen",
      vaartuigId: null, vaartuigType: null,
      vrachtprijs: 3.40, tonnage: 2000,
      laaddatum: "2025-02-05T08:00:00", losdatum: "2025-02-09T14:00:00",
      laadtijd: 4, liggeldLaden: 0, lostijd: 8, liggeldLossen: 0,
      laagwaterToeslag: 0, status: "verstuurd",
    },
    {
      id: ids.bod_9, opmerking: "", ladingId: ids.le_2, ladingType: "eigen",
      vaartuigId: null, vaartuigType: null,
      vrachtprijs: 0, tonnage: 2000,
      laaddatum: null, losdatum: null,
      laadtijd: null, liggeldLaden: 0, lostijd: null, liggeldLossen: 0,
      laagwaterToeslag: 0, status: "afgekeurd",
    },
  ];
  for (const item of biedingen) {
    const { id: itemId, ...rest } = item;
    add("bod:", itemId, rest);
  }

  // ── Onderhandelingen ──
  const onderhandelingen = [
    { id: ids.ond_1, bodId: ids.bod_1, relatieId: ids.rel_janson, deadline: "2025-02-14T16:00:00" },
    { id: ids.ond_2, bodId: ids.bod_2, relatieId: ids.rel_volharding, deadline: "2025-02-10T09:00:00" },
    { id: ids.ond_3, bodId: ids.bod_3, relatieId: ids.rel_alfa, deadline: "2025-02-11T10:00:00" },
    { id: ids.ond_4, bodId: ids.bod_4, relatieId: ids.rel_abel, deadline: "2025-02-11T11:00:00" },
    { id: ids.ond_5, bodId: ids.bod_5, relatieId: ids.rel_vaartwat, deadline: "2025-02-19T11:15:00" },
    { id: ids.ond_6, bodId: ids.bod_6, relatieId: ids.rel_plavo, deadline: "2025-02-20" },
    { id: ids.ond_7, bodId: ids.bod_7, relatieId: ids.rel_blauwegolf, deadline: "2025-02-20" },
    { id: ids.ond_8, bodId: ids.bod_8, relatieId: ids.rel_ijsseldelta, deadline: "2025-02-21" },
    { id: ids.ond_9, bodId: ids.bod_9, relatieId: ids.rel_nieuwehanse, deadline: "" },
  ];
  for (const item of onderhandelingen) {
    const { id: itemId, ...rest } = item;
    add("onderhandeling:", itemId, rest);
  }

  return { keys, values };
}

export async function seedDatabase(): Promise<{ count: number }> {
  const { keys, values } = buildSeedData();

  // Batch in groups of 50 to avoid too-large requests
  const batchSize = 50;
  for (let i = 0; i < keys.length; i += batchSize) {
    const batchKeys = keys.slice(i, i + batchSize);
    const batchValues = values.slice(i, i + batchSize);
    await kv.mset(batchKeys, batchValues);
  }

  return { count: keys.length };
}