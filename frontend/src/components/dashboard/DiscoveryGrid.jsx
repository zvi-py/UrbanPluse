import React from 'react'
import {
  Users,
  Compass,
  Users2,
  CalendarPlus,
  MapPin,
  BookOpen,
  ArrowRight,
  Tag
} from 'lucide-react'

export default function DiscoveryGrid({ onOpenHostModal, onSelectTab, studentCount = 118, eventsCount = 31, theme = 'dark' }) {
  const isLight = theme === 'light'

  const peerTags = [
    '#BelagaviTech',
    '#SmartMobility',
    '#KLETech',
    '#VTUGuild',
    '#GITStudents',
    '#MachineLearning',
    '#CleanAirBasin',
    '#Hackathon2026',
    '#UrbanAnomalies',
  ]

  const actions = [
    {
      id: 'students',
      title: 'Peer Directory & Vector Match',
      desc: `Query ${studentCount} engineering & science students by TF-IDF interest vectors.`,
      icon: Users,
      actionText: 'Browse Network',
      onClick: () => onSelectTab('student'),
      color: isLight ? '#4F46E5' : '#818CF8',
    },
    {
      id: 'communities',
      title: 'Collegiate Society Guilds',
      desc: 'Active student societies across VTU, KLE Tech, GIT, and SGBIT campuses.',
      icon: Users2,
      actionText: 'View Guilds',
      onClick: () => onSelectTab('student'),
      color: isLight ? '#2563EB' : '#60A5FA',
    },
    {
      id: 'host',
      title: 'Register Campus Gathering',
      desc: 'Submit technical contests or cultural fests with Belagavi bounding coordinate validation.',
      icon: CalendarPlus,
      actionText: 'Launch Form',
      onClick: onOpenHostModal,
      isPrimary: true,
      color: isLight ? '#16A34A' : '#34D399',
    },
    {
      id: 'activities',
      title: '15 km Gathering Radius',
      desc: `Filter ${eventsCount} verified gatherings within municipal Belagavi coordinates.`,
      icon: MapPin,
      actionText: 'Explore Events',
      onClick: () => onSelectTab('events'),
      color: isLight ? '#D97706' : '#FBBF24',
    },
    {
      id: 'study',
      title: 'Technical Study Circles',
      desc: 'Collaborative hackathon squads and GATE circles in Tilakwadi & Camp.',
      icon: BookOpen,
      actionText: 'Join Circle',
      onClick: () => onSelectTab('student'),
      color: isLight ? '#7C3AED' : '#A78BFA',
    },
    {
      id: 'traffic_flow',
      title: 'Corridor Traffic & Alternate Routes',
      desc: 'Review congestion thresholds, bypass routing, and active road maintenance.',
      icon: Compass,
      actionText: 'Inspect Corridors',
      onClick: () => onSelectTab('traffic'),
      color: isLight ? '#0284C7' : '#38BDF8',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 6 Actions Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
        }}
      >
        {actions.map((act) => {
          const Icon = act.icon

          return (
            <div
              key={act.id}
              onClick={act.onClick}
              style={{
                backgroundColor: isLight ? '#FFFFFF' : '#0F172A',
                border: `1px solid ${isLight ? '#E2E8F0' : '#1E293B'}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isLight ? '0 1px 3px rgba(0, 0, 0, 0.04)' : 'none',
                transition: 'border-color 0.15s ease, transform 0.15s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)',
                      color: act.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  {act.isPrimary && (
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: isLight ? '#F0FDF4' : 'rgba(34, 197, 94, 0.15)',
                        color: isLight ? '#166534' : '#4ADE80',
                        border: `1px solid ${isLight ? '#DCFCE7' : 'rgba(34, 197, 94, 0.3)'}`,
                      }}
                    >
                      PRIMARY
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '13.5px', fontWeight: 600, color: isLight ? '#0F172A' : '#F8FAFC', marginBottom: '6px' }}>
                  {act.title}
                </div>

                <p style={{ fontSize: '11.5px', color: isLight ? '#64748B' : '#94A3B8', lineHeight: 1.45, margin: 0 }}>
                  {act.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '14px', color: act.color, fontSize: '11px', fontWeight: 600 }}>
                <span>{act.actionText}</span>
                <ArrowRight size={12} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Peer Tags Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          padding: '10px 14px',
          backgroundColor: isLight ? '#FFFFFF' : '#0F172A',
          border: `1px solid ${isLight ? '#E2E8F0' : '#1E293B'}`,
          borderRadius: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B', fontSize: '11px', fontWeight: 600 }}>
          <Tag size={12} />
          <span>TAXONOMY TAGS:</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {peerTags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: '10.5px',
                fontFamily: 'monospace',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)'}`,
                color: isLight ? '#334155' : '#CBD5E1',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
