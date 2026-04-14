export interface Cargo {
  id: string;
  title: string;
  code: string;
  company?: string;
  status: 'intake' | 'werklijst' | 'markt' | 'gesloten';
  cargo: string;
  weight: string;
  from: string;
  to: string;
  fromDate: string;
  toDate: string;
  vesselType?: string;
  route?: string;
  urgent?: boolean;
  matches?: number;
  bids?: number;
  exType?: string;
  priceInfo?: string;
  splitIndex?: number;
  splitOriginId?: string;
  splitColorIndex?: number;
  splitTotalWeight?: string;
  conditions?: {
    eigen?: {
      price: string;
      priceType: string;
      loadingTime: string;
      unloadingTime: string;
    };
    markt?: {
      tonnageMin: string;
      tonnageMax: string;
      price: string;
      priceType: string;
      loadingTime: string;
      loadingTimeUnit: string;
      unloadingTime: string;
      unloadingTimeUnit: string;
      loadingCondition: string;
      unloadingCondition: string;
      remarks: string;
    };
  };
}

export interface Vessel {
  id: string;
  title: string;
  code: string;
  status: 'intake' | 'werklijst' | 'markt' | 'gesloten';
  vesselType: string;
  weight: string;
  from: string;
  to: string;
  fromDate: string;
  toDate: string;
  route?: string;
  matches?: number;
  location?: string;
  locationDate?: string;
  werklijstRemarks?: string;
}

export interface Match {
  id: string;
  name: string;
  type: string;
  company: string;
  companyLocation: string;
  contactPersoon?: string;
  location: string;
  locationDate?: string;
  distance: string;
  inhoud?: string;
  cargo: string;
  cargoType: string;
  cargoDate: string;
  matchPercentage: number;
  isEigen?: boolean;
  source?: string;
  sourceDate?: string;
}

export interface Negotiation {
  id: string;
  company: string;
  tonnage: string;
  deadline: string;
  deadlineExpired?: boolean;
  status: string;
  contact: {
    name: string;
    date: string;
  };
  price?: string;
  freightPrice?: string;
  freightPriceDiff?: string;
  bemiddeling?: {
    inkoopRelatie: string;
    verkoopRelatie: string;
  };
}

export const mockCargos: Cargo[] = [
  {
    id: 'CRG001',
    title: 'm/v Abis Dover',
    exType: 'zeeboot',
    company: 'Janlow B.V.',
    code: 'JA0092-01',
    status: 'intake',
    cargo: '3.000 ton Houtpellets (DSIT)',
    weight: '3.000 ton Houtpellets (DSIT)',
    from: 'Salzgitter Stichkanal',
    to: 'Hamburg Veddelkanal',
    fromDate: 'Af te stemmen',
    toDate: 'Vr 20 Jan',
    urgent: true,
    matches: 4,
    bids: 2,
  },
  {
    id: 'CRG002',
    title: 'm/v Maran Future',
    exType: 'zeeboot',
    company: 'Provaart Logistics BV',
    code: 'PRO029-01 ra',
    status: 'intake',
    cargo: '2.000 ton Houtpellets (DSIT)',
    weight: '2.000 ton Houtpellets (DSIT)',
    from: 'Salzgitter Stichkanal',
    to: 'Hamburg Veddelkanal',
    fromDate: 'Ma 12 Jan 10:00',
    toDate: 'Vr 20 Jan',
  },
  {
    id: 'CRG003',
    title: 'Loods Rotterdam Europoort',
    exType: 'opslag',
    company: 'Cargill N.V.',
    code: 'UN762-02',
    status: 'intake',
    cargo: '500 ton Koolraapzaad',
    weight: '500 ton Koolraapzaad',
    from: 'Salzgitter Stichkanal',
    to: 'Hamburg Veddelkanal',
    fromDate: 'Melden bij aankomst',
    toDate: 'Vr 20 Jan',
  },
  {
    id: 'CRG164-01',
    title: 'm/v Maran Future',
    exType: 'zeeboot',
    company: 'Provaart Logistics BV',
    code: 'PRO029-01 ra',
    status: 'werklijst',
    splitIndex: 2,
    splitOriginId: 'CRG002',
    splitColorIndex: 0,
    cargo: '1.000 (van 2.000 ton) Houtpellets (DSIT)',
    weight: '1.000 ton Houtpellets (DSIT)',
    from: 'Salzgitter Stichkanal',
    to: 'Hamburg Veddelkanal',
    fromDate: 'Ma 12 Jan 10:00',
    toDate: 'Vr 20 Jan',
    priceInfo: '€3,00 per ton · 4 uur laden · 8 uur lossen',
    conditions: {
      markt: {
        tonnageMin: '500',
        tonnageMax: '1.000',

        price: '€3,00 per ton',
        priceType: 'per ton',
        loadingTime: '4',
        loadingTimeUnit: 'uren',
        unloadingTime: '8',
        unloadingTimeUnit: 'uren',
        loadingCondition: 'Laden',
        unloadingCondition: 'Lossen',
        remarks: 'Geen opmerkingen',
      },
    },
  },
  {
    id: 'CRG005',
    title: 'Opslagloods Mannheim',
    exType: 'opslag',
    company: 'Cargill N.V.',
    code: 'CRG164-01',
    status: 'markt',
    cargo: '2.000 ton Houtpellets',
    weight: '2.000 ton Houtpellets',
    from: 'Rotterdam Europoort',
    to: 'Mannheim',
    fromDate: 'Do 15 Jan',
    toDate: 'Af te stemmen',
    matches: 1,
  },
  {
    id: 'CRG006',
    title: 'm/v Merganser',
    exType: 'zeeboot',
    company: 'Boskalis Nederland',
    code: 'ADG-0045',
    status: 'markt',
    cargo: '2.000 ton Houtpellets',
    weight: '2.000 ton Houtpellets',
    from: 'Rotterdam',
    to: 'Mannheim',
    fromDate: 'Do 15 Jan',
    toDate: 'Af te stemmen',
    matches: 5,
    conditions: {
      markt: {
        tonnageMin: '1.500',
        tonnageMax: '2.000',
        price: '€3.00 per ton',
        priceType: 'per ton',
        loadingTime: '2',
        loadingTimeUnit: 'uren',
        unloadingTime: '2',
        unloadingTimeUnit: 'uren',
        loadingCondition: 'Laden',
        unloadingCondition: 'Lossen',
        remarks: 'Geen opmerkingen',
      },
    },
  },
];

export const mockVessels: Vessel[] = [
  {
    id: 'VSL001',
    title: 'Emily',
    code: '3.000 ton',
    status: 'intake',
    vesselType: 'Motorschip',
    weight: '3.000 ton',
    from: 'Waalhaven',
    to: '',
    fromDate: 'Sinds Ma 12 Jan',
    toDate: '',
    location: 'Waalhaven',
    locationDate: 'Sinds Ma 12 Jan',
  },
  {
    id: 'VSL002',
    title: 'S.S. Anna',
    code: '2.500 ton',
    status: 'werklijst',
    vesselType: 'Motorschip',
    weight: '2.500 ton',
    from: 'Bremerhaven',
    to: '',
    fromDate: 'Sinds Di 23 Feb',
    toDate: '',
    location: 'Bremerhaven',
    locationDate: 'Sinds Di 23 Feb',
  },
  {
    id: 'VSL003',
    title: 'Bregje',
    code: '3.000 ton',
    status: 'intake',
    vesselType: 'Motorschip',
    weight: '3.000 ton',
    from: 'Bremerhaven',
    to: '',
    fromDate: 'Sinds Di 23 Feb',
    toDate: '',
    location: 'Bremerhaven',
    locationDate: 'Sinds Di 23 Feb',
  },
  {
    id: 'VSL004',
    title: 'Hercules',
    code: '3.000 ton',
    status: 'intake',
    vesselType: 'Motorschip',
    weight: '3.000 ton',
    from: 'Bremerhaven',
    to: 'Groningen, 18:00',
    fromDate: 'Sinds Di 23 Feb',
    toDate: '',
    location: 'Bremerhaven',
    locationDate: 'Sinds Di 23 Feb',
    matches: 9,
  },
];

export const mockMatches: Match[] = [
  {
    id: 'M001',
    name: 'Emily',
    type: 'Motorschip',
    company: 'Provaart Logistics BV',
    companyLocation: 'Rotterdam',
    contactPersoon: 'Jan de Vries',
    location: 'Waalhaven',
    locationDate: 'Vanaf Ma 10 Mrt, 2026',
    distance: '3.000 mt',
    inhoud: '3.800 m³',
    cargo: 'Automatische feed\nDo 6 Mrt 12:44',
    cargoType: 'Automatische feed',
    cargoDate: 'Do 6 Mrt 12:44',
    matchPercentage: 92,
    source: 'Automatische feed',
    sourceDate: 'Do 6 Mrt 12:44',
  },
  {
    id: 'M002',
    name: 'Agaat',
    type: 'Motorschip',
    company: 'Provaart Logistics BV',
    companyLocation: 'Rotterdam',
    contactPersoon: 'Jan de Vries',
    location: 'Krefeld',
    locationDate: 'Vanaf Wo 12 Mrt, 2026',
    distance: '2.500 mt',
    inhoud: '3.200 m³',
    cargo: 'Automatische feed\nDo 6 Mrt 14:20',
    cargoType: 'Automatische feed',
    cargoDate: 'Do 6 Mrt 14:20',
    matchPercentage: 85,
    source: 'Automatische feed',
    sourceDate: 'Do 6 Mrt 14:20',
  },
  {
    id: 'M003',
    name: 'S.S. Anna',
    type: 'Motorschip',
    company: 'Janlow B.V.',
    companyLocation: 'Dordrecht',
    contactPersoon: 'Pieter Jansen',
    location: 'Bremerhaven',
    locationDate: 'Vanaf Di 11 Mrt, 2026',
    distance: '2.500 mt',
    inhoud: '3.000 m³',
    cargo: 'Automatische feed\nVr 7 Mrt 09:15',
    cargoType: 'Automatische feed',
    cargoDate: 'Vr 7 Mrt 09:15',
    matchPercentage: 78,
    source: 'Automatische feed',
    sourceDate: 'Vr 7 Mrt 09:15',
  },
  {
    id: 'M004',
    name: 'Antonia V',
    type: 'Motorschip',
    company: 'De Volharding C.V.',
    companyLocation: 'Barendrecht',
    contactPersoon: 'Kees Visser',
    location: 'Barendrecht',
    locationDate: 'Vanaf Ma 10 Mrt, 2026',
    distance: '4.200 mt',
    inhoud: '5.200 m³',
    cargo: 'Eigen vloot\nVr 7 Mrt 08:00',
    cargoType: 'Eigen vloot',
    cargoDate: 'Vr 7 Mrt 08:00',
    matchPercentage: 60,
    isEigen: true,
    source: 'Eigen vloot',
    sourceDate: 'Vr 7 Mrt 08:00',
  },
  {
    id: 'M005',
    name: 'Amber',
    type: 'Motorschip',
    company: 'Viterra Trading',
    companyLocation: 'Rotterdam',
    contactPersoon: 'Noor van den Berg',
    location: 'Rotterdam Botlek',
    locationDate: 'Vanaf Do 20 Mrt, 2026',
    distance: '4.500 mt',
    inhoud: '5.600 m³',
    cargo: 'Automatische feed\nDo 6 Mrt 10:30',
    cargoType: 'Automatische feed',
    cargoDate: 'Do 6 Mrt 10:30',
    matchPercentage: 40,
    source: 'Automatische feed',
    sourceDate: 'Do 6 Mrt 10:30',
  },
];

export const mockNegotiations: Negotiation[] = [
  {
    id: 'N001',
    company: 'Rederij van Dam',
    tonnage: '2.000 ton',
    deadline: 'Za 14 Mrt, 16:00',
    deadlineExpired: true,
    status: 'Via werklijst',
    contact: {
      name: 'Eric Nieuwkoop',
      date: 'Ma 9 Mrt 07:28',
    },
    freightPrice: '€3,50 per ton',
    freightPriceDiff: '+12,5%',
    bemiddeling: {
      inkoopRelatie: 'Rederij van Dam',
      verkoopRelatie: 'Provaart Logistics BV',
    },
  },
  {
    id: 'N002',
    company: 'De Volharding C.V.',
    tonnage: '2.000 ton',
    deadline: 'Morgen, 9:00',
    deadlineExpired: true,
    status: 'Via werklijst',
    contact: {
      name: 'Pelger de Jong',
      date: 'Di 10 Mrt 19:53',
    },
    freightPrice: '€3,00 per ton',
    freightPriceDiff: '-3,2%',
  },
  {
    id: 'N003',
    company: 'Rederij Alfa',
    tonnage: '2.000 ton',
    deadline: 'Morgen, 10:00',
    status: 'Bod verstuurd',
    contact: {
      name: 'Khoa Nguyen',
      date: 'Zo 8 Mrt 01:31',
    },
    freightPrice: '€2,80 per ton',
    freightPriceDiff: '-9,7%',
    bemiddeling: {
      inkoopRelatie: 'Rederij Alfa',
      verkoopRelatie: 'Cargill N.V.',
    },
  },
  {
    id: 'N004',
    company: 'Scheepvaartbedrijf Damen',
    tonnage: '2.000 ton',
    deadline: 'Morgen, 11:00',
    status: 'Bod ontvangen',
    contact: {
      name: 'Eric Nieuwkoop',
      date: 'Za 7 Mrt 18:39',
    },
    price: '€3.00 per ton',
    freightPrice: '€3,00 per ton',
    freightPriceDiff: '0,0%',
  },
  {
    id: 'N005',
    company: 'Rijnvaart Groep',
    tonnage: '2.000 ton',
    deadline: 'Do 19 Mrt, 11:15',
    status: 'Via werklijst',
    contact: {
      name: 'Pelger de Jong',
      date: 'Vr 6 Mrt 11:47',
    },
    freightPrice: '€3,25 per ton',
    freightPriceDiff: '+4,8%',
  },
  {
    id: 'N006',
    company: 'Viterra Trading',
    tonnage: '2.000 ton',
    deadline: 'Vr 20 Mrt',
    status: 'Via werklijst',
    contact: {
      name: 'Khoa Nguyen',
      date: 'Vr 6 Mrt 09:01',
    },
    freightPrice: '€2,95 per ton',
    freightPriceDiff: '-4,8%',
  },
  {
    id: 'N007',
    company: 'Boskalis Nederland',
    tonnage: '2.000 ton',
    deadline: 'Vr 20 Mrt',
    status: 'Goedgekeurd',
    contact: {
      name: 'Khoa Nguyen',
      date: 'Do 5 Mrt 16:22',
    },
    freightPrice: '€3,10 per ton',
    freightPriceDiff: '+0,0%',
  },
  {
    id: 'N008',
    company: 'Duisburg Hafen AG',
    tonnage: '2.000 ton',
    deadline: 'Za 21 Mrt',
    status: 'Via werklijst',
    contact: {
      name: 'Eric Nieuwkoop',
      date: 'Do 5 Mrt 14:50',
    },
    freightPrice: '€3,40 per ton',
    freightPriceDiff: '+9,7%',
  },
  {
    id: 'N009',
    company: 'Heidelberg Materials',
    tonnage: '2.000 ton',
    deadline: '',
    status: 'Afgekeurd',
    contact: {
      name: 'Eric Nieuwkoop',
      date: 'Wo 11 Mrt 12:04',
    },
  },
];