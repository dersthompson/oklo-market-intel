import { NextResponse } from 'next/server'
import { COUNTY_ELECTRICITY_RATES } from '@/lib/county-electricity'

export const revalidate = 86400 // 24h cache

const STATIC_PRICES: Record<string, number> = {
  AL: 13.1, AK: 22.5, AZ: 12.7, AR: 10.2, CA: 29.4, CO: 13.8, CT: 28.6, DE: 14.1,
  DC: 15.8, FL: 14.2, GA: 12.0, HI: 39.7, ID: 10.2, IL: 13.4, IN: 12.2, IA: 12.0,
  KS: 12.3, KY: 11.3, LA: 11.2, ME: 25.6, MD: 15.8, MA: 26.3, MI: 17.2, MN: 14.3,
  MS: 11.8, MO: 10.7, MT: 12.0, NE: 11.9, NV: 12.5, NH: 25.1, NJ: 18.4, NM: 13.4,
  NY: 22.1, NC: 12.3, ND: 11.3, OH: 13.8, OK: 10.8, OR: 11.8, PA: 15.4, RI: 26.8,
  SC: 13.0, SD: 12.4, TN: 11.9, TX: 13.3, UT: 10.7, VT: 20.4, VA: 14.4, WA: 10.4,
  WV: 12.9, WI: 16.6, WY: 9.5,
}

const PREV_PRICES: Record<string, number> = {
  AL: 12.9, AK: 22.8, AZ: 12.4, AR: 10.0, CA: 29.1, CO: 13.6, CT: 28.4, DE: 14.0,
  DC: 15.6, FL: 14.0, GA: 12.1, HI: 39.9, ID: 10.1, IL: 13.3, IN: 12.1, IA: 11.9,
  KS: 12.2, KY: 11.4, LA: 11.3, ME: 25.3, MD: 15.9, MA: 26.5, MI: 17.4, MN: 14.1,
  MS: 11.9, MO: 10.8, MT: 11.9, NE: 12.0, NV: 12.6, NH: 25.3, NJ: 18.6, NM: 13.2,
  NY: 22.3, NC: 12.4, ND: 11.2, OH: 13.9, OK: 10.9, OR: 11.9, PA: 15.5, RI: 26.9,
  SC: 12.8, SD: 12.3, TN: 12.0, TX: 13.4, UT: 10.8, VT: 20.2, VA: 14.5, WA: 10.3,
  WV: 12.8, WI: 16.4, WY: 9.6,
}

const FIPS_TO_ABBR: Record<string, string> = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE',
  '11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA',
  '20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN',
  '28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM',
  '36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI',
  '45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA',
  '54':'WV','55':'WI','56':'WY','72':'PR',
}

export async function GET() {
  const apiKey = process.env.EIA_API_KEY
  let stateData = STATIC_PRICES
  let prevData = PREV_PRICES
  let source = 'static'
  let fallbackReason

  if (apiKey) {
    try {
      const url = 'https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=' + apiKey + '&data[0]=price&facets[sectorName][]=all+sectors&frequency=monthly&sort[0][column]=period&sort[0][direction]=desc&length=120'
      const res = await fetch(url, { next: { revalidate: 86400 } })
      if (!res.ok) throw new Error('EIA API returned ' + res.status)
      const json = await res.json()
      const records = json.response?.data || []
      const latestByState: Record<string, number> = {}
      const secondLatestByState: Record<string, number> = {}
      const seenStates = new Set()
      records.forEach((r: any) => {
        const state = r.stateid
        if (state && r.price != null) {
          if (!seenStates.has(state)) { latestByState[state] = parseFloat(r.price); seenStates.add(state) }
          else if (!secondLatestByState[state]) { secondLatestByState[state] = parseFloat(r.price) }
        }
      })
      stateData = { ...STATIC_PRICES, ...latestByState }
      prevData = { ...PREV_PRICES, ...secondLatestByState }
      source = 'eia'
    } catch (e) { fallbackReason = e.message }
  }

  const countyData = {}
  for (const [fips, rate] of Object.entries(COUNTY_ELECTRICITY_RATES)) {
    const stateAbbr = FIPS_TO_ABBR[fips.substring(0, 2)]
    if (!stateAbbr) continue
    if (source === 'eia' && stateData[stateAbbr] && STATIC_PRICES[stateAbbr]) {
      countyData[fips] = Math.round(rate * (stateData[stateAbbr] / STATIC_PRICES[stateAbbr]) * 10) / 10
    } else {
      countyData[fips] = rate
    }
  }

  return NextResponse.json({ source, data: stateData, prevData, countyData, ...(fallbackReason ? { fallbackReason } : {}) })
}
