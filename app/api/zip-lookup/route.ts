import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get('zip')
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 })
  }

  try {
    // Use Nominatim (OpenStreetMap) geocoder — free, no key required
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1&addressdetails=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Oklo-Market-Intelligence/1.0' },
      next: { revalidate: 86400 }
    })
    if (!res.ok) throw new Error('Geocoding failed')
    const data = await res.json()
    if (!data.length) return NextResponse.json({ error: 'ZIP not found' }, { status: 404 })

    const loc = data[0]
    const lat = parseFloat(loc.lat)
    const lng = parseFloat(loc.lon)
    const stateName = loc.address?.state || ''
    const stateCode = stateNameToCode(stateName)

    // Fetch county FIPS from Census geocoder for income/unemployment data
    let fips = ''
    try {
      const censusUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&layers=Counties&format=json`
      const censusRes = await fetch(censusUrl, { next: { revalidate: 86400 } })
      const censusData = await censusRes.json()
      const county = censusData?.result?.geographies?.Counties?.[0]
      if (county) fips = county.STATE + county.COUNTY
    } catch {}

    return NextResponse.json({ lat, lng, zip, state: stateCode, displayName: loc.display_name, fips })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

const stateMap: Record<string, string> = {
  'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR','California':'CA',
  'Colorado':'CO','Connecticut':'CT','Delaware':'DE','Florida':'FL','Georgia':'GA',
  'Hawaii':'HI','Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS',
  'Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD','Massachusetts':'MA',
  'Michigan':'MI','Minnesota':'MN','Mississippi':'MS','Missouri':'MO','Montana':'MT',
  'Nebraska':'NE','Nevada':'NV','New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM',
  'New York':'NY','North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK',
  'Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD',
  'Tennessee':'TN','Texas':'TX','Utah':'UT','Vermont':'VT','Virginia':'VA','Washington':'WA',
  'West Virginia':'WV','Wisconsin':'WI','Wyoming':'WY','District of Columbia':'DC'
}
function stateNameToCode(name: string) { return stateMap[name] || name }
