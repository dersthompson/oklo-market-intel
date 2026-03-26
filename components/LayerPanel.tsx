'use client'
import { MAP_LAYERS } from '@/lib/types'
import { Layers, ChevronRight } from 'lucide-react'

interface Props {
  activeLayers: string[]
  onToggle: (id: string) => void
  loading: string[]
}

export default function LayerPanel({ activeLayers, onToggle, loading }: Props) {
  return (
    <div style={{
      position: 'absolute', left: 16, top: 80, zIndex: 1000,
      width: 220, background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)',
      borderRadius: 12, border: '1px solid #374151', overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
    }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #374151', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Layers size={14} color="#9ca3af" />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Map Layers</span>
      </div>

      <div style={{ padding: 8 }}>
        {MAP_LAYERS.map(layer => {
          const active = activeLayers.includes(layer.id)
          const isLoading = loading.includes(layer.id)
          return (
            <button
              key={layer.id}
              onClick={() => onToggle(layer.id)}
              className="layer-toggle"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: active ? `${layer.color}18` : 'transparent',
                transition: 'all 0.15s', marginBottom: 2, textAlign: 'left',
              }}
              title={layer.description}
            >
              <div style={{
                width: 32, height: 20, borderRadius: 10,
                background: active ? layer.color : '#374151',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: 2, left: active ? 14 : 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                }} />
              </div>
              <span style={{ fontSize: 11, marginRight: 'auto' }}>{layer.icon}</span>
              <span style={{
                fontSize: 12, color: active ? '#e2e8f0' : '#9ca3af',
                fontWeight: active ? 500 : 400, flex: 1
              }}>{layer.label}</span>
              {isLoading && (
                <div style={{
                  width: 12, height: 12, border: '2px solid #374151',
                  borderTopColor: layer.color, borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', flexShrink: 0
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #374151' }}>
        <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legend</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {activeLayers.includes('coal') && (
            <>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, marginBottom: 2 }}>Coal Plants</div>
              {[['#ef4444', 'Operating'], ['#f97316', 'Retiring'], ['#6b7280', 'Retired']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: 10, color: '#9ca3af' }}>{l}</span>
                </div>
              ))}
            </>
          )}
          {(activeLayers.includes('income') || activeLayers.includes('unemployment')) && (
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
              {activeLayers.includes('income') && <div style={{ marginBottom: 3 }}>Income: Dark blue = high income</div>}
              {activeLayers.includes('unemployment') && <div>Unemployment: Red = high rate</div>}
            </div>
          )}
          {activeLayers.includes('sites') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }} />
              <span style={{ fontSize: 10, color: '#9ca3af' }}>Oklo site (larger = higher priority)</span>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
