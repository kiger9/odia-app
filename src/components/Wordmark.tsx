// The app's wordmark lockup — a serif "Odia" over a tracked, rule-flanked
// "in small bites". Shared by the splash and the home header so they match.
export default function Wordmark({ size = 'md' }: { size?: 'lg' | 'md' }) {
  return (
    <div className={`wordmark wordmark-${size}`}>
      <span className="wordmark-main">Odia</span>
      <span className="wordmark-sub">
        <i className="wm-rule" />
        <span>in small bites</span>
        <i className="wm-rule" />
      </span>
    </div>
  )
}
