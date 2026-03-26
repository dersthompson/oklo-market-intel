import { NextResponse } from 'next/server'

// Census ACS5 2022 — median income + unemployment by county
// Returns { fips: { income, unemploymentRate } }
export const revalidate = 86400 // 24h cache

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'income'

  try {
    const apiKey = process.env.CENSUS_API_KEY || ''
    const keyParam = apiKey ? `&key=${apiKey}` : ''

    let vars: string
    if (type === 'unemployment') {
      vars = 'B23025_002E,B23025_005E' // labor force, unemployed
    } else {
      vars = 'B19013_001E' // median HH income
    }

    const url = `https://api.census.gov/data/2022/acs/acs5?get=NAME,${vars}&for=county:*${keyParam}`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`Census API error: ${res.status}`)

    const raw: string[][] = await res.json()
    const [header, ...rows] = raw

    const result: Record<string, number> = {}
    rows.forEach(row => {
      const stateCode = row[header.indexOf('state')].padStart(2, '0')
      const countyCode = row[header.indexOf('county')].padStart(3, '0')
      const fips = stateCode + countyCode

      if (type === 'unemployment') {
        const laborForce = parseInt(row[header.indexOf('B23025_002E')])
        const unemployed = parseInt(row[header.indexOf('B23025_005E')])
        if (laborForce > 0) result[fips] = (unemployed / laborForce) * 100
      } else {
        const income = parseInt(row[header.indexOf('B19013_001E')])
        if (income > 0) result[fips] = income
      }
    })

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
