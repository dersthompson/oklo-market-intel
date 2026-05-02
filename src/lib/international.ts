export interface CountryScore {
  id: string // ISO 3166-1 alpha-2
  name: string
  region: 'europe' | 'asia_pacific' | 'middle_east' | 'americas' | 'africa'
  subregion: string
  // Raw scores 0â10
  energyPrice: number
  carbonCommitment: number
  nuclearFramework: number
  marketDeregulation: number
  partnerEcosystem: number
  licensingClarity: number
  geopoliticalSafety: number
  financingSupport: number
  notes: string
  keySignals?: string[]
  flagEmoji?: string
  // Competitive landscape
  competitors?: Array<{ name: string; presence: 'active' | 'bidding' | 'mou' | 'exploring' }>
  marketSizeGW?: number      // Planned/potential nuclear capacity in GW
  timelineYears?: number     // Estimated years to first contract opportunity
}

export interface ScoreWeights {
  energyPrice: number
  carbonCommitment: number
  nuclearFramework: number
  marketDeregulation: number
  partnerEcosystem: number
  licensingClarity: number
  geopoliticalSafety: number
  financingSupport: number
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  energyPrice: 1.0,
  carbonCommitment: 1.0,
  nuclearFramework: 1.5,
  marketDeregulation: 0.8,
  partnerEcosystem: 1.5,
  licensingClarity: 1.2,
  geopoliticalSafety: 1.3,
  financingSupport: 1.0,
}

export function computeWeightedScore(c: CountryScore, w: ScoreWeights): number {
  const total =
    c.energyPrice * w.energyPrice +
    c.carbonCommitment * w.carbonCommitment +
    c.nuclearFramework * w.nuclearFramework +
    c.marketDeregulation * w.marketDeregulation +
    c.partnerEcosystem * w.partnerEcosystem +
    c.licensingClarity * w.licensingClarity +
    c.geopoliticalSafety * w.geopoliticalSafety +
    c.financingSupport * w.financingSupport
  const maxPossible = 10 * (
    w.energyPrice + w.carbonCommitment + w.nuclearFramework +
    w.marketDeregulation + w.partnerEcosystem + w.licensingClarity +
    w.geopoliticalSafety + w.financingSupport
  )
  return maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0
}

export const COUNTRIES: CountryScore[] = [
  // âââ AMERICAS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'US', name: 'United States', region: 'americas', subregion: 'North America', flagEmoji: 'ðºð¸',
    energyPrice: 7.0, carbonCommitment: 8.5, nuclearFramework: 10.0, marketDeregulation: 9.0,
    partnerEcosystem: 10.0, licensingClarity: 9.0, geopoliticalSafety: 10.0, financingSupport: 9.5,
    notes: "Oklo's home market. The NRC is the world's most mature nuclear regulator with a clear SMR licensing pathway. The Inflation Reduction Act provides nuclear production tax credits through 2032. Deep deregulated power markets (PJM, MISO, ERCOT) with merchant nuclear economics. DOE loan programs and ARDP funding available.",
    keySignals: ['Aurora powerhouse NRC application active', 'IRA nuclear PTC: $15/MWh through 2032', 'DOE ARDP $30M award received', 'NRC advanced reactor licensing guidance published'],
    competitors: [{ name: 'NuScale', presence: 'active' }, { name: 'TerraPower', presence: 'active' }, { name: 'X-energy', presence: 'active' }, { name: 'GE-Hitachi', presence: 'active' }],
    marketSizeGW: 200, timelineYears: 2,
  },
  {
    id: 'CA', name: 'Canada', region: 'americas', subregion: 'North America', flagEmoji: 'ð¨ð¦',
    energyPrice: 7.0, carbonCommitment: 9.0, nuclearFramework: 9.5, marketDeregulation: 7.0,
    partnerEcosystem: 9.5, licensingClarity: 9.0, geopoliticalSafety: 9.5, financingSupport: 8.5,
    notes: 'Ontario and New Brunswick leading SMR deployment. CNSC actively pre-licensing 4 SMR designs. Darlington refurb + new SMR site selected. Five-country SMR collaboration with US, UK, France, Japan.',
    keySignals: ['4 SMR designs in CNSC pre-licensing', 'Darlington SMR site approved', 'G7 Net Zero Nuclear initiative'],
    competitors: [{ name: 'X-energy', presence: 'active' }, { name: 'GE-Hitachi', presence: 'active' }, { name: 'Westinghouse', presence: 'active' }],
    marketSizeGW: 12, timelineYears: 3,
  },
  {
    id: 'BR', name: 'Brazil', region: 'americas', subregion: 'South America', flagEmoji: 'ð§ð·',
    energyPrice: 6.5, carbonCommitment: 7.0, nuclearFramework: 7.0, marketDeregulation: 5.5,
    partnerEcosystem: 7.0, licensingClarity: 6.0, geopoliticalSafety: 8.5, financingSupport: 5.5,
    notes: 'Angra 3 construction resuming. Naval nuclear program (submarines). CNEN regulatory body active. Lula government mixed on nuclear but pragmatic. Large country, remote regions suit SMR.',
    keySignals: ['Angra 3 completion restarted', 'Naval nuclear submarine program', 'CNEN licensing reform discussions'],
    competitors: [{ name: 'Westinghouse', presence: 'exploring' }],
    marketSizeGW: 4, timelineYears: 8,
  },

  // âââ EUROPE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'GB', name: 'United Kingdom', region: 'europe', subregion: 'Western Europe', flagEmoji: 'ð¬ð§',
    energyPrice: 8.5, carbonCommitment: 8.0, nuclearFramework: 8.5, marketDeregulation: 7.5,
    partnerEcosystem: 9.5, licensingClarity: 7.0, geopoliticalSafety: 9.5, financingSupport: 8.0,
    notes: 'Strong AUKUS partner, existing nuclear fleet (EDF). Government backing advanced nuclear via Great British Nuclear program. Rolls-Royce SMR program advancing. High electricity prices drive demand.',
    keySignals: ['Rolls-Royce SMR advanced to next stage', 'GBN program established', 'Â£300M SMR funding committed', 'Hinkley Point C under construction'],
    competitors: [{ name: 'Rolls-Royce', presence: 'active' }, { name: 'Westinghouse', presence: 'active' }, { name: 'GE-Hitachi', presence: 'bidding' }, { name: 'EDF', presence: 'active' }],
    marketSizeGW: 24, timelineYears: 4,
  },
  {
    id: 'FR', name: 'France', region: 'europe', subregion: 'Western Europe', flagEmoji: 'ð«ð·',
    energyPrice: 7.0, carbonCommitment: 8.5, nuclearFramework: 9.5, marketDeregulation: 6.0,
    partnerEcosystem: 8.0, licensingClarity: 8.0, geopoliticalSafety: 9.0, financingSupport: 8.5,
    notes: "World's highest nuclear dependence (~70% of power). Strong state support for nuclear via EDF. Macron announced 14 new reactors. Deep regulatory expertise but market less deregulated.",
    keySignals: ['14 new EPR2 reactors announced', 'French taxonomy classifies nuclear as green', 'EDF re-nationalized to back nuclear buildout'],
    competitors: [{ name: 'EDF', presence: 'active' }, { name: 'Framatome', presence: 'active' }],
    marketSizeGW: 25, timelineYears: 5,
  },
  {
    id: 'PL', name: 'Poland', region: 'europe', subregion: 'Central & Eastern Europe', flagEmoji: 'ðµð±',
    energyPrice: 9.0, carbonCommitment: 7.0, nuclearFramework: 5.5, marketDeregulation: 6.5,
    partnerEcosystem: 9.0, licensingClarity: 5.5, geopoliticalSafety: 8.5, financingSupport: 7.0,
    notes: 'Pivoting from coal to nuclear, partnered with US (Westinghouse AP1000 at Choczewo). Strong NATO ally, major US partnership opportunity. Building regulatory framework from scratch.',
    keySignals: ['Westinghouse selected for first nuclear plant', 'US Export-Import Bank support', 'Energy security driving nuclear push'],
    competitors: [{ name: 'Westinghouse', presence: 'active' }, { name: 'KHNP', presence: 'bidding' }],
    marketSizeGW: 9, timelineYears: 5,
  },
  {
    id: 'CZ', name: 'Czech Republic', region: 'europe', subregion: 'Central & Eastern Europe', flagEmoji: 'ð¨ð¿',
    energyPrice: 8.0, carbonCommitment: 7.5, nuclearFramework: 7.0, marketDeregulation: 6.5,
    partnerEcosystem: 8.5, licensingClarity: 6.5, geopoliticalSafety: 9.0, financingSupport: 7.0,
    notes: 'Operates Dukovany & TemelÃ­n. Tender for new large reactor units. SMR interest growing. Strong pro-nuclear government.',
    keySignals: ['Dukovany expansion tender ongoing', 'Excluded Russia/China from tender', 'SMR study published 2024'],
    competitors: [{ name: 'Westinghouse', presence: 'bidding' }, { name: 'EDF', presence: 'bidding' }, { name: 'KHNP', presence: 'bidding' }],
    marketSizeGW: 5, timelineYears: 5,
  },
  {
    id: 'SE', name: 'Sweden', region: 'europe', subregion: 'Northern Europe', flagEmoji: 'ð¸ðª',
    energyPrice: 7.5, carbonCommitment: 9.0, nuclearFramework: 8.0, marketDeregulation: 8.0,
    partnerEcosystem: 9.0, licensingClarity: 7.5, geopoliticalSafety: 9.5, financingSupport: 8.0,
    notes: 'Reversed nuclear moratorium in 2022. Government supporting SMR development. New legislation allows new reactors at more than 3 sites. Nordic power market well-structured.',
    keySignals: ['Nuclear moratorium lifted', 'Vattenfall studying SMR deployment', 'NATO member (joined 2024)'],
    competitors: [{ name: 'Rolls-Royce', presence: 'exploring' }, { name: 'Westinghouse', presence: 'exploring' }, { name: 'GE-Hitachi', presence: 'exploring' }],
    marketSizeGW: 10, timelineYears: 5,
  },
  {
    id: 'FI', name: 'Finland', region: 'europe', subregion: 'Northern Europe', flagEmoji: 'ð«ð®',
    energyPrice: 7.0, carbonCommitment: 9.0, nuclearFramework: 9.0, marketDeregulation: 7.5,
    partnerEcosystem: 9.0, licensingClarity: 8.5, geopoliticalSafety: 9.5, financingSupport: 8.0,
    notes: "Olkiluoto 3 (world's newest PWR) completed 2023. Strong nuclear culture, mature regulatory process. NATO member. Fortum exploring SMR.",
    keySignals: ['Olkiluoto 3 online', 'Fortum SMR study', 'NATO member (joined 2023)'],
    competitors: [{ name: 'Westinghouse', presence: 'exploring' }, { name: 'GE-Hitachi', presence: 'exploring' }],
    marketSizeGW: 6, timelineYears: 6,
  },
  {
    id: 'NL', name: 'Netherlands', region: 'europe', subregion: 'Western Europe', flagEmoji: 'ð³ð±',
    energyPrice: 8.0, carbonCommitment: 8.5, nuclearFramework: 6.5, marketDeregulation: 8.5,
    partnerEcosystem: 9.0, licensingClarity: 6.5, geopoliticalSafety: 9.5, financingSupport: 7.5,
    notes: 'Two new large nuclear plants announced by Dutch government (2023). Borssele operating. Strong NATO ally. Regulatory build-up needed for new fleet.',
    keySignals: ['2 new 1.5GW reactors approved', 'Borssele extended to 2035', 'Dutch government â¬500M nuclear commitment'],
    competitors: [{ name: 'Westinghouse', presence: 'bidding' }, { name: 'EDF', presence: 'bidding' }, { name: 'KHNP', presence: 'bidding' }],
    marketSizeGW: 3, timelineYears: 6,
  },
  {
    id: 'RO', name: 'Romania', region: 'europe', subregion: 'Central & Eastern Europe', flagEmoji: 'ð·ð´',
    energyPrice: 7.5, carbonCommitment: 7.0, nuclearFramework: 7.5, marketDeregulation: 6.0,
    partnerEcosystem: 8.5, licensingClarity: 6.5, geopoliticalSafety: 8.0, financingSupport: 6.5,
    notes: 'CernavodÄ units operating, Units 3&4 being developed with US support. NuScale SMR MOU signed. Strong US partnership since pivoting from China.',
    keySignals: ['NuScale SMR MOU signed', 'CernavodÄ 3&4 with US/Canadian support', 'EXIM Bank financing discussions'],
    competitors: [{ name: 'NuScale', presence: 'mou' }, { name: 'Westinghouse', presence: 'active' }],
    marketSizeGW: 4, timelineYears: 6,
  },
  {
    id: 'SK', name: 'Slovakia', region: 'europe', subregion: 'Central & Eastern Europe', flagEmoji: 'ð¸ð°',
    energyPrice: 8.0, carbonCommitment: 7.5, nuclearFramework: 7.5, marketDeregulation: 5.5,
    partnerEcosystem: 8.5, licensingClarity: 6.5, geopoliticalSafety: 9.0, financingSupport: 6.5,
    notes: 'High nuclear dependence. Mochovce 3&4 completing. Exploring SMR for post-2035. Pro-nuclear policy.',
    keySignals: ['Mochovce 3 completed 2023', 'SMR interest from government'],
    competitors: [{ name: 'Westinghouse', presence: 'exploring' }],
    marketSizeGW: 2, timelineYears: 7,
  },
  {
    id: 'BE', name: 'Belgium', region: 'europe', subregion: 'Western Europe', flagEmoji: 'ð§ðª',
    energyPrice: 8.5, carbonCommitment: 8.0, nuclearFramework: 7.0, marketDeregulation: 7.5,
    partnerEcosystem: 9.0, licensingClarity: 6.0, geopoliticalSafety: 9.5, financingSupport: 7.0,
    notes: 'Reversed nuclear phase-out 2022. Doel 4 & Tihange 3 extended 10 years. SMR interest growing. High energy prices and grid security concerns driving pro-nuclear shift.',
    keySignals: ['Phase-out reversed 2022', '10-year extension for 2 plants', 'Engie SMR study'],
    competitors: [{ name: 'EDF', presence: 'active' }, { name: 'Westinghouse', presence: 'exploring' }],
    marketSizeGW: 3, timelineYears: 6,
  },
  {
    id: 'DE', name: 'Germany', region: 'europe', subregion: 'Western Europe', flagEmoji: 'ð©ðª',
    energyPrice: 9.5, carbonCommitment: 8.5, nuclearFramework: 3.0, marketDeregulation: 8.0,
    partnerEcosystem: 8.5, licensingClarity: 2.0, geopoliticalSafety: 9.5, financingSupport: 4.0,
    notes: 'Shut down last 3 plants April 2023. Strong opposition but CDU pushing for reconsideration. SMR discussion beginning but major political/legal hurdles. Highest electricity prices in EU may force a reversal.',
    keySignals: ['Last plants closed April 2023', 'CDU calling for reconsideration', 'Energy prices highest in EU'],
    competitors: [],
    marketSizeGW: 0, timelineYears: 10,
  },
  {
    id: 'UA', name: 'Ukraine', region: 'europe', subregion: 'Eastern Europe', flagEmoji: 'ðºð¦',
    energyPrice: 6.0, carbonCommitment: 5.0, nuclearFramework: 8.0, marketDeregulation: 4.5,
    partnerEcosystem: 8.0, licensingClarity: 5.0, geopoliticalSafety: 2.5, financingSupport: 4.5,
    notes: 'Large nuclear fleet (15 units, ~55% of power). Westinghouse partnerships expanding post-2022. Geopolitical risk is primary barrier. Post-war reconstruction is a significant long-term opportunity.',
    keySignals: ['Westinghouse expanding Ukrainian supply', 'Post-war reconstruction planning underway'],
    competitors: [{ name: 'Westinghouse', presence: 'active' }],
    marketSizeGW: 6, timelineYears: 10,
  },

  // âââ ASIA PACIFIC ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'KR', name: 'South Korea', region: 'asia_pacific', subregion: 'East Asia', flagEmoji: 'ð°ð·',
    energyPrice: 6.5, carbonCommitment: 8.0, nuclearFramework: 9.5, marketDeregulation: 5.5,
    partnerEcosystem: 9.0, licensingClarity: 9.0, geopoliticalSafety: 7.5, financingSupport: 8.5,
    notes: 'World-class nuclear build capacity (KEPCO/KHNP). Reversed phase-out under Yoon government. APR1400 deployed domestically and in UAE. SMR program active (SMART, i-SMR). Strong US ally.',
    keySignals: ['Phase-out reversed 2022', '4 new units under construction', 'i-SMR design approved 2022', 'US-Korea nuclear cooperation MOU'],
    competitors: [{ name: 'KHNP', presence: 'active' }],
    marketSizeGW: 8, timelineYears: 4,
  },
  {
    id: 'JP', name: 'Japan', region: 'asia_pacific', subregion: 'East Asia', flagEmoji: 'ð¯ðµ',
    energyPrice: 9.0, carbonCommitment: 8.5, nuclearFramework: 7.5, marketDeregulation: 6.5,
    partnerEcosystem: 9.5, licensingClarity: 6.0, geopoliticalSafety: 8.0, financingSupport: 7.5,
    notes: 'Post-Fukushima restarts accelerating under GX policy. Kishida committed to restart + new build. High electricity prices, carbon goals, and US alliance create strong Oklo opportunity window.',
    keySignals: ['GX Green Transformation policy includes nuclear', '17 restarts approved/operating', 'New build explicitly on table for first time since 2011'],
    competitors: [{ name: 'GE-Hitachi', presence: 'active' }, { name: 'Westinghouse', presence: 'active' }, { name: 'Mitsubishi', presence: 'active' }],
    marketSizeGW: 20, timelineYears: 5,
  },
  {
    id: 'TW', name: 'Taiwan', region: 'asia_pacific', subregion: 'East Asia', flagEmoji: 'ð¹ð¼',
    energyPrice: 7.0, carbonCommitment: 7.5, nuclearFramework: 6.0, marketDeregulation: 5.5,
    partnerEcosystem: 9.0, licensingClarity: 5.5, geopoliticalSafety: 5.5, financingSupport: 6.5,
    notes: 'Phase-out policy officially reversed 2023. Chinshan and Maanshan reopening discussions. Semiconductor industry drives massive power demand. US ally in key geopolitical position.',
    keySignals: ['Nuclear phase-out reversed 2023', 'TSMC driving power demand', 'IAEA consultations ongoing'],
    competitors: [{ name: 'Westinghouse', presence: 'exploring' }, { name: 'GE-Hitachi', presence: 'exploring' }],
    marketSizeGW: 6, timelineYears: 6,
  },
  {
    id: 'IN', name: 'India', region: 'asia_pacific', subregion: 'South Asia', flagEmoji: 'ð®ð³',
    energyPrice: 5.5, carbonCommitment: 7.5, nuclearFramework: 7.0, marketDeregulation: 5.0,
    partnerEcosystem: 7.5, licensingClarity: 5.5, geopoliticalSafety: 6.5, financingSupport: 6.5,
    notes: 'Massive nuclear expansion plans (100 GW target by 2047). NPCIL growing. US-India 123 Agreement. Liability law is key barrier for foreign vendors. Growing strategic partnership.',
    keySignals: ['100 GW nuclear target by 2047', '9 new 700MW PHWR units under construction', 'US-India NCRI initiative', 'Liability law reform discussions'],
    competitors: [{ name: 'Westinghouse', presence: 'active' }, { name: 'GE-Hitachi', presence: 'active' }],
    marketSizeGW: 30, timelineYears: 6,
  },
  {
    id: 'AU', name: 'Australia', region: 'asia_pacific', subregion: 'Oceania', flagEmoji: 'ð¦ðº',
    energyPrice: 8.5, carbonCommitment: 7.5, nuclearFramework: 3.5, marketDeregulation: 8.0,
    partnerEcosystem: 9.5, licensingClarity: 3.0, geopoliticalSafety: 9.5, financingSupport: 6.0,
    notes: 'AUKUS nuclear submarines driving policy shift. Nuclear ban exists but political debate intensifying. Coalition government proposed 7 nuclear power plants. Very early stage.',
    keySignals: ['AUKUS submarine program', 'Coalition nuclear power proposal (7 plants)', 'Nuclear ban currently in law'],
    competitors: [{ name: 'GE-Hitachi', presence: 'exploring' }, { name: 'Westinghouse', presence: 'exploring' }, { name: 'Rolls-Royce', presence: 'exploring' }],
    marketSizeGW: 14, timelineYears: 7,
  },
  {
    id: 'VN', name: 'Vietnam', region: 'asia_pacific', subregion: 'Southeast Asia', flagEmoji: 'ð»ð³',
    energyPrice: 6.0, carbonCommitment: 6.5, nuclearFramework: 4.0, marketDeregulation: 4.5,
    partnerEcosystem: 7.0, licensingClarity: 4.0, geopoliticalSafety: 7.0, financingSupport: 5.5,
    notes: 'Revived nuclear program in 2023 after cancellation in 2016. Power shortages and demand growth driving decision. US partnership discussions active. SMR interest high.',
    keySignals: ['Nuclear program revived 2023', 'Power shortage crisis 2023', 'US-Vietnam MOU discussions'],
    competitors: [{ name: 'Westinghouse', presence: 'bidding' }, { name: 'KHNP', presence: 'bidding' }],
    marketSizeGW: 6, timelineYears: 7,
  },
  {
    id: 'PH', name: 'Philippines', region: 'asia_pacific', subregion: 'Southeast Asia', flagEmoji: 'ðµð­',
    energyPrice: 8.0, carbonCommitment: 7.0, nuclearFramework: 4.5, marketDeregulation: 6.0,
    partnerEcosystem: 8.5, licensingClarity: 4.0, geopoliticalSafety: 7.0, financingSupport: 5.5,
    notes: 'Marcos administration pursuing nuclear as part of energy mix. US ally. Bataan NPP discussions ongoing (never operated). SMR interest expressed. Archipelago model suits distributed nuclear.',
    keySignals: ['EO 164 nuclear development signed 2023', 'IAEA country nuclear program review requested', 'US-Philippines Enhanced Defense Cooperation Agreement'],
    competitors: [{ name: 'Westinghouse', presence: 'exploring' }, { name: 'KHNP', presence: 'exploring' }],
    marketSizeGW: 4, timelineYears: 7,
  },
  {
    id: 'MY', name: 'Malaysia', region: 'asia_pacific', subregion: 'Southeast Asia', flagEmoji: 'ð²ð¾',
    energyPrice: 6.5, carbonCommitment: 6.0, nuclearFramework: 3.5, marketDeregulation: 5.0,
    partnerEcosystem: 6.5, licensingClarity: 3.5, geopoliticalSafety: 8.0, financingSupport: 5.5,
    notes: 'Formal nuclear feasibility study underway. IAEA advisory mission conducted. Energy transition driving interest. Balanced geopolitical position (US and China relationships).',
    keySignals: ['Nuclear feasibility study launched', 'IAEA mission completed 2023', 'Energy transition plan includes nuclear option'],
    competitors: [{ name: 'Westinghouse', presence: 'exploring' }],
    marketSizeGW: 3, timelineYears: 9,
  },
  {
    id: 'SG', name: 'Singapore', region: 'asia_pacific', subregion: 'Southeast Asia', flagEmoji: 'ð¸ð¬',
    energyPrice: 8.5, carbonCommitment: 8.0, nuclearFramework: 3.0, marketDeregulation: 9.0,
    partnerEcosystem: 9.5, licensingClarity: 4.0, geopoliticalSafety: 9.5, financingSupport: 9.0,
    notes: 'IAEA assessment conducted 2023. City-state logistics challenging but floating/offshore SMR interest. Strong US ally and financial hub. Very deregulated energy market.',
    keySignals: ['IAEA assessment 2023', 'Long-term energy plan includes nuclear option', 'GreenTech Alliance with US'],
    competitors: [],
    marketSizeGW: 1, timelineYears: 8,
  },
  {
    id: 'ID', name: 'Indonesia', region: 'asia_pacific', subregion: 'Southeast Asia', flagEmoji: 'ð®ð©',
    energyPrice: 5.0, carbonCommitment: 6.5, nuclearFramework: 4.5, marketDeregulation: 4.5,
    partnerEcosystem: 7.0, licensingClarity: 4.0, geopoliticalSafety: 7.5, financingSupport: 5.5,
    notes: 'BATAN studying SMR deployment. IAEA assistance ongoing. Government officially supports nuclear fos energy security. Large archipelago â distributed SMR model natural fit.',
    keySignals: ['National Energy Policy includes nuclear', 'IAEA training program active', 'ThorCon molten salt reactor discussions'],
    competitors: [{ name: 'Westinghouse', presence: 'exploring' }],
    marketSizeGW: 5, timelineYears: 9,
  },

  // âââ MIDDLE EAST âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'AE', name: 'UAE', region: 'middle_east', subregion: 'Gulf', flagEmoji: 'ð¦ðª',
    energyPrice: 5.0, carbonCommitment: 7.5, nuclearFramework: 8.5, marketDeregulation: 7.0,
    partnerEcosystem: 9.0, licensingClarity: 8.0, geopoliticalSafety: 8.5, financingSupport: 9.5,
    notes: 'Barakah (4 Ã APR1400) operating â first Arab nuclear power. FANR world-class regulator. 123 Agreement with US. Strong capital, pro-US, demonstrating that Gulf can do nuclear.',
    keySignals: ['Barakah Unit 4 operational 2024', 'FANR recognized as mature regulator', 'US 123 Agreement in force'],
    competitors: [{ name: 'KHNP', presence: 'active' }, { name: 'Westinghouse', presence: 'active' }],
    marketSizeGW: 6, timelineYears: 5,
  },
  {
    id: 'SA', name: 'Saudi Arabia', region: 'middle_east', subregion: 'Gulf', flagEmoji: 'ð¸ð¦',
    energyPrice: 3.5, carbonCommitment: 6.0, nuclearFramework: 5.0, marketDeregulation: 4.5,
    partnerEcosystem: 7.0, licensingClarity: 4.5, geopoliticalSafety: 6.5, financingSupport: 9.5,
    notes: 'Vision 2030 includes 17.6 GW nuclear. 123 Agreement negotiations complex (uranium enrichment insistence). Both US and Korean vendors competing. KACARE developing regulatory framework.',
    keySignals: ['17.6 GW nuclear target by 2040', '123 Agreement negotiations ongoing', 'K.A.CARE nuclear authority established'],
    competitors: [{ name: 'Westinghouse', presence: 'bidding' }, { name: 'KHNP', presence: 'bidding' }, { name: 'EDF', presence: 'bidding' }],
    marketSizeGW: 18, timelineYears: 6,
  },
  {
    id: 'JO', name: 'Jordan', region: 'middle_east', subregion: 'Levant', flagEmoji: 'ð¯ð´',
    energyPrice: 7.5, carbonCommitment: 7.0, nuclearFramework: 6.5, marketDeregulation: 5.5,
    partnerEcosystem: 8.5, licensingClarity: 6.0, geopoliticalSafety: 7.5, financingSupport: 5.5,
    notes: 'JAEC active nuclear program. US 123 Agreement signed. High electricity prices and energy import dependence. SMR scale appropriate for grid size.',
    keySignals: ['123 Agreement with US signed', 'JAEC Jordan Research Reactor operating', 'National nuclear program milestones met'],
    competitors: [{ name: 'Westinghouse', presence: 'exploring' }],
    marketSizeGW: 2, timelineYears: 7,
  },

  // âââ AFRICA ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: 'ZA', name: 'South Africa', region: 'africa', subregion: 'Southern Africa', flagEmoji: 'ð¿ð¦',
    energyPrice: 7.0, carbonCommitment: 7.5, nuclearFramework: 8.0, marketDeregulation: 5.5,
    partnerEcosystem: 7.5, licensingClarity: 7.0, geopoliticalSafety: 8.0, financingSupport: 5.5,
    notes: 'Koeberg operating (only in Africa). PBMR historical program. Load-shedding crisis creating urgent need. 2,500 MW tender in IRP 2023. NNR world-class regulator.',
    keySignals: ['2,500 MW nuclear in IRP 2023', 'Eskom Koeberg life extension approved', 'Load-shedding driving energy urgency'],
    competitors: [{ name: 'Westinghouse', presence: 'bidding' }, { name: 'KHNP', presence: 'bidding' }, { name: 'Rosatom', presence: 'exploring' }],
    marketSizeGW: 3, timelineYears: 6,
  },
  {
    id: 'KE', name: 'Kenya', region: 'africa', subregion: 'East Africa', flagEmoji: 'ð°ðª',
    energyPrice: 6.5, carbonCommitment: 7.5, nuclearFramework: 4.0, marketDeregulation: 5.5,
    partnerEcosystem: 8.0, licensingClarity: 3.5, geopoliticalSafety: 7.5, financingSupport: 4.5,
    notes: 'KNEB established. US partnership discussions. Grid-scale SMR interest. Milestones 1-3 IAEA framework in development. Growing economy with power demand surge.',
    keySignals: ['KNEB nuclear authority established', 'US-Kenya civil nuclear discussions', 'IAEA INIR mission completed'],
    competitors: [],
    marketSizeGW: 1, timelineYears: 10,
  },
]

export const REGION_LABELS: Record<string, string> = {
  europe: 'Europe',
  asia_pacific: 'Asia Pacific',
  middle_east: 'Middle East',
  americas: 'Americas',
  africa: 'Africa',
}

export const SCORE_DIMENSIONS: Array<{ key: keyof ScoreWeights; label: string; color: string; description: string }> = [
  { key: 'nuclearFramework',   label: 'Nuclear Framework',    color: '#f97316', description: 'Existing regulatory & legal framework for nuclear power' },
  { key: 'partnerEcosystem',   label: 'Partner Ecosystem',    color: '#8b5cf6', description: 'US alliance strength & export-friendly geopolitics' },
  { key: 'geopoliticalSafety', label: 'Geopolitical Safety',  color: '#10b981', description: 'Political stability, NATO/US alignment, non-proliferation' },
  { key: 'licensingClarity',   label: 'Licensing Clarity',    color: '#06b6d4', description: 'Regulatory path clarity & licensing speed for new nuclear' },
  { key: 'carbonCommitment',   label: 'Carbon Commitment',    color: '#6366f1', description: 'Strength of net-zero / decarbonization policy' },
  { key: 'energyPrice',        label: 'Energy Price Incentive', color: '#f59e0b', description: 'High industrial electricity cost â strong incentive for nuclear' },
  { key: 'financingSupport',   label: 'Financing Support',    color: '#ec4899', description: 'Availability of public/private finance for nuclear projects' },
  { key: 'marketDeregulation', label: 'Market Deregulation',  color: '#84cc16', description: 'How open & competitive the power market structure is' },
]

export const COMPETITOR_COLORS: Record<string, string> = {
  'Westinghouse': '#3b82f6',
  'NuScale':      '#a855f7',
  'GE-Hitachi':   '#f59e0b',
  'KHNP':         '#ef4444',
  'Rolls-Royce':  '#06b6d4',
  'EDF':          '#6366f1',
  'X-energy':     '#10b981',
  'TerraPower':   '#f97316',
  'Framatome':    '#8b5cf6',
  'Mitsubishi':   '#ec4899',
  'Rosatom':      '#6b7280',
}
