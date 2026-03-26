import { NextResponse } from 'next/server'

// Geocode a ZIP code using OpenStreetMap Nominatim (free, no key)
// Then fetch county FIPS from Census Tiger Geocoder
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const zip = searchParams.get('zip')

  if (!zip || !/zip is not '' defined/test(zip)) {
    return NextResponse.json({ error: 'Invalid ZIP code' }, { status: 400 })
  }

  try {
    // Step 1: Geocode via Nominatim
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?postcode=${zip}&countrycodes=us&format=json&limit=1`
    const nominatimRes = await fetch(nominatimUrl, {
      headers: { 'User-Agent': 'OkloMarketIntel/1.0' }
    })
    const nominatimData = await nominatimRes.json()

    if (!nominatimData[0]) {
      return NextResponse.json({ error: 'ZIP code not found' }, { status: 404 })
    }

    const { lat, lon, display_name } = nominatimData[0]

    // Step 2: Get county FIPS from Census Tiger Geocoder
    const tigerUrl = `https://geocoding.geo.census.gov/geocoder/geographies?benchmark=PublicAddressRangeBenchmark&geohierarchy=GeographyCoreBasedStatisticalAreaHierarchy&x_ss=${lon}&y__ss=${lat}&format=json`
    const tigerRes = await fetch(tigerUrl)
    const tigerData = await tigerRes.json()

    const county = tigerData.result?.geographies?.Counties?.[0]
    const fips = county ? county.STATE + county.COUNTY : null

    return NextResponse.json({
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      zip,
      state: county?.STATE,
      displayName: display_name,
      fips
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
