import React from 'react'
import CityMap from '../CityMap.jsx'
import { MapPin, Navigation, AlertCircle, PlusCircle } from 'lucide-react'

export default function CenterMapCard({ events = [], trafficData = null, theme = 'dark', onOpenHostModal }) {
  return (
    <div
      className="video-glass-card"
      style={{
        padding: '0',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
      }}
    >
      {/* Top Header of the Center Map Card */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(22, 31, 48, 0.95)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              color: '#06B6D4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Navigation size={15} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB' }}>
              Belagavi Arterial Corridors & Gatherings
            </div>
            <div style={{ fontSize: '10.5px', color: '#9CA3AF' }}>
              Real-time congestion radars & verified event locations
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenHostModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#10B981',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={13} />
            <span>Host Gathering</span>
          </button>
        </div>
      </div>

      {/* Embedded Map */}
      <div style={{ height: '420px', position: 'relative' }}>
        <CityMap
          events={events}
          trafficData={trafficData}
          theme={theme}
        />
      </div>
    </div>
  )
}
