# ------------------------------Nikita---------------------------------------
from asgiref.sync import sync_to_async
from admin_web.models import Weather_alerts, DMS_Disaster_Type, DMS_Employee
from asgiref.sync import sync_to_async
import logging
import asyncio
import asyncpg
import urllib.parse
from django.conf import settings
import json
from datetime import datetime, timedelta
# ----------------------------###Nikita###-------------------------------------



# -------------------------------NIKITA-----------------------------------------
connected_clients_trigger2 = set()
EMP_USERNAME = None
print("connected_clients_trigger2---", connected_clients_trigger2)


logger = logging.getLogger(__name__)

@sync_to_async
def get_old_weather_alerts():
    try:
        alerts = Weather_alerts.objects.order_by("-alert_datetime")
        return [
            {
                "pk_id": alert.pk_id,
                "latitude": alert.latitude,
                "longitude": alert.longitude,
                "elevation": alert.elevation,
                "time": alert.alert_datetime.isoformat() if alert.alert_datetime else None,
                "temperature_2m": alert.temperature_2m,
                "rain": alert.rain,
                "precipitation": alert.precipitation,
                "weather_code": alert.weather_code,
                "triger_status": alert.triger_status,
                "disaster_id": alert.disaster_id.disaster_id,
                "disaster_name": alert.disaster_id.disaster_name
            }
            for alert in alerts
        ]
    except Exception as e:
        logger.error(f"Error in get_old_weather_alerts: {e}")
        return []


connected_clients = set()

# Build DSN from Django settings
db_settings = settings.DATABASES['default']
# Safely encode password
password = urllib.parse.quote_plus(db_settings['PASSWORD'])
PG_DSN = f"postgresql://{db_settings['USER']}:{password}@{db_settings['HOST']}:{db_settings['PORT']}/{db_settings['NAME']}"



async def pg_listener(conn, pid, channel, payload):
    print(f"Received from PostgreSQL: {payload}")
    for ws in connected_clients.copy():
        try:
            await ws.send_text(payload)
        except Exception as e:
            print(f"Error sending to WebSocket: {e}")
            connected_clients.remove(ws)


@sync_to_async
def get_disaster_name(disaster_id):
    try:
        disaster_obj = DMS_Disaster_Type.objects.get(disaster_id=disaster_id)
        return disaster_obj.disaster_name
    except DMS_Disaster_Type.DoesNotExist:
        return None
    
@sync_to_async
def get_user_id(user_id):
    try:
        print("******************************GOT THE EMP ID *****************************")
        EMP_USERNAME = user_id
        print("EMP_USERNAME---", EMP_USERNAME)
        user_obj = DMS_Employee.objects.get(emp_id=user_id)
        return user_obj.emp_username
    except DMS_Employee.DoesNotExist:
        return None



async def on_notify(conn, pid, channel, payload):
    # print("New payload:", payload)

    data = json.loads(payload)

    disaster_name = await get_disaster_name(data['disaster_id_id'])
    data['disaster_name'] = disaster_name
    # print("Updated payload:", data)

    # Broadcast to all clients (if you want old behavior)
    for ws in connected_clients.copy():
        try:
            # await ws.send_text(payload)
            await ws.send_text(json.dumps(data))
        except Exception as e:
            print(f"Error sending to client: {e}")
            connected_clients.discard(ws)

    # Send only if triger_status == 2 to trigger2 clients
    if data.get("triger_status") == 2:
        for ws in connected_clients_trigger2.copy():
            try:
                # await ws.send_text(payload)
                await ws.send_text(json.dumps(data))
            except Exception as e:
                print(f"Error sending to trigger2 client: {e}")
                connected_clients_trigger2.discard(ws)


async def listen_to_postgres():
    while True:
        try:
            conn = await asyncpg.connect(PG_DSN)

            await conn.add_listener('weather_alerts_channel', on_notify)
            print("Listening to PostgreSQL channel...")

            while True:
                try:
                    await conn.execute("SELECT 1")  # Ping to keep alive
                    await asyncio.sleep(60)
                except (asyncpg.PostgresConnectionError, ConnectionResetError) as inner_error:
                    print(f"⚠️ Inner loop connection lost: {inner_error}")
                    break  # break inner loop to reconnect

        except Exception as e:
            print(f"PostgreSQL listen error: {e}")
            await asyncio.sleep(10)  # wait and retry
        finally:
            # if 'conn' in locals():
            #     await conn.close()
            if conn:
                try:
                    await conn.remove_listener('weather_alerts_channel', on_notify)
                    await conn.close()
                    print("🔌 PostgreSQL connection closed and listener removed.")
                except Exception as cleanup_error:
                    print(f"⚠️ Cleanup error: {cleanup_error}")

# -------------------------------###NIKITA###-----------------------------------------







# Mayank

import json
import asyncio
import httpx
from shapely.geometry import shape
# from cache_store import alert_cache
from datetime import datetime
import pytz  # pip install pytz


OPENWEATHER_API_KEY = "959e8b3d77615bcdb1659ff5bd74e791"  # 👈 Replace with your actual API key

def convert_to_ist(utc_time_str):
    utc_dt = datetime.strptime(utc_time_str, "%Y-%m-%dT%H:%M")
    utc_dt = utc_dt.replace(tzinfo=pytz.utc)
    ist_dt = utc_dt.astimezone(pytz.timezone("Asia/Kolkata"))
    return ist_dt.isoformat(timespec='seconds')

def load_ward_centroids(filepath="pune-2022-wa.geojson"):
    with open(filepath, "r") as f:
        geojson_data = json.load(f)

    centroids = {}
    for feature in geojson_data["features"]:
        props = feature["properties"]
        geom = shape(feature["geometry"])
        name = props.get("Name2") or "Unknown"
        centroid = geom.centroid
        centroids[name] = (round(centroid.y, 4), round(centroid.x, 4))
    return centroids

def get_next_hour_ist_timestamp():
    ist = pytz.timezone("Asia/Kolkata")
    now_ist = datetime.now(ist)
    next_hour = now_ist + timedelta(hours=1)
    next_hour = next_hour.replace(minute=0, second=0, microsecond=0)
    return next_hour.isoformat(timespec='minutes')

# ✅ Updated for OpenWeatherMap
async def fetch_weather(client, ward, lat, lon):
    url = (
        f"https://api.openweathermap.org/data/3.0/onecall"
        f"?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    )
    try:
        res = await client.get(url, timeout=10)
        data = res.json()

        current = data.get("current", {})
        alerts = data.get("alerts", [])

        ist = pytz.timezone("Asia/Kolkata")
        now = datetime.now(ist).isoformat()

        # Prepare full alert list with additional context
        full_alerts = []
        for alert in alerts:
            start = datetime.fromtimestamp(alert.get("start")).astimezone(ist).isoformat()
            end = datetime.fromtimestamp(alert.get("end")).astimezone(ist).isoformat()

            # 🔎 Attach current weather data as 'parameters'
            parameters = {
                "temperature": current.get("temp"),
                "humidity": current.get("humidity"),
                "uvi": current.get("uvi"),
                "wind_speed": current.get("wind_speed"),
                "wind_gust": current.get("wind_gust"),
                "pressure": current.get("pressure"),
                "rain_1h": current.get("rain", {}).get("1h") if current.get("rain") else None,
                "visibility": current.get("visibility"),
                "weather_desc": current.get("weather", [{}])[0].get("description")
            }

            full_alerts.append({
                "sender_name": alert.get("sender_name"),
                "event": alert.get("event"),
                "start": start,
                "end": end,
                "description": alert.get("description"),
                "tags": alert.get("tags"),
                "parameters": parameters  # 👈 Your custom weather context
            })

        return {
            "ward": ward,
            "lat": lat,
            "lon": lon,
            "timestamp": now,
            "alerts": full_alerts
        }

    except Exception as e:
        print(f"⚠️ Error fetching weather for {ward}: {e}")
        return None

async def update_alerts(centroids):
    print("🔄 Fetching fresh OpenWeatherMap alert data...")
    async with httpx.AsyncClient() as client:
        tasks = [fetch_weather(client, ward, lat, lon) for ward, (lat, lon) in centroids.items()]
        results = await asyncio.gather(*tasks)

    alerts = [r for r in results if r]
    print(f"✅ Alerts fetched at {datetime.now().isoformat()} with {len(alerts)} ward entries.")
    return alerts

