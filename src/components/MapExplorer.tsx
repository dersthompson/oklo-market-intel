'use client'
import { useEffect, useRef, useCallback } from 'react'
import type { OkloSite } from '@/lib/types'
import { ISO_COLORS, STATE_FIPS_ISO, NUCLEAR_FRIENDLY_STATES } from '@/lib/types'
import { OKLO_SITES } from '@/lib/sites'
import { COAL_PLANTS } from '@/lib/coal-plants'
import { SUBSTATIONS } from '@/lib/substations'

interface Props {
  activeLayers: string[]
  searchedZip: { lat: number; lng: number; zip: string; fips?: string } | null
  onSiteSelect: (site: OkloSite | null) => void
  onZipInfo: (info: { income?: number; unemployment?: number; iso?: string; state?: string; electricityPrice?: number; electricityPrev?: number }) => void
}

export default function MapExplorer({ activeLayers, searchedZip, onSiteSelect, onZipInfo }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const layerRefs = useRef<Record<string, any>>({})
  const censusCacheRef = useRef<{ income?: Record<string, number>; unemployment?: Record<string, number> }>({})
  const electricityDataRef = useRef<Record<string, number>>({})
  const electricityPrevRef = useRef<Record<string, number>>({})
  const electricityZoomListenerRef = useRef<(() => void) | null>(null)

  // FIPS code -> state abbreviation lookup
  const FIPS_TO_ABBR: Record<string, string> = {
    '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC',
    '12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY',
    '22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT',
    '31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH',
    '40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN','48':'TX','49':'UT',
    '50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY','72':'PR'
  }

  const initMap = useCallback(async () => {
    if (!containerRef.current || mapRef.current) return
    const L = (await import('leaflet')).default

    // Fix Leaflet default icon
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(containerRef.current!, {
      center: [39.5, -98.35],
      zoom: 4,
      zoomControl: false,
      attributionControl: true,
    })

    // Dark base tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map

    // Always add Oklo sites layer
    addOkloSites(L, map)
  }, [])

  const addOkloSites = (L: any, map: any) => {
    if (layerRefs.current['sites']) { map.removeLayer(layerRefs.current['sites']); }
    const group = L.layerGroup()

    OKLO_SITES.forEach(site => {
      const priority = site.priority
      const size = priority >= 4 ? 16 : priority === 3 ? 13 : 10
      const opacity = priority >= 4 ? 1 : priority === 3 ? 0.85 : 0.7

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${size}px;height:${size}px;
          background:#f97316;
          border:2px solid #fff;
          border-radius:50%;
          box-shadow:0 0 ${priority >= 4 ? 10 : 6}px rgba(249,115,22,${opacity});
          opacity:${opacity};
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
      })

      const tenants = [site.ntt && 'NTT', site.equinix && 'Equinix', site.vantage && 'Vantage'].filter(Boolean).join(', ')
      const scoreHtml = site.mdScore
        ? `<div style="margin-top:8px;padding:6px;background:#111827;border-radius:4px;">
            <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">MD Ranking Score</div>
            <div style="font-size:18px;color:#f97316;font-weight:700;">${site.mdScore.total.toFixed(1)}/10</div>
            <div style="font-size:11px;color:#6b7280;">Confidence: ${Math.round(site.mdScore.confidence * 100)}%</div>
          </div>` : ''

      const popup = L.popup({ maxWidth: 280, className: 'oklo-popup' }).setContent(`
        <div style="font-family:system-ui,sans-serif;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div style="width:8px;height:8px;background:#f97316;border-radius:50%;flex-shrink:0;"></div>
            <div style="font-weight:700;font-size:14px;color:#e2e8f0;">${site.name}</div>
          </div>
          <div style="font-size:12px;color:#9ca3af;margin-bottom:6px;">${site.city}, ${site.state}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
            <span style="padding:2px 8px;background:#374151;border-radius:12px;font-size:11px;color:#d1d5db;">P${site.priority}</span>
            <span style="padding:2px 8px;background:#374151;border-radius:12px;font-size:11px;color:#d1d5db;">${site.owner}</span>
            ${site.iso ? `<span style="padding:2px 8px;background:#1e3a5f;border-radius:12px;font-size:11px;color:#93c5fd;">${site.iso}</span>` : ''}
          </div>
          ${tenants ? `<div style="font-size:11px;color:#6b7280;margin-bottom:4px;">Data Center Interest: ${tenants}</div>` : ''}
          ${site.nextSteps ? `<div style="font-size:11px;color:#fbbf24;margin-bottom:4px;">Next: ${site.nextSteps}</div>` : ''}
          ${site.notes ? `<div style="font-size:11px;color:#9ca3af;">${site.notes}</div>` : ''}
          ${scoreHtml}
        </div>
      `)

      const marker = L.marker([site.lat, site.lng], { icon }).bindPopup(popup)
      marker.on('click', () => onSiteSelect(site))
      group.addLayer(marker)
    })

    group.addTo(map)
    layerRefs.current['sites'] = group
  }

  const addISOLayer = async (L: any, map: any) => {
    try {
      const topo = await import('topojson-client')
      const res = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      const data = await res.json()
      const states = (topo as any).feature(data, data.objects.states)

      const layer = L.geoJSON(states, {
        style: (feature: any) => {
          const fips = feature.id?.toString().padStart(2, '0') || ''
          const iso = STATE_FIPS_ISO[fips] || 'Non-ISO'
          const color = ISO_COLORS[iso] || '#6b7280'
          return { fillColor: color, fillOpacity: 0.25, color: color, weight: 1.5, opacity: 0.6 }
        },
        onEachFeature: (feature: any, layer: any) => {
          const fips = feature.id?.toString().padStart(2, '0') || ''
          const iso = STATE_FIPS_ISO[fips] || 'Non-ISO'
          layer.bindTooltip(`${iso}`, { sticky: true, className: '' })
        }
      })
      layer.addTo(map)
      layerRefs.current['iso'] = layer
    } catch (e) { console.error('ISO layer error:', e) }
  }

  const addNuclearLayer = async (L: any, map: any) => {
    try {
      const topo = await import('topojson-client')
      const res = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      const data = await res.json()
      const states = (topo as any).feature(data, data.objects.states)

      // State FIPS -> abbreviation lookup
      const fipsToAbbr: Record<string, string> = {
        '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC',
        '12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY',
        '22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT',
        '31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH',
        '40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN','48':'TX','49':'UT',
        '50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY','72':'PR'
      }

      const layer = L.geoJSON(states, {
        style: (feature: any) => {
          const fips = feature.id?.toString().padStart(2, '0') || ''
          const abbr = fipsToAbbr[fips] || ''
          const friendly = NUCLEAR_FRIENDLY_STATES.includes(abbr)
          return {
            fillColor: friendly ? '#06b6d4' : '#6b7280',
            fillOpacity: friendly ? 0.3 : 0.05,
            color: friendly ? '#06b6d4' : 'transparent',
            weight: friendly ? 1 : 0,
            opacity: 0.5
          }
        },
        onEachFeature: (feature: any, layer: any) => {
          const fips = feature.id?.toString().padStart(2, '0') || ''
          const abbr = fipsToAbbr[fips] || ''
          const friendly = NUCLEAR_FRIENDLY_STATES.includes(abbr)
          layer.bindTooltip(`${abbr}: ${friendly ? 'â Nuclear Friendly' : 'â  Moratorium / Neutral'}`, { sticky: true })
        }
      })
      layer.addTo(map)
      layerRefs.current['nuclear'] = layer
    } catch (e) { console.error('Nuclear layer error:', e) }
  }

  const addChoropleth = async (L: any, map: any, type: 'income' | 'unemployment') => {
    const key = type === 'income' ? 'income' : 'unemployment'
    try {
      // Load county topojson
      const topoModule = await import('topojson-client')
      const [topoRes, censusRes] = await Promise.all([
        fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json'),
        fetch(`/api/census?type=${type}`)
      ])
      const [topoData, censusData] = await Promise.all([topoRes.json(), censusRes.json()])
      if (censusData.error) throw new Error(censusData.error)

      censusCacheRef.current[key] = censusData
      const counties = (topoModule as any).feature(topoData, topoData.objects.counties)

      const getColor = (value: number) => {
        if (type === 'income') {
          if (value > 90000) return '#1e3a8a'
          if (value > 70000) return '#1d4ed8'
          if (value > 55000) return '#3b82f6'
          if (value > 42000) return '#60a5fa'
          if (value > 30000) return '#93c5fd'
          return '#dbeafe'
        } else {
          if (value > 12) return '#7f1d1d'
          if (value > 8) return '#dc2626'
          if (value > 5) return '#f97316'
          if (value > 3) return '#fbbf24'
          if (value > 2) return '#fde68a'
          return '#ecfdf5'
        }
      }

      const layer = L.geoJSON(counties, {
        style: (feature: any) => {
          const fips = feature.id?.toString().padStart(5, '0') || ''
          const value = censusData[fips]
          if (!value || value <= 0) return { fillColor: '#1f2937', fillOpacity: 0.3, color: '#374151', weight: 0.3 }
          return { fillColor: getColor(value), fillOpacity: 0.7, color: '#374151', weight: 0.3, opacity: 0.5 }
        },
        onEachFeature: (feature: any, layer: any) => {
          const fips = feature.id?.toString().padStart(5, '0') || ''
          const value = censusData[fips]
          const formatted = type === 'income'
            ? value ? `$${value.toLocaleString()}` : 'N/A'
            : value ? `${value.toFixed(1)}%` : 'N/A'
          const sourceNote = type === 'income'
            ? '<br><span style="font-size:10px;color:#6b7280">Annual ACS 5-yr est. â¢ Trend: see Census ACS YoY</span>'
            : '<br><span style="font-size:10px;color:#6b7280">Annual ACS 5-yr est. â¢ Monthly BLS data by state only</span>'
          layer.bindTooltip(
            `<b>${feature.properties?.name || 'County'}</b><br>${type === 'income' ? 'Median Income' : 'Unemployment'}: ${formatted}${sourceNote}`,
            { sticky: true }
          )
        }
      })
      layer.addTo(map)
      layerRefs.current[key] = layer
    } catch (e) { console.error(`${type} layer error:`, e) }
  }

  const addCoalLayer = (L: any, map: any) => {
    const group = L.layerGroup()
    COAL_PLANTS.forEach(plant => {
      const color = plant.status === 'operating' ? '#ef4444' : plant.status === 'retiring' ? '#f97316' : '#6b7280'
      const circle = L.circleMarker([plant.lat, plant.lng], {
        radius: Math.max(4, Math.min(14, plant.capacityMW / 250)),
        fillColor: color, fillOpacity: 0.8,
        color: '#fff', weight: 1, opacity: 0.8
      })
      circle.bindTooltip(
        `<b>${plant.name}</b><br>${plant.city}, ${plant.state}<br>
        Capacity: ${plant.capacityMW.toLocaleString()} MW<br>
        Status: <span style="color:${color}">${plant.status.toUpperCase()}${plant.retirementYear ? ` (${plant.retirementYear})` : ''}</span><br>
        ${plant.owner ? `Owner: ${plant.owner}` : ''}`,
        { sticky: true }
      )
      group.addLayer(circle)
    })
    group.addTo(map)
    layerRefs.current['coal'] = group
  }

  const addSubstationsLayer = (L: any, map: any) => {
    const group = L.layerGroup()
    SUBSTATIONS.forEach(sub => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:10px;height:10px;
          background:#f59e0b;
          border:1.5px solid #fff;
          transform:rotate(45deg);
          box-shadow:0 0 6px rgba(245,158,11,0.8);
        "></div>`,
        iconSize: [10, 10], iconAnchor: [5, 5], popupAnchor: [0, -8],
      })
      const marker = L.marker([sub.lat, sub.lng], { icon })
      marker.bindTooltip(
        `<b>${sub.name}</b><br>${sub.state} | ${sub.voltageKV}kV | ${sub.iso}`,
        { sticky: true }
      )
      group.addLayer(marker)
    })
    group.addTo(map)
    layerRefs.current['substations'] = group
  }

  const addGovLandLayer = async (L: any, map: any) => {
    // Simplified federal land polygons â major DOE/DOD/BLM areas relevant to nuclear siting
    // Using approximate bounding boxes for key sites
    const fedLandAreas = [
      { name: 'Idaho National Lab', coords: [[43.2, -113.5], [44.0, -113.5], [44.0, -112.0], [43.2, -112.0]] },
      { name: 'Savannah River Site', coords: [[33.2, -82.0], [33.6, -82.0], [33.6, -81.3], [33.2, -81.3]] },
      { name: 'Oak Ridge Reservation', coords: [[35.8, -84.5], [36.2, -84.5], [36.2, -84.1], [35.8, -84.1]] },
      { name: 'Hanford Site (WA)', coords: [[46.4, -119.9], [46.9, -119.9], [46.9, -119.2], [46.4, -119.2]] },
      { name: 'Nevada Test Site', coords: [[36.7, -116.7], [37.4, -116.7], [37.4, -115.8], [36.7, -115.8]] },
      { name: 'Pantex Plant (TX)', coords: [[35.2, -101.8], [35.5, -101.8], [35.5, -101.4], [35.2, -101.4]] },
      { name: 'Portsmouth GDP (OH)', coords: [[38.9, -83.2], [39.1, -83.2], [39.1, -82.9], [38.9, -82.9]] },
      { name: 'Paducah GDP (KY)', coords: [[36.9, -89.0], [37.1, -89.0], [37.1, -88.7], [36.9, -88.7]] },
      { name: 'Los Alamos NL (NM)', coords: [[35.7, -106.5], [35.95, -106.5], [35.95, -106.0], [35.7, -106.0]] },
    ]
    const group = L.layerGroup()
    fedLandAreas.forEach(area => {
      const poly = L.polygon(area.coords, {
        fillColor: '#22c55e', fillOpacity: 0.25,
        color: '#22c55e', weight: 1.5, opacity: 0.6
      })
      poly.bindTooltip(`<b>${area.name}</b><br>Federal Land (DOE / DOD)`, { sticky: true })
      group.addLayer(poly)
    })
    group.addTo(map)
    layerRefs.current['govland'] = group
  }

  const getElectricityColor = (price: number) => {
    if (price < 9)  return '#166534'  // very cheap â dark green
    if (price < 11) return '#22c55e'  // cheap â green
    if (price < 13) return '#84cc16'  // near avg â lime
    if (price < 16) return '#fbbf24'  // moderate â yellow
    if (price < 20) return '#f97316'  // expensive â orange
    if (price < 26) return '#ef4444'  // high â red
    return '#7f1d1d'                  // very high â dark red
  }

  const getElectricityTrendHtml = (price: number, prev: number | undefined) => {
    if (prev === undefined) return ''
    const delta = price - prev
    return `<br><span style="font-size:10px;color:${delta>0?'#ef4444':delta<0?'#22c55e':'#9ca3af'}">${delta>0?'â':'â'} ${Math.abs(delta).toFixed(1)}Â¢ vs prev month</span>`
  }

  const addElectricityLayer = async (L: any, map: any) => {
    try {
      const [topoModule, stateRes, countyRes, priceRes] = await Promise.all([
        import('topojson-client'),
        fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'),
        fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json'),
        fetch('/api/electricity-prices')
      ])

      const [stateData, countyData, priceJson] = await Promise.all([stateRes.json(), countyRes.json(), priceRes.json()])

      const priceData: Record<string, number> = priceJson.data || {}
      const prevData: Record<string, number> = priceJson.prevData || {}
      // County-level rates from EIA Form 861 utility territories
      const countyRates: Record<string, number> = priceJson.countyData || {}

      // Cache for zip info lookup
      electricityDataRef.current = priceData
      electricityPrevRef.current = prevData

      const states = (topoModule as any).feature(stateData, stateData.objects.states)
      const counties = (topoModule as any).feature(countyData, countyData.objects.counties)

      const stateLayer = L.geoJSON(states, {
        style: (feature: any) => {
          const fips = feature.id?.toString().padStart(2, '0') || ''
          const abbr = FIPS_TO_ABBR[fips] || ''
          const price = priceData[abbr]
          if (!price) return { fillColor: '#374151', fillOpacity: 0.3, color: '#4b5563', weight: 1 }
          return {
            fillColor: getElectricityColor(price),
            fillOpacity: 0.65,
            color: '#111827',
            weight: 1,
            opacity: 0.8,
          }
        },
        onEachFeature: (feature: any, layer: any) => {
          const fips = feature.id?.toString().padStart(2, '0') || ''
          const abbr = FIPS_TO_ABBR[fips] || ''
          const price = priceData[abbr]
          const prev = prevData[abbr]
          const trendHtml = getElectricityTrendHtml(price || 0, prev)
          const label = price
            ? `<b>${abbr}</b><br>â¡ ${price.toFixed(1)}Â¢/kWh avg retail${trendHtml}<br><span style="font-size:11px;color:#9ca3af">${
                price < 11 ? 'â Low cost' : price < 16 ? '~ US avg' : price < 22 ? 'â Above avg' : 'â  High cost'
              }</span>`
            : `<b>${abbr}</b><br>No data`
          layer.bindTooltip(label, { sticky: true })
        }
      })

      const countyLayer = L.geoJSON(counties, {
        style: (feature: any) => {
          const countyFips = feature.id?.toString().padStart(5, '0') || ''
          const stateFips = countyFips.substring(0, 2)
          const stateAbbr = FIPS_TO_ABBR[stateFips] || ''
          // Use county-specific rate; fall back to state avg
          const price = countyRates[countyFips] ?? priceData[stateAbbr]
          if (!price) return { fillColor: '#1f2937', fillOpacity: 0.3, color: '#374151', weight: 0.3 }
          return { fillColor: getElectricityColor(price), fillOpacity: 0.6, color: '#374151', weight: 0.3, opacity: 0.5 }
        },
        onEachFeature: (feature: any, layer: any) => {
          const countyFips = feature.id?.toString().padStart(5, '0') || ''
          const stateFips = countyFips.substring(0, 2)
          const stateAbbr = FIPS_TO_ABBR[stateFips] || ''
          const countyPrice = countyRates[countyFips]
          const statePrice = priceData[stateAbbr]
          const price = countyPrice ?? statePrice
          const prev = prevData[stateAbbr]
          const trendHtml = getElectricityTrendHtml(price || 0, prev)
          const hasCountyData = countyPrice !== undefined
          const sourceNote = hasCountyData
            ? '<span style="font-size:10px;color:#6b7280">EIA Form 861</span>'
            : '<span style="font-size:10px;color:#6b7280">State avg</span>'
          const label = price
            ? '<b>' + (feature.properties?.name || 'County') + ', ' + stateAbbr + '</b><br>' + price.toFixed(1) + '¢/kWh' + trendHtml + '<br>' + sourceNote
            : '<b>' + (feature.properties?.name || 'County') + ', ' + stateAbbr + '</b><br>No data'
          layer.bindTooltip(label, { sticky: true })
        }
      })

      // Determine initial layer based on zoom
      const initialZoom = map.getZoom()
      const initialLayer = initialZoom >= 6 ? countyLayer : stateLayer
      initialLayer.addTo(map)
      layerRefs.current['electricity'] = initialLayer
      layerRefs.current['electricity-state'] = stateLayer
      layerRefs.current['electricity-county'] = countyLayer

      // Add legend
      const legend = (L.control as any)({ position: 'bottomleft' })
      legend.onAdd = () => {
        const div = L.DomUtil.create('div')
        div.style.cssText = 'background:rgba(17,24,39,0.92);padding:8px 10px;border-radius:8px;border:1px solid #374151;font-size:11px;color:#e2e8f0;'
        div.innerHTML = `
          <div style="font-weight:700;margin-bottom:6px;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Retail Price (Â¢/kWh)</div>
          ${[['#166534','< 9Â¢'],['#22c55e','9â11Â¢'],['#84cc16','11â13Â¢'],['#fbbf24','13â16Â¢'],['#f97316','16â20Â¢'],['#ef4444','20â26Â¢'],['#7f1d1d','> 26Â¢']]
            .map(([c,l]) => `<div style="display:flex;align-items:center;gap:5px;margin:2px 0"><div style="width:12px;height:12px;background:${c};border-radius:2px;flex-shrink:0"></div>${l}</div>`)
            .join('')}
        `
        return div
      }
      legend.addTo(map)
      layerRefs.current['electricity-legend'] = legend

      // Add zoom listener
      const handleZoom = () => {
        const zoom = map.getZoom()
        const currentIsCounty = layerRefs.current['electricity'] === layerRefs.current['electricity-county']
        const shouldBeCounty = zoom >= 6

        if (currentIsCounty !== shouldBeCounty) {
          if (layerRefs.current['electricity']) {
            map.removeLayer(layerRefs.current['electricity'])
          }
          const nextLayer = shouldBeCounty ? layerRefs.current['electricity-county'] : layerRefs.current['electricity-state']
          if (nextLayer) {
            nextLayer.addTo(map)
            layerRefs.current['electricity'] = nextLayer
          }
        }
      }

      const zoomEndListener = () => handleZoom()
      map.on('zoomend', zoomEndListener)
      electricityZoomListenerRef.current = () => map.off('zoomend', zoomEndListener)

    } catch (e) {
      console.error('Electricity layer error:', e)
    }
  }

  // Initialize map once
  useEffect(() => { initMap() }, [initMap])

  // Toggle layers based on activeLayers
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    const toggleLayer = async (id: string, active: boolean) => {
      if (!active) {
        if (id === 'electricity') {
          electricityZoomListenerRef.current?.()
          electricityZoomListenerRef.current = null
          if (layerRefs.current['electricity']) { map.removeLayer(layerRefs.current['electricity']) }
          if (layerRefs.current['electricity-state']) { map.removeLayer(layerRefs.current['electricity-state']) }
          if (layerRefs.current['electricity-county']) { map.removeLayer(layerRefs.current['electricity-county']) }
          if (layerRefs.current['electricity-legend']) { map.removeControl(layerRefs.current['electricity-legend']) }
          delete layerRefs.current['electricity']
          delete layerRefs.current['electricity-state']
          delete layerRefs.current['electricity-county']
          delete layerRefs.current['electricity-legend']
        } else {
          if (layerRefs.current[id]) { map.removeLayer(layerRefs.current[id]); delete layerRefs.current[id] }
        }
        return
      }
      if (layerRefs.current[id]) return // already on

      const L = (await import('leaflet')).default
      switch (id) {
        case 'iso': await addISOLayer(L, map); break
        case 'income': await addChoropleth(L, map, 'income'); break
        case 'unemployment': await addChoropleth(L, map, 'unemployment'); break
        case 'coal': addCoalLayer(L, map); break
        case 'substations': addSubstationsLayer(L, map); break
        case 'govland': await addGovLandLayer(L, map); break
        case 'nuclear': await addNuclearLayer(L, map); break
        case 'electricity': await addElectricityLayer(L, map); break
        case 'sites':
          if (!layerRefs.current['sites']) { addOkloSites(L, map) }
          break
      }
    }

    const allIds = ['iso', 'income', 'unemployment', 'coal', 'substations', 'govland', 'nuclear', 'electricity', 'sites']
    allIds.forEach(id => toggleLayer(id, activeLayers.includes(id)))
  }, [activeLayers])

  // Handle zip code search
  useEffect(() => {
    if (!searchedZip || !mapRef.current) return
    const map = mapRef.current

    import('leaflet').then(({ default: L }) => {
      // Remove previous zip highlight
      if (layerRefs.current['zipHighlight']) { map.removeLayer(layerRefs.current['zipHighlight']) }

      map.flyTo([searchedZip.lat, searchedZip.lng], 10, { animate: true, duration: 1.5 })

      // Add a pulsing circle at the zip centroid
      const circle = L.circle([searchedZip.lat, searchedZip.lng], {
        radius: 8000,
        fillColor: '#f97316', fillOpacity: 0.15,
        color: '#f97316', weight: 2, opacity: 0.8
      })
      circle.addTo(map)
      circle.bindPopup(`<b>ZIP: ${searchedZip.zip}</b><br>Lat: ${searchedZip.lat.toFixed(4)}, Lng: ${searchedZip.lng.toFixed(4)}`).openPopup()
      layerRefs.current['zipHighlight'] = circle

      // Look up cached census + electricity data
      const fips = searchedZip.fips
      const stateFips = fips ? fips.substring(0, 2) : ''
      const stateAbbr = FIPS_TO_ABBR[stateFips] || ''

      // Always fetch electricity price for the state (lightweight, cached)
      const getElectricityPrice = async () => {
        if (electricityDataRef.current[stateAbbr] !== undefined) {
          return electricityDataRef.current[stateAbbr]
        }
        try {
          const r = await fetch('/api/electricity-prices')
          const json = await r.json()
          electricityDataRef.current = json.data || {}
          electricityPrevRef.current = json.prevData || {}
          return electricityDataRef.current[stateAbbr]
        } catch { return undefined }
      }

      getElectricityPrice().then(electricityPrice => {
        if (fips) {
          const income = censusCacheRef.current.income?.[fips]
          const unemployment = censusCacheRef.current.unemployment?.[fips]
          const electricityPrev = electricityPrevRef.current[stateAbbr]
          onZipInfo({ income, unemployment, state: stateFips, electricityPrice, electricityPrev })
        } else if (stateAbbr) {
          const electricityPrev = electricityPrevRef.current[stateAbbr]
          onZipInfo({ electricityPrice, state: stateFips, electricityPrev })
        }
      })
    })
  }, [searchedZip])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
}
