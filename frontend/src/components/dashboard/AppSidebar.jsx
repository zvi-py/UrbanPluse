import React from 'react'
import {
  LayoutDashboard,
  Users,
  Compass,
  CalendarPlus,
  MapPin,
  Cpu,
  Activity,
  ShieldCheck,
  Bot,
} from 'lucide-react'

export default function AppSidebar({
  activeTab,
  onSelectTab,
  onOpenHostModal,
  onOpenGeminiModal,
  theme = 'light',
}) {
  const isLight = theme === 'light'

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Cartographic Atlas', icon: MapPin },
    { id: 'agents_core', label: '4 Intelligent Agents', icon: Cpu },
    { id: 'student', label: 'Student Network', icon: Users },
    { id: 'events', label: 'Campus Gatherings', icon: Compass },
    { id: 'traffic', label: 'Traffic Corridors', icon: Activity },
    { id: 'environment', label: '58 BCC Wards', icon: ShieldCheck },
  ]

  return (
    <aside
      style={{
        width: '230px',
        minWidth: '230px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-hairline)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        userSelect: 'none',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          style={{
            padding: '22px 20px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid var(--border-hairline)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '16px',
              fontFamily: 'var(--font-display)',
            }}
          >
            U
          </div>
          <div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              URBANPULSE
            </div>
            <div
              style={{
                fontSize: '9.5px',
                color: 'var(--text-dim)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Belagavi City Mesh
            </div>
          </div>
        </div>

        {/* Gemini AI Quick Access Pill */}
        <div style={{ padding: '14px 14px 6px' }}>
          <button
            onClick={onOpenGeminiModal}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 14px',
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
            <Bot size={14} />
            <span>Ask Gemini AI</span>
          </button>
        </div>

        {/* Primary Navigation */}
        <nav style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            const itemBg = isActive ? 'var(--accent-light)' : 'transparent'
            const itemColor = isActive ? 'var(--accent)' : 'var(--text-secondary)'

            return (
              <div
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-pill)',
                  color: itemColor,
                  backgroundColor: itemBg,
                  fontSize: '12.5px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} color={isActive ? 'var(--accent)' : 'var(--text-dim)'} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </div>
            )
          })}
        </nav>

        {/* Action Button: Host Gathering */}
        <div style={{ padding: '6px 14px' }}>
          <button
            onClick={onOpenHostModal}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--accent)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 4px 10px rgba(147, 4, 0, 0.22)',
            }}
          >
            <CalendarPlus size={14} />
            <span>Host Gathering</span>
          </button>
        </div>
      </div>

      {/* Footer Status */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-hairline)',
          backgroundColor: 'var(--bg-surface-raised)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--agent-student)',
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Belagavi Mesh Online
          </span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', fontFamily: 'monospace' }}>
          Gemini Orchestrator v2.4
        </div>
      </div>
    </aside>
  )
}
