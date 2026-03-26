import type { OkloSite } from './types'

export const OKLO_SITES: OkloSite[] = [
  {
    id: 'conesville-oh',
    name: 'Conesville',
    city: 'Conesville', state: 'OH',
    lat: 40.2281, lng: -81.8632,
    owner: 'Frontier', priority: 5,
    nextSteps: 'NDA > Discuss with Liberty and socialize with customers',
    ntt: true, equinix: true, vantage: true,
    iso: 'PJM', notes: 'Former coal plant site — high priority data center + nuclear anchor'
  },
  {
    id: 'sodi-piketon-oh',
    name: 'Sodi Land / Piketon',
    city: 'Piketon', state: 'OH',
    lat: 39.0059, lng: -83.0138,
    owner: 'Oklo', priority: 5,
    iso: 'PJM',
    notes: 'Oklo-owned land adjacent to Portsmouth Gaseous Diffusion Plant (DOE). High strategic value.',
    mdScore: { siteLocation: 9.0, marketOpportunity: 7.0, infrastructure: 7.0, siteCharacteristics: 8.0, workforce: 7.0, riskManagement: 8.0, total: 7.8, confidence: 0.80 }
  },
  {
    id: 'amp-cadiz-oh',
    name: 'AMP Z Cadiz',
    city: 'Cadiz', state: 'OH',
    lat: 40.2681, lng: -80.9987,
    owner: 'AMP Z', priority: 4,
    ntt: true, equinix: true, vantage: true,
    iso: 'PJM',
    mdScore: { siteLocation: 8.0, marketOpportunity: 8.5, infrastructure: 7.5, siteCharacteristics: 7.0, workforce: 7.0, riskManagement: 8.0, total: 7.6, confidence: 0.65 }
  },
  {
    id: 'savannah-river-sc',
    name: 'Savannah River Site',
    city: 'Aiken', state: 'SC',
    lat: 33.5604, lng: -81.7195,
    owner: 'DOE', priority: 4,
    vantage: true,
    iso: 'SERC',
    notes: 'Major DOE nuclear research facility. Strong federal land & existing nuclear infrastructure.'
  },
  {
    id: 'amp-lufkin-tx',
    name: 'AMP Z Lufkin',
    city: 'Lufkin', state: 'TX',
    lat: 31.3382, lng: -94.7291,
    owner: 'AMP Z', priority: 3,
    vantage: true,
    iso: 'ERCOT',
    mdScore: { siteLocation: 8.5, marketOpportunity: 7.0, infrastructure: 6.5, siteCharacteristics: 7.0, workforce: 6.0, riskManagement: 7.5, total: 7.0, confidence: 0.55 }
  },
  {
    id: 'fort-cherry-pa',
    name: 'Fort Cherry',
    city: 'Washington County', state: 'PA',
    lat: 40.1737, lng: -80.2467,
    owner: 'Liberty', priority: 3,
    ntt: true, equinix: true, vantage: true,
    iso: 'PJM'
  },
  {
    id: 'il-rock-air-il',
    name: 'IL Rock Air',
    city: 'Rockford', state: 'IL',
    lat: 42.2711, lng: -89.0940,
    owner: 'Monarch', priority: 3,
    ntt: true, equinix: true, vantage: true,
    iso: 'MISO'
  },
  {
    id: 'oak-ridge-tn',
    name: 'Oak Ridge',
    city: 'Oak Ridge', state: 'TN',
    lat: 36.0104, lng: -84.2696,
    owner: 'DOE', priority: 3,
    iso: 'TVA',
    notes: 'Historic DOE national lab. Adjacent to TVA transmission. Strong federal support for nuclear.'
  },
  {
    id: 'cheyenne-wy',
    name: 'Cheyenne Site',
    city: 'Cheyenne', state: 'WY',
    lat: 41.1400, lng: -104.8202,
    owner: 'DCES/Vantage', priority: 3,
    iso: 'WECC'
  },
  {
    id: 'cam-maypearl-tx',
    name: 'CAM Maypearl',
    city: 'Maypearl', state: 'TX',
    lat: 32.3249, lng: -97.0039,
    owner: 'CAM', priority: 2,
    ntt: true, equinix: true, vantage: true,
    iso: 'ERCOT',
    mdScore: { siteLocation: 8.0, marketOpportunity: 6.5, infrastructure: 8.0, siteCharacteristics: 7.5, workforce: 7.0, riskManagement: 6.5, total: 7.0, confidence: 0.50 }
  },
  {
    id: 'redhawk-pa',
    name: 'Redhawk Site',
    city: 'York County', state: 'PA',
    lat: 40.1204, lng: -76.7274,
    owner: 'Liberty', priority: 2,
    iso: 'PJM'
  },
  {
    id: 'satsop-wa',
    name: 'Satsop Business Park',
    city: 'Elma', state: 'WA',
    lat: 47.0037, lng: -123.4012,
    owner: 'Lorin', priority: 2,
    iso: 'WECC',
    notes: 'Former WNP-3 nuclear plant site. Cooling towers still standing. Pre-existing nuclear infrastructure.'
  },
  {
    id: 'karis-oh',
    name: 'Karis Critical',
    city: 'Ashville', state: 'OH',
    lat: 39.7198, lng: -82.9485,
    owner: 'Karis/ECP', priority: 2,
    iso: 'PJM'
  },
  {
    id: 'victory-nv',
    name: 'Victory Logistics District',
    city: 'Fernley', state: 'NV',
    lat: 39.6082, lng: -119.2521,
    owner: 'Stella', priority: 2,
    vantage: true,
    iso: 'WECC'
  },
  {
    id: 'campbell-nm',
    name: 'Campbell Business Park',
    city: 'Belen', state: 'NM',
    lat: 34.6618, lng: -106.7744,
    owner: 'Enerco', priority: 2,
    vantage: true,
    iso: 'WECC'
  },
  {
    id: 'wolfbone-tx',
    name: 'Wolfbone',
    city: 'Pecos', state: 'TX',
    lat: 31.4229, lng: -103.4932,
    owner: 'Powerbridge', priority: 2,
    iso: 'ERCOT'
  },
  {
    id: 'eagle-mountain-ut',
    name: 'Utah Eagle Mountain',
    city: 'Eagle Mountain', state: 'UT',
    lat: 40.3139, lng: -112.0027,
    owner: 'Tract', priority: 2,
    ntt: true, equinix: true,
    iso: 'WECC',
    nextSteps: 'No utility till 2031; +/- 250 MW gas',
    notes: 'Large land footprint. Utility interconnection delayed to 2031.'
  },
  {
    id: 'slc-glc-ut',
    name: 'SLC GLC Airport',
    city: 'Salt Lake City', state: 'UT',
    lat: 40.7862, lng: -111.9798,
    owner: 'NWQ/NOVVA', priority: 2,
    ntt: true, equinix: true,
    iso: 'WECC',
    nextSteps: 'No utility till 2031; +/- 250 MW gas'
  },
  {
    id: 'plains-yorktown-va',
    name: 'Plains All American',
    city: 'Yorktown', state: 'VA',
    lat: 37.2388, lng: -76.5000,
    owner: 'Plains', priority: 1,
    iso: 'PJM',
    mdScore: { siteLocation: 8.0, marketOpportunity: 8.0, infrastructure: 8.0, siteCharacteristics: 7.0, workforce: 8.0, riskManagement: 7.5, total: 7.8, confidence: 0.60 }
  },
  {
    id: 'prometheus-wy',
    name: 'Prometheus',
    city: 'Evanston', state: 'WY',
    lat: 41.2683, lng: -110.9630,
    owner: 'Prometheus', priority: 1,
    iso: 'WECC',
    mdScore: { siteLocation: 9.0, marketOpportunity: 7.5, infrastructure: 7.0, siteCharacteristics: 8.0, workforce: 5.5, riskManagement: 7.5, total: 7.3, confidence: 0.20 }
  },
  {
    id: 'gsl-tooele-ut',
    name: 'GSL Industrial',
    city: 'Tooele', state: 'UT',
    lat: 40.5307, lng: -112.2983,
    owner: 'High Point', priority: 1,
    iso: 'WECC',
    mdScore: { siteLocation: 8.5, marketOpportunity: 8.0, infrastructure: 7.5, siteCharacteristics: 7.0, workforce: 7.5, riskManagement: 7.5, total: 7.5, confidence: 0.25 }
  },
  {
    id: 'hwy64-nc',
    name: 'HWY 64 Industrial Park',
    city: 'Chatham County', state: 'NC',
    lat: 35.7094, lng: -79.1997,
    owner: 'Corriher', priority: 1,
    iso: 'SERC'
  },
  {
    id: 'inl-id',
    name: 'Idaho National Lab',
    city: 'Idaho Falls', state: 'ID',
    lat: 43.4926, lng: -112.0161,
    owner: 'DOE', priority: 1,
    iso: 'WECC',
    notes: 'Primary DOE nuclear research facility. Oklo has significant relationship with INL.'
  },
  {
    id: 'paducah-ky',
    name: 'Paducah Site',
    city: 'Kevil', state: 'KY',
    lat: 37.0651, lng: -88.9128,
    owner: 'DOE', priority: 1,
    iso: 'TVA',
    notes: 'Former uranium enrichment facility. DOE-owned with existing nuclear infrastructure.'
  },
  {
    id: 'meta-piketon-oh',
    name: 'Meta / Piketon',
    city: 'Piketon', state: 'OH',
    lat: 39.0400, lng: -83.0300,
    owner: 'Meta', priority: 5,
    ntt: false, equinix: false, vantage: false,
    iso: 'PJM',
    notes: 'Meta data center co-location opportunity adjacent to SODI/Piketon DOE site.',
    mdScore: { siteLocation: 8.5, marketOpportunity: 7.5, infrastructure: 5.0, siteCharacteristics: 5.5, workforce: 6.5, riskManagement: 8.5, total: 6.2, confidence: 0.80 }
  },
  {
    id: 'switch-reno-nv',
    name: 'Switch / TAHOE RENO',
    city: 'Reno', state: 'NV',
    lat: 39.5296, lng: -119.8138,
    owner: 'Switch', priority: 4,
    iso: 'WECC',
    notes: 'Switch data center campus (Tahoe Reno Industrial Center). World\'s largest data center campus.',
    mdScore: { siteLocation: 8.0, marketOpportunity: 7.0, infrastructure: 7.5, siteCharacteristics: 8.5, workforce: 7.5, riskManagement: 7.5, total: 6.5, confidence: 0.70 }
  },
]
