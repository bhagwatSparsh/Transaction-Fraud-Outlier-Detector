import time
import random
import requests

API_URL = "http://127.0.0.1:8000/predict"

CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Lucknow", "Chennai", "Kolkata"]
CATEGORIES = ["Food & Dining", "Luxury Retail", "Electronics", "Gas Station", "Streaming Services", "Crypto Exchange"]
DEVICES = ["Mobile iOS", "Mobile Android", "Web Chrome", "Web Safari", "ATM Terminal"]

print("⚡ Transaction Simulator Initialized. Press Ctrl+C to terminate.")
print("Streaming live transactional telemetry to the API gateway...")

while True:
    try:
        # 92% chance of a normal transaction, 8% chance of a massive fraudulent spike
        is_fraud_strike = random.random() < 0.08
        
        if is_fraud_strike:
            user_id = random.randint(9000, 9999)
            amount = round(random.uniform(1500.0, 9500.0), 2)
            location = "International Node"
            category = random.choice(["Crypto Exchange", "Luxury Retail"])
            device = "Unknown"
        else:
            user_id = random.randint(1000, 3999)
            # Normal distribution centered around standard retail costs
            amount = round(abs(random.normalvariate(120, 60)) + 10, 2)
            location = random.choice(CITIES)
            category = random.choice(CATEGORIES)
            device = random.choice(DEVICES)
            
        payload = {
            "user_id": user_id,
            "amount": amount,
            "location": location,
            "merchant_category": category,
            "device_type": device
        }
        
        # Stream the packet directly over the network to our FastAPI app
        response = requests.post(API_URL, json=payload)
        
        if response.status_code == 200:
            res_data = response.json()
            status_icon = "🚨 BLOCK" if res_data["is_anomaly"] else "✅ APPROVE"
            print(f"[{status_icon}] User {user_id} | ${amount:<7} | {location:<18} | Risk: {res_data['risk_score']:.2f}")
        else:
            print(f"❌ Server returned error code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("⚠️ Waiting for API Gateway... Make sure app.py is running on port 8000!")
        
    # Wait 2 seconds before streaming the next transactional event
    time.sleep(2)