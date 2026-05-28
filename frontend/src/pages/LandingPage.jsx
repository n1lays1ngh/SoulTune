// =====================================================
//  SonicDNA — LandingPage.jsx
//  Place at: src/pages/LandingPage.jsx
// =====================================================

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

// ── Star Field ────────────────────────────────────────
// Pure CSS animation — no canvas, no deps.
function StarField({ count = 140 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.8 + 0.4,
        opacity: Math.random() * 0.65 + 0.2,
        duration: (Math.random() * 3 + 2).toFixed(2),
        delay: (Math.random() * 5).toFixed(2),
      })),
    []
  );

  return (
    <div className="stars-field" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width:  `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            '--dur': `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Framer Motion Variants ────────────────────────────
const pageVariants = {
  // Page enters from a diffuse, blurred void and coalesces
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.18,
      delayChildren: 0.25,
    },
  },
  // Exit: page dissolves upward into the ether
  exit: {
    opacity: 0,
    filter: 'blur(22px)',
    scale: 1.04,
    y: -18,
    transition: {
      duration: 0.85,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: 'blur(12px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.1,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// ── Component ─────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="landing-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Stars */}
      <StarField />

      {/* Atmospheric glow orbs (CSS animated) */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      {/* ── Hero Content ── */}
      <div className="landing-content">
        <motion.span className="eyebrow" variants={itemVariants}>
          ✦ &nbsp; Soul Analysis Engine &nbsp; ✦
        </motion.span>

        <motion.h1 className="headline" variants={itemVariants}>
          See the Soul
          <br />
          <em>of Your Sound</em>
        </motion.h1>

        <motion.p className="subheadline" variants={itemVariants}>
          Feed us your frequency. We return your essence —<br />
          a living portrait woven from tempo, energy, and tonal light.
        </motion.p>

        {/* CTA */}
        <motion.div variants={itemVariants}>
          <motion.button
            className="cta-button"
            onClick={() => navigate('/dashboard')}
            whileHover={{
              scale: 1.06,
              boxShadow:
                '0 0 55px rgba(130,200,255,0.55), 0 0 110px rgba(130,200,255,0.22), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            Reveal the Soul
          </motion.button>
        </motion.div>

        <motion.p className="supported-formats" variants={itemVariants}>
          Accepts &nbsp;.mp3&nbsp; and &nbsp;.wav&nbsp; files
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div className="scroll-hint" variants={itemVariants} aria-hidden="true">
        <div className="scroll-line" />
      </motion.div>
    </motion.div>
  );
}