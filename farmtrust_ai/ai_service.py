from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import joblib, os, random, pandas as pd, requests
from typing import Optional

# --- Service imports ---
from services.plant_health import analyze_plant_image, analyze_plant_text
from services.livestock_health import analyze_livestock_text
from services.gemini_client import ask_gemini

app = FastAPI(title="Farmtrust AI Doctor")

# --- Load Models if available ---
price_model = joblib.load("models/price_model.pkl") if os.path.exists("models/price_model.pkl") else None
trust_model = joblib.load("models/trust_model.pkl") if os.path.exists("models/trust_model.pkl") else None

# --- External Data Sources ---
FAO_AMIS_URL = "https://api.amis-outlook.org/public-prices"  # Placeholder FAO/FPMA API endpoint

def get_fao_price(product_name: str, origin: str):
    """
    Fetch baseline price from FAO AMIS or FPMA.
    If API fails, return a mock price.
    """
    try:
        resp = requests.get(FAO_AMIS_URL, params={"commodity": product_name, "country": origin}, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            # Adjust parsing based on FAO API schema
            return float(data.get("price", random.uniform(50, 200)))
    except Exception as e:
        print("⚠️ FAO API error:", e)

    # Fallback mock
    return round(random.uniform(50, 200), 2)

# --- Request/Response Models ---
class ProductRequest(BaseModel):
    product_name: str
    description: str
    origin: str
    quantity: float
    price: float | None = None
    harvest_date: Optional[str] = None

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

# --- Price Suggestion Endpoint (Blended) ---
@app.post("/price-suggestion", response_model=PriceResponse)
def price_suggestion(req: ProductRequest):
    # Step 1: FAO baseline
    fao_price = get_fao_price(req.product_name, req.origin)

    # Step 2: ML adjustment
    ml_price = None
    if price_model:
        # Pad with placeholders so model always receives 4 features
        features = [[
            req.quantity,
            len(req.description),
            0,   # placeholder for origin encoding
            0    # placeholder for harvest_date encoding
        ]]
        ml_price = float(price_model.predict(features)[0])

    # Step 3: Blend results
    if fao_price and ml_price:
        suggested = round(0.6 * fao_price + 0.3 * ml_price + 0.1 * random.uniform(-5, 5), 2)
        confidence = 0.9
    elif fao_price:
        suggested = fao_price
        confidence = 0.75
    elif ml_price:
        suggested = ml_price
        confidence = 0.8
    else:
        # Step 4: Gemini fallback
        prompt = (
            f"Suggest a fair market price for {req.quantity} kg of {req.product_name} "
            f"from {req.origin}, considering this description: {req.description}. "
            "Give only a numeric price value in USD."
        )
        gemini_price = ask_gemini(prompt)

        try:
            # Extract number from Gemini response
            suggested = float("".join([c for c in gemini_price if c.isdigit() or c == "."]))
            confidence = 0.7
        except:
            # Final fallback if Gemini returns text without a number
            suggested = round(random.uniform(40, 100), 2)
            confidence = 0.65

    return {"suggested_price": suggested, "confidence": confidence}

# --- Trust Score Endpoint ---
@app.post("/trust-score", response_model=TrustResponse)
def trust_score(req: TrustRequest):
    if trust_model:
        features = [[req.delivery_rate, req.rating, req.transactions]]
        probas = trust_model.predict_proba(features)[0]
        score = float(probas[1]) if len(probas) > 1 else float(trust_model.predict(features)[0])
        factors = {"delivery_rate": req.delivery_rate, "rating": req.rating, "transactions": req.transactions}
    else:
        score = round(random.uniform(0.6, 0.98), 2)
        factors = {
            "delivery_rate": round(random.uniform(50, 100), 2),
            "rating": round(random.uniform(3, 5), 2),
            "transactions": random.randint(10, 100)
        }
    return {"trust_score": score, "factors": factors}

# --- Plant Diagnosis (image or text) ---
@app.post("/plant-diagnosis", response_model=DiagnosisResponse)
async def plant_diagnosis(
    image: UploadFile = File(None),
    description: str = Form(None)
):
    if image:
        return await analyze_plant_image(image)
    elif description:
        return analyze_plant_text(description)
    else:
        return {"diagnosis": "No input provided", "confidence": 0.0, "treatment": ["Please upload an image or description"]}

# --- Livestock Diagnosis (CSV-based) ---
@app.post("/livestock-diagnosis", response_model=LivestockResponse)
def livestock_diagnosis(req: LivestockRequest):
    return analyze_livestock_text(req)
