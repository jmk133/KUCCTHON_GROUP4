import { useState } from "react";
import { Link } from "react-router-dom";
import { REGIONS, regionById } from "../constants/regions";
import { analyzeVoice } from "../api/client";
import type { AnalyzeResult } from "../api/client";
import { useRecorder, MAX_SECONDS } from "../hooks/useRecorder";
import { CONTEST_THRESHOLD, saveEligibility } from "../lib/eligibility";

const SENTENCES = ["오늘 저녁에 뭐 먹을까?", "나는 따뜻한 국밥이 먹고 싶어.", "밥 먹고 우리 같이 산책하러 갈래?"];

const COMMENT: Record<string, string> = {
  gyeongsang: "다정한 안부를 툭 건네는 말투가 매력적이네요.",
  jeolla: "구수하고 정 많은 말맛이 느껴져요.",
  chungcheong: "느긋하고 여유로운 리듬이 편안해요.",
  gangwon: "담백하고 소박한 말투가 정겨워요.",
  jeju: "섬의 바람처럼 독특한 억양이 살아 있어요.",
  seoul: "또렷하고 깔끔한 말투예요.",
};

const fmt = (s: number) => `00:${String(s).padStart(2, "0")}`;

// idle: 녹음 화면 / retry: 재녹음 권장 안내 / result: 결과 화면
type View = "idle" | "retry" | "result";

export default function Analysis() {
  const rec = useRecorder();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [view, setView] = useState<View>("idle");
  const [error, setError] = useState<string | null>(null);
  const [donation, setDonation] = useState<"ask" | "yes" | "no">("ask");

  const step = view === "result" ? 3 : rec.isRecording || rec.blob ? 2 : 1;

  const run = async (useSample: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const r = await analyzeVoice(useSample ? null : rec.blob);
      setResult(r);
      setDonation("ask");
      setView(r.retry_recommended ? "retry" : "result");
      if (!r.demo) saveEligibility({ region: r.top_region, score: r.confidence, source: "dna" });
    } catch {
      // 녹음 파일은 그대로 남겨 두어 재전송할 수 있게 합니다
      setError("음성 분석 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const reRecord = () => {
    rec.reset();
    setResult(null);
    setError(null);
    setView("idle");
  };

  const top = result ? regionById(result.top_region) : null;
  const sorted = result ? [...REGIONS].sort((a, b) => (result.scores[b.id] ?? 0) - (result.scores[a.id] ?? 0)) : [];
  const contestOk = !!result && !result.demo && result.confidence >= CONTEST_THRESHOLD;

  return (
    <section className="section page">
      <div className="wrap">
        <span className="eyebrow">사투리 DNA 분석</span>
        <h1 className="h2">20초, 내 목소리에 담긴 고향 찾기</h1>

        <div className="ana-grid">
          <div className="panel">
            <div className="panel-head">
              <h3>목소리 녹음</h3>
              {result?.demo && <span className="badge">샘플 결과 · 데모</span>}
            </div>

            <div className="steps">
              {["문장 읽기", "녹음하기", "결과 만나기"].map((s, i) => (
                <div key={s} className={`step ${step === i + 1 ? "on" : ""}`}>
                  {i + 1} {s}
                </div>
              ))}
            </div>

            {view === "idle" && (
              <>
                <p className="note" style={{ marginBottom: 10 }}>아래 세 문장을 편하게 읽어주세요</p>
                <div className="sentences">
                  {SENTENCES.map((s) => (
                    <div key={s} className="sentence">{s}</div>
                  ))}
                </div>

                <div className="rec">
                  {loading ? (
                    <div className="loading">
                      <div className="spinner" />
                      <p>AI가 음성의 지역별 말투 특징을 분석하고 있습니다.</p>
                    </div>
                  ) : (
                    <>
                      <span className="rec-time">
                        {fmt(rec.seconds)} / {fmt(MAX_SECONDS)}
                      </span>
                      <button
                        className={`rec-btn ${rec.isRecording ? "live" : ""}`}
                        onClick={rec.isRecording ? rec.stop : rec.start}
                        aria-label={rec.isRecording ? "녹음 정지" : "녹음 시작"}
                      >
                        {rec.isRecording ? "■" : "●"}
                      </button>
                      <span className="rec-label">
                        {rec.isRecording ? "눌러서 녹음 끝내기" : rec.blob ? "다시 녹음하려면 누르세요" : "눌러서 녹음하기"}
                      </span>
                      {rec.audioUrl && !rec.isRecording && <audio controls src={rec.audioUrl} style={{ width: "100%" }} />}
                    </>
                  )}
                  {rec.error && <p className="err">{rec.error}</p>}
                  {error && <p className="err">{error}</p>}
                  <div className="rec-actions">
                    <button
                      className="btn btn-primary"
                      disabled={!rec.blob || loading || rec.isRecording}
                      onClick={() => run(false)}
                    >
                      {loading ? "분석 중…" : error ? "다시 분석하기" : "사투리 DNA 분석하기"}
                    </button>
                    <button className="btn btn-ghost" disabled={loading || rec.isRecording} onClick={() => run(true)}>
                      녹음 없이 샘플로 체험하기
                    </button>
                  </div>
                  <p className="note">분석하기를 누르면 녹음이 서버로 전송돼요. 음성 파일은 저장하지 않아요.</p>
                </div>
              </>
            )}

            {view === "retry" && (
              <div className="notice">
                <p className="result-top" style={{ fontSize: 20 }}>분석 결과가 명확하지 않습니다.</p>
                <p className="sub">주변 소음이 적은 곳에서 다시 녹음해 보시겠어요?</p>
                <div className="rec-actions" style={{ marginTop: 20, justifyContent: "flex-start" }}>
                  <button className="btn btn-primary" onClick={reRecord}>다시 녹음하기</button>
                  <button className="btn btn-ghost" onClick={() => setView("result")}>현재 결과 보기</button>
                </div>
              </div>
            )}

            {view === "result" && result && top && (
              <div>
                <p className="result-top">
                  당신의 말에는 <em>{top.name}</em>의 정겨움이 담겨 있어요.
                </p>
                <p className="sub">{COMMENT[top.id]}</p>

                <p className="note" style={{ marginTop: 20, fontWeight: 700 }}>지역별 AI 분류 점수</p>
                <div className="bars" style={{ marginTop: 10 }}>
                  {sorted.map((r) => {
                    const pct = Math.round((result.scores[r.id] ?? 0) * 100);
                    const isTop = r.id === top.id;
                    return (
                      <div key={r.id} className={`bar-row ${isTop ? "top" : ""}`}>
                        <span>{r.name}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%`, background: r.color, opacity: isTop ? 1 : 0.45 }} />
                        </div>
                        <span className="pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                <p className="demo-note">
                  {result.demo
                    ? "샘플 결과입니다. 모든 사용자에게 같은 예시 점수를 보여줍니다."
                    : "AI 분류 점수는 실제 출신 지역일 확률이나 사투리 실력을 뜻하지 않아요."}
                </p>

                {contestOk && (
                  <div className="invite">
                    <b>다른 사람들도 내 사투리를 인정할까요?</b>
                    <p>{top.name} 말투 특징이 80% 이상 나왔어요. {top.name} 대표로 사투리 콘테스트에 참여할 수 있어요.</p>
                    <Link to="/contest" className="btn btn-primary" style={{ marginTop: 12 }}>
                      콘테스트 참여하기 →
                    </Link>
                  </div>
                )}

                {result.donation_eligible && (
                  <div className="donate">
                    {donation === "ask" && (
                      <>
                        <p>
                          AI가 특정 지역의 말투 특징을 뚜렷하게 감지했습니다. 지역 언어 연구와 서비스 개선을 위해 녹음
                          데이터를 기증하시겠어요?
                        </p>
                        <div className="rec-actions" style={{ marginTop: 12, justifyContent: "flex-start" }}>
                          <button className="btn btn-primary" onClick={() => setDonation("yes")}>기증하기</button>
                          <button className="btn btn-ghost" onClick={() => setDonation("no")}>기증하지 않기</button>
                        </div>
                      </>
                    )}
                    {donation === "yes" && (
                      <p>기증 의사를 확인했어요. 기증 업로드 기능은 준비 중이라 아직 녹음이 전송되지 않았어요.</p>
                    )}
                    {donation === "no" && <p>기증하지 않기를 선택했어요. 녹음은 전송되지 않아요.</p>}
                  </div>
                )}

                <div className="rec-actions" style={{ marginTop: 20, justifyContent: "flex-start" }}>
                  <button className="btn btn-primary" onClick={reRecord}>다시 녹음하기</button>
                  <Link to="/" className="btn btn-ghost">첫 화면으로</Link>
                </div>
              </div>
            )}
          </div>

          <aside className="panel side">
            <h3>◎ 말투는 섞일수록 더 당신다워요.</h3>
            <p className="sub" style={{ marginTop: 0 }}>
              태어난 곳, 자란 동네, 함께한 사람들.
              <br />내 말에는 여러 곳의 이야기가 섞여 있어요.
            </p>
            <hr />
            <b>이렇게 체험해보세요</b>
            <ol>
              <li>조용한 곳에서 마이크를 켜주세요.</li>
              <li>억양을 꾸미지 않고 편하게 읽어주세요.</li>
              <li>녹음 후 결과를 확인해요.</li>
            </ol>
            <hr />
            <div className="privacy">
              <span>♧</span>
              <div>
                <b>내 목소리는 분석에만 쓰여요</b>
                <br />
                음성 파일은 저장하지 않고, 분석 결과만 기록해요. 기증은 동의한 경우에만 진행돼요.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}