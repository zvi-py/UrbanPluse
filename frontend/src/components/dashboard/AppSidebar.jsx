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
} from 'lucide-react'

export default function AppSidebar({ activeTab, onSelectTab, onOpenHostModal, theme = 'dark' }) {
  const isLight = theme === 'light'

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Explore City Map', icon: MapPin },
    { id: 'agents_core', label: '4 Intelligent Agents', icon: Cpu },
    { id: 'student', label: 'Student Network', icon: Users },
    { id: 'events', label: 'Campus Gatherings', icon: Compass },
    { id: 'traffic', label: 'Traffic Corridors', icon: Activity },
    { id: 'environment', label: 'Environment Vitals', icon: ShieldCheck },
  ]

  const styles = {
    sidebar: {
      width: '220px',
      minWidth: '220px',
      backgroundColor: isLight ? '#FFFFFF' : '#0B0F17',
      borderRight: `1px solid ${isLight ? '#E2E8F0' : '#1E293B'}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      userSelect: 'none',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
    },
    header: {
      padding: '20px 18px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      borderBottom: `1px solid ${isLight ? '#E2E8F0' : '#1E293B'}`,
    },
    logo: {
      width: '28px',
      height: '28px',
      borderRadius: '6px',
      backgroundColor: isLight ? '#0F172A' : '#1E293B',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: '15px',
      fontFamily: 'monospace',
    },
    title: {
      fontSize: '14px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: isLight ? '#0F172A' : '#F8FAFC',
    },
    subtitle: {
      fontSize: '9.5px',
      color: '#64748B',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      fontWeight: 600,
    },
    actionBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '8px 12px',
      borderRadius: '6px',
      backgroundColor: isLight ? '#0F172A' : '#F8FAFC',
      border: 'none',
      color: isLight ? '#FFFFFF' : '#0B0F17',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'opacity 0.15s ease',
    },
    footer: {
      padding: '14px 16px',
      borderTop: `1px solid ${isLight ? '#E2E8F0' : '#1E293B'}`,
      backgroundColor: isLight ? '#F8FAFC' : 'rgba(0, 0, 0, 0.25)',
    },
  }

  return (
    <aside style={styles.sidebar}>
      <div>
        {/* Brand Header */}
        <div style={styles.header}>
          <div style={styles.logo}>U</div>
          <div>
            <div style={styles.title}>URBANPULSE</div>
            <div style={styles.subtitle}>Belagavi City AI</div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            const itemBg = isActive
              ? isLight
                ? '#F1F5F9'
                : 'rgba(255, 255, 255, 0.06)'
              : 'transparent'

            const itemColor = isActive
              ? isLight
                ? '#0F172A'
                : '#F8FAFC'
              : isLight
              ? '#475569'
              : '#94A3B8'

            const borderLeft = isActive
              ? `3px solid ${isLight ? '#0F172A' : '#94A3B8'}`
              : '3px solid transparent'

            return (
              <div
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: itemColor,
                  backgroundColor: itemBg,
                  borderLeft: borderLeft,
                  fontSize: '12.5px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} color={isActive ? itemColor : '#64748B'} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </div>
            )
          })}
        </nav>

        {/* Action Button */}
        <div style={{ padding: '4px 12px' }}>
          <button onClick={onOpenHostModal} style={styles.actionBtn}>
            <CalendarPlus size={13} />
            <span>Host Gathering</span>
          </button>
        </div>
      </div>

      {/* Footer Status */}
      <div style={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#16A34A',
            }}
          />
          <span style={{ fontSize: '11px', color: isLight ? '#475569' : '#94A3B8', fontWeight: 500 }}>
            Belagavi Mesh Online
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px', fontFamily: 'monospace' }}>
          Orchestrator v2.4
        </div>
      </div>
    </aside>
  )
}
