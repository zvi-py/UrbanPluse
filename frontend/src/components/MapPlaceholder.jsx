import React from 'react'

// Belagavi coordinates
const BELAGAVI_LAT = 15.8497
const BELAGAVI_LNG = 74.4977

/**
 * MapPlaceholder — Leaflet map centered on Belagavi.
 *
 * TODO (Frontend Developer):
 *   - Replace this placeholder with a real MapContainer + TileLayer
 *   - Add Markers for event locations from the Events Agent
 *   - Add a heatmap layer for traffic congestion
 *   - Add colored circles for AQI at different locations
 *
 * Example implementation:
 *   import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
 *   <MapContainer center={[BELAGAVI_LAT, BELAGAVI_LNG]} zoom={13} style={{height: '400px'}}>
 *     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
 *   </MapContainer>
 */
export default function MapPlaceholder() {
  return (
    <div style={{
      width: '100%',
      height: '300px',
      background: '#e8f4f8',
      border: '2px dashed #4a90d9',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
    }}>
      <div style={{ fontSize: '48px' }}>🗺️</div>
      <h3 style={{ margin: '8px 0 4px' }}>Leaflet Map Placeholder</h3>
      <p style={{ margin: 0, color: '#666' }}>
        Centered on Belagavi ({BELAGAVI_LAT}°N, {BELAGAVI_LNG}°E)
      </p>
      <p style={{ margin: '4px 0 0', color: '#888', fontSize: '12px' }}>
        Replace with &lt;MapContainer&gt; from react-leaflet — see MapPlaceholder.jsx for instructions
      </p>
    </div>
  )
}
