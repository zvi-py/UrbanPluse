import React, { useState } from 'react'
import { X, CalendarPlus, MapPin, Users, Tag, AlertCircle, CheckCircle } from 'lucide-react'

const VENUE_SUGGESTIONS = [
  { name: 'KLE Tech Campus, Belagavi', lat: 15.8655, lng: 74.5122 },
  { name: 'VTU Jnana Sangama, Belagavi', lat: 15.8950, lng: 74.4550 },
  { name: 'KLS Gogte Institute of Technology (GIT), Udyambag', lat: 15.8180, lng: 74.4780 },
  { name: 'Rani Channamma Circle, Belagavi', lat: 15.8570, lng: 74.5080 },
  { name: 'Belagavi Fort Grounds', lat: 15.8610, lng: 74.5200 },
  { name: 'Tilakwadi Cultural Center, Belagavi', lat: 15.8360, lng: 74.5020 },
]

export default function HostEventModal({ isOpen, onClose, onEventCreated }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('technical')
  const [selectedVenue, setSelectedVenue] = useState(VENUE_SUGGESTIONS[0])
  const [customVenue, setCustomVenue] = useState('')
  const [startDateTime, setStartDateTime] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().slice(0, 16)
  })
  const [expectedAttendance, setExpectedAttendance] = useState('200')
  const [description, setDescription] = useState('')
  const [organizer, setOrganizer] = useState('Collegiate Society / Student Lead')
  const [isFree, setIsFree] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setStatusMsg(null)

    const venueName = customVenue.trim() || selectedVenue.name
    const venueLat = customVenue.trim() ? 15.8497 : selectedVenue.lat
    const venueLng = customVenue.trim() ? 74.4977 : selectedVenue.lng

    const payload = {
      title: title.trim(),
      category: category.toLowerCase(),
      venue: venueName,
      lat: venueLat,
      lng: venueLng,
      start_datetime: new Date(startDateTime).toISOString(),
      expected_attendance: parseInt(expectedAttendance, 10) || 100,
      description: description.trim() || `${title} organized in Belagavi for students and civic community.`,
      is_free: isFree,
      organizer: organizer.trim() || 'Student Committee',
    }

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optional admin token if configured
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Server returned HTTP ${res.status}`)
      }

      setIsSuccess(true)
      setStatusMsg('Gathering successfully registered! Event indexed into Belagavi dataset.')
      setTimeout(() => {
        if (onEventCreated) onEventCreated()
        onClose()
      }, 1500)
    } catch (err) {
      setIsSuccess(false)
      setStatusMsg(err.message || 'Could not register event. Check network connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="fade-in-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-surface-raised, #181614)',
          border: '1px solid var(--border-glass-bright, rgba(255, 255, 255, 0.15))',
          borderRadius: 'var(--radius-lg, 16px)',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-glass, 0 24px 64px rgba(0,0,0,0.8))',
          padding: '28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarPlus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Host a Gathering
              </h2>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Belagavi Verified Coordinate Submission
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {statusMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${isSuccess ? '#16A34A' : '#DC2626'}`,
              color: isSuccess ? '#16A34A' : '#DC2626',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isSuccess ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Belagavi Smart Urban Hackathon 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-hairline)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Category & Expected Attendance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-hairline)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              >
                <option value="technical">Technical / Hackathon</option>
                <option value="academic">Academic Conference</option>
                <option value="cultural">Cultural Festival / Utsav</option>
                <option value="sports">Sports / Athletics</option>
                <option value="workshop">Hands-on Workshop</option>
                <option value="community">Community Meetup</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Expected Attendance
              </label>
              <input
                type="number"
                min="10"
                max="50000"
                value={expectedAttendance}
                onChange={(e) => setExpectedAttendance(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-hairline)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          {/* Venue Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Belagavi Venue / Campus *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {VENUE_SUGGESTIONS.map((v) => (
                <button
                  type="button"
                  key={v.name}
                  onClick={() => {
                    setSelectedVenue(v)
                    setCustomVenue('')
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid',
                    borderColor: selectedVenue.name === v.name && !customVenue ? 'var(--accent)' : 'var(--border-hairline)',
                    backgroundColor: selectedVenue.name === v.name && !customVenue ? 'var(--accent-dim)' : 'transparent',
                    color: selectedVenue.name === v.name && !customVenue ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {v.name.split(',')[0]}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or enter custom Belagavi locality / auditorium"
              value={customVenue}
              onChange={(e) => setCustomVenue(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-hairline)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '12.5px',
              }}
            />
          </div>

          {/* Date & Time */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-hairline)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Brief Description
            </label>
            <textarea
              rows={2}
              placeholder="Highlight key agendas, speaker details, or participant tracks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-hairline)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '12.5px',
                resize: 'none',
              }}
            />
          </div>

          {/* Free Admission Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="isFreeCheck"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
            />
            <label htmlFor="isFreeCheck" style={{ fontSize: '12.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Free entry for students & general public
            </label>
          </div>

          {/* Submit CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-hairline)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '12.5px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: '12.5px',
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? 'wait' : 'pointer',
              }}
            >
              <span>{submitting ? 'Registering...' : 'Register Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
