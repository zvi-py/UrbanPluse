import React from 'react'
import { Globe, CheckCircle2, ShieldCheck, Database, RefreshCw, Radio } from 'lucide-react'

export default function ApiSourcesView({ sourcesData }) {
  const sources = sourcesData?.sources || [
    {
      id: 1,
      name: 'Open-Meteo High-Resolution Numerical Weather Model',
      type: 'Meteorological API',
      status: 'Online (Real-time live)',
      coverage: 'Belagavi City Grid (15.8497°N, 74.4977°E)',
      update_frequency: 'Every 15 minutes',
      metrics: ['Temperature', 'Relative Humidity', 'Wind Vector', 'Barometric Pressure', 'Precipitation']
    },
    {
      id: 2,
      name: 'Central Pollution Control Board (CPCB) India NAQI',
      type: 'Regulatory Air Standard',
      status: 'Active Reference Standard',
      coverage: 'All 58 Belagavi Wards',
      update_frequency: 'Continuous / 24-hr Sub-Index Breakpoints',
      metrics: ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'Ozone']
    },
    {
      id: 3,
      name: 'OpenAQ Global Clean Air Community API v3',
      type: 'Air Quality Ingestion API',
      status: 'Online (Station Poll Active)',
      coverage: 'Belagavi Regional Stations (Radius 35km)',
      update_frequency: 'Hourly',
      metrics: ['PM2.5 Sensor Telemetry', 'PM10 Sensor Telemetry']
    },
    {
      id: 4,
      name: 'Belagavi City Corporation (BCC) 58 Wards Spatial Registry',
      type: 'GIS / Municipal Registry',
      status: 'Verified Ward Boundary Registry',
      coverage: '58 Municipal Wards (Wards 1 through 58)',
      update_frequency: 'Authoritative Static Boundary Dataset',
      metrics: ['Ward Number', 'Locality Name', 'Centroid Coordinates', 'Polygon Geometries']
    },
    {
      id: 5,
      name: 'UrbanPulse Citizen Acoustic Intelligence Network',
      type: 'Crowdsourced Community Telemetry',
      status: 'Active Citizen Submission Feed',
      coverage: 'Community Submissions City-wide',
      update_frequency: 'Event-driven',
      metrics: ['Traffic Noise', 'Construction Noise', 'Industrial Decibel Logs', 'Loudspeaker Reports']
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Card */}
      <div className="smart-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
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
                Live Data Ingestion Pipeline
              </span>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                Sensory & Regulatory Feeds
              </span>
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              External APIs & Open Data Integrations
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8', maxWidth: '780px', lineHeight: 1.5 }}>
              Authoritative external APIs, regulatory frameworks, and community ingestion networks
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '6px',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ADE80',
            fontSize: '12.5px',
            fontWeight: 600
          }}>
            <Radio size={14} />
            <span>5 / 5 Data Connectors Integrated</span>
          </div>
        </div>
      </div>

      {/* Grid of 5 Data Providers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sources.map((src) => (
          <div key={src.id} className="smart-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase' }}>
                    SOURCE #{src.id} &bull; {src.type}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#F8FAFC' }}>
                  {src.name}
                </h3>
              </div>

              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: '4px',
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ADE80',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                {src.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '12px', color: '#CBD5E1', marginBottom: '12px' }}>
              <div>
                <span style={{ color: '#94A3B8' }}>Geographic Scope: </span>
                <strong>{src.coverage}</strong>
              </div>
              <div>
                <span style={{ color: '#94A3B8' }}>Update Frequency: </span>
                <strong>{src.update_frequency}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {src.metrics && src.metrics.map((m, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '3px 8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#94A3B8'
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
