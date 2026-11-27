import React from 'react'
import { Users, Calendar, Activity, ShieldCheck, ArrowUpRight } from 'lucide-react'

export default function MetricCardsBar({ overview, eventsData, trafficData, envData, studentData }) {
  const studentCount = studentData?.total_students || studentData?.matches?.length || 118
  const eventsCount = eventsData?.total_events || (Array.isArray(eventsData?.events) ? eventsData.events.length : 31)

  const rawTrafficScore = trafficData?.congestion_score
  const trafficScore = typeof rawTrafficScore === 'number' ? Math.round((1 - rawTrafficScore) * 100) : 89
  const congestionLevel = trafficData?.congestion_level || 'moderate'

  const totalWards = envData?.total_wards || 58
  const activeAnomalies = envData?.active_anomalies_count || (envData?.anomaly_detected ? 1 : 0)

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
      <div
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid #1E293B',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            STUDENT NETWORK
          </span>
          <div style={{ color: '#818CF8' }}>
            <Users size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace', letterSpacing: '-0.03em' }}>
            {studentCount}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#10B981', fontSize: '11px', fontWeight: 600 }}>
            <span>+14%</span>
            <ArrowUpRight size={12} />
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
          Peer clusters & mentorships
        </div>
      </div>

      {/* Metric 2: Upcoming Events */}
      <div
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid #1E293B',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            VERIFIED GATHERINGS
          </span>
          <div style={{ color: '#06B6D4' }}>
            <Calendar size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace', letterSpacing: '-0.03em' }}>
            {eventsCount}
          </div>
          <span style={{ fontSize: '10px', color: '#06B6D4', backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
            Belagavi Hub
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
          Campus fests & tech contests
        </div>
      </div>

      {/* Metric 3: Traffic Corridor Flow */}
      <div
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid #1E293B',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            CORRIDOR FLOW INDEX
          </span>
          <div style={{ color: congestionLevel === 'high' ? '#EF4444' : '#10B981' }}>
            <Activity size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace', letterSpacing: '-0.03em' }}>
            {trafficScore}
            <span style={{ fontSize: '14px', fontWeight: 400, color: '#64748B', marginLeft: '2px' }}>/100</span>
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: congestionLevel === 'high' ? '#EF4444' : '#F59E0B',
              backgroundColor: congestionLevel === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}
          >
            {congestionLevel}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
          Arterial flow & bypass routing
        </div>
      </div>

      {/* Metric 4: Environmental & Basin Vitals */}
      <div
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid #1E293B',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            ENVIRONMENTAL BASIN
          </span>
          <div style={{ color: '#10B981' }}>
            <ShieldCheck size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace', letterSpacing: '-0.03em' }}>
            {totalWards}
            <span style={{ fontSize: '14px', fontWeight: 400, color: '#64748B', marginLeft: '3px' }}>Wards</span>
          </div>
          <span style={{ fontSize: '10px', color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
            {activeAnomalies > 0 ? `${activeAnomalies} Outlier` : 'Nominal'}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
          CPCB NAQI & Acoustic telemetry
        </div>
      </div>
    </div>
  )
}
