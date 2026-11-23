import React, { useState } from 'react'
import MetricCardsBar from '../MetricCardsBar.jsx'
import DiscoveryGrid from './DiscoveryGrid.jsx'
import CenterMapCard from './CenterMapCard.jsx'
import AgentNetworkVisualizer from '../AgentNetworkVisualizer.jsx'
import { Sparkles, BarChart3, LayoutGrid, Cpu } from 'lucide-react'

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
  const [subTab, setSubTab] = useState('dashboard') // 'dashboard' | 'analytics' | 'network'

  return (
    <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sub-navigation tabs: Dashboard | Analytics | Four Agents */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => setSubTab('dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 0',
              color: subTab === 'dashboard' ? '#06B6D4' : '#9CA3AF',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              borderBottom: subTab === 'dashboard' ? '2.5px solid #06B6D4' : '2.5px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <LayoutGrid size={16} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setSubTab('network')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 0',
              color: subTab === 'network' ? '#06B6D4' : '#9CA3AF',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              borderBottom: subTab === 'network' ? '2.5px solid #06B6D4' : '2.5px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Cpu size={16} />
            <span>Four Intelligent Agents</span>
          </button>

          <button
            onClick={() => setSubTab('analytics')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 0',
              color: subTab === 'analytics' ? '#06B6D4' : '#9CA3AF',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              borderBottom: subTab === 'analytics' ? '2.5px solid #06B6D4' : '2.5px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BarChart3 size={16} />
            <span>City Analytics</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Feed:</span>
          <span
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#F9FAFB',
              fontWeight: 600,
            }}
          >
            Real-time Live
          </span>
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

      {/* Conditional Content based on Sub-tab */}
      {subTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Action and Discovery Grid */}
          <DiscoveryGrid
            onOpenHostModal={onOpenHostModal}
            onSelectTab={onSelectTab}
            studentCount={studentData?.total_students || 118}
            eventsCount={eventsData?.total_events || (Array.isArray(eventsData?.events) ? eventsData.events.length : 31)}
          />

          {/* Center Map Card with Radars and Event Pins */}
          <CenterMapCard
            events={eventsData}
            trafficData={trafficData}
            theme={theme}
            onOpenHostModal={onOpenHostModal}
          />
        </div>
      )}

      {subTab === 'network' && (
        <div style={{ marginTop: '12px' }}>
          <AgentNetworkVisualizer
            onSelectAgent={onSelectTab}
            agentSources={agentSources}
          />
        </div>
      )}

      {subTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Traffic Breakdown */}
          <div className="video-glass-card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F9FAFB', marginBottom: '12px' }}>
              Corridor Traffic Densities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(trafficData?.locations || []).map((loc) => (
                <div key={loc.location} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12.5px', color: '#F9FAFB' }}>{loc.location}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: loc.congestion_level === 'high' ? '#EF4444' : loc.congestion_level === 'moderate' ? '#F59E0B' : '#10B981' }}>
                      {(loc.congestion_score * 100).toFixed(0)}/100
                    </span>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#9CA3AF' }}>{loc.congestion_level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Basin Overview */}
          <div className="video-glass-card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F9FAFB', marginBottom: '12px' }}>
              Belagavi Environmental Vitals
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12.5px', color: '#F9FAFB' }}>Composite AQI</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#10B981' }}>{envData?.aqi || 84.0} (Satisfactory)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12.5px', color: '#F9FAFB' }}>Active Anomaly Outliers</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: envData?.anomaly_detected ? '#EF4444' : '#10B981' }}>
                  {envData?.anomaly_detected ? '1 Anomaly Flagged' : 'None Detected'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12.5px', color: '#F9FAFB' }}>Wards Monitored</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#06B6D4' }}>58 Municipal Wards</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
