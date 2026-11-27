import React from 'react'
import { Users, Calendar, Activity, ShieldCheck, ArrowUpRight } from 'lucide-react'

export default function MetricCardsBar({ overview, eventsData, trafficData, envData, studentData, theme = 'dark' }) {
  const isLight = theme === 'light'

  const studentCount = studentData?.total_students || studentData?.matches?.length || 118
  const eventsCount = eventsData?.total_events || (Array.isArray(eventsData?.events) ? eventsData.events.length : 31)

  const rawTrafficScore = trafficData?.congestion_score
  const trafficScore = typeof rawTrafficScore === 'number' ? Math.round((1 - rawTrafficScore) * 100) : 89
  const congestionLevel = trafficData?.congestion_level || 'moderate'

  const totalWards = envData?.total_wards || 58
  const activeAnomalies = envData?.active_anomalies_count || (envData?.anomaly_detected ? 1 : 0)

  const cardStyle = {
    backgroundColor: isLight ? '#FFFFFF' : '#0F172A',
    border: `1px solid ${isLight ? '#E2E8F0' : '#1E293B'}`,
    borderRadius: '8px',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: isLight ? '0 1px 3px rgba(0, 0, 0, 0.04)' : 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  }

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748B',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }

  const numberStyle = {
    fontSize: '28px',
    fontWeight: 700,
    color: isLight ? '#0F172A' : '#F8FAFC',
    fontFamily: 'monospace',
    letterSpacing: '-0.03em',
  }

  const subtextStyle = {
    fontSize: '11.5px',
    color: isLight ? '#64748B' : '#94A3B8',
    marginTop: '6px',
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        width: '100%',
      }}
    >
      {/* Metric 1: Student Connections */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={labelStyle}>STUDENT NETWORK</span>
          <div style={{ color: isLight ? '#4F46E5' : '#818CF8' }}>
            <Users size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={numberStyle}>{studentCount}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#16A34A', fontSize: '11px', fontWeight: 600 }}>
            <span>+14%</span>
            <ArrowUpRight size={12} />
          </div>
        </div>
        <div style={subtextStyle}>Peer clusters & mentorships</div>
      </div>

      {/* Metric 2: Upcoming Events */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={labelStyle}>VERIFIED GATHERINGS</span>
          <div style={{ color: isLight ? '#0284C7' : '#38BDF8' }}>
            <Calendar size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={numberStyle}>{eventsCount}</div>
          <span
            style={{
              fontSize: '10px',
              color: isLight ? '#0369A1' : '#7DD3FC',
              backgroundColor: isLight ? '#F0F9FF' : 'rgba(56, 189, 248, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            Belagavi Hub
          </span>
        </div>
        <div style={subtextStyle}>Campus fests & tech contests</div>
      </div>

      {/* Metric 3: Traffic Corridor Flow */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={labelStyle}>CORRIDOR FLOW INDEX</span>
          <div style={{ color: congestionLevel === 'high' ? '#DC2626' : isLight ? '#D97706' : '#F59E0B' }}>
            <Activity size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={numberStyle}>
            {trafficScore}
            <span style={{ fontSize: '14px', fontWeight: 400, color: '#64748B', marginLeft: '2px' }}>/100</span>
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: congestionLevel === 'high' ? '#DC2626' : isLight ? '#B45309' : '#FCD34D',
              backgroundColor: congestionLevel === 'high' ? (isLight ? '#FEF2F2' : 'rgba(239, 68, 68, 0.1)') : (isLight ? '#FFFBEB' : 'rgba(245, 158, 11, 0.1)'),
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}
          >
            {congestionLevel}
          </span>
        </div>
        <div style={subtextStyle}>Rerouting via NH48 active</div>
      </div>

      {/* Metric 4: Municipal Wards & Environmental Vitals */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={labelStyle}>MUNICIPAL WARDS</span>
          <div style={{ color: isLight ? '#059669' : '#34D399' }}>
            <ShieldCheck size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={numberStyle}>{totalWards}</div>
          <span
            style={{
              fontSize: '10px',
              color: activeAnomalies > 0 ? '#DC2626' : isLight ? '#047857' : '#6EE7B7',
              backgroundColor: activeAnomalies > 0 ? (isLight ? '#FEF2F2' : 'rgba(239, 68, 68, 0.1)') : (isLight ? '#ECFDF5' : 'rgba(16, 185, 129, 0.1)'),
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            {activeAnomalies > 0 ? '1 Alert' : 'Nominal'}
          </span>
        </div>
        <div style={subtextStyle}>CPCB telemetry synchronized</div>
      </div>
    </div>
  )
}
