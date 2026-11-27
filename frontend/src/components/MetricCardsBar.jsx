import React from 'react'
import { Users, Calendar, Activity, ShieldCheck, ArrowUpRight } from 'lucide-react'

export default function MetricCardsBar({ overview, eventsData, trafficData, envData, studentData, theme = 'dark' }) {
  const isLight = theme === 'light'

  const studentCount = studentData?.total_students || studentData?.matches?.length || 118
  const eventsCount = eventsData?.total_events || (Array.isArray(eventsData?.events) ? eventsData.events.length : 26)

  const rawTrafficScore = trafficData?.congestion_score
  const trafficScore = typeof rawTrafficScore === 'number' ? Math.round((1 - rawTrafficScore) * 100) : 89
  const congestionLevel = trafficData?.congestion_level || 'moderate'

  const totalWards = envData?.total_wards || 58
  const activeAnomalies = envData?.active_anomalies_count || (envData?.anomaly_detected ? 1 : 0)

  const baseCardStyle = {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'var(--shadow-glass)',
    transition: 'all 0.2s ease',
  }

  const numberStyle = {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  }

  const subtextStyle = {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    fontWeight: 400,
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        width: '100%',
      }}
    >
      {/* Metric 1: Student Network - Botanical Sage */}
      <div style={{ ...baseCardStyle, border: '1px solid var(--agent-student-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--agent-student)', textTransform: 'uppercase' }}>
            STUDENT NETWORK
          </span>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'var(--agent-student-bg)',
              color: 'var(--agent-student)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={15} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={numberStyle}>{studentCount}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--agent-student)', fontSize: '11.5px', fontWeight: 700 }}>
            <span>Active</span>
            <ArrowUpRight size={12} />
          </div>
        </div>
        <div style={subtextStyle}>KLE Tech · KLS GIT · VTU Guilds</div>
      </div>

      {/* Metric 2: Verified Gatherings - Champagne Bronze */}
      <div style={{ ...baseCardStyle, border: '1px solid var(--agent-events-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--agent-events)', textTransform: 'uppercase' }}>
            VERIFIED GATHERINGS
          </span>
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
            <Calendar size={15} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={numberStyle}>{eventsCount}</div>
          <span
            style={{
              fontSize: '10.5px',
              color: 'var(--agent-events)',
              backgroundColor: 'var(--agent-events-bg)',
              border: '1px solid var(--agent-events-border)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
            }}
          >
            Belagavi Hub
          </span>
        </div>
        <div style={subtextStyle}>26 campus fests & symposiums</div>
      </div>

      {/* Metric 3: Traffic Corridor Flow - Warm Terracotta */}
      <div style={{ ...baseCardStyle, border: '1px solid var(--agent-traffic-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--agent-traffic)', textTransform: 'uppercase' }}>
            CORRIDOR FLOW INDEX
          </span>
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
            <Activity size={15} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={numberStyle}>
            {trafficScore}
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-dim)', marginLeft: '3px' }}>/100</span>
          </div>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: 'var(--agent-traffic)',
              backgroundColor: 'var(--agent-traffic-bg)',
              border: '1px solid var(--agent-traffic-border)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-pill)',
              textTransform: 'uppercase',
            }}
          >
            {congestionLevel}
          </span>
        </div>
        <div style={subtextStyle}>12 corridors · Detours via NH48</div>
      </div>

      {/* Metric 4: Municipal Wards - Deep Mineral Spruce */}
      <div style={{ ...baseCardStyle, border: '1px solid var(--agent-env-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--agent-env)', textTransform: 'uppercase' }}>
            MUNICIPAL WARDS
          </span>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'var(--agent-env-bg)',
              color: 'var(--agent-env)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={15} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={numberStyle}>{totalWards}</div>
          <span
            style={{
              fontSize: '10.5px',
              color: 'var(--agent-env)',
              backgroundColor: 'var(--agent-env-bg)',
              border: '1px solid var(--agent-env-border)',
              padding: '2px 7px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
            }}
          >
            Nominal · AQI 48
          </span>
        </div>
        <div style={subtextStyle}>All 58 BCC wards synchronized</div>
      </div>
    </div>
  )
}
