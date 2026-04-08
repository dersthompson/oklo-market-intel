'use client'
import { useState } from 'react'
import { UTILITIES } from '@/lib/utilities'
import type { Utility } from '@/lib/types'
import { ChevronDown, ChevronUp, ExternalLink, Zap, Shield, AlertCircle, CheckCircle } from 'lucide-react'

const StanceBadge = ({ stance }: { stance: Utility['nuclearStance'] }) => {
  const config = {
    pro: { label: 'Pro-Nuclear', bg: '#052e16', color: '#4ade80', icon: '⚛️' },
    exploring: { label: 'Exploring SMR', bg: '#172554', color: '#60a5fa', icon: '🔬' },
    neutral: { label: 'Neutral', bg: '#1c1917', color: '#a8a29e', icon: '⚖️' },
    anti: { label: 'Opposed', bg: '#450a0a', color: '#f87171', icon: '🚫' },
  }[stance]
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
      background: config.bg, color: config.color, whiteSpace: 'nowrap'
    }}>{config.icon} {config.label}</span>
  )
}

const PriorityDot = ({ p }: { p: number }) => {
  const colors = { 1: '#f97316', 2: '#f59e0b', 3: '#6b7280', 4: '#374151' }
  return <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[p as keyof typeof colors] || '#374151', flexShrink: 0 }} />
}

function UtilityCard({ utility }: { utility: Utility }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: '#111827', border: '1px solid #374151', borderRadius: 12,
      overflow: 'hidden', transition: 'border-color 0.2s',
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}
      >
        {/* Color stripe */}
        <div style={{ width: 4, height: '100%', minHeight: 40, borderRadius: 2, background: utility.logoColor, flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <PriorityDot p={utility.priority} />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>{utility.name}</span>
            {utility.ticker && utility.ticker !== 'N/A (Federal)' && utility.ticker !== 'BRKsubsidiary' && utility.ticker !== 'Private (Macquarie)' && (
              <span style={{ fontSize: 11, color: '#6b7280', padding: '1px 6px', background: '#1f2937', borderRadius: 6 }}>{utility.ticker}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <StanceBadge stance={utility.nuclearStance} />
            <span style={{ fontSize: 11, color: '#6b7280' }}>{utility.type}</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>•</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{utility.iso}</span>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{utility.region}</div>
        </div>

        <div style={{ color: '#6b7280', flexShrink: 0, marginTop: 4 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid #1f2937' }}>
          {utility.okloRelevance && (
            <div style={{ padding: '10px 12px', background: '#0c1a0c', border: '1px solid #16a34a40', borderRadius: 8, marginBottom: 12, marginTop: 12 }}>
              <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Oklo Relevance</div>
              <div style={{ fontSize: 12, color: '#86efac', lineHeight: 1.5 }}>{utility.okloRelevance}</div>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 600 }}>Nuclear Stance</div>
            <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>{utility.stanceDetails}</p>
          </div>

          {utility.existingNuclear.length > 0 && utility.existingNuclear[0] !== 'None' && utility.existingNuclear[0] !== '' && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 600 }}>Existing Nuclear Plants</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {utility.existingNuclear.map(p => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#06b6d4', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#cbd5e1' }}>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 600 }}>SMR / Advanced Nuclear Plans</div>
            <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>{utility.smrPlans}</p>
          </div>

          <div style={{ marginBottom: utility.recentNews ? 12 : 0 }}>
            <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 600 }}>Interconnection Status</div>
            <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>{utility.interconnectionStatus}</p>
          </div>

          {utility.recentNews && (
            <div style={{ padding: '10px 12px', background: '#172033', border: '1px solid #1e40af40', borderRadius: 8, marginTop: 4 }}>
              <div style={{ fontSize: 10, color: '#60a5fa', fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Intel (2024)</div>
              <div style={{ fontSize: 12, color: '#93c5fd', lineHeight: 1.5 }}>{utility.recentNews}</div>
            </div>
          )}

          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {utility.states.map(s => (
              <span key={s} style={{ fontSize: 10, padding: '2px 7px', background: '#1f2937', color: '#6b7280', borderRadius: 6 }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function UtilityTab() {
  const [filter, setFilter] = useState<'all' | 'pro' | 'exploring' | 'neutral'>('all')
  const [search, setSearch] = useState('')

  const filtered = UTILITIES.filter(u => {
    if (filter !== 'all' && u.nuclearStance !== filter) return false
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.region.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => a.priority - b.priority)

  const counts = {
    pro: UTILITIES.filter(u => u.nuclearStance === 'pro').length,
    exploring: UTILITIES.filter(u => u.nuclearStance === 'exploring').length,
    neutral: UTILITIES.filter(u => u.nuclearStance === 'neutral').length,
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a1a' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2937', background: '#111827' }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0, marginBottom: 4 }}>Utility Company Intelligence</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Nuclear stance, interconnection queue status, and SMR plans for major US utilities</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Pro-Nuclear', count: counts.pro, color: '#4ade80', bg: '#052e16' },
            { label: 'Exploring SMR', count: counts.exploring, color: '#60a5fa', bg: '#172554' },
            { label: 'Neutral', count: counts.neutral, color: '#a8a29e', bg: '#1c1917' },
          ].map(s => (
            <div key={s.label} style={{ padding: '8px 14px', background: s.bg, border: `1px solid ${s.color}30`, borderRadius: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 10, color: s.color + 'aa' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            placeholder="Search utilities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: '#1f2937', border: '1px solid #374151', borderRadius: 8,
              padding: '6px 12px', color: '#e2e8f0', fontSize: 12, outline: 'none', width: 180
            }}
          />
          {(['all', 'pro' , 'exploring', 'neutral'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                background: filter === f ? '#f97316' : '#1f2937',
                color: filter === f ? '#fff' : '#9ca3af'
              }}
            >{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(u => <UtilityCard key={u.id} utility={u} />)}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>No utilities match your filter</div>
        )}
      </div>
    </div>
  )
}
