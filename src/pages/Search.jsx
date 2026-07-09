import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLibrary } from '../context/LibraryContext.jsx'
import Card from '../components/Card.jsx'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const { movies, series, loading } = useLibrary()
  const [term, setTerm] = useState(params.get('q') || '')

  const q = (params.get('q') || '').toLowerCase().trim()

  const results = useMemo(() => {
    if (!q) return { movies: [], series: [] }
    const match = (item) =>
      item.title.toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.genres || []).some((g) => g.toLowerCase().includes(q))
    return { movies: movies.filter(match), series: series.filter(match) }
  }, [q, movies, series])

  function submit(e) {
    e.preventDefault()
    setParams(term.trim() ? { q: term.trim() } : {})
  }

  const total = results.movies.length + results.series.length

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <span className="eyebrow">Buscador</span>
      <h1 className="page-title">Buscar</h1>

      <form className="search-form" onSubmit={submit}>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Título, descripción o género..."
          autoFocus
        />
        <button className="btn btn-primary" type="submit">Buscar</button>
      </form>

      {q && !loading && (
        <p className="result-count">{total} resultado{total !== 1 ? 's' : ''} para "{q}"</p>
      )}

      {results.movies.length > 0 && (
        <section className="carousel-section">
          <h2 className="section-title">Películas</h2>
          <div className="card-grid">
            {results.movies.map((m, i) => (
              <motion.div key={m.folder} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card item={m} type="movie" />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {results.series.length > 0 && (
        <section className="carousel-section">
          <h2 className="section-title">Series</h2>
          <div className="card-grid">
            {results.series.map((s, i) => (
              <motion.div key={s.folder} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card item={s} type="series" />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {q && !loading && total === 0 && <p className="empty-hint">No se encontró nada con ese término.</p>}

      <style>{`
        .page-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 42px); letter-spacing: 1px; margin: 6px 0 20px; }
        .search-form { display: flex; gap: 10px; max-width: 520px; margin-bottom: 12px; }
        .result-count { color: var(--text-mid); margin-bottom: 24px; font-size: 13.5px; }
        .empty-hint { color: var(--text-low); padding: 40px 0; }
      `}</style>
    </div>
  )
}
