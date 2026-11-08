import React from 'react'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-hairline)',
        backgroundColor: 'var(--bg-base)',
        padding: '64px 28px 48px',
        color: 'var(--text-secondary)',
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          {/* Wordmark and Prototype Badge */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '32px',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                UrbanPulse
              </span>
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                }}
              />
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-dim)', maxWidth: '420px', lineHeight: 1.6 }}>
              Multi-Agent AI Platform for Smart Urban Life. Autonomous telemetry synthesis demonstrating cross-agent causality across Belagavi.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
            <div>
              <span className="editorial-label" style={{ display: 'block', marginBottom: '12px' }}>
                ARCHITECTURE
              </span>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <li><a href="#traffic" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>01 / Traffic Classifier</a></li>
                <li><a href="#events" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>02 / Event Recommender</a></li>
                <li><a href="#student" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>03 / Student Affinity</a></li>
                <li><a href="#environment" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>04 / Atmospheric Vitals</a></li>
              </ul>
            </div>

            <div>
              <span className="editorial-label" style={{ display: 'block', marginBottom: '12px' }}>
                SYSTEM
              </span>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <li><a href="#overview" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Overview Stream</a></li>
                <li><a href="#city-map" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Cartographic Atlas</a></li>
                <li><span style={{ color: 'var(--text-dim)' }}>FastAPI Orchestrator</span></li>
                <li><span style={{ color: 'var(--text-dim)' }}>B.E. AI &amp; DS Mini Project</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Hairline divider, Phase 1 prototype, coordinates */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid var(--border-hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px',
            color: 'var(--text-dim)',
          }}
        >
          <span>Phase 1 prototype · Belagavi, Karnataka (15.8497° N, 74.4977° E)</span>
          <span>© {new Date().getFullYear()} UrbanPulse. Built with Python &amp; React.</span>
        </div>
      </div>
    </footer>
  )
}

