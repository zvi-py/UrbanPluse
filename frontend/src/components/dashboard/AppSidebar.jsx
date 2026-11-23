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
  Sparkles,
  Bell,
  Settings,
  ChevronRight
} from 'lucide-react'

export default function AppSidebar({ activeTab, onSelectTab, onOpenHostModal, alertCount = 3 }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'student', label: 'Student Network', icon: Users },
    { id: 'events', label: 'Discover Events', icon: Compass },
    { id: 'host_event', label: 'Host an Event', icon: CalendarPlus, isAction: true },
    { id: 'map', label: 'Explore City', icon: MapPin },
    { id: 'agents_core', label: 'Four Agents Core', icon: Cpu },
    { id: 'traffic', label: 'Traffic Intelligence', icon: Activity },
    { id: 'environment', label: 'Environmental Monitoring', icon: ShieldCheck },
    { id: 'ai_insights', label: 'AI Insights', icon: Sparkles, badge: alertCount },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <aside className="video-sidebar">
      {/* Brand Header */}
      <div>
        <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.45)',
            }}
          >
            <span style={{ fontSize: '19px', fontWeight: 900, fontFamily: 'var(--font-display, sans-serif)' }}>
              U
            </span>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary, #F8FAFC)' }}>
              URBANPULSE
            </div>
            <div style={{ fontSize: '10px', color: '#06B6D4', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
              AI Urban Intelligence
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <div
                key={item.id}
                className={`video-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (item.isAction) {
                    if (onOpenHostModal) onOpenHostModal()
                  } else {
                    onSelectTab(item.id)
                  }
                }}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
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

      {/* Bottom User Profile & Settings */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div
          className="video-nav-item"
          style={{ marginBottom: '8px' }}
          onClick={() => onSelectTab('settings')}
        >
          <Settings size={18} />
          <span>Settings</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F9FAFB',
              fontWeight: 700,
              fontSize: '12px',
              border: '1.5px solid #06B6D4',
            }}
          >
            Z
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary, #F9FAFB)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Zaveriya · Lead
            </div>
            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
              Belagavi Municipal
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
