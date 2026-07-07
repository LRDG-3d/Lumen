import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Eliminar', onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
          <motion.div
            className="dialog-box glass"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{title}</h3>
            <p>{description}</p>
            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
              <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
            </div>
          </motion.div>

          <style>{`
            .dialog-backdrop { position: fixed; inset: 0; background: rgba(4,6,12,0.6); z-index: 200; display: grid; place-items: center; padding: 20px; }
            .dialog-box { width: 100%; max-width: 380px; border-radius: var(--radius-lg); padding: 24px; }
            .dialog-box h3 { margin: 0 0 8px; font-family: var(--font-display); font-size: 20px; letter-spacing: 0.5px; }
            .dialog-box p { color: var(--text-mid); margin: 0 0 20px; font-size: 14px; line-height: 1.5; }
            .dialog-actions { display: flex; justify-content: flex-end; gap: 10px; }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
