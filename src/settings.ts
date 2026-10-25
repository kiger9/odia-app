// App settings kept in localStorage (synchronous, so there's no flash on load).

// Master switch for the Odia-script layer: the Settings toggle and the script
// subtext. Script comes from a step's `script` field or, failing that, from the
// word list in data/script.ts — phrases it can't convert just show no script.
export const SHOW_SCRIPT_FEATURE = true

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

// --- daily goal: how many exercises/reviews count as "done" for the day ---
const DAILY_GOAL_KEY = 'odia:dailyGoal'
const DEFAULT_GOAL = 15

export interface GoalOption {
  value: number
  label: string
}
export const GOAL_OPTIONS: GoalOption[] = [
  { value: 5, label: 'Casual' },
  { value: 15, label: 'Regular' },
  { value: 30, label: 'Serious' },
]

export function getDailyGoal(): number {
  const raw = Number(localStorage.getItem(DAILY_GOAL_KEY))
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_GOAL
}

export function setDailyGoal(value: number): void {
  localStorage.setItem(DAILY_GOAL_KEY, String(value))
}
