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
        height: '64px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: isLight ? '#FFFFFF' : '#111827',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Search Input Bar & Belagavi Location Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '520px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              color: '#9CA3AF',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search by activity, gathering, corridor, or ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: isLight ? '#F3F4F6' : '#161F30',
              color: isLight ? '#111827' : '#F9FAFB',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
          />
        </div>

        {/* Belagavi Location Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            color: '#06B6D4',
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <MapPin size={14} />
          <span>Belagavi, KA</span>
        </div>
      </div>

      {/* Right Controls: Telemetry Sync, Theme Toggle, Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Live Synchronized Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#22C55E',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#22C55E',
              boxShadow: '0 0 8px #22C55E',
            }}
          />
          <span>4 / 4 Synchronized</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          title="Refresh All Telemetry"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: isLight ? '#4B5563' : '#D1D5DB',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={isLight ? 'Switch to Midnight Theme' : 'Switch to Light Theme'}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: isLight ? '#4B5563' : '#D1D5DB',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isLight ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Bell Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: isLight ? '#4B5563' : '#D1D5DB',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={16} />
          </button>
          {alertCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '9.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 6px #EF4444',
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
