import React, { useEffect, useState } from 'react'
import MapPlaceholder from './components/MapPlaceholder.jsx'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const AGENTS = [
  { key: 'traffic', label: '🚦 Traffic Agent', endpoint: '/traffic/status' },
  { key: 'events', label: '🎉 Events Agent', endpoint: '/events/nearby' },
  { key: 'student', label: '🎓 Student Agent', endpoint: '/student/matches' },
  { key: 'environment', label: '🌿 Environment Agent', endpoint: '/environment/status' },
]

function AgentBox({ label, data, loading, error }) {
  return (
    <div style={{
      border: '1px solid #ccc',
      margin: '12px',
      padding: '12px',
      borderRadius: '6px',
      minWidth: '300px',
      maxWidth: '500px',
    }}>
      <h3 style={{ marginTop: 0 }}>{label}</h3>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {data && (
        <pre style={{
          background: '#f4f4f4',
          padding: '8px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '300px',
          fontSize: '12px',
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default function App() {
  const [agentData, setAgentData] = useState({})
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    AGENTS.forEach(({ key, endpoint }) => {
      setLoading(prev => ({ ...prev, [key]: true }))
      fetch(`${API_BASE}${endpoint}`)
        .then(res => res.json())
        .then(data => {
          setAgentData(prev => ({ ...prev, [key]: data }))
          setLoading(prev => ({ ...prev, [key]: false }))
        })
        .catch(err => {
          setErrors(prev => ({ ...prev, [key]: err.message }))
          setLoading(prev => ({ ...prev, [key]: false }))
        })
    })
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>🌆 UrbanPulse Dashboard</h1>
      <p>Multi-agent AI platform for smart urban life — Belagavi, Karnataka</p>

      <MapPlaceholder />

      <h2>Agent Responses</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {AGENTS.map(({ key, label }) => (
          <AgentBox
            key={key}
            label={label}
            data={agentData[key]}
            loading={loading[key]}
            error={errors[key]}
          />
        ))}
      </div>
    </div>
  )
}
