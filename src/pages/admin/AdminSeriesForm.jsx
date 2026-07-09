import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLibrary } from '../../context/LibraryContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import ImageDropInput from '../../components/ImageDropInput.jsx'
import { assetUrl } from '../../utils/dataLoader.js'

const emptyForm = { title: '', description: '', year: '', genres: '', rating: '' }

export default function AdminSeriesForm({ mode }) {
  const { folder } = useParams()
  const navigate = useNavigate()
  const { series, addSeries, updateSeries } = useLibrary()
  const { push } = useToast()
  const existing = mode === 'edit' ? series.find((s) => s.folder === folder) : null

  const [form, setForm] = useState(emptyForm)
  const [cover, setCover] = useState(null)
  const [banner, setBanner] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || '',
        description: existing.description || '',
        year: existing.year || '',
        genres: (existing.genres || []).join(', '),
        rating: existing.rating || ''
      })
    }
  }, [existing])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return push('El título es obligatorio.', 'error')
    setSaving(true)
    try {
      const payload = {
        ...form,
        genres: form.genres.split(',').map((g) => g.trim()).filter(Boolean)
      }
      if (mode === 'create') {
        const created = await addSeries(payload, cover, banner)
        push('Serie agregada. Ahora agrega temporadas y episodios.')
        navigate(`/admin/series/${encodeURIComponent(created.folder)}/gestionar`)
      } else {
        await updateSeries(folder, payload, cover, banner)
        push('Serie actualizada.')
        navigate('/admin')
      }
    } catch (err) {
      push(err.message || 'Ocurrió un error al guardar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (mode === 'edit' && !existing) return <p className="empty-hint">Cargando…</p>

  return (
    <motion.form className="admin-form" onSubmit={handleSubmit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="admin-title">{mode === 'create' ? 'Nueva serie' : `Editar "${existing?.title}"`}</h1>

      <div className="form-grid">
        <div className="form-main">
          <div className="field">
            <label>Título</label>
            <input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Ej. Corriente Oscura" required />
          </div>
          <div className="field">
            <label>Descripción</label>
            <textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Sinopsis de la serie..." />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Año</label>
              <input type="number" value={form.year} onChange={(e) => update('year', e.target.value)} placeholder="2026" />
            </div>
            <div className="field">
              <label>Clasificación</label>
              <input value={form.rating} onChange={(e) => update('rating', e.target.value)} placeholder="TV-14" />
            </div>
          </div>
          <div className="field">
            <label>Géneros (separados por coma)</label>
            <input value={form.genres} onChange={(e) => update('genres', e.target.value)} placeholder="Drama, Suspenso" />
          </div>
        </div>

        <div className="form-side">
          <ImageDropInput label="Portada (vertical)" existingUrl={existing?.cover ? assetUrl(existing.cover) : null} onFile={setCover} ratio="2 / 3" />
          <ImageDropInput label="Banner (horizontal)" existingUrl={existing?.banner ? assetUrl(existing.banner) : null} onFile={setBanner} ratio="16 / 9" />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Guardando…' : mode === 'create' ? 'Crear serie y continuar' : 'Guardar cambios'}
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => navigate('/admin')}>Cancelar</button>
      </div>

      <style>{`
        .admin-title { font-family: var(--font-display); font-size: clamp(24px, 4vw, 32px); letter-spacing: 1px; margin: 0 0 24px; }
        .form-grid { display: grid; grid-template-columns: 1fr 280px; gap: 30px; }
        .field-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .form-actions { display: flex; gap: 12px; margin-top: 10px; }
        @media (max-width: 800px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </motion.form>
  )
}
