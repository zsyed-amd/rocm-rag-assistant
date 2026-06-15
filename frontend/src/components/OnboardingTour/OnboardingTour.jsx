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

function getTargetRect(target) {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export default function OnboardingTour({ theme, onToggle }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  const TOUR_KEY = 'rocm_tour_seen';

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
        transform:
          current.placement === 'bottom' ? 'none' : 'translateY(-100%)',
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
                <button
                  className={styles.prevBtn}
                  onClick={prev}
                  disabled={step === 0}
                >
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

      <div className={styles.fabs}>
        <button
          className={styles.fab}
          onClick={onToggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{ bottom: '4.25rem' }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          className={styles.fab}
          onClick={startTour}
          title="Start demo tour"
        >
          ?
        </button>
      </div>
    </>
  );
}
