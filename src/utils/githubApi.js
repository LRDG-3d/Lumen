// Guarda contenido directamente en el repositorio de GitHub usando la
// API REST de "Contents", autenticada con un Personal Access Token que
// el usuario pega una sola vez en el panel de administración.
//
// El token se guarda SOLO en localStorage de ese navegador/dispositivo.
// Nunca se envía a ningún servidor propio: viaja únicamente a
// api.github.com con cada operación.

const CONFIG_KEY = 'lumen:github-config'
const API = 'https://api.github.com'

export function getConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY))
  } catch {
    return null
  }
}

export function isConfigured() {
  const c = getConfig()
  return !!(c && c.owner && c.repo && c.token)
}

export function setConfig({ owner, repo, branch, token }) {
  const cfg = { owner: owner.trim(), repo: repo.trim(), branch: (branch || 'main').trim(), token: token.trim() }
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
  return cfg
}

export function clearConfig() {
  localStorage.removeItem(CONFIG_KEY)
}

function headers(cfg) {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
}

function toBase64Text(str) {
  return btoa(unescape(encodeURIComponent(str)))
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function getSha(cfg, path) {
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}?ref=${cfg.branch}`, {
    headers: headers(cfg)
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`No se pudo verificar ${path} (${res.status})`)
  const data = await res.json()
  return data.sha
}

async function putContent(path, base64Content, message) {
  const cfg = getConfig()
  if (!cfg) throw new Error('GITHUB_NOT_CONFIGURED')
  const sha = await getSha(cfg, path)
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    headers: { ...headers(cfg), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message || `chore: actualizar ${path} desde el panel`,
      content: base64Content,
      branch: cfg.branch,
      ...(sha ? { sha } : {})
    })
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Error al guardar ${path} en GitHub (${res.status})`)
  }
  return res.json()
}

export async function putJSON(path, data, message) {
  return putContent(path, toBase64Text(JSON.stringify(data, null, 2)), message)
}

export async function putBinary(path, file, message) {
  const base64 = await fileToBase64(file)
  return putContent(path, base64, message)
}

export async function deleteFile(path, message) {
  const cfg = getConfig()
  if (!cfg) throw new Error('GITHUB_NOT_CONFIGURED')
  const sha = await getSha(cfg, path)
  if (!sha) return
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}`, {
    method: 'DELETE',
    headers: { ...headers(cfg), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message || `chore: eliminar ${path}`, sha, branch: cfg.branch })
  })
  if (!res.ok && res.status !== 404) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Error al eliminar ${path} (${res.status})`)
  }
}

// Borra una carpeta completa listando y eliminando cada archivo dentro
// (la API de GitHub no permite borrar carpetas directamente).
export async function deleteFolder(path, message) {
  const cfg = getConfig()
  if (!cfg) throw new Error('GITHUB_NOT_CONFIGURED')
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}?ref=${cfg.branch}`, {
    headers: headers(cfg)
  })
  if (res.status === 404) return
  if (!res.ok) throw new Error(`No se pudo listar ${path} (${res.status})`)
  const entries = await res.json()
  for (const entry of entries) {
    if (entry.type === 'dir') {
      await deleteFolder(entry.path, message)
    } else {
      const delRes = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(entry.path)}`, {
        method: 'DELETE',
        headers: { ...headers(cfg), 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message || `chore: eliminar ${entry.path}`, sha: entry.sha, branch: cfg.branch })
      })
      if (!delRes.ok) {
        const body = await delRes.json().catch(() => ({}))
        throw new Error(body.message || `Error al eliminar ${entry.path}`)
      }
    }
  }
}

export async function testConnection() {
  const cfg = getConfig()
  if (!cfg) throw new Error('GITHUB_NOT_CONFIGURED')
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}`, { headers: headers(cfg) })
  if (!res.ok) throw new Error('No se pudo acceder al repositorio. Revisá owner, repo y el token.')
  return res.json()
}
