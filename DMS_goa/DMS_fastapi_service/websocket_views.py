# from confluent_kafka import Consumer


# topic = "weather_alerts"
 
# # Initialize globally
# consumer = None
# assigned = False

# def on_assign(consumer_instance, partitions):
#     # Set offset to 0 before assignment (no need for manual seek later)
#     for p in partitions:
#         p.offset = 0
#     consumer_instance.assign(partitions)
#     global assigned
#     assigned = True

# def initialize_consumer():
#     global consumer
#     consumer = Consumer({
#         'bootstrap.servers': '192.168.1.133:9092',
#         'group.id': 'manual-websocket-consumer',
#         'enable.auto.commit': False,
#         'auto.offset.reset': 'earliest',
#         'default.topic.config': {'auto.offset.reset': 'earliest'},
#         'session.timeout.ms': 6000
#     })
#     consumer.subscribe([topic], on_assign=on_assign)

# initialize_consumer()

# def kafka_message_stream():
#     global assigned
#     while not assigned:
#         consumer.poll(0.1)  # Wait for assignment
#     while True:
#         msg = consumer.poll(1.0)
#         if msg is None or msg.error():
#             continue
#         yield msg.value().decode("utf-8")
