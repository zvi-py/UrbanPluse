import React from 'react'
import { Cpu, Navigation, Calendar, Users, Activity, Sparkles, ArrowRight } from 'lucide-react'

export default function AgentNetworkVisualizer({ onSelectAgent, agentSources = {} }) {
  const agents = [
    {
      id: 'traffic',
      number: '01',
      title: 'TRAFFIC INTELLIGENCE AGENT',
      icon: Navigation,
      accent: '#22D3EE',
      accentBg: 'rgba(34, 211, 238, 0.12)',
      description: 'Monitors vehicular throughput, detects road congestion bottlenecks, and dynamically calculates bypass routes.',
      telemetry: 'Belagavi City Center · NH48 Bypass',
      source: agentSources.traffic || 'csv_fallback',
      targetHref: '#traffic',
    },
    {
      id: 'events',
      number: '02',
      title: 'EVENT INTELLIGENCE AGENT',
      icon: Calendar,
      accent: '#A855F7',
      accentBg: 'rgba(168, 85, 247, 0.12)',
      description: 'Discovers academic and cultural gatherings, validates municipal coordinates, and ranks by TF-IDF vector similarity.',
      telemetry: 'Campus Gatherings · Belagavi Basin',
      source: agentSources.events || 'csv_fallback',
      targetHref: '#events',
    },
    {
      id: 'student',
      number: '03',
      title: 'STUDENT CONNECTIVITY AGENT',
      icon: Users,
      accent: '#6366F1',
      accentBg: 'rgba(99, 102, 241, 0.12)',
      description: 'Connects engineering and science students across Belagavi colleges through shared skills, interests, and peer mentorships.',
      telemetry: 'Academic Clusters · Student Guilds',
      source: agentSources.student || 'stub',
      targetHref: '#student',
    },
    {
      id: 'environment',
      number: '04',
      title: 'ENVIRONMENTAL & URBAN ANOMALY AGENT',
      icon: Activity,
      accent: '#10B981',
      accentBg: 'rgba(16, 185, 129, 0.12)',
      description: 'Surveils air quality (AQI), acoustic decibels, and weather vitals across all 58 BCC wards using Isolation Forest anomaly detection.',
      telemetry: '58 BCC Wards · CPCB Telemetry',
      source: agentSources.environment || 'csv_fallback',
      targetHref: '#environment',
    },
  ]

  return (
    <section
      style={{
        maxWidth: '1360px',
        margin: '0 auto 64px',
        padding: '0 clamp(16px, 3vw, 28px)',
        position: 'relative',
      }}
    >
      {/* Section Header matching Video Frame 3 & 4 */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }} className="fade-in-up">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', marginBottom: '14px' }}>
          <Sparkles size={14} color="var(--accent)" />
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase' }}>
            Autonomous Multi-Agent Synthesis
          </span>
        </div>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3.8vw, 3rem)',
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 10px 0',
          }}
        >
          Four Intelligent Agents. <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>One Connected Platform.</span>
        </h2>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          One City. Four Intelligent Agents. One Connected Future. Observing, cross-correlating, and orchestrating Belagavi's urban ecosystem in real time.
        </p>
      </div>

      {/* Central Visual Architecture Grid with Core Neural Unit */}
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}
      >
        {agents.map((agent) => {
          const Icon = agent.icon
          return (
            <div
              key={agent.id}
              className="agent-card-interactive fade-in-up"
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-glass)',
              }}
            >
              {/* Top Row: Number, Icon, Status */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: agent.accentBg,
                        color: agent.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                      {agent.number}
                    </span>
                  </div>
                  <span
                    className={`pill-badge ${agent.source === 'live_api' ? 'live' : agent.source === 'csv_fallback' ? 'csv' : 'stub'}`}
                    style={{ fontSize: '10px', padding: '3px 8px' }}
                  >
                    <span className="pulse-dot" />
                    {agent.source.toUpperCase().replace('_', ' ')}
                  </span>
                </div>

                {/* Agent Title */}
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.02em',
                    margin: '0 0 10px 0',
                    textTransform: 'uppercase',
                  }}
                >
                  {agent.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    margin: '0 0 16px 0',
                  }}
                >
                  {agent.description}
                </p>
              </div>

              {/* Footer Row: Telemetry pill & Navigation Link */}
              <div
                style={{
                  borderTop: '1px solid var(--border-hairline)',
                  paddingTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono, monospace)' }}>
                  {agent.telemetry}
                </span>
                <a
                  href={agent.targetHref}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: agent.accent,
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <span>Inspect</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
