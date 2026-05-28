// =====================================================
//  SonicDNA — Dashboard.jsx
//  Place at: src/pages/Dashboard.jsx
// =====================================================

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Mandala from '../components/Mandala';

const API_URL = 'http://127.0.0.1:8000/api/v1/analyze-audio';

// ── Page Variants ─────────────────────────────────────
const pageVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: 'blur(18px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: 'blur(18px)',
    transition: { duration: 0.7, ease: [0.4, 0, 1, 1] },
  },
};

// ── Ethereal Loader ───────────────────────────────────
// Three nested rings breathing at slightly offset rates.
// A bright core pulses at the centre.
function EtherealLoader() {
  const rings = [
    { size: 80,  delay: 0,    duration: 2.8 },
    { size: 128, delay: 0.35, duration: 3.4 },
    { size: 176, delay: 0.7,  duration: 4.0 },
  ];

  return (
    <motion.div
      className="ethereal-loader"
      key="loader"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.55 }}
    >
      <div className="loader-orb-container">
        {rings.map((r, i) => (
          <motion.div
            key={i}
            className="loader-ring"
            style={{ width: r.size, height: r.size }}
            animate={{
              scale:   [1, 1.18, 1],
              opacity: [0.55, 0.15, 0.55],
              rotate:  [0, i % 2 === 0 ? 360 : -360],
            }}
            transition={{
              duration:  r.duration,
              repeat:    Infinity,
              ease:      'easeInOut',
              delay:     r.delay,
            }}
          />
        ))}

        {/* Pulsing core */}
        <motion.div
          className="loader-core"
          animate={{ scale: [1, 1.3, 1], opacity: [0.95, 0.45, 0.95] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.p
        className="loader-text"
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        Connecting to the sonic ether...
      </motion.p>
    </motion.div>
  );
}

// ── Metric Row ────────────────────────────────────────
function MetricRow({ label, value }) {
  return (
    <div className="metric-row">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );
}

// ── Results Panel ─────────────────────────────────────
function ResultsPanel({ data }) {
  const { ml_prediction, dsp_metrics, sonic_dna_profile } = data;
  const confidencePct = (ml_prediction.confidence * 100).toFixed(1);

  const panelVariants = {
    hidden: { opacity: 0, x: -28, filter: 'blur(10px)' },
    visible: (delay) => ({
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.9, delay, ease: [0.4, 0, 0.2, 1] },
    }),
  };

  return (
    <motion.div
      className="results-container"
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Left: Text Data ── */}
      <div className="results-left">

        {/* Genre Card */}
        <motion.div
          className="glass-panel genre-panel"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          custom={0.1}
        >
          <p className="panel-label">✦ Dominant Genre</p>
          <h2 className="genre-title">{ml_prediction.genre}</h2>

          <div className="confidence-bar-track">
            <motion.div
              className="confidence-bar-fill"
              initial={{ width: '0%' }}
              animate={{ width: `${confidencePct}%` }}
              transition={{ duration: 1.6, delay: 0.4, ease: 'easeOut' }}
            />
          </div>
          <span className="confidence-label">{confidencePct}% confidence</span>
        </motion.div>

        {/* DSP Metrics Card */}
        <motion.div
          className="glass-panel dsp-panel"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          custom={0.25}
        >
          <p className="panel-label">✦ DSP Signatures</p>
          <div className="dsp-metrics">
            <MetricRow label="Tempo"           value={`${dsp_metrics.bpm.toFixed(1)} BPM`} />
            <MetricRow label="Kinetic Energy"  value={dsp_metrics.energy_rmse.toFixed(4)} />
            <MetricRow label="Tonal Brightness" value={`${dsp_metrics.brightness_centroid.toFixed(0)} Hz`} />
          </div>
        </motion.div>

        {/* Sonic DNA Profile Card */}
        <motion.div
          className="glass-panel dna-panel"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          custom={0.4}
        >
          <p className="panel-label">✦ Sonic DNA Profile</p>
          <p className="sonic-profile">{sonic_dna_profile}</p>
        </motion.div>
      </div>

      {/* ── Right: Mandala ── */}
      <motion.div
        className="results-right"
        initial={{ opacity: 0, scale: 0.88, filter: 'blur(16px)' }}
        animate={{ opacity: 1, scale: 1,    filter: 'blur(0px)' }}
        transition={{ duration: 1.3, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <p className="panel-label mandala-label">✦ Living Soul Signature</p>
        <div className="mandala-wrapper">
          <Mandala dsp_metrics={dsp_metrics} genre={ml_prediction.genre} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const [file,      setFile]      = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status,    setStatus]    = useState('idle');   // idle | loading | success | error
  const [result,    setResult]    = useState(null);
  const [errorMsg,  setErrorMsg]  = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // ── File handling ──
  const handleFile = (f) => {
    if (!f) return;
    const ok = f.type === 'audio/mpeg'
      || f.type === 'audio/wav'
      || f.name.endsWith('.mp3')
      || f.name.endsWith('.wav');

    if (ok) {
      setFile(f);
      setStatus('idle');
      setResult(null);
      setErrorMsg('');
    } else {
      setErrorMsg('Please upload an .mp3 or .wav file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  // ── API call ──
  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('loading');
    setResult(null);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.status === 'success') {
        setResult(res.data.data);
        setStatus('success');
      } else {
        throw new Error('Unexpected response structure from server.');
      }
    } catch (err) {
      const msg = err.response?.data?.detail
        || err.message
        || 'An ethereal disturbance disrupted the connection.';
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setStatus('idle');
    setErrorMsg('');
  };

  // ── Render ──
  return (
    <motion.div
      className="dashboard-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <header className="dashboard-header">
        <motion.button
          className="back-link"
          onClick={() => navigate('/')}
          whileHover={{ x: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          ← Return
        </motion.button>

        <span className="dashboard-logo">SoulTune</span>
        <span style={{ width: '80px' }} /> {/* spacer to centre logo */}
      </header>

      {/* Main content */}
      <div className="dashboard-content">
        <AnimatePresence mode="wait">

          {/* ── Upload / Idle / Error State ── */}
          {(status === 'idle' || status === 'error') && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24, filter: 'blur(10px)' }}
              transition={{ duration: 0.7 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4rem' }}
            >
              {/* Drop zone */}
              <div
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                role="button"
                tabIndex={0}
                aria-label="Upload audio file"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/wav"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />

                <motion.div
                  className="upload-icon"
                  animate={{ scale: isDragging ? 1.25 : 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {file ? '♪' : '⟡'}
                </motion.div>

                <p className="upload-title">
                  {file ? file.name : 'Drop your audio here'}
                </p>
                <p className="upload-hint">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB — ready`
                    : 'or click to select  .mp3 / .wav'}
                </p>
              </div>

              {/* Analyze button — appears only when a file is loaded */}
              <AnimatePresence>
                {file && (
                  <motion.button
                    className="analyze-button"
                    key="analyze-btn"
                    onClick={handleAnalyze}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 0 55px rgba(130,200,255,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.45 }}
                  >
                    Extract the Soul
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.p
                    className="error-message"
                    key="err"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Loading State ── */}
          {status === 'loading' && <EtherealLoader key="loader" />}

          {/* ── Success State ── */}
          {status === 'success' && result && (
            <motion.div
              key="success"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ResultsPanel data={result} />

              <motion.button
                className="reset-button"
                onClick={handleReset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                whileHover={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
              >
                ↺ &nbsp; Analyze Another
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}