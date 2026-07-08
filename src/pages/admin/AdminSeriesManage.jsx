import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLibrary } from '../../context/LibraryContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import ImageDropInput from '../../components/ImageDropInput.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { assetUrl } from '../../utils/dataLoader.js'
import { detectEpisodesFromUrl, cleanTitle } from '../../utils/importEpisodes.js'

const emptyEpisode = { episodeNumber: '', title: '', description: '', duration: '', videoUrl: '' }

export default function AdminSeriesManage() {
  const { folder } = useParams()
  const { series, loadSeasons, addSeason, deleteSeason, addEpisode, deleteEpisode } = useLibrary()
  const { push } = useToast()
  const show = series.find((s) => s.folder === folder)

  const [activeSeason, setActiveSeason] = useState(null)
  const [newSeasonNumber, setNewSeasonNumber] = useState('')
  const [episodeForm, setEpisodeForm] = useState(emptyEpisode)
  const [thumb, setThumb] = useState(null)
  const [editingEpisode, setEditingEpisode] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [saving, setSaving] = useState(false)

  const [importUrl, setImportUrl] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importRows, setImportRows] = useState(null)
  const [importSelected, setImportSelected] = useState({})
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (show) {
      loadSeasons(folder).then((data) => {
        const nums = Object.keys(data).map(Number).sort((a, b) => a - b)
        if (nums.length) setActiveSeason((prev) => prev ?? nums[0])
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder])

  const episodes = useMemo(() => show?.seasons?.[activeSeason]?.episodes || [], [show, activeSeason])

  if (!show) return <p className="empty-hint">Cargando…</p>

  async function handleAddSeason(e) {
    e.preventDefault()
    const num = Number(newSeasonNumber)
    if (!num || num < 1) return push('Ingresa un número de temporada válido.', 'error')
    try {
      await addSeason(folder, num)
      setActiveSeason(num)
      setNewSeasonNumber('')
      push(`Temporada ${num} creada.`)
    } catch (err) {
      push(err.message, 'error')
    }
  }

  function startEditEpisode(ep) {
    setEditingEpisode(ep.episodeNumber)
    setEpisodeForm({
      episodeNumber: ep.episodeNumber,
      title: ep.title,
      description: ep.description,
      duration: ep.duration,
      videoUrl: ep.videoUrl
    })
    setThumb(null)
  }

  function resetEpisodeForm() {
    setEditingEpisode(null)
    setEpisodeForm(emptyEpisode)
    setThumb(null)
  }

  async function handleEpisodeSubmit(e) {
    e.preventDefault()
    if (!episodeForm.episodeNumber) return push('El número de episodio es obligatorio.', 'error')
    setSaving(true)
    try {
      await addEpisode(folder, activeSeason, episodeForm, thumb)
      push(`Episodio ${episodeForm.episodeNumber} guardado.`)
      resetEpisodeForm()
    } catch (err) {
      push(err.message || 'Error al guardar el episodio.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDeleteSeason() {
    await deleteSeason(folder, pendingDelete.season)
    push(`Temporada ${pendingDelete.season} eliminada.`)
    setActiveSeason(null)
    setPendingDelete(null)
  }

  async function handleDeleteEpisode(num) {
    await deleteEpisode(folder, activeSeason, num)
    push(`Episodio ${num} eliminado.`)
  }

  async function handleDetectEpisodes(e) {
    e.preventDefault()
    if (!importUrl.trim()) return push('Pegá una URL primero.', 'error')
    setImportLoading(true)
    setImportRows(null)
    try {
      const rows = await detectEpisodesFromUrl(importUrl.trim())
      const withDefaults = rows.map((r, i) => ({
        ...r,
        key: `${r.name}-${i}`,
        season: r.season ?? activeSeason ?? 1,
        episode: r.episode ?? i + 1,
        title: cleanTitle(r.name, show.title)
      }))
      setImportRows(withDefaults)
      setImportSelected(Object.fromEntries(withDefaults.map((r) => [r.key, true])))
      push(`Se detectaron ${withDefaults.length} archivo(s) de video.`)
    } catch (err) {
      push(err.message || 'No se pudieron detectar episodios en esa URL.', 'error')
    } finally {
      setImportLoading(false)
    }
  }

  function updateImportRow(key, changes) {
    setImportRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...changes } : r)))
  }

  async function handleImportSelected() {
    const rows = (importRows || []).filter((r) => importSelected[r.key])
    if (rows.length === 0) return push('Marcá al menos un episodio para importar.', 'error')
    setImporting(true)
    try {
      const seasonsNeeded = [...new Set(rows.map((r) => Number(r.season)))]
      for (const num of seasonsNeeded) {
        if (!show.seasonNumbers.includes(num)) {
          await addSeason(folder, num)
        }
      }
      for (const row of rows) {
        await addEpisode(folder, Number(row.season), {
          episodeNumber: Number(row.episode),
          title: row.title,
          description: '',
          duration: 0,
          videoUrl: row.url
        }, null)
      }
      push(`${rows.length} episodio(s) importado(s).`)
      setImportRows(null)
      setImportUrl('')
      setActiveSeason(Number(rows[0].season))
    } catch (err) {
      push(err.message || 'Error al importar los episodios.', 'error')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <div className="manage-header">
        <div>
          <span className="eyebrow">Temporadas y episodios</span>
          <h1 className="admin-title">{show.title}</h1>
        </div>
        <Link to={`/admin/series/${folder}/editar`} className="btn btn-secondary">Editar datos de la serie</Link>
      </div>

      <div className="import-panel">
        <h2>Importar episodios automáticamente</h2>
        <p className="import-hint">
          Pegá la URL de un archivo o del ítem (ej. de archive.org) y detecta todos los videos disponibles,
          adivinando temporada y episodio por el nombre del archivo (S01E01, 1x01, etc.).
        </p>
        <form className="import-form" onSubmit={handleDetectEpisodes}>
          <input
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://archive.org/download/identificador/archivo.mp4"
          />
          <button className="btn btn-primary" type="submit" disabled={importLoading}>
            {importLoading ? 'Detectando…' : 'Detectar capítulos'}
          </button>
        </form>

        {importRows && (
          <div className="import-results">
            <div className="import-results-list">
              {importRows.map((row) => (
                <div key={row.key} className="import-row">
                  <input
                    type="checkbox"
                    checked={!!importSelected[row.key]}
                    onChange={(e) => setImportSelected((s) => ({ ...s, [row.key]: e.target.checked }))}
                  />
                  <input
                    type="number" min="1" className="mini-input"
                    value={row.season} onChange={(e) => updateImportRow(row.key, { season: e.target.value })}
                    title="Temporada"
                  />
                  <input
                    type="number" min="1" className="mini-input"
                    value={row.episode} onChange={(e) => updateImportRow(row.key, { episode: e.target.value })}
                    title="Episodio"
                  />
                  <input
                    className="title-input"
                    value={row.title} onChange={(e) => updateImportRow(row.key, { title: e.target.value })}
                  />
                  <span className="import-filename" title={row.name}>{row.name}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={handleImportSelected} disabled={importing}>
              {importing ? 'Importando…' : `Importar ${Object.values(importSelected).filter(Boolean).length} episodio(s)`}
            </button>
          </div>
        )}
      </div>

      <div className="season-tabs">
        {(show.seasonNumbers || []).map((num) => (
          <button key={num} className={`season-tab ${activeSeason === num ? 'active' : ''}`} onClick={() => { setActiveSeason(num); resetEpisodeForm() }}>
            Temporada {num}
          </button>
        ))}
        <form className="new-season-form" onSubmit={handleAddSeason}>
          <input type="number" min="1" placeholder="N° temporada" value={newSeasonNumber} onChange={(e) => setNewSeasonNumber(e.target.value)} />
          <button className="btn btn-primary" type="submit">+ Agregar temporada</button>
        </form>
      </div>

      {activeSeason && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={activeSeason} className="season-panel">
          <div className="season-panel-head">
            <h2>Episodios de la temporada {activeSeason}</h2>
            <button className="btn btn-danger" onClick={() => setPendingDelete({ season: activeSeason })}>Eliminar temporada</button>
          </div>

          <div className="episode-manage-list">
            <AnimatePresence>
              {episodes.map((ep) => (
                <motion.div key={ep.episodeNumber} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="episode-manage-row">
                  <div className="ep-thumb-sm">
                    {ep.thumbnail ? <img src={assetUrl(ep.thumbnail)} alt="" /> : <span>{ep.episodeNumber}</span>}
                  </div>
                  <div className="ep-manage-info">
                    <strong>{ep.episodeNumber}. {ep.title}</strong>
                    <p>{ep.duration || 0} min</p>
                  </div>
                  <div className="row-actions">
                    <button className="btn btn-secondary" onClick={() => startEditEpisode(ep)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => handleDeleteEpisode(ep.episodeNumber)}>Eliminar</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {episodes.length === 0 && <p className="empty-hint">Todavía no hay episodios en esta temporada.</p>}
          </div>

          <motion.form className="episode-form" onSubmit={handleEpisodeSubmit} layout>
            <h3>{editingEpisode ? `Editando episodio ${editingEpisode}` : 'Agregar episodio'}</h3>
            <div className="form-grid">
              <div className="form-main">
                <div className="field-row">
                  <div className="field">
                    <label>N° de episodio</label>
                    <input type="number" min="1" value={episodeForm.episodeNumber} onChange={(e) => setEpisodeForm((f) => ({ ...f, episodeNumber: e.target.value }))} disabled={!!editingEpisode} required />
                  </div>
                  <div className="field">
                    <label>Duración (min)</label>
                    <input type="number" value={episodeForm.duration} onChange={(e) => setEpisodeForm((f) => ({ ...f, duration: e.target.value }))} />
                  </div>
                </div>
                <div className="field">
                  <label>Título</label>
                  <input value={episodeForm.title} onChange={(e) => setEpisodeForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del episodio" />
                </div>
                <div className="field">
                  <label>Descripción</label>
                  <textarea rows={3} value={episodeForm.description} onChange={(e) => setEpisodeForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="field">
                  <label>URL del video</label>
                  <input value={episodeForm.videoUrl} onChange={(e) => setEpisodeForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div className="form-side">
                <ImageDropInput label="Miniatura" ratio="16 / 9" onFile={setThumb} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : editingEpisode ? 'Guardar cambios' : 'Agregar episodio'}</button>
              {editingEpisode && <button className="btn btn-secondary" type="button" onClick={resetEpisodeForm}>Cancelar edición</button>}
            </div>
          </motion.form>
        </motion.div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Eliminar temporada ${pendingDelete?.season}`}
        description="Se eliminarán todos sus episodios. Esta acción no se puede deshacer."
        onConfirm={confirmDeleteSeason}
        onCancel={() => setPendingDelete(null)}
      />

      <style>{`
        .manage-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
        .import-panel { background: var(--bg-panel); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 24px; }
        .import-panel h2 { font-size: 15px; margin: 0 0 6px; }
        .import-hint { color: var(--text-mid); font-size: 13px; margin: 0 0 14px; line-height: 1.5; }
        .import-form { display: flex; gap: 10px; flex-wrap: wrap; }
        .import-form input { flex: 1; min-width: 220px; }
        .import-results { margin-top: 18px; }
        .import-results-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; max-height: 320px; overflow-y: auto; }
        .import-row { display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--bg-panel-raised); }
        .import-row input[type="checkbox"] { width: auto; flex-shrink: 0; }
        .mini-input { width: 56px; flex-shrink: 0; padding: 8px; }
        .title-input { flex: 1; min-width: 120px; }
        .import-filename { color: var(--text-low); font-size: 11.5px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 0; }
        @media (max-width: 700px) {
          .import-filename { display: none; }
        }
        .admin-title { font-family: var(--font-display); font-size: clamp(24px, 4vw, 32px); letter-spacing: 1px; margin: 6px 0 0; }
        .season-tabs { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 24px; }
        .season-tab { background: var(--bg-panel-raised); border: 1px solid var(--line); color: var(--text-mid); padding: 9px 16px; border-radius: 100px; font-weight: 700; font-size: 13.5px; }
        .season-tab.active { color: #191204; background: linear-gradient(120deg, var(--yellow), var(--blue-glow)); }
        .new-season-form { display: flex; gap: 8px; margin-left: 8px; }
        .new-season-form input { width: 120px; }
        .season-panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .season-panel-head h2 { font-size: 16px; margin: 0; }
        .episode-manage-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 30px; }
        .episode-manage-row { display: flex; align-items: center; gap: 14px; padding: 10px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--bg-panel); }
        .ep-thumb-sm { width: 90px; aspect-ratio: 16/9; border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-panel-raised); display: grid; place-items: center; flex-shrink: 0; color: var(--text-low); font-family: var(--font-display); }
        .ep-thumb-sm img { width: 100%; height: 100%; object-fit: cover; }
        .ep-manage-info { flex: 1; }
        .ep-manage-info p { margin: 2px 0 0; color: var(--text-mid); font-size: 13px; }
        .episode-form { background: var(--bg-panel); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 24px; }
        .episode-form h3 { margin: 0 0 16px; font-size: 16px; }
        .form-grid { display: grid; grid-template-columns: 1fr 260px; gap: 24px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-actions { display: flex; gap: 10px; margin-top: 8px; }
        @media (max-width: 760px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}
