// Todas las operaciones del panel de administración pasan por aquí.
//
// LUMEN no tiene backend. Para poder "guardar" contenido de verdad en los
// archivos JSON del proyecto (y no solo en memoria del navegador), el panel
// de administración usa la File System Access API del navegador
// (Chrome / Edge / Opera de escritorio) para escribir directamente dentro
// de la carpeta `public/` de tu copia local del repositorio.
//
// Flujo real de trabajo:
//   1. Clonas el repo en tu computadora.
//   2. Ejecutas `npm run dev`.
//   3. En el panel de administración pulsas "Conectar carpeta del proyecto"
//      y seleccionas la carpeta `public` del repo.
//   4. Cada acción (agregar película, subir portada, crear episodio...)
//      escribe inmediatamente los archivos JSON/imagen reales en disco.
//   5. Confirmas los cambios con `git add . && git commit && git push`.
//   6. GitHub Actions reconstruye y publica el sitio automáticamente.
//
// Si el navegador no soporta esta API (Firefox, Safari, móvil), el panel
// sigue funcionando en modo "vista previa en memoria" y además permite
// descargar cada archivo JSON/imagen generado para copiarlo manualmente.

const SUPPORTED = typeof window !== 'undefined' && 'showDirectoryPicker' in window

let rootHandle = null

export function isFileSystemSupported() {
  return SUPPORTED
}

export function isConnected() {
  return !!rootHandle
}

export async function connectProjectFolder() {
  if (!SUPPORTED) throw new Error('NOT_SUPPORTED')
  const handle = await window.showDirectoryPicker({ id: 'lumen-public', mode: 'readwrite' })
  const permission = await handle.requestPermission({ mode: 'readwrite' })
  if (permission !== 'granted') throw new Error('PERMISSION_DENIED')
  rootHandle = handle
  return handle.name
}

export function disconnectProjectFolder() {
  rootHandle = null
}

export function connectedFolderName() {
  return rootHandle ? rootHandle.name : null
}

async function getDirHandle(pathSegments, { create = true } = {}) {
  if (!rootHandle) throw new Error('NOT_CONNECTED')
  let dir = rootHandle
  for (const segment of pathSegments) {
    dir = await dir.getDirectoryHandle(segment, { create })
  }
  return dir
}

async function getFileHandle(pathSegments, fileName, { create = true } = {}) {
  const dir = await getDirHandle(pathSegments, { create })
  return dir.getFileHandle(fileName, { create })
}

export async function writeJSON(pathSegments, fileName, data) {
  const handle = await getFileHandle(pathSegments, fileName)
  const writable = await handle.createWritable()
  await writable.write(JSON.stringify(data, null, 2))
  await writable.close()
}

export async function writeBinary(pathSegments, fileName, file) {
  const handle = await getFileHandle(pathSegments, fileName)
  const writable = await handle.createWritable()
  await writable.write(file)
  await writable.close()
}

export async function deleteEntry(pathSegments, fileName) {
  try {
    const dir = await getDirHandle(pathSegments, { create: false })
    await dir.removeEntry(fileName, { recursive: true })
  } catch (e) {
    // Silencioso: si no existe, no hay nada que borrar.
  }
}

export async function deleteDir(pathSegments, dirName) {
  try {
    const dir = await getDirHandle(pathSegments, { create: false })
    await dir.removeEntry(dirName, { recursive: true })
  } catch (e) {
    // Silencioso.
  }
}

// --- Modo de respaldo cuando la API no está disponible ---
export function downloadJSON(fileName, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  triggerDownload(blob, fileName)
}

export function downloadFile(fileName, file) {
  triggerDownload(file, fileName)
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
