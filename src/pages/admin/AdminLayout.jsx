import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLibrary } from '../../context/LibraryContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function AdminLayout() {
  const { fsSupported, folderConnected, folderName, connectFolder, disconnectFolder } = useLibrary()
  const { push } = useToast()

  async function handleConnect() {
    try {
      const name = await connectFolder()
      push(`Carpeta "${name}" conectada. Los cambios ahora se guardan en disco.`)
    } catch (e) {
      if (e.message === 'NOT_SUPPORTED') {
        push('Tu navegador no soporta guardado directo en disco. Los archivos se descargarán en su lugar.', 'error')
      } else {
        push('No se pudo conectar la carpeta.', 'error')
      }
    }
  }

  return (
    <div className="admin-shell">
      <motion.div className="status-bar" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="container status-inner">
          <div>
            <strong>Panel de administración</strong>
            <p>
              {folderConnected
                ? <>Conectado a <code>{folderName}</code> — además de guardarse en este navegador, se escribe directo en tus archivos.</>
                : 'Todo se guarda automáticamente en este navegador. Para que se vea en el sitio publicado para otras personas, conecta la carpeta del proyecto (opcional, avanzado).'}
            </p>
          </div>
          {fsSupported && (
            folderConnected
              ? <button className="btn btn-secondary" onClick={disconnectFolder}>Desconectar</button>
              : <button className="btn btn-primary" onClick={handleConnect}>Conectar carpeta "public"</button>
          )}
        </div>
      </motion.div>

      <div className="container admin-grid">
        <aside className="admin-nav">
          <NavLink to="/admin" end className="admin-nav-link">Panel</NavLink>
          <NavLink to="/admin/peliculas/nueva" className="admin-nav-link">+ Nueva película</NavLink>
          <NavLink to="/admin/series/nueva" className="admin-nav-link">+ Nueva serie</NavLink>
          <NavLink to="/" className="admin-nav-link back">← Ver plataforma</NavLink>
        </aside>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-shell { min-height: 100vh; padding-bottom: 60px; }
        .status-bar { background: var(--bg-panel); border-bottom: 1px solid var(--line); padding: 14px 0; }
        .status-inner { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
        .status-inner strong { font-size: 14px; }
        .status-inner p { margin: 2px 0 0; color: var(--text-mid); font-size: 13px; }
        .status-inner code { color: var(--yellow); }
        .admin-grid { display: grid; grid-template-columns: 220px 1fr; gap: 32px; padding-top: 30px; }
        .admin-nav { display: flex; flex-direction: column; gap: 6px; }
        .admin-nav-link { padding: 10px 14px; border-radius: var(--radius-sm); font-weight: 700; font-size: 14px; color: var(--text-mid); }
        .admin-nav-link.active { background: var(--bg-panel-raised); color: var(--text-hi); }
        .admin-nav-link.back { margin-top: 14px; color: var(--blue-glow); }
        @media (max-width: 800px) {
          .admin-grid { grid-template-columns: 1fr; }
          .admin-nav { flex-direction: row; overflow-x: auto; }
        }
      `}</style>
    </div>
  )
}
