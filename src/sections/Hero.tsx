import { REGIONS } from "../constants/regions";

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow">말투로 떠나는 가장 가까운 여행</span>
          <h1>
            니 고향이
            <br />
            <em>어데고?</em>
          </h1>
          <span className="region-tag">경상도의 말</span>
          <p className="lead" style={{ marginTop: 16 }}>
            무심코 건넨 한마디에 고향이 묻어나니까.
            <br />
            내 목소리에 담긴, 나도 몰랐던 이야기를 만나봐요.
          </p>
          <a href="#analysis" className="btn btn-primary">
            내 목소리 DNA 확인하기 ↗
          </a>
          <p className="meta">20초의 발견 · 가입 없이 체험 · AI 연결 전 데모</p>
        </div>

        <div className="map-card">
          <div className="cap">EVERY VOICE HAS A PLACE</div>
          <h3>대한민국, 말의 지도</h3>
          <div className="greet-grid">
            {REGIONS.map((r) => (
              <div key={r.id} className="greet" style={{ ["--c" as string]: r.color }}>
                <small>{r.short}</small>
                <span>{r.greeting}</span>
              </div>
            ))}
          </div>
          <p className="foot">우리의 말이 만나는 곳.</p>
        </div>
      </div>
    </section>
  );
}