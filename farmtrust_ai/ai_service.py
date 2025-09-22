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
    delivery_rate: float
    rating: float
    transactions: int

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
        # Our training used [quantity, description_length]
        features = [[req.quantity, len(req.description)]]
        suggested = float(price_model.predict(features)[0])
        confidence = 0.9  # You can later replace with model uncertainty
    else:
        # Dummy fallback if model is missing
        suggested = round(len(req.description) * 0.5 + req.quantity * 0.2 + random.uniform(-5, 5), 2)
        confidence = round(random.uniform(0.7, 0.95), 2)

    return {"suggested_price": suggested, "confidence": confidence}


@app.post("/trust-score", response_model=TrustResponse)
def trust_score(req: TrustRequest):
    if trust_model:
        # Our trust model training used [delivery_rate, rating, transactions]
        features = [[req.delivery_rate, req.rating, req.transactions]]
        probas = trust_model.predict_proba(features)[0]
        # probability of being trustworthy (class 1)
        score = float(probas[1]) if len(probas) > 1 else float(trust_model.predict(features)[0])
        factors = {
            "delivery_rate": req.delivery_rate,
            "rating": req.rating,
            "transactions": req.transactions
        }
    else:
        # Dummy fallback
        score = round(random.uniform(0.6, 0.98), 2)
        factors = {
            "delivery_rate": round(random.uniform(50, 100), 2),
            "rating": round(random.uniform(3, 5), 2),
            "transactions": random.randint(10, 100)
        }

    return {"trust_score": score, "factors": factors}
