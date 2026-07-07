import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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

  const ep = show?.seasons?.[seasonNumber]?.episodes?.find((e) => e.episodeNumber === episodeNumber)
  const id = `episode:${folder}-s${seasonNumber}e${episodeNumber}`
  const saved = getProgress(id)

  const onProgress = useCallback((position, duration) => {
    updateProgress(id, { position, duration, folder, type: 'series', season: seasonNumber, episode: episodeNumber, title: `${show?.title} · T${seasonNumber} E${episodeNumber}` })
  }, [id, folder, seasonNumber, episodeNumber, show, updateProgress])

  if (loading || !ready) return null
  if (!show || !ep) return <div className="container" style={{ paddingTop: 40 }}><p>No se encontró este episodio.</p></div>

  return (
    <VideoPlayer
      id={id}
      title={`${show.title} — T${seasonNumber}E${episodeNumber}: ${ep.title}`}
      subtitle={ep.description}
      videoUrl={ep.videoUrl}
      poster={assetUrl(ep.thumbnail || show.banner || show.cover)}
      initialTime={saved?.position || 0}
      onProgress={onProgress}
    />
  )
}
