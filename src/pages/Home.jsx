import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLibrary } from '../context/LibraryContext.jsx'
import { useContinueWatching } from '../context/ContinueWatchingContext.jsx'
import Hero from '../components/Hero.jsx'
import Carousel from '../components/Carousel.jsx'
import Card from '../components/Card.jsx'
import { SkeletonRow } from '../components/SkeletonCard.jsx'

export default function Home() {
  const { movies, series, loading } = useLibrary()
  const { list: continueList } = useContinueWatching()

  const featured = useMemo(() => {
    const all = [...movies.map((m) => ({ ...m, _type: 'movie' })), ...series.map((s) => ({ ...s, _type: 'series' }))]
    if (all.length === 0) return null
    return all[Math.floor(Math.random() * all.length) % all.length]
  }, [movies, series])

  const continueItems = useMemo(() => {
    return continueList
      .map((entry) => {
        const type = entry.type === 'series' ? 'series' : 'movie'
        const source = type === 'movie' ? movies : series
        const folder = entry.folder
        const item = source.find((x) => x.folder === folder)
        if (!item) return null
        const pct = entry.duration ? Math.min(100, (entry.position / entry.duration) * 100) : 0
        return { item, type, pct, id: entry.id }
      })
      .filter(Boolean)
      .slice(0, 12)
  }, [continueList, movies, series])

  const hasContent = movies.length > 0 || series.length > 0

  return (
    <div>
      {loading ? (
        <div className="hero-skeleton shimmer" />
      ) : featured ? (
        <Hero item={featured} type={featured._type === 'movie' ? 'movie' : 'series'} />
      ) : (
        <EmptyHero />
      )}

      <div className="container" style={{ marginTop: 34 }}>
        {continueItems.length > 0 && (
          <section className="carousel-section">
            <span className="eyebrow">Retomar</span>
            <h2 className="section-title">Continuar viendo</h2>
            <div className="card-grid">
              {continueItems.map(({ item, type, pct }, i) => (
                <motion.div key={item.folder + type} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card item={item} type={type} progress={pct} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <Carousel title="Películas" eyebrow="Catálogo" items={movies} type="movie" loading={loading} />
        <Carousel title="Series" eyebrow="Catálogo" items={series} type="series" loading={loading} />

        {!loading && !hasContent && (
          <div className="empty-state glass">
            <h3>Tu biblioteca está vacía</h3>
            <p>Agrega tu primera película o serie desde el panel de administración.</p>
            <Link to="/admin" className="btn btn-primary">Ir a Administración</Link>
          </div>
        )}
      </div>

      <style>{`
        .hero-skeleton { height: min(78vh, 640px); min-height: 420px; background: var(--bg-panel-raised); }
        .empty-state { text-align: center; padding: 64px 24px; border-radius: var(--radius-lg); margin-top: 40px; }
        .empty-state h3 { font-family: var(--font-display); font-size: 24px; margin-bottom: 8px; }
        .empty-state p { color: var(--text-mid); margin-bottom: 20px; }
      `}</style>
    </div>
  )
}

function EmptyHero() {
  return (
    <div className="empty-hero">
      <div className="container">
        <span className="eyebrow">Bienvenido</span>
        <h1>LUMEN</h1>
        <p>Agrega películas y series desde el panel de administración para empezar a construir tu catálogo.</p>
        <Link to="/admin" className="btn btn-primary">Abrir administración</Link>
      </div>
      <style>{`
        .empty-hero { padding: 120px 0 80px; background: radial-gradient(60% 60% at 50% 0%, rgba(46,111,242,0.18), transparent), var(--bg-deep); }
        .empty-hero h1 { font-family: var(--font-display); font-size: clamp(40px, 8vw, 80px); margin: 10px 0 16px; letter-spacing: 2px; }
        .empty-hero p { color: var(--text-mid); max-width: 480px; margin-bottom: 24px; }
      `}</style>
    </div>
  )
}
