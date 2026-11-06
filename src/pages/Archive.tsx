import { useState } from "react";
import { regionById } from "../constants/regions";
import { NORTH_WORDS, RARE_DIALECTS, UNIQUE_WORDS } from "../data/content";
import type { FlipCard } from "../data/content";

const NORTH_COLOR = "#4C6EF5";
const RARE_COLORS = ["#F07B3F", "#9B6BF2", "#2FB38A"];

// 카드 라벨(제주, 경상 …)로 지역 색을 찾고, 없으면 기본색
const colorOf = (label: string, fallback = "#FF385C") => regionById(label)?.color ?? fallback;

function Flip({ card, color }: { card: FlipCard; color: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      className={`flip ${flipped ? "flipped" : ""}`}
      style={{ ["--c" as string]: color }}
      onClick={() => setFlipped((v) => !v)}
      aria-pressed={flipped}
    >
      <span className="flip-inner">
        <span className="flip-face front">
          <span className="flip-tag">{card.label}</span>
          <span className="flip-word">{card.front}</span>
          <span className="flip-hint">눌러서 뜻 보기 ↻</span>
        </span>
        <span className="flip-face back">
          <span className="flip-hint">표준어로는</span>
          <span className="flip-word">{card.back}</span>
          {card.note && <span className="flip-note">{card.note}</span>}
        </span>
      </span>
    </button>
  );
}

export default function Archive() {
  return (
    <section className="section page archive">
      <div className="wrap">
        <span className="eyebrow">말의 기록</span>
        <h1 className="h2">사라지기 전에, 우리 말을 기억해요.</h1>
        <p className="sub">지역마다 고유한 사투리는 그 지역의 삶과 역사를 담은 문화유산이에요.</p>

        <div className="arch-block" style={{ ["--c" as string]: "#FF385C" }}>
          <h2 className="arch-title">
            <span className="arch-icon">✳</span> 독특한 방언
          </h2>
          <p className="sub">표준어와 너무 달라서 뜻을 짐작하기 어려운 말들. 카드를 뒤집어 보세요.</p>
          <div className="flip-grid">
            {UNIQUE_WORDS.map((c) => (
              <Flip key={c.id} card={c} color={colorOf(c.label)} />
            ))}
          </div>
        </div>

        <div className="arch-block" style={{ ["--c" as string]: "#9B6BF2" }}>
          <h2 className="arch-title">
            <span className="arch-icon">♧</span> 희귀한 방언
          </h2>
          <p className="sub">아주 좁은 지역에서, 적은 사람들만 쓰고 있는 말이에요.</p>
          <div className="rare-grid">
            {RARE_DIALECTS.map((d, i) => (
              <article key={d.id} className="rare" style={{ ["--c" as string]: RARE_COLORS[i % RARE_COLORS.length] }}>
                <span className="rare-where">{d.where}</span>
                <h3>{d.name}</h3>
                <p>{d.desc}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="arch-block" style={{ ["--c" as string]: NORTH_COLOR }}>
          <h2 className="arch-title">
            <span className="arch-icon">★</span> 북한에서는 뭐라고 할까?
          </h2>
          <p className="sub">같은 뿌리에서 갈라진 말. 북한에서 쓰는 단어를 맞혀 보세요.</p>
          <div className="flip-grid">
            {NORTH_WORDS.map((c) => (
              <Flip key={c.id} card={c} color={NORTH_COLOR} />
            ))}
          </div>
        </div>

        <div className="closing">
          <h3>기억하는 사람이 많아질수록, 말은 오래 살아요.</h3>
          <p>
            독특한 방언과 희귀한 표현을 지역·뜻·일화·음성으로 모으려 합니다.
            <br />
            정식 서비스에서는 각 표현의 검증된 출처와 기록자의 동의를 함께 표시할 예정입니다.
          </p>
        </div>
      </div>
    </section>
  );
}