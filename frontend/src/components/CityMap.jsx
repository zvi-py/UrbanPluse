import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'

const BELAGAVI_CENTER = [15.8497, 74.4977]

// Coordinates lookup for known traffic locations in Belagavi
const TRAFFIC_COORDS = {
  'Belagavi City Center': [15.8497, 74.4977],
  'College Road': [15.8620, 74.5080],
  'Market Area': [15.8540, 74.5160],
  'NH48 Bypass': [15.8820, 74.5420],
}

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

// Custom Leaflet DivIcon for Traffic Incident Radar Hotspot
const createTrafficIcon = (level, incident) => {
  const isCritical = level === 'high' || incident === 'accident'
  const isWarning = level === 'moderate' || incident === 'roadwork'
  const colorClass = isCritical ? 'traffic-radar-critical' : isWarning ? 'traffic-radar-warning' : 'traffic-radar-ok'

  return L.divIcon({
    className: 'traffic-radar-container',
    html: `
      <div class="traffic-pulse-ring ${colorClass}"></div>
      <div class="traffic-dot ${colorClass}"></div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

export default function CityMap({ events = [], trafficData = null, theme = 'dark', embedded = false }) {
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'events' | 'traffic' | 'high'

  const validEvents = (Array.isArray(events) ? events : events?.events || [])
    .filter((e) => typeof e?.lat === 'number' && typeof e?.lng === 'number')

  const displayEvents =
    filterMode === 'traffic'
      ? []
      : filterMode === 'high'
      ? validEvents.filter((e) => e.high_attendance || (e.expected_attendance && e.expected_attendance >= 1000))
      : validEvents

  // Extract traffic corridor observations
  const trafficLocations = (trafficData?.locations || [
    { location: 'Belagavi City Center', congestion_score: 0.55, congestion_level: 'moderate', incident: 'none' },
    { location: 'College Road', congestion_score: 0.60, congestion_level: 'moderate', incident: 'roadwork' },
    { location: 'Market Area', congestion_score: 0.85, congestion_level: 'high', incident: 'accident' },
    { location: 'NH48 Bypass', congestion_score: 0.30, congestion_level: 'low', incident: 'none' },
  ]).map((loc) => ({
    ...loc,
    coords: TRAFFIC_COORDS[loc.location] || [15.8497, 74.4977],
  }))

  const displayTraffic = filterMode === 'events' || filterMode === 'high' ? [] : trafficLocations

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
        padding: embedded ? '8px 0 24px' : '36px 28px',
        borderTop: embedded ? 'none' : '1px solid var(--border-hairline)',
        position: 'relative',
        width: '100%',
      }}
    >
      {!embedded && <div className="crosshair-corner" style={{ position: 'absolute', top: 0, left: '28px', right: '28px' }} />}

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
            Spatial Distribution of <em>Urban Events & Traffic</em>
          </h2>
        </div>

        {/* Controls & Layer Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="editorial-label" style={{ fontSize: '10px' }}>
            LAYERS:
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
              fontWeight: 600,
              transition: 'all var(--transition-fast)',
            }}
          >
            All Corridors ({validEvents.length + trafficLocations.length})
          </button>

          <button
            onClick={() => setFilterMode('events')}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${filterMode === 'events' ? 'var(--accent)' : 'var(--border-hairline)'}`,
              background: filterMode === 'events' ? 'var(--accent)' : 'var(--bg-glass)',
              color: filterMode === 'events' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all var(--transition-fast)',
            }}
          >
            Events ({validEvents.length})
          </button>

          <button
            onClick={() => setFilterMode('traffic')}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${filterMode === 'traffic' ? 'var(--accent)' : 'var(--border-hairline)'}`,
              background: filterMode === 'traffic' ? 'var(--accent)' : 'var(--bg-glass)',
              color: filterMode === 'traffic' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all var(--transition-fast)',
            }}
          >
            Traffic Congestion ({trafficLocations.length})
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
              color: filterMode === 'high' ? '#12100E' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all var(--transition-fast)',
            }}
          >
            High Attendance
          </button>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div
        style={{
          width: '100%',
          height: '540px',
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

          {/* Render Traffic Corridor Congestion Radars */}
          {displayTraffic.map((loc) => {
            const icon = createTrafficIcon(loc.congestion_level, loc.incident)
            const isAccident = loc.incident === 'accident'
            const isRoadwork = loc.incident === 'roadwork'

            return (
              <Marker key={`traffic-${loc.location}`} position={loc.coords} icon={icon}>
                <Popup className="urban-glass-popup">
                  <div style={{ padding: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '9.5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: isAccident ? '#DC2626' : isRoadwork ? '#D97706' : '#16A34A',
                          fontWeight: 700,
                        }}
                      >
                        TRAFFIC CORRIDOR // {loc.congestion_level.toUpperCase()}
                      </span>
                      {loc.incident !== 'none' && (
                        <span style={{ fontSize: '9px', color: '#EF4444', fontWeight: 700, textTransform: 'uppercase' }}>
                          {loc.incident}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                      {loc.location}
                    </h4>

                    <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                      Congestion Index: <strong>{(loc.congestion_score * 100).toFixed(0)}/100</strong>
                    </p>

                    {isAccident && (
                      <div style={{ fontSize: '11px', color: '#EF4444', padding: '4px 6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', marginBottom: '4px' }}>
                        Accident reported near corridor. Rerouting advised via NH48 Bypass.
                      </div>
                    )}
                    {isRoadwork && (
                      <div style={{ fontSize: '11px', color: '#F59E0B', padding: '4px 6px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '4px', marginBottom: '4px' }}>
                        Roadwork maintenance active. Minor lane restriction.
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Render Gatherings & Campus Event Markers */}
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
                      {ev.expected_attendance && <span>~{ev.expected_attendance} attendees</span>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Map Styles for Markers, Traffic Radars & Popups */}
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

        /* Traffic Pulsing Radars */
        .traffic-radar-container {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .traffic-pulse-ring {
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          animation: trafficPulse 2s infinite ease-out;
        }

        .traffic-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          z-index: 2;
        }

        .traffic-radar-critical.traffic-pulse-ring {
          border: 1.5px solid rgba(220, 38, 38, 0.6);
          background: rgba(220, 38, 38, 0.15);
        }
        .traffic-radar-critical.traffic-dot {
          background: #DC2626;
          border: 1.5px solid #FFFFFF;
        }

        .traffic-radar-warning.traffic-pulse-ring {
          border: 1.5px solid rgba(217, 119, 6, 0.6);
          background: rgba(217, 119, 6, 0.15);
        }
        .traffic-radar-warning.traffic-dot {
          background: #D97706;
          border: 1.5px solid #FFFFFF;
        }

        .traffic-radar-ok.traffic-pulse-ring {
          border: 1.5px solid rgba(22, 163, 74, 0.6);
          background: rgba(22, 163, 74, 0.15);
        }
        .traffic-radar-ok.traffic-dot {
          background: #16A34A;
          border: 1.5px solid #FFFFFF;
        }

        @keyframes trafficPulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
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
