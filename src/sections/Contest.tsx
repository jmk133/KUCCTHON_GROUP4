import { useEffect, useMemo, useState } from "react";
import { REGIONS, regionById } from "../constants/regions";
import { createPost, listPosts, postAudioUrl } from "../api/client";
import type { Post } from "../api/client";
import { CONTEST_SENTENCE, SAMPLE_POSTS } from "../data/content";
import { useRecorder } from "../hooks/useRecorder";

type Sort = "likes" | "latest";

async function playPost(p: Post) {
  if (p.sample || !p.hasAudio) {
    // 가상 게시글: 기기의 합성음으로 문장 읽기 (실제 사투리 녹음 아님)
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(p.title);
      u.lang = "ko-KR";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
    return;
  }
  // ngrok 경고 페이지를 피하려고 헤더를 붙여 받아온 뒤 재생
  const res = await fetch(postAudioUrl(p.id), { headers: { "ngrok-skip-browser-warning": "true" } });
  if (!res.ok) throw new Error("음성을 불러오지 못했어요.");
  const url = URL.createObjectURL(await res.blob());
  await new Audio(url).play();
}

export default function Contest() {
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [usingSample, setUsingSample] = useState(true);
  const [region, setRegion] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("likes");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState("");
  const [myRegion, setMyRegion] = useState("gyeongsang");
  const [msg, setMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const rec = useRecorder();

  const load = async () => {
    try {
      const data = await listPosts("contest");
      if (data.length > 0) {
        setPosts(data);
        setUsingSample(false);
      }
    } catch {
      // 백엔드 연결 실패 시 가상 게시글 유지
    }
  };

  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(() => {
    const list = posts.filter((p) => region === "all" || regionById(p.region)?.id === region);
    return [...list].sort((a, b) =>
      sort === "likes"
        ? b.likes + (liked[b.id] ? 1 : 0) - (a.likes + (liked[a.id] ? 1 : 0))
        : b.createdAt.localeCompare(a.createdAt)
    );
  }, [posts, region, sort, liked]);

  const submit = async () => {
    if (!nickname.trim() || !rec.blob) return;
    setSending(true);
    setMsg(null);
    try {
      await createPost({ nickname: nickname.trim(), title: CONTEST_SENTENCE, region: myRegion, audio: rec.blob });
      setMsg("등록됐어요! 목록을 새로 불러올게요.");
      rec.reset();
      setShowForm(false);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "등록에 실패했어요.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contest" className="section">
      <div className="wrap">
        <span className="eyebrow">우리 동네 사투리 콘테스트</span>
        <h2 className="h2">듣다 보면, 정드는 목소리</h2>

        <div className="contest-hero">
          <span className="note">이번 콘테스트 문장</span>
          <h2>“{CONTEST_SENTENCE}”</h2>
          <p className="note">
            내 지역 말투로 이 문장을 읽어 올려 주세요. 지역 유사도 검증을 통한 참여 자격은 AI 연결 후 적용할 예정이에요.
          </p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm((v) => !v)}>
            나도 녹음해보기 ↗
          </button>

          {showForm && (
            <div className="form">
              <input className="input" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={40} />
              <select className="input" value={myRegion} onChange={(e) => setMyRegion(e.target.value)}>
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <div className="rec-actions" style={{ justifyContent: "flex-start" }}>
                <button className="btn btn-ghost" onClick={rec.isRecording ? rec.stop : rec.start}>
                  {rec.isRecording ? `■ 정지 (${rec.seconds}초)` : "● 녹음하기"}
                </button>
                <button className="btn btn-primary" disabled={!nickname.trim() || !rec.blob || sending} onClick={submit}>
                  {sending ? "올리는 중…" : "콘테스트에 올리기"}
                </button>
              </div>
              {rec.audioUrl && <audio controls src={rec.audioUrl} style={{ width: "100%" }} />}
              {rec.error && <p className="err">{rec.error}</p>}
            </div>
          )}
          {msg && <p className="note" style={{ marginTop: 10 }}>{msg}</p>}
        </div>

        <div className="toolbar">
          <div className="filters">
            <button className={`chip ${region === "all" ? "on" : ""}`} onClick={() => setRegion("all")}>전체</button>
            {REGIONS.filter((r) => r.id !== "seoul").map((r) => (
              <button key={r.id} className={`chip ${region === r.id ? "on" : ""}`} onClick={() => setRegion(r.id)}>
                <i className="dot" style={{ background: r.color }} />
                {r.short}
              </button>
            ))}
          </div>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="정렬">
            <option value="likes">좋아요순</option>
            <option value="latest">최신순</option>
          </select>
        </div>

        <div className="post-grid">
          {shown.map((p) => {
            const r = regionById(p.region);
            const on = liked[p.id];
            return (
              <article key={p.id} className="post">
                <div className="who">
                  <span className="avatar" style={{ background: r?.color ?? "#999" }}>{p.nickname.slice(0, 1)}</span>
                  <div>
                    <b>{p.nickname}</b>
                    <small>{r?.name ?? "지역 미상"}</small>
                  </div>
                </div>
                <p className="line">“{p.title}”</p>
                <div className="acts">
                  <button className="play" onClick={() => playPost(p).catch(() => setMsg("음성을 재생하지 못했어요."))}>
                    ▶ {p.sample || !p.hasAudio ? "예시 듣기" : "목소리 듣기"}
                  </button>
                  <button className={`like ${on ? "on" : ""}`} onClick={() => setLiked((s) => ({ ...s, [p.id]: !s[p.id] }))}>
                    {on ? "♥" : "♡"} {p.likes + (on ? 1 : 0)}
                  </button>
                </div>
              </article>
            );
          })}
          {shown.length === 0 && <p className="note">이 지역의 목소리가 아직 없어요. 첫 번째 주인공이 되어 주세요!</p>}
        </div>

        {usingSample && (
          <p className="note" style={{ marginTop: 16 }}>
            가상의 게시글과 반응 수입니다. 예시 듣기는 기기의 합성음으로 문장을 읽으며, 실제 사투리 녹음이 아닙니다.
          </p>
        )}
      </div>
    </section>
  );
}