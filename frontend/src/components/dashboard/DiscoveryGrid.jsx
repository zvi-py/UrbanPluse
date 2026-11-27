import React from 'react'
import {
  Users,
  Compass,
  Users2,
  CalendarPlus,
  MapPin,
  BookOpen,
  ArrowRight,
  Tag,
} from 'lucide-react'

export default function DiscoveryGrid({
  onOpenHostModal,
  onSelectTab,
  studentCount = 118,
  eventsCount = 26,
  theme = 'light',
}) {
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
      color: 'var(--agent-student)',
      bg: 'var(--agent-student-bg)',
      border: 'var(--agent-student-border)',
    },
    {
      id: 'communities',
      title: 'Collegiate Society Guilds',
      desc: 'Active student societies across VTU, KLE Tech, GIT, and SGBIT campuses.',
      icon: Users2,
      actionText: 'View Guilds',
      onClick: () => onSelectTab('student'),
      color: 'var(--agent-student)',
      bg: 'var(--agent-student-bg)',
      border: 'var(--agent-student-border)',
    },
    {
      id: 'host',
      title: 'Register Campus Gathering',
      desc: 'Submit technical contests or cultural fests with Belagavi bounding coordinate validation.',
      icon: CalendarPlus,
      actionText: 'Launch Form',
      onClick: onOpenHostModal,
      isPrimary: true,
      color: 'var(--agent-gemini)',
      bg: 'var(--agent-gemini-bg)',
      border: 'var(--agent-gemini-border)',
    },
    {
      id: 'activities',
      title: '25 km Gathering Radius',
      desc: `Filter ${eventsCount} verified gatherings within municipal Belagavi coordinates.`,
      icon: MapPin,
      actionText: 'Explore Events',
      onClick: () => onSelectTab('events'),
      color: 'var(--agent-events)',
      bg: 'var(--agent-events-bg)',
      border: 'var(--agent-events-border)',
    },
    {
      id: 'study',
      title: 'Technical Study Circles',
      desc: 'Collaborative hackathon squads and GATE circles in Tilakwadi & Camp.',
      icon: BookOpen,
      actionText: 'Join Circle',
      onClick: () => onSelectTab('student'),
      color: 'var(--agent-student)',
      bg: 'var(--agent-student-bg)',
      border: 'var(--agent-student-border)',
    },
    {
      id: 'traffic_flow',
      title: 'Corridor Traffic & Alternate Routes',
      desc: 'Review congestion thresholds, bypass routing, and active road maintenance.',
      icon: Compass,
      actionText: 'Inspect Corridors',
      onClick: () => onSelectTab('traffic'),
      color: 'var(--agent-traffic)',
      bg: 'var(--agent-traffic-bg)',
      border: 'var(--agent-traffic-border)',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 6 Actions Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
        }}
      >
        {actions.map((act) => {
          const Icon = act.icon

          return (
            <div
              key={act.id}
              onClick={act.onClick}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-glass)',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: act.bg,
                      color: act.color,
                      border: `1px solid ${act.border}`,
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
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'var(--accent-light)',
                        color: 'var(--accent)',
                        border: '1px solid var(--border-accent)',
                      }}
                    >
                      PRIMARY
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {act.title}
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {act.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px', color: act.color, fontSize: '11.5px', fontWeight: 700 }}>
                <span>{act.actionText}</span>
                <ArrowRight size={13} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Peer Tags Bar in Luxury Pill Style */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          padding: '12px 18px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-pill)',
          boxShadow: 'var(--shadow-glass)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '11px', fontWeight: 700 }}>
          <Tag size={13} color="var(--accent)" />
          <span>TAXONOMY:</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {peerTags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: '11px',
                fontFamily: 'inherit',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-hairline)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
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
