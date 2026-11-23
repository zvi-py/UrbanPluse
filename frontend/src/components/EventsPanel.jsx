import React, { useState } from 'react'

export default function EventsPanel({ data, loading = false, error = null }) {
  const [expandedId, setExpandedId] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '36px' }}>
        <div className="skeleton-shimmer" style={{ width: '50%', height: '24px', marginBottom: '24px' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-shimmer" style={{ width: '100%', height: '76px', marginBottom: '14px' }} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
        <p style={{ color: 'var(--status-critical)', marginBottom: '8px' }}>Event synchronization offline.</p>
        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>{error}</p>
      </div>
    )
  }

  // Handle both array or { events: [...] }
  const rawEvents = Array.isArray(data) ? data : data?.events || []
  const count = data?.count || rawEvents.length

  const filteredEvents = activeFilter === 'all'
    ? rawEvents
    : activeFilter === 'high'
    ? rawEvents.filter((e) => e.high_attendance || (e.expected_attendance && e.expected_attendance >= 1000))
    : rawEvents.filter((e) => e.category?.toLowerCase() === activeFilter.toLowerCase())

  const categories = ['all', 'high', ...new Set(rawEvents.map((e) => e.category).filter(Boolean))]

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Upcoming'
    try {
      const dt = new Date(dateStr)
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="glass-card" style={{ padding: '36px' }}>
      {/* Header and Filter Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span className="editorial-label" style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
            LOCALITY CONVERGENCE
          </span>
          <span
            className="numeral-serif"
            style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}
          >
            {count} Gatherings Detected
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                background: activeFilter === cat ? 'var(--accent)' : 'transparent',
                color: activeFilter === cat ? '#12100E' : 'var(--text-secondary)',
                border: `1px solid ${activeFilter === cat ? 'var(--accent)' : 'var(--border-hairline)'}`,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: activeFilter === cat ? 600 : 500,
                transition: 'all var(--transition-fast)',
              }}
            >
              {cat === 'all' ? 'All events' : cat === 'high' ? 'High Attendance' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredEvents.slice(0, 5).map((ev) => {
          const isExpanded = expandedId === ev.event_id
          const isHighAttendance = ev.high_attendance || (ev.expected_attendance && ev.expected_attendance >= 1000)
          const scorePercent = typeof ev.score === 'number' ? Math.round(ev.score * 100) : 75
          const breakdown = ev.score_breakdown || {
            similarity: 0.65,
            proximity: 0.8,
            time: 0.7,
          }

          return (
            <div
              key={ev.event_id || ev.title}
              onClick={() => toggleExpand(ev.event_id)}
              style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isExpanded ? 'rgba(255, 244, 230, 0.05)' : 'rgba(255, 244, 230, 0.02)',
                border: `1px solid ${isExpanded ? 'var(--border-glass-bright)' : 'var(--border-hairline)'}`,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.borderColor = 'var(--border-glass)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 244, 230, 0.035)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.borderColor = 'var(--border-hairline)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 244, 230, 0.02)'
                }
              }}
            >
              {/* Row 1: Title, Category, High Attendance, Distance */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '19px',
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                      margin: 0,
                    }}
                  >
                    {ev.title}
                  </h4>

                  {ev.category && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid var(--border-hairline)',
                        color: 'var(--text-dim)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {ev.category.replace('_', ' ')}
                    </span>
                  )}

                  {isHighAttendance && (
                    <span
                      style={{
                        fontSize: '9.5px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'var(--status-warning-bg)',
                        color: 'var(--status-warning)',
                        border: '1px solid rgba(212, 168, 95, 0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 600,
                      }}
                    >
                      High Attendance · {ev.expected_attendance || '1,000+'}
                    </span>
                  )}
                </div>

                {/* Match Score Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="editorial-label" style={{ fontSize: '10px' }}>
                    MATCH SCORE
                  </span>
                  <span
                    className="numeral-serif"
                    style={{ fontSize: '18px', color: 'var(--accent)' }}
                  >
                    {scorePercent}%
                  </span>
                </div>
              </div>

              {/* Row 2: Venue, Date, Distance */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                }}
              >
                {ev.venue && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {ev.venue}
                  </span>
                )}

                <span>·</span>

                <span>{formatDate(ev.start_datetime || ev.date)}</span>

                {typeof ev.distance_km === 'number' && (
                  <>
                    <span>·</span>
                    <span style={{ color: 'var(--accent)' }}>{ev.distance_km} km away</span>
                  </>
                )}
              </div>

              {/* Thin Overall Score Bar */}
              <div
                style={{
                  width: '100%',
                  height: '2px',
                  backgroundColor: 'rgba(255, 244, 230, 0.08)',
                  borderRadius: '1px',
                  overflow: 'hidden',
                  marginTop: '6px',
                }}
              >
                <div
                  style={{
                    width: `${scorePercent}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent)',
                    borderRadius: '1px',
                  }}
                />
              </div>

              {/* Expanded Score Breakdown on Click or Hover */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: '16px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-hairline)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '14px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      <span>SIMILARITY (0.60)</span>
                      <span>{Math.round((breakdown.similarity || 0) * 100)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '2px', background: 'rgba(255,244,230,0.08)' }}>
                      <div style={{ width: `${(breakdown.similarity || 0) * 100}%`, height: '100%', background: 'var(--status-info)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      <span>PROXIMITY (0.25)</span>
                      <span>{Math.round((breakdown.proximity || 0) * 100)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '2px', background: 'rgba(255,244,230,0.08)' }}>
                      <div style={{ width: `${(breakdown.proximity || 0) * 100}%`, height: '100%', background: 'var(--status-ok)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      <span>TIME URGENCY (0.15)</span>
                      <span>{Math.round((breakdown.time || 0) * 100)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '2px', background: 'rgba(255,244,230,0.08)' }}>
                      <div style={{ width: `${(breakdown.time || 0) * 100}%`, height: '100%', background: 'var(--status-warning)' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredEvents.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            No events currently match the selected filter.
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a
          href="#city-map"
          style={{
            fontSize: '12px',
            color: 'var(--accent)',
            textDecoration: 'none',
            letterSpacing: '0.04em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>View all mapped gathering coordinates on the city atlas</span>
          <span>↓</span>
        </a>
      </div>
    </div>
  )
}

