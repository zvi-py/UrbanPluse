import React from 'react'

export default function AgentChapter({
  id,
  number,
  tag,
  title,
  italicWord,
  description,
  source = 'stub',
  isMock = false,
  reversed = false,
  children,
}) {
  return (
    <section
      id={id}
      style={{
        position: 'relative',
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '80px 28px',
        borderTop: '1px solid var(--border-hairline)',
      }}
    >
      {/* Corner crosshairs */}
      <div className="crosshair-corner" style={{ position: 'absolute', top: 0, left: '28px', right: '28px' }} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: reversed ? 'minmax(0, 1.25fr) minmax(0, 0.75fr)' : 'minmax(0, 0.75fr) minmax(0, 1.25fr)',
          gap: '48px',
          alignItems: 'start',
        }}
        className="chapter-grid"
      >
        {/* Text Editorial Column */}
        <div
          style={{
            order: reversed ? 2 : 1,
            position: 'sticky',
            top: '110px',
          }}
          className="chapter-text-col"
        >
          {/* Big Outlined Numeral */}
          <div className="chapter-number" style={{ marginBottom: '8px' }}>
            {number}
          </div>

          {/* Section Tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '18px',
                height: '1px',
                backgroundColor: 'var(--accent)',
              }}
            />
            <span className="editorial-label">{tag}</span>
          </div>

          {/* Title */}
          <h2
            className="display-title"
            style={{
              fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
              marginBottom: '18px',
              lineHeight: 1.15,
            }}
          >
            {title} {italicWord && <em>{italicWord}</em>}
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: '14.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '28px',
              maxWidth: '440px',
            }}
          >
            {description}
          </p>

          {/* Chapter Metadata Ribbon */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-hairline)',
            }}
          >
            <span className="editorial-label" style={{ fontSize: '10px' }}>
              SOURCE CONTRACT:
            </span>
            <span
              className={`pill-badge ${isMock ? 'mock' : source === 'live_api' ? 'live' : source === 'csv_fallback' ? 'csv' : 'stub'}`}
              style={{ padding: '2px 8px', fontSize: '9.5px' }}
            >
              <span className="pulse-dot" />
              {isMock ? 'MOCK' : source.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Component / Data Column */}
        <div
          style={{
            order: reversed ? 1 : 2,
            width: '100%',
          }}
          className="chapter-data-col"
        >
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .chapter-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .chapter-text-col {
            order: 1 !important;
            position: static !important;
          }
          .chapter-data-col {
            order: 2 !important;
          }
        }
      `}</style>
    </section>
  )
}
