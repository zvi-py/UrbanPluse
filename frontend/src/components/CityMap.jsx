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

// Executive Event Pin Icon (Indigo / Amber for high attendance)
const createEventIcon = (isHigh, isLight) => {
  const mainColor = isHigh ? '#D97706' : isLight ? '#4F46E5' : '#818CF8'
  const ringColor = isHigh
    ? 'rgba(217, 119, 6, 0.25)'
    : isLight
    ? 'rgba(79, 70, 229, 0.2)'
    : 'rgba(129, 140, 248, 0.25)'

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

// Executive Traffic Radar Icon (Crimson / Amber / Emerald)
const createTrafficIcon = (level, incident) => {
  const isCritical = level === 'high' || incident === 'accident'
  const isWarning = level === 'moderate' || incident === 'roadwork'
  const color = isCritical ? '#DC2626' : isWarning ? '#D97706' : '#16A34A'
  const ringBg = isCritical
    ? 'rgba(220, 38, 38, 0.2)'
    : isWarning
    ? 'rgba(217, 119, 6, 0.2)'
    : 'rgba(22, 163, 74, 0.2)'

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
          alignItems: 'flex-end',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '16px', height: '2px', backgroundColor: isLight ? '#0F172A' : '#94A3B8' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: isLight ? '#475569' : '#94A3B8',
            }}>
              URBAN CARTOGRAPHY · BELAGAVI CARTOGRAPHIC ATLAS
            </span>
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: 0,
            color: isLight ? '#0F172A' : '#F8FAFC',
          }}>
            Spatial Distribution of Urban Events & Traffic
          </h2>
        </div>

        {/* Controls & Layer Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: isLight ? '#64748B' : '#94A3B8',
            letterSpacing: '0.06em',
          }}>
            LAYERS:
          </span>

          <button
            onClick={() => setFilterMode('all')}
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: `1px solid ${filterMode === 'all' ? (isLight ? '#0F172A' : '#FFFFFF') : (isLight ? '#CBD5E1' : '#334155')}`,
              background: filterMode === 'all' ? (isLight ? '#0F172A' : '#1E293B') : (isLight ? '#FFFFFF' : '#0B0F17'),
              color: filterMode === 'all' ? '#FFFFFF' : (isLight ? '#334155' : '#CBD5E1'),
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
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: `1px solid ${filterMode === 'events' ? (isLight ? '#0F172A' : '#FFFFFF') : (isLight ? '#CBD5E1' : '#334155')}`,
              background: filterMode === 'events' ? (isLight ? '#0F172A' : '#1E293B') : (isLight ? '#FFFFFF' : '#0B0F17'),
              color: filterMode === 'events' ? '#FFFFFF' : (isLight ? '#334155' : '#CBD5E1'),
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
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: `1px solid ${filterMode === 'traffic' ? (isLight ? '#0F172A' : '#FFFFFF') : (isLight ? '#CBD5E1' : '#334155')}`,
              background: filterMode === 'traffic' ? (isLight ? '#0F172A' : '#1E293B') : (isLight ? '#FFFFFF' : '#0B0F17'),
              color: filterMode === 'traffic' ? '#FFFFFF' : (isLight ? '#334155' : '#CBD5E1'),
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
              fontSize: '12px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: `1px solid ${filterMode === 'high' ? '#D97706' : (isLight ? '#CBD5E1' : '#334155')}`,
              background: filterMode === 'high' ? (isLight ? '#FEF3C7' : '#78350F') : (isLight ? '#FFFFFF' : '#0B0F17'),
              color: filterMode === 'high' ? (isLight ? '#92400E' : '#FDE68A') : (isLight ? '#334155' : '#CBD5E1'),
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.15s ease',
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
          height: '520px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: `1px solid ${isLight ? '#CBD5E1' : '#1E293B'}`,
          backgroundColor: isLight ? '#F1F5F9' : '#090D16',
          position: 'relative',
        }}
      >
        <MapContainer
          key={`${theme}-${tileUrl}`}
          center={BELAGAVI_CENTER}
          zoom={13}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', backgroundColor: isLight ? '#F8FAFC' : '#090D16' }}
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
                          color: isAccident ? '#DC2626' : isRoadwork ? '#D97706' : '#16A34A',
                          fontWeight: 700,
                        }}
                      >
                        TRAFFIC CORRIDOR · {loc.congestion_level?.toUpperCase()}
                      </span>
                      {loc.incident !== 'none' && (
                        <span style={{
                          fontSize: '9px',
                          color: '#DC2626',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: 'rgba(220, 38, 38, 0.1)',
                          padding: '2px 5px',
                          borderRadius: '4px',
                        }}>
                          {loc.incident}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: isLight ? '#0F172A' : '#F8FAFC' }}>
                      {loc.location}
                    </h4>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      fontSize: '12px',
                      color: isLight ? '#334155' : '#94A3B8',
                    }}>
                      <span>Congestion Delay:</span>
                      <strong style={{
                        color: pct >= 70 ? '#DC2626' : pct >= 50 ? '#D97706' : '#16A34A',
                        fontWeight: 700,
                      }}>
                        {pct}%
                      </strong>
                    </div>

                    {isAccident && (
                      <div style={{
                        fontSize: '11px',
                        color: '#991B1B',
                        backgroundColor: '#FEE2E2',
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
                        color: '#92400E',
                        backgroundColor: '#FEF3C7',
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
                        color: '#166534',
                        backgroundColor: '#DCFCE7',
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
                          color: isHigh ? '#D97706' : '#4F46E5',
                          fontWeight: 700,
                        }}
                      >
                        {ev.category?.replace('_', ' ') || 'GATHERING'}
                      </span>
                      {isHigh && (
                        <span style={{
                          fontSize: '9px',
                          color: '#92400E',
                          background: '#FEF3C7',
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
                        color: isLight ? '#0F172A' : '#F8FAFC',
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

        {/* Executive Map Legend Floating Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            zIndex: 1000,
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${isLight ? '#E2E8F0' : '#334155'}`,
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '11px',
            color: isLight ? '#334155' : '#CBD5E1',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4F46E5' }} />
            <span>Campus Event</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
            <span>High Attendance</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
            <span>Traffic Delay / Incident</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
            <span>Flowing Corridor</span>
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
          background: ${isLight ? '#FFFFFF' : '#0B0F17'} !important;
          border: 1px solid ${isLight ? '#E2E8F0' : '#1E293B'} !important;
          border-radius: 10px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
          color: ${isLight ? '#0F172A' : '#F8FAFC'} !important;
        }
        .leaflet-popup-tip {
          background: ${isLight ? '#FFFFFF' : '#0B0F17'} !important;
          border: 1px solid ${isLight ? '#E2E8F0' : '#1E293B'} !important;
        }
      `}</style>
    </section>
  )
}
