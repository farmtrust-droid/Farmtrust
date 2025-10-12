import os
import google.generativeai as genai

# Load key from env
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def ask_gemini(prompt, image_bytes=None):
    model = genai.GenerativeModel("gemini-1.5-flash")
    if image_bytes:
        response = model.generate_content([prompt, image_bytes])
    else:
        response = model.generate_content(prompt)
    return response.text if response else "No response"
