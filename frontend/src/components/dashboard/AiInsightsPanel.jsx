import React, { useState } from 'react'
import { Radio, AlertCircle, Info, Calendar, Plus, ExternalLink, ChevronRight } from 'lucide-react'

export default function AiInsightsPanel({ alerts = [], events = [], onOpenHostModal }) {
  const [activeCategory, setActiveCategory] = useState('all')

  const validEvents = Array.isArray(events) ? events : events?.events || []

  const filteredEvents = activeCategory === 'all'
    ? validEvents.slice(0, 5)
    : validEvents.filter(e => (e.category || '').toLowerCase().includes(activeCategory)).slice(0, 5)

  return (
    <aside
      style={{
        width: '320px',
        minWidth: '320px',
        borderLeft: '1px solid #1E293B',
        backgroundColor: '#0B0F17',
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
      }}
    >
      {/* Header: System Synthesis & Alerts */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={15} color="#06B6D4" />
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', color: '#F8FAFC', textTransform: 'uppercase' }}>
              System Synthesis & Alerts
            </span>
          </div>
          <span style={{ fontSize: '10.5px', color: '#64748B', fontFamily: 'monospace' }}>
            LIVE FEED
          </span>
        </div>

        {/* Real-time Alert 1 */}
        <div
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #1E293B',
            borderLeft: '3px solid #F59E0B',
            borderRadius: '6px',
            padding: '12px 14px',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CROSS-AGENT ADVISORY
            </span>
            <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace' }}>
              12:30
            </span>
          </div>
          <p style={{ fontSize: '11.5px', color: '#CBD5E1', lineHeight: 1.45, margin: '0 0 8px 0' }}>
            {alerts[0]?.message || 'High-attendance tech gatherings detected near Tilakwadi. Traffic flow along Congress Road may experience minor slowing.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>Details</span>
              <ChevronRight size={12} />
            </span>
          </div>
        </div>

        {/* Real-time Alert 2 */}
        <div
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #1E293B',
            borderLeft: '3px solid #EF4444',
            borderRadius: '6px',
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CORRIDOR ALERT
            </span>
            <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace' }}>
              14:15
            </span>
          </div>
          <p style={{ fontSize: '11.5px', color: '#CBD5E1', lineHeight: 1.45, margin: '0 0 8px 0' }}>
            {alerts[1]?.message || 'Accident reported near Market Area corridor. Autonomous rerouting via NH48 Bypass saves ~8-12 minutes for campus commuters.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>View Route</span>
              <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Verified Activities Feed */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Verified Activities
          </span>
          <button
            onClick={onOpenHostModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#10B981',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Plus size={12} />
            <span>Host Gathering</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
          {['all', 'technical', 'workshop', 'cultural'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontSize: '10.5px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: activeCategory === cat ? '#06B6D4' : '#1E293B',
                backgroundColor: activeCategory === cat ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                color: activeCategory === cat ? '#06B6D4' : '#94A3B8',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gathering Cards Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredEvents.map((ev, idx) => (
            <div
              key={ev.event_id || idx}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#06B6D4',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {ev.category || 'Gathering'}
                </span>
                <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>
                  {ev.is_free ? 'Free' : 'Ticketed'}
                </span>
              </div>

              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#F8FAFC', lineHeight: 1.3 }}>
                {ev.title}
              </div>

              <div style={{ fontSize: '10.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={11} />
                <span>{ev.venue || 'Belagavi Sector'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace' }}>
                  ~{ev.expected_attendance || 150} Attendees
                </span>
                <span
                  style={{
                    color: '#38BDF8',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Inspect &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
