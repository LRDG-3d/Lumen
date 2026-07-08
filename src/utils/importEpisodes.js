// Detecta episodios automáticamente a partir de una URL, sin depender de
// ningún servicio de metadatos de series: solo lee el listado de archivos
// que ya expone el propio host donde subiste los videos.

const VIDEO_EXT = /\.(mp4|mkv|webm|m4v|avi|mov)$/i

// https://archive.org/download/<identifier>/<archivo o subcarpeta>
export function parseArchiveOrgUrl(url) {
  const m = url.match(/archive\.org\/download\/([^/]+)\/?/i)
  if (!m) return null
  return { identifier: decodeURIComponent(m[1]) }
}

export async function fetchArchiveOrgFiles(identifier) {
  const res = await fetch(`https://archive.org/metadata/${encodeURIComponent(identifier)}`)
  if (!res.ok) throw new Error('No se pudo consultar ese identificador en archive.org.')
  const data = await res.json()
  if (!data.files || data.files.length === 0) throw new Error('Ese item de archive.org no tiene archivos listados.')

  return data.files
    .filter((f) => VIDEO_EXT.test(f.name))
    .map((f) => ({
      name: f.name.split('/').pop(),
      url: `https://archive.org/download/${identifier}/${f.name.split('/').map(encodeURIComponent).join('/')}`
    }))
}

// Alternativa genérica: intenta leer un listado de directorio HTML normal
// (Apache/Nginx autoindex) y saca los enlaces a archivos de video.
export async function fetchGenericDirectoryFiles(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo leer esa URL.')
  const html = await res.text()
  const hrefs = [...html.matchAll(/href="([^"]+)"/gi)].map((m) => m[1])
  const base = new URL(url)
  const files = hrefs
    .filter((h) => VIDEO_EXT.test(h))
    .map((h) => {
      const abs = new URL(h, base).toString()
      const name = decodeURIComponent(h.split('/').pop())
      return { name, url: abs }
    })
  if (files.length === 0) throw new Error('No se encontraron archivos de video en esa URL.')
  return files
}

const EP_PATTERNS = [
  /S(\d{1,2})E(\d{1,3})/i,
  /(\d{1,2})x(\d{1,3})\b/,
  /Temporada\s*0*(\d{1,2}).{0,15}?(?:Episodio|Cap(?:[ií]tulo)?)\s*0*(\d{1,3})/i
]

export function detectEpisodeInfo(filename) {
  const base = filename.replace(/\.[^.]+$/, '')
  for (const re of EP_PATTERNS) {
    const m = base.match(re)
    if (m) return { season: Number(m[1]), episode: Number(m[2]) }
  }
  const single = base.match(/(?:E|Ep|Episodio|Cap(?:[ií]tulo)?)\s*0*(\d{1,3})\b/i) || base.match(/-\s*0*(\d{1,3})\s*$/)
  if (single) return { season: null, episode: Number(single[1]) }
  return null
}

export function cleanTitle(filename, seriesTitle) {
  let base = filename.replace(/\.[^.]+$/, '')
  if (seriesTitle) {
    const escaped = seriesTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    base = base.replace(new RegExp(escaped, 'ig'), '')
  }
  base = base.replace(/S\d{1,2}E\d{1,3}/i, '').replace(/(\d{1,2})x(\d{1,3})/, '')
  base = base.replace(/[-_.]+/g, ' ').replace(/\s+/g, ' ').trim()
  return base || filename
}

// Punto de entrada unico: detecta la fuente segun la URL pegada.
export async function detectEpisodesFromUrl(url) {
  const archiveInfo = parseArchiveOrgUrl(url)
  const files = archiveInfo
    ? await fetchArchiveOrgFiles(archiveInfo.identifier)
    : await fetchGenericDirectoryFiles(url)

  return files
    .map((f) => {
      const info = detectEpisodeInfo(f.name)
      return {
        name: f.name,
        url: f.url,
        season: info?.season ?? null,
        episode: info?.episode ?? null
      }
    })
    .sort((a, b) => (a.season ?? 0) - (b.season ?? 0) || (a.episode ?? 0) - (b.episode ?? 0))
}
