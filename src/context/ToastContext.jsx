import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-stack">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast toast-${t.type}`}
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <style>{`
        .toast-stack { position: fixed; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 10px; z-index: 400; max-width: 320px; }
        .toast { padding: 13px 18px; border-radius: var(--radius-md); font-size: 13.5px; font-weight: 600; box-shadow: 0 10px 30px -8px rgba(0,0,0,0.5); }
        .toast-success { background: var(--bg-panel-raised); border: 1px solid var(--blue); color: var(--text-hi); }
        .toast-error { background: rgba(255,90,110,0.14); border: 1px solid var(--danger); color: var(--danger); }
        @media (max-width: 640px) { .toast-stack { left: 16px; right: 16px; max-width: none; } }
      `}</style>
    </ToastContext.Provider>
  )
}
