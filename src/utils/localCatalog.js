// Guarda el catálogo completo (películas, series, temporadas, episodios,
// e imágenes como data-URLs) en localStorage del navegador. Esto permite
// que el panel de administración funcione de inmediato, sin conectar
// ninguna carpeta ni configurar GitHub.
//
// Límite real a tener en cuenta: localStorage solo persiste en ESE
// navegador/dispositivo, y tiene un límite de tamaño (~5-10 MB según el
// navegador). Para catálogos grandes con muchas imágenes en alta
// resolución, conviene comprimir las imágenes antes de subirlas.

const KEY = 'lumen:catalog'

export function loadLocalCatalog() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      movies: parsed.movies || [],
      series: parsed.series || []
    }
  } catch {
    return null
  }
}

export function saveLocalCatalog(movies, series) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ movies, series }))
    return true
  } catch (e) {
    // Probablemente se llenó el límite de almacenamiento del navegador.
    console.error('No se pudo guardar en localStorage:', e)
    return false
  }
}

export function clearLocalCatalog() {
  localStorage.removeItem(KEY)
}

export function estimateUsage() {
  try {
    const raw = localStorage.getItem(KEY) || ''
    return new Blob([raw]).size
  } catch {
    return 0
  }
}
