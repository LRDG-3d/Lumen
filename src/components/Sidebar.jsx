import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const LINKS = [
  { to: '/', label: 'Inicio', icon: '⌂' },
  { to: '/peliculas', label: 'Películas', icon: '▭' },
  { to: '/series', label: 'Series', icon: '▤' },
  { to: '/categorias', label: 'Categorías', icon: '◫' }
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function submitSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  return (
    <>
      <header className="mobile-topbar mobile-only">
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Abrir menú">☰</button>
        <NavLink to="/" className="brand">
          <span className="brand-mark">L</span>
          <span className="brand-word">LUMEN</span>
        </NavLink>
        <NavLink to="/admin" className="admin-pill">Admin</NavLink>
      </header>

      <motion.aside
        className="sidebar desktop-only"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <NavLink to="/" className="brand">
          <span className="brand-mark">L</span>
          <span className="brand-word">LUMEN</span>
        </NavLink>

        <form className="side-search" onSubmit={submitSearch}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." aria-label="Buscar" />
        </form>

        <nav className="side-nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
              <span className="side-icon">{l.icon}</span>{l.label}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/admin" className="side-admin-link">
          <span className="side-icon">⚙</span>Administración
        </NavLink>
      </motion.aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="sidebar mobile-drawer"
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            >
              <div className="drawer-head">
                <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
                  <span className="brand-mark">L</span>
                  <span className="brand-word">LUMEN</span>
                </NavLink>
                <button className="close-btn" onClick={() => setOpen(false)} aria-label="Cerrar menú">✕</button>
              </div>

              <form className="side-search" onSubmit={submitSearch}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." />
              </form>

              <nav className="side-nav">
                {LINKS.map((l) => (
                  <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
                    <span className="side-icon">{l.icon}</span>{l.label}
                  </NavLink>
                ))}
              </nav>

              <NavLink to="/admin" className="side-admin-link" onClick={() => setOpen(false)}>
                <span className="side-icon">⚙</span>Administración
              </NavLink>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .sidebar {
          width: 232px; flex-shrink: 0; height: 100vh; position: sticky; top: 0;
          display: flex; flex-direction: column; gap: 22px; padding: 22px 16px;
          background: var(--bg-panel); border-right: 1px solid var(--line);
        }
        .brand { display: flex; align-items: center; gap: 10px; padding: 0 4px; }
        .brand-mark {
          width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center;
          background: linear-gradient(135deg, var(--yellow), var(--blue)); flex-shrink: 0;
          font-family: var(--font-display); font-size: 19px; color: #0A0F1E;
        }
        .brand-word { font-family: var(--font-display); font-size: 20px; letter-spacing: 2px; }

        .side-search {
          display: flex; align-items: center; gap: 8px; background: var(--bg-panel-raised);
          border: 1px solid var(--line); border-radius: 100px; padding: 9px 14px; color: var(--text-low);
        }
        .side-search input { background: transparent; border: none; padding: 0; font-size: 13.5px; }
        .side-search input:focus { box-shadow: none; }

        .side-nav { display: flex; flex-direction: column; gap: 2px; }
        .side-link {
          display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--radius-sm);
          color: var(--text-mid); font-weight: 600; font-size: 14px; transition: background 0.15s, color 0.15s;
        }
        .side-link:hover { background: var(--bg-panel-raised); color: var(--text-hi); }
        .side-link.active { background: var(--bg-panel-raised); color: var(--text-hi); box-shadow: inset 3px 0 0 var(--yellow); }
        .side-icon { width: 18px; text-align: center; font-size: 15px; }

        .side-admin-link {
          margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 11px 12px;
          border: 1px solid var(--yellow); border-radius: var(--radius-sm); color: var(--yellow); font-weight: 700; font-size: 13.5px;
        }
        .side-admin-link:hover { background: rgba(255,201,60,0.1); }

        .mobile-topbar {
          display: none; align-items: center; justify-content: space-between; gap: 12px;
          padding: 14px 16px; position: sticky; top: 0; z-index: 90;
          background: rgba(7,11,20,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line);
        }
        .hamburger, .close-btn { background: none; border: none; color: var(--text-hi); font-size: 20px; }
        .admin-pill { border: 1px solid var(--yellow); color: var(--yellow); padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; }

        .drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 150; }
        .mobile-drawer { position: fixed; top: 0; left: 0; z-index: 160; }
        .drawer-head { display: flex; align-items: center; justify-content: space-between; }

        .desktop-only { display: flex; }
        .mobile-only { display: none; }
        @media (max-width: 900px) {
          .desktop-only.sidebar { display: none; }
          .mobile-only { display: flex; }
        }
      `}</style>
    </>
  )
}
