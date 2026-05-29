# Soultune

A small app that analyzes an uploaded audio file to produce a predicted genre, DSP metrics, and a poetic "sonic DNA" profile (via a generative model). The frontend is a Vite + React UI and the backend is a FastAPI service that performs DSP, ML inference, and LLM translation.

## Run Locally

Prerequisites:

- Python 3.10+ for the backend
- Node.js 18+ / npm for the frontend
- Place the ML artifacts in the `backend` folder:
  - `sonic_dna_xgb_full.pkl`
  - `sonic_dna_scaler_full.pkl`
  - `sonic_dna_label_encoder_full.pkl`
- Create `backend/.env` with `GEMINI_API_KEY` set to your key for the Gemini LLM translation.

Backend (from repo root):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
# ensure the model .pkl files are present in the backend folder
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
# Open the Vite dev URL (usually http://localhost:5173)
```

API endpoint used by the UI: `http://127.0.0.1:8000/api/v1/analyze-audio`.

Troubleshooting:

- If `librosa` audio loading fails on Windows, install the system dependency for soundfile or use `pip install soundfile`.
- If ML assets are missing, the backend will print an error when starting; place the `.pkl` files in `backend/`.

For more details, check the backend code at `backend/main.py` and the frontend pages at `frontend/src/pages/Dashboard.jsx`.
