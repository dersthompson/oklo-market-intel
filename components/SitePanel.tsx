'use client'
import { X, MapPin } from 'lucide-react'
import type { OkloSite } from '@/lib/types'

interface Props {
  site: OkloSite | null
  zipInfo: { income?: number; unemployment?: number; iso?: string; electricityPrice?: number } | null
  searchedZip: string | null
  onClose: () => void
}

const PriorityBadge = ({ p }: { p: number }) => {
  const colors: Record<number, [string, string]> = {
    5: ['#f97316', '#7c2d12'], 4: ['#f59e0b', '#78350f'],
    3: ['#10b981', '#064e3b'], 2: ['#6366f1', '#312e81'], 1: ['#6b7280', '#111827']
  }
  const [fg, bg] = colors[p] || colors[1]
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
      background: bg, color: fg, border: `1px solid ${fg}40`
    }}>P{p} Priority</span>
  )
}

const ScoreBar = ({ label, value, color = '#f97316' }: { label: string; value: number; color?: string }) => (
  <div style={{ marginBottom: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
      <span style={{ fontSize: 10, color: '#9ca3af' }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: '#e2e8f0' }}>{value.toFixed(1)}</span>
    </div>
    <div style={{ height: 4, background: '#374151', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(value / 10) * 100}%`, background: color, borderRadius: 2 }} />
    </div>
  </div>
)

export default function SitePanel({ site, zipInfo, searchedZip, onClose }: Props) {
  if (!site && !zipInfo && !searchedZip) return null

  return (
    <div style={{
      position: 'absolute', right: 16, top: 80,
      width: 280, maxHeight: 'calc(100vh - 120px)',
      background: 'rgba(17,24,39,0.97)', backdropFilter: 'blur(12px)',
      borderRadius: 12, border: '1px solid #374151', overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', flexDirection: 'column'
    }}>
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid #374151',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {site ? 'Site Detail' : 'Area Analysis'}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: 14 }}>
        {site ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{site.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <MapPin size={12} color="#9ca3af" />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{site.city}, {site.state}</span>
              </div>
              <PriorityBadge p={site.priority} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: '8px', background: '#111827', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>Owner</div>
                <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>{site.owner}</div>
              </div>
              <div style={{ padding: '8px', background: '#111827', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>ISO / RTO</div>
                <div style={{ fontSize: 12, color: '#93c5fd', fontWeight: 500 }}>{site.iso || 'N/A'}</div>
              </div>
            </div>

            {(site.ntt || site.equinix || site.vantage) && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>DC Tenant Interest</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {site.ntt && <span style={{ padding: '2px 8px', background: '#1e3a5f', color: '#93c5fd', borderRadius: 12, fontSize: 10 }}>NTT</span>}
                  {site.equinix && <span style={{ padding: '2px 8px', background: '#1e3a5f', color: '#93c5fd', borderRadius: 12, fontSize: 10 }}>Equinix</span>}
                  {site.vantage && <span style={{ padding: '2px 8px', background: '#1e3a5f', color: '#93c5fd', borderRadius: 12, fontSize: 10 }}>Vantage</span>}
                </div>
              </div>
            )}

            {site.mdScore && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MD Ranking Score</div>
                <div style={{ padding: 10, background: '#111827', borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#f97316' }}>{site.mdScore.total.toFixed(1)}<span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>/10</span></div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Confidence: {Math.round(site.mdScore.confidence * 100)}%</div>
                </div>
                <ScoreBar label="Site Location" value={site.mdScore.siteLocation} color="#8b5cf6" />
                <ScoreBar label="Market Opportunity" value={site.mdScore.marketOpportunity} color="#3b82f6" />
                <ScoreBar label="Infrastructure" value={site.mdScore.infrastructure} color="#10b981" />
                <ScoreBar label="Site Characteristics" value={site.mdScore.siteCharacteristics} color="#f59e0b" />
                <ScoreBar label="Workforce" value={site.mdScore.workforce} color="#06b6d4" />
                <ScoreBar label="Risk Management" value={site.mdScore.riskManagement} color="#ef4444" />
              </div>
            )}

            {site.nextSteps && (
              <div style={{ padding: 10, background: '#422006', border: '1px solid #92400e', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#fbbf24', marginBottom: 3, fontWeight: 600 }}>Next Steps</div>
                <div style={{ fontSize: 11, color: '#fde68a' }}>{site.nextSteps}</div>
              </div>
            )}
            {site.notes && (
              <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.5 }}>{site.notes}</div>
            )}
          </>
        ) : zipInfo || searchedZip ? (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 12 }}>ZIP: {searchedZip}</div>

            {zipInfo?.electricityPrice !== undefined && (
              <div style={{ padding: '10px 12px', background: '#111827', borderRadius: 8, marginBottom: 8, border: '1px solid #374151' }}>
                <div style={{ fontSize: 10, color: '#fbbf24', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  \u26a1 Avg Retail Electricity Price
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <div style={{
                    fontSize: 22, fontWeight: 800,
                    color: zipInfo.electricityPrice < 11 ? '#22c55e'
                      : zipInfo.electricityPrice < 16 ? '#fbbf24'
                      : zipInfo.electricityPrice < 22 ? '#f97316' : '#ef4444'
                  }}>
                    {zipInfo.electricityPrice.toFixed(1)}\u00a2
                  </div>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>/ kWh</div>
                </div>
                <div style={{
                  fontSize: 11, marginTop: 4,
                  color: zipInfo.electricityPrice < 11 ? '#22c55e'
                    : zipInfo.electricityPrice < 16 ? '#d1d5db'
                    : '#f97316'
                }}>
                  {zipInfo.electricityPrice < 11
                    ? '\u2713 Below US avg \u2014 cost-competitive'
                    : zipInfo.electricityPrice < 16
                    ? '\u007e Near US avg (13.3\u00a2/kWh)'
                    : zipInfo.electricityPrice < 22
                    ? '\u2191 Above avg \u2014 SMR value case strong'
                    : '\u26a0 High-cost market \u2014 SMR highly valuable'}
                </div>
                <div style={{ fontSize: 10, color: '#4b5563', marginTop: 3 }}>EIA state average \u2014 2023</div>
              </div>
            )}

            {zipInfo?.income && (
              <div style={{ padding: '10px 12px', background: '#111827', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>Median Household Income</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>${zipInfo.income.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>2022 ACS 5-Year Estimate</div>
              </div>
            )}
            {zipInfo?.unemployment !== undefined && (
              <div style={{ padding: '10px 12px', background: '#111827', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>County Unemployment Rate</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{zipInfo.unemployment?.toFixed(1)}%</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>2022 ACS 5-Year Estimate</div>
              </div>
            )}
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>
              Toggle Income, Unemployment, or Electricity Price layers to see area data.
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
