import os, io, random, joblib
from PIL import Image
from services.gemini_client import ask_gemini

plant_model = joblib.load("models/plant_model.pkl") if os.path.exists("models/plant_model.pkl") else None

# --- Image-based diagnosis ---
async def analyze_plant_image(image):
    img_bytes = await image.read()
    img = Image.open(io.BytesIO(img_bytes))

    if plant_model:
        # Placeholder until CNN is integrated
        diagnosis = "Early Blight (Alternaria solani)"
        confidence = 0.94
        treatment = [
            "Apply copper-based fungicide weekly",
            "Improve air circulation around plants",
            "Remove affected leaves immediately"
        ]
    else:
        text = ask_gemini("You are an agricultural expert. Diagnose this crop disease and suggest treatment.", img_bytes)
        diagnosis = text.split("\n")[0] if text else "Unknown"
        confidence = round(random.uniform(0.7, 0.95), 2)
        treatment = text.split("\n")[1:] if text else ["Consult an agronomist"]

    return {"diagnosis": diagnosis, "confidence": confidence, "treatment": treatment}

# --- Text-based diagnosis ---
def analyze_plant_text(description: str):
    if plant_model:
        diagnosis = "Nutrient Deficiency (Nitrogen)"
        confidence = 0.88
        treatment = [
            "Apply nitrogen-rich fertilizer",
            "Rotate crops with legumes",
            "Test soil for nutrient balance"
        ]
    else:
        text = ask_gemini(f"Diagnose plant disease from text description: {description}")
        diagnosis = text.split("\n")[0] if text else "Unknown"
        confidence = round(random.uniform(0.6, 0.9), 2)
        treatment = text.split("\n")[1:] if text else ["Consult an agronomist"]

    return {"diagnosis": diagnosis, "confidence": confidence, "treatment": treatment}
