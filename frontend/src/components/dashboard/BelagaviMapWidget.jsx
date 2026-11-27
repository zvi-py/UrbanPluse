import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, Plus, Layers, Filter } from 'lucide-react'

const BELAGAVI_CENTER = [15.8497, 74.4977]

const TRAFFIC_COORDS = {
  'Belagavi City Center': [15.8497, 74.4977],
  'College Road': [15.8620, 74.5080],
  'Market Area': [15.8540, 74.5160],
  'NH48 Bypass': [15.8820, 74.5420],
}

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

const createEventIcon = (isHigh) => {
  return L.divIcon({
    className: 'senior-marker-container',
    html: `
      <div class="senior-event-halo ${isHigh ? 'is-high' : ''}"></div>
      <div class="senior-event-dot ${isHigh ? 'is-high' : ''}"></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  })
}

const createTrafficIcon = (level, incident) => {
  const isCritical = level === 'high' || incident === 'accident'
  const isWarning = level === 'moderate' || incident === 'roadwork'
  const statusClass = isCritical ? 'status-crit' : isWarning ? 'status-warn' : 'status-ok'

  return L.divIcon({
    className: 'senior-traffic-container',
    html: `
      <div class="senior-traffic-pulse ${statusClass}"></div>
      <div class="senior-traffic-core ${statusClass}"></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

export default function BelagaviMapWidget({ events = [], trafficData = null, theme = 'dark', onOpenHostModal }) {
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'traffic' | 'events' | 'high'

  const validEvents = (Array.isArray(events) ? events : events?.events || [])
    .filter((e) => typeof e?.lat === 'number' && typeof e?.lng === 'number')

  const displayEvents =
    filterMode === 'traffic'
      ? []
      : filterMode === 'high'
      ? validEvents.filter((e) => e.high_attendance || (e.expected_attendance && e.expected_attendance >= 1000))
      : validEvents

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
    <div
      style={{
        backgroundColor: 'var(--surface-primary, #0F172A)',
        border: '1px solid var(--border-subtle, #1E293B)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Top Map Toolbar */}
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-subtle, #1E293B)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: 'var(--surface-header, #131C2E)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              color: '#06B6D4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Navigation size={15} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F8FAFC)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Belagavi Urban Arterials & Gatherings</span>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748B', padding: '1px 6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                15.8497° N, 74.4977° E
              </span>
            </div>
          </div>
        </div>

        {/* Layer Filters & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0, 0, 0, 0.25)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-subtle, #1E293B)' }}>
            {[
              { id: 'all', label: `All (${validEvents.length + trafficLocations.length})` },
              { id: 'traffic', label: `Traffic (${trafficLocations.length})` },
              { id: 'events', label: `Events (${validEvents.length})` },
              { id: 'high', label: 'High Density' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  background: filterMode === f.id ? '#06B6D4' : 'transparent',
                  color: filterMode === f.id ? '#0B0F17' : '#94A3B8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenHostModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#10B981',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Plus size={13} />
            <span>Host Gathering</span>
          </button>
        </div>
      </div>

      {/* Embedded Leaflet Map */}
      <div style={{ height: '440px', position: 'relative', width: '100%' }}>
        <MapContainer
          key={theme}
          center={BELAGAVI_CENTER}
          zoom={13}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', backgroundColor: '#090D14' }}
        >
          <MapResizer />

          <TileLayer
            key={tileUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={tileUrl}
            subdomains="abcd"
            maxZoom={19}
          />

          {/* Render Traffic Corridor Hotspots */}
          {displayTraffic.map((loc) => {
            const icon = createTrafficIcon(loc.congestion_level, loc.incident)
            const isAccident = loc.incident === 'accident'
            const isRoadwork = loc.incident === 'roadwork'

            return (
              <Marker key={`traffic-${loc.location}`} position={loc.coords} icon={icon}>
                <Popup className="senior-map-popup">
                  <div style={{ padding: '4px', minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: isAccident ? '#EF4444' : isRoadwork ? '#F59E0B' : '#10B981' }}>
                        CORRIDOR · {loc.congestion_level.toUpperCase()}
                      </span>
                      {loc.incident !== 'none' && (
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase' }}>
                          {loc.incident}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '4px' }}>
                      {loc.location}
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '4px' }}>
                      Flow Index: <strong style={{ color: '#F8FAFC' }}>{(loc.congestion_score * 100).toFixed(0)} / 100</strong>
                    </div>

                    {isAccident && (
                      <div style={{ fontSize: '11px', color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '4px 6px', borderRadius: '4px' }}>
                        Accident reported. Reroute via NH48 Bypass advised.
                      </div>
                    )}
                    {isRoadwork && (
                      <div style={{ fontSize: '11px', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '4px 6px', borderRadius: '4px' }}>
                        Lane narrowing active. Minor delay.
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Render Events */}
          {displayEvents.map((ev) => {
            const isHigh = ev.high_attendance || (ev.expected_attendance && ev.expected_attendance >= 1000)
            const icon = createEventIcon(isHigh)

            return (
              <Marker
                key={ev.event_id || `${ev.lat}-${ev.lng}`}
                position={[ev.lat, ev.lng]}
                icon={icon}
              >
                <Popup className="senior-map-popup">
                  <div style={{ padding: '4px', minWidth: '190px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', color: '#06B6D4' }}>
                        {ev.category?.replace('_', ' ') || 'GATHERING'}
                      </span>
                      {isHigh && (
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#F59E0B' }}>
                          HIGH CAPACITY
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#F8FAFC', marginBottom: '3px', lineHeight: 1.25 }}>
                      {ev.title}
                    </div>

                    <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '6px' }}>
                      {ev.venue || 'Belagavi Sector'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4px' }}>
                      <span>Distance: {ev.distance_km ? `${ev.distance_km} km` : 'Near Center'}</span>
                      {ev.expected_attendance && <span>~{ev.expected_attendance} attendees</span>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      <style>{`
        .senior-marker-container {
          position: relative;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .senior-event-halo {
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.2);
          border: 1px solid rgba(6, 182, 212, 0.6);
          animation: pulseEvent 2.4s infinite ease-in-out;
        }
        .senior-event-halo.is-high {
          background: rgba(245, 158, 11, 0.25);
          border-color: rgba(245, 158, 11, 0.8);
        }
        .senior-event-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #06B6D4;
          box-shadow: 0 0 6px #06B6D4;
          z-index: 2;
        }
        .senior-event-dot.is-high {
          background-color: #F59E0B;
          box-shadow: 0 0 8px #F59E0B;
        }

        .senior-traffic-container {
          position: relative;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .senior-traffic-pulse {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          animation: trafficRadarPulse 2s infinite ease-out;
        }
        .senior-traffic-pulse.status-crit {
          border: 2px solid rgba(239, 68, 68, 0.8);
          background: rgba(239, 68, 68, 0.25);
        }
        .senior-traffic-pulse.status-warn {
          border: 2px solid rgba(245, 158, 11, 0.8);
          background: rgba(245, 158, 11, 0.25);
        }
        .senior-traffic-pulse.status-ok {
          border: 2px solid rgba(16, 185, 129, 0.8);
          background: rgba(16, 185, 129, 0.2);
        }

        .senior-traffic-core {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          z-index: 2;
        }
        .senior-traffic-core.status-crit {
          background-color: #EF4444;
          box-shadow: 0 0 8px #EF4444;
        }
        .senior-traffic-core.status-warn {
          background-color: #F59E0B;
          box-shadow: 0 0 8px #F59E0B;
        }
        .senior-traffic-core.status-ok {
          background-color: #10B981;
          box-shadow: 0 0 8px #10B981;
        }

        @keyframes trafficRadarPulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes pulseEvent {
          0%, 100% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        .senior-map-popup .leaflet-popup-content-wrapper {
          background: #0F172A !important;
          border: 1px solid #1E293B !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6) !important;
          color: #F8FAFC !important;
        }
        .senior-map-popup .leaflet-popup-tip {
          background: #0F172A !important;
          border: 1px solid #1E293B !important;
        }
      `}</style>
    </div>
  )
}
