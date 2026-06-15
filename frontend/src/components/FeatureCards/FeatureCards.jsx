import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FeatureCards.module.css';

const CARDS = [
  {
    icon: '⚡',
    title: 'AMD MI300X',
    subtitle: 'Hardware',
    summary: '192GB HBM3 · 5.3 TB/s bandwidth',
    detail:
      'The AMD Instinct MI300X accelerator delivers 192GB of HBM3 memory with 5.3 TB/s peak bandwidth — enough to hold all 4 LLMs in VRAM simultaneously with memory to spare for RAG context windows.',
  },
  {
    icon: '🧩',
    title: 'ROCm + Ollama',
    subtitle: 'Software Stack',
    summary: 'LangChain · HuggingFace · Chroma',
    detail:
      'Built entirely on the open-source ROCm ecosystem. Ollama manages GPU-accelerated inference, LangChain orchestrates the RAG pipeline, HuggingFace provides sentence embeddings, and ChromaDB stores the vectorised documentation.',
  },
  {
    icon: '📊',
    title: 'Parallel Inference',
    subtitle: 'Performance',
    summary: '4 LLMs queried concurrently',
    detail:
      'All four models — Mixtral 8x7B, Llama 3.1 8B, Gemma 2 27B, and Phi 3 14B — are queried in parallel using concurrent.futures. Per-model retrieval time, inference time, and tokens/second are measured and reported for every query.',
  },
  {
    icon: '📚',
    title: 'Source-Grounded',
    subtitle: 'Domain Capability',
    summary: '36 ROCm doc pages · FAISS retrieval',
    detail:
      'The knowledge base is built from 36 official ROCm documentation pages spanning installation, debugging, HIP programming, libraries, containers, and compatibility. Each answer cites retrieved source documents, so you can verify every response.',
  },
];

export default function FeatureCards() {
  const [open, setOpen] = useState(null);

  return (
    <section className={styles.section} data-tour="cards">
      <div className={styles.grid}>
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            className={styles.card}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className={styles.icon}>{card.icon}</span>
            <p className={styles.subtitle}>{card.subtitle}</p>
            <h3 className={styles.title}>{card.title}</h3>
            <p className={styles.summary}>{card.summary}</p>
            <span className={styles.expand}>{open === i ? '−' : '+'}</span>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(null)}
            />
            <motion.div
              className={styles.detail}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <button className={styles.close} onClick={() => setOpen(null)}>✕</button>
              <span className={styles.detailIcon}>{CARDS[open].icon}</span>
              <p className={styles.detailSubtitle}>{CARDS[open].subtitle}</p>
              <h3 className={styles.detailTitle}>{CARDS[open].title}</h3>
              <p className={styles.detailBody}>{CARDS[open].detail}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
