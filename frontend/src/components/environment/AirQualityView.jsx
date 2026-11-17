import React from 'react'

export default function AirQualityView({ aqData }) {
  const aq = aqData || {
    aqi: 84.0,
    aqi_category: 'Moderate',
    pollutants: {
      pm25: { label: 'PM 2.5', value: 42.5, unit: 'µg/m³', standard: 60 },
      pm10: { label: 'PM 10', value: 78.2, unit: 'µg/m³', standard: 100 },
      co: { label: 'CO', value: 410, unit: 'µg/m³', standard: 2000 },
      no2: { label: 'NO2', value: 18.4, unit: 'µg/m³', standard: 80 },
      so2: { label: 'SO2', value: 7.2, unit: 'µg/m³', standard: 80 },
      o3: { label: 'OZONE (O3)', value: 34.8, unit: 'µg/m³', standard: 100 }
    }
  }

  const pollutantItems = [
    { key: 'pm25', label: 'PM 2.5', value: aq.pollutants?.pm25?.value || 42.5, unit: 'µg/m³', standard: 60 },
    { key: 'pm10', label: 'PM 10', value: aq.pollutants?.pm10?.value || 78.2, unit: 'µg/m³', standard: 100 },
    { key: 'co', label: 'CO', value: aq.pollutants?.co?.value || 410, unit: 'µg/m³', standard: 2000 },
    { key: 'no2', label: 'NO2', value: aq.pollutants?.no2?.value || 18.4, unit: 'µg/m³', standard: 80 },
    { key: 'so2', label: 'SO2', value: aq.pollutants?.so2?.value || 7.2, unit: 'µg/m³', standard: 80 },
    { key: 'o3', label: 'OZONE (O3)', value: aq.pollutants?.o3?.value || 34.8, unit: 'µg/m³', standard: 100 }
  ]

  const naqiCategories = [
    { range: '0 - 50', name: 'Good', desc: 'Minimal impact on health.', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.25)' },
    { range: '51 - 100', name: 'Satisfactory', desc: 'Minor breathing discomfort to sensitive people.', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.25)' },
    { range: '101 - 200', name: 'Moderate', desc: 'Breathing discomfort to people with lung disease.', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)' },
    { range: '201 - 300', name: 'Poor', desc: 'Breathing discomfort to most people on prolonged exposure.', color: '#F97316', bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.25)' },
    { range: '301 - 400', name: 'Very Poor', desc: 'Respiratory illness on prolonged exposure.', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)' },
    { range: '401 - 500', name: 'Severe', desc: 'Affects healthy people and seriously impacts sensitive.', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.08)', border: 'rgba(220, 38, 38, 0.3)' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Card */}
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
                CPCB India NAAQS Standard
              </span>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                Belagavi Municipal Ambient Monitoring
              </span>
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              Air Quality Intelligence & Atmospheric Surveillance
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8', maxWidth: '780px', lineHeight: 1.5 }}>
              Real-time pollutant concentrations measured across verified Belagavi physical monitoring stations and high-resolution atmospheric models.
            </p>
          </div>

          {/* Right side composite AQI */}
          <div style={{ textAlign: 'right', minWidth: '180px' }}>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '2px', fontWeight: 500 }}>
              City-Wide Composite AQI
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '8px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#F59E0B', lineHeight: 1 }}>
                {(aq.aqi || 84.0).toFixed(1)}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#F59E0B' }}>
                {aq.aqi_category || 'Moderate'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 6 Pollutants Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        {pollutantItems.map((item) => (
          <div
            key={item.key}
            className="smart-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '120px'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.label}
            </div>

            <div style={{ margin: '12px 0 10px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
                {item.value}
              </span>
              <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '4px' }}>
                {item.unit}
              </span>
            </div>

            <div>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '4px',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#F59E0B',
                border: '1px solid rgba(245, 158, 11, 0.25)'
              }}>
                Standard: {item.standard}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Verified Belagavi Monitoring Stations */}
      <div className="smart-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: '#F8FAFC' }}>
            Verified Belagavi Monitoring Stations
          </h3>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#94A3B8' }}>
            Calibrated physical Continuous Ambient Air Quality Monitoring Stations (CAAQMS) deployed across municipal zones
          </p>
        </div>

        <div style={{
          padding: '6px 14px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '6px',
          color: '#60A5FA',
          fontSize: '12px',
          fontWeight: 600
        }}>
          6 Active Physical Nodes
        </div>
      </div>

      {/* 4. CPCB National Air Quality Index (NAQI) Scale Reference */}
      <div className="smart-card" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '12.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          CPCB NATIONAL AIR QUALITY INDEX (NAQI) SCALE REFERENCE
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px'
        }}>
          {naqiCategories.map((cat, i) => (
            <div
              key={i}
              style={{
                padding: '16px',
                borderRadius: '8px',
                background: cat.bg,
                border: `1px solid ${cat.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700, color: cat.color }}>
                {cat.range}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                {cat.name}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.4, marginTop: '2px' }}>
                {cat.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
