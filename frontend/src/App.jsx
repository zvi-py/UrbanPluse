import React, { useEffect, useState, useCallback } from 'react'
import AppSidebar from './components/dashboard/AppSidebar.jsx'
import AppHeader from './components/dashboard/AppHeader.jsx'
import DashboardMain from './components/dashboard/DashboardMain.jsx'
import AiInsightsPanel from './components/dashboard/AiInsightsPanel.jsx'
import TrafficPanel from './components/TrafficPanel.jsx'
import EventsPanel from './components/EventsPanel.jsx'
import StudentPanel from './components/StudentPanel.jsx'
import EnvironmentPanel from './components/EnvironmentPanel.jsx'
import CityMap from './components/CityMap.jsx'
import HostEventModal from './components/HostEventModal.jsx'
import AgentNetworkVisualizer from './components/AgentNetworkVisualizer.jsx'
import EnvironmentDashboard from './components/environment/EnvironmentDashboard.jsx'
import { MOCK_OVERVIEW_DATA } from './mockData.js'

import './dashboard-video.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function App() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'student' | 'events' | 'traffic' | 'environment' | 'agents_core' | 'map'
  const [searchQuery, setSearchQuery] = useState('')
  const [isHostModalOpen, setIsHostModalOpen] = useState(false)

  const [theme, setTheme] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const paramTheme = params.get('theme')
        if (paramTheme === 'light' || paramTheme === 'dark') {
          return paramTheme
        }
      }
      return localStorage.getItem('urbanpulse_theme') || 'dark'
    } catch {
      return 'dark'
    }
  })

  const [overview, setOverview] = useState(null)
  const [eventsData, setEventsData] = useState(null)
  const [trafficData, setTrafficData] = useState(null)
  const [agentSources, setAgentSources] = useState({
    traffic: 'csv_fallback',
    events: 'csv_fallback',
    student: 'stub',
    environment: 'csv_fallback',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMock, setIsMock] = useState(false)

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('urbanpulse_theme', theme)
    } catch {}
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

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

      if (json?.data?.traffic) {
        setTrafficData(json.data.traffic)
      }

      // Update environment source from overview payload if present
      if (json?.data?.environment?.source) {
        setAgentSources((prev) => ({
          ...prev,
          environment: json.data.environment.source,
        }))
      }

      // 2. Fetch /events/nearby to get the full dataset & honest source
      try {
        const eventsRes = await fetch(`${API_BASE}/events/nearby?radius_km=25&limit=35`)
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

      // 3. Fetch /traffic/status
      try {
        const trafficRes = await fetch(`${API_BASE}/traffic/status`)
        if (trafficRes.ok) {
          const tJson = await trafficRes.json()
          if (tJson.data) {
            setTrafficData(tJson.data)
          }
          if (tJson.source) {
            setAgentSources((prev) => ({ ...prev, traffic: tJson.source }))
          }
        }
      } catch {}
    } catch (err) {
      console.warn('Backend unavailable, engaging elegant fallback:', err)
      setError('Backend telemetry unavailable. Engaging baseline projection.')
      setOverview(MOCK_OVERVIEW_DATA)
      setEventsData(MOCK_OVERVIEW_DATA.data.events)
      setTrafficData(MOCK_OVERVIEW_DATA.data.traffic)
      setIsMock(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // If user opens the 58-Ward environment platform
  if (activeTab === 'environment') {
    return (
      <EnvironmentDashboard
        onBackToOrchestrator={() => setActiveTab('overview')}
      />
    )
  }

  // Extract agent payloads gracefully
  const resolvedTrafficData = trafficData || overview?.data?.traffic
  const envData = overview?.data?.environment
  const studentData = overview?.data?.student
  const resolvedEvents = eventsData || overview?.data?.events
  const alerts = overview?.alerts || []

  return (
    <div className="video-dashboard-layout">
      {/* 1. Left Fixed Sidebar matching Video Frame 5 & 6 */}
      <AppSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenHostModal={() => setIsHostModalOpen(true)}
        alertCount={alerts.length || 3}
      />

      {/* Main Column (Header + Dynamic Stage) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        {/* 2. Top Header matching Video Frame 5 & 6 */}
        <AppHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRefresh={fetchData}
          loading={loading}
          theme={theme}
          onToggleTheme={toggleTheme}
          alertCount={alerts.length || 3}
        />

        {/* 3. Center Area (Dashboard Stage + Right AI Insights Panel) */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Main Content Area */}
          {activeTab === 'overview' && (
            <>
              <DashboardMain
                overview={overview}
                eventsData={resolvedEvents}
                trafficData={resolvedTrafficData}
                envData={envData}
                studentData={studentData}
                onOpenHostModal={() => setIsHostModalOpen(true)}
                onSelectTab={setActiveTab}
                theme={theme}
                agentSources={agentSources}
              />
              <AiInsightsPanel
                alerts={alerts}
                events={resolvedEvents}
                onOpenHostModal={() => setIsHostModalOpen(true)}
              />
            </>
          )}

          {activeTab === 'student' && (
            <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Student Connectivity & Peer Matcher</h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#06B6D4', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  &larr; Back to Dashboard
                </button>
              </div>
              <StudentPanel
                data={studentData}
                loading={loading && !overview}
                error={!studentData && !loading ? 'No peer network telemetry available.' : null}
              />
            </div>
          )}

          {activeTab === 'events' && (
            <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Discover Gatherings & Campus Activities</h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#06B6D4', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  &larr; Back to Dashboard
                </button>
              </div>
              <EventsPanel
                data={resolvedEvents}
                loading={loading && !overview}
                error={!resolvedEvents && !loading ? 'No gathering telemetry available.' : null}
              />
            </div>
          )}

          {activeTab === 'traffic' && (
            <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Traffic Intelligence & Corridor Congestion</h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#06B6D4', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  &larr; Back to Dashboard
                </button>
              </div>
              <TrafficPanel
                data={resolvedTrafficData}
                loading={loading && !overview}
                error={!resolvedTrafficData && !loading ? 'No traffic telemetry available.' : null}
              />
            </div>
          )}

          {activeTab === 'agents_core' && (
            <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Four Intelligent Agents · Autonomous Architecture</h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#06B6D4', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  &larr; Back to Dashboard
                </button>
              </div>
              <AgentNetworkVisualizer
                agentSources={agentSources}
                onSelectAgent={setActiveTab}
              />
            </div>
          )}

          {activeTab === 'map' && (
            <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Explore City · Belagavi Cartographic Atlas</h2>
                <button
                  onClick={() => setActiveTab('overview')}
                  style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#06B6D4', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  &larr; Back to Dashboard
                </button>
              </div>
              <div style={{ flex: 1, borderRadius: '14px', overflow: 'hidden' }}>
                <CityMap
                  events={resolvedEvents}
                  trafficData={resolvedTrafficData}
                  theme={theme}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Host Event Slide-over Modal Form */}
      <HostEventModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        onEventCreated={fetchData}
      />
    </div>
  )
}
