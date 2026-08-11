// Branded loading screen shown briefly while the app starts up.
export default function Splash({ leaving }: { leaving: boolean }) {
  return (
    <div className={`splash ${leaving ? 'splash-out' : ''}`}>
      <div className="splash-mark">å</div>
      <h1 className="splash-title">
        Odia<span>in small bites</span>
      </h1>
      <div className="splash-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
