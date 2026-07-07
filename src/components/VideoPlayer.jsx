import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export default function VideoPlayer({
  title,
  subtitle,
  videoUrl,
  poster,
  onProgress,
  initialTime = 0,
  autoPlay = true,
  onNext,
  onPrevious
}) {
  const videoRef = useRef(null)
  const wrapRef = useRef(null)
  const hideTimer = useRef(null)
  const lastSaved = useRef(0)
  const navigate = useNavigate()

  const [playing, setPlaying] = useState(autoPlay)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [loop, setLoop] = useState(false)
  const [shuffleOn, setShuffleOn] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [scrubbing, setScrubbing] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function onLoaded() {
      setDuration(video.duration)
      if (initialTime && initialTime < video.duration - 5) video.currentTime = initialTime
    }
    function onTimeUpdate() {
      if (!scrubbing) setCurrent(video.currentTime)
      if (video.buffered.length) setBuffered(video.buffered.end(video.buffered.length - 1))
      if (Math.abs(video.currentTime - lastSaved.current) > 3) {
        lastSaved.current = video.currentTime
        onProgress?.(video.currentTime, video.duration)
      }
    }
    function onEnded() {
      onProgress?.(video.duration, video.duration)
      setPlaying(false)
      if (onNext) onNext()
    }
    function onPlay() { setPlaying(true) }
    function onPause() { setPlaying(false) }

    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    return () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [videoUrl, initialTime, onProgress, onNext, scrubbing])

  useEffect(() => {
    function onFsChange() { setFullscreen(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false)
    }, 3000)
  }, [])

  useEffect(() => {
    resetHideTimer()
    return () => clearTimeout(hideTimer.current)
  }, [resetHideTimer])

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
    resetHideTimer()
  }

  function skip(delta) {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(Math.max(0, video.currentTime + delta), duration || video.duration)
    resetHideTimer()
  }

  function seekTo(fraction) {
    const video = videoRef.current
    if (!video || !duration) return
    video.currentTime = fraction * duration
    setCurrent(fraction * duration)
  }

  function handleScrub(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    seekTo(fraction)
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  function changeVolume(v) {
    const video = videoRef.current
    if (!video) return
    video.volume = v
    video.muted = v === 0
    setVolume(v)
    setMuted(v === 0)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) wrapRef.current?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  function stopAndExit() {
    const video = videoRef.current
    if (video) video.pause()
    navigate(-1)
  }

  const progressPct = duration ? (current / duration) * 100 : 0
  const bufferedPct = duration ? (buffered / duration) * 100 : 0

  return (
    <motion.div
      className="player-wrap"
      ref={wrapRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onPointerMove={resetHideTimer}
      onPointerDown={resetHideTimer}
      onClick={resetHideTimer}
    >
      <AnimatePresence>
        {controlsVisible && (
          <motion.div className="top-bar" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <button className="icon-btn" onClick={stopAndExit} aria-label="Volver">⌄</button>
            <div className="top-bar-spacer" />
            <button className="icon-btn" aria-label="Transmitir">▢</button>
            <button className="icon-btn" onClick={toggleFullscreen} aria-label="Pantalla completa">
              {fullscreen ? '⤢' : '⛶'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {videoUrl ? (
        <video
          ref={videoRef}
          key={videoUrl}
          src={videoUrl}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          playsInline
          className="video-el"
          onClick={(e) => { e.stopPropagation(); togglePlay() }}
        />
      ) : (
        <div className="no-source">
          <p>Esta película o episodio todavía no tiene una URL de video configurada.</p>
          <p className="hint">Agrega la URL desde el panel de administración.</p>
        </div>
      )}

      <AnimatePresence>
        {controlsVisible && (
          <motion.div className="bottom-bar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            <div
              className="scrub-track"
              onPointerDown={(e) => { setScrubbing(true); e.currentTarget.setPointerCapture(e.pointerId); handleScrub(e) }}
              onPointerUp={(e) => { setScrubbing(false); e.currentTarget.releasePointerCapture(e.pointerId) }}
              onPointerMove={(e) => { if (scrubbing) handleScrub(e) }}
              onClick={handleScrub}
            >
              <div className="scrub-buffered" style={{ width: `${bufferedPct}%` }} />
              <div className="scrub-fill" style={{ width: `${progressPct}%` }} />
              <div className="scrub-thumb" style={{ left: `${progressPct}%` }} />
            </div>

            <div className="bottom-row">
              <div className="now-playing">
                <strong>{title}</strong>
                {subtitle && <p>{subtitle}</p>}
                <span className="time-label">{formatTime(current)} / {formatTime(duration)}</span>
              </div>

              <div className="transport">
                <button className="icon-btn" onClick={onPrevious} disabled={!onPrevious} aria-label="Anterior">⏮</button>
                <button className="icon-btn" onClick={() => skip(-10)} aria-label="Retroceder 10 segundos">
                  <span className="skip-icon">10<small>↺</small></span>
                </button>
                <button className="icon-btn play-btn" onClick={togglePlay} aria-label={playing ? 'Pausar' : 'Reproducir'}>
                  {playing ? '❚❚' : '▶'}
                </button>
                <button className="icon-btn" onClick={() => skip(30)} aria-label="Avanzar 30 segundos">
                  <span className="skip-icon">30<small>↻</small></span>
                </button>
                <button className="icon-btn" onClick={onNext} disabled={!onNext} aria-label="Siguiente">⏭</button>
                <button className="icon-btn" onClick={stopAndExit} aria-label="Detener">■</button>
              </div>

              <div className="side-controls">
                <button className={`icon-btn ${shuffleOn ? 'active' : ''}`} onClick={() => setShuffleOn((v) => !v)} aria-label="Aleatorio">⇄</button>
                <button className={`icon-btn ${loop ? 'active' : ''}`} onClick={() => setLoop((v) => !v)} aria-label="Repetir">↻</button>
                <button className="icon-btn" aria-label="Lista de reproducción">☰</button>
                <div className="volume-control">
                  <button className="icon-btn" onClick={toggleMute} aria-label="Silenciar">{muted || volume === 0 ? '🔇' : '🔊'}</button>
                  <input
                    type="range"
                    min="0" max="1" step="0.01"
                    value={muted ? 0 : volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                    className="volume-slider"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .player-wrap { position: relative; background: #000; min-height: 100vh; overflow: hidden; cursor: default; }
        .video-el { width: 100%; height: 100vh; display: block; background: #000; object-fit: contain; cursor: pointer; }

        .top-bar {
          position: absolute; top: 0; left: 0; right: 0; z-index: 6; display: flex; align-items: center; gap: 10px;
          padding: 14px 22px; background: linear-gradient(180deg, rgba(0,0,0,0.75), transparent);
        }
        .top-bar-spacer { flex: 1; }

        .icon-btn {
          background: transparent; border: none; color: #f2f2f2; font-size: 16px; width: 38px; height: 38px;
          border-radius: 50%; display: grid; place-items: center; transition: background 0.15s, color 0.15s;
        }
        .icon-btn:hover:not(:disabled) { background: rgba(255,255,255,0.12); }
        .icon-btn:disabled { opacity: 0.3; }
        .icon-btn.active { color: var(--yellow, #FFC93C); }

        .bottom-bar {
          position: absolute; left: 0; right: 0; bottom: 0; z-index: 6;
          background: linear-gradient(0deg, rgba(0,0,0,0.88) 30%, transparent);
          padding: 30px 22px 16px;
        }

        .scrub-track {
          position: relative; height: 4px; border-radius: 4px; background: rgba(255,255,255,0.22);
          margin-bottom: 14px; cursor: pointer; touch-action: none;
        }
        .scrub-buffered { position: absolute; top: 0; left: 0; height: 100%; background: rgba(255,255,255,0.35); border-radius: 4px; }
        .scrub-fill { position: absolute; top: 0; left: 0; height: 100%; background: var(--yellow, #FFC93C); border-radius: 4px; }
        .scrub-thumb {
          position: absolute; top: 50%; width: 12px; height: 12px; border-radius: 50%; background: var(--yellow, #FFC93C);
          transform: translate(-50%, -50%); box-shadow: 0 0 0 4px rgba(255,201,60,0.2);
        }

        .bottom-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }

        .now-playing { min-width: 0; flex: 1; color: #fff; }
        .now-playing strong { display: block; font-size: 14px; font-weight: 700; }
        .now-playing p { margin: 2px 0 0; font-size: 12.5px; color: rgba(255,255,255,0.65); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .time-label { font-size: 11.5px; color: rgba(255,255,255,0.5); }

        .transport { display: flex; align-items: center; gap: 4px; }
        .play-btn { width: 44px; height: 44px; background: rgba(255,255,255,0.08); font-size: 16px; }
        .play-btn:hover { background: rgba(255,255,255,0.18); }
        .skip-icon { position: relative; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; gap: 1px; }
        .skip-icon small { font-size: 13px; }

        .side-controls { display: flex; align-items: center; gap: 2px; }
        .volume-control { display: flex; align-items: center; gap: 4px; }
        .volume-slider { width: 70px; accent-color: var(--yellow, #FFC93C); }

        .no-source {
          min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; color: #aaa; gap: 6px; padding: 40px;
        }
        .hint { color: var(--yellow, #FFC93C); font-size: 13px; }

        @media (max-width: 760px) {
          .top-bar { padding: 12px 14px; }
          .icon-btn { width: 44px; height: 44px; font-size: 17px; }

          .bottom-bar {
            padding: 18px 14px calc(14px + env(safe-area-inset-bottom, 0px));
          }
          .scrub-track { height: 6px; margin-bottom: 16px; }
          .scrub-thumb { width: 16px; height: 16px; }

          .bottom-row { flex-direction: column; align-items: stretch; gap: 12px; }
          .now-playing { text-align: center; order: 1; }
          .now-playing p { white-space: normal; }

          .transport { order: 2; justify-content: center; gap: 2px; }
          .play-btn { width: 52px; height: 52px; font-size: 18px; }

          .side-controls { order: 3; justify-content: center; }
          .side-controls .icon-btn:nth-child(1),
          .side-controls .icon-btn:nth-child(2),
          .side-controls .icon-btn:nth-child(3) { display: none; }
          .volume-slider { width: 90px; }
        }

        @media (max-width: 420px) {
          .transport .icon-btn:first-child,
          .transport .icon-btn:nth-child(5) { display: none; }
        }
      `}</style>
    </motion.div>
  )
}
