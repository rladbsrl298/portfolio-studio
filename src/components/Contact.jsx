import { profile } from '../data/content'

export default function Contact() {
  return (
    <footer className="contact">
      <p>
        숫자가 낮은 것도 <em>그대로 둡니다.</em>
      </p>
      <div className="contact__links">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <a href={profile.github} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <a href={profile.sheet} target="_blank" rel="noreferrer">
          명세서 버전 ↗
        </a>
      </div>
    </footer>
  )
}
