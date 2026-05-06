'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Globe, ChevronDown, ChevronUp, SlidersHorizontal, GitCompare, X, Clock, Zap } from 'lucide-react'
import {
  COUNTRIES, DEFAULT_WEIGHTS, computeWeightedScore, SCORE_DIMENSIONS,
  REGION_LABELS, COMPETITOR_COLORS,
  type CountryScore, type ScoreWeights,
} from '@/lib/international'
import 'leaflet/dist/leaflet.css'
import worldAtlasData from 'world-atlas/countries-110m.json'

const NUMERIC_TO_ISO2: Record<number, string> = {
  36:'AU', 56:'BE', 76:'BR', 124:'CA', 156:'CN', 203:'CZ', 246:'FI', 250:'FR',
  276:'DE', 356:'IN', 360:'ID', 392:'JP', 400:'JO', 404:'KE', 410:'KR',
  458:'MY', 528:'NL', 608:'PH', 616:'PL', 642:'RO', 682:'SA', 702:'SG',
  703:'SK', 710:'ZA', 752:'SE', 158:'TW', 784:'AE', 804:'UA', 826:'GB', 704:'VN',
  840:'US',
}

// ── Continuous colour gradient ─────────────────────────────────────────────
function lerpColor(c1: string, c2: string, t: number): string {
  const r1=parseInt(c1.slice(1,3),16),g1=parseInt(c1.slice(3,5),16),b1=parseInt(c1.slice(5,7),16)
  const r2=parseInt(c2.slice(1,3),16),g2=parseInt(c2.slice(3,5),16),b2=parseInt(c2.slice(5,7),16)
  const r=Math.round(r1+(r2-r1)*t),g=Math.round(g1+(g2-g1)*t),b=Math.round(b1+(b2-b1)*t)
  return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')
}
const COLOR_STOPS: Array<[number,string]> = [
  [0,'#450a0a'],[35,'#dc2626'],[50,'#ea580c'],[60,'#ca8a04'],[75,'#65a30d'],[100,'#16a34a'],
]
function scoreToColor(score: number | undefined): string {
  if (score == null) return '#1e293b'
  const s = Math.max(0, Math.min(100, score))
  for (let i = 0; i < COLOR_STOPS.length-1; i++) {
    if (s <= COLOR_STOPS[i+1][0]) {
      const t = (s-COLOR_STOPS[i][0]) / (COLOR_STOPS[i+1][0]-COLOR_STOPS[i][0])
      return lerpColor(COLOR_STOPS[i][1], COLOR_STOPS[i+1][1], t)
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length-1][1]
}
function countryCodeToFlag(code: string): string {
  return [...code.toUpperCase()].map(c =>
    String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1F1E6)
  ).join('')
}
function scoreToLabel(score: number | undefined): string {
  if (score == null) return 'No data'
  if (score >= 75) return 'Tier 1'
  if (score >= 60) return 'Tier 2'
  if (score >= 50) return 'Tier 3'
  if (score >= 35) return 'Watchlist'
  return 'Low Priority'
}

// ── Weight Slider ─────────────────────────────────────────────────────────
function WeightSlider({ label, color, description, value, onChange }: {
  label: string; color: string; description: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:color, flexShrink:0 }} />
          <span style={{ fontSize:11, color:'#d1d5db', fontWeight:500 }}>{label}</span>
        </div>
        <span style={{ fontSize:11, fontWeight:700, color, minWidth:28, textAlign:'right' }}>{value.toFixed(1)}x</span>
      </div>
      <input type="range" min="0" max="2" step="0.1" value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:'100%', accentColor:color, cursor:'pointer', height:4 }} title={description} />
    </div>
  )
}

// ── Radar Chart ─────────────────────────────────────────────────────────────
function RadarChart({ countries, scores }: {
  countries: Array<{ country: CountryScore & { score: number }; color: string }>
  scores: Record<string, number>
}) {
  const dims = SCORE_DIMENSIONS
  const N = dims.length
  const cx = 110, cy = 110, r = 80
  const angle = (i: number) => (i / N) * 2 * Math.PI - Math.PI / 2

  const gridLevels = [2, 4, 6, 8, 10]
  const axisPoints = dims.map((_, i) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  }))

  const toXY = (val: number, i: number) => ({
    x: cx + (val / 10) * r * Math.cos(angle(i)),
    y: cy + (val / 10) * r * Math.sin(angle(i)),
  })

  return (
    <svg viewBox="0 0 220 220" style={{ width:'100%', maxWidth:220 }}>
      {/* Grid */}
      {gridLevels.map(lvl => (
        <polygon key={lvl}
          points={dims.map((_, i) => { const p = toXY(lvl, i); return `${p.x},${p.y}` }).join(' ')}
          fill="none" stroke="#1f2937" strokeWidth="1" />
      ))}
      {/* Axes */}
      {axisPoints.map((pt, i) => (
        <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="#374151" strokeWidth="1" />
      ))}
      {/* Axis labels */}
      {dims.map((d, i) => {
        const pt = axisPoints[i]
        const dx = pt.x - cx, dy = pt.y - cy
        const lx = cx + (r + 14) * Math.cos(angle(i))
        const ly = cy + (r + 14) * Math.sin(angle(i))
        return (
          <text key={d.key} x={lx} y={ly}
            textAnchor={Math.abs(dx) < 5 ? 'middle' : dx > 0 ? 'start' : 'end'}
            dominantBaseline={Math.abs(dy) < 5 ? 'middle' : dy > 0 ? 'hanging' : 'auto'}
            fontSize="7" fill="#6b7280">{d.label.split(' ').slice(0,2).join('\n')}</text>
        )
      })}
      {/* Data polygons */}
      {countries.map(({ country, color }) => {
        const pts = dims.map((d, i) => toXY(country[d.key as keyof CountryScore] as number, i))
        return (
          <polygon key={country.id}
            points={pts.map(p => `${p.x},${p.y}`).join(' ')}
            fill={color + '30'} stroke={color} strokeWidth="1.5" />
        )
      })}
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="2" fill="#374151" />
    </svg>
  )
}

// ── Competitor Badges ──────────────────────────────────────────────────────
function CompetitorBadges({ competitors }: { competitors: CountryScore['competitors'] }) {
  if (!competitors || competitors.length === 0)
    return <span style={{ fontSize:10, color:'#4b5563', fontStyle:'italic' }}>No known competitors</span>
  const presenceLabel: Recordd<string, string> = { active:'Active', bidding:'Bidding', mou:'MOU', exploring:'Exploring' }
  const presenceAlpha: Record<string, string> = { active:'ff', bidding:'cc', mou:'aa', exploring:'66' }
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
      {competitors.map(c => {
        const base = COMPETITOR_COLORS[c.name] ?? '#6b7280'
        const alpha = presenceAlpha[c.presence] ?? '88'
        return (
          <div key={c.name} style={{ display:'flex', alignItems:'center', gap:3, padding:'2px 6px', borderRadius:4, background: base+'20', border:`1px solid ${base}60` }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background: base+alpha }} />
            <span style={{ fontSize:9, color: base+alpha, fontWeight:600 }}>{c.name}</span>
            <span style={{ fontSize:8, color:'#4b5563' }}>{presenceLabel[c.presence]}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Head-to-Head Comparison Panel ──────────────────────────────────────────
function ComparePanel({ countries, onRemove, onClose }: {
  countries: Array<CountryScore & { score: number }>
  onRemove: (id: string) => void
  onClose: () => void
}) {
  if (countries.length < 2) return null
  const COLORS = ['#f97316', '#3b82f6', '#10b981']

  return (
    <div style={{ position:'absolute', inset:0, background:'#0a0f1a', zIndex:2000, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'12px 20px', borderBottom:'1px solid #1f2937', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <GitCompare size={16} color="#f97316" />
          <span style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>Head-to-Head Comparison</span>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
        {/* Country headers */}
        <div style={{ display:'grid', gridTemplateColumns:`180px repeat(${countries.length}, 1fr)`, gap:12, marginBottom:20 }}>
          <div />
          {countries.map((c, i) => (
            <div key={c.id} style={{ textAlign:'center', position:'relative' }}>
              <button onClick={() => onRemove(c.id)} style={{ position:'absolute', top:0, right:0, background:'none', border:'none', cursor:'pointer', color:'#4b5563' }}>
                <X size={12} />
              </button>
              <div style={{ fontSize:28, marginBottom:4 }}>{countryCodeToFlag(c.id)}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>{c.name}</div>
              <div style={{ fontSize:22, fontWeight:800, color:COLORS[i], margin:'4px 0' }}>{c.score}</div>
              <div style={{ fontSize:10, color:'#6b7280' }}>{scoreToLabel(c.score)}</div>
            </div>
          ))}
        </div>

        {/* Radar */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:20, gap:16, alignItems:'center' }}>
          <RadarChart
            countries={countries.map((c, i) => ({ country: c, color: COLORS[i] }))}
            scores={{}}
          />
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {countries.map((c, i) => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:10, height:3, background:COLORS[i], borderRadius:2 }} />
                <span style={{ fontSize:11, color:'#9ca3af' }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dimension breakdown table */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600, marginBottom:8 }}>Dimension Scores</div>
          {SCORE_DIMENSIONS.map(d => {
            const vals = countries.map(c => c[d.key as keyof CountryScore] as number)
            const best = Math.max(...vals)
            return (
              <div key={d.key} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:d.color }} />
                  <span style={{ fontSize:11, color:'#9ca3af', flex:1 }}>{d.label}</span>
                  {vals.map((v, i) => (
                    <span key={i} style={{ fontSize:11, fontWeight:700, color: v === best ? COLORS[i] : '#6b7280', minWidth:28, textAlign:'right' }}>{v.toFixed(1)}</span>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:`repeat(${countries.length}, 1fr)`, gap:4 }}>
                  {vals.map((v, i) => (
                    <div key={i} style={{ height:4, background:'#1f2937', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(v/10)*100}%`, background: v === best ? COLORS[i] : COLORS[i]+'66', borderRadius:2 }} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Market size + timeline */}
        <div style={{ display:'grid', gridTemplateColumns:`180px repeat(${countries.length}, 1fr)`, gap:12, marginBottom:20 }}>
          <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
            <Zap size={10} /> Market Size
          </div>
          {countries.map(c => (
            <div key={c.id} style={{ textAlign:'center' }}>
              <span style={{ fontSize:16, fontWeight:800, color:'#e2e8f0' }}>{c.marketSizeGW ?? '?'}</span>
              <span style={{ fontSize:10, color:'#6b7280' }}> GW</span>
            </div>
          ))}
          <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
            <Clock size={10} /> Opportunity
          </div>
          {countries.map(c => (
            <div key={c.id} style={{ textAlign:'center' }}>
              <span style={{ fontSize:13, fontWeight:700, color: (c.timelineYears ?? 99) <= 3 ? '#16a34a' : (c.timelineYears ?? 99) <= 6 ? '#ca8a04' : '#6b7280' }}>
                {c.timelineYears ? `${c.timelineYears}yr` : '?'}
              </span>
            </div>
          ))}
        </div>

        {/* Competitive landscape side-by-side */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600, marginBottom:10 }}>Competitive Landscape</div>
          <div style={{ display:'grid', gridTemplateColumns:`repeat(${countries.length}, 1fr)`, gap:12 }}>
            {countries.map((c, i) => (
              <div key={c.id} style={{ background:'#111827', borderRadius:8, padding:10, border:`1px solid ${COLORS[i]}30` }}>
                <div style={{ fontSize:10, fontWeight:600, color: COLORS[i], marginBottom:6 }}>{c.name}</div>
                <CompetitorBadges competitors={c.competitors} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Country Detail Panel ───────────────────────────────────────────────────
function CountryDetail({ country, score, weights }: {
  country: CountryScore & { score: number }; score: number; weights: ScoreWeights
}) {
  const dims = SCORE_DIMENSIONS.map(d => ({
    ...d,
    raw: country[d.key as keyof CountryScore] as number,
  })).sort((a, b) => b.raw - a.raw)

  return (
    <div style={{ background:'#111827', border:'1px solid #374151', borderRadius:12, overflow:'hidden', height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 16px', borderBottom:'1px solid #1f2937', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#0f172a' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:24 }}>{countryCodeToFlag(country.id)}</span>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#e2e8f0' }}>{country.name}</div>
            <div style={{ fontSize:11, color:'#6b7280' }}>{country.subregion}</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:28, fontWeight:800, color:scoreToColor(score), lineHeight:1 }}>{score}</div>
          <div style={{ fontSize:10, color:'#6b7280' }}>{scoreToLabel(score)}</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:14 }}>
        {/* Dimension bars */}
        <div style={{ marginBottom:14 }}>
          {dims.map(d => (
            <div key={d.key} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3, alignItems:'center' }}>
                <span style={{ fontSize:11, color:'#9ca3af', display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:d.color, display:'inline-block' }} />
                  {d.label}
                </span>
                <span style={{ fontSize:11, fontWeight:700, color:d.color }}>{d.raw.toFixed(1)}</span>
              </div>
              <div style={{ height:5, background:'#1f2937', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(d.raw/10)*100}%`, background:d.color, borderRadius:3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Market stats */}
        {(country.marketSizeGW || country.timelineYears) && (
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            {country.marketSizeGW != null && (
              <div style={{ flex:1, padding:'6px 8px', background:'#1f293780', borderRadius:6, border:'1px solid #37415160' }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:2 }}>
                  <Zap size={9} color="#f97316" />
                  <span style={{ fontSize:9, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.04em' }}>Market Size</span>
                </div>
                <div style={{ fontSize:16, fontWeight:800, color:'#e2e8f0', lineHeight:1 }}>{country.marketSizeGW} <span style={{ fontSize:10, color:'#6b7280' }}>GW</span></div>
              </div>
            )}
            {country.timelineYears != null && (
              <div style={{ flex:1, padding:'6px 8px', background:'#1f293780', borderRadius:6, border:'1px solid #37415160' }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:2 }}>
                  <Clock size={9} color={country.timelineYears <= 3 ? '#16a34a' : country.timelineYears <= 6 ? '#ca8a04' : '#6b7280'} />
                  <span style={{ fontSize:9, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.04em' }}>Opportunity</span>
                </div>
                <div style={{ fontSize:16, fontWeight:800, color: country.timelineYears <= 3 ? '#16a34a' : country.timelineYears <= 6 ? '#ca8a04' : '#9ca3af', lineHeight:1 }}>
                  ~{country.timelineYears}yr
                </div>
              </div>
            )}
          </div>
        )}

        {/* Competitors */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5, fontWeight:600 }}>Competitive Landscape</div>
          <CompetitorBadges competitors={country.competitors} />
        </div>

        {/* Assessment */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5, fontWeight:600 }}>Assessment</div>
          <p style={{ fontSize:12, color:'#9ca3af', lineHeight:1.6, margin:0 }}>{country.notes}</p>
        </div>

        {country.keySignals && country.keySignals.length > 0 && (
          <div>
            <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5, fontWeight:600 }}>Key Signals</div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {country.keySignals.map((s, i) => (
                <div key={i} style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#f97316', marginTop:5, flexShrink:0 }} />
                  <span style={{ fontSize:11, color:'#cbd5e1', lineHeight:1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Leaflet World Map ──────────────────────────────────────────────────────
function WorldMap({ scoreMap, selectedId, compareIds, onSelect }: {
  scoreMap: Record<string, number>
  selectedId: string | null
  compareIds: string[]
  onSelect: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const layerRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false
    async function init() {
      const L = (await import('leaflet')).default
      const topo = await import('topojson-client')
      if (cancelled || !containerRef.current) return
      const map = L.map(containerRef.current, { center:[20,0], zoom:2, minZoom:1, maxZoom:6, zoomControl:true, attributionControl:false, worldCopyJump:false })
      mapRef.current = map
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', { subdomains:'abcd', maxZoom:19 }).addTo(map)
      if (cancelled) return
      const world = worldAtlasData as any
      const geojson = (await import('topojson-client')).feature(world, world.objects.countries) as any

      const geoLayer = L.geoJSON(geojson, {
        style: (feature: any) => {
          const num = parseInt(String(feature?.id ?? feature?.properties?.id ?? '0'), 10)
          const iso2 = NUMERIC_TO_ISO2[num] ?? ''
          const score = (window as any).__scoreMap__?.[iso2]
          const inCompare = ((window as any).__compareIds__ ?? []).includes(iso2)
          return { fillColor: scoreToColor(score), fillOpacity: 0.85, color: inCompare ? '#f97316' : '#333', weight: inCompare ? 2 : 0.5 }
        },
        onEachFeature: (feature: any, layer: any) => {
          const num = parseInt(String(feature?.id ?? feature?.properties?.id ?? '0'), 10)
          const iso2 = NUMERIC_TO_ISO2[num] ?? ''
          layer._iso2 = iso2
          layer.on('mouseover', () => {
            if (iso2 !== (window as any).__selectedId__) layer.setStyle({ weight:1.5, color:'#aaa' })
            const score = (window as any).__scoreMap__?.[iso2]
            const country = COUNTRIES.find(c => c.id === iso2)
            const name = country?.name ?? iso2
            layer.bindTooltip(
              iso2
                ? `<div style="font-size:12px;line-height:1.6">
                    <strong style="color:#e2e8f0">${name}</strong><br/>
                    Score: <strong style="color:${scoreToColor(score)}">${score != null ? Math.round(score) : 'N/A'}</strong>
                    <span style="color:#6b7280;font-size:10px"> · ${scoreToLabel(score)}</span>
                   </div>`
                : '<span style="color:#6b7280;font-size:11px">No data</span>',
              { sticky:true, className:'leaflet-tooltip-dark' }
            ).openTooltip()
          })
          layer.on('mouseout', () => { geoLayer.resetStyle(layer); applySelection() })
          layer.on('click', () => { if (iso2) onSelect(iso2) })
        },
      }).addTo(map)
      layerRef.current = geoLayer

      function applySelection() {
        const sel = (window as any).__selectedId__
        const cmp = (window as any).__compareIds__ ?? []
        geoLayer.eachLayer((l: any) => {
          const score = (window as any).__scoreMap__?.[l._iso2]
          const inCmp = cmp.includes(l._iso2)
          l.setStyle({ fillColor:scoreToColor(score), fillOpacity:0.85, color: l._iso2 === sel ? '#fff' : inCmp ? '#f97316' : '#333', weight: l._iso2 === sel ? 2.5 : inCmp ? 2 : 0.5 })
        })
      }
      ;(window as any).__applyMapSelection__ = applySelection
      applySelection()
      requestAnimationFrame(() => { if (!cancelled) map.invalidateSize() })
      const ro = new ResizeObserver(() => { if (mapRef.current) mapRef.current.invalidateSize() })
      if (containerRef.current) ro.observe(containerRef.current)
      ;(map as any)._ro = ro
    }
    init().catch(err => console.error('[WorldMap] init failed:', err))
    return () => { cancelled = true }
  }, [])

  useEffect(() => { return () => {
    if (mapRef.current) {
      if ((mapRef.current as any)._ro) (mapRef.current as any)._ro.disconnect()
      mapRef.current.remove(); mapRef.current = null; layerRef.current = null
    }
  }}, [])

  useEffect(() => {
    ;(window as any).__scoreMap__ = scoreMap
    if (!layerRef.current) return
    layerRef.current.eachLayer((l: any) => {
      const score = scoreMap[l._iso2]
      l.setStyle({ fillColor:scoreToColor(score), fillOpacity:0.85 })
    })
  }, [scoreMap])

  useEffect(() => {
    ;(window as any).__selectedId__ = selectedId
    ;(window as any).__compareIds__ = compareIds
    if (!(window as any).__applyMapSelection__) return
    ;(window as any).__applyMapSelection__()
  }, [selectedId, compareIds])

  return <div ref={containerRef} style={{ width:'100%', height:'100%', minHeight:320 }} />
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function InternationalTab() {
  const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS)
  const [selectedId, setSelectedId] = useState<string | null>('US')
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [filterRegion, setFilterRegion] = useState<string>('all')
  const [minScore, setMinScore] = useState(0)
  const [showWeights, setShowWeights] = useState(true)

  const setWeight = (key: keyof ScoreWeights, v: number) => setWeights(prev => ({ ...prev, [key]:v }))
  const resetWeights = () => setWeights(DEFAULT_WEIGHTS)

  const scoredCountries = useMemo(() =>
    COUNTRIES.map(c => ({ ...c, score: computeWeightedScore(c, weights) })).sort((a,b) => b.score-a.score),
    [weights]
  )
  const filteredCountries = useMemo(() =>
    scoredCountries.filter(c => (filterRegion === 'all' || c.region === filterRegion) && c.score >= minScore),
    [scoredCountries, filterRegion, minScore]
  )
  const selectedCountry = useMemo(() => scoredCountries.find(c => c.id === selectedId) ?? null, [scoredCountries, selectedId])
  const compareCountries = useMemo(() => compareIds.map(id => scoredCountries.find(c => c.id === id)).filter(Boolean) as Array<CountryScore & { score: number }>, [scoredCountries, compareIds])
  const scoreMap = useMemo(() => Object.fromEntries(scoredCountries.map(c => [c.id, c.score])), [scoredCountries])

  const tier1Count = scoredCountries.filter(c => c.score >= 75).length
  const tier2Count = scoredCountries.filter(c => c.score >= 60 && c.score < 75).length

  const handleSelect = (id: string) => setSelectedId(prev => prev === id ? null : id)

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  return (
    <div style={{ display:'flex', height:'100%', background:'#0a0a1a', overflow:'hidden', position:'relative' }}>

      {/* Compare overlay */}
      {showCompare && compareCountries.length >= 2 && (
        <div style={{ position:'absolute', inset:0, zIndex:2000 }}>
          <ComparePanel
            countries={compareCountries}
            onRemove={id => setCompareIds(prev => prev.filter(x => x !== id))}
            onClose={() => setShowCompare(false)}
          />
        </div>
      )}

      {/* LEFT: Weight Controls */}
      <div style={{ width:220, flexShrink:0, background:'#111827', borderRight:'1px solid #1f2937', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'12px 14px', borderBottom:'1px solid #1f2937', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <SlidersHorizontal size={13} color="#9ca3af" />
              <span style={{ fontSize:12, fontWeight:700, color:'#e2e8f0' }}>Score Weights</span>
            </div>
            <button onClick={() => setShowWeights(v => !v)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', padding:0 }}>
              {showWeights ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          <div style={{ fontSize:10, color:'#6b7280' }}>Drag to adjust what matters most</div>
        </div>
        {showWeights && (
          <div style={{ padding:'12px 14px', overflowY:'auto', flex:1 }}>
            {SCORE_DIMENSIONS.map(d => (
              <WeightSlider key={d.key} label={d.label} color={d.color} description={d.description}
                value={weights[d.key]} onChange={v => setWeight(d.key, v)} />
            ))}
            <button onClick={resetWeights} style={{ width:'100%', padding:'6px', marginTop:6, borderRadius:6, background:'#1f2937', border:'1px solid #374151', cursor:'pointer', color:'#9ca3af', fontSize:11, fontWeight:500 }}>
              Reset Defaults
            </button>
            <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid #1f2937' }}>
              <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6, fontWeight:600 }}>Filter List</div>
              <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
                style={{ width:'100%', background:'#1f2937', border:'1px solid #374151', borderRadius:6, color:'#e2e8f0', fontSize:11, padding:'4px 6px', cursor:'pointer', marginBottom:8 }}>
                <option value="all">All Regions</option>
                {Object.entries(REGION_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:10, color:'#9ca3af' }}>Min Score</span>
                <span style={{ fontSize:10, fontWeight:700, color:'#f97316' }}>{minScore}</span>
              </div>
              <input type="range" min={0} max={80} step={5} value={minScore}
                onChange={e => setMinScore(parseInt(e.target.value))}
                style={{ width:'100%', accentColor:'#f97316', height:4 }} />
            </div>
          </div>
        )}
        {/* Stats + Compare trigger */}
        <div style={{ padding:'10px 14px', borderTop:'1px solid #1f2937', flexShrink:0 }}>
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <div style={{ flex:1, padding:'6px 8px', background:'#16a34a15', borderRadius:6, border:'1px solid #16a34a40' }}>
              <div style={{ fontSize:16, fontWeight:800, color:'#16a34a', lineHeight:1 }}>{tier1Count}</div>
              <div style={{ fontSize:9, color:'#6b7280' }}>Tier 1</div>
            </div>
            <div style={{ flex:1, padding:'6px 8px', background:'#65a30d15', borderRadius:6, border:'1px solid #65a30d40' }}>
              <div style={{ fontSize:16, fontWeight:800, color:'#65a30d', lineHeight:1 }}>{tier2Count}</div>
              <div style={{ fontSize:9, color:'#6b7280' }}>Tier 2</div>
            </div>
            <div style={{ flex:1, padding:'6px 8px', background:'#1f293780', borderRadius:6, border:'1px solid #37415180' }}>
              <div style={{ fontSize:16, fontWeight:800, color:'#9ca3af', lineHeight:1 }}>{filteredCountries.length}</div>
              <div style={{ fontSize:9, color:'#6b7280' }}>Shown</div>
            </div>
          </div>
          {compareIds.length > 0 && (
            <button
              onClick={() => compareIds.length >= 2 ? setShowCompare(true) : null}
              style={{ width:'100%', padding:'7px', borderRadius:6, background: compareIds.length >= 2 ? '#f97316' : '#1f2937', border:'none', cursor: compareIds.length >= 2 ? 'pointer' : 'default', color: compareIds.length >= 2 ? '#fff' : '#6b7280', fontSize:11, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
              <GitCompare size={12} />
              Compare {compareIds.length} {compareIds.length >= 2 ? '→' : `(need ${2 - compareIds.length} more)`}
            </button>
          )}
        </div>
      </div>

      {/* CENTER: Map + Strip */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <div style={{ flex:1, position:'relative', minHeight:0 }}>
          {/* Legend */}
          <div style={{ position:'absolute', bottom:12, left:12, zIndex:1000, background:'rgba(17,24,39,0.92)', borderRadius:8, padding:'8px 12px', border:'1px solid #374151' }}>
            <div style={{ fontSize:9, color:'#6b7280', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Score → Color</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <div style={{ width:9, height:9, borderRadius:2, background:'#1e293b', border:'1px solid #374151', flexShrink:0 }} />
              <span style={{ fontSize:9, color:'#6b7280', marginRight:2 }}>No data</span>
              <div style={{ width:130, height:10, borderRadius:4, background:'linear-gradient(to right, #450a0a, #dc2626, #ea580c, #ca8a04, #65a30d, #16a34a)', border:'1px solid #37415160' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', width:130, marginLeft:57 }}>
              {['0','35','50','60','75','100'].map(l => <span key={l} style={{ fontSize:8, color:'#4b5563' }}>{l}</span>)}
            </div>
            <div style={{ marginTop:6, fontSize:9, color:'#4b5563' }}>
              <span style={{ color:'#f97316' }}>■</span> Orange border = in comparison
            </div>
          </div>
          {/* Compare hint */}
          {compareIds.length === 0 && (
            <div style={{ position:'absolute', top:12, right:12, zIndex:1000, background:'rgba(17,24,39,0.88)', borderRadius:6, padding:'5px 10px', border:'1px solid #374151', fontSize:10, color:'#6b7280' }}>
              <GitCompare size={10} style={{ display:'inline', marginRight:4 }} />
              Click + in strip to compare markets
            </div>
          )}
          <WorldMap scoreMap={scoreMap} selectedId={selectedId} compareIds={compareIds} onSelect={handleSelect} />
        </div>

        {/* Country ranking strip */}
        <div style={{ height:200, borderTop:'1px solid #1f2937', background:'#0d1117', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0 }}>
          <div style={{ padding:'7px 14px 5px', borderBottom:'1px solid #1f2937', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:11, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Markets — {filteredCountries.length} shown
            </span>
            <div style={{ display:'flex', gap:5 }}>
              {['all','europe','asia_pacific','middle_east','americas','africa'].map(r => (
                <button key={r} onClick={() => setFilterRegion(r)} style={{ padding:'2px 7px', borderRadius:5, border:'none', cursor:'pointer', fontSize:10, background: filterRegion===r ? '#374151' : 'transparent', color: filterRegion===r ? '#e2e8f0' : '#6b7280', fontWeight: filterRegion===r ? 600 : 400 }}>
                  {r === 'all' ? 'All' : REGION_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex:1, overflowX:'auto', overflowY:'hidden', padding:'8px 14px' }}>
            <div style={{ display:'flex', gap:7, height:'100%', alignItems:'stretch' }}>
              {filteredCountries.map((c, i) => {
                const color = scoreToColor(c.score)
                const isSelected = c.id === selectedId
                const inCompare = compareIds.includes(c.id)
                return (
                  <div key={c.id} style={{ width:72, flexShrink:0, cursor:'pointer', borderRadius:8, border:`1px solid ${isSelected ? color : inCompare ? '#f97316' : '#1f2937'}`, background: isSelected ? `${color}20` : inCompare ? '#f9741610' : '#111827', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, padding:'5px 4px', transition:'all 0.15s', position:'relative' }}
                    onClick={() => handleSelect(c.id)}>
                    {/* Compare toggle */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleCompare(c.id) }}
                      style={{ position:'absolute', top:3, right:3, width:14, height:14, borderRadius:3, background: inCompare ? '#f97316' : '#1f2937', border:`1px solid ${inCompare ? '#f97316' : '#374151'}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0, fontSize:9, color: inCompare ? '#fff' : '#6b7280', lineHeight:1 }}>
                      {inCompare ? '✓' : '+'}
                    </button>
                    <div style={{ fontSize:17 }}>{countryCodeToFlag(c.id)}</div>
                    <div style={{ fontSize:16, fontWeight:800, color, lineHeight:1 }}>{c.score}</div>
                    <div style={{ fontSize:9, color:'#9ca3af', textAlign:'center', lineHeight:1.2 }}>{c.name}</div>
                    <div style={{ fontSize:9, padding:'1px 5px', borderRadius:4, background:`${color}25`, color, fontWeight:600 }}>#{i+1}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Country Detail */}
      <div style={{ width:280, flexShrink:0, borderLeft:'1px solid #1f2937', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {selectedCountry ? (
          <CountryDetail country={selectedCountry} score={selectedCountry.score} weights={weights} />
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center', gap:12 }}>
            <Globe size={40} color="#374151" />
            <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.6 }}>Click a country on the map or in the ranking strip to view detailed analysis</div>
          </div>
        )}
      </div>
    </div>
  )
}
