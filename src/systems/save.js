const SAVE_KEY = "element_spire_2_run"
const SAVE_VERSION = 1

function storageAvailable() {
  return typeof window !== "undefined" && Boolean(window.localStorage)
}

export function saveRun(state) {
  if (!storageAvailable()) return false
  const payload = {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state,
  }
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
  return true
}

export function loadRun() {
  if (!storageAvailable()) return null
  const raw = window.localStorage.getItem(SAVE_KEY)
  if (!raw) return null

  try {
    const payload = JSON.parse(raw)
    if (payload.version !== SAVE_VERSION) return null
    return payload.state ?? null
  } catch {
    return null
  }
}

export function hasSavedRun() {
  if (!storageAvailable()) return false
  return Boolean(window.localStorage.getItem(SAVE_KEY))
}

export function clearSavedRun() {
  if (!storageAvailable()) return false
  window.localStorage.removeItem(SAVE_KEY)
  return true
}
