import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const LINKS = [
  { to: '/', label: 'Inicio', icon: '⌂' },
  { to: '/peliculas', label: 'Películas', icon: '▭' },
  { to: '/series', label: 'Series', icon: '▤' },
  { to: '/admin', label: 'Configuración', icon: '⚙' }
]

function NavList({ onNavigate, listId }) {
  return (
    <nav className="side-nav">
      {LINKS.map((l, i) => (
        <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
          {({ isActive }) => (
            <motion.span
              className="side-link-inner"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {isActive && (
                <motion.span
                  layoutId={`active-pill-${listId}`}
                  className="active-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <motion.span className="side-icon" whileHover={{ scale: 1.15, rotate: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
                {l.icon}
              </motion.span>
              <span className="side-label">{l.label}</span>
            </motion.span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

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
        <NavLink to="/admin" className="admin-pill">⚙</NavLink>
      </header>

      <motion.aside
        className="sidebar desktop-only"
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 110, damping: 22 }}
      >
        <div className="sidebar-glow" />
        <NavLink to="/" className="brand">
          <motion.span className="brand-mark" whileHover={{ rotate: 8, scale: 1.06 }} transition={{ type: 'spring', stiffness: 300 }}>L</motion.span>
          <span className="brand-word">LUMEN</span>
        </NavLink>

        <form className="side-search" onSubmit={submitSearch}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." aria-label="Buscar" />
        </form>

        <NavList listId="desktop" />
      </motion.aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="sidebar mobile-drawer"
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
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

              <NavList listId="mobile" onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .sidebar {
          width: 232px; flex-shrink: 0; height: 100vh; position: sticky; top: 0;
          display: flex; flex-direction: column; gap: 22px; padding: 22px 16px;
          background: rgba(15, 22, 38, 0.85); backdrop-filter: blur(18px);
          border-right: 1px solid var(--line); overflow: hidden;
        }
        .sidebar-glow {
          position: absolute; top: -80px; left: -80px; width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,201,60,0.16), transparent 70%); pointer-events: none;
        }
        .brand { display: flex; align-items: center; gap: 10px; padding: 0 4px; position: relative; z-index: 1; }
        .brand-mark {
          width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center;
          background: linear-gradient(135deg, var(--yellow), var(--blue)); flex-shrink: 0;
          font-family: var(--font-display); font-size: 19px; color: #0A0F1E;
        }
        .brand-word { font-family: var(--font-display); font-size: 20px; letter-spacing: 2px; }

        .side-search {
          display: flex; align-items: center; gap: 8px; background: var(--bg-panel-raised);
          border: 1px solid var(--line); border-radius: 100px; padding: 9px 14px; color: var(--text-low);
          position: relative; z-index: 1;
        }
        .side-search input { background: transparent; border: none; padding: 0; font-size: 13.5px; }
        .side-search input:focus { box-shadow: none; }

        .side-nav { display: flex; flex-direction: column; gap: 4px; position: relative; z-index: 1; }
        .side-link { border-radius: var(--radius-sm); overflow: hidden; }
        .side-link-inner {
          position: relative; display: flex; align-items: center; gap: 12px; padding: 11px 12px;
          color: var(--text-mid); font-weight: 600; font-size: 14px; border-radius: var(--radius-sm);
          transition: color 0.2s;
        }
        .side-link:hover .side-link-inner { color: var(--text-hi); }
        .side-link.active .side-link-inner { color: #191204; font-weight: 800; }
        .active-pill {
          position: absolute; inset: 0; border-radius: var(--radius-sm);
          background: linear-gradient(120deg, var(--yellow), var(--blue-glow)); z-index: -1;
          box-shadow: 0 6px 18px -6px rgba(255,201,60,0.5);
        }
        .side-icon { width: 18px; text-align: center; font-size: 15px; display: inline-block; }
        .side-label { position: relative; }

        .mobile-topbar {
          display: none; align-items: center; justify-content: space-between; gap: 12px;
          padding: 14px 16px; position: sticky; top: 0; z-index: 90;
          background: rgba(7,11,20,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line);
        }
        .hamburger, .close-btn { background: none; border: none; color: var(--text-hi); font-size: 20px; }
        .admin-pill {
          border: 1px solid var(--yellow); color: var(--yellow); width: 34px; height: 34px; border-radius: 50%;
          display: grid; place-items: center; font-size: 15px;
        }

        .drawer-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 150; }
        .mobile-drawer { position: fixed; top: 0; left: 0; z-index: 160; }
        .drawer-head { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }

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
