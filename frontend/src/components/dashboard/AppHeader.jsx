import React from 'react'
import { Search, MapPin, RefreshCw, Sun, Moon, Bell } from 'lucide-react'

export default function AppHeader({
  searchQuery,
  setSearchQuery,
  onRefresh,
  loading,
  theme,
  onToggleTheme,
  alertCount = 3,
}) {
  const isLight = theme === 'light'

  return (
    <header
      style={{
        height: '54px',
        borderBottom: '1px solid #1E293B',
        backgroundColor: isLight ? '#FFFFFF' : '#0B0F17',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Search Bar with Keyboard Shortcut */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, maxWidth: '480px' }}>
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
              border: '1px solid #1E293B',
              backgroundColor: isLight ? '#F1F5F9' : '#0F172A',
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
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            color: '#06B6D4',
            fontSize: '11.5px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <MapPin size={12} />
          <span>Belagavi, KA</span>
        </div>
      </div>

      {/* Right Controls: Telemetry Status, Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Sync Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10B981',
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
              backgroundColor: '#10B981',
              boxShadow: '0 0 6px #10B981',
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
            border: '1px solid #1E293B',
            color: '#94A3B8',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={isLight ? 'Dark Theme' : 'Light Theme'}
          style={{
            background: 'transparent',
            border: '1px solid #1E293B',
            color: '#94A3B8',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isLight ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              background: 'transparent',
              border: '1px solid #1E293B',
              color: '#94A3B8',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={14} />
          </button>
          {alertCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {alertCount}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
