import joblib
import numpy as np

# Global variables to hold the models in memory
model = None
scaler = None
encoder = None


def load_ml_assets():
    """Loads the model, scaler, and encoder into memory."""
    global model, scaler, encoder
    try:
        model = joblib.load('sonic_dna_xgb_full.pkl')
        scaler = joblib.load('sonic_dna_scaler_full.pkl')
        encoder = joblib.load('sonic_dna_label_encoder_full.pkl')
        print("✅ ML Assets loaded successfully.")
    except Exception as e:
        print(f"❌ Error loading ML assets: {e}")


def predict_vibe(feature_vector):
    """Scales the 518-feature array and returns the predicted genre string and probability."""
    # Reshape for sklearn (1 sample, 518 features)
    X_input = feature_vector.reshape(1, -1)

    # Scale the data
    X_scaled = scaler.transform(X_input)

    # Get probabilities and prediction
    probabilities = model.predict_proba(X_scaled)[0]
    predicted_index = np.argmax(probabilities)
    confidence = probabilities[predicted_index]

    # Decode to string (e.g., "Rock")
    predicted_genre = encoder.inverse_transform([predicted_index])[0]

    return predicted_genre, round(float(confidence), 4)