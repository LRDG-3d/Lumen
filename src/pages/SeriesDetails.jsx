import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLibrary } from '../context/LibraryContext.jsx'
import { useContinueWatching } from '../context/ContinueWatchingContext.jsx'
import { assetUrl } from '../utils/dataLoader.js'
import SeasonSelector from '../components/SeasonSelector.jsx'
import EpisodeList from '../components/EpisodeList.jsx'

export default function SeriesDetails() {
  const { folder } = useParams()
  const { series, loading, loadSeasons } = useLibrary()
  const { entries } = useContinueWatching()
  const show = series.find((s) => s.folder === folder)
  const [activeSeason, setActiveSeason] = useState(null)
  const [seasonsLoading, setSeasonsLoading] = useState(true)

  useEffect(() => {
    if (!show) return
    setSeasonsLoading(true)
    loadSeasons(folder).then((data) => {
      const nums = Object.keys(data).map(Number).sort((a, b) => a - b)
      setActiveSeason(nums[0] || null)
      setSeasonsLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder])

  const progressMap = useMemo(() => {
    const map = {}
    Object.entries(entries).forEach(([id, e]) => {
      if (e.duration) map[id] = Math.min(100, (e.position / e.duration) * 100)
    })
    return map
  }, [entries])

  if (loading) return <div className="container" style={{ paddingTop: 40 }}><p className="empty-hint">Cargando…</p></div>
  if (!show) return <div className="container" style={{ paddingTop: 40 }}><p className="empty-hint">No se encontró esta serie.</p></div>

  const currentEpisodes = show.seasons?.[activeSeason]?.episodes || []

  return (
    <div className="details-page">
      <div className="backdrop">
        {(show.banner || show.cover) && (
          <motion.img
            src={assetUrl(show.banner || show.cover)}
            alt=""
            initial={{ opacity: 0, scale: 1.06, filter: 'blur(14px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8 }}
          />
        )}
        <div className="backdrop-scrim" />
      </div>

      <div className="container details-content">
        <motion.div className="poster-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {show.cover ? <img src={assetUrl(show.cover)} alt={show.title} className="details-poster" /> : <div className="details-poster fallback">{show.title[0]}</div>}
        </motion.div>

        <motion.div className="info-col" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <span className="eyebrow">Serie</span>
          <h1>{show.title}</h1>
          <div className="meta-row">
            {show.year && <span>{show.year}</span>}
            {show.rating && <span className="chip">{show.rating}</span>}
            <span>{(show.seasonNumbers || []).length} temporada{(show.seasonNumbers || []).length !== 1 ? 's' : ''}</span>
          </div>
          <div className="genre-row">
            {(show.genres || []).map((g) => <span key={g} className="chip">{g}</span>)}
          </div>
          <p className="description">{show.description}</p>
        </motion.div>
      </div>

      <div className="container" style={{ marginTop: 30 }}>
        <h2 className="section-title">Episodios</h2>
        {seasonsLoading ? (
          <p className="empty-hint">Cargando temporadas…</p>
        ) : (show.seasonNumbers || []).length === 0 ? (
          <p className="empty-hint">Esta serie todavía no tiene temporadas cargadas.</p>
        ) : (
          <>
            <SeasonSelector seasons={show.seasonNumbers} active={activeSeason} onChange={setActiveSeason} />
            <EpisodeList
              episodes={currentEpisodes}
              seriesFolder={show.folder}
              seasonNumber={activeSeason}
              progressMap={progressMap}
            />
          </>
        )}
      </div>

      <style>{`
        .details-page { position: relative; padding-bottom: 60px; }
        .backdrop { position: absolute; inset: 0; height: 420px; overflow: hidden; }
        .backdrop img { width: 100%; height: 100%; object-fit: cover; }
        .backdrop-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7,11,20,0.3), var(--bg-deep) 92%); }
        .details-content { position: relative; padding-top: 140px; display: grid; grid-template-columns: 260px 1fr; gap: 40px; margin-bottom: 10px; }
        .details-poster { width: 100%; border-radius: var(--radius-lg); box-shadow: 0 20px 60px -12px rgba(0,0,0,0.6); border: 1px solid var(--line); }
        .details-poster.fallback { aspect-ratio: 2/3; display: grid; place-items: center; background: var(--bg-panel-raised); font-family: var(--font-display); font-size: 60px; color: var(--text-low); }
        .info-col h1 { font-family: var(--font-display); font-size: clamp(30px, 5vw, 50px); margin: 8px 0 14px; letter-spacing: 1px; }
        .meta-row, .genre-row { display: flex; gap: 10px; align-items: center; color: var(--text-mid); font-size: 14px; margin-bottom: 10px; flex-wrap: wrap; }
        .description { color: var(--text-mid); line-height: 1.7; max-width: 640px; }
        .empty-hint { color: var(--text-low); }
        @media (max-width: 760px) {
          .details-content { grid-template-columns: 140px 1fr; gap: 20px; padding-top: 100px; }
        }
      `}</style>
    </div>
  )
}
