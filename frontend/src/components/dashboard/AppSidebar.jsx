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

export default function AppSidebar({ activeTab, onSelectTab, onOpenHostModal }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Explore City Map', icon: MapPin },
    { id: 'agents_core', label: '4 Intelligent Agents', icon: Cpu },
    { id: 'student', label: 'Student Network', icon: Users },
    { id: 'events', label: 'Campus Gatherings', icon: Compass },
    { id: 'traffic', label: 'Traffic Corridors', icon: Activity },
    { id: 'environment', label: 'Environment Vitals', icon: ShieldCheck },
  ]

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
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
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#06B6D4',
              color: '#090D14',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '15px',
              fontFamily: 'monospace',
            }}
          >
            U
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.02em', color: '#F8FAFC' }}>
              URBANPULSE
            </div>
            <div style={{ fontSize: '9px', color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
              Belagavi City AI
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

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
                  color: isActive ? '#38BDF8' : '#94A3B8',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                  borderLeft: isActive ? '2.5px solid #38BDF8' : '2.5px solid transparent',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </div>
            )
          })}
        </nav>

        {/* Action Button */}
        <div style={{ padding: '4px 12px' }}>
          <button
            onClick={onOpenHostModal}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '6px',
              backgroundColor: '#10B981',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <CalendarPlus size={13} />
            <span>Host Gathering</span>
          </button>
        </div>
      </div>

      {/* Footer Status */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #1E293B', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>Belagavi Mesh Live</span>
        </div>
        <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px', fontFamily: 'monospace' }}>
          Orchestrator v2.4
        </div>
      </div>
    </aside>
  )
}
