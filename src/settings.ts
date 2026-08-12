// App settings kept in localStorage (synchronous, so there's no flash on load).

// Master switch for the Odia-script layer. Hidden for now — the lessons are
// phonetic-only, so there's no script to show yet. Flip to true (and populate the
// `script` fields in the lessons) to bring back the toggle and the script subtext.
export const SHOW_SCRIPT_FEATURE = false

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
