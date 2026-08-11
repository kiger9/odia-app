// App settings kept in localStorage (synchronous, so there's no flash on load).

const SHOW_SCRIPT_KEY = 'odia:showScript'

// Whether to show Odia script beneath the phonetic spelling. Defaults to ON.
// (Script is an optional layer — many items don't have it yet; when they do,
// this toggle hides or reveals it.)
export function getShowScript(): boolean {
  return localStorage.getItem(SHOW_SCRIPT_KEY) !== 'false'
}

export function setShowScript(value: boolean): void {
  localStorage.setItem(SHOW_SCRIPT_KEY, String(value))
}
