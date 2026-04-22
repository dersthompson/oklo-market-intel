'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { Globe, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import {
  COUNTRIES, DEFAULT_WEIGHTS, computeWeightedScore, SCORE_DIMENSIONS, REGION_LABELS,
  type CountryScore, type ScoreWeights
} from '@/lib/international'
import 'leaflet/dist/leaflet.css'

// ISO numeric -> ISO 2-letter mapping for world-atlas TopoJSON
const NUMERIC_TO_ISO2: Record<number, string> = {
  36:'AU', 56:'BE', 76:'BR', 124:'CA', 156:'CN', 203:'CZ', 246:'FI', 250:'FR',
  276:'DE', 356:'IN', 360:'ID', 392:'JP', 400:'JO', 404:'KE', 410:'KR',
  458:'MY', 528:'NL', 608:'PH', 616:'PL', 642:'RO', 682:'SA', 702:'SG',
  703:'SK', 710:'ZA', 752:'SE', 158:'TW', 784:'AE', 804:'UA', 826:'GB', 704:'VN',
}

function scoreToColor(score: number): string {
  if (score >= 75) return '#16a34a'
  if (score >= 60) return '#65a30d'
  if (score >= 50) return '#ca8a04'
  if (score >= 35) return '#ea580c'
  return '#dc2626'
}

function scoreToLabel(score: number): string {
  if (score >= 75) return 'Tier 1'
  if (score >= 60) return 'Tier 2'
  if (score >= 50) return 'Tier 3'
  if (score >= 35) return 'Watchlist'
  return 'Low Priority'
}

// -- Weight Slider --------------------------------------------------------------
function WeightSlider({
  label, color, description, value, onChange
}: { label: string; color: string; description: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#d1d5db', fontWeight: 500 }}>{label}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: color, minWidth: 28, textAlign: 'right' }}>{value.toFixed(1)}x</span>
      </div>
      <input
        type="range" min="0" max="2" step="0.1" value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer', height: 4 }}
        title={description}
      />
    </div>
  )
}

// -- Country Detail Panel -------------------------------------------------------
function CountryDetail({ country, score, weights, onClose }: {
  country: CountryScore; score: number; weights: ScoreWeights; onClose: () => void
}) {
  const dims = SCORE_DIMENSIONS.map(d => ({
    ...d,
    raw: country[d.key as keyof CountryScore] as number,
    weighted: (country[d.key as keyof CountryScore] as number) * (weights[d.key] ?? 1),
  })).sort((a, b) => b.raw - a.raw)

  return (
    <div style={{
      background: '#111827', border: '1px solid #374151', borderRadius: 12,
      overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid #1f2937',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#0f172a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{country.flagEmoji}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{country.name}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{country.subregion}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: scoreToColor(score), lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>{scoreToLabel(score)}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        <div style={{ marginBottom: 14 }}>
          {dims.map(d => (
            <div key={d.key} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                  {d.label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.raw.toFixed(1)}</span>
              </div>
              <div style={{ height: 5, background: '#1f2937', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(d.raw / 10) * 100}%`, background: d.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, fontWeight: 600 }}>Assessment</div>
          <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>{country.notes}</p>
        </div>

        {country.keySignals && country.keySignals.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, fontWeight: 600 }}>Key Signals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {country.keySignals.map((s: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f97316', marginTop: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// -- Leaflet World Choropleth Map -----------------------------------------------
function WorldMap({ scoreMap, selectedId, onSelect }: {
  scoreMap: Record<string, number>
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const layerRef = useRef<any>(null)

  // ── Init map once on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false

    async function init() {
      const L = (await import('leaflet')).default
      const topo = await import('topojson-client')
      if (cancelled || !containerRef.current) return

      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 1,
        maxZoom: 6,
        zoomControl: true,
        attributionControl: false,
        worldCopyJump: false,
      })
      mapRef.current = map

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19 }
      ).addTo(map)

      // Fetch world topology
      const res = await fetch(
        'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
      )
      if (cancelled) return
      const world = await res.json()
      const geojson = topo.feature(world, world.objects.countries) as any

      // Build ISO numeric -> ISO2 lookup from existing NUMERIC_TO_ISO2
      const geoLayer = L.geoJSON(geojson, {
        style: (feature: any) => {
          const num = parseInt(feature?.properties?.id ?? feature?.properties?.numeric ?? '0', 10)
          const iso2 = NUMERIC_TO_ISO2[num] ?? ''
          const score = (window as any).__scoreMap__?.[iso2]
          return {
            fillColor: scoreToColor(score),
            fillOpacity: 0.85,
            color: '#333',
            weight: 0.5,
          }
        },
        onEachFeature: (feature: any, layer: any) => {
          const num = parseInt(feature?.properties?.id ?? feature?.properties?.numeric ?? '0', 10)
          const iso2 = NUMERIC_TO_ISO2[num] ?? ''
          layer._iso2 = iso2

          layer.on('mouseover', () => {
            if (iso2 !== (window as any).__selectedId__) {
              layer.setStyle({ weight: 1.5, color: '#aaa' })
            }
            const score = (window as any).__scoreMap__?.[iso2]
            layer.bindTooltip(
              iso2 ? `<strong>${iso2}</strong> · ${score != null ? score.toFixed(1) : 'N/A'}` : 'No data',
              { sticky: true, className: 'leaflet-tooltip-dark' }
            ).openTooltip()
          })
          layer.on('mouseout', () => {
            geoLayer.resetStyle(layer)
            applySelection()
          })
          layer.on('click', () => {
            if (iso2) onSelect(iso2)
          })
        },
      }).addTo(map)

      layerRef.current = geoLayer

      function applySelection() {
        const sel = (window as any).__selectedId__
        geoLayer.eachLayer((l: any) => {
          const score = (window as any).__scoreMap__?.[l._iso2]
          l.setStyle({
            fillColor: scoreToColor(score),
            fillOpacity: 0.85,
            color: l._iso2 === sel ? '#fff' : '#333',
            weight: l._iso2 === sel ? 2.5 : 0.5,
          })
        })
      }

      ;(window as any).__applyMapSelection__ = applySelection
      applySelection()
    }

    init()
    return () => {
      cancelled = true
    }
  }, []) // init once

  // Cleanup map on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        layerRef.current = null
      }
    }
  }, [])

  // ── Reactive: update fill colours when scoreMap changes ───────────────────
  useEffect(() => {
    ;(window as any).__scoreMap__ = scoreMap
    if (!layerRef.current) return
    layerRef.current.eachLayer((l: any) => {
      const score = scoreMap[l._iso2]
      l.setStyle({ fillColor: scoreToColor(score), fillOpacity: 0.85 })
    })
  }, [scoreMap])

  // ── Reactive: update selection highlight ──────────────────────────────────
  useEffect(() => {
    ;(window as any).__selectedId__ = selectedId
    if (!(window as any).__applyMapSelection__) return
    ;(window as any).__applyMapSelection__()
  }, [selectedId])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 320 }}
    />
  )
}

// -- Main Component -------------------------------------------------------------
export default function InternationalTab() {
  const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS)
  const [selectedId, setSelectedId] = useState<string | null>('KR')
  const [filterRegion, setFilterRegion] = useState<string>('all')
  const [minScore, setMinScore] = useState(0)
  const [showWeights, setShowWeights] = useState(true)

  const setWeight = (key: keyof ScoreWeights, value: number) =>
    setWeights(prev => ({ ...prev, [key]: value }))

  const resetWeights = () => setWeights(DEFAULT_WEIGHTS)

  const scoredCountries = useMemo(() =>
    COUNTRIES
      .map(c => ({ ...c, score: computeWeightedScore(c, weights) }))
      .sort((a, b) => b.score - a.score),
    [weights]
  )

  const filteredCountries = useMemo(() =>
    scoredCountries.filter(c =>
      (filterRegion === 'all' || c.region === filterRegion) && c.score >= minScore
    ),
    [scoredCountries, filterRegion, minScore]
  )

  const selectedCountry = useMemo(() =>
    scoredCountries.find(c => c.id === selectedId) ?? null,
    [scoredCountries, selectedId]
  )

  // Build scoreMap for all scored countries (not just filtered) so the full
  // world map is colored even when filtering the list
  const scoreMap = useMemo(() =>
    Object.fromEntries(scoredCountries.map(c => [c.id, c.score])),
    [scoredCountries]
  )

  const tier1Count = scoredCountries.filter(c => c.score >= 75).length
  const tier2Count = scoredCountries.filter(c => c.score >= 60 && c.score < 75).length

  const handleSelect = (id: string) => setSelectedId(prev => prev === id ? null : id)

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0a0a1a', overflow: 'hidden' }}>

      {/* -- LEFT PANEL: Weight Controls ---------------------------------------- */}
      <div style={{
        width: 220, flexShrink: 0, background: '#111827', borderRight: '1px solid #1f2937',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #1f2937', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SlidersHorizontal size={13} color="#9ca3af" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>Score Weights</span>
            </div>
            <button
              onClick={() => setShowWeights(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}
            >
              {showWeights ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Drag sliders to adjust what matters most</div>
        </div>

        {showWeights && (
          <div style={{ padding: '12px 14px', overflowY: 'auto', flex: 1 }}>
            {SCORE_DIMENSIONS.map(d => (
              <WeightSlider
                key={d.key}
                label={d.label}
                color={d.color}
                description={d.description}
                value={weights[d.key]}
                onChange={v => setWeight(d.key, v)}
              />
            ))}
            <button
              onClick={resetWeights}
              style={{
                width: '100%', padding: '6px', marginTop: 6, borderRadius: 6,
                background: '#1f2937', border: '1px solid #374151', cursor: 'pointer',
                color: '#9ca3af', fontSize: 11, fontWeight: 500
              }}
            >
              Reset Defaults
            </button>

            {/* Filter bar */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1f2937' }}>
              <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 600 }}>Filter List</div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3 }}>Region</div>
                <select
                  value={filterRegion}
                  onChange={e => setFilterRegion(e.target.value)}
                  style={{
                    width: '100%', background: '#1f2937', border: '1px solid #374151',
                    borderRadius: 6, color: '#e2e8f0', fontSize: 11, padding: '4px 6px', cursor: 'pointer'
                  }}
                >
                  <option value="all">All Regions</option>
                  {Object.entries(REGION_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>Min Score</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316' }}>{minScore}</span>
                </div>
                <input
                  type="range" min={0} max={80} step={5} value={minScore}
                  onChange={e => setMinScore(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#f97316', height: 4 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid #1f2937', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, padding: '6px 8px', background: '#16a34a15', borderRadius: 6, border: '1px solid #16a34a40' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>{tier1Count}</div>
              <div style={{ fontSize: 9, color: '#6b7280' }}>Tier 1</div>
            </div>
            <div style={{ flex: 1, padding: '6px 8px', background: '#65a30d15', borderRadius: 6, border: '1px solid #65a30d40' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#65a30d', lineHeight: 1 }}>{tier2Count}</div>
              <div style={{ fontSize: 9, color: '#6b7280' }}>Tier 2</div>
            </div>
            <div style={{ flex: 1, padding: '6px 8px', background: '#1f293780', borderRadius: 6, border: '1px solid #37415180' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#9ca3af', lineHeight: 1 }}>{filteredCountries.length}</div>
              <div style={{ fontSize: 9, color: '#6b7280' }}>Shown</div>
            </div>
          </div>
        </div>
      </div>

      {/* -- CENTER: Map + Country Strip ----------------------------------------- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Map -- takes remaining vertical space */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          {/* Score legend overlay */}
          <div style={{
            position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
            background: 'rgba(17,24,39,0.92)', borderRadius: 8, padding: '7px 12px',
            border: '1px solid #374151', display: 'flex', gap: 10, alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            {[
              { label: 'Tier 1 (75+)', color: '#16a34a' },
              { label: 'Tier 2 (60+)', color: '#65a30d' },
              { label: 'Tier 3 (50+)', color: '#ca8a04' },
              { label: 'Watchlist', color: '#ea580c' },
              { label: 'Low', color: '#dc2626' },
              { label: 'No data', color: '#1e293b' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, border: '1px solid #4b556360' }} />
                <span style={{ fontSize: 9, color: '#9ca3af' }}>{item.label}</span>
              </div>
            ))}
          </div>

          <WorldMap
            scoreMap={scoreMap}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        {/* Country ranking strip */}
        <div style={{
          height: 190, borderTop: '1px solid #1f2937', background: '#0d1117',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0
        }}>
          <div style={{
            padding: '7px 14px 5px', borderBottom: '1px solid #1f2937', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Markets -- {filteredCountries.length} shown
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {['all', 'europe', 'asia_pacific', 'middle_east', 'americas', 'africa'].map(r => (
                <button key={r} onClick={() => setFilterRegion(r)} style={{
                  padding: '2px 7px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 10,
                  background: filterRegion === r ? '#374151' : 'transparent',
                  color: filterRegion === r ? '#e2e8f0' : '#6b7280', fontWeight: filterRegion === r ? 600 : 400
                }}>
                  {r === 'all' ? 'All' : REGION_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '8px 14px' }}>
            <div style={{ display: 'flex', gap: 7, height: '100%', alignItems: 'stretch' }}>
              {filteredCountries.map((c, i) => {
                const color = scoreToColor(c.score)
                const isSelected = c.id === selectedId
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    style={{
                      width: 68, flexShrink: 0, cursor: 'pointer', borderRadius: 8,
                      border: `1px solid ${isSelected ? color : '#1f2937'}`,
                      background: isSelected ? `${color}20` : '#111827',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', gap: 2, padding: '5px 4px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 17 }}>{c.flagEmoji}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{c.score}</div>
                    <div style={{ fontSize: 9, color: '#9ca3af', textAlign: 'center', lineHeight: 1.2 }}>{c.name}</div>
                    <div style={{
                      fontSize: 9, padding: '1px 5px', borderRadius: 4,
                      background: `${color}25`, color, fontWeight: 600
                    }}>#{i + 1}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* -- RIGHT PANEL: Country Detail ----------------------------------------- */}
      <div style={{
        width: 280, flexShrink: 0, borderLeft: '1px solid #1f2937',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {selectedCountry ? (
          <CountryDetail
            country={selectedCountry}
            score={selectedCountry.score}
            weights={weights}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: 24, textAlign: 'center', gap: 12
          }}>
            <Globe size={40} color="#374151" />
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
              Click a country on the map or in the ranking strip to view detailed analysis
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
