import React from 'react'
import { motion } from 'framer-motion'
import { assetUrl } from '../utils/dataLoader.js'

export default function SeasonSelector({ seasons, seasonsData, active, onChange }) {
  if (!seasons || seasons.length === 0) return null

  const activeCount = seasonsData?.[active]?.episodes?.length || 0

  return (
    <div>
      <div className="season-selector">
        {seasons.map((num) => {
          const cover = seasonsData?.[num]?.cover
          return (
            <button
              key={num}
              className={`season-btn ${active === num ? 'active' : ''}`}
              onClick={() => onChange(num)}
            >
              <span className="season-thumb">
                {cover ? <img src={assetUrl(cover)} alt="" /> : num}
              </span>
              Temporada {num}
              {active === num && (
                <motion.span layoutId="season-indicator" className="season-indicator" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
            </button>
          )
        })}
      </div>
      <p className="season-caption">
        Temporada {active} · {activeCount} episodio{activeCount !== 1 ? 's' : ''}
      </p>

      <style>{`
        .season-selector { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 8px; }
        .season-btn {
          position: relative; display: flex; align-items: center; gap: 8px;
          background: var(--bg-panel-raised); border: 1px solid var(--line); color: var(--text-mid);
          padding: 6px 16px 6px 6px; border-radius: 100px; font-weight: 700; font-size: 13.5px; white-space: nowrap; flex-shrink: 0;
        }
        .season-btn.active { color: #191204; }
        .season-thumb {
          width: 26px; height: 26px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
          background: rgba(0,0,0,0.25); display: grid; place-items: center; font-size: 11px; font-weight: 800;
        }
        .season-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .season-indicator { position: absolute; inset: 0; border-radius: 100px; background: linear-gradient(120deg, var(--yellow), var(--blue-glow)); z-index: -1; }
        .season-caption { color: var(--text-low); font-size: 13px; margin: 0 0 18px; }
      `}</style>
    </div>
  )
}
