import splashArt from '../assets/splash-art.png'

// Branded loading screen. Tap to skip; auto-dismisses after a moment.
export default function Splash({
  leaving,
  onDismiss,
}: {
  leaving: boolean
  onDismiss: () => void
}) {
  return (
    <div className={`splash ${leaving ? 'splash-out' : ''}`} onClick={onDismiss}>
      <div className="splash-head">
        <h1 className="splash-title">
          Odia <em>in</em> Small Bites
        </h1>
        <p className="splash-tag">Learn to speak Odia, one bite at a time</p>
      </div>

      <img
        className="splash-art"
        src={splashArt}
        alt="Three children walking to school in an Odisha village"
      />

      <p className="splash-legal">
        Lessons adapted from <i>Oriya in Small Bites — a Self-study Language Guide</i> by Niels
        Erik Wegge (The Modern Book Depot, Bhubaneswar, 2000; ISBN 81-85253-05-6). Curriculum ©
        Niels Erik Wegge. Used here for private, non-commercial study. This is an unaffiliated
        learning prototype. Project dedicated to the adoption of Rahul, Suman and Babli.
      </p>
    </div>
  )
}
