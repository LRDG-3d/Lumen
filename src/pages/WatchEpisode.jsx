import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLibrary } from '../context/LibraryContext.jsx'
import { useContinueWatching } from '../context/ContinueWatchingContext.jsx'
import { assetUrl } from '../utils/dataLoader.js'
import VideoPlayer from '../components/VideoPlayer.jsx'

export default function WatchEpisode() {
  const { folder, season, episode } = useParams()
  const seasonNumber = Number(season)
  const episodeNumber = Number(episode)
  const { series, loading, loadSeasons } = useLibrary()
  const { getProgress, updateProgress } = useContinueWatching()
  const navigate = useNavigate()
  const show = series.find((s) => s.folder === folder)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (show && !show.seasons?.[seasonNumber]) {
      loadSeasons(folder).then(() => setReady(true))
    } else {
      setReady(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, seasonNumber])

  const episodes = show?.seasons?.[seasonNumber]?.episodes || []
  const ep = episodes.find((e) => e.episodeNumber === episodeNumber)
  const epIndex = episodes.findIndex((e) => e.episodeNumber === episodeNumber)
  const nextEp = epIndex >= 0 ? episodes[epIndex + 1] : null
  const prevEp = epIndex >= 0 ? episodes[epIndex - 1] : null

  const id = `episode:${folder}-s${seasonNumber}e${episodeNumber}`
  const saved = getProgress(id)

  const onProgress = useCallback((position, duration) => {
    updateProgress(id, { position, duration, folder, type: 'series', season: seasonNumber, episode: episodeNumber, title: `${show?.title} · T${seasonNumber} E${episodeNumber}` })
  }, [id, folder, seasonNumber, episodeNumber, show, updateProgress])

  const goToEpisode = useCallback((targetEp) => {
    if (targetEp) navigate(`/ver/serie/${folder}/${seasonNumber}/${targetEp.episodeNumber}`)
  }, [navigate, folder, seasonNumber])

  if (loading || !ready) return null
  if (!show || !ep) return <div className="container" style={{ paddingTop: 40 }}><p>No se encontró este episodio.</p></div>

  return (
    <VideoPlayer
      title={show.title}
      subtitle={`T${seasonNumber} · E${episodeNumber} — ${ep.title}`}
      videoUrl={ep.videoUrl}
      poster={assetUrl(ep.thumbnail || show.banner || show.cover)}
      initialTime={saved?.position || 0}
      onProgress={onProgress}
      onNext={nextEp ? () => goToEpisode(nextEp) : undefined}
      onPrevious={prevEp ? () => goToEpisode(prevEp) : undefined}
    />
  )
}
