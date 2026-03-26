export interface OkloSite {
  id: string
  name: string
  city: string
  state: string
  lat: number
  lng: number
  owner: string
  priority: number // 1-5, 5 = highest
  nextSteps?: string
  ntt?: boolean
  equinix?: boolean
  vantage?: boolean
  iso?: string
  gridConnection?: string
  powerAvailableMW?: number
  developer?: string
  mdScore?: MDScore
  notes?: string
}

export interface MDScore {
  siteLocation: number
  marketOpportunity: number
  infrastructure: number
  siteCharacteristics: number
  workforce: number
  riskManagement: number
  total: number
  confidence: number
}

export interface Utility {
  id: string
  name: string
  ticker?: string
  region: string
  states: string[]
  type: 'IOU' | 'Municipal' | 'Co-op' | 'Federal'
  nuclearStance: 'pro' | 'exploring' | 'neutral' | 'anti'
  stanceDetails: string
  existingNuclear: string[]
  smrPlans: string
  interconnectionStatus: string
  iso: string
  priority: 1 | 2 | 3 | 4
  recentNews?: string
  okloRelevance?: string
  logoColor: string
}

export interface CoalPlant {
  id: string
  name: string
  city: string
  state: string
  lat: number
  lng: number
  capacityMW: number
  status: 'operating' | 'retiring' | 'retired'
  retirementYear?: number
  owner?: string
}

export interface Substation {
  id: string
  name: string
  state: string
  lat: number
  lng: number
  voltageKV: number
  iso: string
}

export interface LayerConfig {
  id: string
  label: string
  color: string
  icon: string
  description: string
}

export const MAP_LAYERS: LayerConfig[] = [
  { id: 'iso', label: 'ISO/RTO Regions', color: '#8b5cf6', icon: '⚡', description: 'Electricity market boundaries' },
  { id: 'income', label: 'Median Income', color: '#3b82f6', icon: '💰', description: 'Median household income by county (Census ACS)' },
  { id: 'unemployment', label: 'Unemployment Rate', color: '#10b981', icon: '👷', description: 'Unemployment rate by county (Census ACS)' },
  { id: 'coal', label: 'Coal Plant Shutdowns', color: '#ef4444', icon: '🏭', description: 'Major coal power plants — operating, retiring, retired' },
  { id: 'substations', label: 'Major Substations', color: '#f59e0b', icon: '🔌', description: '345kV+ transmission substations' },
  { id: 'govland', label: 'Federal Land', color: '#22c55e', icon: '🏛️', description: 'Federal government owned land (BLM, USFS, DOE, DOD)' },
  { id: 'nuclear', label: 'Nuclear-Friendly States', color: '#06b6d4', icon: '⚛️', description: 'States with no nuclear moratoriums / active SMR interest' },
  { id: 'sites', label: 'Oklo Sites', color: '#f97316', icon: '📍', description: 'Oklo candidate and active sites' },
]

export const ISO_COLORS: Record<string, string> = {
  'PJM':     '#6366f1',
  'MISO':    '#14b8a6',
  'CAISO':   '#f59e0b',
  'SPP':     '#84cc16',
  'ERCOT':   '#ef4444',
  'NYISO':   '#8b5cf6',
  'ISO-NE':  '#ec4899',
  'TVA':     '#06b6d4',
  'SERC':    '#f97316',
  'WECC':    '#a3e635',
  'Non-ISO': '#6b7280',
}

// State FIPS -> ISO assignment (simplified, primary ISO per state)
export const STATE_FIPS_ISO: Record<string, string> = {
  '09': 'ISO-NE', '23': 'ISO-NE', '25': 'ISO-NE', '33': 'ISO-NE', '44': 'ISO-NE', '50': 'ISO-NE',
  '36': 'NYISO',
  '10': 'PJM', '11': 'PJM', '24': 'PJM', '34': 'PJM', '39': 'PJM', '42': 'PJM', '51': 'PJM', '54': 'PJM',
  '17': 'MISO', '18': 'MISO', '19': 'MISO', '21': 'MISO', '22': 'MISO', '26': 'MISO', '27': 'MISO',
  '28': 'MISO', '29': 'MISO', '38': 'MISO', '46': 'MISO', '55': 'MISO', '05': 'MISO',
  '47': 'TVA',
  '48': 'ERCOT',
  '20': 'SPP', '31': 'SPP', '40': 'SPP',
  '06': 'CAISO',
  '04': 'WECC', '08': 'WECC', '16': 'WECC', '30': 'WECC', '32': 'WECC', '35': 'WECC',
  '41': 'WECC', '49': 'WECC', '53': 'WECC', '56': 'WECC',
  '01': 'SERC', '12': 'SERC', '13': 'SERC', '37': 'SERC', '45': 'SERC',
  '02': 'Non-ISO', '15': 'Non-ISO',
  '72': 'Non-ISO', // PR
}

// States with nuclear moratoriums (hostile to new nuclear)
export const NUCLEAR_MORATORIUM_STATES = ['CA', 'CT', 'IL', 'KY', 'MA', 'ME', 'MN', 'MT', 'NJ', 'NY', 'OR', 'WI']
// States actively pursuing / no moratorium (favorable)
export const NUCLEAR_FRIENDLY_STATES = [
  'TX', 'WY', 'ID', 'CO', 'WV', 'GA', 'TN', 'VA', 'PA', 'OH', 'IN', 'MI', 'MO',
  'UT', 'NV', 'NM', 'AZ', 'WA', 'ND', 'SD', 'NE', 'KS', 'OK', 'AR', 'LA', 'MS',
  'AL', 'SC', 'NC', 'FL', 'MD', 'DE', 'NH', 'VT', 'RI', 'IA', 'AK'
]
