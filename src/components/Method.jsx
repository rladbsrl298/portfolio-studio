import { method } from '../data/content'

export default function Method() {
  return (
    <section className="section" aria-label="일하는 방식">
      <div className="section__head">
        <h2>일하는 방식</h2>
        <p className="label" style={{ marginLeft: 'auto' }}>
          {method.note}
        </p>
      </div>

      <ol className="pipeline">
        {method.steps.map(([title, desc]) => (
          <li key={title}>
            <div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="label" style={{ marginTop: '2.5rem' }}>
        사용 도구
      </p>
      <ul className="stack">
        {method.tools.map(([name, core]) => (
          <li key={name} data-core={core}>
            {name}
          </li>
        ))}
      </ul>
    </section>
  )
}
