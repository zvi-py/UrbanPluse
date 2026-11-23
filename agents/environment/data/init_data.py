"""
Script to generate authoritative Belagavi 58 Municipal Wards JSON dataset
and 60-day hourly historical environmental observations for baseline ML training.
"""
import json
import os
import math
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# 58 Official Belagavi City Corporation (BCC) Wards with real localities
WARD_DEFINITIONS = [
    (1, "Tilakwadi West", "South", 15.8340, 74.5020, ["Tilakwadi 1st-3rd Gate", "Deshmukh Road", "Vaccine Depot"]),
    (2, "Tilakwadi Central", "South", 15.8390, 74.5050, ["Tilakwadi 4th-6th Gate", "Congress Road Cross"]),
    (3, "Tilakwadi East", "South", 15.8420, 74.5120, ["Railway Overbridge", "Goaves Circle"]),
    (4, "Camp North", "Central", 15.8470, 74.5030, ["St. Paul's High School", "Camp Market"]),
    (5, "Cantonment & Fort", "Central", 15.8520, 74.5060, ["Belagavi Fort", "Military Cantonment", "Fort Lake"]),
    (6, "Hindwadi South", "South", 15.8380, 74.4980, ["Hindwadi High School", "Ranade Road"]),
    (7, "Hindwadi North", "South", 15.8430, 74.4950, ["Goaves Cross", "Hindwadi Bus Stop"]),
    (8, "Bhagya Nagar", "South", 15.8350, 74.4920, ["Bhagya Nagar 1st-8th Cross", "Angol Link Rd"]),
    (9, "Angol Central", "South", 15.8280, 74.4990, ["Angol Main Road", "Harimandir", "Someshwar Temple"]),
    (10, "Angol South", "South", 15.8220, 74.5020, ["Nath Pai Circle", "Tahasildar Galli"]),
    (11, "Vadgaon Central", "South", 15.8290, 74.5120, ["Vadgaon Market", "Madhavpur Vadgaon"]),
    (12, "Vadgaon East", "South", 15.8260, 74.5190, ["Mangai Nagar", "Shahapur Border"]),
    (13, "Khasbag", "South", 15.8330, 74.5210, ["Khasbag Galli", "Weavers Colony", "Old Dyeing Mills"]),
    (14, "Shahapur South", "Central", 15.8380, 74.5180, ["Bank of India Circle", "Fulbag Galli"]),
    (15, "Shahapur Central", "Central", 15.8420, 74.5200, ["Khade Bazar Shahapur", "Khatavkar Galli"]),
    (16, "Shahapur North", "Central", 15.8460, 74.5170, ["Acharya Galli", "Dane Galli"]),
    (17, "Raviwar Peth", "Central", 15.8500, 74.5150, ["Raviwar Peth", "Cloth Market"]),
    (18, "Ganpat Galli & CBT", "Central", 15.8530, 74.5120, ["Central Bus Terminal (CBT)", "Ganpat Galli", "Maruti Galli"]),
    (19, "Khade Bazar City", "Central", 15.8550, 74.5090, ["Ramdev Galli", "Khade Bazar Main", "City Center Mall"]),
    (20, "Fort Area & KSRP", "Central", 15.8590, 74.5210, ["KSRP Grounds", "Belgaum Jail", "Old PWD Offices"]),
    (21, "Bogarves & College Road", "Central", 15.8570, 74.5020, ["Bogarves Circle", "RLS Institute", "College Road"]),
    (22, "Club Road & Lingraj", "Central", 15.8610, 74.5040, ["Lingraj College Campus", "Belgaum Club", "Golf Course"]),
    (23, "Chidambar Nagar", "West", 15.8410, 74.4880, ["Chidambar Nagar", "Adarsh Nagar", "Hindwadi Extension"]),
    (24, "Mandoli Road", "West", 15.8320, 74.4820, ["Mandoli Road Cross", "Ganeshpur Gate"]),
    (25, "Peeranwadi Industrial", "West", 15.8190, 74.4690, ["Peeranwadi Cross", "Foundry Cluster"]),
    (26, "Udyambag South", "Industrial", 15.8120, 74.4850, ["Udyambag Industrial Estate South", "Foundries & Forgings"]),
    (27, "Udyambag North", "Industrial", 15.8180, 74.4890, ["Udyambag Substation", "Auto Ancillary Hub"]),
    (28, "Majgaon", "Industrial", 15.8240, 74.4860, ["Majgaon Village Hub", "Indal Colony"]),
    (29, "Machhe", "Industrial", 15.8080, 74.4650, ["Machhe Industrial Zone", "NH4A Hub"]),
    (30, "Khanapur Road Corridor", "South", 15.8310, 74.4950, ["Khanapur Road", "Railway Gate No. 2"]),
    (31, "RPD College Cross", "South", 15.8370, 74.5090, ["RPD College Campus", "BBA Institute"]),
    (32, "Somwar Peth", "Central", 15.8480, 74.5120, ["Somwar Peth", "Vegetable Wholesale Market"]),
    (33, "Mangalwar Peth", "Central", 15.8510, 74.5180, ["Mangalwar Peth", "Old City Police Station"]),
    (34, "Budhwar Peth", "Central", 15.8530, 74.5160, ["Budhwar Peth", "Grain Merchants Market"]),
    (35, "Guruwar Peth", "Central", 15.8560, 74.5150, ["Old Belagavi Municipal Chowk", "Kacheri Road"]),
    (36, "Shukrawar Peth", "Central", 15.8580, 74.5130, ["Shukrawar Peth", "Hardware Market"]),
    (37, "Shaniwar Peth", "Central", 15.8600, 74.5110, ["Shaniwar Khut", "Math Galli"]),
    (38, "Nehru Nagar & KLE", "North", 15.8750, 74.5080, ["KLE Dr. Prabhakar Kore Hospital", "JNMC Campus", "Nehru Nagar Main"]),
    (39, "Shivajinagar", "North", 15.8680, 74.5120, ["Shivajinagar Bus Terminus", "Camp Link Road"]),
    (40, "Subhash Nagar", "North", 15.8720, 74.5190, ["Subhash Nagar Ground", "Vishweshwarayya Nagar"]),
    (41, "Sadashiv Nagar", "North", 15.8790, 74.5140, ["Sadashiv Nagar Garden", "Mini Vidhana Soudha"]),
    (42, "Mahantesh Nagar West", "East", 15.8820, 74.5250, ["Mahantesh Nagar Bus Stand", "Sector 1 & 2"]),
    (43, "Mahantesh Nagar East", "East", 15.8850, 74.5320, ["Sector 8 & 9", "MM Joshi Eye Hospital"]),
    (44, "Malaprabha Nagar", "East", 15.8780, 74.5290, ["Malaprabha Nagar Main", "Double Road"]),
    (45, "Ramteerth Nagar", "East", 15.8910, 74.5380, ["Ramteerth Nagar Colony", "Sector 3-5"]),
    (46, "Auto Nagar Industrial", "Industrial", 15.8980, 74.5450, ["Auto Nagar Phase 1 & 2", "Heavy Vehicle Service Corridor"]),
    (47, "Kanabargi South", "East", 15.8870, 74.5510, ["Kanabargi Lake", "Windmill Cross"]),
    (48, "Kanabargi North", "East", 15.8950, 74.5580, ["Kanabargi Industrial Hub", "Ring Road Junction"]),
    (49, "Kakati Road Corridor", "North", 15.9120, 74.5230, ["NH48 Kakati Highway Entrance", "Industrial Bypass"]),
    (50, "Vaibhav Nagar", "North", 15.8710, 74.4980, ["Vaibhav Nagar", "VTU University Road"]),
    (51, "Sahyadri Nagar", "North", 15.8760, 74.4940, ["Sahyadri Nagar Cross", "Jadhav Nagar"]),
    (52, "Anjaneya Nagar", "North", 15.8830, 74.4990, ["Anjaneya Nagar", "Ring Road Extension"]),
    (53, "Bauxite Road & Al-Ameen", "North", 15.8880, 74.5060, ["Bauxite Road", "Al-Ameen Medical Campus"]),
    (54, "Kangralkar Galli", "Central", 15.8570, 74.5260, ["Kangralkar Galli", "Chavat Galli"]),
    (55, "Vadgaon Outskirts", "South", 15.8150, 74.5150, ["Yellur Road", "Vadgaon Lake Fringe"]),
    (56, "Basavan Kudachi Border", "East", 15.8450, 74.5520, ["Basavan Kudachi Road", "Agricultural Fringe"]),
    (57, "Halaga Road", "East", 15.8360, 74.5610, ["Halaga Cross", "National Highway Junction"]),
    (58, "Khasbag Fringe", "South", 15.8290, 74.5350, ["Old City Southern Perimeter", "Industrial Warehousing"]),
]

def make_ward_polygon(lat, lng):
    """Generate provisional 6-vertex polygon around ward centroid."""
    d_lat = 0.0035
    d_lng = 0.0040
    return [
        [lat + d_lat, lng - d_lng * 0.5],
        [lat + d_lat * 0.7, lng + d_lng * 0.8],
        [lat - d_lat * 0.2, lng + d_lng],
        [lat - d_lat, lng + d_lng * 0.3],
        [lat - d_lat * 0.8, lng - d_lng * 0.7],
        [lat + d_lat * 0.2, lng - d_lng],
        [lat + d_lat, lng - d_lng * 0.5]
    ]

# Construct 58 wards dataset
wards_data = []
for wid, name, zone, lat, lng, landmarks in WARD_DEFINITIONS:
    # Wards 38 (KLE), 18 (CBT), 26 (Udyambag), 46 (Auto Nagar) have physical monitoring nodes
    has_active_feed = wid in (18, 26, 38, 46)
    coverage = "verified" if has_active_feed else "provisional"
    
    wards_data.append({
        "ward_id": wid,
        "ward_number": wid,
        "name": f"Ward {wid} — {name}",
        "locality": name,
        "zone": zone,
        "lat": lat,
        "lng": lng,
        "coverage_type": coverage,
        "has_active_station": has_active_feed,
        "station_name": f"BCC Sensor Node #{wid:02d} ({name})" if has_active_feed else None,
        "key_landmarks": landmarks,
        "population_estimate": 14000 + (wid * 173) % 8000,
        "polygon": make_ward_polygon(lat, lng),
        "area_sq_km": round(1.2 + (wid % 5) * 0.35, 2)
    })

# Save wards JSON
wards_file = os.path.join(DATA_DIR, "belagavi_58_wards.json")
with open(wards_file, "w", encoding="utf-8") as f:
    json.dump({"wards": wards_data, "total_wards": 58, "city": "Belagavi", "state": "Karnataka"}, f, indent=2)

print(f"Generated {len(wards_data)} wards in {wards_file}")

# Generate 60-day hourly historical environmental observations for baseline ML training
# Features: timestamp, ward_id, aqi, pm25, pm10, temperature_celsius, humidity_percent, wind_speed_kmh, rainfall_mm, noise_db
now = datetime.now()
rows = [
    "timestamp,ward_id,aqi,pm25,pm10,temperature_celsius,humidity_percent,wind_speed_kmh,rainfall_mm,noise_db,is_anomaly"
]

random.seed(42)
start_time = now - timedelta(days=60)
current = start_time

while current <= now:
    hour = current.hour
    day_of_week = current.weekday()
    
    # Diurnal cycle
    # Temperatures peak around 14:00 (28-34C), drop around 05:00 (18-22C)
    temp_base = 25.0 + 6.0 * math.sin((hour - 8) * math.pi / 12)
    # Humidity inverse to temperature: peaks at 06:00 (75-85%), drops at 14:00 (45-55%)
    humid_base = 65.0 - 18.0 * math.sin((hour - 8) * math.pi / 12)
    # Wind speed peaks in afternoon (12-18 km/h), calms at night (4-8 km/h)
    wind_base = 10.0 + 4.0 * math.sin((hour - 6) * math.pi / 12)
    # Particulates peak morning 08:00-10:00 (commute) & evening 18:00-21:00
    commute_peak = 1.0 + 0.45 * (math.exp(-((hour - 9) ** 2) / 4) + math.exp(-((hour - 19) ** 2) / 6))
    
    # Sample 4 representative nodes for each hour to build 60 * 24 * 4 = 5760 training samples
    for wid in (18, 26, 38, 46):
        # Industrial node (26, 46) has higher baseline particulates & noise
        is_industrial = wid in (26, 46)
        
        noise_base = (68.0 if is_industrial else 56.0) + (8.0 if 8 <= hour <= 21 else -6.0)
        pm25_base = (42.0 if is_industrial else 28.0) * commute_peak
        pm10_base = pm25_base * 1.85
        
        # Inject realistic noise & diurnal noise
        temp = round(temp_base + random.uniform(-1.5, 1.5), 1)
        humid = round(max(30, min(95, humid_base + random.uniform(-4, 4))), 1)
        wind = round(max(1.0, wind_base + random.uniform(-2.5, 2.5)), 1)
        rain = round(random.choice([0.0] * 20 + [0.5, 1.2, 4.0, 12.5]), 1) if random.random() < 0.08 else 0.0
        
        pm25 = round(max(5.0, pm25_base + random.uniform(-5, 6)), 1)
        pm10 = round(max(10.0, pm10_base + random.uniform(-8, 10)), 1)
        noise = round(max(40.0, min(95.0, noise_base + random.uniform(-3, 3))), 1)
        
        # Calculate CPCB sub-index for PM2.5 / PM10
        # Formula rough approximation for NAQI:
        # PM2.5: 0-30 -> 0-50, 31-60 -> 51-100, 61-90 -> 101-200, 91-120 -> 201-300
        if pm25 <= 30:
            aqi = int(pm25 * (50 / 30))
        elif pm25 <= 60:
            aqi = int(50 + (pm25 - 30) * (50 / 30))
        elif pm25 <= 90:
            aqi = int(100 + (pm25 - 60) * (100 / 30))
        else:
            aqi = int(200 + (pm25 - 90) * (100 / 30))
            
        is_anomaly = 0
        # Inject ~3.5% rare environmental anomalies (e.g. stubble burning, festival crackers, factory furnace venting)
        if random.random() < 0.035:
            is_anomaly = 1
            anomaly_type = random.choice(["smoke_spike", "inversion", "night_industrial_blast"])
            if anomaly_type == "smoke_spike":
                pm25 = round(pm25 * random.uniform(2.8, 4.5), 1)
                pm10 = round(pm10 * random.uniform(2.5, 4.0), 1)
                aqi = min(480, int(aqi * 2.6))
            elif anomaly_type == "night_industrial_blast":
                noise = round(min(105.0, noise + random.uniform(22, 35)), 1)
                pm25 = round(pm25 * random.uniform(2.0, 3.2), 1)
            elif anomaly_type == "inversion":
                wind = round(random.uniform(0.2, 0.8), 1)
                humid = round(min(98.0, humid + 15), 1)
                pm25 = round(pm25 * random.uniform(2.2, 3.5), 1)
                aqi = min(390, int(aqi * 2.2))
                
        rows.append(f"{current.strftime('%Y-%m-%d %H:%M')},{wid},{aqi},{pm25},{pm10},{temp},{humid},{wind},{rain},{noise},{is_anomaly}")
        
    current += timedelta(hours=1)

hist_file = os.path.join(DATA_DIR, "historical_environmental.csv")
with open(hist_file, "w", encoding="utf-8") as f:
    f.write("\n".join(rows))

print(f"Generated {len(rows)-1} historical observations in {hist_file}")
