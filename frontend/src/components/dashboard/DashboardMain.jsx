import React, { useState } from 'react'
import MetricCardsBar from '../MetricCardsBar.jsx'
import DiscoveryGrid from './DiscoveryGrid.jsx'
import BelagaviMapWidget from './BelagaviMapWidget.jsx'
import AgentNetworkVisualizer from '../AgentNetworkVisualizer.jsx'
import { LayoutGrid, Cpu, Activity, BarChart2 } from 'lucide-react'

export default function DashboardMain({
  overview,
  eventsData,
  trafficData,
  envData,
  studentData,
  onOpenHostModal,
  onSelectTab,
  theme,
  agentSources,
}) {
  const [subTab, setSubTab] = useState('overview') // 'overview' | 'network' | 'telemetry'

  return (
    <div
      style={{
        flex: 1,
        padding: '20px 24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Sub-Header Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1E293B',
          paddingBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { id: 'overview', label: 'Operational Overview', icon: LayoutGrid },
            { id: 'network', label: 'Four Agents Architecture', icon: Cpu },
            { id: 'telemetry', label: 'Corridor & Basin Telemetry', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = subTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                style={{
                  background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(56, 189, 248, 0.3)' : 'transparent'}`,
                  color: isActive ? '#38BDF8' : '#94A3B8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
          <span>STREAM:</span>
          <span style={{ color: '#10B981', fontWeight: 600 }}>SYNCHRONIZED (BELAGAVI)</span>
        </div>
      </div>

      {/* Top 4 KPI Metrics Row */}
      <MetricCardsBar
        overview={overview}
        eventsData={eventsData}
        trafficData={trafficData}
        envData={envData}
        studentData={studentData}
      />

      {/* Stage: Operational Overview */}
      {subTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Embedded Belagavi Map with Traffic Corridors & Radars */}
          <BelagaviMapWidget
            events={eventsData}
            trafficData={trafficData}
            theme={theme}
            onOpenHostModal={onOpenHostModal}
          />

          {/* Operational Actions Grid */}
          <DiscoveryGrid
            onOpenHostModal={onOpenHostModal}
            onSelectTab={onSelectTab}
            studentCount={studentData?.total_students || 118}
            eventsCount={eventsData?.total_events || (Array.isArray(eventsData?.events) ? eventsData.events.length : 31)}
          />
        </div>
      )}

      {/* Stage: Four Intelligent Agents Core */}
      {subTab === 'network' && (
        <div>
          <AgentNetworkVisualizer
            onSelectAgent={onSelectTab}
            agentSources={agentSources}
          />
        </div>
      )}

      {/* Stage: Detailed Corridor Telemetry */}
      {subTab === 'telemetry' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* Traffic Observations Table */}
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', marginBottom: '12px' }}>
              Corridor Flow Observations (CSV Source)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(trafficData?.locations || []).map((loc) => (
                <div
                  key={loc.location}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#F8FAFC', fontWeight: 500 }}>{loc.location}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: loc.congestion_level === 'high' ? '#EF4444' : loc.congestion_level === 'moderate' ? '#F59E0B' : '#10B981' }}>
                      {(loc.congestion_score * 100).toFixed(0)} / 100
                    </span>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748B' }}>
                      {loc.congestion_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Basin Metrics */}
          <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', marginBottom: '12px' }}>
              58-Ward Atmospheric & Acoustic Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>City Composite AQI</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>
                  {envData?.aqi || 84.0} (Satisfactory)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Isolation Forest Anomalies</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: envData?.anomaly_detected ? '#EF4444' : '#10B981', fontFamily: 'monospace' }}>
                  {envData?.anomaly_detected ? '1 Detected' : '0 (Nominal)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Monitored BCC Wards</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8', fontFamily: 'monospace' }}>
                  58 Municipal Wards
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
