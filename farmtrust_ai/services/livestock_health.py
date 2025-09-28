import os, random, joblib
from services.gemini_client import ask_gemini

livestock_model = joblib.load("models/livestock_model.pkl") if os.path.exists("models/livestock_model.pkl") else None

def analyze_livestock(req):
    if livestock_model:
        # 🔥 Replace with real NLP prediction later
        diagnosis = "Bovine Respiratory Disease"
        confidence = 0.88
        treatment = [
            "Administer prescribed antibiotics",
            "Ensure clean, dry housing",
            "Provide vitamin supplements"
        ]
    else:
        # Gemini fallback
        prompt = f"You are a veterinary expert. A {req.animal} shows these symptoms: {req.symptoms}. Diagnose and suggest treatment."
        text = ask_gemini(prompt)
        diagnosis = text.split("\n")[0] if text else "Unknown"
        confidence = 0.75
        treatment = text.split("\n")[1:] if text else ["Consult a veterinarian"]

    return {"diagnosis": diagnosis, "confidence": confidence, "treatment": treatment}
