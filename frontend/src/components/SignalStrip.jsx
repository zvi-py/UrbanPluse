import React from 'react'

export default function SignalStrip({ alerts = [] }) {
  const getLevelColor = (level) => {
    switch (level) {
      case 'critical':
        return {
          color: 'var(--status-critical)',
          bg: 'var(--status-critical-bg)',
          border: 'rgba(201, 105, 95, 0.35)',
        }
      case 'warning':
        return {
          color: 'var(--status-warning)',
          bg: 'var(--status-warning-bg)',
          border: 'rgba(212, 168, 95, 0.35)',
        }
      case 'info':
      default:
        return {
          color: 'var(--status-info)',
          bg: 'var(--status-info-bg)',
          border: 'rgba(143, 166, 191, 0.35)',
        }
    }
  }

  return (
    <section
      style={{
        maxWidth: '1360px',
        margin: '0 auto 64px',
        padding: '0 28px',
      }}
    >
      <div
        className="glass-card crosshair-corner"
        style={{
          padding: '24px 28px',
          borderLeft: '2px solid var(--accent)',
          background: 'linear-gradient(90deg, rgba(184, 151, 122, 0.06) 0%, rgba(255, 244, 230, 0.02) 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
              }}
            />
            <span className="editorial-label" style={{ color: 'var(--accent)', letterSpacing: '0.16em' }}>
              CROSS-AGENT COGNITION // ACTIVE SYNTHESIS
            </span>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--text-dim)',
              letterSpacing: '0.04em',
            }}
          >
            INTER-AGENT EVENT CORRELATION
          </span>
        </div>

        {alerts && alerts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map((alert, idx) => {
              const style = getLevelColor(alert.level)
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '14px',
                    padding: '10px 0',
                    borderBottom: idx < alerts.length - 1 ? '1px solid var(--border-hairline)' : 'none',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: style.bg,
                      color: style.color,
                      border: `1px solid ${style.border}`,
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: style.color,
                      }}
                    />
                    {alert.level}
                  </span>

                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.1rem, 1.4vw, 1.35rem)',
                      color: 'var(--text-primary)',
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    "{alert.message}"
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-ok)',
              }}
            />
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}
            >
              "All quiet across the city. Agents detect normal baseline parameters."
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
