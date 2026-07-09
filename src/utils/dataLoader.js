const BASE = import.meta.env.BASE_URL

export async function fetchJSON(relativePath) {
  const res = await fetch(`${BASE}${relativePath}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`No se pudo cargar ${relativePath}`)
  return res.json()
}

export function assetUrl(relativePath) {
  if (!relativePath) return null
  if (relativePath.startsWith('data:') || relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('blob:')) {
    return relativePath
  }
  return `${BASE}${relativePath}`
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
