import React from 'react'

export default function StudentPanel({ data, loading = false, error = null }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '36px' }}>
        <div className="skeleton-shimmer" style={{ width: '45%', height: '24px', marginBottom: '24px' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-shimmer" style={{ width: '100%', height: '80px', marginBottom: '14px' }} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
        <p style={{ color: 'var(--status-critical)', marginBottom: '8px' }}>Student network registry unreachable.</p>
        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>{error}</p>
      </div>
    )
  }

  const matches = data?.matches || []
  const recommendedGroups = data?.recommended_groups || []

  // Helper to extract initials
  const getInitials = (name) => {
    if (!name) return 'ST'
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="glass-card" style={{ padding: '36px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '26px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span className="editorial-label" style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
            CAMPUS AFFINITY MATCHING
          </span>
          <span className="numeral-serif" style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
            Cosine Affinity Index
          </span>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--text-dim)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          TF-IDF · VECTOR SPACE EMBEDDING
        </span>
      </div>

      {/* Match Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
        {matches.map((student, idx) => {
          const initials = getInitials(student.name)
          const similarityPercent = Math.round((student.similarity || 0.8) * 100)

          return (
            <div
              key={student.name || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 244, 230, 0.02)',
                border: '1px solid var(--border-hairline)',
                gap: '16px',
                flexWrap: 'wrap',
                transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-glass-bright)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 244, 230, 0.04)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hairline)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 244, 230, 0.02)'
              }}
            >
              {/* Left: Initials Circle & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-glass-bright)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    color: 'var(--accent)',
                    backgroundColor: 'rgba(184, 151, 122, 0.06)',
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>

                <div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      color: 'var(--text-primary)',
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {student.name}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    {student.department || 'Engineering'} {student.year ? `· Year ${student.year}` : ''}
                  </span>
                </div>
              </div>

              {/* Middle: Shared Interests Pills */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  flex: 1,
                  minWidth: '200px',
                }}
              >
                {(student.shared_interests || []).map((interest, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '11px',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--border-hairline)',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'rgba(255, 244, 230, 0.015)',
                    }}
                  >
                    {interest}
                  </span>
                ))}
              </div>

              {/* Right: Similarity Percent in Serif */}
              <div style={{ textAlign: 'right', minWidth: '70px', flexShrink: 0 }}>
                <span className="numeral-serif" style={{ fontSize: '24px', color: 'var(--accent)', display: 'block', lineHeight: 1 }}>
                  {similarityPercent}%
                </span>
                <span className="editorial-label" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                  SIMILARITY
                </span>
              </div>
            </div>
          )
        })}

        {matches.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            No peer matches generated for this profile query.
          </div>
        )}
      </div>

      {/* Recommended Campus Guilds / Groups */}
      {recommendedGroups.length > 0 && (
        <div
          style={{
            paddingTop: '20px',
            borderTop: '1px solid var(--border-hairline)',
          }}
        >
          <span
            className="editorial-label"
            style={{ display: 'block', marginBottom: '14px', color: 'var(--text-dim)' }}
          >
            RECOMMENDED CAMPUS GUILDS & RESEARCH CELLS
          </span>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {recommendedGroups.map((group, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 244, 230, 0.015)',
                  border: '1px solid var(--border-hairline)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {group.name}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--accent)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--accent-dim)',
                  }}
                >
                  {group.members} mem
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

