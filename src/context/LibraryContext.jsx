import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { fetchJSON } from '../utils/dataLoader.js'
import { slugify, toFolderName, fileExtension } from '../utils/slug.js'
import * as fs from '../utils/fileSystem.js'

const LibraryContext = createContext(null)

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary debe usarse dentro de LibraryProvider')
  return ctx
}

const emptyManifest = { movies: [], series: [] }

export function LibraryProvider({ children }) {
  const [movies, setMovies] = useState([])
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [folderConnected, setFolderConnected] = useState(false)
  const [folderName, setFolderName] = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const manifest = await fetchJSON('data/manifest.json').catch(() => emptyManifest)

      const moviesData = await Promise.all(
        (manifest.movies || []).map(async (folder) => {
          try {
            const m = await fetchJSON(`data/movies/${encodeURIComponent(folder)}/movie.json`)
            return { ...m, folder }
          } catch {
            return null
          }
        })
      )

      const seriesData = await Promise.all(
        (manifest.series || []).map(async (folder) => {
          try {
            const s = await fetchJSON(`data/series/${encodeURIComponent(folder)}/serie.json`)
            return { ...s, folder, seasons: {} }
          } catch {
            return null
          }
        })
      )

      setMovies(moviesData.filter(Boolean))
      setSeries(seriesData.filter(Boolean))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const persistManifest = useCallback(async (nextMovies, nextSeries) => {
    const manifest = {
      movies: nextMovies.map((m) => m.folder),
      series: nextSeries.map((s) => s.folder)
    }
    if (fs.isConnected()) {
      await fs.writeJSON(['data'], 'manifest.json', manifest)
    }
    return manifest
  }, [])

  const connectFolder = useCallback(async () => {
    const name = await fs.connectProjectFolder()
    setFolderConnected(true)
    setFolderName(name)
    return name
  }, [])

  const disconnectFolder = useCallback(() => {
    fs.disconnectProjectFolder()
    setFolderConnected(false)
    setFolderName(null)
  }, [])

  // ---------- PELÍCULAS ----------

  const addMovie = useCallback(async (data, coverFile, bannerFile) => {
    const folder = toFolderName(data.title)
    const slug = slugify(data.title)
    const coverPath = coverFile ? `assets/covers/${slug}.${fileExtension(coverFile)}` : data.cover || null
    const bannerPath = bannerFile ? `assets/banners/${slug}.${fileExtension(bannerFile)}` : data.banner || null

    const movie = {
      slug,
      title: data.title,
      description: data.description || '',
      year: Number(data.year) || null,
      genres: data.genres || [],
      rating: data.rating || '',
      duration: Number(data.duration) || 0,
      videoUrl: data.videoUrl || '',
      cover: coverPath,
      banner: bannerPath,
      createdAt: new Date().toISOString()
    }

    if (fs.isConnected()) {
      await fs.writeJSON(['data', 'movies', folder], 'movie.json', movie)
      if (coverFile) await fs.writeBinary(['assets', 'covers'], `${slug}.${fileExtension(coverFile)}`, coverFile)
      if (bannerFile) await fs.writeBinary(['assets', 'banners'], `${slug}.${fileExtension(bannerFile)}`, bannerFile)
    } else {
      fs.downloadJSON('movie.json', movie)
      if (coverFile) fs.downloadFile(`${slug}-cover.${fileExtension(coverFile)}`, coverFile)
      if (bannerFile) fs.downloadFile(`${slug}-banner.${fileExtension(bannerFile)}`, bannerFile)
    }

    const next = [...movies, { ...movie, folder }]
    setMovies(next)
    await persistManifest(next, series)
    return { ...movie, folder }
  }, [movies, series, persistManifest])

  const updateMovie = useCallback(async (folder, data, coverFile, bannerFile) => {
    const existing = movies.find((m) => m.folder === folder)
    if (!existing) throw new Error('Película no encontrada')
    const slug = existing.slug

    const coverPath = coverFile ? `assets/covers/${slug}.${fileExtension(coverFile)}` : (data.cover ?? existing.cover)
    const bannerPath = bannerFile ? `assets/banners/${slug}.${fileExtension(bannerFile)}` : (data.banner ?? existing.banner)

    const updated = {
      ...existing,
      ...data,
      year: Number(data.year) || existing.year,
      duration: Number(data.duration) || existing.duration,
      cover: coverPath,
      banner: bannerPath
    }
    delete updated.folder

    if (fs.isConnected()) {
      await fs.writeJSON(['data', 'movies', folder], 'movie.json', updated)
      if (coverFile) await fs.writeBinary(['assets', 'covers'], `${slug}.${fileExtension(coverFile)}`, coverFile)
      if (bannerFile) await fs.writeBinary(['assets', 'banners'], `${slug}.${fileExtension(bannerFile)}`, bannerFile)
    } else {
      fs.downloadJSON('movie.json', updated)
    }

    const next = movies.map((m) => (m.folder === folder ? { ...updated, folder } : m))
    setMovies(next)
    return updated
  }, [movies])

  const deleteMovie = useCallback(async (folder) => {
    if (fs.isConnected()) {
      await fs.deleteDir(['data', 'movies'], folder)
    }
    const next = movies.filter((m) => m.folder !== folder)
    setMovies(next)
    await persistManifest(next, series)
  }, [movies, series, persistManifest])

  // ---------- SERIES ----------

  const addSeries = useCallback(async (data, coverFile, bannerFile) => {
    const folder = toFolderName(data.title)
    const slug = slugify(data.title)
    const coverPath = coverFile ? `assets/covers/${slug}.${fileExtension(coverFile)}` : data.cover || null
    const bannerPath = bannerFile ? `assets/banners/${slug}.${fileExtension(bannerFile)}` : data.banner || null

    const show = {
      slug,
      title: data.title,
      description: data.description || '',
      year: Number(data.year) || null,
      genres: data.genres || [],
      rating: data.rating || '',
      cover: coverPath,
      banner: bannerPath,
      seasonNumbers: [],
      createdAt: new Date().toISOString()
    }

    if (fs.isConnected()) {
      await fs.writeJSON(['data', 'series', folder], 'serie.json', show)
      if (coverFile) await fs.writeBinary(['assets', 'covers'], `${slug}.${fileExtension(coverFile)}`, coverFile)
      if (bannerFile) await fs.writeBinary(['assets', 'banners'], `${slug}.${fileExtension(bannerFile)}`, bannerFile)
    } else {
      fs.downloadJSON('serie.json', show)
      if (coverFile) fs.downloadFile(`${slug}-cover.${fileExtension(coverFile)}`, coverFile)
      if (bannerFile) fs.downloadFile(`${slug}-banner.${fileExtension(bannerFile)}`, bannerFile)
    }

    const next = [...series, { ...show, folder, seasons: {} }]
    setSeries(next)
    await persistManifest(movies, next)
    return { ...show, folder }
  }, [movies, series, persistManifest])

  const updateSeries = useCallback(async (folder, data, coverFile, bannerFile) => {
    const existing = series.find((s) => s.folder === folder)
    if (!existing) throw new Error('Serie no encontrada')
    const slug = existing.slug

    const coverPath = coverFile ? `assets/covers/${slug}.${fileExtension(coverFile)}` : (data.cover ?? existing.cover)
    const bannerPath = bannerFile ? `assets/banners/${slug}.${fileExtension(bannerFile)}` : (data.banner ?? existing.banner)

    const updated = {
      ...existing,
      ...data,
      year: Number(data.year) || existing.year,
      cover: coverPath,
      banner: bannerPath
    }
    delete updated.folder
    delete updated.seasons

    if (fs.isConnected()) {
      await fs.writeJSON(['data', 'series', folder], 'serie.json', updated)
      if (coverFile) await fs.writeBinary(['assets', 'covers'], `${slug}.${fileExtension(coverFile)}`, coverFile)
      if (bannerFile) await fs.writeBinary(['assets', 'banners'], `${slug}.${fileExtension(bannerFile)}`, bannerFile)
    } else {
      fs.downloadJSON('serie.json', updated)
    }

    const next = series.map((s) => (s.folder === folder ? { ...updated, folder, seasons: s.seasons } : s))
    setSeries(next)
    return updated
  }, [series])

  const deleteSeries = useCallback(async (folder) => {
    if (fs.isConnected()) {
      await fs.deleteDir(['data', 'series'], folder)
    }
    const next = series.filter((s) => s.folder !== folder)
    setSeries(next)
    await persistManifest(movies, next)
  }, [movies, series, persistManifest])

  const loadSeasons = useCallback(async (folder) => {
    const show = series.find((s) => s.folder === folder)
    if (!show) return {}
    const seasonsData = {}
    await Promise.all(
      (show.seasonNumbers || []).map(async (num) => {
        try {
          seasonsData[num] = await fetchJSON(`data/series/${encodeURIComponent(folder)}/season${num}.json`)
        } catch {
          seasonsData[num] = { seasonNumber: num, episodes: [] }
        }
      })
    )
    setSeries((prev) => prev.map((s) => (s.folder === folder ? { ...s, seasons: seasonsData } : s)))
    return seasonsData
  }, [series])

  const addSeason = useCallback(async (folder, seasonNumber) => {
    const show = series.find((s) => s.folder === folder)
    if (!show) throw new Error('Serie no encontrada')
    if (show.seasonNumbers.includes(seasonNumber)) throw new Error('Esa temporada ya existe')

    const seasonData = { seasonNumber, episodes: [] }
    if (fs.isConnected()) {
      await fs.writeJSON(['data', 'series', folder], `season${seasonNumber}.json`, seasonData)
    } else {
      fs.downloadJSON(`season${seasonNumber}.json`, seasonData)
    }

    const nextSeasonNumbers = [...show.seasonNumbers, seasonNumber].sort((a, b) => a - b)
    const updatedShow = { ...show, seasonNumbers: nextSeasonNumbers }
    if (fs.isConnected()) {
      const toSave = { ...updatedShow }
      delete toSave.folder
      delete toSave.seasons
      await fs.writeJSON(['data', 'series', folder], 'serie.json', toSave)
    }

    setSeries((prev) => prev.map((s) => (s.folder === folder
      ? { ...updatedShow, seasons: { ...s.seasons, [seasonNumber]: seasonData } }
      : s)))
    return seasonData
  }, [series])

  const deleteSeason = useCallback(async (folder, seasonNumber) => {
    const show = series.find((s) => s.folder === folder)
    if (!show) return
    if (fs.isConnected()) {
      await fs.deleteEntry(['data', 'series', folder], `season${seasonNumber}.json`)
    }
    const nextSeasonNumbers = show.seasonNumbers.filter((n) => n !== seasonNumber)
    const updatedShow = { ...show, seasonNumbers: nextSeasonNumbers }
    if (fs.isConnected()) {
      const toSave = { ...updatedShow }
      delete toSave.folder
      delete toSave.seasons
      await fs.writeJSON(['data', 'series', folder], 'serie.json', toSave)
    }
    setSeries((prev) => prev.map((s) => {
      if (s.folder !== folder) return s
      const seasons = { ...s.seasons }
      delete seasons[seasonNumber]
      return { ...updatedShow, seasons }
    }))
  }, [series])

  const addEpisode = useCallback(async (folder, seasonNumber, data, thumbFile) => {
    const show = series.find((s) => s.folder === folder)
    if (!show) throw new Error('Serie no encontrada')
    const season = show.seasons[seasonNumber] || { seasonNumber, episodes: [] }

    const thumbPath = thumbFile
      ? `assets/episodes/${show.slug}-s${seasonNumber}e${data.episodeNumber}.${fileExtension(thumbFile)}`
      : (data.thumbnail || null)

    const episode = {
      episodeNumber: Number(data.episodeNumber),
      title: data.title || `Episodio ${data.episodeNumber}`,
      description: data.description || '',
      duration: Number(data.duration) || 0,
      videoUrl: data.videoUrl || '',
      thumbnail: thumbPath
    }

    const nextEpisodes = [...season.episodes.filter((e) => e.episodeNumber !== episode.episodeNumber), episode]
      .sort((a, b) => a.episodeNumber - b.episodeNumber)
    const nextSeason = { ...season, episodes: nextEpisodes }

    if (fs.isConnected()) {
      await fs.writeJSON(['data', 'series', folder], `season${seasonNumber}.json`, nextSeason)
      if (thumbFile) {
        await fs.writeBinary(['assets', 'episodes'], `${show.slug}-s${seasonNumber}e${episode.episodeNumber}.${fileExtension(thumbFile)}`, thumbFile)
      }
    } else {
      fs.downloadJSON(`season${seasonNumber}.json`, nextSeason)
      if (thumbFile) fs.downloadFile(`${show.slug}-s${seasonNumber}e${episode.episodeNumber}.${fileExtension(thumbFile)}`, thumbFile)
    }

    setSeries((prev) => prev.map((s) => (s.folder === folder
      ? { ...s, seasons: { ...s.seasons, [seasonNumber]: nextSeason } }
      : s)))
    return episode
  }, [series])

  const deleteEpisode = useCallback(async (folder, seasonNumber, episodeNumber) => {
    const show = series.find((s) => s.folder === folder)
    if (!show) return
    const season = show.seasons[seasonNumber]
    if (!season) return
    const nextSeason = { ...season, episodes: season.episodes.filter((e) => e.episodeNumber !== episodeNumber) }

    if (fs.isConnected()) {
      await fs.writeJSON(['data', 'series', folder], `season${seasonNumber}.json`, nextSeason)
    }

    setSeries((prev) => prev.map((s) => (s.folder === folder
      ? { ...s, seasons: { ...s.seasons, [seasonNumber]: nextSeason } }
      : s)))
  }, [series])

  const value = {
    movies,
    series,
    loading,
    error,
    reload: loadAll,
    folderConnected,
    folderName,
    fsSupported: fs.isFileSystemSupported(),
    connectFolder,
    disconnectFolder,
    addMovie,
    updateMovie,
    deleteMovie,
    addSeries,
    updateSeries,
    deleteSeries,
    loadSeasons,
    addSeason,
    deleteSeason,
    addEpisode,
    deleteEpisode
  }

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}
