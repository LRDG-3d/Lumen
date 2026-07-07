import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useLibrary } from '../context/LibraryContext.jsx'
import { useContinueWatching } from '../context/ContinueWatchingContext.jsx'
import { assetUrl } from '../utils/dataLoader.js'
import VideoPlayer from '../components/VideoPlayer.jsx'

export default function WatchMovie() {
  const { folder } = useParams()
  const { movies, loading } = useLibrary()
  const { getProgress, updateProgress } = useContinueWatching()
  const movie = movies.find((m) => m.folder === folder)
  const id = `movie:${folder}`
  const saved = getProgress(id)

  const onProgress = useCallback((position, duration) => {
    updateProgress(id, { position, duration, folder, type: 'movie', title: movie?.title })
  }, [id, folder, movie, updateProgress])

  if (loading) return null
  if (!movie) return <div className="container" style={{ paddingTop: 40 }}><p>No se encontró esta película.</p></div>

  return (
    <VideoPlayer
      id={id}
      title={movie.title}
      subtitle={movie.description}
      videoUrl={movie.videoUrl}
      poster={assetUrl(movie.banner || movie.cover)}
      initialTime={saved?.position || 0}
      onProgress={onProgress}
    />
  )
}
