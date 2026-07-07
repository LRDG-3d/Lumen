import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { assetUrl } from '../utils/dataLoader.js'

export default function Card({ item, type, progress }) {
  const to = type === 'movie' ? `/pelicula/${item.folder}` : `/serie/${item.folder}`

  return (
    <motion.div
      className="poster-card"
      whileHover={{ scale: 1.06, zIndex: 5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link to={to}>
        <div className="poster-frame">
          {item.cover ? (
            <img src={assetUrl(item.cover)} alt={item.title} loading="lazy" />
          ) : (
            <div className="poster-fallback">{item.title?.[0] || '?'}</div>
          )}
          <div className="poster-glow" />
          <div className="poster-overlay">
            <span className="play-dot">▶</span>
            <div className="poster-meta">
              <strong>{item.title}</strong>
              <div className="poster-tags">
                {item.year && <span>{item.year}</span>}
                {item.rating && <span className="chip">{item.rating}</span>}
              </div>
            </div>
          </div>
          {typeof progress === 'number' && progress > 0 && (
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          )}
        </div>
        <p className="poster-title">{item.title}</p>
      </Link>

      <style>{`
        .poster-card { position: relative; }
        .poster-frame {
          position: relative; aspect-ratio: 2/3; border-radius: var(--radius-md); overflow: hidden;
          background: var(--bg-panel-raised); border: 1px solid var(--line);
        }
        .poster-frame img { width: 100%; height: 100%; object-fit: cover; transition: filter 0.3s; }
        .poster-fallback {
          width: 100%; height: 100%; display: grid; place-items: center; font-family: var(--font-display);
          font-size: 48px; color: var(--text-low);
        }
        .poster-glow {
          position: absolute; inset: -2px; border-radius: var(--radius-md); opacity: 0; pointer-events: none;
          box-shadow: 0 0 0 2px var(--yellow), 0 10px 40px -6px rgba(46,111,242,0.65); transition: opacity 0.25s;
        }
        .poster-card:hover .poster-glow { opacity: 1; }
        .poster-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end;
          padding: 10px; background: linear-gradient(180deg, transparent 40%, rgba(5,8,16,0.92) 100%);
          opacity: 0; transition: opacity 0.25s;
        }
        .poster-card:hover .poster-overlay { opacity: 1; }
        .play-dot {
          position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%;
          background: var(--yellow); color: #191204; display: grid; place-items: center; font-size: 11px;
        }
        .poster-meta strong { font-size: 13px; display: block; }
        .poster-tags { display: flex; gap: 6px; margin-top: 4px; font-size: 11px; color: var(--text-mid); }
        .poster-title { font-size: 13px; margin: 8px 2px 0; color: var(--text-mid); font-weight: 600; }
        .progress-track { position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: rgba(255,255,255,0.15); }
        .progress-fill { height: 100%; background: linear-gradient(90deg, var(--yellow), var(--blue)); }
      `}</style>
    </motion.div>
  )
}
