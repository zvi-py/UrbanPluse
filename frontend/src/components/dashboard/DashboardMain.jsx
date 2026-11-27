import React from 'react'
import MetricCardsBar from '../MetricCardsBar.jsx'
import CityMap from '../CityMap.jsx'
import AgentNetworkVisualizer from '../AgentNetworkVisualizer.jsx'
import DiscoveryGrid from './DiscoveryGrid.jsx'
import { Navigation, Radio, CalendarPlus, ChevronRight, Sparkles } from 'lucide-react'

export default function DashboardMain({
  overview,
  eventsData,
  trafficData,
  envData,
  studentData,
  alerts = [],
  onOpenHostModal,
  onOpenGeminiModal,
  onSelectTab,
  theme = 'light',
  agentSources,
}) {
  const isLight = theme === 'light'

  const resolvedAlerts = alerts && alerts.length > 0 ? alerts : [
    {
      severity: 'advisory',
      message: 'High-attendance tech gatherings detected near Tilakwadi. Traffic flow along Congress Road may experience minor slowing.',
      time: '12:30',
    },
    {
      severity: 'critical',
      message: 'Accident reported near Market Area corridor. Autonomous rerouting via NH48 Bypass saves ~8-12 minutes for campus commuters.',
      time: '14:15',
    },
  ]

  const corridorLocations = trafficData?.locations || [
    { location: 'Market Area (Khade Bazar)', congestion_score: 0.85, congestion_level: 'high', incident: 'accident' },
    { location: 'Khanapur Road (Udyambag)', congestion_score: 0.78, congestion_level: 'high', incident: 'none' },
    { location: 'College Road (BIMS)', congestion_score: 0.62, congestion_level: 'moderate', incident: 'roadwork' },
    { location: 'Congress Road (Tilakwadi)', congestion_score: 0.65, congestion_level: 'moderate', incident: 'none' },
    { location: 'Camp Area (Club Road)', congestion_score: 0.28, congestion_level: 'low', incident: 'none' },
    { location: 'NH48 Bypass Corridor', congestion_score: 0.30, congestion_level: 'low', incident: 'none' },
  ]

  const cardStyle = {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-hairline)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    boxShadow: 'var(--shadow-glass)',
    transition: 'all 0.2s ease',
  }

  return (
    <div
      style={{
        flex: 1,
        padding: '32px 40px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        maxWidth: '1360px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* 1. Dashboard Header with Sage Editorial Typography */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '18px', height: '2px', backgroundColor: 'var(--accent)' }} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
              }}
            >
              Belagavi Smart Urban Life
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            Belagavi Urban Pulse
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, maxWidth: '600px', lineHeight: 1.6 }}>
            Autonomous multi-agent intelligence coordinating transit arteries, collegiate gatherings, and municipal environment.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Ask Gemini AI Trigger Button */}
          <button
            onClick={onOpenGeminiModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--agent-gemini-bg)',
              border: '1px solid var(--agent-gemini-border)',
              color: 'var(--agent-gemini)',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={14} />
            <span>Ask Gemini AI</span>
          </button>

          {/* Host Gathering Action */}
          <button
            onClick={onOpenHostModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--accent)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(82, 106, 80, 0.25)',
              transition: 'opacity 0.15s ease',
            }}
          >
            <CalendarPlus size={14} />
            <span>Host Gathering</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards with Sage Luxury Styling */}
      <MetricCardsBar
        overview={overview}
        eventsData={eventsData}
        trafficData={trafficData}
        envData={envData}
        studentData={studentData}
        theme={theme}
      />

      {/* 3. The Main Centerpiece: Belagavi Cartographic Atlas */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 24px 16px',
          boxShadow: 'var(--shadow-glass)',
        }}
      >
        <CityMap
          events={eventsData}
          trafficData={trafficData}
          theme={theme}
          embedded={true}
        />
      </div>

      {/* 4. Live 2-Column Operational Briefing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left: Arterial Corridor Flow - Terracotta theme */}
        <div style={{ ...cardStyle, border: '1px solid var(--agent-traffic-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--agent-traffic-bg)',
                  color: 'var(--agent-traffic)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Navigation size={15} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Arterial Corridor Congestion
              </span>
            </div>
            <button
              onClick={() => onSelectTab('traffic')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--agent-traffic)',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Corridors &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {corridorLocations.slice(0, 5).map((loc) => {
              const isHigh = loc.congestion_level === 'high'
              const isMod = loc.congestion_level === 'moderate'
              const color = isHigh ? '#B25938' : isMod ? '#9C6C42' : '#526A50'

              return (
                <div
                  key={loc.location}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {loc.location}
                    </div>
                    {loc.incident && loc.incident !== 'none' && (
                      <div style={{ fontSize: '11px', color: '#B25938', textTransform: 'capitalize', fontWeight: 600 }}>
                        Incident: {loc.incident}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 700, color: color }}>
                      {(loc.congestion_score * 100).toFixed(0)}% Delay
                    </div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 600 }}>
                      {loc.congestion_level}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Multi-Agent Synthesis Advisories */}
        <div style={{ ...cardStyle, border: '1px solid var(--agent-events-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--agent-events-bg)',
                  color: 'var(--agent-events)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Radio size={15} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Multi-Agent Synthesis Advisories
              </span>
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontFamily: 'monospace', fontWeight: 600 }}>
              LIVE FEED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {resolvedAlerts.map((alert, idx) => {
              const isCrit = alert.severity === 'critical'
              const accentColor = isCrit ? 'var(--agent-traffic)' : 'var(--agent-events)'

              return (
                <div
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-hairline)',
                    borderLeft: `3px solid ${accentColor}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {isCrit ? 'CORRIDOR ALERT' : 'CROSS-AGENT ADVISORY'}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                      {alert.time || '14:15'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {alert.message}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 5. Four Intelligent Agents Architecture */}
      <div>
        <AgentNetworkVisualizer
          onSelectAgent={onSelectTab}
          agentSources={agentSources}
          onOpenGeminiModal={onOpenGeminiModal}
        />
      </div>

      {/* 6. Quick Operational Shortcuts */}
      <div>
        <DiscoveryGrid
          onOpenHostModal={onOpenHostModal}
          onSelectTab={onSelectTab}
          studentCount={studentData?.total_students || 118}
          eventsCount={eventsData?.total_events || (Array.isArray(eventsData?.events) ? eventsData.events.length : 26)}
          theme={theme}
        />
      </div>
    </div>
  )
}
