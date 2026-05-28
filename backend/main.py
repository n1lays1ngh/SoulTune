from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from audio_processor import extract_audio_features
from ml_inference import load_ml_assets, predict_vibe
from genai_translator import generate_dna_profile

# Initialize App
app = FastAPI(title="SonicDNA Backend API", version="1.0")

# Setup CORS so the React frontend can talk to it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load the ML models on startup
@app.on_event("startup")
async def startup_event():
    load_ml_assets()


# Background task to delete the audio file after processing
def cleanup_temp_file(file_path: str):
    if os.path.exists(file_path):
        os.remove(file_path)


@app.get('/')
async def health():
    return {
        'server':'ok'
    }

@app.post("/api/v1/analyze-audio")
async def analyze_audio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # 1. Validate file type
    if not file.filename.endswith(('.mp3', '.wav')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload .mp3 or .wav")

    # 2. Save file temporarily
    temp_filename = f"temp_{uuid.uuid4().hex}_{file.filename}"
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 3. DSP Extraction
        feature_vector, frontend_metrics = extract_audio_features(temp_filename)

        if len(feature_vector) != 518:
            raise HTTPException(status_code=500, detail="DSP Extraction failed to produce 518 features.")

        # 4. ML Inference
        genre, confidence = predict_vibe(feature_vector)

        poetic_dna = generate_dna_profile(genre, frontend_metrics)

        # 5. Clean up the temp file in the background so the API returns instantly
        background_tasks.add_task(cleanup_temp_file, temp_filename)

        # 6. Return the perfectly structured payload
        return {
            "status": "success",
            "data": {
                "ml_prediction": {
                    "genre": genre,
                    "confidence": confidence
                },
                "dsp_metrics": frontend_metrics,
                "sonic_dna_profile": poetic_dna  # <-- ADDED TO PAYLOAD
            }
        }

    except Exception as e:
        # Ensure cleanup happens even if something crashes
        cleanup_temp_file(temp_filename)
        raise HTTPException(status_code=500, detail=str(e))


