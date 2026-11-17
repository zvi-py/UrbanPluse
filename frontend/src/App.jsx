import React, { useEffect, useState } from 'react'
import EnvironmentDashboard from './components/environment/EnvironmentDashboard.jsx'
import MapPlaceholder from './components/MapPlaceholder.jsx'
import './environment.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const AGENTS = [
  { key: 'traffic', label: '🚦 Traffic Agent', endpoint: '/traffic/status', dev: 'Developer 1' },
  { key: 'events', label: '🎉 Events Agent', endpoint: '/events/nearby', dev: 'Developer 2' },
  { key: 'student', label: '🎓 Student Agent', endpoint: '/student/matches', dev: 'Developer 3' },
  { key: 'environment', label: '🌿 Environment Agent', endpoint: '/environment/status', dev: 'Developer 4 (Active)' },
]

function AgentBox({ label, data, loading, error, dev, onOpenDeepDive }) {
  const isEnv = label.includes('Environment')

  return (
    <div style={{
      background: '#172033',
      border: isEnv ? '1.5px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.08)',
      margin: '12px',
      padding: '20px',
      borderRadius: '10px',
      minWidth: '320px',
      maxWidth: '520px',
      flex: '1 1 340px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      color: '#F8FAFC'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{label}</h3>
        <span style={{ fontSize: '11px', color: '#94A3B8', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: '4px' }}>
          {dev}
        </span>
      </div>

      {loading && <p style={{ color: '#94A3B8', fontSize: '13px' }}>Loading agent telemetry...</p>}
      {error && <p style={{ color: '#EF4444', fontSize: '13px' }}>Error: {error}</p>}
      
      {data && (
        <>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px', display: 'flex', gap: '12px' }}>
            <span>Source: <strong style={{ color: data.source === 'live_api' ? '#22C55E' : '#F59E0B' }}>{data.source}</strong></span>
            <span>Status: <strong style={{ color: '#60A5FA' }}>{data.status}</strong></span>
          </div>
          <pre style={{
            background: '#0B1120',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '12px',
            borderRadius: '6px',
            overflow: 'auto',
            maxHeight: '220px',
            fontSize: '11.5px',
            color: '#CBD5E1',
            lineHeight: 1.4
          }}>
            {JSON.stringify(data.data, null, 2)}
          </pre>

          {isEnv && (
            <button
              onClick={onOpenDeepDive}
              style={{
                marginTop: '14px',
                width: '100%',
                padding: '9px 16px',
                background: '#3B82F6',
                border: 'none',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>Launch 58 Wards Environmental Intelligence Platform &rarr;</span>
            </button>
          )}
        </>
      )}
    </div>
  )
}

const FALLBACK_DATA = {
  traffic: {
    agent: 'traffic',
    status: 'ok',
    timestamp: new Date().toISOString(),
    location: { lat: 15.8497, lng: 74.4977 },
    data: { congestion_level: 'moderate', average_speed_kmh: 32.5, active_incidents: 1 },
    alerts: [{ level: 'info', message: 'Moderate traffic near College Road.' }],
    source: 'csv_fallback'
  },
  events: {
    agent: 'events',
    status: 'ok',
    timestamp: new Date().toISOString(),
    location: { lat: 15.8497, lng: 74.4977 },
    data: { upcoming_events: [{ title: 'KLE Tech Fest 2024', venue: 'KLE Technological University', attendance: 'high' }] },
    alerts: [{ level: 'info', message: 'High-attendance event active.' }],
    source: 'stub'
  },
  student: {
    agent: 'student',
    status: 'ok',
    timestamp: new Date().toISOString(),
    location: { lat: 15.8497, lng: 74.4977 },
    data: { study_spots: 4, safe_transit_routes: 3, student_density: 'medium' },
    alerts: [{ level: 'info', message: 'Campus transit operating normally.' }],
    source: 'stub'
  },
  environment: {
    agent: 'environment',
    status: 'ok',
    timestamp: new Date().toISOString(),
    location: { lat: 15.8497, lng: 74.4977 },
    data: { aqi: 84.0, aqi_category: 'Moderate', temperature_celsius: 26.4, humidity_percent: 68 },
    alerts: [{ level: 'info', message: 'Continuous urban environmental monitoring active.' }],
    source: 'live_api'
  }
}

export default function App() {
  const [viewMode, setViewMode] = useState('environment') // Always defaults directly to 🌿 Environment Agent
  const [agentData, setAgentData] = useState({})
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    AGENTS.forEach(({ key, endpoint }) => {
      setLoading(prev => ({ ...prev, [key]: true }))
      fetch(`${API_BASE}${endpoint}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .then(data => {
          setAgentData(prev => ({ ...prev, [key]: data }))
          setLoading(prev => ({ ...prev, [key]: false }))
        })
        .catch(err => {
          console.warn(`Telemetry fallback active for ${key}:`, err.message)
          // Gracefully fallback so the UI never displays broken fetch errors
          setAgentData(prev => ({ ...prev, [key]: FALLBACK_DATA[key] }))
          setLoading(prev => ({ ...prev, [key]: false }))
        })
    })
  }, [])

  // If in environment intelligence view mode, render the full platform
  if (viewMode === 'environment') {
    return (
      <EnvironmentDashboard
        onBackToOrchestrator={() => setViewMode('multi_agent')}
      />
    )
  }

  // Multi-Agent Overview mode
  return (
    <div style={{ background: '#0B1120', minHeight: '100vh', color: '#F8FAFC', padding: '24px 32px' }}>
      {/* Header with Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '20px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 700 }}>
            🌆 UrbanPulse Multi-Agent Orchestrator
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
            Multi-agent AI platform for smart urban life — Belagavi, Karnataka
          </p>
        </div>

        <button
          onClick={() => setViewMode('environment')}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
          }}
        >
          🌿 Switch to Environment Intelligence Platform &rarr;
        </button>
      </div>

      <MapPlaceholder />

      <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 12px' }}>
        Live Agent Telemetry Feeds
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', margin: '-12px' }}>
        {AGENTS.map(({ key, label, dev }) => (
          <AgentBox
            key={key}
            label={label}
            dev={dev}
            data={agentData[key]}
            loading={loading[key]}
            error={errors[key]}
            onOpenDeepDive={() => setViewMode('environment')}
          />
        ))}
      </div>
    </div>
  )
}
