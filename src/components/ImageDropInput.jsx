import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ImageDropInput({ label, existingUrl, onFile, ratio = '2 / 3' }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(existingUrl || null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => setPreview(existingUrl || null), [existingUrl])

  function handleFiles(files) {
    const file = files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    onFile(file)
  }

  return (
    <div className="field">
      <label>{label}</label>
      <motion.div
        className={`drop-zone ${dragOver ? 'drag' : ''}`}
        style={{ aspectRatio: ratio }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        whileHover={{ scale: 1.01 }}
      >
        {preview ? (
          <img src={preview} alt="" />
        ) : (
          <div className="drop-placeholder">
            <span>⤴</span>
            <p>Arrastra una imagen o haz clic para subirla</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
      </motion.div>

      <style>{`
        .drop-zone {
          border: 1.5px dashed var(--line); border-radius: var(--radius-md); overflow: hidden;
          background: var(--bg-panel); cursor: pointer; position: relative; max-width: 260px;
          display: flex; align-items: center; justify-content: center;
        }
        .drop-zone.drag { border-color: var(--yellow); background: rgba(255,201,60,0.06); }
        .drop-zone img { width: 100%; height: 100%; object-fit: cover; }
        .drop-placeholder { text-align: center; color: var(--text-low); padding: 16px; font-size: 12.5px; }
        .drop-placeholder span { font-size: 22px; display: block; margin-bottom: 6px; color: var(--blue-glow); }
      `}</style>
    </div>
  )
}
