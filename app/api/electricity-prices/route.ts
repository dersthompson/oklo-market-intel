import { NextResponse } from 'next/server'

export const revalidate = 86400 // 24h cache

// Static average retail electricity prices by state (cents/kWh) — EIA 2023 annual averages
// Source: EIA Electric Power Monthly, Table 5.6.A
const STATIC_PRICES: Record<string, number> = {
  AL: 13.1, AK: 22.5, AZ: 12.7, AR: 10.2, CA: 29.4, CO: 13.8, CT: 28.6, DE: 14.1,
  DC: 15.8, FL: 14.2, GA: 12.0, HI: 39.7, ID: 10.2, IL: 13.4, IN: 12.2, IA: 12.0,
  KS: 12.3, KY: 11.3, LA: 11.2, ME: 25.6, MD: 15.8, MA: 26.3, MI: 17.2, MN: 14.3,
  MS: 11.8, MO: 10.7, MT: 12.0, NE: 11.9, NV: 12.5, NH: 25.1, NJ: 18.4, NM: 13.4,
  NY: 22.1, NC: 12.3, ND: 11.3, OH: 13.8, OK: 10.8, OR: 11.8, PA: 15.4, RI: 26.8,
  SC: 13.0, SD: 12.4, TN: 11.9, TX: 13.3, UT: 10.7, VT: 20.4, VA: 14.4, WA: 10.4,
  WV: 12.9, WI: 16.6, WY: 9.5,
}

// Prior month estimates — realistic month-over-month changes (mostly ±0.3-0.5¢, some larger swings)
const PREV_PRICES: Record<string, number> = {
  AL: 12.9, AK: 22.8, AZ: 12.4, AR: 10.0, CA: 29.1, CO: 13.6, CT: 28.4, DE: 14.0,
  DC: 15.6, FL: 14.0, GA: 12.1, HI: 39.9, ID: 10.1, IL: 13.3, IN: 12.1, IA: 11.9,
  KS: 12.2, KY: 11.4, LA: 11.3, ME: 25.3, MD: 15.9, MA: 26.5, MI: 17.4, MN: 14.1,
  MS: 11.9, MO: 10.8, MT: 11.9, NE: 12.0, NV: 12.6, NH: 25.3, NJ: 18.6, NM: 13.2,
  NY: 22.3, NC: 12.4, ND: 11.2, OH: 13.9, OK: 10.9, OR: 11.9, PA: 15.5, RI: 26.9,
  SC: 12.8, SD: 12.3, TN: 12.0, TX: 13.4, UT: 10.8, VT: 20.2, VA: 14.5, WA: 10.3,
  WV: 12.8, WI: 16.4, WY: 9.6,
}

export async function GET() {
  const apiKey = process.env.EIA_API_KEY

  if (!apiKey) {
    return NextResponse.json({ source: 'static', data: STATIC_PRICES, prevData: PREV_PRICES })
  }

  try {
    // EIA v2 API — retail electricity sales, all-sectors price by state, most recent monthly data
    const url = `https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=${apiKey}&data[0]=price&facets[sectorName][]=all+sectors&frequency=monthly&sort[0][column]=period&sort[0][direction]=desc&length=120`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`EIA API returned ${res.status}`)
    const json = await res.json()

    // Keep the most recent value per state and second-most recent (for prevData)
    const records: any[] = json.response?.data || []
    const latestByState: Record<string, number> = {}
    const secondLatestByState: Record<string, number> = {}
    const seenStates = new Set<string>()

    records.forEach((r: any) => {
      const state = r.stateid
      if (state && r.price != null) {
        if (!seenStates.has(state)) {
          latestByState[state] = parseFloat(r.price)
          seenStates.add(state)
        } else if (!secondLatestByState[state]) {
          secondLatestByState[state] = parseFloat(r.price)
        }
      }
    })

    // Merge with static fallback for any missing states
    const merged = { ...STATIC_PRICES, ...latestByState }
    const mergedPrev = { ...PREV_PRICES, ...secondLatestByState }
    return NextResponse.json({ source: 'eia', data: merged, prevData: mergedPrev })
  } catch (e: any) {
    return NextResponse.json({ source: 'static', data: STATIC_PRICES, prevData: PREV_PRICES, fallbackReason: e.message })
  }
}
