import React, { useState } from 'react'
import { X, Volume2, AlertCircle, CheckCircle2 } from 'lucide-react'

const CATEGORIES = [
  { id: 'traffic', label: 'Traffic & Transit', desc: 'Vehicular honking, heavy truck rumble, bypass congestion' },
  { id: 'construction', label: 'Construction & Civil', desc: 'Drilling, concrete mixing, earth moving machinery' },
  { id: 'industrial', label: 'Industrial & Fabrication', desc: 'Forging hammers, compressor whine, factory exhaust' },
  { id: 'loudspeaker', label: 'Loudspeaker / Festivity', desc: 'Public address systems, processions, unpermitted sound' },
  { id: 'other', label: 'Other Acoustic Source', desc: 'Commercial DG sets, event amplification, generators' }
]

export default function NoiseReportModal({ isOpen, onClose, wards = [], onReportSubmitted }) {
  const [wardId, setWardId] = useState(1)
  const [category, setCategory] = useState('traffic')
  const [description, setDescription] = useState('')
  const [decibelEstimate, setDecibelEstimate] = useState('')
  const [reporterAlias, setReporterAlias] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description.trim() || description.length < 5) {
      setError('Please provide a descriptive explanation (minimum 5 characters).')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const payload = {
        ward_id: parseInt(wardId, 10),
        category,
        description: description.trim(),
        decibel_estimate: decibelEstimate ? parseFloat(decibelEstimate) : null,
        reporter_alias: reporterAlias.trim() || 'Citizen Reporter'
      }

      const res = await fetch(`${apiBase}/environment/noise/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`)
      }

      setSuccess(true)
      if (onReportSubmitted) {
        onReportSubmitted()
      }
      setTimeout(() => {
        setSuccess(false)
        setDescription('')
        setDecibelEstimate('')
        onClose()
      }, 1400)
    } catch (err) {
      setError(err.message || 'Failed to submit community report.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 9, 18, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#172033',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60A5FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Volume2 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#F8FAFC' }}>
                Log Community Acoustic Incident
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8' }}>
                Citizen crowdsourced reporting for Belagavi municipal wards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content / Form */}
        {success ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#22C55E" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ margin: '0 0 6px', color: '#F8FAFC', fontSize: '18px' }}>Report Successfully Logged</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
              Your acoustic incident has been registered in the municipal environmental index.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Ward Select */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>
                AFFECTED MUNICIPAL WARD
              </label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#F8FAFC',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                {wards.map((w) => (
                  <option key={w.ward_id} value={w.ward_id}>
                    Ward {w.ward_number} — {w.locality} ({w.zone} Zone)
                  </option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>
                NOISE CATEGORY
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '8px 10px',
                      background: category === cat.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: category === cat.id ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '6px',
                      color: category === cat.id ? '#93C5FD' : '#94A3B8',
                      fontSize: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>
                INCIDENT DESCRIPTION
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the noise source, persistence, or impact on nearby residential area..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#0F172A',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#F8FAFC',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Optional decibel and reporter */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>
                  ESTIMATED DECIBELS (OPTIONAL)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="40"
                  max="130"
                  value={decibelEstimate}
                  onChange={(e) => setDecibelEstimate(e.target.value)}
                  placeholder="e.g. 78.5 dB"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>
                  REPORTER ALIAS (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={reporterAlias}
                  onChange={(e) => setReporterAlias(e.target.value)}
                  placeholder="e.g. Tilakwadi Resident"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#F8FAFC',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#94A3B8',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '9px 20px',
                  background: submitting ? '#2563EB' : '#3B82F6',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: submitting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
