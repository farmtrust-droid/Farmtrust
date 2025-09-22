from fastapi import FastAPI
from pydantic import BaseModel
import joblib, os, random

app = FastAPI()

# --- Request/Response Models ---
class ProductRequest(BaseModel):
    product_name: str
    description: str
    harvest_date: str
    origin: str
    quantity: float
    price: float | None = None

class PriceResponse(BaseModel):
    suggested_price: float
    confidence: float

class TrustRequest(BaseModel):
    farmer_id: str

class TrustResponse(BaseModel):
    trust_score: float
    factors: dict

# --- Load Models if available ---
price_model = None
trust_model = None

if os.path.exists("models/price_model.pkl"):
    price_model = joblib.load("models/price_model.pkl")

if os.path.exists("models/trust_model.pkl"):
    trust_model = joblib.load("models/trust_model.pkl")

# --- Endpoints ---
@app.post("/price-suggestion", response_model=PriceResponse)
def price_suggestion(req: ProductRequest):
    if price_model:
        # Example: model expects [quantity, len(description)]
        features = [[req.quantity, len(req.description)]]
        suggested = float(price_model.predict(features)[0])
        confidence = 0.9
    else:
        # Dummy fallback
        suggested = round(len(req.description) * 0.5 + req.quantity * 0.2 + random.uniform(-5, 5), 2)
        confidence = round(random.uniform(0.7, 0.95), 2)

    return {"suggested_price": suggested, "confidence": confidence}

@app.post("/trust-score", response_model=TrustResponse)
def trust_score(req: TrustRequest):
    if trust_model:
        # Example: trust model logic
        score = float(trust_model.predict([[random.randint(1, 50)]])[0])
        factors = {"past_transactions": 42, "late_deliveries": 3, "buyer_ratings": 4.5}
    else:
        # Dummy fallback
        score = round(random.uniform(0.6, 0.98), 2)
        factors = {"past_transactions": random.randint(10, 100),
                   "late_deliveries": random.randint(0, 5),
                   "buyer_ratings": round(random.uniform(3, 5), 2)}

    return {"trust_score": score, "factors": factors}
