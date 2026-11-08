import React, { useState, useEffect } from 'react'

export default function TopBar({ source = 'stub', isMock = false, onRefresh, loading = false }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: '01 / Traffic', href: '#traffic' },
    { label: '02 / Events', href: '#events' },
    { label: '03 / Student', href: '#student' },
    { label: '04 / Environment', href: '#environment' },
    { label: 'Map', href: '#city-map' },
  ]

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        backgroundColor: scrolled ? 'rgba(14, 13, 12, 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border-glass)' : 'transparent'}`,
        transition: 'all var(--transition-smooth)',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* Brand Wordmark */}
        <a
          href="#overview"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            UrbanPulse
          </span>
          <span
            style={{
              display: 'inline-block',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
            }}
          />
          <span
            className="editorial-label"
            style={{
              fontSize: '9.5px',
              color: 'var(--text-dim)',
              marginLeft: '4px',
            }}
          >
            BELAGAVI · KA
          </span>
        </a>

        {/* Nav Pills */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            padding: '2px 0',
          }}
          className="nav-pills-container"
        >
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid transparent',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.borderColor = 'var(--border-hairline)'
                e.currentTarget.style.backgroundColor = 'var(--bg-glass)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* System & Source Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div
            className={`pill-badge ${isMock ? 'mock' : source === 'live_api' ? 'live' : source === 'csv_fallback' ? 'csv' : 'stub'}`}
            title={`Active data source: ${isMock ? 'Mock Fallback' : source}`}
          >
            <span className="pulse-dot" />
            <span>{isMock ? 'MOCK DATA' : source.replace('_', ' ')}</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              aria-label="Refresh urban intelligence telemetry"
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-hairline)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                cursor: loading ? 'default' : 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hairline)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: loading ? 'spin 1s linear infinite' : 'none',
                }}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 820px) {
          .nav-pills-container {
            display: none !important;
          }
        }
      `}</style>
    </header>
  )
}
