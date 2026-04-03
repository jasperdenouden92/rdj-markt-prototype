import type { Relatie, ContactPersoon, SoortRelatie } from "./api";

import imgEricNieuwkoop from "../../assets/a2737d3b5b234fc04041650cb9f114889c6859da.png";
import imgKhoaNguyen from "../../assets/3627de284acb374a4d9313b3c2dbaeeb87a48224.png";
import imgPelgerDeJong from "../../assets/e7809035038b3816de2a1d67c5de86ebeed325d0.png";
import imgJanWillemVdKraan from "../../assets/9e45f45f537bea4bf653bc0307471e5ff5545f63.png";

export const SOORT_RELATIE_OPTIES: { value: SoortRelatie; label: string }[] = [
  { value: "lading-eigenaar", label: "Lading-eigenaar" },
  { value: "bevrachter", label: "Bevrachter" },
  { value: "scheepseigenaar", label: "Scheepseigenaar" },
  { value: "controleorganisatie", label: "Controleorganisatie" },
  { value: "terminal", label: "Terminal" },
];

export const LADINGGROEP_SUGGESTIES = [
  "Agri",
  "Constructie",
  "Bouwmaterialen",
  "Chemie",
  "Staal",
  "Containers",
  "Kolen & ertsen",
  "Zand & grind",
  "Meststoffen",
  "Overig",
];

export const FUNCTIE_SUGGESTIES = [
  "Directeur",
  "Bevrachter",
  "Planner",
  "Commercieel medewerker",
  "Operations manager",
  "Logistiek coördinator",
  "Accountmanager",
  "Administratie",
];

export const mockRelaties: Relatie[] = [
  {
    id: "rel-001",
    naam: "Provaart Logistics BV",
    contactPersoonIds: ["cp-001", "cp-002"],
    adres: "Maashaven OZ 80",
    postcode: "3072 MV",
    plaats: "Rotterdam",
    land: "Nederland",
    telefoon: "+31 10 234 5678",
    email: "info@provaart.nl",
    website: "www.provaart.nl",
    ladingGroepen: ["Agri", "Bouwmaterialen"],
    soortRelatie: ["lading-eigenaar", "bevrachter"],
    eigenaarId: "usr-001",
    status: "actief",
    contactFrequentie: "wekelijks",
    laatsteContact: "2026-03-08",
    opmerkingen: "Grote klant, altijd bereikbaar via Jan. Betrouwbare betaler.",
  },
  {
    id: "rel-002",
    naam: "Janlow B.V.",
    contactPersoonIds: ["cp-003"],
    adres: "Industrieweg 42",
    postcode: "3316 AB",
    plaats: "Dordrecht",
    land: "Nederland",
    telefoon: "+31 78 654 3210",
    email: "info@janlow.nl",
    ladingGroepen: ["Constructie", "Staal"],
    soortRelatie: ["lading-eigenaar"],
    eigenaarId: "usr-002",
    status: "actief",
    contactFrequentie: "maandelijks",
    laatsteContact: "2026-02-20",
  },
  {
    id: "rel-003",
    naam: "Cargill N.V.",
    contactPersoonIds: ["cp-004", "cp-005", "cp-006"],
    adres: "Kanaaldijk 100",
    postcode: "1047 HH",
    plaats: "Amsterdam",
    land: "Nederland",
    telefoon: "+31 20 567 8901",
    email: "logistics@cargill.com",
    website: "www.cargill.com",
    ladingGroepen: ["Agri", "Meststoffen", "Chemie"],
    soortRelatie: ["lading-eigenaar"],
    eigenaarId: "usr-001",
    status: "actief",
    contactFrequentie: "wekelijks",
    laatsteContact: "2026-03-10",
    opmerkingen: "Multinational. Meerdere contactpersonen per afdeling.",
  },
  {
    id: "rel-004",
    naam: "De Volharding C.V.",
    contactPersoonIds: ["cp-007"],
    adres: "Havenstraat 15",
    postcode: "2991 BD",
    plaats: "Barendrecht",
    land: "Nederland",
    telefoon: "+31 180 612 345",
    email: "info@devolharding.nl",
    ladingGroepen: ["Zand & grind", "Bouwmaterialen"],
    soortRelatie: ["bevrachter"],
    eigenaarId: "usr-003",
    status: "actief",
    contactFrequentie: "kwartaal",
    laatsteContact: "2026-01-15",
  },
  {
    id: "rel-005",
    naam: "Rederij Alfa",
    contactPersoonIds: ["cp-008", "cp-009"],
    adres: "Waalhaven Z.Z. 22",
    postcode: "3089 JH",
    plaats: "Rotterdam",
    land: "Nederland",
    telefoon: "+31 10 429 5000",
    email: "charter@rederij-alfa.nl",
    website: "www.rederij-alfa.nl",
    ladingGroepen: ["Containers", "Staal"],
    soortRelatie: ["scheepseigenaar", "bevrachter"],
    eigenaarId: "usr-002",
    status: "actief",
    contactFrequentie: "wekelijks",
    laatsteContact: "2026-03-07",
  },
  {
    id: "rel-006",
    naam: "Van Oord Transport",
    contactPersoonIds: ["cp-010"],
    adres: "Schaardijk 55",
    postcode: "3063 NH",
    plaats: "Rotterdam",
    land: "Nederland",
    telefoon: "+31 10 282 3456",
    email: "transport@vanoord.com",
    ladingGroepen: ["Zand & grind", "Constructie"],
    soortRelatie: ["lading-eigenaar", "scheepseigenaar"],
    eigenaarId: "usr-001",
    status: "prospect",
    contactFrequentie: "geen",
    laatsteContact: "2026-02-01",
    opmerkingen: "Eerste contact via beurs. Nog geen concrete deal.",
  },
  {
    id: "rel-007",
    naam: "Boskalis Nederland",
    contactPersoonIds: ["cp-011", "cp-012"],
    adres: "Rosmolenweg 20",
    postcode: "3356 LK",
    plaats: "Papendrecht",
    land: "Nederland",
    telefoon: "+31 78 696 9000",
    email: "info@boskalis.com",
    website: "www.boskalis.com",
    ladingGroepen: ["Zand & grind", "Kolen & ertsen"],
    soortRelatie: ["lading-eigenaar"],
    eigenaarId: "usr-003",
    status: "actief",
    contactFrequentie: "maandelijks",
    laatsteContact: "2026-03-01",
  },
  {
    id: "rel-008",
    naam: "Heidelberg Materials",
    contactPersoonIds: ["cp-013"],
    adres: "Betonweg 3",
    postcode: "6222 NL",
    plaats: "Maastricht",
    land: "Nederland",
    telefoon: "+31 43 350 1200",
    email: "logistics@heidelbergmaterials.com",
    ladingGroepen: ["Bouwmaterialen"],
    soortRelatie: ["lading-eigenaar", "terminal"],
    eigenaarId: "usr-002",
    status: "actief",
    contactFrequentie: "maandelijks",
    laatsteContact: "2026-02-28",
  },
  {
    id: "rel-009",
    naam: "Terberg Transport BV",
    contactPersoonIds: [],
    adres: "Binnenhaven 60",
    postcode: "4691 EL",
    plaats: "Tholen",
    land: "Nederland",
    telefoon: "+31 166 600 700",
    email: "info@terberg-transport.nl",
    ladingGroepen: ["Chemie", "Overig"],
    soortRelatie: ["bevrachter"],
    status: "inactief",
    contactFrequentie: "geen",
    laatsteContact: "2025-06-15",
    opmerkingen: "Relatie gepauzeerd na conflict over betalingstermijnen.",
  },
  {
    id: "rel-010",
    naam: "Viterra Trading",
    contactPersoonIds: ["cp-014", "cp-015"],
    adres: "Westerlaan 10",
    postcode: "3016 CK",
    plaats: "Rotterdam",
    land: "Nederland",
    telefoon: "+31 10 280 6000",
    email: "chartering@viterra.com",
    website: "www.viterra.com",
    ladingGroepen: ["Agri", "Meststoffen"],
    soortRelatie: ["lading-eigenaar", "bevrachter"],
    eigenaarId: "usr-001",
    status: "actief",
    contactFrequentie: "wekelijks",
    laatsteContact: "2026-03-09",
  },
  {
    id: "rel-011",
    naam: "Rhenus Logistics BV",
    contactPersoonIds: ["cp-016"],
    adres: "Veilingweg 10",
    postcode: "2651 BE",
    plaats: "Berkel en Rodenrijs",
    land: "Nederland",
    telefoon: "+31 10 292 8000",
    email: "info@rhenus.com",
    website: "www.rhenus.com",
    ladingGroepen: ["Containers", "Overig"],
    soortRelatie: ["bevrachter", "controleorganisatie"],
    eigenaarId: "usr-003",
    status: "prospect",
    contactFrequentie: "geen",
    laatsteContact: "2026-03-05",
  },
  {
    id: "rel-012",
    naam: "Duisburg Hafen AG",
    contactPersoonIds: ["cp-017"],
    adres: "Hafenstraße 1",
    postcode: "47119",
    plaats: "Duisburg",
    land: "Duitsland",
    telefoon: "+49 203 803 0",
    email: "info@duisport.de",
    website: "www.duisport.de",
    ladingGroepen: ["Staal", "Kolen & ertsen", "Containers"],
    soortRelatie: ["terminal"],
    eigenaarId: "usr-002",
    status: "actief",
    contactFrequentie: "kwartaal",
    laatsteContact: "2026-02-10",
  },
];

export const mockContactPersonen: ContactPersoon[] = [
  { id: "cp-001", naam: "Jan de Vries", functie: "Bevrachter", email: "j.devries@provaart.nl", telefoon: "+31 6 1234 5678", relatieId: "rel-001" },
  { id: "cp-002", naam: "Maria Bakker", functie: "Operations manager", email: "m.bakker@provaart.nl", telefoon: "+31 6 2345 6789", relatieId: "rel-001" },
  { id: "cp-003", naam: "Pieter Jansen", functie: "Directeur", email: "p.jansen@janlow.nl", telefoon: "+31 6 3456 7890", relatieId: "rel-002" },
  { id: "cp-004", naam: "Sophie van Dam", functie: "Commercieel medewerker", email: "s.vandam@cargill.com", telefoon: "+31 6 4567 8901", relatieId: "rel-003" },
  { id: "cp-005", naam: "Tom Hendriks", functie: "Planner", email: "t.hendriks@cargill.com", telefoon: "+31 6 5678 9012", relatieId: "rel-003" },
  { id: "cp-006", naam: "Lisa Smit", functie: "Accountmanager", email: "l.smit@cargill.com", telefoon: "+31 6 6789 0123", relatieId: "rel-003" },
  { id: "cp-007", naam: "Kees Visser", functie: "Bevrachter", email: "k.visser@devolharding.nl", telefoon: "+31 6 7890 1234", relatieId: "rel-004" },
  { id: "cp-008", naam: "Anne Mulder", functie: "Planner", email: "a.mulder@rederij-alfa.nl", telefoon: "+31 6 8901 2345", relatieId: "rel-005" },
  { id: "cp-009", naam: "Robert Bos", functie: "Directeur", email: "r.bos@rederij-alfa.nl", telefoon: "+31 6 9012 3456", relatieId: "rel-005" },
  { id: "cp-010", naam: "Emma de Groot", functie: "Logistiek coördinator", email: "e.degroot@vanoord.com", telefoon: "+31 6 0123 4567", relatieId: "rel-006" },
  { id: "cp-011", naam: "Daan Peters", functie: "Bevrachter", email: "d.peters@boskalis.com", telefoon: "+31 6 1111 2222", relatieId: "rel-007" },
  { id: "cp-012", naam: "Floor Willems", functie: "Operations manager", email: "f.willems@boskalis.com", telefoon: "+31 6 3333 4444", relatieId: "rel-007" },
  { id: "cp-013", naam: "Hans Brouwer", functie: "Planner", email: "h.brouwer@heidelberg.com", telefoon: "+31 6 5555 6666", relatieId: "rel-008" },
  { id: "cp-014", naam: "Noor van den Berg", functie: "Bevrachter", email: "n.vandenberg@viterra.com", telefoon: "+31 6 7777 8888", relatieId: "rel-010" },
  { id: "cp-015", naam: "Thijs Dekker", functie: "Commercieel medewerker", email: "t.dekker@viterra.com", telefoon: "+31 6 9999 0000", relatieId: "rel-010" },
  { id: "cp-016", naam: "Mara Kok", functie: "Accountmanager", email: "m.kok@rhenus.com", telefoon: "+31 6 1212 3434", relatieId: "rel-011" },
  { id: "cp-017", naam: "Klaus Müller", functie: "Hafenmeister", email: "k.mueller@duisport.de", telefoon: "+49 170 123 4567", relatieId: "rel-012" },
];

/** Mock aantallen ladingen, vaartuigen en onderhandelingen per relatie */
export const mockRelatieCounts: Record<string, { ladingen: number; vaartuigen: number; onderhandelingen: number }> = {
  "rel-001": { ladingen: 8, vaartuigen: 3, onderhandelingen: 2 },
  "rel-002": { ladingen: 4, vaartuigen: 1, onderhandelingen: 1 },
  "rel-003": { ladingen: 12, vaartuigen: 5, onderhandelingen: 4 },
  "rel-004": { ladingen: 2, vaartuigen: 1, onderhandelingen: 0 },
  "rel-005": { ladingen: 6, vaartuigen: 4, onderhandelingen: 3 },
  "rel-006": { ladingen: 0, vaartuigen: 0, onderhandelingen: 0 },
  "rel-007": { ladingen: 5, vaartuigen: 2, onderhandelingen: 1 },
  "rel-008": { ladingen: 3, vaartuigen: 1, onderhandelingen: 1 },
  "rel-009": { ladingen: 0, vaartuigen: 0, onderhandelingen: 0 },
  "rel-010": { ladingen: 7, vaartuigen: 3, onderhandelingen: 2 },
  "rel-011": { ladingen: 0, vaartuigen: 0, onderhandelingen: 0 },
  "rel-012": { ladingen: 3, vaartuigen: 2, onderhandelingen: 1 },
};

/** Mock ladingen per relatie */
export interface RelatieLading {
  id: string;
  relatieId: string;
  contractId?: string;
  ladingSoortId?: string;
  subsoortId?: string;
  titel: string;
  laadlocatie: string;
  loslocatie: string;
  tonnage: string;
  product: string;
  laaddatum?: string;
  losdatum?: string;
  status: "inbox" | "intake" | "werklijst" | "markt" | "gesloten";
  prioriteit?: number;
  matches: number;
  onderhandelingen: number;
  // Step 1 extra fields
  contactPersoonId?: string;
  soortelijkGewicht?: number;
  bijzonderheidIds?: string[];
  exType?: "zeeboot" | "opslag" | "vloot";
  exNaam?: string;
  controleOrganisatie?: string;
  notitie?: string;
  // Step 2 extra fields
  laadterminal?: string;
  aankomst?: string;
  startLaden?: string;
  enkeleBestemming?: boolean;
  losterminal?: string;
  lostermijn?: string;
  startLossen?: string;
  eindeLossen?: string;
  regie?: "flex" | "duwvaart" | "binnenvaart";
}

export const mockRelatieLadingen: RelatieLading[] = [
  // Bevrachting (aanbieden): intake, werklijst, markt
  { id: "rl-001", relatieId: "rel-001", ladingSoortId: "ls-003", titel: "PRO001", exNaam: "m/v Abis Dover", laadlocatie: "Salzgitter Stichkanal", loslocatie: "Hamburg Veddelkanal", tonnage: "2.000 ton", product: "Houtpellets (DSIT)", laaddatum: "2026-03-14", losdatum: "2026-03-17", status: "markt", matches: 5, onderhandelingen: 2 },
  { id: "rl-002", relatieId: "rel-001", contractId: "ctr-001", ladingSoortId: "ls-001", titel: "PRO002", exNaam: "m/v A2B Future", laadlocatie: "Rotterdam", loslocatie: "Krefeld", tonnage: "3.500 ton", product: "Graan", laaddatum: "2026-03-18", losdatum: "2026-03-21", status: "werklijst", matches: 3, onderhandelingen: 0 },
  { id: "rl-003", relatieId: "rel-001", ladingSoortId: "ls-005", titel: "PRO003", laadlocatie: "Amsterdam", loslocatie: "Mannheim", tonnage: "4.000 ton", product: "Meststoffen", laaddatum: "2026-03-22", status: "intake", matches: 0, onderhandelingen: 0 },
  { id: "rl-004", relatieId: "rel-002", contractId: "ctr-002", ladingSoortId: "ls-004", titel: "JAN001", exNaam: "m/v Maran Future", laadlocatie: "Dordrecht", loslocatie: "Antwerpen", tonnage: "3.000 ton", product: "Staal", laaddatum: "2026-03-15", losdatum: "2026-03-17", status: "markt", matches: 4, onderhandelingen: 1 },
  { id: "rl-005", relatieId: "rel-002", ladingSoortId: "ls-004", titel: "JAN002", exNaam: "m/v Merganser", laadlocatie: "Dordrecht", loslocatie: "Gent", tonnage: "2.500 ton", product: "Staal", laaddatum: "2026-03-20", status: "werklijst", matches: 2, onderhandelingen: 0 },
  { id: "rl-006", relatieId: "rel-003", ladingSoortId: "ls-007", titel: "CAR001", exNaam: "m/v Abis Dover", laadlocatie: "Rotterdam Botlek", loslocatie: "Basel", tonnage: "3.500 ton", product: "Sojabonen", laaddatum: "2026-03-16", losdatum: "2026-03-22", status: "markt", matches: 6, onderhandelingen: 3 },
  { id: "rl-007", relatieId: "rel-003", ladingSoortId: "ls-001", titel: "CAR002", laadlocatie: "Amsterdam", loslocatie: "Strasbourg", tonnage: "3.000 ton", product: "Graan", status: "intake", matches: 0, onderhandelingen: 0 },
  { id: "rl-008", relatieId: "rel-004", contractId: "ctr-004", ladingSoortId: "ls-002", titel: "VOL001", laadlocatie: "Barendrecht", loslocatie: "Rotterdam Europoort", tonnage: "1.800 ton", product: "Zand", laaddatum: "2026-03-14", losdatum: "2026-03-14", status: "gesloten", matches: 0, onderhandelingen: 0 },
  { id: "rl-009", relatieId: "rel-005", ladingSoortId: "ls-008", titel: "ALF001", exNaam: "m/v A2B Future", laadlocatie: "Rotterdam", loslocatie: "Antwerpen", tonnage: "2.000 ton", product: "Containers", laaddatum: "2026-03-19", losdatum: "2026-03-20", status: "markt", matches: 3, onderhandelingen: 1 },
  { id: "rl-010", relatieId: "rel-007", ladingSoortId: "ls-009", titel: "BOS001", exNaam: "m/v Maran Future", laadlocatie: "Papendrecht", loslocatie: "Rotterdam", tonnage: "3.000 ton", product: "Grind", laaddatum: "2026-03-17", status: "werklijst", matches: 2, onderhandelingen: 0 },
  { id: "rl-011", relatieId: "rel-008", contractId: "ctr-009", ladingSoortId: "ls-006", titel: "HEI001", laadlocatie: "Maastricht", loslocatie: "Luik", tonnage: "2.200 ton", product: "Kolen", laaddatum: "2026-03-12", losdatum: "2026-03-13", status: "gesloten", matches: 0, onderhandelingen: 0 },
  { id: "rl-012", relatieId: "rel-010", contractId: "ctr-006", ladingSoortId: "ls-007", titel: "VIT001", laadlocatie: "Rotterdam Botlek", loslocatie: "Rotterdam Botlek", tonnage: "5.000 ton", product: "Sojabonen", laaddatum: "2026-03-21", status: "intake", matches: 0, onderhandelingen: 0 },
  { id: "rl-013", relatieId: "rel-012", ladingSoortId: "ls-008", titel: "DUI001", exNaam: "m/v Merganser", laadlocatie: "Rotterdam", loslocatie: "Duisburg", tonnage: "2.000 ton", product: "Containers", laaddatum: "2026-03-23", losdatum: "2026-03-25", status: "markt", matches: 4, onderhandelingen: 2 },
  // Ladinguitvraag (bekende ladingen per relatie): inbox
  { id: "rl-101", relatieId: "rel-001", ladingSoortId: "ls-003", titel: "PRO004", laadlocatie: "Hamburg Veddelkanal", loslocatie: "Salzgitter Stichkanal", tonnage: "1.500 ton", product: "Houtpellets", laaddatum: "2026-03-20", losdatum: "2026-03-22", status: "inbox", prioriteit: 4, matches: 0, onderhandelingen: 0 },
  { id: "rl-102", relatieId: "rel-001", ladingSoortId: "ls-001", titel: "PRO005", laadlocatie: "Krefeld", loslocatie: "Rotterdam", tonnage: "2.000 ton", product: "Graan", status: "inbox", prioriteit: 2, matches: 0, onderhandelingen: 0 },
  { id: "rl-103", relatieId: "rel-002", ladingSoortId: "ls-004", titel: "JAN003", laadlocatie: "Antwerpen", loslocatie: "Dordrecht", tonnage: "3.000 ton", product: "Staal", laaddatum: "2026-03-18", status: "inbox", prioriteit: 5, matches: 0, onderhandelingen: 0 },
  { id: "rl-104", relatieId: "rel-002", ladingSoortId: "ls-002", titel: "JAN004", laadlocatie: "Gent", loslocatie: "Rotterdam", tonnage: "2.500 ton", product: "Zand", status: "inbox", prioriteit: 0, matches: 0, onderhandelingen: 0 },
  { id: "rl-105", relatieId: "rel-003", ladingSoortId: "ls-007", titel: "CAR003", laadlocatie: "Basel", loslocatie: "Rotterdam Botlek", tonnage: "4.000 ton", product: "Sojabonen", laaddatum: "2026-03-24", losdatum: "2026-03-28", status: "inbox", prioriteit: 3, matches: 0, onderhandelingen: 0 },
];

/** Mock vaartuigen per relatie */
export interface RelatieVaartuig {
  id: string;
  relatieId: string;
  naam: string;
  type: string;
  capaciteit: string;
  locatie: string;
  beschikbaarVanaf: string;
  status: "inbox" | "intake" | "werklijst" | "markt" | "gesloten";
  prioriteit?: number;
  matches: number;
  onderhandelingen: number;
}

const VAARTUIG_STATUS_MAP: Record<string, string> = {
  inbox: "Inbox",
  intake: "Intake",
  werklijst: "Werklijst",
  markt: "Markt",
  gesloten: "Gesloten",
};

export { VAARTUIG_STATUS_MAP };

export const mockRelatieVaartuigen: RelatieVaartuig[] = [
  { id: "rv-001", relatieId: "rel-001", naam: "Emily", type: "Motorschip", capaciteit: "3.000 ton", locatie: "Waalhaven", beschikbaarVanaf: "2026-03-12", status: "markt", matches: 4, onderhandelingen: 1 },
  { id: "rv-002", relatieId: "rel-001", naam: "Agaat", type: "Motorschip", capaciteit: "2.500 ton", locatie: "Krefeld", beschikbaarVanaf: "2026-03-19", status: "werklijst", matches: 2, onderhandelingen: 0 },
  { id: "rv-003", relatieId: "rel-002", naam: "S.S. Anna", type: "Motorschip", capaciteit: "2.500 ton", locatie: "Bremerhaven", beschikbaarVanaf: "2026-03-14", status: "markt", matches: 3, onderhandelingen: 1 },
  { id: "rv-004", relatieId: "rel-003", naam: "Bregje", type: "Motorschip", capaciteit: "3.000 ton", locatie: "Rotterdam Botlek", beschikbaarVanaf: "2026-03-16", status: "markt", matches: 5, onderhandelingen: 2 },
  { id: "rv-005", relatieId: "rel-003", naam: "Hercules", type: "Motorschip", capaciteit: "3.000 ton", locatie: "Basel", beschikbaarVanaf: "2026-03-22", status: "intake", matches: 1, onderhandelingen: 0 },
  { id: "rv-006", relatieId: "rel-004", naam: "Antonia V", type: "Motorschip", capaciteit: "4.200 ton", locatie: "Barendrecht", beschikbaarVanaf: "2026-03-14", status: "werklijst", matches: 3, onderhandelingen: 0 },
  { id: "rv-007", relatieId: "rel-005", naam: "Duwbak Alfa-1", type: "Duwbak", capaciteit: "2.000 ton", locatie: "Rotterdam", beschikbaarVanaf: "2026-04-01", status: "gesloten", matches: 0, onderhandelingen: 0 },
  { id: "rv-008", relatieId: "rel-005", naam: "Duwbak Alfa-2", type: "Duwbak", capaciteit: "2.000 ton", locatie: "Moerdijk", beschikbaarVanaf: "2026-03-15", status: "markt", matches: 2, onderhandelingen: 1 },
  { id: "rv-009", relatieId: "rel-007", naam: "Merganser", type: "Motorschip", capaciteit: "2.000 ton", locatie: "Papendrecht", beschikbaarVanaf: "2026-03-18", status: "intake", matches: 3, onderhandelingen: 1 },
  { id: "rv-010", relatieId: "rel-010", naam: "Amber", type: "Motorschip", capaciteit: "4.500 ton", locatie: "Rotterdam Botlek", beschikbaarVanaf: "2026-03-20", status: "markt", matches: 4, onderhandelingen: 0 },
  { id: "rv-011", relatieId: "rel-012", naam: "Rhein Trader", type: "Motorschip", capaciteit: "2.800 ton", locatie: "Duisburg", beschikbaarVanaf: "2026-03-24", status: "werklijst", matches: 2, onderhandelingen: 1 },
];

/** Mock lading matches (vaartuigen die passen bij een lading) */
export interface RelatieLadingMatch {
  id: string;
  ladingId: string;
  vaartuigNaam: string;
  vaartuigType: string;
  relatie: string;
  contactPersoon: string;
  locatie: string;
  locatieDatum: string;
  groottonnage: string;
  inhoud: string;
  bron: string;
  bronDatum: string;
  matchPercentage: number;
  isEigen: boolean;
}

export const mockRelatieLadingMatches: RelatieLadingMatch[] = [
  { id: "rlm-001", ladingId: "rl-001", vaartuigNaam: "Emily", vaartuigType: "Motorschip", relatie: "Provaart Logistics BV", contactPersoon: "Jan de Vries", locatie: "Waalhaven", locatieDatum: "Ma 10 Mrt", groottonnage: "3.000 mt", inhoud: "3.800 m³", bron: "Eigen vloot", bronDatum: "Do 6 Mrt 12:44", matchPercentage: 92, isEigen: true },
  { id: "rlm-002", ladingId: "rl-001", vaartuigNaam: "Agaat", vaartuigType: "Motorschip", relatie: "Provaart Logistics BV", contactPersoon: "Jan de Vries", locatie: "Krefeld", locatieDatum: "Wo 12 Mrt", groottonnage: "2.500 mt", inhoud: "3.200 m³", bron: "Eigen vloot", bronDatum: "Do 6 Mrt 14:20", matchPercentage: 85, isEigen: true },
  { id: "rlm-003", ladingId: "rl-001", vaartuigNaam: "S.S. Anna", vaartuigType: "Motorschip", relatie: "Janlow B.V.", contactPersoon: "Pieter Jansen", locatie: "Bremerhaven", locatieDatum: "Di 11 Mrt", groottonnage: "2.500 mt", inhoud: "3.000 m³", bron: "Automatische feed", bronDatum: "Vr 7 Mrt 09:15", matchPercentage: 78, isEigen: false },
  { id: "rlm-004", ladingId: "rl-001", vaartuigNaam: "Rhein Trader", vaartuigType: "Motorschip", relatie: "Duisburg Hafen AG", contactPersoon: "Klaus Müller", locatie: "Duisburg", locatieDatum: "Do 13 Mrt", groottonnage: "2.800 mt", inhoud: "3.500 m³", bron: "Automatische feed", bronDatum: "Vr 7 Mrt 11:30", matchPercentage: 72, isEigen: false },
  { id: "rlm-005", ladingId: "rl-001", vaartuigNaam: "Merganser", vaartuigType: "Motorschip", relatie: "Boskalis Nederland", contactPersoon: "Daan Peters", locatie: "Papendrecht", locatieDatum: "Ma 10 Mrt", groottonnage: "2.000 mt", inhoud: "2.500 m³", bron: "Automatische feed", bronDatum: "Za 8 Mrt 16:00", matchPercentage: 65, isEigen: false },
  { id: "rlm-006", ladingId: "rl-004", vaartuigNaam: "Antonia V", vaartuigType: "Motorschip", relatie: "De Volharding C.V.", contactPersoon: "Kees Visser", locatie: "Barendrecht", locatieDatum: "Ma 10 Mrt", groottonnage: "4.200 mt", inhoud: "5.200 m³", bron: "Eigen vloot", bronDatum: "Vr 7 Mrt 08:00", matchPercentage: 88, isEigen: true },
  { id: "rlm-007", ladingId: "rl-004", vaartuigNaam: "Bregje", vaartuigType: "Motorschip", relatie: "Cargill N.V.", contactPersoon: "Sophie van Dam", locatie: "Rotterdam Botlek", locatieDatum: "Di 11 Mrt", groottonnage: "3.000 mt", inhoud: "3.800 m³", bron: "Automatische feed", bronDatum: "Do 6 Mrt 15:45", matchPercentage: 76, isEigen: false },
  { id: "rlm-008", ladingId: "rl-006", vaartuigNaam: "Amber", vaartuigType: "Motorschip", relatie: "Viterra Trading", contactPersoon: "Noor van den Berg", locatie: "Rotterdam Botlek", locatieDatum: "Ma 10 Mrt", groottonnage: "4.500 mt", inhoud: "5.600 m³", bron: "Eigen vloot", bronDatum: "Do 6 Mrt 10:30", matchPercentage: 94, isEigen: true },
  { id: "rlm-009", ladingId: "rl-006", vaartuigNaam: "Emily", vaartuigType: "Motorschip", relatie: "Provaart Logistics BV", contactPersoon: "Jan de Vries", locatie: "Waalhaven", locatieDatum: "Ma 10 Mrt", groottonnage: "3.000 mt", inhoud: "3.800 m³", bron: "Automatische feed", bronDatum: "Vr 7 Mrt 14:00", matchPercentage: 82, isEigen: false },
  { id: "rlm-010", ladingId: "rl-009", vaartuigNaam: "Duwbak Alfa-2", vaartuigType: "Duwbak", relatie: "Rederij Alfa", contactPersoon: "Anne Mulder", locatie: "Moerdijk", locatieDatum: "Di 11 Mrt", groottonnage: "2.000 mt", inhoud: "2.400 m³", bron: "Eigen vloot", bronDatum: "Do 6 Mrt 09:00", matchPercentage: 80, isEigen: true },
  { id: "rlm-011", ladingId: "rl-013", vaartuigNaam: "Rhein Trader", vaartuigType: "Motorschip", relatie: "Duisburg Hafen AG", contactPersoon: "Klaus Müller", locatie: "Duisburg", locatieDatum: "Do 13 Mrt", groottonnage: "2.800 mt", inhoud: "3.500 m³", bron: "Eigen vloot", bronDatum: "Vr 7 Mrt 11:30", matchPercentage: 90, isEigen: true },
];

/** Mock vaartuig matches (ladingen die passen bij een vaartuig) */
export interface RelatieVaartuigMatch {
  id: string;
  vaartuigId: string;
  ladingTitel: string;
  tonnage: string;
  relatie: string;
  contactPersoon: string;
  laadLocatie: string;
  laadDatum: string;
  losLocatie: string;
  losDatum: string;
  bron: string;
  bronDatum: string;
  matchPercentage: number;
  isEigen: boolean;
}

export const mockRelatieVaartuigMatches: RelatieVaartuigMatch[] = [
  { id: "rvm-001", vaartuigId: "rv-001", ladingTitel: "2.000 ton Houtpellets (DSIT)", tonnage: "2.000 ton", relatie: "Provaart Logistics BV", contactPersoon: "Jan de Vries", laadLocatie: "Salzgitter Stichkanal", laadDatum: "Vr 14 Mrt 10:00", losLocatie: "Hamburg Veddelkanal", losDatum: "Di 18 Mrt 14:00", bron: "Eigen", bronDatum: "Do 6 Mrt 12:44", matchPercentage: 92, isEigen: true },
  { id: "rvm-002", vaartuigId: "rv-001", ladingTitel: "3.500 ton Graan", tonnage: "3.500 ton", relatie: "Provaart Logistics BV", contactPersoon: "Maria Bakker", laadLocatie: "Rotterdam", laadDatum: "Di 18 Mrt 08:00", losLocatie: "Krefeld", losDatum: "Vr 21 Mrt", bron: "Eigen", bronDatum: "Vr 7 Mrt 09:15", matchPercentage: 85, isEigen: true },
  { id: "rvm-003", vaartuigId: "rv-001", ladingTitel: "3.000 ton Staal", tonnage: "3.000 ton", relatie: "Janlow B.V.", contactPersoon: "Pieter Jansen", laadLocatie: "Dordrecht", laadDatum: "Za 15 Mrt 06:00", losLocatie: "Antwerpen", losDatum: "Ma 17 Mrt 14:00", bron: "Automatische feed", bronDatum: "Vr 7 Mrt 11:30", matchPercentage: 72, isEigen: false },
  { id: "rvm-004", vaartuigId: "rv-001", ladingTitel: "2.000 ton Containers", tonnage: "2.000 ton", relatie: "Rederij Alfa", contactPersoon: "Anne Mulder", laadLocatie: "Rotterdam", laadDatum: "Wo 19 Mrt 08:00", losLocatie: "Antwerpen", losDatum: "Do 20 Mrt 14:00", bron: "Automatische feed", bronDatum: "Za 8 Mrt 16:00", matchPercentage: 65, isEigen: false },
  { id: "rvm-005", vaartuigId: "rv-003", ladingTitel: "3.000 ton Staal", tonnage: "3.000 ton", relatie: "Janlow B.V.", contactPersoon: "Pieter Jansen", laadLocatie: "Dordrecht", laadDatum: "Za 15 Mrt 06:00", losLocatie: "Antwerpen", losDatum: "Ma 17 Mrt 14:00", bron: "Eigen", bronDatum: "Do 6 Mrt 15:45", matchPercentage: 88, isEigen: true },
  { id: "rvm-006", vaartuigId: "rv-004", ladingTitel: "3.500 ton Sojabonen", tonnage: "3.500 ton", relatie: "Cargill N.V.", contactPersoon: "Sophie van Dam", laadLocatie: "Rotterdam Botlek", laadDatum: "Zo 16 Mrt 08:00", losLocatie: "Basel", losDatum: "Do 20 Mrt", bron: "Eigen", bronDatum: "Do 6 Mrt 10:30", matchPercentage: 94, isEigen: true },
  { id: "rvm-007", vaartuigId: "rv-004", ladingTitel: "3.000 ton Graan", tonnage: "3.000 ton", relatie: "Cargill N.V.", contactPersoon: "Tom Hendriks", laadLocatie: "Amsterdam", laadDatum: "Di 25 Mrt 08:00", losLocatie: "Strasbourg", losDatum: "Za 29 Mrt", bron: "Eigen", bronDatum: "Vr 7 Mrt 14:00", matchPercentage: 82, isEigen: true },
  { id: "rvm-008", vaartuigId: "rv-008", ladingTitel: "2.000 ton Containers", tonnage: "2.000 ton", relatie: "Rederij Alfa", contactPersoon: "Anne Mulder", laadLocatie: "Rotterdam", laadDatum: "Wo 19 Mrt 08:00", losLocatie: "Antwerpen", losDatum: "Do 20 Mrt 14:00", bron: "Eigen", bronDatum: "Do 6 Mrt 09:00", matchPercentage: 80, isEigen: true },
  { id: "rvm-009", vaartuigId: "rv-009", ladingTitel: "3.000 ton Grind", tonnage: "3.000 ton", relatie: "Boskalis Nederland", contactPersoon: "Daan Peters", laadLocatie: "Papendrecht", laadDatum: "Ma 17 Mrt 06:00", losLocatie: "Rotterdam", losDatum: "Di 18 Mrt 10:00", bron: "Eigen", bronDatum: "Vr 7 Mrt 08:00", matchPercentage: 86, isEigen: true },
  { id: "rvm-010", vaartuigId: "rv-010", ladingTitel: "5.000 ton Sojabonen", tonnage: "5.000 ton", relatie: "Viterra Trading", contactPersoon: "Noor van den Berg", laadLocatie: "Rotterdam Botlek", laadDatum: "Vr 21 Mrt 08:00", losLocatie: "Rotterdam Botlek", losDatum: "Vr 21 Mrt 18:00", bron: "Eigen", bronDatum: "Do 6 Mrt 10:30", matchPercentage: 90, isEigen: true },
];

/** Mock gebruikers (eigenaren) — supplement existing API data */
export const mockGebruikers = [
  { id: "usr-001", naam: "Eric Nieuwkoop", profielfoto: imgEricNieuwkoop },
  { id: "usr-002", naam: "Khoa Nguyen", profielfoto: imgKhoaNguyen },
  { id: "usr-003", naam: "Pelger de Jong", profielfoto: imgPelgerDeJong },
  { id: "usr-004", naam: "Jan-Willem van der Kraan", profielfoto: imgJanWillemVdKraan },
];

/** Mail conversaties — gekoppeld via Outlook plugin aan relaties en/of deals */
export interface MailConversatie {
  id: string;
  relatieId: string;
  contractId?: string;
  onderwerp: string;
  van: { naam: string; email: string };
  aan: { naam: string; email: string }[];
  berichten: MailBericht[];
  laatsteDatum: string;
  gelezen: boolean;
}

export interface MailBericht {
  id: string;
  van: { naam: string; email: string };
  datum: string;
  inhoud: string;
  bijlagen?: { naam: string; grootte: string }[];
}

export let mockMailConversaties: MailConversatie[] = [
  {
    id: "mail-001",
    relatieId: "rel-001",
    contractId: "ctr-001",
    onderwerp: "Re: Offerte graan transport Rotterdam–Krefeld Q2",
    van: { naam: "Jan de Vries", email: "j.devries@provaart.nl" },
    aan: [{ naam: "Eric Nieuwkoop", email: "e.nieuwkoop@rdj.nl" }],
    berichten: [
      { id: "mb-001a", van: { naam: "Eric Nieuwkoop", email: "e.nieuwkoop@rdj.nl" }, datum: "2026-03-10T09:15:00", inhoud: "Beste Jan,\n\nHierbij onze offerte voor het graan transport Rotterdam–Krefeld voor Q2. We kunnen 3.500 ton per reis doen tegen het eerder besproken tarief.\n\nLaat me weten of de voorwaarden akkoord zijn.\n\nMet vriendelijke groet,\nEric" },
      { id: "mb-001b", van: { naam: "Jan de Vries", email: "j.devries@provaart.nl" }, datum: "2026-03-10T14:32:00", inhoud: "Hoi Eric,\n\nBedankt voor de offerte. Het tarief is akkoord, maar we willen graag de laadtijd verlengen van 12 naar 24 uur i.v.m. de kraanbeschikbaarheid bij terminal 3.\n\nKun je dat aanpassen?\n\nGroet,\nJan" },
      { id: "mb-001c", van: { naam: "Eric Nieuwkoop", email: "e.nieuwkoop@rdj.nl" }, datum: "2026-03-11T08:45:00", inhoud: "Jan,\n\n24 uur laadtijd is geen probleem. Ik pas de offerte aan en stuur een herziene versie.\n\nGr. Eric" },
    ],
    laatsteDatum: "2026-03-11T08:45:00",
    gelezen: true,
  },
  {
    id: "mail-002",
    relatieId: "rel-001",
    onderwerp: "Planning houtpellets Salzgitter – maart",
    van: { naam: "Lisa Aelbrechtse", email: "l.aelbrechtse@provaart.nl" },
    aan: [{ naam: "Khoa Nguyen", email: "k.nguyen@rdj.nl" }],
    berichten: [
      { id: "mb-002a", van: { naam: "Lisa Aelbrechtse", email: "l.aelbrechtse@provaart.nl" }, datum: "2026-03-08T11:20:00", inhoud: "Beste Khoa,\n\nKunnen jullie de houtpellets partij van 2.000 ton naar Salzgitter inplannen voor week 12? De terminal heeft aangegeven dat ze vanaf dinsdag beschikbaar zijn.\n\nGroet,\nLisa", bijlagen: [{ naam: "Terminal_beschikbaarheid_mrt.pdf", grootte: "245 KB" }] },
      { id: "mb-002b", van: { naam: "Khoa Nguyen", email: "k.nguyen@rdj.nl" }, datum: "2026-03-08T15:05:00", inhoud: "Hoi Lisa,\n\nWeek 12 kan, we hebben de Emily beschikbaar die dan net in de buurt is. Ik plan het in en stuur je een bevestiging.\n\nMvg,\nKhoa" },
    ],
    laatsteDatum: "2026-03-08T15:05:00",
    gelezen: true,
  },
  {
    id: "mail-003",
    relatieId: "rel-001",
    onderwerp: "Factuur #2026-0847 – betaling ontvangen",
    van: { naam: "Administratie Provaart", email: "admin@provaart.nl" },
    aan: [{ naam: "Eric Nieuwkoop", email: "e.nieuwkoop@rdj.nl" }],
    berichten: [
      { id: "mb-003a", van: { naam: "Administratie Provaart", email: "admin@provaart.nl" }, datum: "2026-03-07T09:00:00", inhoud: "Geachte heer Nieuwkoop,\n\nHierbij bevestigen wij de ontvangst van de betaling voor factuur #2026-0847 (€ 45.500,00).\n\nMet vriendelijke groet,\nAdministratie Provaart Logistics BV" },
    ],
    laatsteDatum: "2026-03-07T09:00:00",
    gelezen: false,
  },
  {
    id: "mail-004",
    relatieId: "rel-002",
    contractId: "ctr-002",
    onderwerp: "Re: Staal transport Dordrecht–Antwerpen – laadschema",
    van: { naam: "Pieter Jansen", email: "p.jansen@janlow.nl" },
    aan: [{ naam: "Eric Nieuwkoop", email: "e.nieuwkoop@rdj.nl" }],
    berichten: [
      { id: "mb-004a", van: { naam: "Eric Nieuwkoop", email: "e.nieuwkoop@rdj.nl" }, datum: "2026-03-09T10:00:00", inhoud: "Pieter,\n\nHierbij het laadschema voor de staalpartij volgende week. We laden op dinsdag en woensdag, elke dag 1.500 ton.\n\nGraag jullie bevestiging.\n\nGr. Eric", bijlagen: [{ naam: "Laadschema_staal_wk12.xlsx", grootte: "89 KB" }] },
      { id: "mb-004b", van: { naam: "Pieter Jansen", email: "p.jansen@janlow.nl" }, datum: "2026-03-09T16:45:00", inhoud: "Eric,\n\nSchema is akkoord. Onze kraanmachinist is beide dagen beschikbaar. Wel graag uiterlijk 07:00 aanmelden bij de poort.\n\nPieter" },
    ],
    laatsteDatum: "2026-03-09T16:45:00",
    gelezen: true,
  },
  {
    id: "mail-005",
    relatieId: "rel-003",
    onderwerp: "Nieuwe mogelijkheid: sojabonen Basel – Q2",
    van: { naam: "Sophie van Dam", email: "s.vandam@cargill.com" },
    aan: [{ naam: "Pelger de Jong", email: "p.dejong@rdj.nl" }],
    berichten: [
      { id: "mb-005a", van: { naam: "Sophie van Dam", email: "s.vandam@cargill.com" }, datum: "2026-03-06T13:30:00", inhoud: "Beste Pelger,\n\nWe hebben voor Q2 een extra partij sojabonen van 3.500 ton die naar Basel moet. Kunnen jullie hiervoor een offerte uitbrengen?\n\nGraag inclusief de optie voor inspectie onderweg.\n\nMvg,\nSophie" },
      { id: "mb-005b", van: { naam: "Pelger de Jong", email: "p.dejong@rdj.nl" }, datum: "2026-03-07T09:15:00", inhoud: "Sophie,\n\nDank voor de aanvraag. Ik werk een offerte uit en heb die uiterlijk vrijdag bij je. De inspectie-optie nemen we mee.\n\nGr. Pelger" },
      { id: "mb-005c", van: { naam: "Sophie van Dam", email: "s.vandam@cargill.com" }, datum: "2026-03-07T10:02:00", inhoud: "Prima, ik kijk ernaar uit.\n\nSophie" },
    ],
    laatsteDatum: "2026-03-07T10:02:00",
    gelezen: false,
  },
  {
    id: "mail-006",
    relatieId: "rel-002",
    onderwerp: "Beschadiging lading staal – melding",
    van: { naam: "Pieter Jansen", email: "p.jansen@janlow.nl" },
    aan: [{ naam: "Eric Nieuwkoop", email: "e.nieuwkoop@rdj.nl" }, { naam: "Khoa Nguyen", email: "k.nguyen@rdj.nl" }],
    berichten: [
      { id: "mb-006a", van: { naam: "Pieter Jansen", email: "p.jansen@janlow.nl" }, datum: "2026-03-05T08:10:00", inhoud: "Eric, Khoa,\n\nBij het lossen in Antwerpen is geconstateerd dat een deel van de staalplaten lichte waterschade heeft. Het gaat om ca. 200 ton van de 3.000 ton partij.\n\nKunnen jullie dit melden bij de verzekeraar? Foto's bijgevoegd.\n\nPieter", bijlagen: [{ naam: "Schade_foto_1.jpg", grootte: "2.4 MB" }, { naam: "Schade_foto_2.jpg", grootte: "1.8 MB" }, { naam: "Schade_rapport.pdf", grootte: "520 KB" }] },
      { id: "mb-006b", van: { naam: "Eric Nieuwkoop", email: "e.nieuwkoop@rdj.nl" }, datum: "2026-03-05T09:30:00", inhoud: "Pieter,\n\nVervelend om te horen. We nemen het direct op met de verzekeraar. Khoa gaat het rapport doornemen en komt bij je terug.\n\nEric" },
    ],
    laatsteDatum: "2026-03-05T09:30:00",
    gelezen: true,
  },
];

export interface Gespreksverslag {
  id: string;
  relatieId: string;
  contactPersoonId: string;
  gebruikerId: string;
  datum: string;
  inhoud: string;
  aanmaakDatum: string;
}

/** Mock onderhandelingen per relatie — klantgericht (lading als leading column) */
export interface RelatieOnderhandeling {
  id: string;
  relatieId: string;
  lading: string;
  route: string;
  vaartuig: string;
  vrachtprijs: string;
  vrachtprijsDiff?: string;
  tonnage: string;
  deadline: string;
  deadlineExpired?: boolean;
  status: string;
  contact: {
    naam: string;
    datum: string;
    gebruikerId: string;
  };
}

export const mockRelatieOnderhandelingen: RelatieOnderhandeling[] = [
  {
    id: "ro-001",
    relatieId: "rel-001",
    lading: "Houtpellets Salzgitter",
    route: "Salzgitter → Hamburg",
    vaartuig: "MS Esperanza",
    vrachtprijs: "€3,50 per ton",
    vrachtprijsDiff: "+12,5%",
    tonnage: "2.000 ton",
    deadline: "Za 14 Mrt, 16:00",
    deadlineExpired: true,
    status: "Bod ontvangen",
    contact: { naam: "Eric Nieuwkoop", datum: "Ma 9 Mrt 07:28", gebruikerId: "usr-001" },
  },
  {
    id: "ro-002",
    relatieId: "rel-001",
    lading: "Graan Rotterdam–Krefeld",
    route: "Rotterdam → Krefeld",
    vaartuig: "MS Adriana",
    vrachtprijs: "€2,80 per ton",
    vrachtprijsDiff: "-3,2%",
    tonnage: "3.500 ton",
    deadline: "Morgen, 10:00",
    status: "Bod verstuurd",
    contact: { naam: "Khoa Nguyen", datum: "Di 10 Mrt 19:53", gebruikerId: "usr-002" },
  },
  {
    id: "ro-003",
    relatieId: "rel-002",
    lading: "Staal Dordrecht–Antwerpen",
    route: "Dordrecht → Antwerpen",
    vaartuig: "MS Maran Future",
    vrachtprijs: "€4,20 per ton",
    vrachtprijsDiff: "+5,1%",
    tonnage: "3.000 ton",
    deadline: "Do 19 Mrt, 11:15",
    status: "Via werklijst",
    contact: { naam: "Eric Nieuwkoop", datum: "Za 7 Mrt 18:39", gebruikerId: "usr-001" },
  },
  {
    id: "ro-004",
    relatieId: "rel-003",
    lading: "Sojabonen Rotterdam",
    route: "Rotterdam Botlek → Basel",
    vaartuig: "MS Abis Dover",
    vrachtprijs: "€3,00 per ton",
    vrachtprijsDiff: "0,0%",
    tonnage: "3.500 ton",
    deadline: "Morgen, 9:00",
    deadlineExpired: true,
    status: "Bod ontvangen",
    contact: { naam: "Pelger de Jong", datum: "Di 10 Mrt 12:04", gebruikerId: "usr-003" },
  },
  {
    id: "ro-005",
    relatieId: "rel-003",
    lading: "Sojabonen Rotterdam",
    route: "Rotterdam Botlek → Basel",
    vaartuig: "MS Rhine Express",
    vrachtprijs: "€3,25 per ton",
    vrachtprijsDiff: "+4,8%",
    tonnage: "3.500 ton",
    deadline: "Vr 20 Mrt",
    status: "Goedgekeurd",
    contact: { naam: "Khoa Nguyen", datum: "Vr 6 Mrt 11:47", gebruikerId: "usr-002" },
  },
  {
    id: "ro-006",
    relatieId: "rel-003",
    lading: "Graan Amsterdam–Strasbourg",
    route: "Amsterdam → Strasbourg",
    vaartuig: "MS Europa",
    vrachtprijs: "€2,95 per ton",
    vrachtprijsDiff: "-4,8%",
    tonnage: "3.000 ton",
    deadline: "Za 21 Mrt",
    status: "Via werklijst",
    contact: { naam: "Eric Nieuwkoop", datum: "Do 5 Mrt 14:50", gebruikerId: "usr-001" },
  },
  {
    id: "ro-007",
    relatieId: "rel-003",
    lading: "Sojabonen Rotterdam",
    route: "Rotterdam Botlek → Basel",
    vaartuig: "MS Hollandia",
    vrachtprijs: "€3,10 per ton",
    tonnage: "3.500 ton",
    deadline: "",
    status: "Afgewezen",
    contact: { naam: "Pelger de Jong", datum: "Wo 11 Mrt 12:04", gebruikerId: "usr-003" },
  },
  {
    id: "ro-008",
    relatieId: "rel-005",
    lading: "Containers Rotterdam–Antwerpen",
    route: "Rotterdam → Antwerpen",
    vaartuig: "MS A2B Future",
    vrachtprijs: "€5,00 per ton",
    vrachtprijsDiff: "+2,0%",
    tonnage: "2.000 ton",
    deadline: "Morgen, 11:00",
    status: "Bod verstuurd",
    contact: { naam: "Khoa Nguyen", datum: "Zo 8 Mrt 01:31", gebruikerId: "usr-002" },
  },
  {
    id: "ro-009",
    relatieId: "rel-010",
    lading: "Sojabonen inspectie Botlek",
    route: "Rotterdam Botlek → Rotterdam Botlek",
    vaartuig: "MS Navigator",
    vrachtprijs: "€2,60 per ton",
    vrachtprijsDiff: "-8,5%",
    tonnage: "5.000 ton",
    deadline: "Vr 20 Mrt",
    status: "Via werklijst",
    contact: { naam: "Eric Nieuwkoop", datum: "Vr 6 Mrt 09:01", gebruikerId: "usr-001" },
  },
  {
    id: "ro-010",
    relatieId: "rel-010",
    lading: "Sojabonen inspectie Botlek",
    route: "Rotterdam Botlek → Rotterdam Botlek",
    vaartuig: "MS Rijnborg",
    vrachtprijs: "€2,75 per ton",
    tonnage: "5.000 ton",
    deadline: "Za 21 Mrt",
    status: "Goedgekeurd",
    contact: { naam: "Pelger de Jong", datum: "Do 5 Mrt 16:22", gebruikerId: "usr-003" },
  },
  {
    id: "ro-011",
    relatieId: "rel-005",
    lading: "Containers Rotterdam–Antwerpen",
    route: "Rotterdam → Antwerpen",
    vaartuig: "MS Veendam",
    vrachtprijs: "€4,75 per ton",
    vrachtprijsDiff: "-3,1%",
    tonnage: "2.000 ton",
    deadline: "Do 19 Mrt, 14:00",
    status: "Via werklijst",
    contact: { naam: "Pelger de Jong", datum: "Do 5 Mrt 10:15", gebruikerId: "usr-003" },
  },
  {
    id: "ro-012",
    relatieId: "rel-005",
    lading: "Containers Rotterdam–Antwerpen",
    route: "Rotterdam → Antwerpen",
    vaartuig: "MS Horizon",
    vrachtprijs: "€5,20 per ton",
    vrachtprijsDiff: "+6,1%",
    tonnage: "2.000 ton",
    deadline: "",
    status: "Afgekeurd",
    contact: { naam: "Eric Nieuwkoop", datum: "Wo 4 Mrt 09:00", gebruikerId: "usr-001" },
  },
  {
    id: "ro-013",
    relatieId: "rel-007",
    lading: "Grind Papendrecht",
    route: "Papendrecht → Rotterdam",
    vaartuig: "MS Maran Future",
    vrachtprijs: "€3,80 per ton",
    tonnage: "3.000 ton",
    deadline: "Morgen, 12:00",
    status: "Bod verstuurd",
    contact: { naam: "Khoa Nguyen", datum: "Ma 9 Mrt 14:30", gebruikerId: "usr-002" },
  },
  {
    id: "ro-014",
    relatieId: "rel-008",
    lading: "Kolen Maastricht–Luik",
    route: "Maastricht → Luik",
    vaartuig: "MS Ardennais",
    vrachtprijs: "€4,10 per ton",
    vrachtprijsDiff: "+1,5%",
    tonnage: "2.200 ton",
    deadline: "Vr 20 Mrt",
    status: "Goedgekeurd",
    contact: { naam: "Eric Nieuwkoop", datum: "Do 5 Mrt 16:00", gebruikerId: "usr-001" },
  },
  {
    id: "ro-015",
    relatieId: "rel-012",
    lading: "Containers Rotterdam–Duisburg",
    route: "Rotterdam → Duisburg",
    vaartuig: "MS Merganser",
    vrachtprijs: "€4,50 per ton",
    vrachtprijsDiff: "+3,3%",
    tonnage: "2.000 ton",
    deadline: "Za 21 Mrt",
    status: "Bod ontvangen",
    contact: { naam: "Pelger de Jong", datum: "Vr 6 Mrt 15:20", gebruikerId: "usr-003" },
  },
  {
    id: "ro-016",
    relatieId: "rel-012",
    lading: "Containers Rotterdam–Duisburg",
    route: "Rotterdam → Duisburg",
    vaartuig: "MS Fortuna",
    vrachtprijs: "€4,30 per ton",
    tonnage: "2.000 ton",
    deadline: "",
    status: "Afgewezen",
    contact: { naam: "Eric Nieuwkoop", datum: "Wo 4 Mrt 11:30", gebruikerId: "usr-001" },
  },
];

export let mockGespreksverslagen: Gespreksverslag[] = [
  {
    id: "gv-001",
    relatieId: "rel-001",
    contactPersoonId: "cp-001",
    gebruikerId: "usr-001",
    datum: "2026-03-10T14:00:00",
    inhoud: "Besproken: uitbreiding samenwerking Q2. Jan geeft aan dat ze meer capaciteit nodig hebben voor de graan-route naar Duitsland. Wij gaan een voorstel uitwerken voor structureel 2 afvaarten per week. Jan belt vrijdag terug.",
    aanmaakDatum: "2026-03-10T15:30:00",
  },
  {
    id: "gv-002",
    relatieId: "rel-001",
    contactPersoonId: "cp-002",
    gebruikerId: "usr-002",
    datum: "2026-03-07T10:30:00",
    inhoud: "Kort gebeld over de houtpellets planning. Maria vraagt of we de Emily eerder beschikbaar kunnen krijgen. Ze heeft haast i.v.m. terminal-slot in Salzgitter. Ik heb aangegeven dat we dit checken.",
    aanmaakDatum: "2026-03-07T10:45:00",
  },
  {
    id: "gv-003",
    relatieId: "rel-002",
    contactPersoonId: "cp-003",
    gebruikerId: "usr-001",
    datum: "2026-03-05T16:00:00",
    inhoud: "Pieter belt over de beschadigde staalpartij. Hij wil duidelijkheid over de verzekeringsafhandeling. Ik heb hem gerustgesteld dat Khoa het oppakt. Pieter wil uiterlijk volgende week een update.",
    aanmaakDatum: "2026-03-05T16:20:00",
  },
  {
    id: "gv-004",
    relatieId: "rel-003",
    contactPersoonId: "cp-004",
    gebruikerId: "usr-003",
    datum: "2026-03-06T11:00:00",
    inhoud: "Sophie belt over nieuwe sojabonen partij naar Basel, 3.500 ton Q2. Ze wil offerte inclusief inspectie-optie. Ik werk het uit en heb het vrijdag klaar.",
    aanmaakDatum: "2026-03-06T11:15:00",
  },
];
