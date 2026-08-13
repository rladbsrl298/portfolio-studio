import { background } from '../data/content'

export default function Background() {
  return (
    <section className="section" aria-label="교육 · 활동 · 자격">
      <div className="section__head">
        <h2>교육 · 활동 · 자격</h2>
      </div>
      <ul className="rows">
        {background.map(([when, what]) => (
          <li key={when + what}>
            <span className="when">{when}</span>
            <span dangerouslySetInnerHTML={{ __html: what }} />
          </li>
        ))}
      </ul>
    </section>
  )
}
