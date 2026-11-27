import React, { useState } from 'react'
import { Sparkles, Calendar, Plus, ChevronRight, Navigation, Activity } from 'lucide-react'

export default function AiInsightsPanel({ alerts = [], events = [], onOpenHostModal, onOpenGeminiModal }) {
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
        borderLeft: '1px solid var(--border-hairline)',
        backgroundColor: 'var(--bg-surface)',
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
      }}
    >
      {/* Header: Gemini AI Urban Synthesis */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={15} color="var(--agent-gemini)" />
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              Gemini Urban Synthesis
            </span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
            LIVE FEED
          </span>
        </div>

        {/* Real-time Alert 1 - Cross-Agent */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-hairline)',
            borderLeft: '3px solid var(--agent-events)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--agent-events)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CROSS-AGENT ADVISORY
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
              12:30
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 8px 0' }}>
            {alerts[0]?.message || 'High-attendance tech gatherings detected near Tilakwadi. Traffic flow along Congress Road may experience minor slowing.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <span
              onClick={onOpenGeminiModal}
              style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <span>Ask Gemini AI</span>
              <ChevronRight size={12} />
            </span>
          </div>
        </div>

        {/* Real-time Alert 2 - Corridor Alert */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-hairline)',
            borderLeft: '3px solid var(--agent-traffic)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--agent-traffic)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CORRIDOR ALERT
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
              14:15
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 8px 0' }}>
            {alerts[1]?.message || 'Accident reported near Market Area corridor. Autonomous rerouting via NH48 Bypass saves ~8-12 minutes for campus commuters.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <span
              onClick={onOpenGeminiModal}
              style={{ fontSize: '11px', color: 'var(--agent-traffic)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <span>Reroute Advice</span>
              <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Verified Activities Feed */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Verified Activities
          </span>
          <button
            onClick={onOpenHostModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '11px',
              fontWeight: 700,
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
                fontSize: '11px',
                padding: '3px 9px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid',
                borderColor: activeCategory === cat ? 'var(--accent)' : 'var(--border-hairline)',
                backgroundColor: activeCategory === cat ? 'var(--accent-light)' : 'transparent',
                color: activeCategory === cat ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: 600,
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
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-hairline)',
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
                    color: 'var(--agent-events)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {ev.category?.replace('_', ' ') || 'Gathering'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--agent-student)', fontWeight: 700 }}>
                  {ev.is_free ? 'Free' : 'Ticketed'}
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {ev.title}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={11} />
                <span>{ev.venue || 'Belagavi Sector'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--border-hairline)' }}>
                <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
                  ~{ev.expected_attendance || 150} Attendees
                </span>
                <span
                  style={{
                    color: 'var(--accent)',
                    fontSize: '11px',
                    fontWeight: 700,
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
