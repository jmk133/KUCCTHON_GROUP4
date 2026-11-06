import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { regionById } from "../constants/regions";
import { HERO_PHRASES } from "../data/content";
import KoreaMap from "../components/KoreaMap";

const HEIGHTS = [30, 60, 40, 90, 70, 30, 50, 85, 40, 65, 30, 55];

export default function Home() {
  const [i, setI] = useState(0);

  // 제목 문장을 지역 사투리로 돌아가며 보여 주기
  useEffect(() => {
    const t = window.setInterval(() => setI((v) => (v + 1) % HERO_PHRASES.length), 2600);
    return () => window.clearInterval(t);
  }, []);

  const phrase = HERO_PHRASES[i];
  const region = regionById(phrase.region);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">말투로 떠나는 가장 가까운 여행</span>
            <h1 className="hero-title" aria-live="polite">
              <span key={i} className="swap" style={{ color: region?.color }}>
                {phrase.text}
              </span>
            </h1>
            <span className="region-tag" style={{ background: `${region?.color}1a`, color: region?.color }}>
              {region?.name}의 말
            </span>
            <p className="lead" style={{ marginTop: 16 }}>
              무심코 건넨 한마디에 고향이 묻어나니까.
              <br />
              내 목소리에 담긴, 나도 몰랐던 이야기를 만나봐요.
            </p>
            <Link to="/analysis" className="btn btn-square">
              내 목소리 DNA 확인하기 →
            </Link>
            <p className="meta">20초의 발견 · 가입 없이 체험</p>
          </div>

          <div className="map-card">
            <div className="cap">EVERY VOICE HAS A PLACE</div>
            <h3>“밥 먹었어?”, 지역마다 다르게</h3>
            <KoreaMap />
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="wrap">
          <span className="eyebrow">작은 말에서 시작하는 발견</span>
          <h2 className="h2">오늘은 어떤 사투리를 만나볼까요?</h2>
          <p className="sub">들어보고, 골라보고, 오래 기억해요.</p>

          <div className="feat-grid">
            <Link to="/analysis" className="feat">
              <div className="art" style={{ background: "linear-gradient(135deg,#ff385c,#e31c5f)" }}>
                <div className="wave">
                  {HEIGHTS.map((h, k) => (
                    <i key={k} style={{ height: `${h}%`, animationDelay: `${k * 0.08}s` }} />
                  ))}
                </div>
              </div>
              <div className="body">
                <span className="kicker">20초, 나를 발견하는 시간</span>
                <h3>사투리 DNA 분석</h3>
                <p>내 목소리는 어느 지역 말투와 닮았을까?</p>
                <span className="cta">목소리 분석 체험 →</span>
              </div>
            </Link>

            <Link to="/worldcup" className="feat">
              <div className="art" style={{ background: "linear-gradient(135deg,#F2A33A,#F07B3F)", gap: 12 }}>
                <span>▶ 1번</span>
                <span style={{ opacity: 0.6 }}>vs</span>
                <span>▶ 2번</span>
              </div>
              <div className="body">
                <span className="kicker">듣고 고르는 말투 퀴즈</span>
                <h3>사투리 월드컵</h3>
                <p>더 익숙한 목소리를 고르면 내 고향이 보여요.</p>
                <span className="cta">월드컵 시작하기 →</span>
              </div>
            </Link>

            <Link to="/contest" className="feat">
              <div className="art" style={{ background: "linear-gradient(135deg,#9B6BF2,#5B7CFA)", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 16, opacity: 0.9 }}>▶ ━━━━━━━</span>
                <span>00:08 ♡</span>
              </div>
              <div className="body">
                <span className="kicker">듣다 보면, 정드는 목소리</span>
                <h3>사투리 콘테스트</h3>
                <p>지역의 말맛을 가장 잘 살린 목소리를 뽑아요.</p>
                <span className="cta">목소리 듣기 · 비슷해요 →</span>
              </div>
            </Link>

            <Link to="/archive" className="feat">
              <div className="art" style={{ background: "linear-gradient(135deg,#2FB38A,#1f8f8a)", fontSize: 26 }}>
                말의 기록
              </div>
              <div className="body">
                <span className="kicker">잊히기 전에, 함께 기억해요</span>
                <h3>사라져 가는 우리말</h3>
                <p>독특하고 희귀한 방언을 기록해요.</p>
                <span className="cta">기록실 둘러보기 →</span>
              </div>
            </Link>
          </div>

          <div className="banner">
            <div>
              <span style={{ fontSize: 13, opacity: 0.85 }}>✳ 다른 말투, 같은 마음</span>
              <h2>당신의 말도, 우리의 소중한 기록이에요.</h2>
              <p>익숙해서 몰랐던 사투리의 매력, 함께 발견해요.</p>
            </div>
            <Link to="/archive" className="btn">
              말의 기록 둘러보기 →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}