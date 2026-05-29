 <div align="center">

# ✦ SonicDNA

### *See the Soul of Your Sound*

A full-stack AI audio analysis pipeline that extracts physical audio features, classifies genre with machine learning, and generates a living generative art portrait — unique to every song.

<br/>

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-a8d8f0?style=for-the-badge)

<br/>

> Upload any `.mp3` or `.wav` file. SonicDNA extracts its soul — returning genre, energy metrics, a poetic profile written by Gemini, and a **living, breathing generative mandala** that is mathematically unique to that song's DSP signature.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [DSP Metrics Explained](#-dsp-metrics-explained)
- [Mandala Visual Mappings](#-mandala-visual-mappings)
- [Genre Colour Palettes](#-genre-colour-palettes)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌌 Overview

SonicDNA is a two-part application:

**Backend** — A FastAPI service that accepts an audio file and runs it through a three-stage pipeline:
1. **DSP Extraction** via `Librosa` — pulls raw physical properties: tempo, energy, and tonal brightness.
2. **Genre Classification** via a trained `XGBoost` model — predicts the dominant genre with a confidence score.
3. **Poetic Profile Generation** via the **Gemini LLM** — translates the numbers into lyrical, human-readable prose.

**Frontend** — An ethereal React application with glassmorphism UI, framer-motion page transitions, and a `react-p5` generative art engine that renders a continuously-animated mandala whose every visual property is deterministically driven by the song's data.

---

## ✨ Features

- 🎵 **Audio Upload** — Drag-and-drop or click-to-select `.mp3` / `.wav` files
- 🤖 **AI Genre Classification** — XGBoost model with confidence percentage
- 📊 **DSP Metrics** — BPM, kinetic energy (RMSE), and tonal brightness (spectral centroid)
- ✍️ **AI Poetic Profile** — Gemini LLM generates a unique prose description for each song
- 🎨 **Living Mandala** — A `react-p5` generative art engine; 9 visual layers, 60fps, fully animated
- 🌊 **Ethereal UI** — Glassmorphism panels, framer-motion soul transitions, star field, breathing CTA
- 📱 **Responsive Layout** — Single-column on mobile, split-view on desktop
- ♻️ **Stateless & Fast** — No database; each analysis is a fresh pipeline run

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| API Framework | FastAPI |
| DSP Analysis | Librosa |
| Genre Classification | XGBoost |
| LLM Profile Generation | Google Gemini API |
| Audio Processing | NumPy, SciPy |
| Server | Uvicorn |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | react-router-dom |
| Animations & Transitions | framer-motion |
| HTTP Client | Axios |
| Generative Art | react-p5 (p5.js) |
| Styling | Pure CSS (custom design system) |

---

## 📁 Project Structure

```
SonicDNA/
│
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── routers/
│   │   └── audio.py             # /api/v1/analyze-audio endpoint
│   ├── services/
│   │   ├── dsp_service.py       # Librosa feature extraction
│   │   ├── ml_service.py        # XGBoost genre classification
│   │   └── llm_service.py       # Gemini profile generation
│   ├── models/
│   │   └── genre_model.pkl      # Trained XGBoost model
│   ├── requirements.txt
│   └── .env                     # GEMINI_API_KEY goes here
│
└── frontend/
    ├── index.html               # Add Google Fonts link here
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx              # Router + AnimatePresence
        ├── index.css            # Full design system (CSS variables, animations)
        ├── pages/
        │   ├── LandingPage.jsx  # Hero section with star field + CTA
        │   └── Dashboard.jsx    # Upload, loader, results split-view
        └── components/
            └── Mandala.jsx      # react-p5 generative art engine (9 layers)
```

---

## ⚙️ How It Works

```
┌─────────────┐     multipart/form-data      ┌──────────────────────────────────────┐
│             │ ──────────────────────────→  │          FastAPI Backend             │
│  React App  │                              │                                      │
│  (Vite)     │                              │  1. Librosa DSP Extraction           │
│             │                              │     → bpm, energy_rmse,              │
│  Upload UI  │                              │       brightness_centroid            │
│  Mandala    │ ←──────────────────────────  │                                      │
│  Results    │        JSON response         │  2. XGBoost Genre Classifier         │
│             │                              │     → genre, confidence              │
└─────────────┘                              │                                      │
                                             │  3. Gemini LLM                       │
                                             │     → sonic_dna_profile (prose)      │
                                             └──────────────────────────────────────┘
```

The frontend never stores data. Each component renders deterministically from the JSON payload — the same song always produces the same mandala.

---

## 🚀 Getting Started

### Prerequisites

- Python **3.10+**
- Node.js **18+**
- A **Google Gemini API key** — get one free at [aistudio.google.com](https://aistudio.google.com)

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate       # macOS / Linux
# venv\Scripts\activate        # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env

# 5. Start the FastAPI server
uvicorn main:app --reload --port 8000
```

The API will be live at `http://127.0.0.1:8000`
Interactive docs at `http://127.0.0.1:8000/docs`

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install all dependencies
npm install

# 3. Add the Google Fonts link to index.html inside <head>:
#
#   <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;900
#   &family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400
#   &display=swap" rel="stylesheet">

# 4. Start the development server
npm run dev
```

The app will be live at `http://localhost:5173`

> **Note:** Make sure the backend is running on port `8000` before uploading a file. The frontend calls `http://127.0.0.1:8000/api/v1/analyze-audio` directly.

---

## 🔐 Environment Variables

### Backend — `backend/.env`

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |

---

## 📡 API Reference

### `POST /api/v1/analyze-audio`

Accepts an audio file and returns the full SonicDNA analysis.

**Request**

```
Content-Type: multipart/form-data
Body:
  file: <binary audio file>   (.mp3 or .wav)
```

**Success Response** `200 OK`

```json
{
  "status": "success",
  "data": {
    "ml_prediction": {
      "genre": "Electronic",
      "confidence": 0.8742
    },
    "dsp_metrics": {
      "bpm": 128.0,
      "energy_rmse": 0.4123,
      "brightness_centroid": 3201.45
    },
    "sonic_dna_profile": "A poetic string describing the sonic character of the song."
  }
}
```

**Error Response** `422 / 500`

```json
{
  "status": "error",
  "detail": "Unsupported file format. Please upload .mp3 or .wav"
}
```

---

## 📐 DSP Metrics Explained

| Metric | Librosa Feature | What It Represents |
|---|---|---|
| `bpm` | `beat.beat_track()` | The tempo of the track in beats per minute |
| `energy_rmse` | `feature.rms()` | Root Mean Square Energy — how loud/energetic the track is. Range roughly `0.01` (silence) to `1.0` (full energy) |
| `brightness_centroid` | `feature.spectral_centroid()` | The "centre of mass" of the frequency spectrum in Hz. Low values = warm/dark sound. High values = bright/sharp sound |

---

## 🎨 Mandala Visual Mappings

The `Mandala.jsx` component translates DSP data directly into visual properties. The same song always produces the same mandala — different songs will always look distinctly different.

| DSP Property | Visual Effect |
|---|---|
| **BPM** (tempo) | Rotation speed of all petal layers and orbit dots. Fast songs spin quickly; slow songs drift gently |
| **Energy RMSE** | Outer aura radius. High energy → large, expansive mandala. Minimum radius locked at 150px so even quiet songs look rich |
| **Brightness Centroid** | Petal count, inner petal multiplier, and spoke count. Bright/sharp sounds → more complex, intricate geometry. Warm/dark sounds → fewer, wider petals |
| **Genre** | Entire 5-hue colour system. Each genre maps to 3 base hues; the engine derives a complementary hue (+180°) and a triadic hue (+120°) automatically |

### 9 Visual Layers (render order)

```
Layer 1 — Outer halo rings          (5 rings, one per hue, breathing)
Layer 2 — Primary petal arms        (co-rotating, full radius, sin-envelope width)
Layer 3 — Secondary petals          (counter-rotating, 52% radius, offset by half-step)
Layer 4 — Outer orbit dots          (2× petal count, 78% radius, with halo glow)
Layer 5 — Inner orbit dots          (counter-orbit, 48% radius)
Layer 6 — Starburst spokes          (two sets: co-rotate + counter-rotate)
Layer 7 — Geometric polygon rings   (3 rotating n-gons matching petal symmetry)
Layer 8 — Multi-hue glowing core    (6 concentric ellipses, white-hot centre)
Layer 9 — Golden-ratio particle dust (80 particles at φ=137.5° increments)
```

---

## 🎼 Genre Colour Palettes

| Genre | Primary Hues | Character |
|---|---|---|
| Electronic | Cyan → Blue → Violet | Cool, electric, deep space |
| Classical | Amber → Warm Gold | Warm, gilded, timeless |
| Jazz | Burnt Orange → Gold | Rich, smoky, amber-lit |
| Hip-Hop / Rap | Purple → Magenta → Rose | Deep, bold, neon night |
| Rock | Crimson → Steel Blue | Electric contrast |
| Metal | Blood Red → Ice Blue | Extreme contrast |
| Pop | Magenta → Pink → Rose | Bright, saturated, vivid |
| Ambient | Teal → Sky Blue | Airy, oceanic, calm |
| R&B / Soul | Violet → Magenta → Peach | Velvet, sensual, warm |
| Blues | Steel Blue → Slate | Deep, resonant, indigo |
| Latin | Coral → Orange → Gold | Vibrant, hot, sun-drenched |
| Instrumental | Teal → Cerulean → Periwinkle | Balanced, expressive |

> All genre palettes automatically generate a **complementary hue** (+180°) and a **triadic hue** (+120°) from the 3 base hues, giving each mandala 5 distinct simultaneous colours.

---

## 🤝 Contributing

Contributions are welcome. To contribute:

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature description"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

**Areas open for contribution:**
- Additional DSP features (e.g. zero-crossing rate, chroma, MFCCs)
- Improved XGBoost model or replacement with a deep learning classifier
- Export mandala as PNG/SVG
- Audio waveform visualisation during upload
- Offline mode (local LLM instead of Gemini)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ✦ and `framer-motion`

*Every song has a soul. SonicDNA shows you what it looks like.*

</div>
