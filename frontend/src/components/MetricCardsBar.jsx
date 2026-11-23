import React from 'react'
import { Users, Calendar, Activity, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react'

export default function MetricCardsBar({ overview, eventsData, trafficData, envData, studentData }) {
  // Extract dynamic values or elegant defaults
  const studentCount = studentData?.total_students || studentData?.matches?.length || 118
  const eventsCount = eventsData?.total_events || (Array.isArray(eventsData?.events) ? eventsData.events.length : 31)
  
  // Traffic score calculation (normalized to 100-point scale or default 89)
  const rawTrafficScore = trafficData?.congestion_score
  const trafficScore = typeof rawTrafficScore === 'number' ? Math.round((1 - rawTrafficScore) * 100) : 89
  const congestionLevel = trafficData?.congestion_level || 'moderate'
  
  // Environment stats
  const totalWards = envData?.total_wards || 58
  const activeAnomalies = envData?.active_anomalies_count || (envData?.anomaly_detected ? 1 : 2)

  return (
    <section
      style={{
        maxWidth: '1360px',
        margin: '0 auto 36px',
        padding: '0 clamp(16px, 3vw, 28px)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
        }}
      >
        {/* Metric 1: Student Connections */}
        <div
          className="metric-card fade-in-up"
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 22px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Student Connections
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: '#818CF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                {studentCount}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '6px' }}>
                Peer mentorships & active guilds
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-ok)', fontSize: '11.5px', fontWeight: 600 }}>
              <span>+14%</span>
              <ArrowUpRight size={13} />
            </div>
          </div>
        </div>

        {/* Metric 2: Upcoming Events */}
        <div
          className="metric-card fade-in-up"
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 22px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Upcoming Gatherings
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                color: '#22D3EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                {eventsCount}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '6px' }}>
                Belagavi campuses & cultural hubs
              </div>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#22D3EE',
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              Belagavi Basin
            </span>
          </div>
        </div>

        {/* Metric 3: Traffic Corridor Flow */}
        <div
          className="metric-card fade-in-up"
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 22px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Traffic Flow Index
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: congestionLevel === 'high' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                color: congestionLevel === 'high' ? '#EF4444' : '#22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                {trafficScore}
                <span style={{ fontSize: '18px', fontWeight: 400, color: 'var(--text-dim)', marginLeft: '2px' }}>/100</span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '6px' }}>
                Corridor flow · {congestionLevel.toUpperCase()}
              </div>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: congestionLevel === 'high' ? '#EF4444' : '#22C55E',
                backgroundColor: congestionLevel === 'high' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-pill)',
                textTransform: 'capitalize',
              }}
            >
              {congestionLevel}
            </span>
          </div>
        </div>

        {/* Metric 4: Environmental & Basin Vitals */}
        <div
          className="metric-card fade-in-up"
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 22px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Environmental Vitals
            </span>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                {totalWards}
                <span style={{ fontSize: '16px', fontWeight: 400, color: 'var(--text-dim)', marginLeft: '4px' }}>Wards</span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: '6px' }}>
                CPCB NAQI & Acoustic telemetry
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
              <CheckCircle2 size={13} />
              <span>Surveillance Live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
