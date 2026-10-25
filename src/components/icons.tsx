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

// Play triangle for the replay button, with rounded corners. Its centroid sits
// on the centre of the 24-unit box, which is what makes a triangle look centred
// in a circle (centring its bounding box makes it look pushed left).
export function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    >
      <path d="M8.8 6.5v11l9.5-5.5z" />
    </svg>
  )
}
