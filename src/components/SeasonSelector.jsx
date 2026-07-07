import React from 'react'
import { motion } from 'framer-motion'

export default function SeasonSelector({ seasons, active, onChange }) {
  if (!seasons || seasons.length === 0) return null
  return (
    <div className="season-selector">
      {seasons.map((num) => (
        <button
          key={num}
          className={`season-btn ${active === num ? 'active' : ''}`}
          onClick={() => onChange(num)}
        >
          Temporada {num}
          {active === num && (
            <motion.span layoutId="season-indicator" className="season-indicator" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
          )}
        </button>
      ))}
      <style>{`
        .season-selector { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 18px; }
        .season-btn {
          position: relative; background: var(--bg-panel-raised); border: 1px solid var(--line); color: var(--text-mid);
          padding: 9px 18px; border-radius: 100px; font-weight: 700; font-size: 13.5px; white-space: nowrap; flex-shrink: 0;
        }
        .season-btn.active { color: #191204; }
        .season-indicator { position: absolute; inset: 0; border-radius: 100px; background: linear-gradient(120deg, var(--yellow), var(--blue-glow)); z-index: -1; }
      `}</style>
    </div>
  )
}
