import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { REGIONS, regionById } from "../constants/regions";
import type { RegionId } from "../constants/regions";
import { PLAYOFF_LINES, PLAYOFF_STANDARD, WORLDCUP_QUESTIONS } from "../data/content";
import type { VoiceOption } from "../data/content";
import { playVoice, stopVoice } from "../lib/voice";
import { CONTEST_THRESHOLD, saveEligibility } from "../lib/eligibility";

type Stage = "intro" | "play" | "playoff" | "result";

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// 문제 순서와 1번·2번 순서를 섞어서 지역을 짐작하지 못하게 합니다
const shuffled = () =>
  shuffle(WORLDCUP_QUESTIONS).map((q) => ({
    ...q,
    options: (Math.random() < 0.5 ? [...q.options] : [q.options[1], q.options[0]]) as [VoiceOption, VoiceOption],
  }));

// 지역별 점수 = 그 지역 목소리를 고른 횟수 / 그 지역 목소리가 나온 횟수
function computeScores(questions: ReturnType<typeof shuffled>, picks: VoiceOption[]) {
  const appear: Record<string, number> = {};
  const chosen: Record<string, number> = {};
  questions.forEach((q) => q.options.forEach((o) => (appear[o.region] = (appear[o.region] ?? 0) + 1)));
  picks.forEach((p) => (chosen[p.region] = (chosen[p.region] ?? 0) + 1));
  return REGIONS.map((r) => ({
    region: r,
    score: appear[r.id] ? (chosen[r.id] ?? 0) / appear[r.id] : 0,
    count: chosen[r.id] ?? 0,
    appear: appear[r.id] ?? 0,
  })).sort((a, b) => b.score - a.score);
}

export default function Worldcup() {
  const [stage, setStage] = useState<Stage>("intro");
  const [questions, setQuestions] = useState(shuffled);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<VoiceOption[]>([]);
  const [contenders, setContenders] = useState<RegionId[]>([]); // 동점 결승 후보
  const [champion, setChampion] = useState<RegionId | null>(null);
  const [wentPlayoff, setWentPlayoff] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const [heard, setHeard] = useState<[boolean, boolean]>([false, false]);
  const [usedTts, setUsedTts] = useState(false);

  useEffect(() => () => stopVoice(), []);

  const scores = useMemo(() => computeScores(questions, picks), [questions, picks]);

  // 결승전 보기 순서 (다시 그려져도 바뀌지 않도록 상태로 고정)
  const [playoffOrder, setPlayoffOrder] = useState<[VoiceOption, VoiceOption] | null>(null);
  // 지금 화면에 보여 줄 문제 (본선 또는 결승전)
  const q = stage === "playoff" && playoffOrder ? { standard: PLAYOFF_STANDARD, options: playoffOrder } : questions[idx];

  const listen = async (n: 0 | 1) => {
    setPlaying(n);
    const how = await playVoice(q.options[n].audio, q.options[n].text);
    if (how === "tts") setUsedTts(true);
    setHeard((h) => (n === 0 ? [true, h[1]] : [h[0], true]));
    setPlaying(null);
  };

  const startPlayoff = (tied: RegionId[]) => {
    const order = shuffle(tied);
    setContenders(order);
    setPlayoffOrder(
      (Math.random() < 0.5
        ? [PLAYOFF_LINES[order[0]], PLAYOFF_LINES[order[1]]]
        : [PLAYOFF_LINES[order[1]], PLAYOFF_LINES[order[0]]]) as [VoiceOption, VoiceOption]
    );
    setWentPlayoff(true);
    setStage("playoff");
  };

  const choose = (n: 0 | 1) => {
    stopVoice();
    setHeard([false, false]);
    const picked = q.options[n];

    // 결승전: 진 지역을 빼고 다음 후보와 다시 대결
    if (stage === "playoff") {
      const loser = q.options[n === 0 ? 1 : 0].region;
      const rest = contenders.filter((r) => r !== loser);
      if (rest.length === 1) {
        setChampion(rest[0]);
        setStage("result");
      } else {
        // 이긴 지역 vs 다음 후보
        const next: RegionId[] = [picked.region, ...rest.filter((r) => r !== picked.region)];
        setContenders(next);
        setPlayoffOrder(
          (Math.random() < 0.5
            ? [PLAYOFF_LINES[next[0]], PLAYOFF_LINES[next[1]]]
            : [PLAYOFF_LINES[next[1]], PLAYOFF_LINES[next[0]]]) as [VoiceOption, VoiceOption]
        );
      }
      return;
    }

    // 본선
    const nextPicks = [...picks, picked];
    setPicks(nextPicks);
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      return;
    }
    const final = computeScores(questions, nextPicks);
    const best = final[0].score;
    const tied = final.filter((s) => s.score === best).map((s) => s.region.id);
    if (tied.length > 1) startPlayoff(tied);
    else {
      setChampion(tied[0]);
      setStage("result");
    }
  };

  const restart = () => {
    stopVoice();
    setQuestions(shuffled());
    setIdx(0);
    setPicks([]);
    setContenders([]);
    setPlayoffOrder(null);
    setChampion(null);
    setWentPlayoff(false);
    setHeard([false, false]);
    setStage("play");
  };

  const top = scores.find((s) => s.region.id === champion) ?? scores[0];
  const eligible = stage === "result" && top.score >= CONTEST_THRESHOLD;

  useEffect(() => {
    if (eligible) saveEligibility({ region: top.region.id as RegionId, score: top.score, source: "worldcup" });
  }, [eligible, top]);

  // 결과 막대: 우승 지역을 맨 위로
  const ordered = [top, ...scores.filter((s) => s.region.id !== top.region.id)];
  const total = questions.length;

  return (
    <section className="section page">
      <div className="wrap">
        <span className="eyebrow">사투리 월드컵</span>
        <h1 className="h2">어느 목소리가 더 내 말투 같나요?</h1>
        <p className="sub">같은 문장을 두 목소리로 들어 보고, 더 익숙하게 들리는 쪽을 골라 주세요. 어느 지역인지는 마지막에 알려 드려요.</p>

        {stage === "intro" && (
          <div className="panel center-panel">
            <p className="big-q">🎧 소리만 듣고 고르기</p>
            <p className="sub">총 {total}문제 · 3분이면 끝나요. 소리를 켜 주세요.</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setStage("play")}>
              월드컵 시작하기
            </button>
          </div>
        )}

        {(stage === "play" || stage === "playoff") && (
          <div className="wc">
            {stage === "play" ? (
              <>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${(idx / total) * 100}%` }} />
                </div>
                <p className="note" style={{ textAlign: "center", marginTop: 10 }}>
                  {idx + 1} / {total}
                </p>
              </>
            ) : (
              <div className="playoff-banner">
                🔥 동점 결승전! 비슷하게 고른 말투가 {contenders.length}개 있어요. 한 번 더 골라 주세요.
              </div>
            )}

            <div className="standard">
              <span className="note">이 문장을 들어 보세요</span>
              <p>“{q.standard}”</p>
            </div>

            <div className="voices">
              {([0, 1] as const).map((n) => (
                <div key={n} className={`voice ${playing === n ? "on" : ""}`}>
                  <span className="voice-no">{n + 1}번 목소리</span>
                  <button className="voice-play" onClick={() => listen(n)} disabled={playing !== null} aria-label={`${n + 1}번 목소리 듣기`}>
                    {playing === n ? "♪" : "▶"}
                  </button>
                  <span className="note">{playing === n ? "재생 중…" : heard[n] ? "다시 듣기" : "눌러서 듣기"}</span>
                  <button className="btn btn-ghost voice-pick" onClick={() => choose(n)}>
                    이 말투가 더 익숙해요
                  </button>
                </div>
              ))}
            </div>
            <p className="note" style={{ textAlign: "center", marginTop: 14 }}>
              두 목소리를 모두 들어 본 뒤에 고르는 걸 추천해요.
            </p>
          </div>
        )}

        {stage === "result" && (
          <div className="panel" style={{ marginTop: 32 }}>
            <p className="result-top">
              당신은 <em style={{ color: top.region.color }}>{top.region.name}</em> 지역 사람일 가능성이 높아요.
            </p>
            <p className="sub">
              {top.region.name} 말투가 나온 {top.appear}번 중 {top.count}번을 골랐어요
              ({Math.round(top.score * 100)}%).
              {wentPlayoff && " 동점이라 결승전에서 고른 말투로 정했어요."}
            </p>

            <div className="bars">
              {ordered.map((s) => {
                const pct = Math.round(s.score * 100);
                const isTop = s.region.id === top.region.id;
                return (
                  <div key={s.region.id} className={`bar-row ${isTop ? "top" : ""}`}>
                    <span>{s.region.name}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: s.region.color, opacity: isTop ? 1 : 0.45 }} />
                    </div>
                    <span className="pct">{pct}%</span>
                  </div>
                );
              })}
            </div>

            <details className="reveal">
              <summary>내가 고른 목소리 정답 보기</summary>
              <ul>
                {questions.map((qq, k) => {
                  const p = picks[k];
                  const r = regionById(p?.region);
                  return (
                    <li key={qq.id}>
                      <span className="note">“{qq.standard}”</span>
                      <b style={{ color: r?.color }}>
                        {r?.name} · “{p?.text}”
                      </b>
                    </li>
                  );
                })}
              </ul>
            </details>

            {eligible ? (
              <div className="invite">
                <b>다른 사람들도 당신의 사투리를 인정할까요?</b>
                <p>{top.region.name} 말투를 {Math.round(top.score * 100)}% 골랐어요. {top.region.name} 대표로 사투리 콘테스트에 참여할 수 있어요.</p>
                <Link to="/contest" className="btn btn-primary" style={{ marginTop: 12 }}>
                  콘테스트 참여하기 →
                </Link>
              </div>
            ) : (
              <p className="demo-note" style={{ marginTop: 16 }}>
                한 지역 말투를 80% 이상(5번 중 4번 이상) 고르면 사투리 콘테스트에 참여할 수 있어요.
              </p>
            )}

            {usedTts && (
              <p className="note" style={{ marginTop: 12 }}>
                지금은 녹음 파일 대신 기기의 합성음으로 문장을 읽어 줬어요. 실제 사투리 녹음으로 교체될 예정이에요.
              </p>
            )}

            <div className="rec-actions" style={{ marginTop: 20, justifyContent: "flex-start" }}>
              <button className="btn btn-ghost" onClick={restart}>다시 하기</button>
              <Link to="/analysis" className="btn btn-ghost">내 목소리로 DNA 분석하기</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}