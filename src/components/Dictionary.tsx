import { useMemo, useState } from 'react'
import { DICTIONARY, type DictEntry } from '../data/dictionary'
import { normalize } from '../lib/normalize'
import { SpeakButton } from './Steps'

// Sort once: alphabetical by English (verbs sit alongside words).
const SORTED = [...DICTIONARY].sort((a, b) =>
  a.english.toLowerCase().localeCompare(b.english.toLowerCase()),
)

// A fixed-width slot at the right end of a row, so the play buttons line up in
// one column whatever the text length. SpeakButton renders nothing until a clip
// exists; the slot keeps its width, so rows don't shift when clips arrive.
function PlaySlot({ text }: { text: string }) {
  return (
    <div className="dict-play" onClick={(ev) => ev.stopPropagation()}>
      <SpeakButton text={text} />
    </div>
  )
}

export default function Dictionary({ onBack }: { onBack: () => void }) {
  const [q, setQ] = useState('')
  const [openKey, setOpenKey] = useState<string | null>(null)
  const nq = normalize(q)

  // Two-way search: matches English OR the Oriya phonetic (accent-insensitive,
  // so "kadali" finds "Kådåli" and "banana" finds it too).
  const results = useMemo(() => {
    if (!nq) return SORTED
    return SORTED.filter(
      (e) => normalize(e.english).includes(nq) || normalize(e.phonetic).includes(nq),
    )
  }, [nq])

  const groups = useMemo(() => {
    const m = new Map<string, DictEntry[]>()
    for (const e of results) {
      const k = e.english[0].toUpperCase()
      const arr = m.get(k) ?? []
      arr.push(e)
      m.set(k, arr)
    }
    return [...m.entries()]
  }, [results])

  return (
    <main className="app">
      <header className="sub-head">
        <button className="back" onClick={onBack} aria-label="Back">
          ‹
        </button>
        <h2>Dictionary</h2>
      </header>

      <div className="dict-search">
        <input
          className="type-input"
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search English or Odia…"
        />
        <button className="char-btn" type="button" onClick={() => setQ((v) => v + 'å')}>
          å
        </button>
      </div>

      <p className="muted dict-count">
        {results.length} of {DICTIONARY.length} entries
      </p>

      {results.length === 0 ? (
        <p className="muted dict-empty">No matches for “{q}”.</p>
      ) : (
        <div className="dict-list">
          {groups.map(([letter, entries]) => (
            <section key={letter} className="dict-group">
              <div className="dict-letter">{letter}</div>
              {entries.map((e, i) => {
                const key = `${letter}-${i}-${e.phonetic}`
                const isVerb = e.type === 'verb'
                const open = isVerb && openKey === key
                return (
                  <div className="dict-item" key={key}>
                    <div className="dict-line">
                      {isVerb ? (
                        <button
                          className={`dict-row tappable ${open ? 'open' : ''}`}
                          aria-expanded={open}
                          onClick={() => setOpenKey(open ? null : key)}
                        >
                          <span className="dict-en">
                            {e.english}
                            <span className="dict-tag">verb</span>
                          </span>
                          <span className="dict-phon">{e.phonetic}</span>
                        </button>
                      ) : (
                        <div className="dict-row">
                          <span className="dict-en">{e.english}</span>
                          <span className="dict-phon">{e.phonetic}</span>
                        </div>
                      )}
                      <PlaySlot text={e.phonetic} />
                    </div>
                    {open && (
                      <div className="dict-detail">
                        <p className="dd-head">To {e.english}</p>
                        <div className="dd-line">
                          <span className="dd-k muted">Infinitive</span>
                          <span className="dd-v">{e.phonetic}</span>
                          <PlaySlot text={e.phonetic} />
                        </div>
                        {e.present && (
                          <div className="dd-line">
                            <span className="dd-k muted">Present</span>
                            <span className="dd-v">{e.present}</span>
                            <PlaySlot text={e.present} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
