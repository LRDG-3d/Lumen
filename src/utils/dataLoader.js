const BASE = import.meta.env.BASE_URL

export async function fetchJSON(relativePath) {
  const res = await fetch(`${BASE}${relativePath}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`No se pudo cargar ${relativePath}`)
  return res.json()
}

export function assetUrl(relativePath) {
  if (!relativePath) return null
  return `${BASE}${relativePath}`
}
