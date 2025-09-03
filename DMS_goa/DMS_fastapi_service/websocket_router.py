from fastapi import APIRouter, WebSocket
import asyncio
# from websocket_views import kafka_message_stream
# from .websocket_views import kafka_message_stream


# router = APIRouter()

# @router.websocket("/ws/kafka")
# async def websocket_kafka(websocket: WebSocket):
#     await websocket.accept()
#     for message in kafka_message_stream():
#         await websocket.send_text(message)
#         await asyncio.sleep(0.05)