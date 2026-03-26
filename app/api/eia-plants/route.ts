import { NextResponse } from 'next/server'

// EIA v2 API - coal generators
// Requires EIA_API_KEY env var (free at https://www.eia.gov/opendata/)
export const revalidate = 604800 // 1Week

export async function GET() {
  try {
    const apiKey = process.env.EIA_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        note: 'Add EIA_API_KEY env var for live data - using static fallback from lib/coal-plants.ts',
        plants: []
      })
    }

    // EIA v2 API - generators with fuel type coal
    const url = `https://api.eia.gov/v2/electricity/operating-generator-capacity/data/?api_key=${apiKey}&frequency=monthly&data[0]=nameplateCapacity&facets[energySource1][]=COL&facets[status][]=OP&facets[status][]=RE&offset=0&length=500&sort[0][column]=period&sort[0][direction]=desc`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`EIA API error: ${res.status}`)

    const data = await res.json()
    return NextResponse.json({ plants: data.response.data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
