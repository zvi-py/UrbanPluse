import React from 'react'

export default function TrafficPanel({ data, loading = false, error = null }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '36px', height: '320px' }}>
        <div className="skeleton-shimmer" style={{ width: '40%', height: '24px', marginBottom: '20px' }} />
        <div className="skeleton-shimmer" style={{ width: '70%', height: '64px', marginBottom: '28px' }} />
        <div className="skeleton-shimmer" style={{ width: '100%', height: '8px', marginBottom: '36px' }} />
        <div className="skeleton-shimmer" style={{ width: '100%', height: '80px' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
        <p style={{ color: 'var(--status-critical)', marginBottom: '8px' }}>Traffic telemetry paused.</p>
        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>{error}</p>
      </div>
    )
  }

  const congestionLevel = data?.congestion_level || 'Moderate'
  const congestionScore = typeof data?.congestion_score === 'number' ? data.congestion_score : 0.62
  const locationName = data?.location_name || 'Belagavi City Center'
  const routes = data?.alternate_routes || []
  const isHigh = data?.high_congestion || congestionScore > 0.75

  const getStatusColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
      case 'heavy':
        return 'var(--status-critical)'
      case 'moderate':
        return 'var(--status-warning)'
      case 'low':
      case 'light':
      default:
        return 'var(--status-ok)'
    }
  }

  const levelColor = getStatusColor(congestionLevel)

  return (
    <div className="glass-card" style={{ padding: '36px' }}>
      {/* Top Meta Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: levelColor,
            }}
          />
          <span className="editorial-label" style={{ color: 'var(--text-secondary)' }}>
            SURVEILLANCE SECTOR // {locationName}
          </span>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--text-dim)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          SCIKIT-LEARN · CONGESTION CLASSIFIER
        </span>
      </div>

      {/* Hero Display: Congestion Word + Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-dim)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            CURRENT CONGESTION STATUS
          </span>
          <h3
            className="numeral-serif"
            style={{
              fontSize: 'clamp(2.5rem, 4.2vw, 3.8rem)',
              color: 'var(--text-primary)',
              textTransform: 'capitalize',
              letterSpacing: '-0.02em',
            }}
          >
            {congestionLevel}
          </h3>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-dim)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            SATURATION INDEX
          </span>
          <span
            className="numeral-serif"
            style={{
              fontSize: '2rem',
              color: levelColor,
            }}
          >
            {Math.round(congestionScore * 100)}%
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)', marginLeft: '4px' }}>
            ({congestionScore.toFixed(2)})
          </span>
        </div>
      </div>

      {/* Thin Horizontal Gauge */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255, 244, 230, 0.08)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(Math.max(congestionScore * 100, 5), 100)}%`,
              height: '100%',
              background: `linear-gradient(90deg, var(--status-ok) 0%, var(--status-warning) 50%, var(--status-critical) 100%)`,
              borderRadius: '2px',
              transition: 'width var(--transition-slow)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10.5px',
            color: 'var(--text-dim)',
            marginTop: '8px',
            letterSpacing: '0.06em',
          }}
        >
          <span>FREE FLOW (0.00)</span>
          <span>THRESHOLD (0.50)</span>
          <span>HEAVY BOTTLENECK (1.00)</span>
        </div>
      </div>

      {/* Alternate Route Section */}
      <div>
        <span
          className="editorial-label"
          style={{
            display: 'block',
            marginBottom: '12px',
            color: 'var(--text-dim)',
          }}
        >
          RECOMMENDED ARTERIAL REROUTING
        </span>

        {routes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {routes.map((route, idx) => (
              <div
                key={route.route_id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 244, 230, 0.02)',
                  border: '1px solid var(--border-hairline)',
                  gap: '16px',
                  transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-glass-bright)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 244, 230, 0.04)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-hairline)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 244, 230, 0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      color: 'var(--accent)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--accent-dim)',
                      lineHeight: 1,
                    }}
                  >
                    {route.route_id || `R${idx + 1}`}
                  </span>

                  <div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                      }}
                    >
                      {route.description}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      Distance: {route.distance_km ? `${route.distance_km} km` : 'Standard corridor'}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-hairline)',
                    color: 'var(--text-secondary)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 244, 230, 0.02)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
            }}
          >
            No active bypass reroute required. Roadway capacity optimal.
          </div>
        )}
      </div>
    </div>
  )
}
