import React, { useState, useMemo } from 'react'
import {
  TrendingUp,
  Search,
  MapPin,
  PlusCircle,
  RotateCw,
  Bell
} from 'lucide-react'

export default function HistoricalView({
  wards = [],
  onOpenNoiseModal,
  searchQuery = '',
  setSearchQuery,
  userPersona = 'Citizen',
  setUserPersona,
  onRefresh
}) {
  const [targetWard, setTargetWard] = useState('all')
  const [parameter, setParameter] = useState('AQI')

  // Sample 24-hour diurnal curve points
  const points = useMemo(() => {
    if (parameter === 'AQI') {
      return [
        { time: '00:00', val: 62 },
        { time: '03:00', val: 58 },
        { time: '06:00', val: 74 },
        { time: '09:00', val: 92 },
        { time: '12:00', val: 86 },
        { time: '15:00', val: 82 },
        { time: '18:00', val: 94 },
        { time: '21:00', val: 78 }
      ]
    } else if (parameter === 'PM2.5') {
      return [
        { time: '00:00', val: 28 },
        { time: '03:00', val: 25 },
        { time: '06:00', val: 38 },
        { time: '09:00', val: 54 },
        { time: '12:00', val: 46 },
        { time: '15:00', val: 42 },
        { time: '18:00', val: 52 },
        { time: '21:00', val: 36 }
      ]
    } else if (parameter === 'PM10') {
      return [
        { time: '00:00', val: 56 },
        { time: '03:00', val: 50 },
        { time: '06:00', val: 72 },
        { time: '09:00', val: 98 },
        { time: '12:00', val: 84 },
        { time: '15:00', val: 76 },
        { time: '18:00', val: 90 },
        { time: '21:00', val: 68 }
      ]
    } else {
      // TEMP (°C)
      return [
        { time: '00:00', val: 22 },
        { time: '03:00', val: 21 },
        { time: '06:00', val: 20 },
        { time: '09:00', val: 25 },
        { time: '12:00', val: 29 },
        { time: '15:00', val: 30 },
        { time: '18:00', val: 26 },
        { time: '21:00', val: 24 }
      ]
    }
  }, [parameter])

  // Spline calculations
  const { linePath, areaPath } = useMemo(() => {
    const width = 800
    const height = 180
    const padding = 30

    const maxVal = parameter === 'TEMP (°C)' ? 35 : 120
    const minVal = parameter === 'TEMP (°C)' ? 15 : 0

    const getX = (i) => padding + (i / (points.length - 1)) * (width - 2 * padding)
    const getY = (v) => height - padding - ((v - minVal) / (maxVal - minVal)) * (height - 2 * padding)

    let d = `M ${getX(0)} ${getY(points[0].val)}`

    for (let i = 1; i < points.length; i++) {
      const prevX = getX(i - 1)
      const currX = getX(i)
      const cpX = (prevX + currX) / 2
      const prevY = getY(points[i - 1].val)
      const currY = getY(points[i].val)
      d += ` C ${cpX} ${prevY}, ${cpX} ${currY}, ${currX} ${currY}`
    }

    const lastX = getX(points.length - 1)
    const firstX = getX(0)
    const bottomY = height - padding
    const aD = `${d} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`

    return { linePath: d, areaPath: aD }
  }, [points, parameter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Top Search & Controls Bar */}
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

      {/* Subtitle */}
      <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
        Multi-temporal environmental retrospective covering air particulate dynamics, temperature, humidity, and community noise fluctuations.
      </p>

      {/* 2. Target Ward & Parameter Selector Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        background: '#172033',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '10px 16px'
      }}>
        {/* Target Ward */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>Target Ward:</span>
          <select
            value={targetWard}
            onChange={(e) => setTargetWard(e.target.value)}
            style={{
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#F8FAFC',
              fontSize: '12.5px',
              padding: '6px 12px',
              outline: 'none'
            }}
          >
            <option value="all">City Average (All 58 Wards)</option>
            {wards.map((w) => (
              <option key={w.ward_id} value={w.ward_id}>
                Ward {w.ward_number}: {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Parameter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>Parameter:</span>
          {['AQI', 'PM2.5', 'PM10', 'TEMP (°C)'].map((param) => (
            <button
              key={param}
              onClick={() => setParameter(param)}
              style={{
                padding: '5px 14px',
                borderRadius: '6px',
                border: 'none',
                background: parameter === param ? '#3B82F6' : 'rgba(255, 255, 255, 0.04)',
                color: parameter === param ? '#FFFFFF' : '#94A3B8',
                fontSize: '12px',
                fontWeight: parameter === param ? 600 : 500,
                cursor: 'pointer'
              }}
            >
              {param}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Chart Card */}
      <div className="smart-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>
              {parameter} Chronological Evolution (24H)
            </h3>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>
              Belagavi City-Wide Composite Average
            </div>
          </div>

          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '4px',
            color: '#94A3B8'
          }}>
            {points.length} Data Points
          </div>
        </div>

        {/* Chart SVG */}
        <div style={{ width: '100%', height: '180px', position: 'relative' }}>
          <svg viewBox="0 0 800 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line x1="30" y1="30" x2="770" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="30" y1="80" x2="770" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="30" y1="130" x2="770" y2="130" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

            <path d={areaPath} fill="url(#histGrad)" />
            <path d={linePath} fill="none" stroke="#3B82F6" strokeWidth="2.5" />

            {points.map((pt, i) => {
              const x = 30 + (i / (points.length - 1)) * (800 - 60)
              const maxVal = parameter === 'TEMP (°C)' ? 35 : 120
              const minVal = parameter === 'TEMP (°C)' ? 15 : 0
              const y = 180 - 30 - ((pt.val - minVal) / (maxVal - minVal)) * 120

              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="3.5" fill="#3B82F6" stroke="#0B1120" strokeWidth="1.5" />
                  <text x={x} y="172" fill="#64748B" fontSize="10" textAnchor="middle">
                    {pt.time}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '12px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
          <span style={{ color: '#60A5FA', fontWeight: 600 }}>{parameter}</span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '11px', color: '#64748B' }}>
          <div>Physical Stations: Continuous Sampling &bull; Spatial Feeds: 15-Minute Re-analysis</div>
          <div>Standard Deviation: &plusmn;4.2</div>
        </div>
      </div>
    </div>
  )
}
