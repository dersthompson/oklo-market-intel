import { NextResponse } from 'next/server'

// Weekly cron — refreshes EIA coal plant data cache
// Triggered by vercel.json cron schedule: every Monday at 6am UTC
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, any> = {}

  // Ping EIA plants endpoint to warm cache
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://oklo-market-intel.vercel.app'
    const r = await fetch(`${base}/api/eia-plants`, { next: { revalidate: 0 } })
    results.eia = r.ok ? 'refreshed' : `error: ${r.status}`
  } catch (e: any) {
    results.eia = `failed: ${e.message}`
  }

  return NextResponse.json({ refreshed: new Date().toISOString(), results })
}
