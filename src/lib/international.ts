export interface CountryScore {
  id: string           // ISO 3166-1 alpha-2
  name: string
  region: 'europe' | 'asia_pacific' | 'middle_east' | 'americas' | 'africa'
  subregion: string
  // Raw scores 0–10
  energyPrice: number       // High industrial electricity cost → more incentive for cheap nuclear
  carbonCommitment: number  // Strength of net-zero / decarbonization policy
  nuclearFramework: number  // Existing regulatory / legal framework for nuclear
  marketDeregulation: number // How open / deregulated the power market is
  partnerEcosystem: number  // US alliance / export-friendly geopolitics
  licensingClarity: number  // Regulatory clarity / speed for new nuclear licensing
  geopoliticalSafety: number // Stability, NATO/US alliance, non-proliferation compliance
  financingSupport: number   // Availability of public/private finance for nuclear
  notes: string
  keySignals?: string[]
  flagEmoji?: string
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

  const maxPossible =
    10 * (w.energyPrice + w.carbonCommitment + w.nuclearFramework + w.marketDeregulation +
          w.partnerEcosystem + w.licensingClarity + w.geopoliticalSafety + w.financingSupport)

  return maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 0
}

export const COUNTRIES: CountryScore[] = [
  // ─── EUROPE ────────────────────────────────────────────────────────────────────────────
  {
    id: 'GB', name: 'United Kingdom', region: 'europe', subregion: 'Western Europe', flagEmoji: '🇬🇧',
    energyPrice: 8.5, carbonCommitment: 8.0, nuclearFramework: 8.5, marketDeregulation: 7.5,
    partnerEcosystem: 9.5, licensingClarity: 7.0, geopoliticalSafety: 9.5, financingSupport: 8.0,
    notes: 'Strong AUKUS partner, existing nuclear fleet (EDF). Government backing advanced nuclear via Great British Nuclear program. Rolls-Royce SMR program advancing. High electricity prices drive demand.',
    keySignals: ['Rolls-Royce SMR advanced to next stage', 'GBN program established', '£300M SMR funding committed', 'Hinkley Point C under construction'],
  },
  {
    id: 'FR', name: 'France', region: 'europe', subregion: 'Western Europe', flagEmoji: '🇫🇷',
    energyPrice: 7.0, carbonCommitment: 8.5, nuclearFramework: 9.5, marketDeregulation: 6.0,
    partnerEcosystem: 8.0, licensingClarity: 8.0, geopoliticalSafety: 9.0, financingSupport: 8.5,
    notes: 'World\'s highest nuclear dependence (~70% of power). Strong state support for nuclear via EDF. Macron announced 14 new reactors. Deep regulatory expertise but market less deregulated.',
    keySignals: ['14 new EPR2 reactors announced', 'French taxonomy classifies nuclear as green', 'EDF re-nationalized to back nuclear buildout'],
  },
  {
    id: 'PL', name: 'Poland', region: 'europe', subregion: 'Central & Eastern Europe', flagEmoji: '🇵🇱',
    energyPrice: 9.0, carbonCommitment: 7.0, nuclearFramework: 5.5, marketDeregulation: 6.5,
    partnerEcosystem: 9.0, licensingClarity: 5.5, geopoliticalSafety: 8.5, financingSupport: 7.0,
    notes: 'Pivoting from coal to nuclear, partnered with US (Westinghouse AP1000 at Choczewo). Strong NATO ally, major US partnership opportunity. Building regulatory framework from scratch.',
    keySignals: ['Westinghouse selected for first nuclear plant', 'US Export-Import-Import Bank support', 'Energy security driving nuclear push'],
  },
  {
    id: 'CZ', name: 'Czech Republic', region: 'europe', subregion: 'Central & Eastern Europe', flagEmoji: '🇨🇿',
    energyPrice: 8.0, carbonCommitment: 7.5, nuclearFramework: 7.0, marketDeregulation: 6.5,
    partnerEcosystem: 8.5, licensingClarity: 6.5, geopoliticalSafety: 9.0, financingSupport: 7.0,
    notes: 'Operates Dukovany & Temelín. Tendr for new large reactor units. SMR interest growing. Strong pro-nuclear government.',
    keySignals: ['Dukovany expansion tender ongoing', 'Excluded Russia/China from tender', 'SMR study published 2024'],
  },
  {
    id: 'SE', name: 'Sweden', region: 'europe', subregion: 'Northern Europe', flagEmoji: '🇸🇪',
    energyPrice: 7.5, carbonCommitment: 9.0, nuclearFramework: 8.0, marketDeregulation: 8.0,
    partnerEcosystem: 9.0, licensingClarity: 7.5, geopoliticalSafety: 9.5, financingSupport: 8.0,
    notes: 'Reversed nuclear moratorium in 2022. Government supporting SMR development. New legislation allows new reactors at more than 3 sites. Nordic power market well-structured.',
    keySignals: ['Nuclear moratorium lifted', 'Vattenfall studying SMR deployment', 'NATO member (joined 2024)'],
  },
  {
    id: 'FI', name: 'Finland', region: 'europe', subregion: 'Northern Europe', flagEmoji: '🇫🇮',
    energyPrice: 7.0, carbonCommitment: 9.0, nuclearFramework: 9.0, marketDeregulation: 7.5,
    partnerEcosystem: 9.0, licensingClarity: 8.5, geopoliticalSafety: 9.5, financingSupport: 8.0,
    notes: 'Olkiluoto 3 (world\'s newest PWR) completed 2023. Strong nuclear culture, NDA licensing process mature. NATO member. Fortum exploring SMR.',
    keySignals: ['Olkiluoto 3 online', 'Fortum SMR study', 'NATO member (joined 2023)'],
  },
  {
    id: 'NL', name: 'Netherlands', region: 'europe', subregion: 'Western Europe', flagEmoji: '🇳🇱',
    energyPrice: 8.0, carbonCommitment: 8.5, nuclearFramework: 6.5, marketDeregulation: 8.5,
    partnerEcosystem: 9.0, licensingClarity: 6.5, geopoliticalSafety: 9.5, financingSupport: 7.5,
    notes: 'Two new large nuclear plants announced by Dutch government (2023). Borssele operating. Strong NATO ally. Regulatory build-up needed for new fleet.',
    keySignals: ['2 new 1.5GW reactors approved', 'Borssele extended to 2035', 'Dutch government €500M nuclear commitment'],
  },
  {
    id: 'RO', name: 'Romania', region: 'europe', subregion: 'Central & Eastern Europe', flagEmoji: '🇷🇴',
    energyPrice: 7.5, carbonCommitment: 7.0, nuclearFramework: 7.5, marketDeregulation: 6.0,
    partnerEcosystem: 8.5, licensingClarity: 6.5, geopoliticalSafety: 8.0, financingSupport: 6.5,
    notes: 'Cernavodă units operating, Units 3&4 being developed with US support. NuScale SMR MOU signed. Strong US partnership since pivoting from China.',
    keySignals: ['NuScale SMR MOU signed', 'Cernavodă 3&4 with US/Canadian support', 'EXIM Bank financing discussions'],
  },
  {
    id: 'SK', name: 'Slovakia', region: 'europe', subregion: 'Central & Eastern Europe', flagEmoji: '🇸🇰',
    energyPrice: 8.0, carbonCommitment: 7.5, nuclearFramework: 7.5, marketDeregulation: 5.5,
    partnerEcosystem: 8.5, licensingClarity: 6.5, geopoliticalSafety: 9.0, financingSupport: 6.5,
    notes: 'High nuclear dependence. Mochovce 3&4 completing. Exploring SMR for post-2035. Pro-nuclear policy.',
    keySignals: ['Mochovce 3 completed 2023', 'SMR interest from government'],
  },
  {
    id: 'BE', name: 'Belgium', region: 'europe', subregion: 'Western Europe', flagEmoji: '🇧🇪',
    energyPrice: 8.5, carbonCommitment: 8.0, nuclearFramework: 7.0, marketDeregulation: 7.5,
    partnerEcosystem: 9.0, licensingClarity: 6.0, geopoliticalSafety: 9.5, financingSupport: 7.0,
    notes: 'Reversed nuclear phase-out 2022. Doel 4 & Tihange 3 extended 10 years. SMR interest growing. High energy prices and grid security concerns driving pro-nuclear shift.',
    keySignals: ['Phase-out reversed 2022', '10-year extension for 2 plants', 'Engie SMR study'],
  },
  {
    id: 'DE', name: 'Germany', region: 'europe', subregion: 'Western Europe', flagEmoji: '🇩🇪',
    energyPrice: 9.5, carbonCommitment: 8.5, nuclearFramework: 3.0, marketDeregulation: 8.0,
    partnerEcosystem: 8.5, licensingClarity: 2.0, geopoliticalSafety: 9.5, financingSupport: 4.0,
    notes: 'Shut down last 3 plants April 2023. Strong opposition. SMR discussion beginning but major political/legal hurdles. High electricity prices may force reconsideration.',
    keySignals: ['Last plants closed April 2023', 'CDU calling for reconsideration', 'Energy prices highest in EU'],
  },
  {
    id: 'UA', name: 'Ukraine', region: 'europe', subregion: 'Eastern Europe', flagEmoji: '🇺🇦',
    energyPrice: 6.0, carbonCommitment: 5.0, nuclearFramework: 8.0, marketDeregulation: 4.5,
    partnerEcosystem: 8.0, licensingClarity: 5.0, geopoliticalSafety: 2.5, financingSupport: 4.5,
    notes: 'Large nuclear fleet (15 units, ~55% of power). Westinghouse partnerships expanding post-2022. Geopolitical risk is primary barrier. Post-war reconstruction opportunity.',
    keySignals: ['Westinghouse expanding Ukrainian supply', 'Post-war reconstruction planning underway'],
  },

  // ─── ASIA PACIFIC ────────────────────────────────────────────────────────────────────────────
  {
    id: 'KR', name: 'South Korea', region: 'asia_pacific', subregion: 'East Asia', flagEmoji: '🇰🇷',
    energyPrice: 6.5, carbonCommitment: 8.0, nuclearFramework: 9.5, marketDeregulation: 5.5,
    partnerEcosystem: 9.0, licensingClarity: 9.0, geopoliticalSafety: 7.5, financingSupport: 8.5,
    notes: 'World-class nuclear build capacity (KEPCO/KHNP). Reversed phase-out under Yoon government. APR1400 deployed domestically and in UAE. SMR program active (SMART, i-SMR). Strong US ally.',
    keySignals: ['Phase-out reversed 2022', '4 new units under construction', 'i-SMR design approved 2022', 'US-Korea nuclear cooperation MOU'],
  },
  {
    id: 'JP', name: 'Japan', region: 'asia_pacific', subregion: 'East Asia', flagEmoji: '🇯🇵',
    energyPrice: 9.0, carbonCommitment: 8.5, nuclearFramework: 7.5, marketDeregulation: 6.5,
    partnerEcosystem: 9.5, licensingClarity: 6.0, geopoliticalSafety: 8.0, financingSupport: 7.5,
    notes: 'Post-Fukushima restarts accelerating under GX policy. Kishida committed to restart + new build. High electricity prices, carbon goals, and US alliance create strong Oklo opportunity window.',
    keySignals: ['GX Green Transformation policy includes nuclear', '17 restarts approved/operating', 'New build explicitly on table for first time since 2011'],
  },
  {
    id: 'TW', name: 'Taiwan', region: 'asia_pacific', subregion: 'East Asia', flagEmoji: '🇹🇼',
    energyPrice: 7.0, carbonCommitment: 7.5, nuclearFramework: 6.0, marketDeregulation: 5.5,
    partnerEcosystem: 9.0, licensingClarity: 5.5, geopoliticalSafety: 5.5, financingSupport: 6.5,
    notes: 'Phase-out policy officially reversed 2023. Chinshan and Maanshan reopening discussions. Semiconductor industry drives massive power demand. US ally in key geopolitical position.',
    keySignals: ['Nuclear phase-out reversed 2023', 'TSMC driving power demand', 'IAEA consultations ongoing'],
  },
  {
    id: 'IN', name: 'India', region: 'asia_pacific', subregion: 'South Asia', flagEmoji: '🇮🇳',
    energyPrice: 5.5, carbonCommitment: 7.5, nuclearFramework: 7.0, marketDeregulation: 5.0,
    partnerEcosystem: 7.5, licensingClarity: 5.5, geopoliticalSafety: 6.5, financingSupport: 6.5,
    notes: 'Massive nuclear expansion plans (100 GW target by 2047). NPCIL growing. US-India 123 Agreement. Liability law is key barrier for foreign vendors. Growing partnership.',
    keySignals: ['100 GW nuclear target by 2047', '9 new 700MW PHWR units under construction', 'US-India NCRI initiative', 'Liability law reform discussions'],
  },
  {
    id: 'AU', name: 'Australia', region: 'asia_pacific', subregion: 'Oceania', flagEmoji: '🇦🇺',
    energyPrice: 8.5, carbonCommitment: 7.5, nuclearFramework: 3.5, marketDeregulation: 8.0,
    partnerEcosystem: 9.5, licensingClarity: 3.0, geopoliticalSafety: 9.5, financingSupport: 6.0,
    notes: 'AUKUS nuclear submarines driving policy shift. Nuclear ban exists but political debate intensifying. Coalition government proposed 7 nuclear power plants. Very early stage.',
    keySignals: ['AUKUS submarine program', 'Coalition nuclear power proposal (7 plants)', 'Nuclear ban currently in law'],
  },
  {
    id: 'VN', name: 'Vietnam', region: 'asia_pacific', subregion: 'Southeast Asia', flagEmoji: '🇻🇳',
    energyPrice: 6.0, carbonCommitment: 6.5, nuclearFramework: 4.0, marketDeregulation: 4.5,
    partnerEcosystem: 7.0, licensingClarity: 4.0, geopoliticalSafety: 7.0, financingSupport: 5.5,
    notes: 'Revived nuclear program in 2023 after cancellation in 2016. Power shortages and demand growth driving decision. US partnership discussions active. SMR interest high.',
    keySignals: ['Nuclear program revived 2023', 'Power shortage crisis 2023', 'US-Vietnam MOU discussions'],
  },
  {
    id: 'PH', name: 'Philippines', region: 'asia_pacific', subregion: 'Southeast Asia', flagEmoji: '🇵🇭',
    energyPrice: 8.0, carbonCommitment: 7.0, nuclearFramework: 4.5, marketDeregulation: 6.0,
    partnerEcosystem: 8.5, licensingClarity: 4.0, geopoliticalSafety: 7.0, financingSupport: 5.5,
    notes: 'Marcos administration pursuing nuclear as part of energy mix. US ally. Bataan NPP discussions ongoing (never operated). SMR interest expressed. Archipelago model suits distributed nuclear.',
    keySignals: ['EO 164 nuclear development signed 2023', 'IAEA country nuclear program review requested', 'US-Philippines Enhanced Defense Cooperation Agreement'],
  },
  {
    id: 'MY', name: 'Malaysia', region: 'asia_pacific', subregion: 'Southeast Asia', flagEmoji: '🇲🇾',
    energyPrice: 6.5, carbonCommitment: 6.0, nuclearFramework: 3.5, marketDeregulation: 5.0,
    partnerEcosystem: 6.5, licensingClarity: 3.5, geopoliticalSafety: 8.0, financingSupport: 5.5,
    notes: 'Formal nuclear feasibility study underway. IAEA advisory mission conducted. Energy transition driving interest. Balanced geopolitical position (US and China relationships).',
    keySignals: ['Nuclear feasibility study launched', 'IAEA mission completed 2023', 'Energy transition plan includes nuclear option'],
  },
  {
    id: 'SG', name: 'Singapore', region: 'asia_pacific', subregion: 'Southeast Asia', flagEmoji: '🇸🇬',
    energyPrice: 8.5, carbonCommitment: 8.0, nuclearFramework: 3.0, marketDeregulation: 9.0,
    partnerEcosystem: 9.5, licensingClarity: 4.0, geopoliticalSafety: 9.5, financingSupport: 9.0,
    notes: 'IAEA assessment conducted 2023. City-state logistics challenging but floating/offshore SMR interest. Strong US ally and financial hub. Very deregulated energy market.',
    keySignals: ['IAEA assessment 2023', 'Long-term energy plan includes nuclear option', 'GreenTech Alliance with US'],
  },
  {
    id: 'ID', name: 'Indonesia', region: 'asia_pacific', subregion: 'Southeast Asia', flagEmoji: '🇮🇩',
    energyPrice: 5.0, carbonCommitment: 6.5, nuclearFramework: 4.5, marketDeregulation: 4.5,
    partnerEcosystem: 7.0, licensingClarity: 4.0, geopoliticalSafety: 7.5, financingSupport: 5.5,
    notes: 'BATAN studying SMR deployment. IAEA assistance ongoing. Government officially supports nuclear for energy security. Large archipelago — distributed SMR model natural fit.',
    keySignals: ['National Energy Policy includes nuclear', 'IAEA training program active', 'ThorCon molten salt reactor discussions'],
  },

  // ─── MIDDLE EAST ────────────────────────────────────────────────────────────────────────────
  {
    id: 'AE', name: 'UAE', region: 'middle_east', subregion: 'Gulf', flagEmoji: '🇦🇪',
    energyPrice: 5.0, carbonCommitment: 7.5, nuclearFramework: 8.5, marketDeregulation: 7.0,
    partnerEcosystem: 9.0, licensingClarity: 8.0, geopoliticalSafety: 8.5, financingSupport: 9.5,
    notes: 'Barakah (4 × APR1400) operating — first Arab nuclear power. FANR world-class regulator. 123 Agreement with US. Strong capital, pro-US, demonstrating that Gulf can do nuclear.',
    keySignals: ['Barakah Unit 4 operational 2024', 'FANR recognized as mature regulator', 'US 123 Agreement in force'],
  },
  {
    id: 'SA', name: 'Saudi Arabia', region: 'middle_east', subregion: 'Gulf', flagEmoji: '🇸🇦',
    energyPrice: 3.5, carbonCommitment: 6.0, nuclearFramework: 5.0, marketDeregulation: 4.5,
    partnerEcosystem: 7.0, licensingClarity: 4.5, geopoliticalSafety: 6.5, financingSupport: 9.5,
    notes: 'Vision 2030 includes 17.6 GW nuclear. 123 Agreement negotiations complex (uranium enrichment insistence). Both US and Korean vendors competing. KACARE developing regulatory framework.',
    keySignals: ['17.6 GW nuclear target by 2040', '123 Agreement negotiations ongoing', 'K.A.CARE nuclear authority established'],
  },
  {
    id: 'JO', name: 'Jordan', region: 'middle_east', subregion: 'Levant', flagEmoji: '🇯🇴',
    energyPrice: 7.5, carbonCommitment: 7.0, nuclearFramework: 6.5, marketDeregulation: 5.5,
    partnerEcosystem: 8.5, licensingClarity: 6.0, geopoliticalSafety: 7.5, financingSupport: 5.5,
    notes: 'JAEC active nuclear program. US 123 Agreement signed. High electricity prices and energy import dependence. SMR scale appropriate for grid size.',
    keySignals: ['123 Agreement with US signed', 'JAEC Jordan Research Reactor operating', 'National nuclear program milestones met'],
  },

  // ─── AMERICAS ────────────────────────────────────────────────────────────────────────────
  {
    id: 'CA', name: 'Canada', region: 'americas', subregion: 'North America', flagEmoji: '🇨🇦',
    energyPrice: 7.0, carbonCommitment: 9.0, nuclearFramework: 9.5, marketDeregulation: 7.0,
    partnerEcosystem: 9.5, licensingClarity: 9.0, geopoliticalSafety: 9.5, financingSupport: 8.5,
    notes: 'Ontario and New Brunswick leading SMR deployment. CNSC actively pre-licensing 4 SMR designs (including X-energy). Darlington refurb + new SMR plans. Five countries SMR collaboration.',
    keySignals: ['4 SMR designs in CNSC pre-licensing', 'Darlington SMR site approved', 'G7 Net Zero Nuclear initiative'],
  },
  {
    id: 'BR', name: 'Brazil', region: 'americas', subregion: 'South America', flagEmoji: '🇧🇷',
    energyPrice: 6.5, carbonCommitment: 7.0, nuclearFramework: 7.0, marketDeregulation: 5.5,
    partnerEcosystem: 7.0, licensingClarity: 6.0, geopoliticalSafety: 8.5, financingSupport: 5.5,
    notes: 'Angra 3 construction resuming. Naval nuclear program (submarines). CNEN regulatory body active. Lula government mixed on nuclear but pragmatic. Large country, remote regions suit SMR.',
    keySignals: ['Angra 3 completion restarted', 'Naval nuclear submarine program', 'CNEN licensing reform discussions'],
  },

  // ─── AFRICA ──────────────────────────────────────────────────────────────────────────────
  {
    id: 'ZA', name: 'South Africa', region: 'africa', subregion: 'Southern Africa', flagEmoji: '🇿🇦',
    energyPrice: 7.0, carbonCommitment: 7.5, nuclearFramework: 8.0, marketDeregulation: 5.5,
    partnerEcosystem: 7.5, licensingClarity: 7.0, geopoliticalSafety: 8.0, financingSupport: 5.5,
    notes: 'Koeberg operating (only in Africa). PBMR historical program. Load-shedding crisis creating urgent need. 2,500 MW tender in IRP 2023. NNR world-class regulator.',
    keySignals: ['2,500 MW nuclear in IRP 2023', 'Eskom Koeberg life extension approved', 'Load-shedding driving energy urgency'],
  },
  {
    id: 'KE', name: 'Kenya', region: 'africa', subregion: 'East Africa', flagEmoji: '🇰🇪',
    energyPrice: 6.5, carbonCommitment: 7.5, nuclearFramework: 4.0, marketDeregulation: 5.5,
    partnerEcosystem: 8.0, licensingClarity: 3.5, geopoliticalSafety: 7.5, financingSupport: 4.5,
    notes: 'KNEB established. US partnership discussions. Grid-scale SMR interest. Milestones 1-3 IAEA framework in development. Growing economy with power demand surge.',
    keySignals: ['KNEB nuclear authority established', 'US-Kenya civil nuclear discussions', 'IAEA INIR mission completed'],
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
  { key: 'energyPrice',        label: 'Energy Price Incentive', color: '#f59e0b', description: 'High industrial electricity cost → strong incentive for nuclear' },
  { key: 'financingSupport',   label: 'Financing Support',    color: '#ec4899', description: 'Availability of public/private finance for nuclear projects' },
  { key: 'marketDeregulation', label: 'Market Deregulation',  color: '#84cc16', description: 'How open & competitive the power market structure is' },
]
