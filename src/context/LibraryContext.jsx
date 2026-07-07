import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { fetchJSON, fileToDataUrl } from '../utils/dataLoader.js'
import { slugify, toFolderName, fileExtension } from '../utils/slug.js'
import { loadLocalCatalog, saveLocalCatalog } from '../utils/localCatalog.js'
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

  // Todo lo que agrega/edita el panel de administración se guarda de
  // inmediato en localStorage del navegador (persist), y opcionalmente
  // también en una carpeta local o en GitHub si el usuario lo conectó.
  const persist = useCallback((nextMovies, nextSeries) => {
    setMovies(nextMovies)
    setSeries(nextSeries)
    saveLocalCatalog(nextMovies, nextSeries)
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const manifest = await fetchJSON('data/manifest.json').catch(() => emptyManifest)

      const publishedMovies = await Promise.all(
        (manifest.movies || []).map(async (folder) => {
          try {
            const m = await fetchJSON(`data/movies/${encodeURIComponent(folder)}/movie.json`)
            return { ...m, folder }
          } catch {
            return null
          }
        })
      )

      const publishedSeries = await Promise.all(
        (manifest.series || []).map(async (folder) => {
          try {
            const s = await fetchJSON(`data/series/${encodeURIComponent(folder)}/serie.json`)
            return { ...s, folder, seasons: {} }
          } catch {
            return null
          }
        })
      )

      // Combina el contenido publicado en el repo con lo que el usuario
      // agregó/editó desde este mismo navegador (localStorage manda,
      // porque es lo más reciente).
      const local = loadLocalCatalog()

      const movieMap = new Map()
      publishedMovies.filter(Boolean).forEach((m) => movieMap.set(m.folder, m))
      ;(local?.movies || []).forEach((m) => movieMap.set(m.folder, m))

      const seriesMap = new Map()
      publishedSeries.filter(Boolean).forEach((s) => seriesMap.set(s.folder, s))
      ;(local?.series || []).forEach((s) => seriesMap.set(s.folder, { ...s, seasons: s.seasons || {} }))

      setMovies(Array.from(movieMap.values()))
      setSeries(Array.from(seriesMap.values()))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

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

  // Si hay una carpeta local conectada, además de guardar en el navegador
  // intenta escribir el archivo real. Si falla, no interrumpe el guardado
  // principal (que ya ocurrió en localStorage).
  async function tryWriteFile(pathSegments, fileName, data) {
    if (!fs.isConnected()) return
    try {
      await fs.writeJSON(pathSegments, fileName, data)
    } catch (e) {
      console.warn('No se pudo escribir en la carpeta conectada:', e)
    }
  }
  async function tryWriteBinary(pathSegments, fileName, file) {
    if (!fs.isConnected()) return
    try {
      await fs.writeBinary(pathSegments, fileName, file)
    } catch (e) {
      console.warn('No se pudo escribir el archivo en la carpeta conectada:', e)
    }
  }
  async function tryDeleteDir(pathSegments, name) {
    if (!fs.isConnected()) return
    try {
      await fs.deleteDir(pathSegments, name)
    } catch (e) {
      console.warn('No se pudo eliminar en la carpeta conectada:', e)
    }
  }
  async function tryDeleteEntry(pathSegments, name) {
    if (!fs.isConnected()) return
    try {
      await fs.deleteEntry(pathSegments, name)
    } catch (e) {
      console.warn('No se pudo eliminar el archivo en la carpeta conectada:', e)
    }
  }

  async function resolveImage(file, pathSegments, baseName) {
    // Siempre se guarda como data-URL para que funcione de inmediato en
    // el navegador. Si además hay una carpeta conectada, se escribe el
    // archivo real ahí con su ruta relativa (útil al hacer commit/push).
    const dataUrl = await fileToDataUrl(file)
    if (fs.isConnected()) {
      const ext = fileExtension(file)
      await tryWriteBinary(pathSegments, `${baseName}.${ext}`, file)
    }
    return dataUrl
  }

  const persistManifestToFolder = useCallback(async (nextMovies, nextSeries) => {
    if (!fs.isConnected()) return
    await tryWriteFile(['data'], 'manifest.json', {
      movies: nextMovies.map((m) => m.folder),
      series: nextSeries.map((s) => s.folder)
    })
  }, [])

  // ---------- PELÍCULAS ----------

  const addMovie = useCallback(async (data, coverFile, bannerFile) => {
    const folder = toFolderName(data.title)
    const slug = slugify(data.title)

    const cover = coverFile ? await resolveImage(coverFile, ['assets', 'covers'], slug) : (data.cover || null)
    const banner = bannerFile ? await resolveImage(bannerFile, ['assets', 'banners'], slug) : (data.banner || null)

    const movie = {
      slug,
      folder,
      title: data.title,
      description: data.description || '',
      year: Number(data.year) || null,
      genres: data.genres || [],
      rating: data.rating || '',
      duration: Number(data.duration) || 0,
      videoUrl: data.videoUrl || '',
      cover,
      banner,
      createdAt: new Date().toISOString()
    }

    await tryWriteFile(['data', 'movies', folder], 'movie.json', movie)

    const next = [...movies, movie]
    persist(next, series)
    await persistManifestToFolder(next, series)
    return movie
  }, [movies, series, persist, persistManifestToFolder])

  const updateMovie = useCallback(async (folder, data, coverFile, bannerFile) => {
    const existing = movies.find((m) => m.folder === folder)
    if (!existing) throw new Error('Película no encontrada')
    const slug = existing.slug

    const cover = coverFile ? await resolveImage(coverFile, ['assets', 'covers'], slug) : (data.cover ?? existing.cover)
    const banner = bannerFile ? await resolveImage(bannerFile, ['assets', 'banners'], slug) : (data.banner ?? existing.banner)

    const updated = {
      ...existing,
      ...data,
      year: Number(data.year) || existing.year,
      duration: Number(data.duration) || existing.duration,
      cover,
      banner
    }

    await tryWriteFile(['data', 'movies', folder], 'movie.json', updated)

    const next = movies.map((m) => (m.folder === folder ? updated : m))
    persist(next, series)
    return updated
  }, [movies, series, persist])

  const deleteMovie = useCallback(async (folder) => {
    await tryDeleteDir(['data', 'movies'], folder)
    const next = movies.filter((m) => m.folder !== folder)
    persist(next, series)
    await persistManifestToFolder(next, series)
  }, [movies, series, persist, persistManifestToFolder])

  // ---------- SERIES ----------

  const addSeries = useCallback(async (data, coverFile, bannerFile) => {
    const folder = toFolderName(data.title)
    const slug = slugify(data.title)

    const cover = coverFile ? await resolveImage(coverFile, ['assets', 'covers'], slug) : (data.cover || null)
    const banner = bannerFile ? await resolveImage(bannerFile, ['assets', 'banners'], slug) : (data.banner || null)

    const show = {
      slug,
      folder,
      title: data.title,
      description: data.description || '',
      year: Number(data.year) || null,
      genres: data.genres || [],
      rating: data.rating || '',
      cover,
      banner,
      seasonNumbers: [],
      seasons: {},
      createdAt: new Date().toISOString()
    }

    await tryWriteFile(['data', 'series', folder], 'serie.json', { ...show, seasons: undefined })

    const next = [...series, show]
    persist(movies, next)
    await persistManifestToFolder(movies, next)
    return show
  }, [movies, series, persist, persistManifestToFolder])

  const updateSeries = useCallback(async (folder, data, coverFile, bannerFile) => {
    const existing = series.find((s) => s.folder === folder)
    if (!existing) throw new Error('Serie no encontrada')
    const slug = existing.slug

    const cover = coverFile ? await resolveImage(coverFile, ['assets', 'covers'], slug) : (data.cover ?? existing.cover)
    const banner = bannerFile ? await resolveImage(bannerFile, ['assets', 'banners'], slug) : (data.banner ?? existing.banner)

    const updated = {
      ...existing,
      ...data,
      year: Number(data.year) || existing.year,
      cover,
      banner
    }

    const toSave = { ...updated }
    delete toSave.seasons
    await tryWriteFile(['data', 'series', folder], 'serie.json', toSave)

    const next = series.map((s) => (s.folder === folder ? updated : s))
    persist(movies, next)
    return updated
  }, [movies, series, persist])

  const deleteSeries = useCallback(async (folder) => {
    await tryDeleteDir(['data', 'series'], folder)
    const next = series.filter((s) => s.folder !== folder)
    persist(movies, next)
    await persistManifestToFolder(movies, next)
  }, [movies, series, persist, persistManifestToFolder])

  const loadSeasons = useCallback(async (folder) => {
    const show = series.find((s) => s.folder === folder)
    if (!show) return {}

    const seasonsData = { ...(show.seasons || {}) }
    await Promise.all(
      (show.seasonNumbers || []).map(async (num) => {
        if (seasonsData[num]) return // ya está en memoria (agregado/editado localmente)
        try {
          seasonsData[num] = await fetchJSON(`data/series/${encodeURIComponent(folder)}/season${num}.json`)
        } catch {
          seasonsData[num] = { seasonNumber: num, episodes: [] }
        }
      })
    )

    const nextSeries = series.map((s) => (s.folder === folder ? { ...s, seasons: seasonsData } : s))
    persist(movies, nextSeries)
    return seasonsData
  }, [series, movies, persist])

  const addSeason = useCallback(async (folder, seasonNumber) => {
    const show = series.find((s) => s.folder === folder)
    if (!show) throw new Error('Serie no encontrada')
    if (show.seasonNumbers.includes(seasonNumber)) throw new Error('Esa temporada ya existe')

    const seasonData = { seasonNumber, episodes: [] }
    await tryWriteFile(['data', 'series', folder], `season${seasonNumber}.json`, seasonData)

    const nextSeasonNumbers = [...show.seasonNumbers, seasonNumber].sort((a, b) => a - b)
    const updatedShow = { ...show, seasonNumbers: nextSeasonNumbers, seasons: { ...show.seasons, [seasonNumber]: seasonData } }

    const toSave = { ...updatedShow }
    delete toSave.seasons
    await tryWriteFile(['data', 'series', folder], 'serie.json', toSave)

    const next = series.map((s) => (s.folder === folder ? updatedShow : s))
    persist(movies, next)
    return seasonData
  }, [series, movies, persist])

  const deleteSeason = useCallback(async (folder, seasonNumber) => {
    const show = series.find((s) => s.folder === folder)
    if (!show) return
    await tryDeleteEntry(['data', 'series', folder], `season${seasonNumber}.json`)

    const nextSeasonNumbers = show.seasonNumbers.filter((n) => n !== seasonNumber)
    const nextSeasons = { ...show.seasons }
    delete nextSeasons[seasonNumber]
    const updatedShow = { ...show, seasonNumbers: nextSeasonNumbers, seasons: nextSeasons }

    const toSave = { ...updatedShow }
    delete toSave.seasons
    await tryWriteFile(['data', 'series', folder], 'serie.json', toSave)

    const next = series.map((s) => (s.folder === folder ? updatedShow : s))
    persist(movies, next)
  }, [series, movies, persist])

  const addEpisode = useCallback(async (folder, seasonNumber, data, thumbFile) => {
    const show = series.find((s) => s.folder === folder)
    if (!show) throw new Error('Serie no encontrada')
    const season = show.seasons[seasonNumber] || { seasonNumber, episodes: [] }

    const thumbnail = thumbFile
      ? await resolveImage(thumbFile, ['assets', 'episodes'], `${show.slug}-s${seasonNumber}e${data.episodeNumber}`)
      : (data.thumbnail || null)

    const episode = {
      episodeNumber: Number(data.episodeNumber),
      title: data.title || `Episodio ${data.episodeNumber}`,
      description: data.description || '',
      duration: Number(data.duration) || 0,
      videoUrl: data.videoUrl || '',
      thumbnail
    }

    const nextEpisodes = [...season.episodes.filter((e) => e.episodeNumber !== episode.episodeNumber), episode]
      .sort((a, b) => a.episodeNumber - b.episodeNumber)
    const nextSeason = { ...season, episodes: nextEpisodes }

    await tryWriteFile(['data', 'series', folder], `season${seasonNumber}.json`, nextSeason)

    const updatedShow = { ...show, seasons: { ...show.seasons, [seasonNumber]: nextSeason } }
    const next = series.map((s) => (s.folder === folder ? updatedShow : s))
    persist(movies, next)
    return episode
  }, [series, movies, persist])

  const deleteEpisode = useCallback(async (folder, seasonNumber, episodeNumber) => {
    const show = series.find((s) => s.folder === folder)
    if (!show) return
    const season = show.seasons[seasonNumber]
    if (!season) return
    const nextSeason = { ...season, episodes: season.episodes.filter((e) => e.episodeNumber !== episodeNumber) }

    await tryWriteFile(['data', 'series', folder], `season${seasonNumber}.json`, nextSeason)

    const updatedShow = { ...show, seasons: { ...show.seasons, [seasonNumber]: nextSeason } }
    const next = series.map((s) => (s.folder === folder ? updatedShow : s))
    persist(movies, next)
  }, [series, movies, persist])

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
