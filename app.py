import os
import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from database import get_db_connection
# NEW IMPORT FOR FRONTEND CONNECTIVITY
from fastapi.middleware.cors import CORSMiddleware

# ==========================================
# 🌲 PHASE 1: AUTOMATIC ML MODEL LIFECYCLE
# ==========================================
MODEL_FILE = "model.pkl"

if not os.path.exists(MODEL_FILE):
    print("🎲 'model.pkl' not found. Launching data factory to train model...")
    from sklearn.ensemble import IsolationForest
    np.random.seed(42)
    
    # Generate 1,000 normal transactions grouped around an average of $150
    normal_amounts = np.random.normal(loc=150, scale=80, size=1000)
    normal_amounts = np.clip(normal_amounts, 10, 500) 
    
    # Inject 30 extreme anomalies between $2,000 and $10,000
    outlier_amounts = np.random.uniform(low=2000, high=10000, size=30)
    
    # Combine them into a single dataframe grid
    all_amounts = np.concatenate([normal_amounts, outlier_amounts])
    df = pd.DataFrame(all_amounts, columns=['amount'])
    
    # Train the Isolation Forest outlier detector
    model = IsolationForest(contamination=0.03, random_state=42)
    model.fit(df[['amount']])
    
    # Freeze the trained model into a binary file
    with open(MODEL_FILE, "wb") as f:
        pickle.dump(model, f)
    print("✅ Success: Machine Learning brain trained and saved to disk!")

# ==========================================
# ⚡ PHASE 2: INITIALIZE WEBSERVER & LOAD BRAIN
# ==========================================
app = FastAPI(title="Real-Time Transaction Risk Engine")

# --- NEW: ENABLE SECURE FRONTEND DATA LINKING ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows your native index.html file to request data streams
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load our frozen ML model directly into memory
with open(MODEL_FILE, "rb") as f:
    ml_model = pickle.load(f)
print("🌲 Machine Learning engine successfully loaded into API gateway memory!")

# Define the incoming data verification schema using Pydantic
class TransactionRequest(BaseModel):
    user_id: int
    amount: float
    location: str = "Unknown"
    merchant_category: str = "General"
    device_type: str = "Unknown"

# ==========================================
# 📬 PHASE 3: LIVE PREDICTION & STORAGE ROUTE
# ==========================================
@app.post("/predict")
def process_transaction(tx: TransactionRequest):
    try:
        # Format raw input number into a pandas dataframe matrix layout
        input_data = pd.DataFrame([[tx.amount]], columns=['amount'])
        
        # Generate outlier prediction (-1 = anomaly, 1 = normal)
        prediction = ml_model.predict(input_data)[0]
        is_anomaly = True if prediction == -1 else False
        
        # Normalize raw decision score into a human-readable 0.0 - 1.0 scale
        raw_score = ml_model.score_samples(input_data)[0]
        risk_score = float(np.clip(1.0 - (raw_score + 0.5) * 2, 0.0, 1.0))
        
        # Open connection stream to our local SQLite database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Note: SQLite uses '?' placeholders instead of '%s'
        insert_query = """
        INSERT INTO transactions (user_id, amount, location, merchant_category, device_type, risk_score, is_anomaly)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """
        
        # Convert boolean to integer for standard SQLite storage compatibilities (1=True, 0=False)
        cursor.execute(insert_query, (
            tx.user_id, tx.amount, tx.location, tx.merchant_category, tx.device_type, risk_score, 1 if is_anomaly else 0
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "status": "Processed",
            "risk_score": round(risk_score, 2),
            "is_anomaly": is_anomaly,
            "action_taken": "BLOCK & ALERT" if is_anomaly else "APPROVE"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Engine Error: {str(e)}")

# ==========================================
# 📡 NEW PHASE 4: TELEMETRY RETRIEVAL FOR WEB UI
# ==========================================
@app.get("/transactions")
def get_transactions():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # --- FIXED: Fetch all logs so your counters show the full history ---
        cursor.execute("SELECT * FROM transactions ORDER BY id DESC;")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database Read Error: {str(e)}")
