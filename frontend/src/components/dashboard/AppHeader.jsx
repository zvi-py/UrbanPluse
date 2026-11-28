import React from 'react'
import { Search, MapPin, RefreshCw, Sun, Moon, Bot } from 'lucide-react'

export default function AppHeader({
  searchQuery,
  setSearchQuery,
  onRefresh,
  loading,
  theme,
  onToggleTheme,
  onOpenGeminiModal,
}) {
  const isLight = theme === 'light'

  return (
    <header
      style={{
        height: '56px',
        borderBottom: '1px solid var(--border-hairline)',
        backgroundColor: 'var(--bg-surface)',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '480px' }}>
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
              left: '12px',
              color: 'var(--text-dim)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search Belagavi campus fests, arterial corridors, wards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 60px 8px 34px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-hairline)',
              backgroundColor: 'var(--bg-surface-raised)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '10px',
              fontSize: '10px',
              color: 'var(--text-dim)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              padding: '2px 6px',
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
            padding: '6px 12px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)',
            fontSize: '11.5px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          <MapPin size={12} color="var(--accent)" />
          <span>Belagavi, KA</span>
        </div>
      </div>

      {/* Right Controls: Gemini AI, Sync Status, Theme Toggle, Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Gemini AI Urban Assistant Trigger Pill */}
        <button
          onClick={onOpenGeminiModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--agent-gemini-bg)',
            border: '1px solid var(--agent-gemini-border)',
            color: 'var(--agent-gemini)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Bot size={13} />
          <span>Gemini AI</span>
        </button>

        {/* Sync Status Badge in Sage Style */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--agent-student-bg)',
            border: '1px solid var(--agent-student-border)',
            color: 'var(--agent-student)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            fontFamily: 'monospace',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--agent-student)',
            }}
          />
          <span>4 / 4 AGENTS IN SYNC</span>
        </div>

        {/* Telemetry Refresh */}
        <button
          onClick={onRefresh}
          title="Refresh Telemetry"
          style={{
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          style={{
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-primary)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {isLight ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>
    </header>
  )
}
