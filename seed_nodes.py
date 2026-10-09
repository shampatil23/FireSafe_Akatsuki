import requests
import time

url = "https://firesafe-48056-default-rtdb.firebaseio.com/nodes.json"

# Clear existing nodes
requests.delete(url)

now = int(time.time() * 1000)

nodes = {
    "NODE-TEST-001": {
        "name": "TEST-NODE-001 (Simulated)",
        "zoneId": "Forest Zone A",
        "latitude": 30.0668,
        "longitude": 79.0193,
        "lastHeartbeatAt": now - 10000,
        "lastTelemetryAt": now - 12000,
        "batteryLevel": 85,
        "signalStrength": -65,
        "firmwareVersion": "v1.2.4",
        "sensorReadings": {
            "temperature": 28.5,
            "humidity": 45,
            "smoke": "Low"
        },
        "connectedNodeIds": ["NODE-TEST-002", "NODE-TEST-003"]
    },
    "NODE-TEST-002": {
        "name": "TEST-NODE-002 (Simulated)",
        "zoneId": "Forest Zone A",
        "latitude": 30.1268,
        "longitude": 79.0593,
        "lastHeartbeatAt": now - 300000,
        "lastTelemetryAt": now - 310000,
        "batteryLevel": 15,
        "signalStrength": -85,
        "firmwareVersion": "v1.2.3",
        "sensorReadings": {
            "temperature": 32.1,
            "humidity": 30,
            "wind_speed": 18.5
        },
        "lastError": "Intermittent packet loss",
        "connectedNodeIds": ["NODE-TEST-001"]
    },
    "NODE-TEST-003": {
        "name": "TEST-NODE-003 (Simulated)",
        "zoneId": "Forest Zone A",
        "latitude": 30.1500,
        "longitude": 79.1000,
        "lastHeartbeatAt": now - 1200000,
        "lastTelemetryAt": now - 1200000,
        "batteryLevel": 0,
        "signalStrength": -95,
        "firmwareVersion": "v1.1.0",
        "sensorReadings": {
            "temperature": 25.0,
            "humidity": 55
        },
        "connectedNodeIds": ["NODE-TEST-001"]
    },
    "NODE-TEST-004": {
        "name": "TEST-NODE-004 (Simulated)",
        "zoneId": "Valley Basin",
        "latitude": 30.0100,
        "longitude": 79.0000,
        "connectedNodeIds": []
    }
}

response = requests.patch(url, json=nodes)
if response.status_code == 200:
    print("Test nodes successfully seeded to Firebase RTDB.")
else:
    print("Failed to seed nodes:", response.text)
