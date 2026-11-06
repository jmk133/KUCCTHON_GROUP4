import { useState } from "react";
import { Link } from "react-router-dom";
import { voiceBrain } from "../api/client";
import type { VoiceBrainResult } from "../api/client";
import { useRecorder } from "../hooks/useRecorder";
import { toWav } from "../lib/wav";

// AI 담당이 기준 말투를 녹음한 대본 (모든 사용자가 같은 대본을 읽어야 비교가 의미 있음)
const SCRIPT = [
  "안녕하세요. 내일 회의 시간이 오후 세 시로 바뀌었어요.",
  "장소는 2층 작은 회의실이고요, 각자 노트북을 꼭 챙겨 오세요. 자료는 오늘 저녁까지 단체방에 올려 주시면 됩니다.",
  "늦으시는 분은 미리 연락 주세요. 그럼 내일 뵙겠습니다.",
];

const MIN_SEC = 10;
const MAX_SEC = 60;
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function Brain() {
  const rec = useRecorder(MAX_SEC);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VoiceBrainResult | null>(null);

  const tooShort = rec.seconds < MIN_SEC;

  const run = async () => {
    if (!rec.blob) return;
    setLoading(true);
    setError(null);
    try {
      const wav = await toWav(rec.blob);
      setResult(await voiceBrain(wav));
    } catch (e) {
      setError(e instanceof Error ? e.message : "뇌 반응 예측 중 문제가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  const again = () => {
    rec.reset();
    setResult(null);
    setError(null);
  };

  const maxVal = result ? Math.max(0.0001, ...result.regions.flatMap((r) => [r.user, r.ref])) : 1;

  return (
    <section className="section page">
      <div className="wrap">
        <span className="eyebrow">내 목소리를 듣는 뇌</span>
        <h1 className="h2">내 말투는 듣는 사람의 뇌를 어떻게 울릴까?</h1>
        <p className="sub">
          공개 fMRI 데이터로 학습한 AI(TRIBE)가, 내 목소리를 들은 사람의 뇌 반응을 예측해요.
        </p>

        {!result && (
          <div className="ana-grid">
            <div className="panel">
              <div className="panel-head">
                <h3>대본 읽기</h3>
                <span className="badge">20~30초 권장</span>
              </div>
              <p className="note" style={{ marginBottom: 10 }}>아래 대본을 평소 말투로 끝까지 읽어 주세요.</p>
              <div className="sentences">
                {SCRIPT.map((line) => (
                  <div key={line} className="sentence">{line}</div>
                ))}
              </div>

              <div className="rec">
                {loading ? (
                  <div className="loading">
                    <div className="spinner" />
                    <p>
                      AI가 뇌 반응을 예측하고 있어요.
                      <br />
                      <span className="note">최대 1분 정도 걸릴 수 있어요.</span>
                    </p>
                  </div>
                ) : (
                  <>
                    <span className="rec-time">
                      {fmt(rec.seconds)} / {fmt(MAX_SEC)}
                    </span>
                    <button
                      className={`rec-btn ${rec.isRecording ? "live" : ""}`}
                      onClick={rec.isRecording ? rec.stop : rec.start}
                      aria-label={rec.isRecording ? "녹음 정지" : "녹음 시작"}
                    >
                      {rec.isRecording ? "■" : "●"}
                    </button>
                    <span className="rec-label">
                      {rec.isRecording
                        ? rec.seconds < MIN_SEC
                          ? `최소 ${MIN_SEC}초 이상 읽어 주세요`
                          : "다 읽었으면 눌러서 끝내기"
                        : rec.blob
                          ? "다시 녹음하려면 누르세요"
                          : "눌러서 녹음하기"}
                    </span>
                    {rec.audioUrl && !rec.isRecording && <audio controls src={rec.audioUrl} style={{ width: "100%" }} />}
                  </>
                )}
                {rec.error && <p className="err">{rec.error}</p>}
                {rec.blob && !rec.isRecording && tooShort && (
                  <p className="err">녹음이 {MIN_SEC}초보다 짧아요. 대본을 끝까지 읽어 다시 녹음해 주세요.</p>
                )}
                {error && <p className="err">{error}</p>}
                <div className="rec-actions">
                  <button
                    className="btn btn-primary"
                    disabled={!rec.blob || rec.isRecording || loading || tooShort}
                    onClick={run}
                  >
                    {loading ? "예측 중…" : error ? "다시 시도하기" : "뇌 반응 예측하기"}
                  </button>
                </div>
                <p className="note">분석하기를 누르면 녹음이 AI 서버로 전송돼요.</p>
              </div>
            </div>

            <aside className="panel side">
              <h3>🧠 소리는 뇌에서 어떻게 처리될까?</h3>
              <ol>
                <li><b>청각 영역</b>: 소리의 크기와 음색</li>
                <li><b>오른쪽 상측두</b>: 목소리와 억양</li>
                <li><b>왼쪽 상측두</b>: 말소리 알아듣기</li>
                <li><b>왼쪽 하전두</b>: 언어 처리</li>
              </ol>
              <hr />
              <p className="note">
                실제로 뇌를 촬영하는 것이 아니라, fMRI 데이터로 학습한 모델이 반응을 <b>예측</b>한 값이에요. 개인의 뇌 상태나
                능력을 뜻하지 않아요.
              </p>
            </aside>
          </div>
        )}

        {result && (
          <div className="panel" style={{ marginTop: 32 }}>
            <p className="result-top">
              {result.similar[0] ? (
                <>
                  듣는 뇌에는 <em>{result.similar[0].style}</em>처럼 들렸어요.
                </>
              ) : (
                "뇌 반응 예측이 끝났어요."
              )}
            </p>
            {result.dialect && (
              <p className="sub">
                같은 녹음으로 판단한 말씨: <b>{result.dialect.name}</b> ({Math.round(result.dialect.prob * 100)}%)
              </p>
            )}

            {(result.images?.left || result.images?.right) && (
              <div className="brain-imgs">
                {result.images?.left && (
                  <figure>
                    <img src={`data:image/png;base64,${result.images.left}`} alt="왼쪽 반구 예측 반응 지도" />
                    <figcaption>왼쪽 반구</figcaption>
                  </figure>
                )}
                {result.images?.right && (
                  <figure>
                    <img src={`data:image/png;base64,${result.images.right}`} alt="오른쪽 반구 예측 반응 지도" />
                    <figcaption>오른쪽 반구</figcaption>
                  </figure>
                )}
              </div>
            )}

            {result.regions.length > 0 && (
              <>
                <h3 className="brain-h">영역별 반응 · 나 vs 기준 평균</h3>
                <div className="legend">
                  <span><i className="sw me" />나</span>
                  <span><i className="sw ref" />기준 말투 평균</span>
                </div>
                <div className="regions">
                  {result.regions.map((r) => (
                    <div key={r.key} className="region-row">
                      <div className="region-name">
                        <b>{r.name}</b>
                        <span className="note">{r.desc}</span>
                      </div>
                      <div className="region-bars">
                        <div className="rb-track">
                          <div className="rb me" style={{ width: `${(r.user / maxVal) * 100}%` }} />
                        </div>
                        <div className="rb-track">
                          <div className="rb ref" style={{ width: `${(r.ref / maxVal) * 100}%` }} />
                        </div>
                      </div>
                      <span className={`region-diff ${r.user >= r.ref ? "up" : "down"}`}>
                        {r.user >= r.ref ? "▲ 더 강함" : "▼ 더 약함"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {result.similar.length > 0 && (
              <>
                <h3 className="brain-h">뇌 반응이 비슷한 말투 순위</h3>
                <ol className="similar">
                  {result.similar.map((s, i) => (
                    <li key={s.style} className={i === 0 ? "top" : ""}>
                      <span className="rank">{i + 1}</span>
                      {s.style}
                    </li>
                  ))}
                </ol>
              </>
            )}

            <p className="demo-note" style={{ marginTop: 16 }}>
              공개 fMRI 데이터로 학습한 모델의 예측값이에요. 실제 뇌 촬영 결과가 아니며, 개인의 상태나 능력을 판단하지 않아요.
              (예측 {result.seconds}초 분량 · 계산 {Math.round(result.elapsed)}초)
            </p>

            <div className="rec-actions" style={{ marginTop: 20, justifyContent: "flex-start" }}>
              <button className="btn btn-primary" onClick={again}>다시 녹음하기</button>
              <Link to="/analysis" className="btn btn-ghost">사투리 DNA 분석하기</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}