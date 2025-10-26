import os
import google.generativeai as genai

# Load key from environment variable
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def ask_gemini(prompt: str, image_bytes: bytes = None) -> str:
    """
    Query Gemini API for text or multimodal response.
    """
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        if image_bytes:
            response = model.generate_content([prompt, image_bytes])
        else:
            response = model.generate_content(prompt)

        return response.text if response else "No response"
    except Exception as e:
        print("⚠️ Gemini API error:", e)
        return "Gemini API error"
