import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLibrary } from '../context/LibraryContext.jsx'
import { assetUrl } from '../utils/dataLoader.js'

export default function MovieDetails() {
  const { folder } = useParams()
  const { movies, loading } = useLibrary()
  const navigate = useNavigate()
  const movie = movies.find((m) => m.folder === folder)

  if (loading) return <div className="container" style={{ paddingTop: 40 }}><p className="empty-hint">Cargando…</p></div>
  if (!movie) return <div className="container" style={{ paddingTop: 40 }}><p className="empty-hint">No se encontró esta película.</p></div>

  return (
    <div className="details-page">
      <div className="backdrop">
        {(movie.banner || movie.cover) && (
          <motion.img
            src={assetUrl(movie.banner || movie.cover)}
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
          {movie.cover ? <img src={assetUrl(movie.cover)} alt={movie.title} className="details-poster" /> : <div className="details-poster fallback">{movie.title[0]}</div>}
        </motion.div>

        <motion.div className="info-col" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <span className="eyebrow">Película</span>
          <h1>{movie.title}</h1>
          <div className="meta-row">
            {movie.year && <span>{movie.year}</span>}
            {movie.rating && <span className="chip">{movie.rating}</span>}
            {movie.duration ? <span>{movie.duration} min</span> : null}
          </div>
          <div className="genre-row">
            {(movie.genres || []).map((g) => <span key={g} className="chip">{g}</span>)}
          </div>
          <p className="description">{movie.description}</p>
          <div className="actions">
            <button className="btn btn-primary" onClick={() => navigate(`/ver/pelicula/${movie.folder}`)}>▶ Reproducir</button>
            <Link to="/peliculas" className="btn btn-secondary">Volver al catálogo</Link>
          </div>
        </motion.div>
      </div>

      <style>{`
        .details-page { position: relative; }
        .backdrop { position: absolute; inset: 0; height: 420px; overflow: hidden; }
        .backdrop img { width: 100%; height: 100%; object-fit: cover; }
        .backdrop-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7,11,20,0.3), var(--bg-deep) 92%); }
        .details-content { position: relative; padding-top: 140px; display: grid; grid-template-columns: 260px 1fr; gap: 40px; }
        .details-poster { width: 100%; border-radius: var(--radius-lg); box-shadow: 0 20px 60px -12px rgba(0,0,0,0.6); border: 1px solid var(--line); }
        .details-poster.fallback { aspect-ratio: 2/3; display: grid; place-items: center; background: var(--bg-panel-raised); font-family: var(--font-display); font-size: 60px; color: var(--text-low); }
        .info-col h1 { font-family: var(--font-display); font-size: clamp(30px, 5vw, 50px); margin: 8px 0 14px; letter-spacing: 1px; }
        .meta-row, .genre-row { display: flex; gap: 10px; align-items: center; color: var(--text-mid); font-size: 14px; margin-bottom: 10px; flex-wrap: wrap; }
        .description { color: var(--text-mid); line-height: 1.7; max-width: 640px; margin-bottom: 26px; }
        .actions { display: flex; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 760px) {
          .details-content { grid-template-columns: 140px 1fr; gap: 20px; padding-top: 100px; }
        }
      `}</style>
    </div>
  )
}
