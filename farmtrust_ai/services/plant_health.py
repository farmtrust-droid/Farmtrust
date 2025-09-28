import os, io, random, joblib
from PIL import Image
from services.gemini_client import ask_gemini

plant_model = joblib.load("models/plant_model.pkl") if os.path.exists("models/plant_model.pkl") else None

async def analyze_plant(image):
    img_bytes = await image.read()
    img = Image.open(io.BytesIO(img_bytes))

    if plant_model:
        # 🔥 Replace with real CNN prediction later
        diagnosis = "Early Blight (Alternaria solani)"
        confidence = 0.94
        treatment = [
            "Apply copper-based fungicide weekly",
            "Improve air circulation around plants",
            "Remove affected leaves immediately"
        ]
    else:
        # Gemini fallback
        text = ask_gemini("You are an agricultural expert. Diagnose this crop disease and suggest treatment.", img_bytes)
        diagnosis = text.split("\n")[0] if text else "Unknown"
        confidence = 0.8
        treatment = text.split("\n")[1:] if text else ["Consult an agronomist"]

    return {"diagnosis": diagnosis, "confidence": confidence, "treatment": treatment}
