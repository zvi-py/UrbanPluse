import React, { useState, useEffect } from 'react'

export default function TopBar({
  source = 'stub',
  isMock = false,
  onRefresh,
  loading = false,
  theme = 'dark',
  onToggleTheme,
}) {
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

  const isLight = theme === 'light'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        backgroundColor: scrolled ? 'var(--topbar-bg)' : 'transparent',
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

        {/* System, Theme Toggle & Source Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
              title={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-pill)',
                padding: '5px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.backgroundColor = 'var(--bg-glass-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hairline)'
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {isLight ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                  <span>Light</span>
                </>
              )}
            </button>
          )}

          {/* Source Status Pill */}
          <div
            className={`pill-badge ${isMock ? 'mock' : source === 'live_api' ? 'live' : source === 'csv_fallback' ? 'csv' : 'stub'}`}
            title={`Active data source: ${isMock ? 'Mock Fallback' : source}`}
          >
            <span className="pulse-dot" />
            <span>{isMock ? 'MOCK DATA' : source.replace('_', ' ')}</span>
          </div>

          {/* Telemetry Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              aria-label="Refresh urban intelligence telemetry"
              disabled={loading}
              title="Refresh telemetry"
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
