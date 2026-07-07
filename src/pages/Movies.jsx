import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLibrary } from '../context/LibraryContext.jsx'
import Card from '../components/Card.jsx'
import { SkeletonRow } from '../components/SkeletonCard.jsx'

export default function Movies() {
  const { movies, loading } = useLibrary()
  const [genre, setGenre] = useState('Todas')
  const [sort, setSort] = useState('recientes')

  const genres = useMemo(() => {
    const set = new Set()
    movies.forEach((m) => (m.genres || []).forEach((g) => set.add(g)))
    return ['Todas', ...Array.from(set)]
  }, [movies])

  const filtered = useMemo(() => {
    let list = genre === 'Todas' ? movies : movies.filter((m) => (m.genres || []).includes(genre))
    list = [...list].sort((a, b) => {
      if (sort === 'recientes') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sort === 'az') return a.title.localeCompare(b.title)
      if (sort === 'anio') return (b.year || 0) - (a.year || 0)
      return 0
    })
    return list
  }, [movies, genre, sort])

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <div className="page-header">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1 className="page-title">Películas</h1>
        </div>
        <div className="filters">
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recientes">Recién agregadas</option>
            <option value="az">A-Z</option>
            <option value="anio">Año</option>
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonRow count={12} />
      ) : filtered.length === 0 ? (
        <p className="empty-hint">No hay películas {genre !== 'Todas' ? `en "${genre}"` : 'todavía'}.</p>
      ) : (
        <motion.div className="card-grid" layout>
          {filtered.map((m, i) => (
            <motion.div key={m.folder} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }}>
              <Card item={m} type="movie" />
            </motion.div>
          ))}
        </motion.div>
      )}

      <style>{`
        .page-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 26px; }
        .page-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 42px); letter-spacing: 1px; margin: 6px 0 0; }
        .filters { display: flex; gap: 10px; }
        .filters select { width: auto; }
        .empty-hint { color: var(--text-low); padding: 60px 0; text-align: center; }
      `}</style>
    </div>
  )
}
