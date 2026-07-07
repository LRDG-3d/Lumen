import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { assetUrl } from '../utils/dataLoader.js'

export default function EpisodeList({ episodes, seriesFolder, seasonNumber, progressMap }) {
  const navigate = useNavigate()

  if (!episodes || episodes.length === 0) {
    return <p className="empty-hint">Esta temporada todavía no tiene episodios cargados.</p>
  }

  return (
    <div className="episode-list">
      <AnimatePresence mode="popLayout">
        {episodes.map((ep, i) => {
          const epId = `episode:${seriesFolder}-s${seasonNumber}e${ep.episodeNumber}`
          const progress = progressMap?.[epId]
          return (
            <motion.div
              key={ep.episodeNumber}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03, duration: 0.35 }}
              className="episode-row"
              onClick={() => navigate(`/ver/serie/${seriesFolder}/${seasonNumber}/${ep.episodeNumber}`)}
            >
              <div className="ep-thumb">
                {ep.thumbnail ? <img src={assetUrl(ep.thumbnail)} alt={ep.title} /> : <div className="ep-thumb-fallback">{ep.episodeNumber}</div>}
                <span className="ep-play">▶</span>
                {progress > 0 && <div className="ep-progress"><div style={{ width: `${progress}%` }} /></div>}
              </div>
              <div className="ep-info">
                <div className="ep-title-row">
                  <strong>{ep.episodeNumber}. {ep.title}</strong>
                  {ep.duration ? <span className="ep-duration">{ep.duration} min</span> : null}
                </div>
                <p>{ep.description}</p>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <style>{`
        .episode-list { display: flex; flex-direction: column; gap: 10px; }
        .episode-row {
          display: flex; gap: 16px; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--line);
          background: var(--bg-panel); cursor: pointer; transition: background 0.2s, border-color 0.2s;
        }
        .episode-row:hover { background: var(--bg-panel-raised); border-color: var(--blue); }
        .ep-thumb { position: relative; width: 160px; flex-shrink: 0; aspect-ratio: 16/9; border-radius: var(--radius-sm); overflow: hidden; background: #0a0f1e; }
        .ep-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ep-thumb-fallback { width: 100%; height: 100%; display: grid; place-items: center; font-family: var(--font-display); font-size: 22px; color: var(--text-low); }
        .ep-play { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(5,8,16,0.35); opacity: 0; transition: opacity 0.2s; color: var(--yellow); font-size: 20px; }
        .episode-row:hover .ep-play { opacity: 1; }
        .ep-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.2); }
        .ep-progress div { height: 100%; background: linear-gradient(90deg, var(--yellow), var(--blue)); }
        .ep-info { flex: 1; min-width: 0; }
        .ep-title-row { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 4px; }
        .ep-duration { color: var(--text-low); font-size: 12px; white-space: nowrap; }
        .ep-info p { color: var(--text-mid); font-size: 13.5px; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .empty-hint { color: var(--text-low); }
        @media (max-width: 560px) {
          .ep-thumb { width: 108px; }
        }
      `}</style>
    </div>
  )
}
