/**
 * mockData.js
 * High-fidelity fallback data in the exact UrbanPulse schema shape.
 * Used only when the backend is unreachable, with a clear MOCK indicator.
 */

export const MOCK_OVERVIEW_DATA = {
  agent: "traffic",
  status: "ok",
  timestamp: new Date().toISOString(),
  location: { lat: 15.8497, lng: 74.4977 },
  source: "mock",
  alerts: [
    {
      level: "warning",
      message: "High-attendance event detected: KLE Tech Fest 2026. Expect increased traffic on College Road and elevated ambient noise."
    },
    {
      level: "info",
      message: "Air quality baseline nominal across Belagavi urban perimeter (AQI 72)."
    }
  ],
  data: {
    traffic: {
      congestion_level: "moderate",
      congestion_score: 0.62,
      location_name: "Belagavi City Center",
      alternate_routes: [
        {
          route_id: "R1",
          description: "Via NH48 bypass — estimated +8 min",
          distance_km: 5.2
        },
        {
          route_id: "R2",
          description: "Via Hindwadi arterial — estimated +12 min",
          distance_km: 4.1
        }
      ],
      high_congestion: false
    },
    events: {
      events: [
        {
          event_id: "E001",
          title: "KLE Tech Fest 2026",
          category: "college_fest",
          venue: "KLE Technological University Campus",
          organizer: "KLE Technological University",
          lat: 15.8530,
          lng: 74.5010,
          start_datetime: "2026-11-15T09:00:00+00:00",
          end_datetime: "2026-11-17T18:00:00+00:00",
          distance_km: 0.584,
          expected_attendance: 6000,
          is_free: false,
          high_attendance: true,
          score: 0.8142,
          score_breakdown: {
            similarity: 0.8821,
            proximity: 0.8832,
            time: 0.6944
          }
        },
        {
          event_id: "E003",
          title: "Inter-College 24-Hour Hackathon",
          category: "hackathon",
          venue: "SDMCET Seminar Hall",
          organizer: "SDMCET CS Dept",
          lat: 15.8545,
          lng: 74.5020,
          start_datetime: "2026-11-18T10:00:00+00:00",
          end_datetime: "2026-11-19T10:00:00+00:00",
          distance_km: 0.712,
          expected_attendance: 350,
          is_free: false,
          high_attendance: false,
          score: 0.7410,
          score_breakdown: {
            similarity: 0.812,
            proximity: 0.857,
            time: 0.521
          }
        },
        {
          event_id: "E002",
          title: "Belagavi Food & Culture Festival",
          category: "cultural",
          venue: "Nehru Nagar Ground",
          organizer: "Belagavi Municipal Corporation",
          lat: 15.8497,
          lng: 74.4977,
          start_datetime: "2026-11-20T10:00:00+00:00",
          end_datetime: "2026-11-22T21:00:00+00:00",
          distance_km: 0.05,
          expected_attendance: 3500,
          is_free: true,
          high_attendance: true,
          score: 0.6890,
          score_breakdown: {
            similarity: 0.650,
            proximity: 0.990,
            time: 0.450
          }
        },
        {
          event_id: "E005",
          title: "AI & Machine Learning Workshop",
          category: "workshop",
          venue: "Gogte Institute of Technology",
          organizer: "GIT AI Research Club",
          lat: 15.8710,
          lng: 74.5100,
          start_datetime: "2026-11-14T09:00:00+00:00",
          end_datetime: "2026-11-15T17:00:00+00:00",
          distance_km: 2.74,
          expected_attendance: 80,
          is_free: false,
          high_attendance: false,
          score: 0.6650,
          score_breakdown: {
            similarity: 0.740,
            proximity: 0.620,
            time: 0.630
          }
        }
      ],
      count: 4,
      total_found: 4,
      fallback_reason: ""
    },
    student: {
      query_student: "current_user",
      matches: [
        {
          name: "Priya Kulkarni",
          shared_interests: ["machine learning", "robotics", "hackathons"],
          similarity: 0.91,
          department: "AI & DS",
          year: 3
        },
        {
          name: "Rahul Desai",
          shared_interests: ["data science", "open source", "competitive coding"],
          similarity: 0.84,
          department: "CSE",
          year: 3
        },
        {
          name: "Anjali Patil",
          shared_interests: ["IoT", "embedded systems", "hackathons"],
          similarity: 0.79,
          department: "ECE",
          year: 2
        }
      ],
      recommended_groups: [
        { name: "ML & AI Club", members: 42 },
        { name: "Open Source Cell", members: 28 },
        { name: "Robotics Guild", members: 35 }
      ]
    },
    environment: {
      aqi: 72,
      aqi_category: "moderate",
      temperature_celsius: 28.5,
      humidity_percent: 65,
      noise_db: 58.3,
      wind_speed_kmh: 12.0,
      anomaly_detected: false,
      anomaly_score: -0.12,
      dominant_pollutant: "PM2.5",
      weather_condition: "partly_cloudy"
    }
  }
}

