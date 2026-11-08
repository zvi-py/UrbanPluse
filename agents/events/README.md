# Event Agent — UrbanPulse

**Owner**: Developer 2 (`agents/events/`)  
**Endpoints prefix**: `/events`  
**Status**: ✅ CSV-based TF-IDF recommender implemented | 🔲 Live event APIs not yet integrated

---

## What This Agent Does

The Event Agent finds events happening near a given location in Belagavi, Karnataka and ranks them based on:
- How closely they match the user's interests (TF-IDF cosine similarity)
- How near they are to the user (proximity)
- How soon they start (time urgency)

It also flags high-attendance events (≥ 1000 expected attendees) and raises cross-agent alerts so the Traffic and Environment agents can warn about congestion and noise.

---

## Algorithm

### 1. Data Loading
Events are loaded from `agents/events/data/events.csv` using pandas. The CSV is validated for required columns; rows with invalid lat/lng or missing datetimes are dropped with a warning.

### 2. Filtering
Before ranking, events are filtered by:
- **Radius**: only events within `radius_km` of the observer's location (Haversine distance)
- **Time window**: only upcoming events (not yet ended, within `days` look-ahead)
- **Category** (optional)
- **Free-only** (optional)

### 3. TF-IDF Recommendation (scikit-learn)
Each event's text corpus is built by concatenating:
```
title + description + category + tags
```
A `TfidfVectorizer` (English stop words, unigrams + bigrams, `sublinear_tf=True`) is fitted on this corpus. The user's interest string is transformed with the same vectorizer, and **cosine similarity** is computed between the user vector and each event vector.

The vectorizer is **cached at module level** and only rebuilt when the CSV changes (MD5 checksum comparison).

### 4. Ranking Formula

```
score = 0.60 × similarity
      + 0.25 × proximity_score
      + 0.15 × time_score
```

| Component | Formula | Range |
|-----------|---------|-------|
| `similarity` | cosine_similarity(user_tfidf, event_tfidf) | [0, 1] |
| `proximity_score` | `1 - (distance_km / radius_km)` clipped to [0, 1] | [0, 1] |
| `time_score` | `1 - (hours_until_start / 720)` clipped to [0, 1] | [0, 1] |

**Weights** are defined as named constants at the top of `agent.py`:
```python
W_SIM  = 0.60   # Interest match dominates
W_PROX = 0.25   # Proximity is second priority
W_TIME = 0.15   # Sooner events get a small boost
```

### 5. Edge Cases
| Situation | Behaviour |
|-----------|-----------|
| Empty interests | `similarity = 0` for all events; ranked by proximity + time. `fallback_reason` field explains this. |
| No events in radius | Returns `count: 0, events: []` with an info alert. No crash. |
| Invalid lat/lng | Returns `status: "error"` with a clear message. |
| CSV changes on disk | TF-IDF cache is rebuilt automatically on next request. |

---

## Data

### `agents/events/data/events.csv`
50 events around Belagavi with realistic coordinates (spread within ~15 km), dates in November 2025, and mix of categories.

| Column | Type | Description |
|--------|------|-------------|
| event_id | string | Unique ID (E001–E050) |
| title | string | Event name |
| description | string | 1–3 sentence keyword-rich description |
| category | string | college_fest / hackathon / music / sports / cultural / workshop / professional / volunteering / food / wellness / community |
| tags | string | Semicolon-separated keywords |
| venue | string | Venue name and area |
| lat, lng | float | WGS84 coordinates |
| start_datetime | ISO 8601 | Event start (UTC) |
| end_datetime | ISO 8601 | Event end (UTC) |
| expected_attendance | int | Estimated headcount |
| is_free | bool | True if free entry |
| organizer | string | Organising body |

**Large events (expected_attendance ≥ 1000)** — these trigger cross-agent alerts:
- E001: KLE Tech Fest 2025 (6000)
- E002: Belagavi Food & Culture Festival (3500)
- E006: Belagavi Half Marathon (1200)
- E014: Belagavi Rock & Indie Music Festival (2500)
- E027: Belagavi Kite Festival (1500)
- E035: Belagavi Flower Show (2000)
- E047: Folk Dance & Music Night (1800)

### `agents/events/data/sample_users.csv`
8 sample user interest profiles for `/events/recommend?user_id=...`

| user_id | Description |
|---------|-------------|
| U001 | ML / AI / hackathon enthusiast |
| U002 | Classical music lover |
| U003 | Web dev / startup networking |
| U004 | Environment / volunteering |
| U005 | Sports / outdoor activities |
| U006 | Data science / fintech |
| U007 | Robotics / IoT / hardware |
| U008 | Photography / art / theatre |

---

## API Endpoints

### `GET /events/nearby`
Find and rank events near a location.

**Query params:**
| Param | Default | Description |
|-------|---------|-------------|
| lat | 15.8497 | Observer latitude |
| lng | 74.4977 | Observer longitude |
| radius_km | 5.0 | Search radius (max 100) |
| interests | "" | Free-text interests |
| category | null | Filter category |
| free_only | false | Only free events |
| days | 14 | Look-ahead days (max 30) |
| limit | 10 | Max results (max 50) |

**Example:**
```bash
curl "http://localhost:8000/events/nearby?lat=15.8497&lng=74.4977&radius_km=10&interests=hackathon+AI&limit=5"
```

**Example response `data`:**
```json
{
  "events": [
    {
      "event_id": "E001",
      "title": "KLE Tech Fest 2025",
      "category": "college_fest",
      "venue": "KLE Technological University Campus",
      "lat": 15.853,
      "lng": 74.501,
      "start_datetime": "2025-11-15T09:00:00+00:00",
      "end_datetime": "2025-11-17T18:00:00+00:00",
      "distance_km": 0.584,
      "expected_attendance": 6000,
      "is_free": false,
      "high_attendance": true,
      "score": 0.8142,
      "score_breakdown": {
        "similarity": 0.8821,
        "proximity": 0.8832,
        "time": 0.6944
      }
    }
  ],
  "count": 1,
  "total_found": 1,
  "fallback_reason": "",
  "query": { "lat": 15.8497, "lng": 74.4977, "radius_km": 10, ... }
}
```

---

### `GET /events/recommend`
Personalised recommendations by user profile or free-text interests.

```bash
# By user ID (looks up interests from sample_users.csv)
curl "http://localhost:8000/events/recommend?user_id=U001"

# By free-text interests
curl "http://localhost:8000/events/recommend?interests=robotics+IoT+Arduino"
```

---

### `GET /events/categories`
List all event categories with counts.

```bash
curl "http://localhost:8000/events/categories"
```

---

### `GET /events/{event_id}`
Full details for one event.

```bash
curl "http://localhost:8000/events/E003"
```
Returns `status: "error"` (not HTTP 404) if the event ID is not found, following the common schema.

---

## Running Tests

```bash
# From the repo root
pytest agents/events/tests/ -v

# With coverage
pytest agents/events/tests/ -v --tb=short
```

The test suite uses a small **fixture CSV** (written to a temp directory) with a fixed reference datetime (`NOW = 2025-11-10 08:00 UTC`), so tests are **completely date-independent**.

---

## Status

| Feature | Status |
|---------|--------|
| CSV data loading + validation | ✅ Done |
| Haversine distance filter | ✅ Done |
| TF-IDF vectorizer + cosine similarity | ✅ Done |
| Weighted ranking formula | ✅ Done |
| Proximity + time score components | ✅ Done |
| High-attendance flag + alerts | ✅ Done |
| `/events/nearby` endpoint | ✅ Done |
| `/events/recommend` endpoint | ✅ Done |
| `/events/categories` endpoint | ✅ Done |
| `/events/{event_id}` endpoint | ✅ Done |
| TF-IDF cache (rebuild on CSV change) | ✅ Done |
| Edge cases (empty interests, no results, bad coords) | ✅ Done |
| pytest suite (date-independent, fixture CSV) | ✅ Done |
| **Live event APIs** (Eventbrite, Meetup, Insider) | 🔲 Not started |
| User feedback / click-through learning | 🔲 Not started |
| College event entry form | 🔲 Not started |
| Persistent user interest profiles | 🔲 Not started |

