import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="container not-found">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="eyebrow">Error 404</span>
        <h1>Esta escena no existe</h1>
        <p>El contenido que buscas no está en el catálogo.</p>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </motion.div>
      <style>{`
        .not-found { min-height: 60vh; display: flex; align-items: center; justify-content: center; text-align: center; flex-direction: column; }
        .not-found h1 { font-family: var(--font-display); font-size: clamp(32px, 6vw, 56px); margin: 10px 0 12px; }
        .not-found p { color: var(--text-mid); margin-bottom: 22px; }
      `}</style>
    </div>
  )
}
