import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLibrary } from '../context/LibraryContext.jsx'
import Card from '../components/Card.jsx'
import { SkeletonRow } from '../components/SkeletonCard.jsx'

export default function Series() {
  const { series, loading } = useLibrary()
  const [genre, setGenre] = useState('Todas')

  const genres = useMemo(() => {
    const set = new Set()
    series.forEach((s) => (s.genres || []).forEach((g) => set.add(g)))
    return ['Todas', ...Array.from(set)]
  }, [series])

  const filtered = useMemo(() => (
    genre === 'Todas' ? series : series.filter((s) => (s.genres || []).includes(genre))
  ), [series, genre])

  return (
    <div className="container" style={{ paddingTop: 32 }}>
      <div className="page-header">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1 className="page-title">Series</h1>
        </div>
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          {genres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {loading ? (
        <SkeletonRow count={12} />
      ) : filtered.length === 0 ? (
        <p className="empty-hint">No hay series {genre !== 'Todas' ? `en "${genre}"` : 'todavía'}.</p>
      ) : (
        <motion.div className="card-grid" layout>
          {filtered.map((s, i) => (
            <motion.div key={s.folder} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }}>
              <Card item={s} type="series" />
            </motion.div>
          ))}
        </motion.div>
      )}

      <style>{`
        .page-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 26px; }
        .page-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 42px); letter-spacing: 1px; margin: 6px 0 0; }
        .page-header select { width: auto; }
        .empty-hint { color: var(--text-low); padding: 60px 0; text-align: center; }
      `}</style>
    </div>
  )
}
