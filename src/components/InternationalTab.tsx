'use client'
import { useState, useMemo } from 'react'
import { Globe, ChevronDown, ChevronUp, Info, SlidersHorizontal } from 'lucide-react'
import {
  COUNTRIES, DEFAULT_WEIGHTS, computeWeightedScore, SCORE_DIMENSIONS, REGION_LABELS,
  type CountryScore, type ScoreWeights
} from '@/lib/international'

// ── Simple SVG world map using approximate bounding boxes ──────────────────────
// We use a projection-friendly SVG with d3-compatible positioning
// Countries are mapped to approximate pixel positions on a 960×500 equirectangular canvas

const COUNTRY_POSITIONS: Record<string, { cx: number; cy: number; r?: number }> = {
  // Europe
  GB: { cx: 460, cy: 145 }, FR: { cx: 478, cy: 162 }, DE: { cx: 498, cy: 150 },
  NL: { cx: 490, cy: 143 }, BE: { cx: 485, cy: 152 }, SE: { cx: 515, cy: 120 },
  FI: { cx: 535, cy: 112 }, PL: { cx: 520, cy: 148 }, CZ: { cx: 512, cy: 155 },
  SK: { cx: 521, cy: 158 }, RO: { cx: 534, cy: 162 }, UA: { cx: 548, cy: 152 },
  // Asia Pacific
  KR: { cx: 740, cy: 168 }, JP: { cx: 768, cy: 165 }, TW: { cx: 752, cy: 195 },
  IN: { cx: 666, cy: 210 }, AU: { cx: 762, cy: 310 }, VN: { cx: 740, cy: 218 },
  PH: { cx: 762, cy: 228 }, MY: { cx: 742, cy: 238 }, SG: { cx: 742, cy: 247 },
  ID: { cx: 758, cy: 258 },
  // Middle East
  AE: { cx: 608, cy: 206 }, SA: { cx: 596, cy: 200 }, JO: { cx: 584, cy: 192 },
  // Americas
  CA: { cx: 195, cy: 140 }, BR: { cx: 270, cy: 290 },
  // Africa
  ZA: { cx: 520, cy: 340 }, KE: { cx: 566, cy: 278 },
}

function scoreToColor(score: number): string {
  if (score >= 75) return '#16a34a'  // green
  if (score >= 60) return '#65a30d'  // lime
  if (score >= 50) return '#ca8a04'  // yellow
  if (score >= 35) return '#ea580c'  // orange
  return '#dc2626'                    // red
}

function scoreToLabel(score: number): string {
  if (score >= 75) return 'Tier 1'
  if (score >= 60) return 'Tier 2'
  if (score >= 50) return 'Tier 3'
  if (score >= 35) return 'Watchlist'
  return 'Low Priority'
}

// ── Weight Slider ──────────────────────────────────────────────────────────────
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
        <span style={{ fontSize: 11, fontWeight: 700, color: color, minWidth: 28, textAlign: 'right' }}>{value.toFixed(1)}×</span>
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

// ── Country Card ───────────────────────────────────────────────────────────────
function CountryCard({ country, score, rank, isSelected, onClick }: {
  country: CountryScore; score: number; rank: number; isSelected: boolean; onClick: () => void
}) {
  const tierColor = scoreToColor(score)
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 12px', cursor: 'pointer', borderRadius: 8,
        border: `1px solid ${isSelected ? tierColor : '#1f2937'}`,
        background: isSelected ? `${tierColor}15` : 'transparent',
        marginBottom: 4, transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      <div style={{
        width: 28, height: 22, borderRadius: 4, flexShrink: 0,
        background: tierColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: '#fff'
      }}>
        {rank}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>{country.flagEmoji}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{country.name}</span>
        </div>
        <div style={{ fontSize: 10, color: '#6b7280' }}>{country.subregion}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: tierColor, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 9, color: '#6b7280', marginTop: 1 }}>{scoreToLabel(score)}</div>
      </div>
    </div>
  )
}

// ── Detail Panel ───────────────────────────────────────────────────────────────
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
        {/* Score dimensions */}
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

        {/* Notes */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, fontWeight: 600 }}>Assessment</div>
          <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>{country.notes}</p>
        </div>

        {/* Key signals */}
        {country.keySignals && country.keySignals.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, fontWeight: 600 }}>Key Signals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {country.keySignals.map((s, i) => (
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

// ── SVG World Map ──────────────────────────────────────────────────────────────
function WorldDotMap({ scoredCountries, selected, onSelect }: {
  scoredCountries: Array<CountryScore & { score: number }>
  selected: string | null
  onSelect: (id: string) => void
}) {
  const scoreMap = Object.fromEntries(scoredCountries.map(c => [c.id, c.score]))
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg
        viewBox="0 0 960 500"
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <rect width={960} height={500} fill="#0a0a1a" />

        {/* Subtle grid lines */}
        {[0, 60, 120, 180, 240, 300, 360, 420].map(y => (
          <line key={y} x1={0} y1={y} x2={960} y2={y} stroke="#ffffff08" strokeWidth={0.5} />
        ))}
        {[0, 96, 192, 288, 384, 480, 576, 672, 768, 864, 960].map(x => (
          <line key={x} x1={x} y1={0} x2={x} y2={500} stroke="#ffffff08" strokeWidth={0.5} />
        ))}

        {/* Equator */}
        <line x1={0} y1={248} x2={960} y2={248} stroke="#ffffff12" strokeWidth={0.8} strokeDasharray="4 4" />

        {/* Continents: approximate shapes as polygons ─────────────────────── */}
        {/* North America */}
        <polygon points="95,85 220,75 255,105 270,145 250,190 230,230 195,250 170,235 145,200 110,170 85,130"
          fill="#1a1a2e" stroke="#2a2a4a" strokeWidth={0.8} />
        {/* South America */}
        <polygon points="200,240 280,230 305,260 310,310 285,360 255,380 225,355 210,310 195,270"
          fill="#1a1a2e" stroke="#2a2a4a" strokeWidth={0.8} />
        {/* Europe */}
        <polygon points="430,90 570,90 590,120 575,175 555,185 520,180 490,175 460,170 440,150 425,120"
          fill="#1a1a2e" stroke="#2a2a4a" strokeWidth={0.8} />
        {/* Africa */}
        <polygon points="455,185 560,185 580,225 575,280 555,340 525,375 490,370 465,335 450,280 445,230"
          fill="#1a1a2e" stroke="#2a2a4a" strokeWidth={0.8} />
        {/* Middle East */}
        <polygon points="560,170 640,165 660,195 640,225 600,230 565,215 555,195"
          fill="#1a1a2e" stroke="#2a2a4a" strokeWidth={0.8} />
        {/* South Asia */}
        <polygon points="635,165 705,165 720,200 700,240 665,250 640,225 630,200"
          fill="#1a1a2e" stroke="#2a2a4a" strokeWidth={0.8} />
        {/* East Asia */}
        <polygon points="700,120 800,115 820,145 800,185 760,200 730,190 710,165 700,140"
          fill="#1a1a2e" stroke="#2a2a4a" strokeWidth={0.8} />
        {/* Southeast Asia */}
        <polygon points="720,195 790,195 800,225 785,265 760,270 730,255 720,230"
          fill="#1a1a2e" stroke="#2a2a4a" strokeWidth={0.8} />
        {/* Australia */}
        <polygon points="720,285 840,285 855,320 845,360 800,375 755,360 725,330 715,305"
          fill="#1a1a2e" stroke="#2a2a4a" strokeWidth={0.8} />
        {/* Russia */}
        <polygon points="520,60 900,50 920,90 860,110 800,115 700,120 620,115 550,100 515,80"
          fill="#1a1a2e" stroke="#2a2a4a" strokeWidth={0.8} />

        {/* Region Labels */}
        <text x={170} y={140} fill="#2d3748" fontSize={9} textAnchor="middle" fontFamily="sans-serif">NORTH AMERICA</text>
        <text x={245} y={315} fill="#2d3748" fontSize={9} textAnchor="middle" fontFamily="sans-serif">SOUTH AMERICA</text>
        <text x={500} y={138} fill="#2d3748" fontSize={9} textAnchor="middle" fontFamily="sans-serif">EUROPE</text>
        <text x={510} y={280} fill="#2d3748" fontSize={9} textAnchor="middle" fontFamily="sans-serif">AFRICA</text>
        <text x={670} y={155} fill="#2d3748" fontSize={9} textAnchor="middle" fontFamily="sans-serif">ASIA</text>
        <text x={770} y={335} fill="#2d3748" fontSize={9} textAnchor="middle" fontFamily="sans-serif">AUSTRALIA</text>

        {/* Country dots ──────────────────────────────────────────────────────── */}
        {scoredCountries.map(c => {
          const pos = COUNTRY_POSITIONS[c.id]
          if (!pos) return null
          const color = scoreToColor(c.score)
          const isSelected = selected === c.id
          const isHovered = hovered === c.id
          const radius = pos.r ?? (isSelected ? 10 : isHovered ? 9 : 7)

          return (
            <g key={c.id} style={{ cursor: 'pointer' }}
              onClick={() => onSelect(c.id)}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Glow ring for selected */}
              {isSelected && (
                <circle cx={pos.cx} cy={pos.cy} r={radius + 6} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />
              )}
              {/* Pulse ring for hovered */}
              {isHovered && !isSelected && (
                <circle cx={pos.cx} cy={pos.cy} r={radius + 4} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
              )}
              {/* Main dot */}
              <circle
                cx={pos.cx} cy={pos.cy} r={radius}
                fill={color}
                fillOpacity={isSelected ? 1 : 0.85}
                stroke={isSelected ? '#fff' : 'none'}
                strokeWidth={isSelected ? 1.5 : 0}
              />
              {/* Score label */}
              <text
                x={pos.cx} y={pos.cy + 1}
                fill="#fff" fontSize={isSelected ? 7 : 6}
                textAnchor="middle" dominantBaseline="middle"
                fontWeight="700" fontFamily="sans-serif"
                pointerEvents="none"
              >
                {c.score}
              </text>
              {/* Country code on hover/select */}
              {(isHovered || isSelected) && (
                <text
                  x={pos.cx} y={pos.cy - radius - 5}
                  fill={color} fontSize={9}
                  textAnchor="middle" dominantBaseline="auto"
                  fontWeight="700" fontFamily="sans-serif"
                  pointerEvents="none"
                >
                  {c.flagEmoji} {c.name}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        background: 'rgba(17,24,39,0.9)', borderRadius: 8, padding: '8px 12px',
        border: '1px solid #1f2937', display: 'flex', gap: 12, alignItems: 'center'
      }}>
        {[
          { label: 'Tier 1 (75+)', color: '#16a34a' },
          { label: 'Tier 2 (60+)', color: '#65a30d' },
          { label: 'Tier 3 (50+)', color: '#ca8a04' },
          { label: 'Watchlist (35+)', color: '#ea580c' },
          { label: 'Low Priority', color: '#dc2626' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 9, color: '#9ca3af' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
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

  const tier1Count = scoredCountries.filter(c => c.score >= 75).length
  const tier2Count = scoredCountries.filter(c => c.score >= 60 && c.score < 75).length

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0a0a1a', overflow: 'hidden' }}>

      {/* ── LEFT PANEL: Weight Controls ──────────────────────────────────────── */}
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
              <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 600 }}>Filter</div>

              {/* Region */}
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

              {/* Min score */}
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

      {/* ── CENTER: Map + Country List ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <WorldDotMap
            scoredCountries={filteredCountries}
            selected={selectedId}
            onSelect={id => setSelectedId(id === selectedId ? null : id)}
          />
        </div>

        {/* Country ranking strip */}
        <div style={{
          height: 220, borderTop: '1px solid #1f2937', background: '#0d1117',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{
            padding: '8px 14px 6px', borderBottom: '1px solid #1f2937', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Country Rankings — {filteredCountries.length} markets
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'europe', 'asia_pacific', 'middle_east', 'americas', 'africa'].map(r => (
                <button key={r} onClick={() => setFilterRegion(r)} style={{
                  padding: '2px 8px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 10,
                  background: filterRegion === r ? '#374151' : 'transparent',
                  color: filterRegion === r ? '#e2e8f0' : '#6b7280', fontWeight: filterRegion === r ? 600 : 400
                }}>
                  {r === 'all' ? 'All' : REGION_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '8px 14px' }}>
            <div style={{ display: 'flex', gap: 8, height: '100%', alignItems: 'stretch' }}>
              {filteredCountries.map((c, i) => {
                const color = scoreToColor(c.score)
                const isSelected = c.id === selectedId
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                    style={{
                      width: 72, flexShrink: 0, cursor: 'pointer', borderRadius: 8,
                      border: `1px solid ${isSelected ? color : '#1f2937'}`,
                      background: isSelected ? `${color}20` : '#111827',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', gap: 3, padding: '6px 4px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 18 }}>{c.flagEmoji}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color, lineHeight: 1 }}>{c.score}</div>
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

      {/* ── RIGHT PANEL: Country Detail ───────────────────────────────────────── */}
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
              Click a country dot on the map or a card in the ranking strip to view detailed analysis
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
