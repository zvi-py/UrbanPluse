import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

const BELAGAVI_CENTER = [15.8497, 74.4977]

// Helper to ensure Leaflet recalculates dimensions immediately
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

// Custom Leaflet DivIcon for Champagne Circular Marker
const createChampagneIcon = (isHigh) => {
  return L.divIcon({
    className: 'urban-map-marker-container',
    html: `
      <div class="marker-halo ${isHigh ? 'marker-halo-high' : ''}"></div>
      <div class="marker-core ${isHigh ? 'marker-core-high' : ''}"></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  })
}

export default function CityMap({ events = [], theme = 'dark' }) {
  const [filterMode, setFilterMode] = useState('all')

  const validEvents = (Array.isArray(events) ? events : events?.events || [])
    .filter((e) => typeof e?.lat === 'number' && typeof e?.lng === 'number')

  const displayEvents = filterMode === 'high'
    ? validEvents.filter((e) => e.high_attendance || (e.expected_attendance && e.expected_attendance >= 1000))
    : validEvents

  const isLight = theme === 'light'
  const tileUrl = isLight
    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

  return (
    <section
      id="city-map"
      style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '80px 28px',
        borderTop: '1px solid var(--border-hairline)',
        position: 'relative',
      }}
    >
      <div className="crosshair-corner" style={{ position: 'absolute', top: 0, left: '28px', right: '28px' }} />

      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ width: '20px', height: '1px', backgroundColor: 'var(--accent)' }} />
            <span className="editorial-label">
              URBAN CARTOGRAPHY // BELAGAVI CARTOGRAPHIC ATLAS
            </span>
          </div>

          <h2 className="display-title" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}>
            Spatial Distribution of <em>Urban Events</em>
          </h2>
        </div>

        {/* Controls & Layer Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="editorial-label" style={{ fontSize: '10px' }}>
            VIEW MODE:
          </span>
          <button
            onClick={() => setFilterMode('all')}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${filterMode === 'all' ? 'var(--accent)' : 'var(--border-hairline)'}`,
              background: filterMode === 'all' ? 'var(--accent)' : 'var(--bg-glass)',
              color: filterMode === 'all' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: filterMode === 'all' ? 600 : 500,
              transition: 'all var(--transition-fast)',
            }}
          >
            All Gathering Nodes ({validEvents.length})
          </button>
          <button
            onClick={() => setFilterMode('high')}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${filterMode === 'high' ? 'var(--status-warning)' : 'var(--border-hairline)'}`,
              background: filterMode === 'high' ? 'var(--status-warning)' : 'var(--bg-glass)',
              color: filterMode === 'high' ? '#FFFFFF' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: filterMode === 'high' ? 600 : 500,
              transition: 'all var(--transition-fast)',
            }}
          >
            High Attendance Only
          </button>
        </div>
      </div>

      {/* Leaflet Map Frame (Rounded 24px container with hairline border) */}
      <div
        style={{
          width: '100%',
          height: '520px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border-hairline)',
          boxShadow: 'var(--shadow-glass)',
          position: 'relative',
          backgroundColor: 'var(--map-bg)',
        }}
      >
        <MapContainer
          key={theme} /* Re-render tile container when theme changes for instant tile swap */
          center={BELAGAVI_CENTER}
          zoom={13}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', backgroundColor: 'var(--map-bg)' }}
        >
          <MapResizer />

          {/* CARTO Dark Matter or Positron tile layer */}
          <TileLayer
            key={tileUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={tileUrl}
            subdomains="abcd"
            maxZoom={19}
          />

          {displayEvents.map((ev) => {
            const isHigh = ev.high_attendance || (ev.expected_attendance && ev.expected_attendance >= 1000)
            const icon = createChampagneIcon(isHigh)

            return (
              <Marker
                key={ev.event_id || `${ev.lat}-${ev.lng}`}
                position={[ev.lat, ev.lng]}
                icon={icon}
              >
                <Popup className="urban-glass-popup">
                  <div style={{ padding: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '9.5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: isHigh ? 'var(--status-warning)' : 'var(--accent)',
                          fontWeight: 600,
                        }}
                      >
                        {ev.category?.replace('_', ' ') || 'EVENT'}
                      </span>
                      {isHigh && (
                        <span style={{ fontSize: '9px', color: 'var(--status-warning)', fontWeight: 600 }}>
                          HIGH ATTENDANCE
                        </span>
                      )}
                    </div>

                    <h4
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '17px',
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                        lineHeight: 1.2,
                      }}
                    >
                      {ev.title}
                    </h4>

                    <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                      {ev.venue || 'Belagavi Central Sector'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', paddingTop: '4px', borderTop: '1px solid var(--border-hairline)' }}>
                      <span>Distance: {ev.distance_km ? `${ev.distance_km} km` : 'Near center'}</span>
                      {ev.expected_attendance && <span>~{ev.expected_attendance} people</span>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Map Styles for Custom Champagne Glowing Markers & Popup */}
      <style>{`
        .urban-map-marker-container {
          position: relative;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .marker-halo {
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(184, 151, 122, 0.22);
          border: 1px solid rgba(184, 151, 122, 0.45);
          animation: pulseMarker 2.8s infinite ease-in-out;
          transition: transform var(--transition-fast);
        }

        .marker-halo-high {
          background: rgba(212, 168, 95, 0.26);
          border-color: rgba(212, 168, 95, 0.65);
          box-shadow: 0 0 14px rgba(212, 168, 95, 0.5);
        }

        .marker-core {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--accent);
          box-shadow: 0 0 8px var(--accent);
        }

        .marker-core-high {
          background-color: var(--status-warning);
          box-shadow: 0 0 10px var(--status-warning);
        }

        .urban-map-marker-container:hover .marker-halo {
          transform: scale(1.35);
          border-color: var(--accent-light);
        }

        @keyframes pulseMarker {
          0%, 100% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        /* Leaflet Dark/Light Glass Popup Customization */
        .leaflet-popup-content-wrapper {
          background: var(--bg-surface) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid var(--border-glass-bright) !important;
          border-radius: 14px !important;
          box-shadow: var(--shadow-glass) !important;
          color: var(--text-primary) !important;
        }

        .leaflet-popup-tip {
          background: var(--bg-surface) !important;
          border: 1px solid var(--border-glass-bright) !important;
        }

        .leaflet-container a.leaflet-popup-close-button {
          color: var(--text-dim) !important;
          padding: 6px 8px !important;
        }

        .leaflet-container a.leaflet-popup-close-button:hover {
          color: var(--text-primary) !important;
        }
      `}</style>
    </section>
  )
}
