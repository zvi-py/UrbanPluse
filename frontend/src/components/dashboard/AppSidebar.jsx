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
  Radio,
  Bell,
  Settings
} from 'lucide-react'

export default function AppSidebar({ activeTab, onSelectTab, onOpenHostModal, alertCount = 3 }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'student', label: 'Student Network', icon: Users },
    { id: 'events', label: 'Discover Events', icon: Compass },
    { id: 'host_event', label: 'Host Gathering', icon: CalendarPlus, isAction: true },
    { id: 'map', label: 'Explore City', icon: MapPin },
    { id: 'agents_core', label: 'Four Agents Core', icon: Cpu },
    { id: 'traffic', label: 'Traffic Intelligence', icon: Activity },
    { id: 'environment', label: 'Environmental Monitor', icon: ShieldCheck },
    { id: 'ai_insights', label: 'Synthesis Alerts', icon: Radio, badge: alertCount },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <aside
      style={{
        width: '230px',
        minWidth: '230px',
        backgroundColor: '#090D14',
        borderRight: '1px solid #1E293B',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        userSelect: 'none',
      }}
    >
      <div>
        {/* Brand Header */}
        <div style={{ padding: '20px 18px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1E293B' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              backgroundColor: '#06B6D4',
              color: '#090D14',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '16px',
              fontFamily: 'monospace',
            }}
          >
            U
          </div>
          <div>
            <div style={{ fontSize: '14.5px', fontWeight: 700, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
              URBANPULSE
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
              Autonomous Urban AI
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.isAction) {
                    if (onOpenHostModal) onOpenHostModal()
                  } else {
                    onSelectTab(item.id)
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: isActive ? '#38BDF8' : '#94A3B8',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                  borderLeft: isActive ? '2.5px solid #38BDF8' : '2.5px solid transparent',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '9.5px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(239, 68, 68, 0.18)',
                      color: '#EF4444',
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Footer Profile & Settings */}
      <div style={{ padding: '14px 12px', borderTop: '1px solid #1E293B' }}>
        <div
          onClick={() => onSelectTab('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '7px 10px',
            borderRadius: '6px',
            color: '#94A3B8',
            fontSize: '12.5px',
            cursor: 'pointer',
            marginBottom: '8px',
          }}
        >
          <Settings size={15} />
          <span>Settings</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: '#0F172A',
            border: '1px solid #1E293B',
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '4px',
              backgroundColor: '#1E293B',
              color: '#38BDF8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px',
            }}
          >
            Z
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Zaveriya · Lead
            </div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>
              Belagavi Municipal Hub
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
