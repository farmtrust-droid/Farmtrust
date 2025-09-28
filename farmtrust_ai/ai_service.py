from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import joblib, os, random
from services.plant_health import analyze_plant
from services.livestock_health import analyze_livestock

app = FastAPI(title="AI Agricultural Doctor")

# --- Load Models if available ---
price_model = joblib.load("models/price_model.pkl") if os.path.exists("models/price_model.pkl") else None
trust_model = joblib.load("models/trust_model.pkl") if os.path.exists("models/trust_model.pkl") else None

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

class DiagnosisResponse(BaseModel):
    diagnosis: str
    confidence: float
    treatment: list[str]

class LivestockRequest(BaseModel):
    animal: str
    symptoms: str

class LivestockResponse(BaseModel):
    diagnosis: str
    confidence: float
    treatment: list[str]

# --- Existing Endpoints ---
@app.post("/price-suggestion", response_model=PriceResponse)
def price_suggestion(req: ProductRequest):
    if price_model:
        features = [[req.quantity, len(req.description)]]
        suggested = float(price_model.predict(features)[0])
        confidence = 0.9
    else:
        suggested = round(len(req.description) * 0.5 + req.quantity * 0.2 + random.uniform(-5, 5), 2)
        confidence = round(random.uniform(0.7, 0.95), 2)
    return {"suggested_price": suggested, "confidence": confidence}

@app.post("/trust-score", response_model=TrustResponse)
def trust_score(req: TrustRequest):
    if trust_model:
        features = [[req.delivery_rate, req.rating, req.transactions]]
        probas = trust_model.predict_proba(features)[0]
        score = float(probas[1]) if len(probas) > 1 else float(trust_model.predict(features)[0])
        factors = {"delivery_rate": req.delivery_rate, "rating": req.rating, "transactions": req.transactions}
    else:
        score = round(random.uniform(0.6, 0.98), 2)
        factors = {"delivery_rate": round(random.uniform(50, 100), 2),
                   "rating": round(random.uniform(3, 5), 2),
                   "transactions": random.randint(10, 100)}
    return {"trust_score": score, "factors": factors}

# --- New Endpoints ---
@app.post("/plant-diagnosis", response_model=DiagnosisResponse)
async def plant_diagnosis(image: UploadFile = File(...)):
    return await analyze_plant(image)

@app.post("/livestock-diagnosis", response_model=LivestockResponse)
def livestock_diagnosis(req: LivestockRequest):
    return analyze_livestock(req)
