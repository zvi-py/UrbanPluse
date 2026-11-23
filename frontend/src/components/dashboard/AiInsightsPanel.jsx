import React, { useState } from 'react'
import { Sparkles, AlertTriangle, Info, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function AiInsightsPanel({ alerts = [], events = [], onOpenHostModal }) {
  const [activeCategory, setActiveCategory] = useState('all')

  const validEvents = Array.isArray(events) ? events : events?.events || []

  const filteredEvents = activeCategory === 'all'
    ? validEvents.slice(0, 5)
    : validEvents.filter(e => (e.category || '').toLowerCase().includes(activeCategory)).slice(0, 5)

  return (
    <aside
      style={{
        width: '340px',
        minWidth: '340px',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: '#111827',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: '64px',
        overflowY: 'auto',
      }}
    >
      {/* Top Section: AI Insights Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#06B6D4" />
            <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em', color: '#F9FAFB', textTransform: 'uppercase' }}>
              AI Insights
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#06B6D4', cursor: 'pointer', fontWeight: 600 }}>
            See All &gt;
          </span>
        </div>

        {/* AI Insight Card 1: Recommended Events & Synthesis */}
        <div
          className="video-glass-card"
          style={{
            marginBottom: '12px',
            borderLeft: '3px solid #8B5CF6',
            backgroundColor: '#161F30',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info size={13} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#F9FAFB' }}>
              Recommended Events
            </span>
          </div>
          <p style={{ fontSize: '11.5px', color: '#9CA3AF', lineHeight: 1.45, margin: '0 0 10px 0' }}>
            {alerts[0]?.message || 'High-attendance tech gatherings detected near Tilakwadi. Traffic flow along Congress Road may experience minor slowing.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10.5px', color: '#6B7280' }}>
              &bull; 12:30 PM Live
            </span>
            <button
              style={{
                background: 'transparent',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#A78BFA',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '10.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* AI Insight Card 2: Community & Traffic Suggestions */}
        <div
          className="video-glass-card"
          style={{
            borderLeft: '3px solid #F59E0B',
            backgroundColor: '#161F30',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={13} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#F9FAFB' }}>
              Community Suggestions
            </span>
          </div>
          <p style={{ fontSize: '11.5px', color: '#9CA3AF', lineHeight: 1.45, margin: '0 0 10px 0' }}>
            {alerts[1]?.message || 'Roadwork reported near College Road. Autonomous rerouting via NH48 Bypass saves ~8-12 minutes for campus commuters.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10.5px', color: '#6B7280' }}>
              &bull; 3:30 PM Live
            </span>
            <button
              style={{
                background: 'transparent',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#FBBF24',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '10.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Categorized Activities Feed */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#F9FAFB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Upcoming Activities
          </span>
          <span style={{ fontSize: '11px', color: '#06B6D4', cursor: 'pointer' }} onClick={onOpenHostModal}>
            + Host Event
          </span>
        </div>

        {/* Category Pills Filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
          {['all', 'technical', 'workshop', 'cultural'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: activeCategory === cat ? '#06B6D4' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: activeCategory === cat ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: activeCategory === cat ? '#06B6D4' : '#9CA3AF',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Event Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredEvents.map((ev, idx) => (
            <div
              key={ev.event_id || idx}
              style={{
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#161F30',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
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

              <h4 style={{ fontSize: '12.5px', fontWeight: 600, color: '#F9FAFB', margin: 0, lineHeight: 1.3 }}>
                {ev.title}
              </h4>

              <div style={{ fontSize: '10.5px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={11} />
                <span>{ev.venue || 'Belagavi Sector'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '10px', color: '#6B7280' }}>
                  ~{ev.expected_attendance || 150} Attendees
                </span>
                <button
                  style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#06B6D4',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Join Event
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
