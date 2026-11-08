# UrbanPulse API Reference

Base URL: `http://localhost:8000`

## System Endpoints

### GET /health
Health check.

**Response:**
```json
{"status": "ok"}
```

### GET /overview
Returns all four agents' data in one call with cross-agent analysis.

**Response:** `AgentResponse` with `data` containing keys `traffic`, `events`, `student`, `environment`.

---

## Traffic Agent

### GET /traffic/status
Current traffic congestion status.

**Response `data` fields:**
| Field | Type | Description |
|-------|------|-------------|
| congestion_level | string | low / moderate / high |
| congestion_score | float | 0.0–1.0 |
| location_name | string | Human-readable location |
| alternate_routes | array | List of route objects |
| high_congestion | bool | True if score > 0.75 |

---

## Events Agent

### GET /events/nearby
Nearby events ranked by relevance.

**Response `data` fields:**
| Field | Type | Description |
|-------|------|-------------|
| events | array | List of event objects |
| events[].title | string | Event name |
| events[].category | string | college_fest / cultural / academic / sports |
| events[].date | string | ISO date |
| events[].lat, lng | float | Location |
| events[].score | float | Relevance score 0.0–1.0 |
| events[].high_attendance | bool | Expected crowd > 2000 |

---

## Student Agent

### GET /student/matches
Students with similar interests.

**Response `data` fields:**
| Field | Type | Description |
|-------|------|-------------|
| matches | array | List of matched students |
| matches[].name | string | Student name |
| matches[].shared_interests | array | Common interest tags |
| matches[].similarity | float | Cosine similarity 0.0–1.0 |
| matches[].department | string | Academic department |
| recommended_groups | array | Suggested clubs/groups |

---

## Environment Agent

### GET /environment/status
Current environmental conditions.

**Response `data` fields:**
| Field | Type | Description |
|-------|------|-------------|
| aqi | int | Air Quality Index |
| aqi_category | string | good / moderate / unhealthy |
| temperature_celsius | float | Temperature in °C |
| humidity_percent | float | Relative humidity % |
| noise_db | float | Noise level in dB |
| anomaly_detected | bool | Isolation Forest anomaly flag |
| anomaly_score | float | Negative = anomaly |
| dominant_pollutant | string | Main pollutant |
| weather_condition | string | Current weather |

---

## Common Response Schema

All agent endpoints return:

```json
{
  "agent": "traffic",
  "status": "ok",
  "timestamp": "2024-01-15T08:00:00+00:00",
  "location": {"lat": 15.8497, "lng": 74.4977},
  "data": {},
  "alerts": [{"level": "info", "message": "..."}],
  "source": "stub"
}
```
