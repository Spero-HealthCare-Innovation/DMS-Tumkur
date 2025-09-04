# import httpx
# import pytz
# from datetime import datetime, date, timedelta
# from typing import List
# import feedparser
# import json
# from pathlib import Path
# from shapely.geometry import shape
# import asyncio


# def load_ward_centroids(filepath="pune-2022-wa.geojson"):
#     geojson_path = Path(filepath)
#     with geojson_path.open() as f:
#         geojson_data = json.load(f)

#     centroids = []
#     for feature in geojson_data["features"]:
#         geometry = feature["geometry"]
#         properties = feature["properties"]
#         polygon = shape(geometry)
#         centroid = polygon.centroid
#         lat, lon = centroid.y, centroid.x
#         ward_name = properties.get("Name2") or properties.get("Name1") or f"Ward {properties.get('wardnum')}"
#         centroids.append((ward_name, lat, lon))

#     return centroids


# def fetch_google_news_alerts(limit=5):
#     url = "https://news.google.com/rss/search?q=pune+rain+OR+flood+OR+weather+OR+disaster"
#     feed = feedparser.parse(url)
#     articles = []

#     # Get today's date in IST
#     ist = pytz.timezone("Asia/Kolkata")
#     today_str = datetime.now(tz=ist).strftime('%Y-%m-%d')

#     for entry in feed.entries:
#         # Parse and convert published time to IST
#         try:
#             published_dt = datetime(*entry.published_parsed[:6])
#             published_dt = pytz.utc.localize(published_dt).astimezone(ist)
#             published_date_str = published_dt.strftime('%Y-%m-%d')
#         except Exception:
#             continue

#         # Check if article is from today
#         if published_date_str == today_str:
#             articles.append({
#                 "title": entry.title,
#                 "link": entry.link,
#                 "published": published_dt.isoformat()
#             })

#         if len(articles) >= limit:
#             break

#     if not articles:
#         articles.append({"info": "No news articles found for today."})

#     return articles


# OPENWEATHER_API_KEY = "959e8b3d77615bcdb1659ff5bd74e791"

# # Important Pune District Coordinates
# zone_district_points = {
#     "Zone 1": [
#         ("Yerwada_Kalas_Dhanori", 18.5675, 73.8992),
#         ("Lohegaon_VimanNagar", 18.5867, 73.9189),
#         ("Dhanori_Vishrantwadi", 18.5922, 73.8776)
#     ],
#     "Zone 2": [
#         ("Shivajinagar_Sangamwadi", 18.5304, 73.8472),
#         ("Bopodi_SPPU", 18.5521, 73.8296),
#         ("Aundh_Balewadi", 18.5606, 73.7872),
#         ("Baner_Sus_Mahalunge", 18.5599, 73.7745)
#     ],
#     "Zone 3": [
#         ("KalyaniNagar_NagpurChawl", 18.5498, 73.8996),
#         ("Kalas_PhuleNagar", 18.5821, 73.8845),
#         ("Kharadi_Wagholi", 18.5616, 73.9511)
#     ],
#     "Zone 4": [
#         ("Wanowrie_Ramtekdi", 18.4879, 73.9014),
#         ("Hadapsar_Mundhwa", 18.5033, 73.9252),
#         ("Kondhwa_Yewalewadi", 18.4572, 73.8928)
#     ],
#     "Zone 5": [
#         ("BhavaniPeth", 18.5074, 73.8642),
#         ("Kasba_VishrambaugWada", 18.5193, 73.8555),
#         ("Bibwewadi", 18.4742, 73.8650)
#     ]
# }

# # async def fetch_alert_and_weather(lat: float, lon: float, name: str):
# #     ist = pytz.timezone("Asia/Kolkata")
# #     try:
# #         async with httpx.AsyncClient() as client:
# #             # Alert API
# #             alert_url = f"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
# #             alert_res = await client.get(alert_url)
# #             alert_data = alert_res.json()
# #             alerts = alert_data.get("alerts", [])

# #             # Current Weather API
# #             weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
# #             weather_res = await client.get(weather_url)
# #             weather_data = weather_res.json()

# #             # Forecast API
# #             forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
# #             forecast_res = await client.get(forecast_url)
# #             forecast_data = forecast_res.json()

# #             today_forecasts = []
# #             today = datetime.now(tz=ist).date()
# #             start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=ist)
# #             end_of_day = datetime.combine(today, datetime.max.time()).replace(tzinfo=ist)
# #             for item in forecast_data.get("list", []):
# #                 ts = datetime.fromtimestamp(item.get("dt", 0)).astimezone(ist)
# #                 if ts.date() == today:
# #                     today_forecasts.append({
# #                         "start_time": ts.isoformat(),
# #                         "end_time": (ts + timedelta(hours=3)).isoformat(),
# #                         "temperature": item.get("main", {}).get("temp"),
# #                         "humidity": item.get("main", {}).get("humidity"),
# #                         "rain_3h": item.get("rain", {}).get("3h", 0.0),
# #                         "weather": item.get("weather", [{}])[0].get("description")
# #                     })

# #             main = weather_data.get("main", {})
# #             wind = weather_data.get("wind", {})
# #             clouds = weather_data.get("clouds", {})
# #             rain = weather_data.get("rain", {}).get("1h", 0.0)
# #             snow = weather_data.get("snow", {}).get("1h", 0.0)
# #             weather_block = weather_data.get("weather", [{}])[0]
# #             weather_time = datetime.fromtimestamp(weather_data.get("dt", 0)).astimezone(ist).isoformat()

# #             return [{
# #                 "location": name,
# #                 "lat": lat,
# #                 "lon": lon,
# #                 "current_weather_time": weather_time,
# #                 "alerts": [
# #                     {
# #                         "sender_name": a.get("sender_name"),
# #                         "event": a.get("event"),
# #                         "start": datetime.fromtimestamp(a.get("start", 0)).astimezone(ist).isoformat(),
# #                         "end": datetime.fromtimestamp(a.get("end", 0)).astimezone(ist).isoformat(),
# #                         "description": a.get("description"),
# #                         "tags": a.get("tags")
# #                     } for a in alerts
# #                 ],
# #                 "parameters": {
# #                     "temperature": main.get("temp"),
# #                     "feels_like": main.get("feels_like"),
# #                     "temp_min": main.get("temp_min"),
# #                     "temp_max": main.get("temp_max"),
# #                     "humidity": main.get("humidity"),
# #                     "pressure": main.get("pressure"),
# #                     "sea_level": main.get("sea_level"),
# #                     "grnd_level": main.get("grnd_level"),
# #                     "visibility": weather_data.get("visibility"),
# #                     "wind_speed": wind.get("speed"),
# #                     "wind_deg": wind.get("deg"),
# #                     "wind_gust": wind.get("gust"),
# #                     "cloud_coverage": clouds.get("all"),
# #                     "weather_main": weather_block.get("main"),
# #                     "weather_desc": weather_block.get("description")
# #                     # "rain_past_1h": rain,
# #                     # "snow_past_1h": snow
# #                 },
# #                 "today_forecast": today_forecasts
# #             }]

# #     except Exception as e:
# #         return [{
# #             "location": name,
# #             "lat": lat,
# #             "lon": lon,
# #             "alerts": [],
# #             "parameters": {
# #                 "error": str(e)
# #             }
# #         }]

# # async def fetch_alert_and_weather(lat: float, lon: float, name: str):
# #     ist = pytz.timezone("Asia/Kolkata")
# #     try:
# #         async with httpx.AsyncClient() as client:
# #             # 🔔 Alert API
# #             alert_url = f"https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
# #             alert_res = await client.get(alert_url)
# #             alert_data = alert_res.json()
# #             alerts = alert_data.get("alerts", [])

# #             # 🌦️ Current Weather API
# #             weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
# #             weather_res = await client.get(weather_url)
# #             weather_data = weather_res.json()

# #             # 📅 Forecast API
# #             forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
# #             forecast_res = await client.get(forecast_url)
# #             forecast_data = forecast_res.json()

# #             # ✅ Forecast time and rain
# #             forecast_time = None
# #             rain_forecast = 0.0
# #             try:
# #                 next_forecast = forecast_data.get("list", [])[0]
# #                 rain_forecast = next_forecast.get("rain", {}).get("3h", 0.0)
# #                 forecast_time = datetime.fromtimestamp(next_forecast.get("dt")).astimezone(ist).isoformat()
# #             except:
# #                 forecast_time = None

# #             # ✅ Weather time
# #             weather_time = None
# #             try:
# #                 weather_time = datetime.fromtimestamp(weather_data.get("dt")).astimezone(ist).isoformat()
# #             except:
# #                 weather_time = None

# #             main = weather_data.get("main", {})
# #             wind = weather_data.get("wind", {})
# #             clouds = weather_data.get("clouds", {})
# #             rain = weather_data.get("rain", {}).get("1h", 0.0)
# #             snow = weather_data.get("snow", {}).get("1h", 0.0)
# #             weather_block = weather_data.get("weather", [{}])[0]

# #             return [{
# #                 "location": name,
# #                 "lat": lat,
# #                 "lon": lon,
# #                 "current_weather_time": weather_time,
# #                 "forecast_time": forecast_time,
# #                 "alerts": [
# #                     {
# #                         "sender_name": a.get("sender_name"),
# #                         "event": a.get("event"),
# #                         "start": datetime.fromtimestamp(a.get("start")).astimezone(ist).isoformat(),
# #                         "end": datetime.fromtimestamp(a.get("end")).astimezone(ist).isoformat(),
# #                         "description": a.get("description"),
# #                         "tags": a.get("tags")
# #                     }
# #                     for a in alerts
# #                 ],
# #                 "parameters": {
# #                     "temperature": main.get("temp"),
# #                     "feels_like": main.get("feels_like"),
# #                     "temp_min": main.get("temp_min"),
# #                     "temp_max": main.get("temp_max"),
# #                     "humidity": main.get("humidity"),
# #                     "pressure": main.get("pressure"),
# #                     "sea_level": main.get("sea_level"),
# #                     "grnd_level": main.get("grnd_level"),
# #                     "visibility": weather_data.get("visibility"),
# #                     "wind_speed": wind.get("speed"),
# #                     "wind_deg": wind.get("deg"),
# #                     "wind_gust": wind.get("gust"),
# #                     "cloud_coverage": clouds.get("all"),
# #                     "weather_main": weather_block.get("main"),
# #                     "weather_desc": weather_block.get("description"),
# #                     "rain_past_1h": rain,
# #                     "snow_past_1h": snow,
# #                     "rain_forecast_3h": rain_forecast
# #                 }
# #             }]
# #     except Exception as e:
# #         return [{
# #             "location": name,
# #             "lat": lat,
# #             "lon": lon,
# #             "alerts": [],
# #             "parameters": {
# #                 "error": str(e)
# #             }
# #         }]


# # async def get_zone_wise_alerts() -> dict:
# #     ist = pytz.timezone("Asia/Kolkata")
# #     all_zones = {}

# #     for zone_name, locations in zone_district_points.items():
# #         zone_data = []
# #         for location_name, lat, lon in locations:
# #             data = await fetch_alert_and_weather(lat, lon, location_name)
# #             zone_data.extend(data)
# #         all_zones[zone_name] = zone_data
    
# #     news_alerts = fetch_google_news_alerts()

# #     return {
# #         "count": sum(len(z) for z in all_zones.values()),
# #         "last_updated": datetime.now(tz=ist).isoformat(),
# #         "zones": all_zones,
# #         "news_alerts": news_alerts
# #     }
    
    
# # async def get_ward_wise_alerts() -> dict:
# #     ist = pytz.timezone("Asia/Kolkata")
# #     wards = load_ward_centroids("pune-2022-wa.geojson")
    
# #     # Prepare async tasks for each ward
# #     tasks = [
# #         fetch_alert_and_weather(lat, lon, ward_name)
# #         for ward_name, lat, lon in wards
# #     ]

# #     # Run all tasks concurrently
# #     results = await asyncio.gather(*tasks)

# #     # Flatten the list of lists
# #     ward_data = [entry for sublist in results for entry in sublist]

# #     # news_alerts = fetch_google_news_alerts()

# #     return {
# #         "count": len(ward_data),
# #         "last_updated": datetime.now(tz=ist).isoformat(),
# #         "wards": ward_data
# #         # "news_alerts": news_alerts
# #     }