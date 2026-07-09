import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLibrary } from '../../context/LibraryContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { assetUrl } from '../../utils/dataLoader.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'

export default function AdminDashboard() {
  const { movies, series, loading, deleteMovie, deleteSeries } = useLibrary()
  const { push } = useToast()
  const [pendingDelete, setPendingDelete] = useState(null)

  async function confirmDelete() {
    try {
      if (pendingDelete.kind === 'movie') await deleteMovie(pendingDelete.folder)
      else await deleteSeries(pendingDelete.folder)
      push(`"${pendingDelete.title}" eliminado.`)
    } catch (e) {
      push('No se pudo eliminar.', 'error')
    }
    setPendingDelete(null)
  }

  return (
    <div>
      <h1 className="admin-title">Tu catálogo</h1>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Películas ({movies.length})</h2>
          <Link to="/admin/peliculas/nueva" className="btn btn-primary">+ Agregar película</Link>
        </div>
        {loading ? <p className="empty-hint">Cargando…</p> : movies.length === 0 ? (
          <p className="empty-hint">Todavía no agregaste ninguna película.</p>
        ) : (
          <div className="admin-list">
            {movies.map((m, i) => (
              <motion.div key={m.folder} className="admin-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div className="row-thumb">{m.cover ? <img src={assetUrl(m.cover)} alt="" /> : <span>{m.title[0]}</span>}</div>
                <div className="row-info">
                  <strong>{m.title}</strong>
                  <p>{m.year || '—'} · {m.rating || 'Sin clasificación'} · {m.duration || 0} min</p>
                </div>
                <div className="row-actions">
                  <Link to={`/admin/peliculas/${m.folder}/editar`} className="btn btn-secondary">Editar</Link>
                  <button className="btn btn-danger" onClick={() => setPendingDelete({ kind: 'movie', folder: m.folder, title: m.title })}>Eliminar</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Series ({series.length})</h2>
          <Link to="/admin/series/nueva" className="btn btn-primary">+ Agregar serie</Link>
        </div>
        {loading ? <p className="empty-hint">Cargando…</p> : series.length === 0 ? (
          <p className="empty-hint">Todavía no agregaste ninguna serie.</p>
        ) : (
          <div className="admin-list">
            {series.map((s, i) => (
              <motion.div key={s.folder} className="admin-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div className="row-thumb">{s.cover ? <img src={assetUrl(s.cover)} alt="" /> : <span>{s.title[0]}</span>}</div>
                <div className="row-info">
                  <strong>{s.title}</strong>
                  <p>{s.year || '—'} · {(s.seasonNumbers || []).length} temporada{(s.seasonNumbers || []).length !== 1 ? 's' : ''}</p>
                </div>
                <div className="row-actions">
                  <Link to={`/admin/series/${s.folder}/gestionar`} className="btn btn-primary">Temporadas y episodios</Link>
                  <Link to={`/admin/series/${s.folder}/editar`} className="btn btn-secondary">Editar</Link>
                  <button className="btn btn-danger" onClick={() => setPendingDelete({ kind: 'series', folder: s.folder, title: s.title })}>Eliminar</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Eliminar "${pendingDelete?.title}"`}
        description="Esta acción borrará sus archivos JSON y no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <style>{`
        .admin-title { font-family: var(--font-display); font-size: clamp(26px, 4vw, 36px); letter-spacing: 1px; margin: 0 0 24px; }
        .admin-section { margin-bottom: 40px; }
        .admin-section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
        .admin-section-head h2 { font-size: 17px; margin: 0; }
        .admin-list { display: flex; flex-direction: column; gap: 10px; }
        .admin-row { display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--line); background: var(--bg-panel); flex-wrap: wrap; }
        .row-thumb { width: 52px; height: 72px; border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-panel-raised); display: grid; place-items: center; flex-shrink: 0; font-family: var(--font-display); color: var(--text-low); }
        .row-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .row-info { flex: 1; min-width: 160px; }
        .row-info p { margin: 2px 0 0; color: var(--text-mid); font-size: 13px; }
        .row-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .empty-hint { color: var(--text-low); }
      `}</style>
    </div>
  )
}
