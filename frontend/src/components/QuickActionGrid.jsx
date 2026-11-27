import React from 'react'
import { UserCheck, Compass, Users2, CalendarPlus, MapPin, BookOpen, ChevronRight } from 'lucide-react'

export default function QuickActionGrid({ onOpenHostModal, onNavigate }) {
  const actions = [
    {
      id: 'discover_students',
      title: 'Discover Students',
      description: 'Connect with fellow undergraduate and engineering peers across Belagavi campuses.',
      icon: UserCheck,
      accent: '#6366F1',
      bg: 'rgba(99, 102, 241, 0.1)',
      target: '#student',
    },
    {
      id: 'find_friends',
      title: 'Find Friends with Similar Interests',
      description: 'Vector-matched peers sharing your programming, robotics, and data science passions.',
      icon: Compass,
      accent: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.1)',
      target: '#student',
    },
    {
      id: 'explore_communities',
      title: 'Explore Communities',
      description: 'Collegiate societies, cultural councils, and tech guilds across VTU, KLE, and GIT.',
      icon: Users2,
      accent: '#EC4899',
      bg: 'rgba(236, 72, 153, 0.1)',
      target: '#student',
    },
    {
      id: 'create_event',
      title: 'Create and Host Events',
      description: 'Register a technical contest, campus fest, or club meet directly into the Belagavi dataset.',
      icon: CalendarPlus,
      accent: '#16A34A',
      bg: 'rgba(22, 163, 74, 0.08)',
      isAction: true,
      onClick: onOpenHostModal,
    },
    {
      id: 'nearby_activities',
      title: 'Discover Nearby Activities',
      description: 'Filter verified gatherings within 15 km of Belagavi City Center and campuses.',
      icon: MapPin,
      accent: '#0284C7',
      bg: 'rgba(2, 132, 199, 0.08)',
      target: '#events',
    },
    {
      id: 'study_groups',
      title: 'Join Study Groups',
      description: 'Form hackathon teams and peer-assisted study circles in Tilakwadi and Camp.',
      icon: BookOpen,
      accent: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
      target: '#student',
    },
  ]

  return (
    <section
      style={{
        maxWidth: '1360px',
        margin: '0 auto 64px',
        padding: '0 clamp(16px, 3vw, 28px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px' }} className="fade-in-up">
        <div>
          <span className="editorial-label" style={{ color: 'var(--accent)', display: 'block', marginBottom: '6px' }}>
            CIVIC & STUDENT DISCOVERY
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Connect, Collaborate & <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Participate.</span>
          </h2>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
          Belagavi Student & Citizen Services
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {actions.map((act) => {
          const Icon = act.icon
          const content = (
            <div
              key={act.id}
              className="quick-tile fade-in-up"
              onClick={act.onClick}
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: act.bg,
                    color: act.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    margin: '0 0 8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{act.title}</span>
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {act.description}
                </p>
              </div>

              <div
                style={{
                  marginTop: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: act.accent,
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <span>{act.isAction ? 'Launch Form' : 'Explore'}</span>
                <ChevronRight size={14} />
              </div>
            </div>
          )

          if (act.target) {
            return (
              <a key={act.id} href={act.target} style={{ textDecoration: 'none', color: 'inherit' }}>
                {content}
              </a>
            )
          }

          return content
        })}
      </div>
    </section>
  )
}
