'use client'
import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import LayerPanel from '@/components/LayerPanel'
import ZipSearch from '@/components/ZipSearch'
import SitePanel from '@/components/SitePanel'
import UtilityTab from '@/components/UtilityTab'
import type { OkloSite } from '@/lib/types'
import { ISO_COLORS } from '@/lib/types'
import { Map, Building2, RefreshCw, Atom } from 'lucide-react'

const MapExplorer = dynamic(() => import('@/components/MapExplorer'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a1a', flexDirection: 'column', gap: 16
    }}>
      <div style={{ width: 40, height: 40, border: '3px solid #374151', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#6b7280', fontSize: 14 }}>Loading map...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
})

type Tab = 'map' | 'utilities'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('map')
  const [activeLayers, setActiveLayers] = useState<string[]>(['sites', 'iso'])
  const [loadingLayers, setLoadingLayers] = useState<string[]>([])
  const [selectedSite, setSelectedSite] = useState<OkloSite | null>(null)
  const [searchedZip, setSearchedZip] = useState<{ lat: number; lng: number; zip: string; fips?: string } | null>(null)
  const [zipInfo, setZipInfo] = useState<{ income?: number; unemployment?: number; iso?: string; electricityPrice?: number } | null>(null)

  const toggleLayer = useCallback((id: string) => {
    setActiveLayers(prev => {
      const next = prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
      if (!prev.includes(id)) {
        setLoadingLayers(l => [...l, id])
        setTimeout(() => setLoadingLayers(l => l.filter(x => x !== id)), 3000)
      }
      return next
    })
  }, [])

  const handleSiteSelect = useCallback((site: OkloSite | null) => {
    setSelectedSite(site)
    setSearchedZip(null)
    setZipInfo(null)
  }, [])

  const handleZipResult = useCallback((data: any) => {
    if (!data) { setSearchedZip(null); setZipInfo(null); return }
    setSearchedZip(data)
    setSelectedSite(null)
    setZipInfo(null)
  }, [])

  const handleZipInfo = useCallback((info: any) => setZipInfo(info), [])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a1a', overflow: 'hidden' }}>
      {/* Top Nav */}
      <header style={{
        height: 56, background: '#111827', borderBottom: '1px solid #1f2937',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 20,
        flexShrink: 0, zIndex: 1100, position: 'relative'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Atom size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', lineHeight: 1 }}>Oklo</div>
            <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1, marginTop: 1 }}>Market Intelligence</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#1f2937', borderRadius: 10, padding: 4 }}>
          {([
            { id: 'map', label: 'Map Explorer', icon: Map },
            { id: 'utilities', label: 'Utility Companies', icon: Building2 },
          ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: activeTab === id ? '#374151' : 'transparent',
              color: activeTab === id ? '#e2e8f0' : '#9ca3af',
              fontSize: 13, fontWeight: activeTab === id ? 600 : 400, transition: 'all 0.15s'
            }}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ISO legend (map only) */}
        {activeTab === 'map' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: '#6b7280', marginRight: 4 }}>ISOs:</span>
            {Object.entries(ISO_COLORS).filter(([k]) => k !== 'Non-ISO').map(([iso, color]) => (
              <div key={iso} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span style={{ fontSize: 10, color: '#9ca3af' }}>{iso}</span>
              </div>
            ))}
          </div>
        )}

        {/* Site count badge */}
        {activeTab === 'map' && (
          <div style={{
            padding: '4px 10px', background: '#f9731620', border: '1px solid #f9731640',
            borderRadius: 8, fontSize: 11, color: '#f97316', fontWeight: 600, flexShrink: 0
          }}>
            26 Sites
          </div>
        )}
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* MAP TAB */}
        <div style={{ display: activeTab === 'map' ? 'block' : 'none', position: 'absolute', inset: 0 }}>
          <MapExplorer
            activeLayers={activeLayers}
            searchedZip={searchedZip}
            onSiteSelect={handleSiteSelect}
            onZipInfo={handleZipInfo}
          />
          <LayerPanel activeLayers={activeLayers} onToggle={toggleLayer} loading={loadingLayers} />
          <ZipSearch onResult={handleZipResult} />
          {(selectedSite || zipInfo || searchedZip) && (
            <SitePanel
              site={selectedSite}
              zipInfo={zipInfo}
              searchedZip={searchedZip?.zip || null}
              onClose={() => { setSelectedSite(null); setZipInfo(null); setSearchedZip(null) }}
            />
          )}

          {/* Map instructions */}
          {!selectedSite && !searchedZip && (
            <div style={{
              position: 'absolute', top: 80, right: 16, zIndex: 999,
              background: 'rgba(17,24,39,0.9)', borderRadius: 10,
              border: '1px solid #374151', padding: '10px 14px', maxWidth: 200
            }}>
              <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>Quick Start</div>
                • Toggle layers on the left<br />
                • Click any orange pin to view site details<br />
                • Enter a ZIP code below to analyze any US area
              </div>
            </div>
          )}
        </div>

        {/* UTILITIES TAB */}
        <div style={{ display: activeTab === 'utilities' ? 'block' : 'none', position: 'absolute', inset: 0, overflowY: 'auto' }}>
          <UtilityTab />
        </div>
      </div>
    </div>
  )
}
