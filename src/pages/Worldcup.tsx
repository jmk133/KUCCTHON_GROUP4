import { useState } from "react";
import { REGIONS } from "../constants/regions";
import { EXPRESSIONS } from "../data/worldcup";
import type { Expression } from "../data/worldcup";

type Stage = "intro" | "play" | "end";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const regionOf = (id: string) => REGIONS.find((r) => r.id === id);

function Card({ item, onPick }: { item: Expression; onPick: () => void }) {
  const region = regionOf(item.region);
  return (
    <button
      onClick={onPick}
      style={{
        flex: 1, minWidth: 220, padding: 20, borderRadius: 16, cursor: "pointer",
        border: `3px solid ${region?.color ?? "#ccc"}`, background: "#fff", textAlign: "center",
      }}
    >
      <span
        style={{
          display: "inline-block", padding: "2px 10px", borderRadius: 999,
          background: region?.color, color: "#fff", fontSize: 13,
        }}
      >
        {region?.name}
      </span>
      <h2 style={{ margin: "16px 0 8px", fontSize: 28 }}>{item.text}</h2>
      <p style={{ margin: 0, color: "#555" }}>{item.meaning}</p>
    </button>
  );
}

export default function Worldcup() {
  const [stage, setStage] = useState<Stage>("intro");
  const [roundItems, setRoundItems] = useState<Expression[]>([]);
  const [nextRound, setNextRound] = useState<Expression[]>([]);
  const [idx, setIdx] = useState(0);
  const [champion, setChampion] = useState<Expression | null>(null);

  const start = () => {
    setRoundItems(shuffle(EXPRESSIONS));
    setNextRound([]);
    setIdx(0);
    setChampion(null);
    setStage("play");
  };

  const pick = (winner: Expression) => {
    const updated = [...nextRound, winner];
    if (idx + 2 < roundItems.length) {
      setNextRound(updated);
      setIdx(idx + 2);
    } else if (updated.length === 1) {
      setChampion(updated[0]);
      setStage("end");
    } else {
      setRoundItems(updated);
      setNextRound([]);
      setIdx(0);
    }
  };

  const roundName = roundItems.length === 2 ? "결승" : `${roundItems.length}강`;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>🏆 사투리 월드컵</h1>

      {stage === "intro" && (
        <section style={{ textAlign: "center", padding: "32px 0" }}>
          <p>마음에 드는 사투리 표현을 골라 최고의 사투리를 가려 보세요!</p>
          <button onClick={start} style={{ padding: "14px 28px", fontSize: 16 }}>
            {EXPRESSIONS.length}강 시작하기
          </button>
        </section>
      )}

      {stage === "play" && roundItems.length > 0 && (
        <section>
          <p style={{ textAlign: "center", fontWeight: 700 }}>
            {roundName} · {idx / 2 + 1} / {roundItems.length / 2}
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Card item={roundItems[idx]} onPick={() => pick(roundItems[idx])} />
            <Card item={roundItems[idx + 1]} onPick={() => pick(roundItems[idx + 1])} />
          </div>
        </section>
      )}

      {stage === "end" && champion && (
        <section style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ fontSize: 18 }}>🎉 당신이 고른 최고의 사투리는</p>
          <h2
            style={{
              fontSize: 40, margin: "8px 0",
              color: regionOf(champion.region)?.color,
            }}
          >
            {champion.text}
          </h2>
          <p style={{ margin: 0 }}>
            {regionOf(champion.region)?.name} · {champion.meaning}
          </p>
          <div
            style={{
              margin: "20px auto", padding: 16, maxWidth: 480, borderRadius: 12,
              background: "#f7f7f7", textAlign: "left",
            }}
          >
            <strong>📖 문화 이야기</strong>
            <p style={{ marginBottom: 0 }}>{champion.culture}</p>
          </div>
          <button onClick={start} style={{ padding: "12px 24px" }}>다시 하기</button>
        </section>
      )}
    </main>
  );
}