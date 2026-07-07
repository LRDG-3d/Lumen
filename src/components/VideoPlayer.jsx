import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function VideoPlayer({ id, title, subtitle, videoUrl, poster, onProgress, initialTime = 0, autoPlay = true }) {
  const videoRef = useRef(null)
  const navigate = useNavigate()
  const lastSaved = useRef(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function onLoaded() {
      if (initialTime && initialTime < video.duration - 5) {
        video.currentTime = initialTime
      }
    }
    function onTimeUpdate() {
      if (Math.abs(video.currentTime - lastSaved.current) > 3) {
        lastSaved.current = video.currentTime
        onProgress?.(video.currentTime, video.duration)
      }
    }
    function onEnded() {
      onProgress?.(video.duration, video.duration)
    }

    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    return () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [videoUrl, initialTime, onProgress])

  return (
    <motion.div className="player-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Volver">← Volver</button>

      {videoUrl ? (
        <video
          ref={videoRef}
          key={videoUrl}
          src={videoUrl}
          poster={poster}
          controls
          autoPlay={autoPlay}
          playsInline
          className="video-el"
        />
      ) : (
        <div className="no-source">
          <p>Esta película o episodio todavía no tiene una URL de video configurada.</p>
          <p className="hint">Agrega la URL desde el panel de administración.</p>
        </div>
      )}

      <div className="player-meta">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <style>{`
        .player-wrap { position: relative; background: #000; min-height: 100vh; }
        .video-el { width: 100%; max-height: 82vh; display: block; background: #000; }
        .back-btn {
          position: absolute; top: 18px; left: 18px; z-index: 5; background: rgba(10,14,24,0.7);
          border: 1px solid var(--line); color: var(--text-hi); padding: 8px 14px; border-radius: 100px;
          font-weight: 600; backdrop-filter: blur(8px);
        }
        .player-meta { padding: 20px clamp(16px, 4vw, 56px) 60px; }
        .player-meta h1 { font-family: var(--font-display); font-size: clamp(22px, 3vw, 32px); margin: 0 0 8px; }
        .player-meta p { color: var(--text-mid); max-width: 720px; line-height: 1.6; }
        .no-source {
          min-height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; color: var(--text-mid); gap: 6px; padding: 40px;
        }
        .hint { color: var(--yellow); font-size: 13px; }
      `}</style>
    </motion.div>
  )
}
