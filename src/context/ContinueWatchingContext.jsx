import React, { createContext, useContext, useState, useCallback } from 'react'

const KEY = 'lumen:continue-watching'
const ContinueWatchingContext = createContext(null)

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function useContinueWatching() {
  const ctx = useContext(ContinueWatchingContext)
  if (!ctx) throw new Error('useContinueWatching debe usarse dentro de ContinueWatchingProvider')
  return ctx
}

export function ContinueWatchingProvider({ children }) {
  const [entries, setEntries] = useState(read)

  const updateProgress = useCallback((id, entry) => {
    setEntries((prev) => {
      const next = { ...prev, [id]: { ...prev[id], ...entry, updatedAt: Date.now() } }
      write(next)
      return next
    })
  }, [])

  const removeProgress = useCallback((id) => {
    setEntries((prev) => {
      const next = { ...prev }
      delete next[id]
      write(next)
      return next
    })
  }, [])

  const getProgress = useCallback((id) => entries[id], [entries])

  const list = Object.entries(entries)
    .map(([id, e]) => ({ id, ...e }))
    .sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <ContinueWatchingContext.Provider value={{ entries, list, updateProgress, removeProgress, getProgress }}>
      {children}
    </ContinueWatchingContext.Provider>
  )
}
