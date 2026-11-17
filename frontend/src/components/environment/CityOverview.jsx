import React, { useMemo, useState } from 'react'
import {
  Activity,
  MapPin,
  Search,
  PlusCircle,
  RotateCw,
  Bell,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Clock,
  ShieldCheck,
  TrendingUp,
  Volume2,
  Wind,
  Thermometer
} from 'lucide-react'

export default function CityOverview({
  overviewData,
  wards = [],
  onNavigate,
  onOpenNoiseModal,
  onRefresh,
  loading,
  searchQuery,
  setSearchQuery,
  userPersona,
  setUserPersona,
  onSelectWard
}) {
  const [hoverIndex, setHoverIndex] = useState(3) // Default to 09:00 as seen in photo
  const citySummary = overviewData?.city_summary || {}
  const statusData = overviewData?.status || {}
  const activeAlerts = overviewData?.active_alerts || []
  const trends24h = overviewData?.trends_24h || []

  // Active AI anomaly alerts
  const aiAnomalies = useMemo(() => {
    return activeAlerts.filter(a => a.category === 'ai_anomaly' || a.priority === 'critical')
  }, [activeAlerts])

  // Filtered wards for bottom matrix if search query typed
  const displayWards = useMemo(() => {
    if (!searchQuery.trim()) return wards
    const q = searchQuery.toLowerCase().trim()
    return wards.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.locality.toLowerCase().includes(q) ||
      String(w.ward_number) === q
    )
  }, [wards, searchQuery])

  // SVG Chart path calculation for 24h trend matching photo points
  const chartPoints = useMemo(() => {
    if (!trends24h || trends24h.length === 0) {
      return [
        { time: '00:00', aqi: 62, pm25: 28 },
        { time: '03:00', aqi: 58, pm25: 26 },
        { time: '06:00', aqi: 74, pm25: 42 },
        { time: '09:00', aqi: 95, pm25: 58 },
        { time: '12:00', aqi: 86, pm25: 48 },
        { time: '15:00', aqi: 82, pm25: 44 },
        { time: '18:00', aqi: 94, pm25: 56 },
        { time: '21:00', aqi: 78, pm25: 38 },
      ]
    }
    return trends24h
  }, [trends24h])

  // SVG dimensions
  const width = 640
  const height = 150
  const padLeft = 40
  const padRight = 20
  const padTop = 15
  const padBottom = 20

  const maxVal = 100
  const minVal = 0

  const getX = (i) => padLeft + (i / (chartPoints.length - 1)) * (width - padLeft - padRight)
  const getY = (val) => height - padBottom - ((val - minVal) / (maxVal - minVal)) * (height - padTop - padBottom)

  // Generate SVG path strings
  const { aqiPath, aqiAreaPath, pm25Path, pm25AreaPath } = useMemo(() => {
    if (chartPoints.length < 2) return { aqiPath: '', aqiAreaPath: '', pm25Path: '', pm25AreaPath: '' }

    let aqiD = `M ${getX(0)} ${getY(chartPoints[0].aqi)}`
    let pm25D = `M ${getX(0)} ${getY(chartPoints[0].pm25)}`

    for (let i = 1; i < chartPoints.length; i++) {
      const prevX = getX(i - 1)
      const prevY_aqi = getY(chartPoints[i - 1].aqi)
      const currX = getX(i)
      const currY_aqi = getY(chartPoints[i].aqi)
      const cpX = (prevX + currX) / 2
      aqiD += ` C ${cpX} ${prevY_aqi}, ${cpX} ${currY_aqi}, ${currX} ${currY_aqi}`

      const prevY_pm = getY(chartPoints[i - 1].pm25)
      const currY_pm = getY(chartPoints[i].pm25)
      pm25D += ` C ${cpX} ${prevY_pm}, ${cpX} ${currY_pm}, ${currX} ${currY_pm}`
    }

    const lastX = getX(chartPoints.length - 1)
    const firstX = getX(0)
    const bottomY = height - padBottom

    const aqiAreaD = `${aqiD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
    const pm25AreaD = `${pm25D} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`

    return { aqiPath: aqiD, aqiAreaPath: aqiAreaD, pm25Path: pm25D, pm25AreaPath: pm25AreaD }
  }, [chartPoints])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. TOP BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(23, 32, 51, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', maxWidth: '780px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            flexShrink: 0
          }}>
            <Activity size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
                Belagavi City Environmental Intelligence
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 9px',
                borderRadius: '9999px',
                background: 'rgba(59, 130, 246, 0.18)',
                color: '#60A5FA',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                Karnataka, India
              </span>
            </div>

            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
              Continuous urban environmental monitoring, meteorological tracking, and AI-driven anomaly surveillance across all 58 municipal wards.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', fontSize: '11.5px', color: '#94A3B8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} color="#60A5FA" />
                <span>Last Sync: Real-time live</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={13} color="#60A5FA" />
                <span>Total Wards: 58 Municipal Wards</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#22C55E" />
                <span>Active Station Coverage: {citySummary.monitored_wards_count || 4} Wards</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onNavigate('map')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            border: 'none',
            color: '#FFFFFF',
            padding: '11px 20px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.35)',
            transition: 'all 0.15s ease'
          }}
        >
          <MapPin size={16} />
          <span>Explore 58 Wards Map</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* 2. SEARCH AND ACTION BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '10px 16px',
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#0B1120',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '8px 14px',
          flex: '1',
          minWidth: '260px',
          maxWidth: '420px'
        }}>
          <Search size={15} color="#94A3B8" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Belagavi wards (e.g., Tilakwadi, Udyambag, Ward 40)..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F8FAFC',
              fontSize: '12.5px',
              width: '100%'
            }}
          />
        </div>

        {/* Location Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '6px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '12px',
          color: '#CBD5E1'
        }}>
          <MapPin size={13} color="#60A5FA" />
          <span>Belagavi City 15.8497° N, 74.4977° E</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onOpenNoiseModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#93C5FD',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={14} />
            <span>Report Noise</span>
          </button>

          <button
            onClick={onRefresh}
            title="Refresh live telemetry"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94A3B8',
              cursor: 'pointer'
            }}
          >
            <RotateCw size={14} className={loading ? 'pulse-dot' : ''} />
          </button>

          <button
            onClick={() => onNavigate('alerts')}
            title="Active Alerts"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94A3B8',
              cursor: 'pointer'
            }}
          >
            <Bell size={14} />
            {activeAlerts.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#EF4444'
              }} />
            )}
          </button>

          {/* Persona Switcher Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#0B1120',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '2px'
          }}>
            {['Citizen', 'Analyst', 'Admin'].map((role) => (
              <button
                key={role}
                onClick={() => setUserPersona(role)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  background: userPersona === role ? '#3B82F6' : 'transparent',
                  color: userPersona === role ? '#FFFFFF' : '#94A3B8',
                  fontSize: '11.5px',
                  fontWeight: userPersona === role ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 4 KEY STAT CARDS (Matching Screen Photo) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {/* Wards Card */}
        <div className="smart-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={15} color="#60A5FA" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>
              MUNICIPAL WARD REGISTRY
            </span>
          </div>

          <div style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.1, marginBottom: '6px' }}>
            58 <span style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>Wards</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
            0 Active Feeds &bull; 58 Awaiting Sensors
          </div>
        </div>

        {/* AQI Card */}
        <div className="smart-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wind size={15} color="#60A5FA" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>
                CITY AIR QUALITY INDEX
              </span>
            </div>

            <span style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#F59E0B',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10.5px',
              fontWeight: 700
            }}>
              Moderate (CPCB)
            </span>
          </div>

          <div style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.1, marginBottom: '6px' }}>
            84.0 <span style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>AQI</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
            Calculated via India NAQI sub-index sta...
          </div>
        </div>

        {/* Temperature Card */}
        <div className="smart-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Thermometer size={15} color="#F59E0B" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>
                CURRENT WEATHER
              </span>
            </div>

            <span style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 500 }}>
              Partly cloudy
            </span>
          </div>

          <div style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.1, marginBottom: '6px' }}>
            26.4°C
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
            Humidity: 68% &bull; Wind: 3.2 km/h
          </div>
        </div>

        {/* AI Anomaly Events Card */}
        <div className="smart-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'rgba(34, 197, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Cpu size={15} color="#22C55E" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>
                ACTIVE AI ANOMALIES
              </span>
            </div>

            <span style={{
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#FDA4AF',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10.5px',
              fontWeight: 700
            }}>
              Isolation Forest
            </span>
          </div>

          <div style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.1, marginBottom: '6px' }}>
            2 <span style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>Events</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
            Statistical deviations flagged against ba...
          </div>
        </div>
      </div>

      {/* 4. MIDDLE ROW: TRENDS (65%) & AI ANOMALIES (35%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px' }}>
        {/* 24-Hour Trends Chart Card with Interactive Crosshair & Tooltip */}
        <div className="smart-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#F8FAFC' }}>
                24-Hour Belagavi Environmental Trends
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#94A3B8' }}>
                Atmospheric particulate matter (PM2.5) & CPCB AQI correlation over diurnal cycle
              </p>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
                <span style={{ color: '#60A5FA', fontWeight: 600 }}>AQI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ color: '#4ADE80', fontWeight: 600 }}>PM2.5 (µg/m³)</span>
              </div>
            </div>
          </div>

          {/* SVG Area Chart with Y-Axis and Interactive Tooltip */}
          <div
            style={{ flex: 1, position: 'relative', minHeight: '160px', width: '100%', cursor: 'crosshair' }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const mouseX = e.clientX - rect.left
              const ratio = (mouseX - padLeft) / (rect.width - padLeft - padRight)
              const idx = Math.max(0, Math.min(chartPoints.length - 1, Math.round(ratio * (chartPoints.length - 1))))
              setHoverIndex(idx)
            }}
          >
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '150px', overflow: 'visible' }}>
              <defs>
                <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y-Axis Grid Lines & Numbers (100, 75, 50, 25, 0) */}
              {[100, 75, 50, 25, 0].map((v) => {
                const y = getY(v)
                return (
                  <g key={v}>
                    <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <text x={padLeft - 8} y={y + 3.5} fill="#64748B" fontSize="9.5" textAnchor="end">
                      {v}
                    </text>
                  </g>
                )
              })}

              {/* Area Fills */}
              <path d={aqiAreaPath} fill="url(#aqiGrad)" />
              <path d={pm25AreaPath} fill="url(#pm25Grad)" />

              {/* Smooth Stroke Curves */}
              <path d={aqiPath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
              <path d={pm25Path} fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />

              {/* Interactive Crosshair & Highlight Dots */}
              {hoverIndex !== null && chartPoints[hoverIndex] && (() => {
                const hx = getX(hoverIndex)
                const hyAqi = getY(chartPoints[hoverIndex].aqi)
                const hyPm25 = getY(chartPoints[hoverIndex].pm25)
                return (
                  <g>
                    <line x1={hx} y1={padTop} x2={hx} y2={height - padBottom} stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx={hx} cy={hyAqi} r="4.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx={hx} cy={hyPm25} r="4.5" fill="#22C55E" stroke="#FFFFFF" strokeWidth="2" />
                  </g>
                )
              })()}
            </svg>

            {/* Floating Tooltip Box matching screen photo */}
            {hoverIndex !== null && chartPoints[hoverIndex] && (() => {
              const pt = chartPoints[hoverIndex]
              const pct = (getX(hoverIndex) / width) * 100
              return (
                <div style={{
                  position: 'absolute',
                  left: `clamp(60px, ${pct}%, calc(100% - 90px))`,
                  top: '46%',
                  transform: 'translate(-50%, -50%)',
                  background: '#0B1120',
                  border: '1.5px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                  pointerEvents: 'none',
                  zIndex: 20
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#F8FAFC', marginBottom: '2px' }}>
                    {pt.time}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#38BDF8' }}>
                    AQI : {pt.aqi}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#4ADE80' }}>
                    PM2.5 : {pt.pm25}
                  </div>
                </div>
              )
            })()}

            {/* Time Ticks */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingLeft: `${padLeft}px`,
              paddingRight: `${padRight}px`,
              fontSize: '10.5px',
              color: '#64748B',
              marginTop: '4px'
            }}>
              {chartPoints.map((pt, i) => (
                <span key={i}>{pt.time}</span>
              ))}
            </div>
          </div>

          {/* Card Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '11px',
            color: '#64748B'
          }}>
            <span>Data Source: Open-Meteo High-Resolution Model & Belagavi Continuous Monitoring Nodes</span>
            <button
              onClick={() => onNavigate('trends')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#60A5FA',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View Detailed Analytics &rarr;
            </button>
          </div>
        </div>

        {/* AI Anomaly Alerts Card */}
        <div className="smart-card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} color="#60A5FA" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.04em' }}>
                AI ANOMALY ALERTS
              </span>
            </div>
            <button
              onClick={() => onNavigate('anomalies')}
              style={{ background: 'transparent', border: 'none', color: '#60A5FA', fontSize: '12px', cursor: 'pointer' }}
            >
              View All
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {aiAnomalies.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {aiAnomalies.slice(0, 2).map((a, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{a.ward_name}</span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: a.priority === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: a.priority === 'critical' ? '#F87171' : '#FBBF24'
                      }}>
                        {a.priority.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#CBD5E1', fontSize: '11.5px', lineHeight: 1.4 }}>
                      {a.reason}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#22C55E',
                  margin: '0 auto 10px'
                }}>
                  <CheckCircle2 size={24} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginBottom: '4px' }}>
                  No high-priority environmental anomalies active.
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Urban basin multivariate dispersion within normal bounds.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '11px',
            color: '#64748B'
          }}>
            <span>Algorithm: Isolation Forest</span>
            <span>Contamination: 8%</span>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM CARD: 58 MUNICIPAL WARDS STATUS MATRIX */}
      <div className="smart-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#F8FAFC' }}>
              Belagavi 58 Municipal Wards Status Matrix
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#94A3B8' }}>
              Live status mapping across all 58 Belagavi City Corporation (BCC) wards. Click any ward to inspect details on the map.
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ color: '#94A3B8' }}>Normal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ color: '#94A3B8' }}>Moderate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ color: '#94A3B8' }}>Critical</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748B' }} />
              <span style={{ color: '#94A3B8' }}>Unverified</span>
            </div>
          </div>
        </div>

        {/* Matrix Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '8px',
          maxHeight: '280px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {displayWards.map((w) => (
            <div
              key={w.ward_id}
              onClick={() => {
                if (onSelectWard) onSelectWard(w)
                onNavigate('map')
              }}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#F8FAFC' }}>
                  W{w.ward_number}
                </span>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: w.status_color || '#64748B' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {w.locality}
              </div>
              <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '2px' }}>
                {w.current_aqi ? `${w.current_aqi} AQI` : 'Awaiting sensor'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
