import React, { useState } from 'react'
import {
  Cpu,
  Sliders,
  ShieldCheck,
  Activity,
  RotateCw,
  CheckCircle2
} from 'lucide-react'

export default function AnomalyView({ anomalyData, onRefresh }) {
  const [severityFilter, setSeverityFilter] = useState('all')
  const [evaluating, setEvaluating] = useState(false)

  const anomalies = anomalyData?.flagged_anomalies || []
  const count = anomalies.length

  const handleReRun = async () => {
    setEvaluating(true)
    try {
      if (onRefresh) await onRefresh()
    } finally {
      setTimeout(() => setEvaluating(false), 500)
    }
  }

  const filteredAnomalies = anomalies.filter((a) => {
    if (severityFilter !== 'all' && a.priority !== severityFilter) return false
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Card */}
      <div className="smart-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#FDA4AF',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(244, 63, 94, 0.3)'
              }}>
                Scikit-Learn Isolation Forest
              </span>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                City-Wide Multi-Dimensional AI
              </span>
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              AI Environmental Anomaly Detection Engine
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8', maxWidth: '780px', lineHeight: 1.5 }}>
              Surveillance of environmental anomalies across Belagavi using unsupervised Isolation Forest algorithms. Detects multi-pollutant surges, thermal inversions, and abnormal microclimates.
            </p>
          </div>

          <button
            onClick={handleReRun}
            disabled={evaluating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#3B82F6',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: evaluating ? 'wait' : 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
            }}
          >
            <RotateCw size={15} className={evaluating ? 'spin' : ''} />
            <span>{evaluating ? 'Evaluating...' : 'Re-Run Anomaly Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Architecture & Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Architecture */}
        <div className="smart-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
            <Cpu size={14} color="#3B82F6" />
            <span>Algorithm Architecture</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>
            Isolation Forest
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            100 Estimators &bull; Contamination 8%
          </div>
        </div>

        {/* Dimensions */}
        <div className="smart-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
            <Sliders size={14} color="#22C55E" />
            <span>Feature Dimensions</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>
            8 Multi-Variates
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            PM2.5, PM10, Temp, RH, Wind, Rain, Diurnal
          </div>
        </div>

        {/* Missing Policy */}
        <div className="smart-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
            <ShieldCheck size={14} color="#A855F7" />
            <span>Missing Data Policy</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>
            Median Imputation
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Never treats missing sensor data as zero
          </div>
        </div>

        {/* Active Flagged Events */}
        <div className="smart-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
            <Activity size={14} color="#EF4444" />
            <span>Active Flagged Events</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>
            {count} Anomalies
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Ranked by outlier decision score
          </div>
        </div>
      </div>

      {/* 3. Flagged Environmental Anomalies Card */}
      <div className="smart-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '12.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            FLAGGED ENVIRONMENTAL ANOMALIES ({filteredAnomalies.length})
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>Severity Filter:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                background: '#0F172A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#F8FAFC',
                fontSize: '12px',
                padding: '6px 12px',
                outline: 'none'
              }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>

        {/* Empty state or anomaly cards */}
        {filteredAnomalies.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 20px',
            gap: '12px'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1.5px solid #22C55E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22C55E'
            }}>
              <CheckCircle2 size={24} />
            </div>
            <div style={{ fontSize: '13.5px', color: '#94A3B8' }}>
              No anomalies currently active under the selected criteria.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredAnomalies.map((anom, i) => (
              <div
                key={i}
                style={{
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#F8FAFC' }}>
                    {anom.title || 'Isolation Forest Outlier Spike'}
                  </div>
                  <span style={{ fontSize: '11px', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                    Score: {anom.anomaly_score?.toFixed(3) || '0.142'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#CBD5E1' }}>
                  {anom.reason || anom.message || 'Statistical deviation from baseline.'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
