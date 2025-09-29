
## 📖 `README.md`

```markdown
# 🌾 Farmtrust AI

Farmtrust AI is an **AI-powered agricultural assistant** that helps farmers with:  

- 🌱 **Plant disease diagnosis** from leaf images  
- 🐄 **Livestock disease detection** from reported symptoms  
- 💰 **Fair price suggestions** for agricultural produce  
- 🤝 **Trust scoring** for buyers/sellers in the supply chain  

Built with **FastAPI**, **scikit-learn**, and optional **Gemini AI fallback**.

---

## 🚀 Features

1. **Plant Diagnosis**
   - Upload a plant leaf image (`/plant-diagnosis`)  
   - Returns: diagnosis, confidence, suggested treatment  

2. **Livestock Diagnosis**
   - Send `{animal, symptoms}` JSON (`/livestock-diagnosis`)  
   - Uses Kaggle dataset (`livestock-symptoms-and-diseases`)  
   - Supports multiple symptom fields (e.g., "symptom 1", "symptom 2")  

3. **Price Suggestion**
   - Predicts fair price for farm products (`/price-suggestion`)  

4. **Trust Score**
   - Evaluates reliability of sellers/buyers (`/trust-score`)  

---

## 📂 Project Structure

```

farmtrust_ai/
│── ai_service.py        # FastAPI app with endpoints
│── requirements.txt     # Dependencies
│── README.md            # Project documentation
│
├── services/            # Business logic for plant & livestock health
│   ├── plant_health.py
│   ├── livestock_health.py
│   └── gemini_client.py
│
├── models/              # Trained models (ignored in git if large)
│   ├── plant_model.pkl
│   ├── livestock_model.pkl
│   ├── price_model.pkl
│   └── trust_model.pkl
│
├── trainers/            # Training scripts (ignored in git)
│   ├── train_livestock.py
│   ├── train_plant.py
│
├── notebooks/           # Jupyter notebooks (ignored in git)
├── logs/                # Training logs (ignored in git)
├── utils/               # Utility scripts
└── venv/                # Python virtual environment

````

---

## ⚙️ Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd farmtrust_ai

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
````

---

## ▶️ Running the API

```bash
uvicorn ai_service:app --reload
```

* Open interactive API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 📦 Dependencies

Main libraries used:

* [FastAPI](https://fastapi.tiangolo.com/) – API framework
* [Uvicorn](https://www.uvicorn.org/) – ASGI server
* [scikit-learn](https://scikit-learn.org/) – ML models
* [Pandas](https://pandas.pydata.org/) & [NumPy](https://numpy.org/) – Data handling
* [Joblib](https://joblib.readthedocs.io/) – Model persistence
* [Pillow](https://python-pillow.org/) – Image processing
* [KaggleHub](https://github.com/Kaggle/kagglehub) – Dataset access

---

## 🧪 Example Requests

### Plant Diagnosis

```bash
curl -X POST "http://127.0.0.1:8000/plant-diagnosis" \
  -F "image=@leaf.jpg"
```

### Livestock Diagnosis

```bash
curl -X POST "http://127.0.0.1:8000/livestock-diagnosis" \
  -H "Content-Type: application/json" \
  -d '{"animal":"cow", "symptoms":"coughing, fever"}'
```

### Price Suggestion

```bash
curl -X POST "http://127.0.0.1:8000/price-suggestion" \
  -H "Content-Type: application/json" \
  -d '{"product_name":"Maize", "description":"Dry yellow maize", "harvest_date":"2025-09-20", "origin":"Kenya", "quantity":50}'
```

---

## 📊 Model Training

* **Datasets**:

  * Plant: PlantVillage
  * Livestock: [Livestock Symptoms & Diseases (Kaggle)](https://www.kaggle.com/datasets/researcher1548/livestock-symptoms-and-diseases)
  * Market: Historical price data

* **Scripts**:

  * `trainers/train_livestock.py` → trains livestock NLP model
  * `trainers/train_plant.py` → trains plant disease classifier

* **Artifacts**: Saved under `/models/`.

---

## 📌 Notes

* If a model (`plant_model.pkl`, `livestock_model.pkl`) is missing, the system falls back to **Gemini AI reasoning**.
* Ensure you have a valid `kaggle.json` API key if pulling datasets from Kaggle.
* Multiple symptom columns are merged automatically (`symptom 1 + symptom 2 + symptom 3`).

---

## 🛠️ Roadmap

* [ ] Train CNN for **plant disease classification**
* [ ] Expand livestock dataset and fine-tune NLP model
* [ ] Deploy API via **Docker + Cloud Run**
* [ ] Build **mobile app integration** for farmers

---

## 📜 License

MIT License – feel free to use and improve 🚀

```

---

