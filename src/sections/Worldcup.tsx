import { useState } from "react";
import { regionById } from "../constants/regions";
import { TONE_ITEMS } from "../data/content";
import type { ToneItem } from "../data/content";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Tone({ item, onPick }: { item: ToneItem; onPick: () => void }) {
  const r = regionById(item.region);
  return (
    <button className="tone" style={{ ["--c" as string]: r?.color }} onClick={onPick}>
      <span className="chip">
        <i className="dot" style={{ background: r?.color }} />
        {r?.name}
      </span>
      <span className="q">“{item.text}”</span>
      <span className="v">{item.vibe}</span>
    </button>
  );
}

export default function Worldcup() {
  const [round, setRound] = useState<ToneItem[]>(() => shuffle(TONE_ITEMS));
  const [next, setNext] = useState<ToneItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [champ, setChamp] = useState<ToneItem | null>(null);

  const restart = () => {
    setRound(shuffle(TONE_ITEMS));
    setNext([]);
    setIdx(0);
    setChamp(null);
  };

  const pick = (w: ToneItem) => {
    const updated = [...next, w];
    if (idx + 2 < round.length) {
      setNext(updated);
      setIdx(idx + 2);
    } else if (updated.length === 1) {
      setChamp(updated[0]);
    } else {
      setRound(updated);
      setNext([]);
      setIdx(0);
    }
  };

  const label = round.length === 2 ? "결승" : `${round.length}강`;
  const champRegion = champ ? regionById(champ.region) : null;

  return (
    <section id="worldcup" className="section soft">
      <div className="wrap">
        <span className="eyebrow">말투 찾기</span>
        <h2 className="h2">같은 마음, 다른 말투. 당신의 선택은?</h2>
        <p className="sub">“같이 밥 먹자”를 지역마다 다르게 말하면 어떨까요? 마음에 드는 말을 골라 주세요.</p>

        {!champ ? (
          <>
            <div className="wc-head">
              <div>
                오늘의 주제 <b>나와 닮은 목소리</b> · {label} · {idx / 2 + 1} / {round.length / 2}
              </div>
              <button className="chip" onClick={restart}>↻ 처음부터</button>
            </div>
            <div className="vs">
              <Tone item={round[idx]} onPick={() => pick(round[idx])} />
              <span className="mid">VS</span>
              <Tone item={round[idx + 1]} onPick={() => pick(round[idx + 1])} />
            </div>
            <p className="note" style={{ marginTop: 14, textAlign: "center" }}>선택한 말이 다음 라운드에 올라가요.</p>
          </>
        ) : (
          <div className="panel winner" style={{ marginTop: 32 }}>
            <span className="eyebrow">나에게 어울리는 말투</span>
            <p className="q" style={{ color: champRegion?.color }}>“{champ.text}”</p>
            <p className="sub">
              {champRegion?.name}의 {champ.vibe}이 당신과 닮았어요.
            </p>
            <div className="rec-actions" style={{ marginTop: 24 }}>
              <a href="#contest" className="btn btn-primary">사투리 콘테스트 보러 가기 ↗</a>
              <button className="btn btn-ghost" onClick={restart}>다시 하기</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}