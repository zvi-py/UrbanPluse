import React from 'react'

export default function EnvironmentPanel({ data, loading = false, error = null }) {
  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '36px', height: '360px' }}>
        <div className="skeleton-shimmer" style={{ width: '40%', height: '24px', marginBottom: '24px' }} />
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div className="skeleton-shimmer" style={{ width: '140px', height: '140px', borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-shimmer" style={{ width: '100%', height: '36px', marginBottom: '12px' }} />
            <div className="skeleton-shimmer" style={{ width: '80%', height: '36px' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '36px', textAlign: 'center' }}>
        <p style={{ color: 'var(--status-critical)', marginBottom: '8px' }}>Atmospheric telemetry offline.</p>
        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>{error}</p>
      </div>
    )
  }

  const aqi = typeof data?.aqi === 'number' ? data.aqi : 72
  const aqiCategory = data?.aqi_category || 'Moderate'
  const temp = typeof data?.temperature_celsius === 'number' ? data.temperature_celsius : 28.5
  const humidity = typeof data?.humidity_percent === 'number' ? data.humidity_percent : 65
  const noise = typeof data?.noise_db === 'number' ? data.noise_db : 58.3
  const wind = typeof data?.wind_speed_kmh === 'number' ? data.wind_speed_kmh : 12.0
  const dominantPollutant = data?.dominant_pollutant || 'PM2.5'
  const anomalyDetected = !!data?.anomaly_detected
  const weatherCondition = data?.weather_condition || 'Partly Cloudy'

  // Ring gauge calculation (radius 58px)
  const radius = 58
  const circumference = 2 * Math.PI * radius
  // AQI scale 0 to 300
  const normalizedAqi = Math.min(Math.max(aqi, 0), 300)
  const strokeDashoffset = circumference - (normalizedAqi / 300) * circumference

  const getAqiColor = (val) => {
    if (val <= 50) return 'var(--status-ok)'
    if (val <= 100) return 'var(--status-warning)'
    return 'var(--status-critical)'
  }

  const aqiColor = getAqiColor(aqi)

  return (
    <div className="glass-card" style={{ padding: '36px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span className="editorial-label" style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
            ATMOSPHERIC SENSORS
          </span>
          <span className="numeral-serif" style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
            Belagavi Basin Vitals
          </span>
        </div>

        {/* Anomaly Detection Status Pill */}
        <div
          className={`pill-badge ${anomalyDetected ? 'mock' : 'live'}`}
          style={{ padding: '4px 12px' }}
        >
          <span className="pulse-dot" />
          <span>
            {anomalyDetected ? 'ISOLATION FOREST: ANOMALY' : 'ISOLATION FOREST: NOMINAL'}
          </span>
        </div>
      </div>

      {/* Main Metric: Circular Progress Ring & AQI */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '36px',
          flexWrap: 'wrap',
          marginBottom: '36px',
          paddingBottom: '28px',
          borderBottom: '1px solid var(--border-hairline)',
        }}
      >
        {/* SVG Circular Hairline Gauge */}
        <div
          style={{
            position: 'relative',
            width: '144px',
            height: '144px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="144" height="144" viewBox="0 0 144 144" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Track Ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              stroke="rgba(255, 244, 230, 0.08)"
              strokeWidth="3.5"
            />
            {/* Progress Ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              fill="none"
              stroke={aqiColor}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </svg>

          {/* Centered Numeral */}
          <div
            style={{
              position: 'absolute',
              textAlign: 'center',
            }}
          >
            <span
              className="numeral-serif"
              style={{
                fontSize: '2.75rem',
                color: 'var(--text-primary)',
                lineHeight: 1,
                display: 'block',
              }}
            >
              {aqi}
            </span>
            <span className="editorial-label" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
              AQI INDEX
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: aqiColor }} />
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                color: 'var(--text-primary)',
                textTransform: 'capitalize',
                margin: 0,
              }}
            >
              {aqiCategory} Quality
            </h4>
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
            Dominant particulate concentration tracked as <strong style={{ color: 'var(--accent)' }}>{dominantPollutant}</strong>.
            Atmospheric dispersion rate remains stable under current wind velocities.
          </p>

          <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
            WEATHER: {weatherCondition.toUpperCase().replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 244, 230, 0.02)',
            border: '1px solid var(--border-hairline)',
          }}
        >
          <span className="editorial-label" style={{ fontSize: '9.5px', display: 'block', marginBottom: '4px' }}>
            AMBIENT TEMPERATURE
          </span>
          <span className="numeral-serif" style={{ fontSize: '26px', color: 'var(--text-primary)' }}>
            {temp}°C
          </span>
        </div>

        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 244, 230, 0.02)',
            border: '1px solid var(--border-hairline)',
          }}
        >
          <span className="editorial-label" style={{ fontSize: '9.5px', display: 'block', marginBottom: '4px' }}>
            ACOUSTIC INTENSITY
          </span>
          <span className="numeral-serif" style={{ fontSize: '26px', color: 'var(--text-primary)' }}>
            {noise} <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>dB</span>
          </span>
        </div>

        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 244, 230, 0.02)',
            border: '1px solid var(--border-hairline)',
          }}
        >
          <span className="editorial-label" style={{ fontSize: '9.5px', display: 'block', marginBottom: '4px' }}>
            RELATIVE HUMIDITY
          </span>
          <span className="numeral-serif" style={{ fontSize: '26px', color: 'var(--text-primary)' }}>
            {humidity}%
          </span>
        </div>

        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 244, 230, 0.02)',
            border: '1px solid var(--border-hairline)',
          }}
        >
          <span className="editorial-label" style={{ fontSize: '9.5px', display: 'block', marginBottom: '4px' }}>
            WIND VELOCITY
          </span>
          <span className="numeral-serif" style={{ fontSize: '26px', color: 'var(--text-primary)' }}>
            {wind} <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>km/h</span>
          </span>
        </div>
      </div>
    </div>
  )
}

