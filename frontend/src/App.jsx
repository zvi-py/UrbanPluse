import React, { useEffect, useState, useCallback } from 'react'
import TopBar from './components/TopBar.jsx'
import Hero from './components/Hero.jsx'
import SignalStrip from './components/SignalStrip.jsx'
import AgentChapter from './components/AgentChapter.jsx'
import TrafficPanel from './components/TrafficPanel.jsx'
import EventsPanel from './components/EventsPanel.jsx'
import StudentPanel from './components/StudentPanel.jsx'
import EnvironmentPanel from './components/EnvironmentPanel.jsx'
import CityMap from './components/CityMap.jsx'
import Footer from './components/Footer.jsx'
import { MOCK_OVERVIEW_DATA } from './mockData.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function App() {
  const [overview, setOverview] = useState(null)
  const [eventsData, setEventsData] = useState(null)
  const [agentSources, setAgentSources] = useState({
    traffic: 'stub',
    events: 'csv_fallback',
    student: 'stub',
    environment: 'stub',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMock, setIsMock] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Fetch main /overview
      const res = await fetch(`${API_BASE}/overview`)
      if (!res.ok) {
        throw new Error(`Overview returned HTTP ${res.status}`)
      }
      const json = await res.json()
      setOverview(json)
      setIsMock(false)

      // 2. Fetch /events/nearby to get the full dataset & honest source
      try {
        const eventsRes = await fetch(`${API_BASE}/events/nearby?radius_km=25&limit=20`)
        if (eventsRes.ok) {
          const eventsJson = await eventsRes.json()
          setEventsData(eventsJson.data)
          if (eventsJson.source) {
            setAgentSources((prev) => ({ ...prev, events: eventsJson.source }))
          }
        }
      } catch (e) {
        console.warn('Could not load specific /events/nearby endpoint:', e)
      }

      // 3. Optional telemetry from individual endpoints to update sources
      try {
        const trafficRes = await fetch(`${API_BASE}/traffic/status`)
        if (trafficRes.ok) {
          const tJson = await trafficRes.json()
          if (tJson.source) {
            setAgentSources((prev) => ({ ...prev, traffic: tJson.source }))
          }
        }
      } catch {}
    } catch (err) {
      console.warn('Backend unavailable, engaging elegant fallback:', err)
      setError('The city is quiet right now. Displaying baseline architectural projection.')
      setOverview(MOCK_OVERVIEW_DATA)
      setEventsData(MOCK_OVERVIEW_DATA.data.events)
      setIsMock(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Extract agent payloads gracefully
  const trafficData = overview?.data?.traffic
  const envData = overview?.data?.environment
  const studentData = overview?.data?.student
  // Prefer direct eventsData if available, fallback to overview events
  const resolvedEvents = eventsData || overview?.data?.events

  const alerts = overview?.alerts || []
  const timestamp = overview?.timestamp
  const globalSource = isMock ? 'mock' : overview?.source || 'stub'

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      {/* Film Grain Texture Overlay */}
      <div className="grain-overlay" />

      {/* Large Blurred Ambient Glow */}
      <div className="ambient-glow" />

      {/* Sticky Header */}
      <TopBar
        source={globalSource}
        isMock={isMock}
        onRefresh={fetchData}
        loading={loading}
      />

      <main>
        {/* Hero Section */}
        <Hero
          timestamp={timestamp}
          source={globalSource}
          isMock={isMock}
        />

        {/* Error / Fallback Banner if backend unreachable */}
        {error && (
          <div
            style={{
              maxWidth: '1360px',
              margin: '0 auto 32px',
              padding: '0 28px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(212, 168, 95, 0.08)',
                border: '1px solid rgba(212, 168, 95, 0.25)',
                color: 'var(--status-warning)',
                fontSize: '13px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-warning)' }} />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchData}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(212, 168, 95, 0.4)',
                  color: 'var(--status-warning)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Retry Telemetry
              </button>
            </div>
          </div>
        )}

        {/* Cross-Agent Synthesis Signal Strip */}
        <SignalStrip alerts={alerts} />

        {/* Chapter 01: Traffic Agent */}
        <AgentChapter
          id="traffic"
          number="01"
          tag="TRANSIT & ARTERIAL FLOW // TRAFFIC AGENT"
          title="Dynamic Congestion Analysis &"
          italicWord="Alternate Rerouting."
          description="Autonomous classification of vehicular density across Belagavi's core road corridors. Evaluates real-time bottleneck thresholds and synthesizes bypass routing to mitigate arterial choking."
          source={agentSources.traffic}
          isMock={isMock}
          reversed={false}
        >
          <TrafficPanel
            data={trafficData}
            loading={loading && !overview}
            error={!trafficData && !loading ? 'No traffic telemetry available.' : null}
          />
        </AgentChapter>

        {/* Chapter 02: Events Agent */}
        <AgentChapter
          id="events"
          number="02"
          tag="COMMUNITY & ACADEMIC GATHERINGS // EVENT AGENT"
          title="TF-IDF Affinity Ranking &"
          italicWord="Spatial Proximity."
          description="Synthesizes campus festivals, technical hackathons, and cultural exhibits across Belagavi. Utilizes TF-IDF vector space modeling and cosine distance to align individual interests with nearby urban happenings."
          source={agentSources.events}
          isMock={isMock}
          reversed={true}
        >
          <EventsPanel
            data={resolvedEvents}
            loading={loading && !overview}
            error={!resolvedEvents && !loading ? 'No gathering telemetry available.' : null}
          />
        </AgentChapter>

        {/* Chapter 03: Student Agent */}
        <AgentChapter
          id="student"
          number="03"
          tag="COLLEGIATE CONNECTIVITY // STUDENT AGENT"
          title="Academic Interest Clusters &"
          italicWord="Peer Synthesis."
          description="Connects undergraduate engineering and data science peers across collegiate clusters. Analyzes shared research interests, technical skills, and active campus guilds through vector similarity."
          source={agentSources.student}
          isMock={isMock}
          reversed={false}
        >
          <StudentPanel
            data={studentData}
            loading={loading && !overview}
            error={!studentData && !loading ? 'No peer network telemetry available.' : null}
          />
        </AgentChapter>

        {/* Chapter 04: Environment Agent */}
        <AgentChapter
          id="environment"
          number="04"
          tag="ECOLOGICAL VITALS // ENVIRONMENT AGENT"
          title="Atmospheric Dispersion &"
          italicWord="Acoustic Anomalies."
          description="Surveils ambient air quality (AQI), microclimate temperature gradients, and acoustic decibel spikes throughout the Belagavi urban basin. Unsupervised Isolation Forests detect outlier environmental anomalies."
          source={agentSources.environment}
          isMock={isMock}
          reversed={true}
        >
          <EnvironmentPanel
            data={envData}
            loading={loading && !overview}
            error={!envData && !loading ? 'No atmospheric telemetry available.' : null}
          />
        </AgentChapter>

        {/* Section 05: Cartographic Atlas */}
        <CityMap events={resolvedEvents} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
