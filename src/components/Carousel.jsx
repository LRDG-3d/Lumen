import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import Card from './Card.jsx'
import { SkeletonRow } from './SkeletonCard.jsx'

export default function Carousel({ title, items, type, loading, progressMap, eyebrow }) {
  const trackRef = useRef(null)

  function scrollBy(delta) {
    trackRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <section className="carousel-section">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="section-title">{title}</h2>
        <SkeletonRow count={6} />
      </section>
    )
  }

  if (!items || items.length === 0) return null

  return (
    <section className="carousel-section">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <div className="carousel-head">
        <h2 className="section-title">{title}</h2>
        <div className="carousel-arrows desktop-only">
          <button className="arrow-btn" onClick={() => scrollBy(-500)} aria-label="Anterior">‹</button>
          <button className="arrow-btn" onClick={() => scrollBy(500)} aria-label="Siguiente">›</button>
        </div>
      </div>
      <div className="carousel-track" ref={trackRef}>
        {items.map((item, i) => (
          <motion.div
            key={item.folder}
            className="carousel-item"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -60px 0px' }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
          >
            <Card item={item} type={type} progress={progressMap?.[item.folder]} />
          </motion.div>
        ))}
      </div>

      <style>{`
        .carousel-section { margin-bottom: 40px; }
        .carousel-head { display: flex; align-items: center; justify-content: space-between; }
        .carousel-arrows { gap: 8px; }
        .arrow-btn {
          width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line);
          background: var(--bg-panel-raised); color: var(--text-hi); font-size: 18px;
        }
        .arrow-btn:hover { border-color: var(--blue); }
        .carousel-track {
          display: flex; gap: 18px; overflow-x: auto; scroll-snap-type: x proximity; padding-bottom: 6px;
        }
        .carousel-item { flex: 0 0 auto; width: 170px; scroll-snap-align: start; }
        @media (max-width: 640px) {
          .carousel-item { width: 128px; }
          .carousel-track { gap: 12px; }
        }
      `}</style>
    </section>
  )
}
