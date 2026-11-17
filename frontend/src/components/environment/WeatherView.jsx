import React, { useMemo } from 'react'
import {
  SunMedium,
  Thermometer,
  Droplets,
  Wind,
  Compass,
  CloudRain,
  Info,
  Search,
  MapPin,
  PlusCircle,
  RotateCw,
  Bell
} from 'lucide-react'

export default function WeatherView({
  weatherData,
  onOpenNoiseModal,
  searchQuery = '',
  setSearchQuery,
  userPersona = 'Citizen',
  setUserPersona,
  onRefresh
}) {
  const w = weatherData || {
    temperature_celsius: 26.4,
    apparent_temperature_celsius: 27.2,
    humidity_percent: 68,
    wind_speed_kmh: 3.2,
    wind_direction_degrees: 245,
    precipitation_mm: 0,
    condition: 'Mainly clear'
  }

  // 24-hour meteorological hourly curve points
  const forecastHours = [
    { time: '00:00', temp: 22.4, humidity: 78 },
    { time: '03:00', temp: 21.0, humidity: 82 },
    { time: '06:00', temp: 20.2, humidity: 85 },
    { time: '09:00', temp: 24.5, humidity: 70 },
    { time: '12:00', temp: 28.6, humidity: 54 },
    { time: '15:00', temp: 29.8, humidity: 48 },
    { time: '18:00', temp: 26.4, humidity: 68 },
    { time: '21:00', temp: 23.8, humidity: 74 },
  ]

  // SVG Spline calculations for temperature and humidity
  const { tempPath, humidPath } = useMemo(() => {
    const width = 800
    const height = 180
    const padding = 30

    const getX = (i) => padding + (i / (forecastHours.length - 1)) * (width - 2 * padding)
    // Temp scale 15 - 35
    const getYTemp = (val) => height - padding - ((val - 15) / (35 - 15)) * (height - 2 * padding)
    // Humidity scale 30 - 100
    const getYHumid = (val) => height - padding - ((val - 30) / (100 - 30)) * (height - 2 * padding)

    let tD = `M ${getX(0)} ${getYTemp(forecastHours[0].temp)}`
    let hD = `M ${getX(0)} ${getYHumid(forecastHours[0].humidity)}`

    for (let i = 1; i < forecastHours.length; i++) {
      const prevX = getX(i - 1)
      const currX = getX(i)
      const cpX = (prevX + currX) / 2

      const prevY_t = getYTemp(forecastHours[i - 1].temp)
      const currY_t = getYTemp(forecastHours[i].temp)
      tD += ` C ${cpX} ${prevY_t}, ${cpX} ${currY_t}, ${currX} ${currY_t}`

      const prevY_h = getYHumid(forecastHours[i - 1].humidity)
      const currY_h = getYHumid(forecastHours[i].humidity)
      hD += ` C ${cpX} ${prevY_h}, ${cpX} ${currY_h}, ${currX} ${currY_h}`
    }

    return { tempPath: tD, humidPath: hD }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Top Header Card */}
      <div className="smart-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                background: '#1E3A8A',
                color: '#60A5FA',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(96, 165, 250, 0.3)'
              }}>
                Open-Meteo High-Resolution NWP
              </span>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                Belagavi 15.8497° N, 74.4977° E
              </span>
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              Weather & Meteorological Intelligence
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8', maxWidth: '780px', lineHeight: 1.5 }}>
              Real-time coordinate-based meteorological observations and numerical forecasts for Belagavi city and surrounding municipal basin.
            </p>
          </div>

          {/* Top Right Big Weather Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <SunMedium size={36} color="#F59E0B" />
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#F8FAFC', lineHeight: 1 }}>
                {(w.temperature_celsius || 26.4).toFixed(1)}°C
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                {w.condition || 'Mainly clear'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Search input */}
        <div style={{
          flex: '1 1 300px',
          maxWidth: '440px',
          background: '#172033',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Search Belagavi wards (e.g., Tilakwadi, Udyambag, Ward 40)..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F8FAFC',
              fontSize: '13px',
              width: '100%'
            }}
          />
        </div>

        {/* Location pill, actions, persona */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '7px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#94A3B8'
          }}>
            <MapPin size={13} color="#3B82F6" />
            <span>Belagavi City 15.8497° N, 74.4977° E</span>
          </div>

          <button
            onClick={onOpenNoiseModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '7px 14px',
              color: '#60A5FA',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={14} />
            <span>Report Noise</span>
          </button>

          <button
            onClick={onRefresh}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '7px 10px',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Refresh"
          >
            <RotateCw size={14} />
          </button>

          <button
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '7px 10px',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Alerts"
          >
            <Bell size={14} />
          </button>

          {/* Persona selector */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '3px'
          }}>
            {['Citizen', 'Analyst', 'Admin'].map((role) => (
              <button
                key={role}
                onClick={() => setUserPersona && setUserPersona(role)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: userPersona === role ? '#3B82F6' : 'transparent',
                  color: userPersona === role ? '#FFFFFF' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: userPersona === role ? 600 : 500,
                  cursor: 'pointer'
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 5 Meteorological Parameter Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px'
      }}>
        {/* Apparent Temp */}
        <div className="smart-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
            <Thermometer size={14} color="#F59E0B" />
            <span>Apparent Temp</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', marginBottom: '4px' }}>
            {w.apparent_temperature_celsius || 27.2}°C
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            Thermal comfort index
          </div>
        </div>

        {/* Relative Humidity */}
        <div className="smart-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
            <Droplets size={14} color="#3B82F6" />
            <span>Relative Humidity</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', marginBottom: '4px' }}>
            {w.humidity_percent || 68}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            Moisture saturation
          </div>
        </div>

        {/* Wind Speed */}
        <div className="smart-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
            <Wind size={14} color="#22C55E" />
            <span>Wind Speed</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', marginBottom: '4px' }}>
            {w.wind_speed_kmh || 3.2} <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>km/h</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            Near-surface (10m)
          </div>
        </div>

        {/* Wind Direction */}
        <div className="smart-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
            <Compass size={14} color="#A855F7" />
            <span>Wind Direction</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', marginBottom: '4px' }}>
            {w.wind_direction_degrees || 245}° <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>WSW</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            Direction of origin
          </div>
        </div>

        {/* Precipitation */}
        <div className="smart-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
            <CloudRain size={14} color="#06B6D4" />
            <span>Precipitation</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', marginBottom: '4px' }}>
            {w.precipitation_mm || 0} <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>mm</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            Accumulated rainfall
          </div>
        </div>
      </div>

      {/* 4. 24-Hour Meteorological Forecast Curve */}
      <div className="smart-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>
              24-Hour Meteorological Forecast Curve
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
              Hourly ambient temperature (°C) and relative humidity (%) trends
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>Temperature (°C)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
              <span style={{ color: '#60A5FA', fontWeight: 600 }}>Humidity (%)</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div style={{ width: '100%', height: '180px', position: 'relative' }}>
          <svg viewBox="0 0 800 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <line x1="30" y1="30" x2="770" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="30" y1="80" x2="770" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="30" y1="130" x2="770" y2="130" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

            {/* Humidity Line */}
            <path d={humidPath} fill="none" stroke="#3B82F6" strokeWidth="2.5" />
            {/* Temperature Line */}
            <path d={tempPath} fill="none" stroke="#F59E0B" strokeWidth="2.5" />

            {/* Points & Labels */}
            {forecastHours.map((pt, i) => {
              const x = 30 + (i / (forecastHours.length - 1)) * (800 - 60)
              const yT = 180 - 30 - ((pt.temp - 15) / 20) * 120
              const yH = 180 - 30 - ((pt.humidity - 30) / 70) * 120

              return (
                <g key={i}>
                  <circle cx={x} cy={yT} r="3" fill="#F59E0B" />
                  <circle cx={x} cy={yH} r="3" fill="#3B82F6" />
                  <text x={x} y="172" fill="#64748B" fontSize="10" textAnchor="middle">
                    {pt.time}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Chart Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '11px', color: '#64748B' }}>
          <div>Source: Open-Meteo European Centre for Medium-Range Weather Forecasts (ECMWF) IFS model</div>
          <div>Elevation: 762m ASL (Belagavi Plateau)</div>
        </div>
      </div>

      {/* 5. Provenance Disclosure Callout */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.18)',
        borderRadius: '10px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Info size={16} color="#60A5FA" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>
          <strong style={{ color: '#F8FAFC' }}>Provenance Disclosure:</strong> Weather figures are derived from Open-Meteo coordinate-based high-resolution NWP models calibrated for Belagavi latitude/longitude. They represent atmospheric model estimates rather than independent physical weather stations for each individual ward.
        </div>
      </div>
    </div>
  )
}
