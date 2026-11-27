import React from 'react'
import MetricCardsBar from '../MetricCardsBar.jsx'
import CityMap from '../CityMap.jsx'
import AgentNetworkVisualizer from '../AgentNetworkVisualizer.jsx'
import DiscoveryGrid from './DiscoveryGrid.jsx'
import { Navigation, Radio, CalendarPlus, ChevronRight } from 'lucide-react'

export default function DashboardMain({
  overview,
  eventsData,
  trafficData,
  envData,
  studentData,
  alerts = [],
  onOpenHostModal,
  onSelectTab,
  theme,
  agentSources,
}) {
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
    { location: 'Market Area', congestion_score: 0.85, congestion_level: 'high', incident: 'accident' },
    { location: 'College Road', congestion_score: 0.60, congestion_level: 'moderate', incident: 'roadwork' },
    { location: 'Belagavi City Center', congestion_score: 0.55, congestion_level: 'moderate', incident: 'none' },
    { location: 'NH48 Bypass', congestion_score: 0.30, congestion_level: 'low', incident: 'none' },
  ]

  return (
    <div
      style={{
        flex: 1,
        padding: '28px 36px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* 1. Dashboard Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary, #F8FAFC)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Belagavi Urban Pulse
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary, #94A3B8)', margin: 0 }}>
            Autonomous multi-agent intelligence coordinating transit, campus events, and municipal environment.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10B981',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span>4 / 4 AGENTS IN SYNC</span>
          </div>

          <button
            onClick={onOpenHostModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              borderRadius: '6px',
              backgroundColor: '#10B981',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <CalendarPlus size={14} />
            <span>Host Gathering</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <MetricCardsBar
        overview={overview}
        eventsData={eventsData}
        trafficData={trafficData}
        envData={envData}
        studentData={studentData}
      />

      {/* 3. The Main Thing: Belagavi Cartographic Atlas */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface, #0F172A)',
          border: '1px solid var(--border-hairline, #1E293B)',
          borderRadius: '12px',
          padding: '24px 24px 16px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
        {/* Left: Arterial Corridor Flow */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface, #0F172A)',
            border: '1px solid var(--border-hairline, #1E293B)',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={15} color="#06B6D4" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F8FAFC)' }}>
                Arterial Corridor Congestion
              </span>
            </div>
            <button
              onClick={() => onSelectTab('traffic')}
              style={{ background: 'transparent', border: 'none', color: '#38BDF8', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            >
              Corridor Deep Dive &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {corridorLocations.map((loc) => {
              const isHigh = loc.congestion_level === 'high'
              const isMod = loc.congestion_level === 'moderate'
              const color = isHigh ? '#EF4444' : isMod ? '#F59E0B' : '#10B981'

              return (
                <div
                  key={loc.location}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary, #F8FAFC)' }}>
                      {loc.location}
                    </div>
                    {loc.incident && loc.incident !== 'none' && (
                      <div style={{ fontSize: '10.5px', color: color, textTransform: 'capitalize' }}>
                        Incident: {loc.incident}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 700, color: color }}>
                      {(loc.congestion_score * 100).toFixed(0)}% Delay
                    </div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748B' }}>
                      {loc.congestion_level}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Cross-Agent Real-time Advisories */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface, #0F172A)',
            border: '1px solid var(--border-hairline, #1E293B)',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={15} color="#10B981" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F8FAFC)' }}>
                Multi-Agent Synthesis Advisories
              </span>
            </div>
            <span style={{ fontSize: '10.5px', color: '#64748B', fontFamily: 'monospace' }}>
              LIVE FEED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {resolvedAlerts.map((alert, idx) => {
              const isCrit = alert.severity === 'critical'
              const accentColor = isCrit ? '#EF4444' : '#F59E0B'

              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderLeft: `3px solid ${accentColor}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {isCrit ? 'CORRIDOR ALERT' : 'CROSS-AGENT ADVISORY'}
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace' }}>
                      {alert.time || '14:15'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary, #CBD5E1)', lineHeight: 1.45, margin: 0 }}>
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
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #F8FAFC)', margin: '0 0 4px 0' }}>
            Autonomous Multi-Agent Architecture
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94A3B8)', margin: 0 }}>
            Four specialized agents cross-correlating urban and campus telemetry in real time.
          </p>
        </div>

        <AgentNetworkVisualizer
          onSelectAgent={onSelectTab}
          agentSources={agentSources}
        />
      </div>

      {/* 6. Quick Operational Shortcuts */}
      <div>
        <DiscoveryGrid
          onOpenHostModal={onOpenHostModal}
          onSelectTab={onSelectTab}
          studentCount={studentData?.total_students || 118}
          eventsCount={eventsData?.total_events || (Array.isArray(eventsData?.events) ? eventsData.events.length : 31)}
        />
      </div>
    </div>
  )
}
