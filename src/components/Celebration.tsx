// Brief celebratory flourish shown on the home screen the first time it reopens
// after the learner practiced today. Takes over the streak tile, then reveals it.
const SPARKS = ['✨', '⭐', '✨', '🔥', '⭐', '✨']

export default function Celebration({ phrase }: { phrase: string }) {
  return (
    <div className="celebrate">
      {SPARKS.map((s, i) => (
        <span key={i} className={`celebrate-spark spark-${i}`}>
          {s}
        </span>
      ))}
      <div className="celebrate-flame">🔥</div>
      <div className="celebrate-text">{phrase}</div>
      <div className="celebrate-sub">Streak kept</div>
    </div>
  )
}
