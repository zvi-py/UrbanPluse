import React, { useState } from 'react'
import {
  Volume2,
  PlusCircle,
  Filter,
  Info,
  Search,
  MapPin,
  RotateCw,
  Bell
} from 'lucide-react'

export default function NoiseReportsView({
  noiseData,
  onOpenNoiseModal,
  wards = [],
  searchQuery = '',
  setSearchQuery,
  userPersona = 'Citizen',
  setUserPersona,
  onRefresh
}) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedWard, setSelectedWard] = useState('all')

  const reports = noiseData?.reports || []
  const count = reports.length

  const filteredReports = reports.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false
    if (selectedWard !== 'all' && String(r.ward_id) !== String(selectedWard)) return false
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Top Controls & Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Search input */}
        <div style={{
          flex: '1 1 300px',
          maxWidth: '440px',
          background: '#172033',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Search Belagavi wards (e.g., Tilakwadi, Udyambag, Ward 40)..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F8FAFC',
              fontSize: '13px',
              width: '100%'
            }}
          />
        </div>

        {/* Location pill, actions, persona */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '7px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#94A3B8'
          }}>
            <MapPin size={13} color="#3B82F6" />
            <span>Belagavi City 15.8497° N, 74.4977° E</span>
          </div>

          <button
            onClick={onOpenNoiseModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '7px 14px',
              color: '#60A5FA',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={14} />
            <span>Report Noise</span>
          </button>

          <button
            onClick={onRefresh}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '7px 10px',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Refresh"
          >
            <RotateCw size={14} />
          </button>

          <button
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '7px 10px',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Alerts"
          >
            <Bell size={14} />
          </button>

          {/* Persona selector */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '3px'
          }}>
            {['Citizen', 'Analyst', 'Admin'].map((role) => (
              <button
                key={role}
                onClick={() => setUserPersona && setUserPersona(role)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: userPersona === role ? '#3B82F6' : 'transparent',
                  color: userPersona === role ? '#FFFFFF' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: userPersona === role ? 600 : 500,
                  cursor: 'pointer'
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Header Card */}
      <div className="smart-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                background: '#1E3A8A',
                color: '#60A5FA',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(96, 165, 250, 0.3)'
              }}>
                Citizen Reporting System
              </span>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                Belagavi Municipal Jurisdiction
              </span>
            </div>
            <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              Noise Intelligence & Acoustic Complaints
            </h1>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#94A3B8', maxWidth: '780px', lineHeight: 1.5 }}>
              Community-driven civic noise tracking. Citizens can register noise complaints across all 58 Belagavi municipal wards for administrative verification and squad dispatch.
            </p>
          </div>

          <button
            onClick={onOpenNoiseModal}
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
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)'
            }}
          >
            <PlusCircle size={16} />
            <span>Submit Noise Complaint</span>
          </button>
        </div>
      </div>

      {/* 3. Statutory Notice Callout */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.06)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '10px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Info size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', color: '#F59E0B', lineHeight: 1.5 }}>
          <strong>Statutory Notice:</strong> Data in this module represents citizen-submitted community complaints. They reflect public perception of acoustic nuisance and are never presented as verified, laboratory-calibrated physical sound decibel (dB) measurements. Physical acoustic meter readings will be integrated in future phases.
        </div>
      </div>

      {/* 4. 3 Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Complaints */}
        <div className="smart-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            7-DAY TOTAL COMPLAINTS
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#F8FAFC', margin: '8px 0 4px' }}>
            {count}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Recorded across 58 wards
          </div>
        </div>

        {/* Top Affected Ward */}
        <div className="smart-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            TOP AFFECTED WARD
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#60A5FA', margin: '14px 0 6px' }}>
            Ward 13: Bogarves
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            0 recent complaints
          </div>
        </div>

        {/* Categories */}
        <div className="smart-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            NOISE CATEGORIES
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#F8FAFC', margin: '8px 0 4px' }}>
            0 <span style={{ fontSize: '18px', fontWeight: 600, color: '#94A3B8' }}>Types</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Traffic, industrial, events
          </div>
        </div>
      </div>

      {/* 5. Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#172033',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        padding: '10px 16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8', fontSize: '12px', fontWeight: 600 }}>
          <Filter size={14} />
          <span>Filter Reports:</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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
          <option value="all">All Categories</option>
          <option value="traffic">Traffic noise</option>
          <option value="construction">Construction noise</option>
          <option value="industrial">Industrial noise</option>
          <option value="loudspeaker">Loudspeaker/event</option>
          <option value="other">Other</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
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
          <option value="all">All Statuses</option>
          <option value="logged">Logged</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
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
          <option value="all">All 58 Wards</option>
          {wards.map((w) => (
            <option key={w.ward_id} value={w.ward_id}>
              Ward {w.ward_number}: {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* 6. Registered Citizen Complaints List / Empty State */}
      <div className="smart-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '12.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            REGISTERED CITIZEN COMPLAINTS ({filteredReports.length})
          </h3>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Real-time sync
          </span>
        </div>

        {filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', fontSize: '13px' }}>
            No complaints found matching the selected filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredReports.map((r, i) => (
              <div
                key={r.report_id || i}
                style={{
                  padding: '14px 18px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>
                    Ward {r.ward_number}: {r.category}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>{r.description}</div>
                </div>
                <span style={{ fontSize: '11px', color: '#60A5FA', background: 'rgba(59, 130, 246, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                  {r.status || 'Logged'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
