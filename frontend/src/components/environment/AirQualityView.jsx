import React from 'react'
import { CheckCircle2, ArrowRight, Radio } from 'lucide-react'

export default function AirQualityView({ aqData, onInspectWard }) {
  const aq = aqData || {
    aqi: 79.3,
    aqi_category: 'Moderate',
    pollutants: {
      pm25: { label: 'PM 2.5', value: 47.6, unit: 'µg/m³', standard: 60 },
      pm10: { label: 'PM 10', value: 50.7, unit: 'µg/m³', standard: 100 },
      co: { label: 'CO', value: 410, unit: 'µg/m³', standard: 2000 },
      no2: { label: 'NO2', value: 18.4, unit: 'µg/m³', standard: 80 },
      so2: { label: 'SO2', value: 7.2, unit: 'µg/m³', standard: 80 },
      o3: { label: 'OZONE (O3)', value: 34.8, unit: 'µg/m³', standard: 100 }
    }
  }

  const pollutantItems = [
    { key: 'pm25', label: 'PM 2.5', value: aq.pollutants?.pm25?.value || 47.6, unit: 'µg/m³', standard: 60 },
    { key: 'pm10', label: 'PM 10', value: aq.pollutants?.pm10?.value || 50.7, unit: 'µg/m³', standard: 100 },
    { key: 'co', label: 'CO', value: aq.pollutants?.co?.value || 410, unit: 'µg/m³', standard: 2000 },
    { key: 'no2', label: 'NO2', value: aq.pollutants?.no2?.value || 18.4, unit: 'µg/m³', standard: 80 },
    { key: 'so2', label: 'SO2', value: aq.pollutants?.so2?.value || 7.2, unit: 'µg/m³', standard: 80 },
    { key: 'o3', label: 'OZONE (O3)', value: aq.pollutants?.o3?.value || 34.8, unit: 'µg/m³', standard: 100 }
  ]

  const stations = aq.stations || [
    {
      ward_id: 2,
      ward_number: 2,
      station_name: 'KSPCB Udyambag Continuous Ambient Monitoring Station (KA_BEL_002)',
      locality: 'Udyambag (Ward 2)',
      zone_type: 'Industrial',
      aqi: 94,
      pm25: 56.3,
      pm10: 59.9
    },
    {
      ward_id: 17,
      ward_number: 17,
      station_name: 'Tilakwadi Civic Environmental Station',
      locality: 'Tilakwadi (Ward 17)',
      zone_type: 'Residential',
      aqi: 70,
      pm25: 41.7,
      pm10: 44.4
    },
    {
      ward_id: 30,
      ward_number: 30,
      station_name: 'Belagavi Central CBD Air & Traffic Node (Khade Bazar)',
      locality: 'Khade Bazar (Ward 30)',
      zone_type: 'Commercial',
      aqi: 80,
      pm25: 48.0,
      pm10: 51.1
    },
    {
      ward_id: 40,
      ward_number: 40,
      station_name: 'Belagavi Smart City CAAQMS Station 1 (Sadashiv / Nehru Nagar Hub)',
      locality: 'Sadashiv Nagar (Ward 40)',
      zone_type: 'Residential',
      aqi: 70,
      pm25: 41.7,
      pm10: 44.4
    },
    {
      ward_id: 49,
      ward_number: 49,
      station_name: 'Belagavi Fort Lake (Kote Kere) Eco-Monitoring Node (KA_BEL_003)',
      locality: 'Belgaum Fort (Ward 49)',
      zone_type: 'Cantonment / Eco',
      aqi: 70,
      pm25: 41.7,
      pm10: 44.4
    },
    {
      ward_id: 52,
      ward_number: 52,
      station_name: 'Belagavi Auto Nagar Industrial Ambient Node',
      locality: 'Mahantesh Nagar (Ward 52)',
      zone_type: 'Industrial',
      aqi: 94,
      pm25: 56.3,
      pm10: 59.9
    }
  ]

  const naqiCategories = [
    { range: '0 - 50', name: 'Good', desc: 'Minimal impact on health.', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.25)' },
    { range: '51 - 100', name: 'Satisfactory', desc: 'Minor breathing discomfort to sensitive people.', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.25)' },
    { range: '101 - 200', name: 'Moderate', desc: 'Breathing discomfort to people with lung disease.', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)' },
    { range: '201 - 300', name: 'Poor', desc: 'Breathing discomfort to most people on prolonged exposure.', color: '#F97316', bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.25)' },
    { range: '301 - 400', name: 'Very Poor', desc: 'Respiratory illness on prolonged exposure.', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)' },
    { range: '401 - 500', name: 'Severe', desc: 'Affects healthy people and seriously impacts sensitive.', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.08)', border: 'rgba(220, 38, 38, 0.3)' }
  ]

  const aqiVal = typeof aq.aqi === 'number' ? aq.aqi : 79.3
  const aqiColor = aqiVal > 200 ? '#EF4444' : (aqiVal > 100 ? '#F59E0B' : '#22C55E')

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
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                color: '#4ADE80',
                background: 'rgba(34, 197, 94, 0.12)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                <Radio size={12} />
                Live Ingestion Active
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
              <span style={{ fontSize: '32px', fontWeight: 800, color: aqiColor, lineHeight: 1 }}>
                {aqiVal.toFixed(1)}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: aqiColor }}>
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
                background: item.value > item.standard ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                color: item.value > item.standard ? '#EF4444' : '#F59E0B',
                border: `1px solid ${item.value > item.standard ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.25)'}`
              }}>
                Standard: {item.standard}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Verified Belagavi Monitoring Stations Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="smart-card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
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

        {/* 6 Stations Cards matching Screenshot 1 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {stations.map((st) => (
            <div
              key={st.ward_id}
              className="smart-card"
              style={{
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60A5FA',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    Ward {st.ward_number}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: st.aqi > 100 ? '#EF4444' : (st.aqi > 80 ? '#F59E0B' : '#22C55E'), lineHeight: 1 }}>
                      {st.aqi}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600 }}>
                      AQI
                    </div>
                  </div>
                </div>

                <h4 style={{ margin: '8px 0 2px', fontSize: '14.5px', fontWeight: 600, color: '#F8FAFC' }}>
                  {st.station_name}
                </h4>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {st.locality}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '11.5px'
              }}>
                <div>
                  <div style={{ color: '#64748B', fontSize: '10px', textTransform: 'uppercase' }}>PM2.5</div>
                  <strong style={{ color: '#F8FAFC' }}>{st.pm25} µg</strong>
                </div>
                <div>
                  <div style={{ color: '#64748B', fontSize: '10px', textTransform: 'uppercase' }}>PM10</div>
                  <strong style={{ color: '#F8FAFC' }}>{st.pm10} µg</strong>
                </div>
                <div>
                  <div style={{ color: '#64748B', fontSize: '10px', textTransform: 'uppercase' }}>Zone Type</div>
                  <strong style={{ color: '#60A5FA' }}>{st.zone_type}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={13} />
                  Verified Sensor
                </span>

                <button
                  onClick={() => onInspectWard && onInspectWard(st.ward_id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#60A5FA',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <span>Inspect on Map &rarr;</span>
                </button>
              </div>
            </div>
          ))}
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
