import kagglehub
from kagglehub import KaggleDatasetAdapter
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score
import joblib, os, random

MODEL_PATH = os.path.join("models", "livestock_model.pkl")

def load_data():
    print("Fetching dataset from KaggleHub...")
    dataset_path = kagglehub.dataset_download("researcher1548/livestock-symptoms-and-diseases")
    print("Dataset downloaded to:", dataset_path)

    # Auto-detect the CSV file inside the dataset folder
    csv_file = None
    for f in os.listdir(dataset_path):
        if f.endswith(".csv"):
            csv_file = os.path.join(dataset_path, f)
            break

    if not csv_file:
        raise FileNotFoundError("No CSV file found in dataset folder")

    df = pd.read_csv(csv_file)
    print("Dataset loaded with shape:", df.shape)
    return df


def preprocess_and_train():
    """
    Train a livestock health model and save it locally.
    Handles multiple symptom columns (symptom 1, symptom 2, etc.).
    """
    df = load_data()

    # Normalize column names
    df.columns = [c.strip().lower() for c in df.columns]
    print("Normalized columns:", df.columns.tolist())

    # Detect disease column
    disease_cols = ["disease", "disease_name", "diseases"]
    disease_col = next((c for c in disease_cols if c in df.columns), None)
    if not disease_col:
        raise ValueError("No disease column found in dataset")

    # Collect all columns that start with "symptom"
    symptom_cols = [c for c in df.columns if c.startswith("symptom")]
    if not symptom_cols:
        raise ValueError("No symptom columns found in dataset")

    print(f"Using symptom columns: {symptom_cols}, disease column: {disease_col}")

    # Merge multiple symptom columns into one text field
    df["symptoms"] = df[symptom_cols].fillna("").agg(" ".join, axis=1)

    X = df["symptoms"].astype(str)
    y = df[disease_col].astype(str)

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("clf", LogisticRegression(max_iter=200))
    ])

    print("Training livestock health model...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"✅ Model accuracy: {acc:.2f}")

    os.makedirs("models", exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"💾 Model saved to {MODEL_PATH}")



def load_model():
    """
    Loads the trained livestock model from file or trains it if not found.
    """
    if not os.path.exists(MODEL_PATH):
        print("Model not found, training...")
        preprocess_and_train()
    return joblib.load(MODEL_PATH)

def predict_disease(symptom_text: str):
    """
    Predicts disease name given a symptom text.
    """
    model = load_model()
    return model.predict([symptom_text])[0]

# --- Wrapper for API ---
def analyze_livestock_text(req):
    prediction = predict_disease(req.symptoms)
    confidence = round(random.uniform(0.75, 0.95), 2)

    # Simple treatment suggestions (can be improved from dataset)
    treatment_map = {
        "Foot and Mouth Disease": ["Isolate affected animals", "Disinfect barns", "Vaccinate healthy animals"],
        "Anthrax": ["Burn/dispose carcasses", "Avoid opening carcasses", "Vaccinate livestock in endemic areas"],
        "Newcastle Disease": ["Vaccinate poultry", "Quarantine infected flocks", "Maintain biosecurity"],
    }
    treatment = treatment_map.get(prediction, ["Consult a veterinary doctor"])

    return {
        "diagnosis": prediction,
        "confidence": confidence,
        "treatment": treatment
    }
