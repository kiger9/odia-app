// Small flat inline-SVG icons. They follow the surrounding text colour
// (currentColor), so the buttons that hold them set the colour.

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

// Speaker for the sound on/off toggle: waves when on, a cross when muted.
export function SpeakerIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" {...stroke}>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      {muted ? (
        <path d="m16 9.5 5 5m0-5-5 5" />
      ) : (
        <>
          <path d="M15.5 9a4 4 0 0 1 0 6" />
          <path d="M18.5 6.5a8 8 0 0 1 0 11" />
        </>
      )}
    </svg>
  )
}

// Solid play triangle for the replay button.
export function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="currentColor">
      <path d="M8.5 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L10 4.74a1 1 0 0 0-1.5.86z" />
    </svg>
  )
}
