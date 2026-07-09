import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLibrary } from '../context/LibraryContext.jsx'
import Carousel from '../components/Carousel.jsx'

export default function Categories() {
  const { movies, series, loading } = useLibrary()

  const grouped = useMemo(() => {
    const map = {}
    movies.forEach((m) => (m.genres || []).forEach((g) => {
      map[g] = map[g] || { movies: [], series: [] }
      map[g].movies.push(m)
    }))
    series.forEach((s) => (s.genres || []).forEach((g) => {
      map[g] = map[g] || { movies: [], series: [] }
      map[g].series.push(s)
    }))
    return map
  }, [movies, series])

  const genreNames = Object.keys(grouped)

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <span className="eyebrow">Explorar</span>
      <h1 className="page-title">Categorías</h1>

      {!loading && genreNames.length === 0 && (
        <p className="empty-hint">Aún no hay géneros asignados a tu contenido.</p>
      )}

      {genreNames.map((g) => (
        <div key={g}>
          {grouped[g].movies.length > 0 && (
            <Carousel title={`${g} · Películas`} items={grouped[g].movies} type="movie" loading={loading} />
          )}
          {grouped[g].series.length > 0 && (
            <Carousel title={`${g} · Series`} items={grouped[g].series} type="series" loading={loading} />
          )}
        </div>
      ))}

      <style>{`
        .page-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 42px); letter-spacing: 1px; margin: 6px 0 30px; }
        .empty-hint { color: var(--text-low); padding: 40px 0; }
      `}</style>
    </div>
  )
}
