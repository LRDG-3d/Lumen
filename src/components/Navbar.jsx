import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/peliculas', label: 'Películas' },
  { to: '/series', label: 'Series' },
  { to: '/categorias', label: 'Categorías' }
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function submitSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
    }
  }

  return (
    <motion.header
      className="navbar"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 18 }}
      style={{
        background: scrolled ? 'rgba(7,11,20,0.86)' : 'linear-gradient(180deg, rgba(7,11,20,0.9), transparent)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent'
      }}
    >
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">L</span>
          <span className="brand-word">LUMEN</span>
        </NavLink>

        <nav className="nav-links desktop-only">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form className="nav-search desktop-only" onSubmit={submitSearch}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar títulos, géneros..."
            aria-label="Buscar"
          />
        </form>

        <NavLink to="/admin" className="admin-pill desktop-only">Administración</NavLink>

        <button className="hamburger mobile-only" onClick={() => setOpen((o) => !o)} aria-label="Abrir menú">
          <span style={{ transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }} />
          <span style={{ opacity: open ? 0 : 1 }} />
          <span style={{ transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <form className="nav-search" onSubmit={submitSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." />
            </form>
            {LINKS.map((l, i) => (
              <motion.div key={l.to} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}>
                <NavLink to={l.to} end={l.to === '/'} className="mobile-link" onClick={() => setOpen(false)}>{l.label}</NavLink>
              </motion.div>
            ))}
            <NavLink to="/admin" className="mobile-link admin" onClick={() => setOpen(false)}>Administración</NavLink>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .navbar { position: sticky; top: 0; z-index: 100; width: 100%; }
        .navbar-inner { display: flex; align-items: center; gap: 28px; height: 68px; }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-mark {
          width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center;
          background: linear-gradient(135deg, var(--yellow), var(--blue));
          font-family: var(--font-display); font-size: 20px; color: #0A0F1E;
        }
        .brand-word { font-family: var(--font-display); font-size: 22px; letter-spacing: 2px; }
        .nav-links { display: flex; gap: 22px; }
        .nav-link { color: var(--text-mid); font-weight: 600; font-size: 14.5px; position: relative; padding: 6px 0; }
        .nav-link.active { color: var(--text-hi); }
        .nav-link.active::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: -4px; height: 2px;
          background: linear-gradient(90deg, var(--yellow), var(--blue)); border-radius: 2px;
        }
        .nav-search {
          margin-left: auto; display: flex; align-items: center; gap: 8px;
          background: var(--bg-panel); border: 1px solid var(--line); border-radius: 100px;
          padding: 8px 14px; color: var(--text-low); flex: 1; max-width: 280px;
        }
        .nav-search input { background: transparent; border: none; padding: 0; }
        .nav-search input:focus { box-shadow: none; }
        .admin-pill {
          border: 1px solid var(--yellow); color: var(--yellow); padding: 8px 16px;
          border-radius: 100px; font-weight: 700; font-size: 13px; white-space: nowrap;
          transition: background 0.15s;
        }
        .admin-pill:hover { background: rgba(255,201,60,0.12); }
        .hamburger { background: none; border: none; display: flex; flex-direction: column; gap: 5px; padding: 6px; }
        .hamburger span { width: 22px; height: 2px; background: var(--text-hi); border-radius: 2px; transition: all 0.2s; }
        .mobile-menu { overflow: hidden; background: var(--bg-panel); border-bottom: 1px solid var(--line); padding: 0 16px; }
        .mobile-link { display: block; padding: 14px 4px; font-weight: 700; border-bottom: 1px solid var(--line); }
        .mobile-link.admin { color: var(--yellow); }
        .desktop-only { display: flex; }
        .mobile-only { display: none; background: none; border: none; }
        @media (max-width: 900px) {
          .desktop-only { display: none; }
          .mobile-only { display: flex; }
          .navbar-inner { gap: 12px; }
        }
      `}</style>
    </motion.header>
  )
}
