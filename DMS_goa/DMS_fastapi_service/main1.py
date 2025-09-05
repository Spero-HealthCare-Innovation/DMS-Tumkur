from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import socketio
from pydantic import BaseModel
from fastapi import FastAPI, BackgroundTasks
import requests
import time
import asyncio
from kafka import KafkaProducer
from kafka import KafkaConsumer
import threading
# import subprocess
import time
# import pygetwindow as gw
# import pyautogui
import os
from screeninfo import get_monitors
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder  # Import jsonable_encoder
import logging
# import uiautomation as auto
import asyncio
from sqlalchemy import text
from typing import List
from websocket_router import router as websocket_router
# from .websocket_router import router as websocket_router
import httpx
import pandas as pd

# from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import json
from django_setup import *
from asgiref.sync import sync_to_async
from admin_web.models import Weather_alerts  # Django model
from weather_alerts_utils import get_old_weather_alerts, listen_to_postgres, connected_clients, connected_clients_trigger2, get_user_id
from contextlib import asynccontextmanager
from starlette.applications import Starlette
from starlette.routing import WebSocketRoute
# from starlette.websockets import WebSocket
import asyncio
from datetime import timedelta
from django.utils import timezone


# ----------------------Authentication for websockets---------------------------------------------------
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from admin_web.models import DMS_Employee
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

# def get_user_from_token(token: str):
#     try:
#         validated_token = UntypedToken(token)
#         user_id = validated_token['emp_id']
#         return DMS_Employee.objects.get(id=user_id)
#     except (InvalidToken, TokenError, DMS_Employee.DoesNotExist):
#         return None


def get_user_from_token(token: str):
    print("get_user_from_token*******")
    try:
        print("in try block")
        access_token = AccessToken(token)  # This checks signature and expiration
        print("access_token*******")
        user_id = access_token["user_id"]  # Or "emp_id" if you've added it
        print("access_token, user_id------ ",access_token, user_id)
        print(type(user_id))
        # dms_emp_obj = DMS_Employee.objects.get(emp_id='4')
        # print("dms_emp_obj-- ", dms_emp_obj)
        return user_id
    except (TokenError, DMS_Employee.DoesNotExist):
        return None




#==================================Send Data to Kafka===(Mayank)========================================#

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

# Create FastAPI app
# app = FastAPI()
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Called on startup
#     task = asyncio.create_task(listen_to_postgres())

#     yield  # Application runs here

#     # Called on shutdown
#     task.cancel()
#     try:
#         await task
#     except asyncio.CancelledError:
#         pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start both background tasks
    weather_task = asyncio.create_task(scheduled_weather_fetch())
    postgres_task = asyncio.create_task(listen_to_postgres())
    # updates_task = asyncio.create_task(push_updated_weather_alerts())

    yield  # App runs while both tasks are active

    # On shutdown
    for task in [weather_task, postgres_task]:
        task.cancel()
    try:
        await weather_task
    except asyncio.CancelledError:
        pass
    try:
        await postgres_task
    except asyncio.CancelledError:
        pass


app = FastAPI(lifespan=lifespan)

# Create the ASGI application by mounting the Socket.IO app and the FastAPI app
socket_app = socketio.ASGIApp(
    socketio_server=sio,
    other_asgi_app=app,
    socketio_path='socket.io'
)

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



producer = KafkaProducer(
    bootstrap_servers='192.168.1.133:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

API_KEY = '959e8b3d77615bcdb1659ff5bd74e791'
CITY = 'Goa'
URL = f'https://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric'

async def fetch_and_send():
    while True:
        try:
            response = requests.get(URL)
            data = response.json()
            temp = data['main']['temp']

            if temp > 20.0:
                print(f"[✔] Temp is {temp}°C > 20°C — sending to Kafka")
                producer.send('weather_alerts_test', data)
            else:
                print(f"[ ] Temp is {temp}°C ≤ 20°C — not sending")

        except Exception as e:
            print("Error:", e)
        await asyncio.sleep(120)  # 2 minutes

@app.on_event("startup")
async def start_background_task():
    asyncio.create_task(fetch_and_send())
    
    
#============================ MAYANK(multiple Screen) =========================================================================#

# @app.get("/launch-dashboards")
# def launch_dashboards():
#     try:
#         subprocess.Popen(["cmd", "/c", "start chrome --new-window http://localhost:3000/service-request"])
#         subprocess.Popen(["cmd", "/c", "start chrome --new-window http://localhost:3000/addservice"])
#         subprocess.Popen(["cmd", "/c", "start chrome --new-window http://localhost:3000/enquiries"])

#         # subprocess.Popen(["cmd", "/c", "start chrome --new-window http://localhost:5173/dashboard1"])
#         # subprocess.Popen(["cmd", "/c", "start chrome --new-window http://localhost:5173/dashboard2"])
#         # subprocess.Popen(["cmd", "/c", "start chrome --new-window http://localhost:5173/dashboard3"])


#         time.sleep(5)

#         # Get and sort monitors left to right
#         monitors = sorted(get_monitors(), key=lambda m: m.x)
#         if len(monitors) < 3:
#             return JSONResponse(content={"error": "Less than 3 monitors detected"}, status_code=400)

#         # Map dashboards to correct monitor index
#         dashboard_monitor_map = {
#             'service-request': 0,  # This will go to monitor 1
#             'addservice': 1,       # This will go to monitor 2
#             'enquiries': 2         # This will go to monitor 3
#         }

#         # Get Chrome windows
#         chrome_windows = [w for w in gw.getWindowsWithTitle('Chrome') if w is not None and w.title.strip() != '']
#         if len(chrome_windows) < 3:
#             return JSONResponse(content={"error": "Not enough Chrome windows found"}, status_code=500)

#         for dashboard, monitor_index in dashboard_monitor_map.items():
#             for window in chrome_windows:
#                 if dashboard in window.title.lower():
#                     monitor = monitors[monitor_index]
#                     window.moveTo(monitor.x, monitor.y)
#                     window.resizeTo(monitor.width, monitor.height)
#                     break

#         for window in chrome_windows:
#             if "login" in window.title.lower():  # make sure your login window has "Login" in title
#                 window.close()
#                 break

#         return {"message": "Dashboards correctly placed on respective monitors"}

#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)

''' Note:- *This command should always remain at the end. Any new code must be added above it.* '''

''' Run the FastAPI Project
1. Navigate to the project directory:
cd Spero-DMS\DMS_goa\DMS_fastapi_service

2. Run the FastAPI server:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload '''

connected_clients: List[WebSocket] = []

@app.websocket("/send_data")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    print("Client connected")
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received from frontend: {data}")
            if data.strip().lower() == "true":
                # Broadcast to all connected clients
                for client in connected_clients:
                    if client != websocket:
                        await client.send_text("true")
    except WebSocketDisconnect:
        print("Client disconnected")
        connected_clients.remove(websocket)
        
        
        
connected_clients_new: List[WebSocket] = []

@app.websocket("/send_ip")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients_new.append(websocket)
    print("Client connected")
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received from frontend: {data}")
            # if data.strip().lower() == "true":
                # Broadcast to all connected clients
            for client in connected_clients_new:
                if client != websocket:
                    await client.send_text(data)
    except WebSocketDisconnect:
        print("Client disconnected")
        connected_clients_new.remove(websocket)



# ------------------------------------------------------------------------------------------------------------#

EXCEL_PATH = "goa_latlong_points.xlsx"  # Update this with your file path


# Excel file se lat-long read karo
def extract_lat_lon_from_excel(file_path):
    df = pd.read_excel(file_path)
    latitudes = df['lat'].dropna().astype(str).tolist()
    longitudes = df['long'].dropna().astype(str).tolist()
    return ','.join(latitudes), ','.join(longitudes)


# Open-Meteo API ko call karo
async def call_open_meteo_api():
    latitudes, longitudes = extract_lat_lon_from_excel(EXCEL_PATH)

    # url = (
    #     f"https://api.open-meteo.com/v1/forecast?"
    #     f"latitude={latitudes}&longitude={longitudes}"
    #     f"&current=temperature_2m,rain,precipitation,weather_code"
    # )

    url = (
        "https://api.open-meteo.com/v1/forecast?latitude=15.5367,15.1261&longitude=73.9458,74.1848&current=temperature_2m,rain,precipitation,weather_code"
    )
    # url = (
    #     "https://api.open-meteo.com/v1/forecast?latitude=15.5367,15.1261&longitude=73.9458,74.1848&hourly=temperature_2m,rain,precipitation,weather_code&models=ecmwf_ifs025"
    # )


    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    if response.status_code == 200:
        data = response.json()
        print("✅ Weather data fetched")
        # print(f"[✔] Temp is {temp}°C > 20°C — sending to Kafka")
        producer.send('weather_alerts_rain', data)
        return data
    else:
        print("❌ Error fetching data")
        return {"error": response.text}


# Manual trigger route
@app.get("/fetch-weather")
async def fetch_weather():
    data = await call_open_meteo_api()
    return JSONResponse(content=data)


# Background scheduler
async def scheduled_weather_fetch():
    while True:
        await call_open_meteo_api()
        await asyncio.sleep(120)  # 2 minutes


# Start scheduler on app startup
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(scheduled_weather_fetch())



# -----------------------------------------Nikita----------------------------------------------


@app.websocket("/ws/weather_alerts")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients_trigger2.add(websocket)
    print(f"WebSocket connected: {websocket.client}")

    last_sent_pk = 0  # Keep track of the last pk_id sent to this client

    try:
        # Send old messages on connect
        old_messages = await get_old_weather_alerts()
        for msg in old_messages:
            await websocket.send_text(json.dumps(msg))  # ✅ flat format
            await asyncio.sleep(0.05)

        # Get latest pk_id after old messages
        if old_messages:
            last_sent_pk = max(msg["pk_id"] for msg in old_messages if "pk_id" in msg)

        # Background task to check for new entries
        async def send_new_alerts():
            nonlocal last_sent_pk
            while True:
                try:
                    new_alerts = await sync_to_async(list)(
                        Weather_alerts.objects.filter(pk_id__gt=last_sent_pk)
                        .order_by("pk_id")
                        .values("pk_id", "latitude", "longitude", "elevation", "alert_datetime", 
                                "temperature_2m", "rain", "precipitation", 
                                "weather_code", "triger_status")
                    )

                    for alert in new_alerts:
                        if alert["alert_datetime"]:
                            alert["alert_datetime"] = alert["alert_datetime"].isoformat()
                        await websocket.send_text(json.dumps(alert))  # ✅ same flat format
                        last_sent_pk = max(last_sent_pk, alert["pk_id"])
                        await asyncio.sleep(0.05)

                    await asyncio.sleep(5)  # Check for new data every 5 seconds
                except Exception as e:
                    print(f"Error in background task: {e}")
                    break

        # Start the background task
        background_task = asyncio.create_task(send_new_alerts())

        # Keep the connection alive (optional: handle incoming messages)
        while True:
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                print(f"Received message from client: {msg}")
            except asyncio.TimeoutError:
                pass  # Just keep alive

    except WebSocketDisconnect:
        print(f"WebSocket disconnected by client: {websocket.client}")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        connected_clients_trigger2.remove(websocket)
        print(f"WebSocket removed: {websocket.client}")
        background_task.cancel()  # Stop the background polling


from asgiref.sync import sync_to_async

# Wrap ORM in async-safe way
@sync_to_async
def get_user_by_emp_id(emp_id):
    return DMS_Employee.objects.get(emp_id=emp_id)



@app.websocket("/ws/weather_alerts_trigger2")
async def websocket_trigger2(websocket: WebSocket):
    user_exist = 0
    token = websocket.query_params.get("token")
    print("tokennnnnnn----", token)
    user_id = get_user_from_token(token)
    user_obj = await get_user_by_emp_id(user_id)
    user_exist = user_obj.emp_id
    print("user obj-----", user_obj.emp_id)
    user_IDdd = await get_user_id(user_obj.emp_id)
    print("MAIN.py user idd function called-----", user_IDdd)
    if user_exist == 0:
        await websocket.close(code=1008)
        return
    
    await websocket.accept()

    try:
        # No old data here — only listen
        while True:
            await asyncio.sleep(5)  # Optional heartbeat
            # await websocket.send_text(json.dumps({"type": "heartbeat"}))
    except WebSocketDisconnect:
        print("Trigger2 WebSocket disconnected.")
    except Exception as e:
        print(f"Trigger2 WebSocket error: {e}")
    finally:
        connected_clients_trigger2.remove(websocket)
        print(f"Trigger2 WebSocket removed: {websocket.client}")


# # --------------------------------------####NIKITA###-------------------------------------