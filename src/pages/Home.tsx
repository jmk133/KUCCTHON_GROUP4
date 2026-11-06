import { Link } from "react-router-dom";
import { REGIONS } from "../constants/regions";

const FEATURES = [
  {
    to: "/dna",
    emoji: "🧬",
    title: "사투리 DNA 분석",
    desc: "내 목소리로 어느 지역 말투에 가까운지 확인해 보세요.",
  },
  {
    to: "/worldcup",
    emoji: "🏆",
    title: "사투리 월드컵",
    desc: "지역 표현들 중 최고의 사투리를 골라 보세요.",
  },
  {
    to: "/board",
    emoji: "💬",
    title: "사투리 게시판",
    desc: "내 사투리를 평가받고, 이달의 단어에 일화를 남겨 보세요.",
  },
];

// 문구는 팀원이 다듬을 예정. 통계나 지정 등급은 출처 확인 후에 추가하세요.
const ENDANGERED = [
  {
    title: "사라지는 이유",
    desc: "화자의 고령화와 미디어의 표준어화로 방언을 쓰는 사람이 줄고 있어요.",
  },
  {
    title: "제주어 같은 사례",
    desc: "젊은 세대로 이어지지 못한 방언과 고유 어휘가 점점 잊히고 있어요.",
  },
  {
    title: "우리가 하는 일",
    desc: "녹음을 모으고 검증해서 방언을 기록하고 보존하는 데이터로 남깁니다.",
  },
];

const card: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
};

export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      {/* 히어로 */}
      <section style={{ textAlign: "center", padding: "40px 0" }}>
        <h1 style={{ fontSize: 36, margin: 0 }}>사투리 DNA, 사투리</h1>
        <p style={{ fontSize: 18, color: "#555" }}>
          내 말투에 담긴 고향을 찾고, 사라져 가는 사투리를 함께 지켜요.
        </p>
        <Link
          to="/dna"
          style={{
            display: "inline-block",
            marginTop: 12,
            padding: "14px 28px",
            borderRadius: 999,
            background: "#7950F2",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          내 말투 분석하기
        </Link>
        <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {REGIONS.map((r) => (
            <span
              key={r.id}
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                background: r.color,
                color: "#fff",
                fontSize: 14,
              }}
            >
              {r.name}
            </span>
          ))}
        </div>
      </section>

      {/* 기능 카드 */}
      <section>
        <h2>이런 걸 할 수 있어요</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {FEATURES.map((f) => (
            <Link key={f.to} to={f.to} style={{ ...card, textDecoration: "none", color: "inherit" }}>
              <div style={{ fontSize: 32 }}>{f.emoji}</div>
              <h3 style={{ margin: "8px 0 4px" }}>{f.title}</h3>
              <p style={{ margin: 0, color: "#555" }}>{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 소멸 위기 방언 */}
      <section style={{ marginTop: 40 }}>
        <h2>사라져 가는 방언을 지켜요</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {ENDANGERED.map((e) => (
            <div key={e.title} style={card}>
              <h3 style={{ margin: "0 0 4px" }}>{e.title}</h3>
              <p style={{ margin: 0, color: "#555" }}>{e.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}