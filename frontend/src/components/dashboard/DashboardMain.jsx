import React, { useState } from 'react'
import MetricCardsBar from '../MetricCardsBar.jsx'
import DiscoveryGrid from './DiscoveryGrid.jsx'
import BelagaviMapWidget from './BelagaviMapWidget.jsx'
import AgentNetworkVisualizer from '../AgentNetworkVisualizer.jsx'
import { MapPin, Cpu, Radio, Zap, AlertTriangle, CheckCircle2, ChevronRight, Navigation } from 'lucide-react'

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
  const [activeView, setActiveView] = useState('map') // 'map' | 'agents' | 'alerts' | 'actions'

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
        gap: '24px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* 1. Dashboard Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Belagavi Urban Pulse
          </h1>
          <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: 0 }}>
            Autonomous multi-agent intelligence coordinating transit, campus events, and municipal environment.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
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
            <span>4 / 4 AGENTS ONLINE</span>
          </div>

          <button
            onClick={onOpenHostModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: '#06B6D4',
              border: 'none',
              color: '#090D14',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>+ Host Gathering</span>
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

      {/* 3. Section Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #1E293B',
          paddingBottom: '12px',
        }}
      >
        {[
          { id: 'map', label: 'City Map & Corridors', icon: MapPin },
          { id: 'agents', label: '4 Intelligent Agents', icon: Cpu },
          { id: 'alerts', label: `System Alerts (${resolvedAlerts.length})`, icon: Radio },
          { id: 'actions', label: 'Quick Shortcuts', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeView === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '6px',
                backgroundColor: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(56, 189, 248, 0.35)' : 'transparent'}`,
                color: isActive ? '#38BDF8' : '#94A3B8',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 4. Tab 1: Map & Live Corridors View */}
      {activeView === 'map' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Belagavi Leaflet Map */}
          <BelagaviMapWidget
            events={eventsData}
            trafficData={trafficData}
            theme={theme}
            onOpenHostModal={onOpenHostModal}
          />

          {/* 2-Column Operational Briefing below the map */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
            {/* Left: Arterial Corridor Status */}
            <div
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                padding: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={15} color="#06B6D4" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                    Belagavi Arterial Corridors
                  </span>
                </div>
                <button
                  onClick={() => onSelectTab('traffic')}
                  style={{ background: 'transparent', border: 'none', color: '#38BDF8', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  View Details &rarr;
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
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#F8FAFC' }}>
                          {loc.location}
                        </div>
                        {loc.incident && loc.incident !== 'none' && (
                          <div style={{ fontSize: '10.5px', color: color, textTransform: 'capitalize' }}>
                            Reported: {loc.incident}
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

            {/* Right: Cross-Agent Real-time Alerts */}
            <div
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                padding: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={15} color="#10B981" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                    Active Cross-Agent Advisories
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                  LIVE STREAM
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
                          {alert.time || 'NOW'}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.45, margin: 0 }}>
                        {alert.message}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: 4 Intelligent Agents Architecture */}
      {activeView === 'agents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AgentNetworkVisualizer
            onSelectAgent={onSelectTab}
            agentSources={agentSources}
          />
        </div>
      )}

      {/* 6. Tab 3: Detailed Alerts Center */}
      {activeView === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {resolvedAlerts.map((alert, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderLeft: `4px solid ${alert.severity === 'critical' ? '#EF4444' : '#F59E0B'}`,
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: alert.severity === 'critical' ? '#EF4444' : '#F59E0B', textTransform: 'uppercase' }}>
                    {alert.severity === 'critical' ? 'CRITICAL INCIDENT' : 'CROSS-AGENT ADVISORY'}
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#64748B', fontFamily: 'monospace' }}>
                    {alert.time || '14:15'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#E2E8F0', margin: 0, lineHeight: 1.5 }}>
                  {alert.message}
                </p>
              </div>

              <button
                onClick={() => onSelectTab('traffic')}
                style={{
                  background: 'transparent',
                  border: '1px solid #1E293B',
                  color: '#38BDF8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Inspect Corridor &rarr;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 7. Tab 4: Quick Operational Shortcuts */}
      {activeView === 'actions' && (
        <DiscoveryGrid
          onOpenHostModal={onOpenHostModal}
          onSelectTab={onSelectTab}
          studentCount={studentData?.total_students || 118}
          eventsCount={eventsData?.total_events || (Array.isArray(eventsData?.events) ? eventsData.events.length : 31)}
        />
      )}
    </div>
  )
}
