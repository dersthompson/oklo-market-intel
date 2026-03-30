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

export async function GET() {
  const apiKey = process.env.EIA_API_KEY

  if (!apiKey) {
    return NextResponse.json({ source: 'static', data: STATIC_PRICES })
  }

  try {
    // EIA v2 API — retail electricity sales, all-sectors price by state, most recent monthly data
    const url = `https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=${apiKey}&data[0]=price&facets[sectorName][]=all+sectors&frequency=monthly&sort[0][column]=period&sort[0][direction]=desc&length=60`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`EIA API returned ${res.status}`)
    const json = await res.json()

    // Keep only the most recent value per state (records are sorted desc by period)
    const records: any[] = json.response?.data || []
    const latestByState: Record<string, number> = {}
    records.forEach((r: any) => {
      const state = r.stateid
      if (state && r.price != null && !latestByState[state]) {
        latestByState[state] = parseFloat(r.price)
      }
    })

    // Merge with static fallback for any missing states
    const merged = { ...STATIC_PRICES, ...latestByState }
    return NextResponse.json({ source: 'eia', data: merged })
  } catch (e: any) {
    return NextResponse.json({ source: 'static', data: STATIC_PRICES, fallbackReason: e.message })
  }
}
