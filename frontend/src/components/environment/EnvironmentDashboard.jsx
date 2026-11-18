import React, { useState, useEffect, useCallback } from 'react'
import {
  LayoutDashboard,
  MapPin,
  Wind,
  SunMedium,
  Volume2,
  Cpu,
  AlertTriangle,
  TrendingUp,
  FileText,
  Globe,
  Menu,
  X,
  PlusCircle,
  RotateCw,
  Bell,
  Activity,
  Layers,
  ArrowLeft
} from 'lucide-react'

import CityOverview from './CityOverview.jsx'
import WardMap from './WardMap.jsx'
import AirQualityView from './AirQualityView.jsx'
import WeatherView from './WeatherView.jsx'
import NoiseReportsView from './NoiseReportsView.jsx'
import NoiseReportModal from './NoiseReportModal.jsx'
import AnomalyView from './AnomalyView.jsx'
import AlertCenter from './AlertCenter.jsx'
import HistoricalView from './HistoricalView.jsx'
import ReportsView from './ReportsView.jsx'
import ApiSourcesView from './ApiSourcesView.jsx'
import { BELAGAVI_58_WARDS } from '../../data/belagavi58Wards.js'

import '../../environment.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const DEFAULT_OVERVIEW_DATA = {
  city_summary: {
    total_wards: 58,
    monitored_wards: 49,
    unverified_wards: 9,
    status_matrix: { normal: 32, moderate: 11, critical: 6, unverified: 9 },
    city_composite_aqi: 84.0,
    city_temperature_celsius: 26.4,
    city_humidity_percent: 68,
    active_anomalies_count: 2,
    last_sync: 'Real-time live'
  },
  status: {
    aqi: 84.0,
    aqi_category: 'Moderate',
    temperature_celsius: 26.4,
    humidity_percent: 68,
    wind_speed_kmh: 3.2,
    active_anomalies: 2
  },
  active_alerts: [
    {
      id: 'alert-1',
      title: 'Industrial Particulate Exceedance',
      ward_name: 'Ward 26 — Udyambag Industrial',
      category: 'ai_anomaly',
      priority: 'critical',
      message: 'Particulate PM2.5 surge and acoustic metal forging exceeding municipal threshold.'
    },
    {
      id: 'alert-2',
      title: 'Traffic & Fest Acoustic Load',
      ward_name: 'Ward 13 — CBT / Bogarves',
      category: 'ai_anomaly',
      priority: 'warning',
      message: 'Elevated decibel levels and traffic congestion along College Road corridor.'
    }
  ],
  trends_24h: [
    { time: '00:00', aqi: 62, pm25: 28 },
    { time: '03:00', aqi: 58, pm25: 26 },
    { time: '06:00', aqi: 74, pm25: 42 },
    { time: '09:00', aqi: 95, pm25: 58 },
    { time: '12:00', aqi: 86, pm25: 48 },
    { time: '15:00', aqi: 82, pm25: 44 },
    { time: '18:00', aqi: 94, pm25: 56 },
    { time: '21:00', aqi: 78, pm25: 38 }
  ]
}

const NAV_ITEMS = [
  { id: 'overview', label: 'City Overview', icon: LayoutDashboard },
  { id: 'map', label: 'Belagavi 58 Wards Map', icon: MapPin, badge: '58' },
  { id: 'air', label: 'Air Quality & NAAQS', icon: Wind },
  { id: 'weather', label: 'Weather Intelligence', icon: SunMedium },
  { id: 'noise', label: 'Noise Community Reports', icon: Volume2 },
  { id: 'anomalies', label: 'AI Anomaly Detection', icon: Cpu },
  { id: 'alerts', label: 'Environmental Alerts', icon: AlertTriangle },
  { id: 'trends', label: 'Historical Trends', icon: TrendingUp },
  { id: 'reports', label: 'Executive Reports', icon: FileText },
  { id: 'sources', label: 'External APIs & Sources', icon: Globe, badge: '5' }
]

export default function EnvironmentDashboard({ onBackToOrchestrator }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [noiseModalOpen, setNoiseModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userPersona, setUserPersona] = useState('Citizen')
  const [searchQuery, setSearchQuery] = useState('')

  // Telemetry states
  const [overviewData, setOverviewData] = useState(DEFAULT_OVERVIEW_DATA)
  const [wards, setWards] = useState(BELAGAVI_58_WARDS)
  const [aqData, setAqData] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [noiseData, setNoiseData] = useState(null)
  const [anomalyData, setAnomalyData] = useState(null)
  const [sourcesData, setSourcesData] = useState(null)
  const [selectedWard, setSelectedWard] = useState(null)

  // Responsive listener
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true)
        setSidebarOpen(false)
      } else {
        setIsMobile(false)
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Telemetry fetcher
  const fetchAllTelemetry = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Overview
      const overRes = await fetch(`${API_BASE}/environment/overview`)
      if (overRes.ok) {
        const j = await overRes.json()
        setOverviewData(j.data)
      }

      // 2. Wards
      const wardsRes = await fetch(`${API_BASE}/environment/wards`)
      if (wardsRes.ok) {
        const j = await wardsRes.json()
        if (j.data?.wards && j.data.wards.length > 0) {
          setWards(j.data.wards)
        }
      }

      // 3. Air Quality
      const aqRes = await fetch(`${API_BASE}/environment/air-quality`)
      if (aqRes.ok) {
        const j = await aqRes.json()
        setAqData(j.data)
      }

      // 4. Weather
      const weatherRes = await fetch(`${API_BASE}/environment/weather`)
      if (weatherRes.ok) {
        const j = await weatherRes.json()
        setWeatherData(j.data)
      }

      // 5. Noise
      const noiseRes = await fetch(`${API_BASE}/environment/noise`)
      if (noiseRes.ok) {
        const j = await noiseRes.json()
        setNoiseData(j.data)
      }

      // 6. Anomalies
      const anomRes = await fetch(`${API_BASE}/environment/anomalies`)
      if (anomRes.ok) {
        const j = await anomRes.json()
        setAnomalyData(j.data)
      }

      // 7. Sources
      const srcRes = await fetch(`${API_BASE}/environment/sources`)
      if (srcRes.ok) {
        const j = await srcRes.json()
        setSourcesData(j.data)
      }
    } catch (err) {
      console.warn('Backend environment telemetry poll fallback active:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllTelemetry()
  }, [fetchAllTelemetry])

  return (
    <div className="env-platform" style={{ display: 'flex', minHeight: '100vh', background: '#0B1120', color: '#F8FAFC' }}>
      {/* SIDEBAR */}
      <aside style={{
        width: sidebarOpen ? '260px' : '0px',
        minWidth: sidebarOpen ? '260px' : '0px',
        background: '#111827',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        zIndex: 100,
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        bottom: 0,
        height: '100vh'
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Activity size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
                UrbanPulse
              </div>
              <div style={{ fontSize: '10.5px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Environment Intel
              </div>
            </div>
          </div>

          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items (Exact 10 from Screenshot 1) */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  if (isMobile) setSidebarOpen(false)
                }}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="badge-count">{item.badge}</span>}
              </div>
            )
          })}
        </nav>

        {/* Footer info & Return to Orchestrator button */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(0,0,0,0.1)' }}>
          {onBackToOrchestrator && (
            <button
              onClick={onBackToOrchestrator}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#94A3B8',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              <ArrowLeft size={14} />
              <span>Multi-Agent Overview</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748B' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
            <span>Belagavi Municipal Basin</span>
          </div>
          <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>
            58 Municipal Wards &bull; v2.4 Live
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Sticky Header */}
        <header style={{
          height: '60px',
          background: '#111827',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title="Toggle Navigation Menu"
            >
              <Menu size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </span>
              <span style={{ fontSize: '12px', color: '#64748B' }}>&bull;</span>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Belagavi City, Karnataka</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Weather mini pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              color: '#CBD5E1'
            }}>
              <SunMedium size={14} color="#F59E0B" />
              <span>{overviewData?.status?.temperature_celsius || '26.4'}°C</span>
              <span style={{ color: '#64748B' }}>&bull;</span>
              <span style={{ color: '#60A5FA' }}>{overviewData?.status?.aqi || '72'} AQI</span>
            </div>

            {/* Noise Log Button */}
            <button
              onClick={() => setNoiseModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#3B82F6',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={14} />
              <span>Log Noise</span>
            </button>
          </div>
        </header>

        {/* View Container */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <CityOverview
              overviewData={overviewData}
              wards={wards}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNoiseModal={() => setNoiseModalOpen(true)}
              onRefresh={fetchAllTelemetry}
              loading={loading}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              userPersona={userPersona}
              setUserPersona={setUserPersona}
              onSelectWard={(w) => {
                setSelectedWard(w)
                setActiveTab('map')
              }}
            />
          )}

          {activeTab === 'map' && (
            <WardMap
              wards={wards}
              selectedWardId={selectedWard?.ward_id}
              onSelectWard={(w) => setSelectedWard(w)}
            />
          )}

          {activeTab === 'air' && <AirQualityView aqData={aqData} />}

          {activeTab === 'weather' && (
            <WeatherView
              weatherData={weatherData}
              onOpenNoiseModal={() => setNoiseModalOpen(true)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              userPersona={userPersona}
              setUserPersona={setUserPersona}
              onRefresh={fetchAllTelemetry}
            />
          )}

          {activeTab === 'noise' && (
            <NoiseReportsView
              noiseData={noiseData}
              wards={wards}
              onOpenNoiseModal={() => setNoiseModalOpen(true)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              userPersona={userPersona}
              setUserPersona={setUserPersona}
              onRefresh={fetchAllTelemetry}
            />
          )}

          {activeTab === 'anomalies' && (
            <AnomalyView
              anomalyData={anomalyData}
              onRefresh={fetchAllTelemetry}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertCenter
              alerts={overviewData?.active_alerts || []}
              wards={wards}
            />
          )}

          {activeTab === 'trends' && (
            <HistoricalView
              wards={wards}
              onOpenNoiseModal={() => setNoiseModalOpen(true)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              userPersona={userPersona}
              setUserPersona={setUserPersona}
              onRefresh={fetchAllTelemetry}
            />
          )}

          {activeTab === 'reports' && <ReportsView wards={wards} />}

          {activeTab === 'sources' && <ApiSourcesView sourcesData={sourcesData} />}
        </main>
      </div>

      {/* Community Noise Report Modal */}
      <NoiseReportModal
        isOpen={noiseModalOpen}
        onClose={() => setNoiseModalOpen(false)}
        wards={wards}
        onReportSubmitted={fetchAllTelemetry}
      />
    </div>
  )
}
