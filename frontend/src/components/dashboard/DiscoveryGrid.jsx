import React from 'react'
import {
  Users,
  Compass,
  Share2,
  Users2,
  CalendarPlus,
  MapPin,
  BookOpen,
  Activity,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react'

export default function DiscoveryGrid({ onOpenHostModal, onSelectTab, studentCount = 118, eventsCount = 31 }) {
  const peerTags = [
    '#BelagaviTech',
    '#SmartMobility',
    '#KLETech',
    '#VTUGuild',
    '#GITStudents',
    '#MachineLearning',
    '#CleanAirBasin',
    '#Hackathon2026',
    '#UrbanAnomalies',
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 6 Core Action Tiles Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Tile 1: Discover Students */}
        <div
          className="video-action-tile"
          onClick={() => onSelectTab('student')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} />
              </div>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', fontWeight: 600 }}>
                AI Match
              </span>
            </div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 6px 0' }}>
              Discover Students
            </h4>
            <p style={{ fontSize: '11.5px', color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>
              Connect with {studentCount} peers across Belagavi engineering colleges.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
            {/* Avatar Stack */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['#8B5CF6', '#06B6D4', '#10B981'].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: '1.5px solid #161F30',
                    marginLeft: i > 0 ? '-6px' : '0',
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '11px', color: '#818CF8', fontWeight: 600 }}>Explore &gt;</span>
          </div>
        </div>

        {/* Tile 2: Find Friends with Similar Interests */}
        <div
          className="video-action-tile"
          onClick={() => onSelectTab('student')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={18} />
              </div>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', fontWeight: 600 }}>
                Vector Match
              </span>
            </div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 6px 0' }}>
              Find Friends with Similar Interests
            </h4>
            <p style={{ fontSize: '11.5px', color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>
              Match on algorithms, robotics, and civic intelligence tracks.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '14px' }}>
            <span style={{ fontSize: '11px', color: '#A78BFA', fontWeight: 600 }}>Match Now &gt;</span>
          </div>
        </div>

        {/* Tile 3: Network Graph / Collegiate Guilds */}
        <div
          className="video-action-tile"
          onClick={() => onSelectTab('agents_core')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22D3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Share2 size={18} />
              </div>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22D3EE', fontWeight: 600 }}>
                Graph Live
              </span>
            </div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 6px 0' }}>
              Campus Network Graph
            </h4>
            <p style={{ fontSize: '11.5px', color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>
              Inter-collegiate links across VTU, KLE Tech, SGBIT & GIT.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '14px' }}>
            <span style={{ fontSize: '11px', color: '#22D3EE', fontWeight: 600 }}>View Topology &gt;</span>
          </div>
        </div>

        {/* Tile 4: Create and Host Events (Key Video Drawer Trigger!) */}
        <div
          className="video-action-tile"
          onClick={onOpenHostModal}
          style={{
            borderColor: 'rgba(16, 185, 129, 0.4)',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarPlus size={18} />
              </div>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '8px', backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 700 }}>
                + Action
              </span>
            </div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 6px 0' }}>
              Create and Host Events
            </h4>
            <p style={{ fontSize: '11.5px', color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>
              Submit campus fests or technical workshops directly into Belagavi registry.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '14px' }}>
            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>Open Drawer &gt;</span>
          </div>
        </div>

        {/* Tile 5: Discover Nearby Activities */}
        <div
          className="video-action-tile"
          onClick={() => onSelectTab('events')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} />
              </div>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontWeight: 600 }}>
                15 km Radius
              </span>
            </div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 6px 0' }}>
              Discover Nearby Activities
            </h4>
            <p style={{ fontSize: '11.5px', color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>
              {eventsCount} gatherings verified within Belagavi bounding box.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '14px' }}>
            <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 600 }}>Browse Events &gt;</span>
          </div>
        </div>

        {/* Tile 6: Join Study Groups */}
        <div
          className="video-action-tile"
          onClick={() => onSelectTab('student')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#F472B6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={18} />
              </div>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#F472B6', fontWeight: 600 }}>
                Guilds
              </span>
            </div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F9FAFB', margin: '0 0 6px 0' }}>
              Join Study Groups
            </h4>
            <p style={{ fontSize: '11.5px', color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>
              Collaborative coding squads and GATE study circles in Tilakwadi & Camp.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '14px' }}>
            <span style={{ fontSize: '11px', color: '#F472B6', fontWeight: 600 }}>Join Circles &gt;</span>
          </div>
        </div>
      </div>

      {/* Peer Tags Cloud matching Video Frame 5 & 6 */}
      <div
        className="video-glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          padding: '14px 18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#06B6D4', fontSize: '12px', fontWeight: 700 }}>
          <Tag size={14} />
          <span>PEER TAGS:</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {peerTags.map((tag) => (
            <span key={tag} className="video-peer-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
