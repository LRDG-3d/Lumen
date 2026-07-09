export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Folder-safe name (keeps spaces, matches the data/ folder examples in the brief)
export function toFolderName(text) {
  return text
    .toString()
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
}

export function fileExtension(file) {
  const parts = file.name.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg'
}
