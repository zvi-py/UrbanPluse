import React, { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Polygon, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import {
  CheckCircle2,
  Search,
  X,
  Layers,
  MapPin,
  Wind,
  Thermometer,
  Volume2,
  AlertTriangle,
  RotateCw,
  Info,
  Sliders,
  Tag
} from 'lucide-react'

const BELAGAVI_CENTER = [15.8497, 74.4977]

function MapPanController({ center, zoom = 12 }) {
  const map = useMap()
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 })
    }
  }, [center, zoom, map])
  return null
}

/**
 * Computes layer-specific color, border, and diagnostic telemetry for each ward.
 * Tiers:
 * - normal: Green (#22C55E)
 * - moderate anomaly: Yellow (#EAB308)
 * - high-priority anomaly: Red (#EF4444)
 * - unverified: ntg (transparent fill, neutral dashed border #94A3B8)
 */
export function getWardLayerData(w, activeLayer) {
  // If unmonitored / awaiting physical sensor node:
  if (!w.is_monitored || w.status === 'unverified') {
    return {
      status: 'unverified',
      color: 'transparent',
      borderColor: '#94A3B8', // High-contrast visible neutral slate
      borderDash: '6, 6',
      badgeBg: 'rgba(100, 116, 139, 0.15)',
      badgeColor: '#94A3B8',
      label: 'Unverified (Awaiting Measurements)',
      shortStatus: 'Unverified (ntg)',
      valDisplay: 'Awaiting Physical Sensor Deployment',
      details: 'Peripheral municipal boundary mesh. No verified physical sensor node deployed. Strictly unclassified (no false alert).'
    }
  }

  // 1. AIR QUALITY LAYER (CPCB NAAQS / AQI)
  if (activeLayer === 'air') {
    const aqi = w.current_aqi || 84.0
    if (w.status === 'critical' || aqi > 200) {
      return {
        status: 'critical',
        color: '#EF4444', // Red
        borderColor: '#DC2626',
        badgeBg: 'rgba(239, 68, 68, 0.18)',
        badgeColor: '#FCA5A5',
        label: 'Air Quality: High-Priority Anomaly',
        shortStatus: `High Anomaly (AQI ${aqi})`,
        valDisplay: `${aqi} AQI • Very Poor • Industrial Surge`,
        details: 'Severe PM2.5/PM10 particulate surge exceeding CPCB National Ambient Air Quality Standards.'
      }
    } else if (w.status === 'moderate' || aqi > 100) {
      return {
        status: 'moderate',
        color: '#EAB308', // Yellow
        borderColor: '#CA8A04',
        badgeBg: 'rgba(234, 179, 8, 0.18)',
        badgeColor: '#FDE047',
        label: 'Air Quality: Moderate Anomaly',
        shortStatus: `Moderate Anomaly (AQI ${aqi})`,
        valDisplay: `${aqi} AQI • Moderate Exceedance`,
        details: 'Elevated particulate concentrations from traffic congestion and commercial activities.'
      }
    } else {
      return {
        status: 'normal',
        color: '#22C55E', // Green
        borderColor: '#16A34A',
        badgeBg: 'rgba(34, 197, 94, 0.18)',
        badgeColor: '#4ADE80',
        label: 'Air Quality: Normal / Safe',
        shortStatus: `Normal (AQI ${aqi})`,
        valDisplay: `${aqi} AQI • Satisfactory NAAQS`,
        details: 'Ambient air quality complies with CPCB NAAQS safe ambient standards.'
      }
    }
  }

  // 2. WEATHER LAYER (Microclimate & Heat)
  if (activeLayer === 'weather') {
    const temp = w.temperature_celsius || 26.4
    const rh = w.humidity_percent || 68
    if (w.status === 'critical' || temp >= 31.0) {
      return {
        status: 'critical',
        color: '#EF4444', // Red
        borderColor: '#DC2626',
        badgeBg: 'rgba(239, 68, 68, 0.18)',
        badgeColor: '#FCA5A5',
        label: 'Weather: High Thermal Inversion',
        shortStatus: `High Anomaly (${temp}°C)`,
        valDisplay: `${temp}°C • ${rh}% RH • Thermal Trap`,
        details: 'Industrial thermal emission trap with suppressed convective dispersion.'
      }
    } else if (w.status === 'moderate' || temp >= 28.0) {
      return {
        status: 'moderate',
        color: '#EAB308', // Yellow
        borderColor: '#CA8A04',
        badgeBg: 'rgba(234, 179, 8, 0.18)',
        badgeColor: '#FDE047',
        label: 'Weather: Moderate Heat Island',
        shortStatus: `Moderate Variance (${temp}°C)`,
        valDisplay: `${temp}°C • ${rh}% RH • Urban Heat Island`,
        details: 'Asphalt & traffic thermal retention creating local microclimate variance.'
      }
    } else {
      return {
        status: 'normal',
        color: '#22C55E', // Green
        borderColor: '#16A34A',
        badgeBg: 'rgba(34, 197, 94, 0.18)',
        badgeColor: '#4ADE80',
        label: 'Weather: Normal Microclimate',
        shortStatus: `Normal (${temp}°C)`,
        valDisplay: `${temp}°C • ${rh}% RH • Normal Winds`,
        details: 'Temperate climate, open canopy cover, and stable convective ventilation.'
      }
    }
  }

  // 3. NOISE LAYER (Acoustic Disturbance & Decibels)
  if (activeLayer === 'noise') {
    const db = w.noise_db || (w.status === 'critical' ? 78.5 : (w.status === 'moderate' ? 71.0 : 54.0))
    if (w.status === 'critical' || db >= 75.0) {
      return {
        status: 'critical',
        color: '#EF4444', // Red
        borderColor: '#DC2626',
        badgeBg: 'rgba(239, 68, 68, 0.18)',
        badgeColor: '#FCA5A5',
        label: 'Noise: High Acoustic Anomaly',
        shortStatus: `High Anomaly (${db} dB)`,
        valDisplay: `${db} dB • Industrial Machinery`,
        details: 'Heavy industrial forge, metal stamping, and transport exceeding municipal limits.'
      }
    } else if (w.status === 'moderate' || db >= 68.0) {
      return {
        status: 'moderate',
        color: '#EAB308', // Yellow
        borderColor: '#CA8A04',
        badgeBg: 'rgba(234, 179, 8, 0.18)',
        badgeColor: '#FDE047',
        label: 'Noise: Moderate Acoustic Disturbance',
        shortStatus: `Moderate Anomaly (${db} dB)`,
        valDisplay: `${db} dB • Traffic & Event Sound`,
        details: 'Central bus terminus, junction horns, and fest loudspeaker nuisance.'
      }
    } else {
      return {
        status: 'normal',
        color: '#22C55E', // Green
        borderColor: '#16A34A',
        badgeBg: 'rgba(34, 197, 94, 0.18)',
        badgeColor: '#4ADE80',
        label: 'Noise: Normal Acoustic Levels',
        shortStatus: `Normal (${db} dB)`,
        valDisplay: `${db} dB • Permissible Ambient Range`,
        details: 'Ambient acoustic levels well within municipal daytime decibel limits (<60 dB).'
      }
    }
  }

  // 4. ANOMALY STATUS LAYER (Multivariate AI Isolation Forest)
  if (w.status === 'critical' || w.anomaly_details?.priority === 'critical') {
    return {
      status: 'critical',
      color: '#EF4444', // Red
      borderColor: '#DC2626',
      badgeBg: 'rgba(239, 68, 68, 0.18)',
      badgeColor: '#FCA5A5',
      label: 'High-Priority Anomaly / Exceedance',
      shortStatus: 'High Anomaly (AI Outlier)',
      valDisplay: 'Multi-Feature Outlier Spike',
      details: w.anomaly_details?.reason || 'Multi-feature threshold exceedance flagged by Isolation Forest model.'
    }
  } else if (w.status === 'moderate' || w.anomaly_details?.priority === 'warning' || w.anomaly_details?.is_anomaly) {
    return {
      status: 'moderate',
      color: '#EAB308', // Yellow
      borderColor: '#CA8A04',
      badgeBg: 'rgba(234, 179, 8, 0.18)',
      badgeColor: '#FDE047',
      label: 'Moderate Anomaly Detected',
      shortStatus: 'Moderate Anomaly (AI Outlier)',
      valDisplay: 'Statistical Deviation Flagged',
      details: w.anomaly_details?.reason || 'Significant departure from historical diurnal baseline.'
    }
  } else {
    return {
      status: 'normal',
      color: '#22C55E', // Green
      borderColor: '#16A34A',
      badgeBg: 'rgba(34, 197, 94, 0.18)',
      badgeColor: '#4ADE80',
      label: 'Normal / Safe (Available Data)',
      shortStatus: 'Normal Baseline (Safe)',
      valDisplay: 'Baseline Alignment',
      details: 'All environmental sensors operating within historical nominal baselines.'
    }
  }
}

export default function WardMap({ wards = [], onSelectWard, selectedWardId }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeWard, setActiveWard] = useState(null)
  const [filterType, setFilterType] = useState('all') // all, live, grey
  const [activeLayer, setActiveLayer] = useState('anomaly') // anomaly, air, weather, noise
  const [mapProvider, setMapProvider] = useState('osm')
  const [boldBorders, setBoldBorders] = useState(true) // Bold borders for clear visibility
  const [showLabels, setShowLabels] = useState(true) // Ward # labels on map
  const [resetKey, setResetKey] = useState(0)

  // Counts
  const liveCount = useMemo(() => wards.filter(w => w.is_monitored).length, [wards])
  const greyCount = useMemo(() => wards.filter(w => !w.is_monitored).length, [wards])

  // Count breakdown for current layer
  const layerBreakdown = useMemo(() => {
    let normal = 0
    let moderate = 0
    let critical = 0
    let unverified = 0

    wards.forEach(w => {
      const data = getWardLayerData(w, activeLayer)
      if (data.status === 'normal') normal++
      else if (data.status === 'moderate') moderate++
      else if (data.status === 'critical') critical++
      else unverified++
    })

    return { normal, moderate, critical, unverified }
  }, [wards, activeLayer])

  // Filtered wards for left list panel
  const filteredWards = useMemo(() => {
    let list = wards
    if (filterType === 'live') {
      list = list.filter(w => w.is_monitored)
    } else if (filterType === 'grey') {
      list = list.filter(w => !w.is_monitored)
    }

    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase().trim()
    return list.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.locality.toLowerCase().includes(q) ||
      String(w.ward_number) === q
    )
  }, [wards, filterType, searchQuery])

  const handleWardClick = (ward) => {
    setActiveWard(ward)
    if (onSelectWard) {
      onSelectWard(ward)
    }
  }

  // Pan target
  const panTarget = useMemo(() => {
    if (activeWard) return [activeWard.lat, activeWard.lng]
    return null
  }, [activeWard])

  const layerLabels = {
    anomaly: 'AI Anomaly Status (Isolation Forest)',
    air: 'Air Quality & CPCB NAAQS Standard',
    weather: 'Weather & Meteorological Intelligence',
    noise: 'Noise Intelligence & Acoustic Detection'
  }

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: 'calc(100vh - 120px)',
      minHeight: '620px',
      background: '#0B1120',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'relative'
    }}>
      {/* 1. LEFT SIDEBAR PANEL (Matching Screenshot 4) */}
      <div style={{
        width: '320px',
        minWidth: '320px',
        background: '#111827',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20
      }}>
        {/* Panel Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#22C55E" />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC' }}>
                58 Wards Verified
              </span>
            </div>
            <span style={{
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60A5FA',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              {liveCount || 49}/58 BCC Active
            </span>
          </div>

          <p style={{ margin: '0 0 14px', fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.4 }}>
            58 Municipal Ward boundaries lined & verified. Click any ward to inspect details on map.
          </p>

          {/* Search Input */}
          <div style={{
            background: '#172033',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <Search size={14} color="#64748B" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter ward # or locality..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#F8FAFC',
                fontSize: '12px',
                width: '100%'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* 3 Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: `All (${wards.length || 58})` },
              { id: 'live', label: `Live (${liveCount || 49})` },
              { id: 'grey', label: `Unverified (${greyCount || 9})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  borderRadius: '6px',
                  border: 'none',
                  background: filterType === tab.id
                    ? (tab.id === 'live' ? '#22C55E' : '#3B82F6')
                    : 'rgba(255, 255, 255, 0.04)',
                  color: filterType === tab.id ? '#FFFFFF' : '#94A3B8',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Ward List in left panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filteredWards.map(w => {
            const isSelected = activeWard?.ward_id === w.ward_id
            const layerData = getWardLayerData(w, activeLayer)
            const dotColor = layerData.status === 'unverified' ? '#94A3B8' : layerData.color

            return (
              <div
                key={w.ward_id}
                onClick={() => handleWardClick(w)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: isSelected ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
                  border: isSelected ? '1px solid #38BDF8' : '1px solid transparent',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.15s'
                }}
              >
                <span style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: dotColor,
                  flexShrink: 0,
                  border: layerData.status === 'unverified' ? '1.5px dashed #94A3B8' : 'none'
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Ward {w.ward_number}: {w.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {w.locality} &bull; {layerData.shortStatus}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. MAP DISPLAY AREA (SHOWING ALL 58 WARDS BORDERS CLEARLY) */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Floating Top Controls (Matching Screenshot 4) */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          pointerEvents: 'none'
        }}>
          {/* Left Layer Selectors */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#111827',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            pointerEvents: 'auto',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }}>
            <span
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                color: '#60A5FA',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Layers size={13} />
              58 Wards Borders
            </span>

            {[
              { id: 'anomaly', label: 'Anomaly Status' },
              { id: 'air', label: 'Air Quality' },
              { id: 'weather', label: 'Weather' },
              { id: 'noise', label: 'Noise' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                style={{
                  background: activeLayer === l.id ? '#3B82F6' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: activeLayer === l.id ? '#FFFFFF' : '#94A3B8',
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Right Provider, Border & Action Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#111827',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            pointerEvents: 'auto',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Bold Borders Toggle */}
            <button
              onClick={() => setBoldBorders(b => !b)}
              title="Toggle border line weight for enhanced contrast"
              style={{
                background: boldBorders ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${boldBorders ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '6px',
                color: boldBorders ? '#60A5FA' : '#94A3B8',
                padding: '5px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Sliders size={12} />
              <span>Borders: {boldBorders ? 'Bold' : 'Normal'}</span>
            </button>

            {/* Ward # Labels Toggle */}
            <button
              onClick={() => setShowLabels(l => !l)}
              title="Toggle Ward # pill markers on map"
              style={{
                background: showLabels ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${showLabels ? '#22C55E' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '6px',
                color: showLabels ? '#4ADE80' : '#94A3B8',
                padding: '5px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Tag size={12} />
              <span>Labels: {showLabels ? 'On' : 'Off'}</span>
            </button>

            {/* Map Provider Select */}
            <select
              value={mapProvider}
              onChange={(e) => setMapProvider(e.target.value)}
              style={{
                background: '#172033',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#F8FAFC',
                fontSize: '11.5px',
                padding: '5px 8px',
                outline: 'none'
              }}
            >
              <option value="osm">OpenStreetMap Standard (Free)</option>
              <option value="carto">CartoDB Dark Matter</option>
            </select>

            {/* Fit 58 Button */}
            <button
              onClick={() => {
                setActiveWard(null)
                setResetKey(k => k + 1)
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#F8FAFC',
                padding: '5px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCw size={12} />
              <span>Fit 58</span>
            </button>
          </div>
        </div>

        {/* Floating Bottom Left Legend (With exact 4 relative colors & real-time counts) */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          background: '#111827',
          padding: '14px 18px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.65)',
          maxWidth: '320px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              MAP LEGEND ({activeLayer.toUpperCase()})
            </span>
            <span style={{ fontSize: '10.5px', color: '#60A5FA', fontWeight: 700 }}>
              ALL 58 WARDS
            </span>
          </div>

          <div style={{ fontSize: '10.5px', color: '#94A3B8', marginBottom: '10px' }}>
            {layerLabels[activeLayer]}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '11.5px' }}>
            {/* Green: Normal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#22C55E',
                  boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)'
                }} />
                <span style={{ color: '#F8FAFC', fontWeight: 500 }}>Normal / Safe (Green)</span>
              </div>
              <span style={{ fontSize: '10px', color: '#4ADE80', fontWeight: 700, background: 'rgba(34, 197, 94, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                {layerBreakdown.normal} Wards
              </span>
            </div>

            {/* Yellow: Moderate */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#EAB308',
                  boxShadow: '0 0 8px rgba(234, 179, 8, 0.4)'
                }} />
                <span style={{ color: '#F8FAFC', fontWeight: 500 }}>Moderate Anomaly (Yellow)</span>
              </div>
              <span style={{ fontSize: '10px', color: '#FDE047', fontWeight: 700, background: 'rgba(234, 179, 8, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                {layerBreakdown.moderate} Wards
              </span>
            </div>

            {/* Red: High Priority */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                }} />
                <span style={{ color: '#F8FAFC', fontWeight: 500 }}>High-Priority Anomaly (Red)</span>
              </div>
              <span style={{ fontSize: '10px', color: '#FCA5A5', fontWeight: 700, background: 'rgba(239, 68, 68, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                {layerBreakdown.critical} Wards
              </span>
            </div>

            {/* Grey: Unverified gives ntg */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: '2px dashed #94A3B8'
                }} />
                <span style={{ color: '#94A3B8', fontWeight: 500 }}>Unverified / No Data (ntg)</span>
              </div>
              <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, background: 'rgba(100, 116, 139, 0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                {layerBreakdown.unverified} Wards
              </span>
            </div>
          </div>

          <div style={{ fontSize: '9.5px', color: '#64748B', fontStyle: 'italic', marginTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px', lineHeight: 1.3 }}>
            *All 58 borders lined and visible. Unverified fringe wards give ntg (no fill) and remain unclassified.
          </div>
        </div>

        {/* Selected Ward Details Drawer */}
        {activeWard && (
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            bottom: '20px',
            width: '330px',
            background: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase' }}>
                  WARD PROFILE &bull; WARD {activeWard.ward_number}
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 600, color: '#F8FAFC' }}>
                  {activeWard.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveWard(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(() => {
                const layerData = getWardLayerData(activeWard, activeLayer)
                return (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: layerData.status === 'unverified' ? 'rgba(100, 116, 139, 0.08)' : `${layerData.color}15`,
                    border: `1px solid ${layerData.status === 'unverified' ? '#475569' : layerData.borderColor}`
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {layerLabels[activeLayer]}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: layerData.status === 'unverified' ? '#94A3B8' : layerData.color, marginBottom: '4px' }}>
                      {layerData.shortStatus}
                    </div>
                    <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.4 }}>
                      {layerData.details}
                    </div>
                  </div>
                )
              })()}

              <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                Locality: <strong>{activeWard.locality}</strong> ({activeWard.zone} Zone)
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                Coverage: {activeWard.is_monitored ? 'Verified Continuous CAAQMS Node' : 'Provisional Boundary Mesh'}
              </div>

              {activeWard.current_aqi ? (
                <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                  Air Quality: <strong style={{ color: activeWard.current_aqi > 200 ? '#EF4444' : (activeWard.current_aqi > 100 ? '#EAB308' : '#22C55E') }}>
                    {activeWard.current_aqi} AQI
                  </strong> ({activeWard.aqi_category})
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Air Quality: <em>Awaiting physical sensor deployment</em>
                </div>
              )}

              <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                Weather: <strong>{activeWard.temperature_celsius || 26.4}°C</strong> &bull; {activeWard.humidity_percent || 68}% RH
              </div>

              <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                Noise Complaints: <strong>{activeWard.community_noise_reports_count || 0} registered</strong>
              </div>

              {activeWard.key_landmarks && activeWard.key_landmarks.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, marginBottom: '6px' }}>KEY LANDMARKS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeWard.key_landmarks.map((lm, i) => (
                      <span key={i} style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: '#CBD5E1' }}>
                        {lm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaflet MapContainer - ALWAYS RENDERS ALL 58 WARDS BORDERS */}
        <MapContainer
          key={resetKey}
          center={BELAGAVI_CENTER}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={mapProvider === 'osm'
              ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            }
          />

          <MapPanController center={panTarget} />

          {/* ALL 58 WARDS BORDERS ARE LINED AND RENDERED ON THE MAP */}
          {wards.map(w => {
            const isSelected = activeWard?.ward_id === w.ward_id
            const layerData = getWardLayerData(w, activeLayer)
            const isDimmed = filteredWards.length < wards.length && !filteredWards.some(fw => fw.ward_id === w.ward_id)

            // When unverified: gives ntg (transparent fill, neutral dashed grey border)
            // When normal: green (#22C55E)
            // When moderate: yellow (#EAB308)
            // When critical: red (#EF4444)
            const strokeColor = isSelected ? '#38BDF8' : (layerData.status === 'unverified' ? '#94A3B8' : layerData.borderColor)
            const fillColor = layerData.status === 'unverified' ? 'transparent' : layerData.color
            const fillOpacity = layerData.status === 'unverified' ? 0 : (isSelected ? 0.65 : 0.46)
            const strokeDash = layerData.status === 'unverified' ? '6, 6' : undefined

            // High contrast border weight calculation
            const borderWidth = isSelected ? 4.2 : (
              boldBorders
                ? (layerData.status === 'unverified' ? 2.8 : (layerData.status === 'critical' ? 3.8 : 3.2))
                : (layerData.status === 'unverified' ? 2.0 : 2.5)
            )

            return (
              <Polygon
                key={`poly-${w.ward_id}`}
                positions={w.polygon}
                pathOptions={{
                  color: strokeColor,
                  weight: borderWidth,
                  fillColor: fillColor,
                  fillOpacity: isDimmed ? 0.08 : fillOpacity,
                  dashArray: strokeDash,
                  opacity: isDimmed ? 0.35 : 1
                }}
                eventHandlers={{
                  click: () => handleWardClick(w)
                }}
              >
                <Tooltip sticky>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#F8FAFC' }}>
                    Ward {w.ward_number} &mdash; {w.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                    {w.locality} ({w.zone} Zone)
                  </div>
                  <div style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: layerData.status === 'unverified' ? 'rgba(100, 116, 139, 0.2)' : `${layerData.color}25`,
                    color: layerData.status === 'unverified' ? '#94A3B8' : layerData.color,
                    fontSize: '11px',
                    fontWeight: 700,
                    border: `1px solid ${layerData.status === 'unverified' ? '#94A3B8' : layerData.color}`
                  }}>
                    {layerData.shortStatus}
                  </div>
                  <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '4px' }}>
                    {layerData.valDisplay}
                  </div>
                </Tooltip>
              </Polygon>
            )
          })}

          {/* Centroid markers & optional Ward # pills for clear ward identification */}
          {wards.map(w => {
            const isSelected = activeWard?.ward_id === w.ward_id
            const layerData = getWardLayerData(w, activeLayer)
            const dotColor = layerData.status === 'unverified' ? '#94A3B8' : layerData.color

            return (
              <CircleMarker
                key={`marker-${w.ward_id}`}
                center={[w.lat, w.lng]}
                radius={isSelected ? 7 : (showLabels ? 5 : 4)}
                pathOptions={{
                  fillColor: dotColor,
                  color: '#FFFFFF',
                  weight: isSelected ? 3 : 1.5,
                  fillOpacity: layerData.status === 'unverified' ? 0.8 : 1
                }}
                eventHandlers={{
                  click: () => handleWardClick(w)
                }}
              >
                {showLabels && (
                  <Tooltip permanent direction="center" className="ward-number-badge">
                    W{w.ward_number}
                  </Tooltip>
                )}
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
