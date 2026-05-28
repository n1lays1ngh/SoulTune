// =====================================================
//  SonicDNA — App.jsx
//  Place at: src/App.jsx
//
//  Required npm packages (run in your project root):
//  npm install react-router-dom framer-motion axios react-p5
// =====================================================

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import './index.css';

// AnimatedRoutes must be a child of BrowserRouter so useLocation works.
// AnimatePresence with mode="wait" ensures the exit animation fully completes
// before the entering page mounts — the "soul floating between worlds" effect.
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />}  />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}