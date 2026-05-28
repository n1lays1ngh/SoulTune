import librosa
import numpy as np
from scipy import stats
import warnings

# Suppress librosa's PySoundFile warnings for mp3s
warnings.filterwarnings('ignore')


def compute_statistics(feature_matrix):
    """
    Calculates the 7 FMA statistics across a feature matrix.
    Order: kurtosis, max, mean, median, min, skew, std.
    """
    kurtosis = stats.kurtosis(feature_matrix, axis=1)
    maximum = np.max(feature_matrix, axis=1)
    mean = np.mean(feature_matrix, axis=1)
    median = np.median(feature_matrix, axis=1)
    minimum = np.min(feature_matrix, axis=1)
    skewness = stats.skew(feature_matrix, axis=1)
    std = np.std(feature_matrix, axis=1)

    return np.concatenate([kurtosis, maximum, mean, median, minimum, skewness, std])


def extract_audio_features(file_path):
    """
    Loads audio, extracts 518 features, and returns frontend metrics.
    """
    # 1. Load exactly 30 seconds at 22050 Hz
    y, sr = librosa.load(file_path, sr=22050, duration=30.0)

    # 2. Extract Base Features
    stft = np.abs(librosa.stft(y, n_fft=2048, hop_length=512))

    chroma_stft = librosa.feature.chroma_stft(S=stft, sr=sr)
    chroma_cqt = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_cens = librosa.feature.chroma_cens(y=y, sr=sr)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    rmse = librosa.feature.rms(S=stft)
    spec_cent = librosa.feature.spectral_centroid(S=stft, sr=sr)
    spec_bw = librosa.feature.spectral_bandwidth(S=stft, sr=sr)
    spec_contrast = librosa.feature.spectral_contrast(S=stft, sr=sr)
    spec_rolloff = librosa.feature.spectral_rolloff(S=stft, sr=sr)
    tonnetz = librosa.feature.tonnetz(y=librosa.effects.harmonic(y), sr=sr)
    zcr = librosa.feature.zero_crossing_rate(y)

    # 3. Compute Statistics (Strict Order Required)
    features = []
    feature_list = [chroma_cens, chroma_cqt, chroma_stft, mfcc, rmse,
                    spec_bw, spec_cent, spec_contrast, spec_rolloff, tonnetz, zcr]

    for feature in feature_list:
        features.append(compute_statistics(feature))

    final_feature_vector = np.concatenate(features)

    # 4. Extract clean frontend metrics for the p5.js Mandala
    # 4. Extract clean frontend metrics for the p5.js Mandala
    bpm, _ = librosa.beat.beat_track(y=y, sr=sr)

    # SAFELY handle the Librosa version difference (extracts the number if it's trapped in an array)
    bpm_value = bpm[0] if isinstance(bpm, np.ndarray) else bpm

    frontend_metrics = {
        "bpm": round(float(bpm_value), 2),
        "energy_rmse": round(float(np.mean(rmse)), 4),
        "brightness_centroid": round(float(np.mean(spec_cent)), 2),
        "mfcc_vector": [round(float(x), 2) for x in np.mean(mfcc, axis=1)[:3]]
    }

    return final_feature_vector, frontend_metrics