import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './OnboardingTour.module.css';

const STEPS = [
  {
    target: 'header',
    title: 'AMD ROCm RAG Assistant',
    body: 'This demo runs four large language models in parallel on an AMD Instinct MI300X GPU with 192GB HBM3 memory, powered by ROCm open software.',
    placement: 'bottom',
  },
  {
    target: 'form',
    title: 'Ask Your Question',
    body: 'Type any ROCm-related question — installation, debugging, HIP programming, PyTorch setup, and more. Use the example chips below for quick starts.',
    placement: 'bottom',
  },
  {
    target: 'submit',
    title: 'Submit to All 4 Models',
    body: 'One click sends your question to Mixtral 8x7B, Llama 3.1 8B, Gemma 2 27B, and Phi 3 14B simultaneously — all running on-device via ROCm + Ollama.',
    placement: 'bottom',
  },
  {
    target: 'results',
    title: 'Compare Model Responses',
    body: 'Switch between model tabs to compare answers side by side. Each tab shows the response, plus per-model latency metrics: retrieval time, inference time, and tokens/second.',
    placement: 'top',
  },
  {
    target: 'cards',
    title: 'Tech Stack Details',
    body: 'Click any card to explore the hardware, software, performance characteristics, and RAG architecture behind this demo.',
    placement: 'top',
  },
];

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

function getTargetRect(target) {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  return el.getBoundingClientRect();
}

const TOUR_KEY = 'rocm_tour_seen';

export default function OnboardingTour({ theme, onToggle }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [tourSeen, setTourSeen] = useState(() => !!localStorage.getItem(TOUR_KEY));

  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      setTimeout(() => startTour(), 800);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const r = getTargetRect(STEPS[step].target);
    setRect(r);
  }, [active, step]);

  const startTour = () => {
    setStep(0);
    setActive(true);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      endTour();
    }
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  const endTour = () => {
    setActive(false);
    setTourSeen(true);
    localStorage.setItem(TOUR_KEY, '1');
  };

  const current = STEPS[step];

  const tooltipStyle = rect
    ? {
        top:
          current.placement === 'bottom'
            ? rect.bottom + window.scrollY + 12
            : rect.top + window.scrollY - 12,
        left: Math.max(16, rect.left + rect.width / 2 - 180),
        transform: current.placement === 'bottom' ? 'none' : 'translateY(-100%)',
      }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  const spotStyle = rect
    ? {
        top: rect.top + window.scrollY - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      }
    : null;

  return (
    <>
      <AnimatePresence>
        {active && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={endTour}
            />
            {spotStyle && (
              <motion.div
                className={styles.spotlight}
                style={spotStyle}
                layoutId="spotlight"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <motion.div
              className={styles.tooltip}
              style={tooltipStyle}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.tooltipHeader}>
                <span className={styles.stepCount}>{step + 1} / {STEPS.length}</span>
                <button className={styles.skipBtn} onClick={endTour}>Skip tour</button>
              </div>
              <h4 className={styles.tooltipTitle}>{current.title}</h4>
              <p className={styles.tooltipBody}>{current.body}</p>
              <div className={styles.tooltipFooter}>
                <button className={styles.prevBtn} onClick={prev} disabled={step === 0}>
                  Back
                </button>
                <div className={styles.dots}>
                  {STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
                      onClick={() => setStep(i)}
                    />
                  ))}
                </div>
                <button className={styles.nextBtn} onClick={next}>
                  {step === STEPS.length - 1 ? 'Done' : 'Next'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button className={styles.pillBtn} onClick={onToggle} style={{ bottom: '4.25rem' }}>
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>

      {tourSeen && !active && (
        <button className={styles.pillBtn} onClick={startTour} style={{ bottom: '1.25rem' }}>
          <InfoIcon />
          Tour
        </button>
      )}
    </>
  );
}
