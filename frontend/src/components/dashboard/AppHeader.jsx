import React from 'react'
import { Search, MapPin, RefreshCw, Sun, Moon } from 'lucide-react'

export default function AppHeader({
  searchQuery,
  setSearchQuery,
  onRefresh,
  loading,
  theme,
  onToggleTheme,
}) {
  const isLight = theme === 'light'

  return (
    <header
      style={{
        height: '54px',
        borderBottom: `1px solid ${isLight ? '#E2E8F0' : '#1E293B'}`,
        backgroundColor: isLight ? '#FFFFFF' : '#0B0F17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Search Bar with Keyboard Shortcut */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '460px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '11px',
              color: '#64748B',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search activities, gathering keywords, corridors, or wards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 60px 7px 32px',
              borderRadius: '6px',
              border: `1px solid ${isLight ? '#E2E8F0' : '#1E293B'}`,
              backgroundColor: isLight ? '#F8FAFC' : '#0F172A',
              color: isLight ? '#0F172A' : '#F8FAFC',
              fontSize: '12.5px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '8px',
              fontSize: '10px',
              color: '#64748B',
              backgroundColor: isLight ? '#E2E8F0' : '#1E293B',
              padding: '2px 5px',
              borderRadius: '4px',
              pointerEvents: 'none',
              fontFamily: 'monospace',
            }}
          >
            ⌘K
          </span>
        </div>

        {/* Belagavi Locality Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '6px',
            backgroundColor: isLight ? '#F1F5F9' : '#1E293B',
            border: `1px solid ${isLight ? '#E2E8F0' : '#334155'}`,
            color: isLight ? '#334155' : '#CBD5E1',
            fontSize: '11.5px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <MapPin size={12} color={isLight ? '#475569' : '#94A3B8'} />
          <span>Belagavi, KA</span>
        </div>
      </div>

      {/* Right Controls: Telemetry Status, Theme Toggle, Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Sync Status Badge (Zero Neon Glow) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: isLight ? '#F0FDF4' : 'rgba(34, 197, 94, 0.08)',
            border: `1px solid ${isLight ? '#DCFCE7' : 'rgba(34, 197, 94, 0.25)'}`,
            color: isLight ? '#166534' : '#4ADE80',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            fontFamily: 'monospace',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isLight ? '#16A34A' : '#4ADE80',
            }}
          />
          <span>4 / 4 AGENTS IN SYNC</span>
        </div>

        {/* Telemetry Refresh */}
        <button
          onClick={onRefresh}
          title="Refresh Telemetry"
          style={{
            background: 'transparent',
            border: `1px solid ${isLight ? '#E2E8F0' : '#1E293B'}`,
            color: isLight ? '#475569' : '#94A3B8',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          style={{
            background: isLight ? '#F8FAFC' : '#1E293B',
            border: `1px solid ${isLight ? '#E2E8F0' : '#334155'}`,
            color: isLight ? '#0F172A' : '#F8FAFC',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isLight ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>
    </header>
  )
}
