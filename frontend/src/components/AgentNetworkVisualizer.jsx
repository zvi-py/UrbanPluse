import React from 'react'
import { Navigation, Calendar, Users, Activity, Bot, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

export default function AgentNetworkVisualizer({ onSelectAgent, agentSources = {}, onOpenGeminiModal }) {
  const agents = [
    {
      id: 'traffic',
      number: '01',
      title: 'Traffic Intelligence Agent',
      colorTag: 'WINE · #930400',
      category: 'Municipal Transit',
      icon: Navigation,
      accent: 'var(--agent-traffic)',
      accentBg: 'var(--agent-traffic-bg)',
      accentBorder: 'var(--agent-traffic-border)',
      description: 'Monitors vehicular throughput across 12 Belagavi arterial corridors, dynamically routes campus commuters around bottlenecks.',
      telemetry: '12 Arteries · NH48 Bypass',
      source: agentSources.traffic || 'csv_fallback',
    },
    {
      id: 'events',
      number: '02',
      title: 'Event Intelligence Agent',
      colorTag: 'STRAWBERRY · #F9D1D9',
      category: 'Civic & Culture',
      icon: Calendar,
      accent: 'var(--agent-events)',
      accentBg: 'var(--agent-events-bg)',
      accentBorder: 'var(--agent-events-border)',
      description: 'Curates 26+ campus fests, tech symposiums, and cultural gatherings with TF-IDF vector ranking and crowd radius modeling.',
      telemetry: '26 Gatherings · BGM Basin',
      source: agentSources.events || 'csv_fallback',
    },
    {
      id: 'student',
      number: '03',
      title: 'Student Connectivity Agent',
      colorTag: 'HEAVENLY · #95BAEB',
      category: 'Campus Guilds',
      icon: Users,
      accent: 'var(--agent-student)',
      accentBg: 'var(--agent-student-bg)',
      accentBorder: 'var(--agent-student-border)',
      description: 'Connects engineering scholars across KLE Tech, KLS GIT, VTU, and BIMS through peer skill-matching and active project cells.',
      telemetry: '6 Colleges · Student Guilds',
      source: agentSources.student || 'stub',
    },
    {
      id: 'environment',
      number: '04',
      title: 'Environmental Vitals Agent',
      colorTag: 'MATCHA · #838F58',
      category: '58 BCC Wards',
      icon: Activity,
      accent: 'var(--agent-env)',
      accentBg: 'var(--agent-env-bg)',
      accentBorder: 'var(--agent-env-border)',
      description: 'Surveils air quality indices, acoustic decibels, and weather vitals across all 58 Belagavi City Corporation wards with anomaly detection.',
      telemetry: '58 Wards · AQI & Decibels',
      source: agentSources.environment || 'csv_fallback',
    },
  ]

  return (
    <section
      style={{
        maxWidth: '1360px',
        margin: '0 auto 56px',
        padding: '0 clamp(16px, 3vw, 28px)',
        position: 'relative',
      }}
    >
      {/* Section Header with Sage Editorial Styling */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--accent-light)',
            border: '1px solid var(--border-accent)',
            marginBottom: '16px',
          }}
        >
          <Bot size={13} color="var(--accent)" />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
            }}
          >
            Autonomous Multi-Agent Synthesis
          </span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 12px 0',
            fontWeight: 600,
          }}
        >
          Four Intelligent Agents. <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>One Connected City.</span>
        </h2>
        <p
          style={{
            fontSize: '14.5px',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}
        >
          Orchestrating Belagavi's urban ecosystem in real time through synchronized transit intelligence, civic gatherings, collegiate networks, and environmental vitals.
        </p>
      </div>

      {/* Central Gemini AI Urban Intelligence Hub Banner */}
      <div
        style={{
          background: 'var(--agent-gemini-bg)',
          border: '1px solid var(--agent-gemini-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-glass)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 500px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--agent-gemini)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--agent-gemini)',
                }}
              >
                CENTRAL SYNTHESIS ENGINE
              </span>
              <span
                style={{
                  fontSize: '10px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-hairline)',
                  fontWeight: 600,
                }}
              >
                Google Gemini 1.5 Flash
              </span>
            </div>
            <h3
              style={{
                fontSize: '17px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 4px 0',
              }}
            >
              Gemini Urban Intelligence Assistant
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Synthesizes queries across all four agents to provide instant detour recommendations, campus event planning, and quiet study ward identification.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenGeminiModal}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--agent-gemini)',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(147, 4, 0, 0.22)',
            transition: 'all 0.15s ease',
          }}
        >
          <Bot size={14} />
          <span>Ask Gemini AI</span>
        </button>
      </div>

      {/* 4 Agent Cards Grid with Exact Theme Color Coding */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {agents.map((agent) => {
          const Icon = agent.icon
          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent && onSelectAgent(agent.id)}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: `1px solid ${agent.accentBorder}`,
                borderRadius: 'var(--radius-lg)',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-glass)',
                position: 'relative',
              }}
            >
              <div>
                {/* Card Top: Number, Icon & Category */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: agent.accentBg,
                        color: agent.accent,
                        border: `1px solid ${agent.accentBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={19} />
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                      AGENT {agent.number}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '9.5px',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: agent.accentBg,
                        color: agent.accent,
                        border: `1px solid ${agent.accentBorder}`,
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        fontFamily: 'monospace',
                      }}
                    >
                      {agent.colorTag}
                    </span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: agent.accentBg,
                        color: agent.accent,
                        border: `1px solid ${agent.accentBorder}`,
                        fontWeight: 700,
                      }}
                    >
                      {agent.category}
                    </span>
                  </div>
                </div>

                {/* Agent Title */}
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                    margin: '0 0 8px 0',
                  }}
                >
                  {agent.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    margin: '0 0 16px 0',
                  }}
                >
                  {agent.description}
                </p>
              </div>

              {/* Card Footer: Telemetry summary & inspect link */}
              <div
                style={{
                  borderTop: '1px solid var(--border-hairline)',
                  paddingTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>
                  {agent.telemetry}
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: agent.accent,
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  <span>Explore</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
