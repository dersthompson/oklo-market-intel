'use client'
import { useState } from 'react'
import { Search, X, Loader } from 'lucide-react'

interface Props {
  onResult: (data: { lat: number; lng: number; zip: string; fips?: string; state?: string } | null) => void
}

export default function ZipSearch({ onResult }: Props) {
  const [zip, setZip] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!/^\d{5}$/.test(zip)) { setError('Enter a valid 5-digit ZIP code'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/zip-lookup?zip=${zip}`)
      const data = await res.json()
      if (data.error) { setError(data.error); onResult(null) }
      else { onResult(data) }
    } catch { setError('Lookup failed') }
    finally { setLoading(false) }
  }

  const clear = () => { setZip(''); setError(''); onResult(null) }

  return (
    <div style={{
      position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)',
        border: '1px solid #374151', borderRadius: 40,
        padding: '8px 8px 8px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <Search size={14} color="#9ca3af" />
        <input
          type="text"
          placeholder="Enter ZIP code for area analysis..."
          value={zip}
          onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#e2e8f0', fontSize: 13, width: 220,
          }}
        />
        {zip && (
          <button onClick={clear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0 4px' }}>
            <X size={14} />
          </button>
        )}
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            background: '#f97316', border: 'none', borderRadius: 32,
            padding: '6px 16px', color: '#fff', fontSize: 12, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          {loading ? <Loader size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
          Analyze
        </button>
      </div>
      {error && (
        <div style={{ fontSize: 11, color: '#ef4444', background: 'rgba(17,24,39,0.9)', padding: '4px 12px', borderRadius: 20 }}>{error}</div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
