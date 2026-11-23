import React from 'react'

export default function Hero({ timestamp, source = 'stub', isMock = false }) {
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Synchronizing...'

  return (
    <section
      id="overview"
      style={{
        position: 'relative',
        padding: 'clamp(48px, 6vw, 72px) clamp(16px, 3vw, 28px) 48px',
        maxWidth: '1360px',
        margin: '0 auto',
      }}
    >
      {/* Category / Sub-tag */}
      <div
        className="fade-in-up"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '28px',
            height: '1px',
            backgroundColor: 'var(--accent)',
          }}
        />
        <span className="editorial-label">
          MULTI-AGENT URBAN COGNITION // BELAGAVI 15.8497° N, 74.4977° E
        </span>
      </div>

      {/* Main Headline with Signature Italicized Accent */}
      <h1
        className="display-title fade-in-up"
        style={{
          fontSize: 'clamp(2.1rem, 5.8vw, 5.25rem)',
          maxWidth: '1100px',
          marginBottom: '24px',
          letterSpacing: '-0.025em',
          lineHeight: 1.08,
          wordBreak: 'break-word',
        }}
      >
        Your city, observed and orchestrated in <em>real time.</em>
      </h1>

      {/* Editorial Subline */}
      <p
        className="fade-in-up"
        style={{
          fontSize: 'clamp(0.95rem, 1.3vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          lineHeight: 1.6,
          marginBottom: '40px',
          fontWeight: 400,
        }}
      >
        Four autonomous agents cross-analyze road congestion, academic gatherings, student connectivity,
        and atmospheric vitals — exposing the interconnected pulse of urban life.
      </p>

      {/* Status Ribbon & CTA Band */}
      <div
        className="fade-in-up"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '18px 24px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-hairline)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Left: Telemetry Details */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="editorial-label" style={{ color: 'var(--text-dim)' }}>
              TELEMETRY SYNC
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                fontWeight: 500,
              }}
            >
              {formattedTime}
            </span>
          </div>

          <div
            style={{
              width: '1px',
              height: '18px',
              backgroundColor: 'var(--border-hairline)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="editorial-label" style={{ color: 'var(--text-dim)' }}>
              DATA PIPELINE
            </span>
            <span
              className={`pill-badge ${isMock ? 'mock' : source === 'live_api' ? 'live' : source === 'csv_fallback' ? 'csv' : 'stub'}`}
            >
              <span className="pulse-dot" />
              {isMock ? 'OFFLINE MOCK' : source.toUpperCase().replace('_', ' ')}
            </span>
          </div>

          <div
            style={{
              width: '1px',
              height: '18px',
              backgroundColor: 'var(--border-hairline)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="editorial-label" style={{ color: 'var(--text-dim)' }}>
              AGENTS ACTIVE
            </span>
            <span style={{ fontSize: '13px', color: 'var(--status-ok)', fontWeight: 600 }}>
              4 / 4 SYNCHRONIZED
            </span>
          </div>
        </div>

        {/* Right: Primary Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <a href="#city-map" className="btn-primary">
            <span>Explore the city</span>
            <span className="btn-icon-circle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </span>
          </a>

          <a href="#traffic" className="btn-secondary">
            <span>Inspect agents</span>
          </a>
        </div>
      </div>
    </section>
  )
}
