import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { REGIONS, regionById } from "../constants/regions";
import type { RegionId } from "../constants/regions";
import { WORLDCUP_QUESTIONS } from "../data/content";
import type { VoiceOption } from "../data/content";
import { playVoice, stopVoice } from "../lib/voice";
import { CONTEST_THRESHOLD, saveEligibility } from "../lib/eligibility";

type Stage = "intro" | "play" | "result";

// 질문마다 1번·2번 순서를 섞어서 지역을 짐작하지 못하게 합니다
const shuffled = () =>
  WORLDCUP_QUESTIONS.map((q) => ({
    ...q,
    options: (Math.random() < 0.5 ? [...q.options] : [q.options[1], q.options[0]]) as [VoiceOption, VoiceOption],
  }));

export default function Worldcup() {
  const [stage, setStage] = useState<Stage>("intro");
  const [questions, setQuestions] = useState(shuffled);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<VoiceOption[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  const [heard, setHeard] = useState<[boolean, boolean]>([false, false]);
  const [usedTts, setUsedTts] = useState(false);

  useEffect(() => () => stopVoice(), []);

  const q = questions[idx];

  const listen = async (n: 0 | 1) => {
    setPlaying(n);
    const how = await playVoice(q.options[n].audio, q.options[n].text);
    if (how === "tts") setUsedTts(true);
    setHeard((h) => (n === 0 ? [true, h[1]] : [h[0], true]));
    setPlaying(null);
  };

  const choose = (n: 0 | 1) => {
    stopVoice();
    const next = [...picks, q.options[n]];
    setPicks(next);
    setHeard([false, false]);
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else setStage("result");
  };

  const restart = () => {
    stopVoice();
    setQuestions(shuffled());
    setIdx(0);
    setPicks([]);
    setHeard([false, false]);
    setStage("play");
  };

  // 지역별 점수 = 그 지역 목소리를 고른 횟수 / 그 지역 목소리가 나온 횟수
  const scores = useMemo(() => {
    const appear: Record<string, number> = {};
    const chosen: Record<string, number> = {};
    questions.forEach((qq) => qq.options.forEach((o) => (appear[o.region] = (appear[o.region] ?? 0) + 1)));
    picks.forEach((p) => (chosen[p.region] = (chosen[p.region] ?? 0) + 1));
    return REGIONS.map((r) => ({
      region: r,
      score: appear[r.id] ? (chosen[r.id] ?? 0) / appear[r.id] : 0,
      count: chosen[r.id] ?? 0,
    })).sort((a, b) => b.score - a.score || b.count - a.count);
  }, [questions, picks]);

  const top = scores[0];
  const eligible = stage === "result" && top.score >= CONTEST_THRESHOLD;

  useEffect(() => {
    if (eligible) saveEligibility({ region: top.region.id as RegionId, score: top.score, source: "worldcup" });
  }, [eligible, top]);

  return (
    <section className="section page">
      <div className="wrap">
        <span className="eyebrow">사투리 월드컵</span>
        <h1 className="h2">어느 목소리가 더 내 말투 같나요?</h1>
        <p className="sub">같은 문장을 두 목소리로 들어 보고, 더 익숙하게 들리는 쪽을 골라 주세요. 어느 지역인지는 마지막에 알려 드려요.</p>

        {stage === "intro" && (
          <div className="panel center-panel">
            <p className="big-q">🎧 소리만 듣고 고르기</p>
            <p className="sub">총 {questions.length}문제 · 1분이면 끝나요. 소리를 켜 주세요.</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setStage("play")}>
              월드컵 시작하기
            </button>
          </div>
        )}

        {stage === "play" && (
          <div className="wc">
            <div className="progress">
              <div className="progress-fill" style={{ width: `${(idx / questions.length) * 100}%` }} />
            </div>
            <p className="note" style={{ textAlign: "center", marginTop: 10 }}>
              {idx + 1} / {questions.length}
            </p>

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
              {top.region.name} 말투를 {Math.round(top.score * 100)}% 골랐어요.
            </p>

            <div className="bars">
              {scores.map((s) => {
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
                한 지역을 80% 이상 고르면 사투리 콘테스트에 참여할 수 있어요.
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