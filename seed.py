import json
import requests
import datetime

url = "https://firesafe-48056-default-rtdb.firebaseio.com/evacuation_plans.json"

data = {
  "plan_type": "Emergency Evacuation Plan",
  "generatedAt": "2026-10-05T02:35:14Z",
  "route": "Main Road -> Highway 109 -> Community Center",
  "distance": "2.3 km",
  "estimated_time": "8 minutes",
  "safe_zone": {
    "name": "Community Center",
    "capacity": 200,
    "status": "Available"
  },
  "emergency_contacts": {
    "Fire Department": "101",
    "Police": "100",
    "Ambulance": "108"
  },
  "raw_text": """Emergency Evacuation Plan

Generated: 05/10/2026, 02:35:14

Route: Main Road → Highway 109 → Community Center
Distance: 2.3 km
Estimated Time: 8 minutes

Safe Zone: Community Center
Capacity: 200 people
Status: Available

Emergency Contacts:
Fire Department: 101
Police: 100
Ambulance: 108"""
}

try:
    # Post to Firebase
    response = requests.post(url, json=data)
    print("Seed Status:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", e)
