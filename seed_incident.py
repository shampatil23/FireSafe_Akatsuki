import json
import requests
import datetime
import time

url = "https://firesafe-48056-default-rtdb.firebaseio.com/emergency_requests.json"

current_time = datetime.datetime.utcnow().isoformat() + "Z"

data = {
  "id": "EVAC-" + str(int(time.time())),
  "source": "MOBILE_APP",
  "location": "Near Highway 109, Community Center",
  "lat": 30.3165,
  "lng": 78.0322,
  "description": "Evacuation required. Smoke heavily obscuring visibility on Main Road. Evacuation plan initiated towards Community Center.",
  "status": "PENDING",
  "timestamp": current_time,
  "severity": "HIGH",
  "reporter": {
    "name": "Local Coordinator",
    "phone": "+91-9876543210"
  },
  "evacuation_plan_ref": "-P3Cy9e-8AJe6rakEkXm"
}

try:
    response = requests.post(url, json=data)
    print("Seed Status:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", e)
