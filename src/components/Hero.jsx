import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { assetUrl } from '../utils/dataLoader.js'

export default function Hero({ item, type }) {
  const navigate = useNavigate()
  if (!item) return null

  const to = type === 'movie' ? `/pelicula/${item.folder}` : `/serie/${item.folder}`
  const watchTo = type === 'movie' ? `/ver/pelicula/${item.folder}` : to

  return (
    <div className="hero">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.folder}
          className="hero-bg"
          initial={{ opacity: 0, scale: 1.08, filter: 'blur(18px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          {(item.banner || item.cover) && <img src={assetUrl(item.banner || item.cover)} alt="" />}
        </motion.div>
      </AnimatePresence>

      <div className="hero-scrim" />

      <div className="container hero-content">
        <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          {type === 'movie' ? 'Película destacada' : 'Serie destacada'}
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          {item.title}
        </motion.h1>
        <motion.div className="hero-tags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          {item.year && <span>{item.year}</span>}
          {item.rating && <span className="chip">{item.rating}</span>}
          {(item.genres || []).slice(0, 3).map((g) => <span key={g}>{g}</span>)}
        </motion.div>
        <motion.p className="hero-desc" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          {item.description}
        </motion.p>
        <motion.div className="hero-actions" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <button className="btn btn-primary" onClick={() => navigate(watchTo)}>▶ Reproducir</button>
          <button className="btn btn-ghost" onClick={() => navigate(to)}>Más información</button>
        </motion.div>
      </div>

      <style>{`
        .hero { position: relative; height: min(78vh, 640px); min-height: 420px; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; }
        .hero-bg img { width: 100%; height: 100%; object-fit: cover; }
        .hero-scrim {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(7,11,20,0.2) 0%, rgba(7,11,20,0.55) 55%, var(--bg-deep) 100%),
                      linear-gradient(90deg, rgba(7,11,20,0.85) 0%, rgba(7,11,20,0.1) 55%);
        }
        .hero-content { position: absolute; bottom: 60px; left: 0; right: 0; max-width: 640px; }
        .hero-content h1 { font-family: var(--font-display); font-size: clamp(34px, 6vw, 64px); margin: 8px 0; letter-spacing: 1px; line-height: 1; }
        .hero-tags { display: flex; gap: 10px; font-size: 13px; color: var(--text-mid); align-items: center; margin-bottom: 12px; }
        .hero-desc { color: var(--text-mid); max-width: 520px; line-height: 1.6; margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .hero-actions { display: flex; gap: 12px; }
        @media (max-width: 640px) {
          .hero { height: 62vh; }
          .hero-content { bottom: 34px; }
        }
      `}</style>
    </div>
  )
}
