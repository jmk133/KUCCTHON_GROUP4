import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { REGIONS, regionById } from "../constants/regions";
import { addComment, createPost, listComments, listPosts, postAudioUrl } from "../api/client";
import type { CommentItem, Post } from "../api/client";
import { CONTEST_SENTENCE, SAMPLE_POSTS } from "../data/content";
import { useRecorder, MAX_SECONDS } from "../hooks/useRecorder";
import { getEligibility } from "../lib/eligibility";
import { playVoice } from "../lib/voice";

type Sort = "likes" | "latest";

async function playPost(p: Post) {
  if (p.sample || !p.hasAudio) {
    // 가상 게시글: 기기의 합성음으로 문장 읽기 (실제 사투리 녹음 아님)
    await playVoice(null, p.title);
    return;
  }
  const res = await fetch(postAudioUrl(p.id), { headers: { "ngrok-skip-browser-warning": "true" } });
  if (!res.ok) throw new Error("음성을 불러오지 못했어요.");
  await playVoice(URL.createObjectURL(await res.blob()), p.title);
}

function Comments({ post }: { post: Post }) {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [nickname, setNickname] = useState("");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (post.sample) return;
    listComments(post.id).then(setItems).catch(() => setMsg("댓글을 불러오지 못했어요."));
  }, [post.id, post.sample]);

  const send = async () => {
    if (!nickname.trim() || !text.trim()) return;
    const mine = { nickname: nickname.trim(), content: text.trim(), createdAt: "" };
    try {
      if (!post.sample) await addComment(post.id, mine.nickname, mine.content);
      setItems((v) => [...v, mine]);
      setText("");
      setMsg(null);
    } catch {
      setMsg("댓글 등록에 실패했어요.");
    }
  };

  return (
    <div className="comments">
      {items.length === 0 && <p className="note">첫 댓글을 남겨 주세요.</p>}
      {items.map((c, i) => (
        <p key={i} className="comment">
          <b>{c.nickname}</b> {c.content}
        </p>
      ))}
      <div className="comment-form">
        <input className="input" placeholder="닉네임" value={nickname} maxLength={40} onChange={(e) => setNickname(e.target.value)} />
        <input className="input" placeholder="댓글을 남겨 주세요" value={text} maxLength={300} onChange={(e) => setText(e.target.value)} />
        <button className="btn btn-ghost" onClick={send} disabled={!nickname.trim() || !text.trim()}>등록</button>
      </div>
      {msg && <p className="err" style={{ textAlign: "left" }}>{msg}</p>}
    </div>
  );
}

export default function Contest() {
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [usingSample, setUsingSample] = useState(true);
  const [region, setRegion] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("likes");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const rec = useRecorder();
  const elig = getEligibility();
  const myRegion = regionById(elig?.region);

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
    if (!elig || !nickname.trim() || !rec.blob) return;
    setSending(true);
    setMsg(null);
    try {
      await createPost({ nickname: nickname.trim(), title: CONTEST_SENTENCE, region: elig.region, audio: rec.blob });
      setMsg("등록됐어요! 목록을 새로 불러올게요.");
      rec.reset();
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "등록에 실패했어요.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="section page">
      <div className="wrap">
        <span className="eyebrow">사투리 콘테스트</span>
        <h1 className="h2">듣다 보면, 정드는 목소리</h1>
        <p className="sub">각 지역 말투를 가장 잘 살린 목소리에 “비슷해요”를 눌러 주세요.</p>

        <div className="contest-hero">
          <span className="notice-chip">참가 자격 · 사투리 월드컵 또는 DNA 분석에서 한 지역 80% 이상</span>
          <span className="note" style={{ display: "block", marginTop: 14 }}>이번 콘테스트 문장</span>
          <h2>“{CONTEST_SENTENCE}”</h2>

          {elig && myRegion ? (
            <div className="form">
              <p>
                <b style={{ color: myRegion.color }}>{myRegion.name}</b> 대표로 참여할 수 있어요 ({Math.round(elig.score * 100)}%,{" "}
                {elig.source === "worldcup" ? "사투리 월드컵" : "DNA 분석"}). 위 문장을 {myRegion.name} 말투로 읽어 주세요.
              </p>
              <input className="input" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={40} />
              <div className="rec-actions" style={{ justifyContent: "flex-start" }}>
                <button className="btn btn-ghost" onClick={rec.isRecording ? rec.stop : rec.start}>
                  {rec.isRecording ? `■ 정지 (${rec.seconds}/${MAX_SECONDS}초)` : rec.blob ? "● 다시 녹음" : "● 녹음하기"}
                </button>
                <button className="btn btn-primary" disabled={!nickname.trim() || !rec.blob || sending || rec.isRecording} onClick={submit}>
                  {sending ? "올리는 중…" : "콘테스트에 올리기"}
                </button>
              </div>
              {rec.audioUrl && !rec.isRecording && <audio controls src={rec.audioUrl} style={{ width: "100%" }} />}
              {rec.error && <p className="err" style={{ textAlign: "left" }}>{rec.error}</p>}
            </div>
          ) : (
            <div className="locked">
              <p>
                🔒 아직 참가 자격이 없어요. 사투리 월드컵에서 한 지역 말투를 80% 이상 고르면 그 지역 대표로 녹음을 올릴 수 있어요.
              </p>
              <div className="rec-actions" style={{ justifyContent: "flex-start", marginTop: 12 }}>
                <Link to="/worldcup" className="btn btn-primary">사투리 월드컵 먼저 하기 →</Link>
                <Link to="/analysis" className="btn btn-ghost">DNA 분석하기</Link>
              </div>
            </div>
          )}
          {msg && <p className="note" style={{ marginTop: 10 }}>{msg}</p>}
        </div>

        <div className="toolbar">
          <div className="filters">
            <button className={`chip ${region === "all" ? "on" : ""}`} onClick={() => setRegion("all")}>전체</button>
            {REGIONS.map((r) => (
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
                    <small>{r?.name ?? "지역 미상"} 대표</small>
                  </div>
                </div>
                <p className="line">“{p.title}”</p>
                <div className="acts">
                  <button className="play" onClick={() => playPost(p).catch(() => setMsg("음성을 재생하지 못했어요."))}>
                    ▶ {p.sample || !p.hasAudio ? "예시 듣기" : "목소리 듣기"}
                  </button>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="like" onClick={() => setOpenComments(openComments === p.id ? null : p.id)}>💬 댓글</button>
                    <button className={`like ${on ? "on" : ""}`} onClick={() => setLiked((s) => ({ ...s, [p.id]: !s[p.id] }))}>
                      {on ? "♥" : "♡"} 비슷해요 {p.likes + (on ? 1 : 0)}
                    </button>
                  </div>
                </div>
                {openComments === p.id && <Comments post={p} />}
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