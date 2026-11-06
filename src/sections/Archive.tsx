import { useState } from "react";
import { regionById } from "../constants/regions";
import { WORD_SEEDS } from "../data/content";

export default function Archive() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="archive" className="section soft">
      <div className="wrap">
        <span className="eyebrow">✳ 오늘의 말 씨앗</span>
        <h2 className="h2">낯설지만, 다정한 말들.</h2>
        <p className="sub">말 카드를 눌러 이야기를 만나보세요.</p>

        <div className="seed-grid">
          {WORD_SEEDS.map((w) => {
            const r = regionById(w.region);
            const isOpen = open === w.id;
            return (
              <button key={w.id} className="seed" onClick={() => setOpen(isOpen ? null : w.id)} aria-expanded={isOpen}>
                <span className="chip" style={{ alignSelf: "flex-start" }}>
                  <i className="dot" style={{ background: r?.color }} />
                  {r?.name}
                </span>
                <span className="w">{w.word}</span>
                <span className="m">= {w.meaning}</span>
                {isOpen ? <p className="story">{w.story}</p> : <span className="note">눌러서 이야기 보기 ↓</span>}
              </button>
            );
          })}
        </div>

        <div className="closing">
          <h3>♧ 기억하는 사람이 많아질수록, 말은 오래 살아요.</h3>
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