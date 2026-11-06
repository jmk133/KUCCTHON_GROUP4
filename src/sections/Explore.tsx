const HEIGHTS = [30, 60, 40, 90, 70, 30, 50, 85, 40, 65, 30, 55];

export default function Explore() {
  return (
    <section className="section soft">
      <div className="wrap">
        <span className="eyebrow">작은 말에서 시작하는 발견</span>
        <h2 className="h2">오늘은 어떤 사투리를 만나볼까요?</h2>
        <p className="sub">들어보고, 골라보고, 오래 기억해요.</p>

        <div className="feat-grid">
          <a href="#analysis" className="feat">
            <div className="art" style={{ background: "linear-gradient(135deg,#ff385c,#e31c5f)" }}>
              <div className="wave">
                {HEIGHTS.map((h, i) => (
                  <i key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            </div>
            <div className="body">
              <span className="kicker">20초, 나를 발견하는 시간</span>
              <h3>내 목소리의 DNA</h3>
              <p>나의 말투는 어떤 지역과 닮았을까?</p>
              <span className="cta">목소리 분석 체험 ↗</span>
            </div>
          </a>

          <a href="#worldcup" className="feat">
            <div className="art" style={{ background: "linear-gradient(135deg,#F2A33A,#F07B3F)", gap: 10 }}>
              <span>좋아유</span>
              <span style={{ opacity: 0.6 }}>vs</span>
              <span>좋데이</span>
            </div>
            <div className="body">
              <span className="kicker">어떤 말이 더 마음에 드나요?</span>
              <h3>나에게 어울리는 말투</h3>
              <p>같은 마음, 다른 말투. 당신의 선택은?</p>
              <span className="cta">내게 어울리는 말투 찾기 ↗</span>
            </div>
          </a>

          <a href="#contest" className="feat">
            <div className="art" style={{ background: "linear-gradient(135deg,#9B6BF2,#5B7CFA)", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 16, opacity: 0.9 }}>▶ ━━━━━━━</span>
              <span>00:08 ♡</span>
            </div>
            <div className="body">
              <span className="kicker">듣다 보면, 정드는 목소리</span>
              <h3>우리 동네 사투리 콘테스트</h3>
              <p>지역의 말맛을 가장 잘 살린 목소리를 찾아요.</p>
              <span className="cta">목소리 듣기 · 공감하기 ↗</span>
            </div>
          </a>

          <a href="#archive" className="feat">
            <div className="art" style={{ background: "linear-gradient(135deg,#2FB38A,#1f8f8a)", fontSize: 26 }}>
              말의 씨앗
            </div>
            <div className="body">
              <span className="kicker">잊히기 전에, 함께 기억해요</span>
              <h3>오래 남기고 싶은 말</h3>
              <p>사라져 가는 말에 귀를 기울여요.</p>
              <span className="cta">우리 방언의 작은 기록실 ↗</span>
            </div>
          </a>
        </div>

        <div className="banner">
          <div>
            <span style={{ fontSize: 13, opacity: 0.85 }}>✳ 다른 말투, 같은 마음</span>
            <h2>당신의 말도, 우리의 소중한 기록이에요.</h2>
            <p>익숙해서 몰랐던 사투리의 매력, 함께 발견해요.</p>
          </div>
          <a href="#archive" className="btn">
            말의 기록 둘러보기 ↗
          </a>
        </div>
      </div>
    </section>
  );
}