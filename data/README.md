# Shared Data Directory

This folder contains shared/global datasets used across multiple agents.

Agent-specific sample data lives in each agent's own `data/` subfolder:
- `agents/traffic/data/traffic_sample.csv`
- `agents/events/data/events_sample.csv`
- `agents/student/data/student_sample.csv`
- `agents/environment/data/environment_sample.csv`

## Data Sources (planned)
| Source | API | Agent |
|--------|-----|-------|
| OpenWeatherMap | REST | Environment |
| OpenAQ | REST | Environment |
| Traffic API | REST | Traffic |
| OpenStreetMap/OSRM | REST | Traffic |
| Local event listings | Scraped/CSV | Events |
| College student directory | CSV | Student |
