import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

const BELAGAVI_CENTER = [15.8497, 74.4977]

// Coordinates lookup for real Belagavi traffic corridors
const TRAFFIC_COORDS = {
  'Congress Road (Tilakwadi)': [15.8385, 74.5050],
  'Khanapur Road (Udyambag)': [15.8280, 74.4920],
  'Rani Channamma Circle (RCC)': [15.8570, 74.5080],
  'Market Area (Khade Bazar)': [15.8540, 74.5160],
  'College Road (BIMS)': [15.8620, 74.5080],
  'CBT to Railway Station': [15.8640, 74.5120],
  'Camp Area (Club Road)': [15.8510, 74.4920],
  'Hindalga Military Road': [15.8680, 74.4810],
  'NH48 Bypass Corridor': [15.8820, 74.5420],
  'Shahapur Bazaar Corridor': [15.8320, 74.5180],
  'VTU Machhe University Road': [15.8950, 74.4550],
  'Sambra Airport Road': [15.8600, 74.5800],
  // Legacy aliases
  'Belagavi City Center': [15.8497, 74.4977],
  'College Road': [15.8620, 74.5080],
  'Market Area': [15.8540, 74.5160],
  'NH48 Bypass': [15.8820, 74.5420],
}

// Helper to ensure Leaflet recalculates dimensions immediately
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const timer1 = setTimeout(() => map.invalidateSize(), 150)
    const timer2 = setTimeout(() => map.invalidateSize(), 500)
    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      window.removeEventListener('resize', onResize)
    }
  }, [map])
  return null
}

// Executive Event Pin Icon (STRAWBERRY #F9D1D9 / WINE #930400 for high attendance)
const createEventIcon = (isHigh, isLight) => {
  const mainColor = isHigh ? '#930400' : '#9A243F'
  const ringColor = isHigh ? 'rgba(147, 4, 0, 0.25)' : '#F9D1D9'

  return L.divIcon({
    className: 'urban-event-marker',
    html: `
      <div style="
        position: relative;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${ringColor};
          border: 1.5px solid ${mainColor};
        "></div>
        <div style="
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background-color: ${mainColor};
          z-index: 2;
        "></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  })
}

// Executive Traffic Radar Icon (WINE #930400 / MATCHA #838F58)
const createTrafficIcon = (level, incident) => {
  const isCritical = level === 'high' || incident === 'accident'
  const isWarning = level === 'moderate' || incident === 'roadwork'
  const color = isCritical ? '#930400' : isWarning ? '#930400' : '#838F58'
  const ringBg = isCritical
    ? 'rgba(147, 4, 0, 0.22)'
    : isWarning
    ? 'rgba(147, 4, 0, 0.15)'
    : 'rgba(131, 143, 88, 0.2)'

  return L.divIcon({
    className: 'urban-traffic-marker',
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div class="traffic-pulse-ring" style="
          position: absolute;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: ${ringBg};
          border: 1.5px solid ${color};
        "></div>
        <div style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: ${color};
          border: 1.5px solid #FFFFFF;
          z-index: 2;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

export default function CityMap({
  events = [],
  trafficData = null,
  theme = 'dark',
  embedded = false,
  onOpenGeminiModal = null,
  onOpenHostModal = null,
}) {
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'events' | 'traffic' | 'high'

  const validEvents = (Array.isArray(events) ? events : events?.events || [])
    .filter((e) => typeof e?.lat === 'number' && typeof e?.lng === 'number')

  const displayEvents =
    filterMode === 'traffic'
      ? []
      : filterMode === 'high'
      ? validEvents.filter((e) => e.high_attendance || (e.expected_attendance && e.expected_attendance >= 1000))
      : validEvents

  // Extract all 12 Belagavi traffic corridor observations
  const defaultTrafficLocs = [
    { location: 'Congress Road (Tilakwadi)', congestion_score: 0.65, congestion_level: 'moderate', incident: 'none' },
    { location: 'Khanapur Road (Udyambag)', congestion_score: 0.78, congestion_level: 'high', incident: 'none' },
    { location: 'Rani Channamma Circle (RCC)', congestion_score: 0.58, congestion_level: 'moderate', incident: 'none' },
    { location: 'Market Area (Khade Bazar)', congestion_score: 0.85, congestion_level: 'high', incident: 'accident' },
    { location: 'College Road (BIMS)', congestion_score: 0.62, congestion_level: 'moderate', incident: 'roadwork' },
    { location: 'CBT to Railway Station', congestion_score: 0.55, congestion_level: 'moderate', incident: 'none' },
    { location: 'Camp Area (Club Road)', congestion_score: 0.28, congestion_level: 'low', incident: 'none' },
    { location: 'Hindalga Military Road', congestion_score: 0.25, congestion_level: 'low', incident: 'none' },
    { location: 'NH48 Bypass Corridor', congestion_score: 0.30, congestion_level: 'low', incident: 'none' },
    { location: 'Shahapur Bazaar Corridor', congestion_score: 0.60, congestion_level: 'moderate', incident: 'none' },
    { location: 'VTU Machhe University Road', congestion_score: 0.32, congestion_level: 'low', incident: 'none' },
    { location: 'Sambra Airport Road', congestion_score: 0.20, congestion_level: 'low', incident: 'none' },
  ]

  const trafficLocations = ((trafficData?.locations && trafficData.locations.length > 0)
    ? trafficData.locations
    : defaultTrafficLocs
  ).map((loc) => ({
    ...loc,
    coords: TRAFFIC_COORDS[loc.location] || [15.8497, 74.4977],
  }))

  const displayTraffic = filterMode === 'events' || filterMode === 'high' ? [] : trafficLocations

  const isLight = theme === 'light'
  // Use rock-solid CartoDB Voyager for light mode (clean, detailed, zero rate limits) and Dark Matter for dark mode
  const tileUrl = isLight
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

  return (
    <section
      id="city-map"
      style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: embedded ? '8px 0 24px' : '28px 24px',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '16px', height: '2px', backgroundColor: 'var(--accent)' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent)',
            }}>
              URBAN CARTOGRAPHY · BELAGAVI CARTOGRAPHIC ATLAS
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.7rem)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            margin: '0 0 4px 0',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
          }}>
            Spatial Distribution of <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>Urban Events & Traffic</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Live geospatial mesh correlating arterial delays, campus fests, student guild hubs, and municipal ward vitals.
          </p>
        </div>

        {/* Action Controls & Layer Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          {(onOpenGeminiModal || onOpenHostModal) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {onOpenGeminiModal && (
                <button
                  onClick={onOpenGeminiModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--agent-gemini-bg)',
                    border: '1px solid var(--agent-gemini-border)',
                    color: 'var(--agent-gemini)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>Gemini AI Briefing</span>
                </button>
              )}
              {onOpenHostModal && (
                <button
                  onClick={onOpenHostModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--accent)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(147, 4, 0, 0.22)',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <span>+ Host Gathering</span>
                </button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: 'var(--text-dim)',
              letterSpacing: '0.06em',
            }}>
              LAYERS:
            </span>

            <button
              onClick={() => setFilterMode('all')}
              style={{
                fontSize: '11.5px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${filterMode === 'all' ? 'var(--accent)' : 'var(--border-hairline)'}`,
                background: filterMode === 'all' ? 'var(--accent)' : 'var(--bg-surface)',
                color: filterMode === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              All Corridors ({validEvents.length + trafficLocations.length})
            </button>

            <button
              onClick={() => setFilterMode('events')}
              style={{
                fontSize: '11.5px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${filterMode === 'events' ? 'var(--agent-events)' : 'var(--border-hairline)'}`,
                background: filterMode === 'events' ? 'var(--agent-events-strawberry)' : 'var(--bg-surface)',
                color: filterMode === 'events' ? 'var(--agent-events)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              Campus Gatherings ({validEvents.length})
            </button>

            <button
              onClick={() => setFilterMode('traffic')}
              style={{
                fontSize: '11.5px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${filterMode === 'traffic' ? 'var(--agent-traffic)' : 'var(--border-hairline)'}`,
                background: filterMode === 'traffic' ? 'var(--agent-traffic-bg)' : 'var(--bg-surface)',
                color: filterMode === 'traffic' ? 'var(--agent-traffic)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              Traffic Corridors ({trafficLocations.length})
            </button>

            <button
              onClick={() => setFilterMode('high')}
              style={{
                fontSize: '11.5px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${filterMode === 'high' ? 'var(--agent-traffic)' : 'var(--border-hairline)'}`,
                background: filterMode === 'high' ? '#FFF7E6' : 'var(--bg-surface)',
                color: filterMode === 'high' ? 'var(--agent-traffic)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              High Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div
        style={{
          width: '100%',
          height: '520px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: `1px solid ${isLight ? '#E2E8F0' : '#1E293B'}`,
          backgroundColor: isLight ? '#FFFFFF' : '#090D16',
          position: 'relative',
        }}
      >
        <MapContainer
          key={`${theme}-${tileUrl}`}
          center={BELAGAVI_CENTER}
          zoom={13}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', backgroundColor: isLight ? '#FFFFFF' : '#090D16' }}
        >
          <MapResizer />

          {/* CartoDB Voyager (Light) or Dark Matter (Dark) */}
          <TileLayer
            key={tileUrl}
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={tileUrl}
            subdomains="abcd"
            maxZoom={19}
          />

          {/* Render Traffic Corridor Congestion Radars */}
          {displayTraffic.map((loc) => {
            const icon = createTrafficIcon(loc.congestion_level, loc.incident)
            const isAccident = loc.incident === 'accident'
            const isRoadwork = loc.incident === 'roadwork'
            const pct = Math.round((loc.congestion_score || 0) * 100)

            return (
              <Marker key={`traffic-${loc.location}`} position={loc.coords} icon={icon}>
                <Popup className="urban-glass-popup">
                  <div style={{ padding: '8px 6px', minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '9.5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: isAccident ? 'var(--agent-traffic)' : isRoadwork ? 'var(--agent-events)' : 'var(--agent-env)',
                          fontWeight: 700,
                        }}
                      >
                        TRAFFIC CORRIDOR · {loc.congestion_level?.toUpperCase()}
                      </span>
                      {loc.incident !== 'none' && (
                        <span style={{
                          fontSize: '9px',
                          color: 'var(--agent-traffic)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: 'var(--agent-traffic-bg)',
                          padding: '2px 5px',
                          borderRadius: '4px',
                        }}>
                          {loc.incident}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: isLight ? 'var(--text-primary)' : '#F8FAFC' }}>
                      {loc.location}
                    </h4>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      fontSize: '12px',
                      color: isLight ? 'var(--text-secondary)' : '#94A3B8',
                    }}>
                      <span>Congestion Delay:</span>
                      <strong style={{
                        color: pct >= 70 ? 'var(--agent-traffic)' : pct >= 50 ? 'var(--agent-events)' : 'var(--agent-env)',
                        fontWeight: 700,
                      }}>
                        {pct}%
                      </strong>
                    </div>

                    {isAccident && (
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--agent-traffic)',
                        backgroundColor: 'var(--agent-traffic-bg)',
                        border: '1px solid var(--agent-traffic-border)',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        lineHeight: 1.35,
                      }}>
                        Obstruction reported. Recommended reroute via Club Road or NH48 Bypass.
                      </div>
                    )}
                    {isRoadwork && (
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--agent-events)',
                        backgroundColor: 'var(--agent-events-bg)',
                        border: '1px solid var(--agent-events-border)',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        lineHeight: 1.35,
                      }}>
                        PWD roadwork active. Single-lane constriction in effect.
                      </div>
                    )}
                    {!isAccident && !isRoadwork && (
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--agent-env)',
                        backgroundColor: 'var(--agent-env-bg)',
                        border: '1px solid var(--agent-env-border)',
                        padding: '4px 6px',
                        borderRadius: '4px',
                      }}>
                        Arterial flow normal. No major bottleneck.
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Render Campus Gatherings & Civic Events */}
          {displayEvents.map((ev) => {
            const isHigh = ev.high_attendance || (ev.expected_attendance && ev.expected_attendance >= 1000)
            const icon = createEventIcon(isHigh, isLight)

            return (
              <Marker
                key={ev.event_id || `${ev.lat}-${ev.lng}`}
                position={[ev.lat, ev.lng]}
                icon={icon}
              >
                <Popup className="urban-glass-popup">
                  <div style={{ padding: '8px 6px', minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '9.5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: isHigh ? 'var(--agent-traffic)' : 'var(--agent-events)',
                          fontWeight: 700,
                        }}
                      >
                        {ev.category?.replace('_', ' ') || 'GATHERING'}
                      </span>
                      {isHigh && (
                        <span style={{
                          fontSize: '9px',
                          color: 'var(--agent-traffic)',
                          background: '#FFF7E6',
                          border: '1px solid var(--agent-traffic-border)',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}>
                          HIGH ATTENDANCE
                        </span>
                      )}
                    </div>

                    <h4
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: isLight ? 'var(--text-primary)' : '#F8FAFC',
                        marginBottom: '4px',
                        lineHeight: 1.3,
                      }}
                    >
                      {ev.title}
                    </h4>

                    <p style={{
                      fontSize: '12px',
                      color: isLight ? '#475569' : '#94A3B8',
                      margin: '0 0 6px 0',
                      lineHeight: 1.4,
                    }}>
                      📍 {ev.venue || 'Belagavi Central Sector'}
                    </p>

                    {ev.description && (
                      <p style={{
                        fontSize: '11.5px',
                        color: isLight ? '#64748B' : '#94A3B8',
                        margin: '0 0 8px 0',
                        lineHeight: 1.35,
                      }}>
                        {ev.description.slice(0, 120)}...
                      </p>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: isLight ? '#64748B' : '#94A3B8',
                      paddingTop: '6px',
                      borderTop: `1px solid ${isLight ? '#E2E8F0' : '#1E293B'}`,
                    }}>
                      <span>{ev.distance_km ? `${ev.distance_km} km away` : 'Belagavi Sector'}</span>
                      {ev.expected_attendance && <span>~{ev.expected_attendance} expected</span>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>

        {/* Executive Map Legend Floating Bar with Exact Palette */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            zIndex: 1000,
            backgroundColor: 'var(--bg-surface)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-pill)',
            padding: '7px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#F9D1D9', border: '1px solid #9A243F' }} />
            <span>Campus Event (STRAWBERRY)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#930400' }} />
            <span>High Attendance / Delay (WINE)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#838F58' }} />
            <span>Nominal Flow (MATCHA)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#95BAEB' }} />
            <span>Student Clusters (HEAVENLY)</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes trafficPulse {
          0% { transform: scale(0.7); opacity: 0.9; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .traffic-pulse-ring {
          animation: trafficPulse 2s infinite ease-out;
        }
        .leaflet-popup-content-wrapper {
          background: var(--bg-surface) !important;
          border: 1px solid var(--border-hairline) !important;
          border-radius: 12px !important;
          box-shadow: var(--shadow-glass) !important;
          color: var(--text-primary) !important;
        }
        .leaflet-popup-tip {
          background: var(--bg-surface) !important;
          border: 1px solid var(--border-hairline) !important;
        }
      `}</style>
    </section>
  )
}
