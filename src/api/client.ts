import type { RegionId } from "../constants/regions";

/* ------------------------------------------------------------------
 * 백엔드 연결 설정
 * - API_URL을 비워 두면 같은 서버(또는 vite 프록시)로 요청합니다.
 * - 백엔드가 꺼져 있으면 USE_MOCK_ANALYZE를 true로 바꾸면 데모 결과가 나옵니다.
 * ------------------------------------------------------------------ */
const API_URL = import.meta.env.VITE_API_URL ?? "";
const NGROK = { "ngrok-skip-browser-warning": "true" };

// 백엔드가 꺼져 있을 때만 true로 바꾸세요 (데모 결과 반환)
export const USE_MOCK_ANALYZE = false;

export interface AnalyzeResult {
  analysis_id: string | null;
  scores: Record<RegionId, number>;
  top_region: RegionId;
  confidence: number;
  retry_recommended: boolean;
  donation_eligible: boolean;
  demo?: boolean;
}

export function getSessionId(): string {
  try {
    let id = localStorage.getItem("saturi_session");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("saturi_session", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

// 백엔드 지역 이름("전라도", "서울·경기" 등) → 프론트 지역 id
const KO_TO_ID: Record<string, RegionId> = {
  서울: "seoul", 경기: "seoul", 수도권: "seoul",
  강원: "gangwon", 충청: "chungcheong", 전라: "jeolla", 경상: "gyeongsang", 제주: "jeju",
};
function toRegionId(name: string): RegionId | null {
  const key = Object.keys(KO_TO_ID).find((k) => name.includes(k));
  return key ? KO_TO_ID[key] : null;
}

export const DEMO_RESULT: AnalyzeResult = {
  analysis_id: null,
  scores: { gyeongsang: 0.62, chungcheong: 0.14, seoul: 0.11, jeolla: 0.07, gangwon: 0.04, jeju: 0.02 },
  top_region: "gyeongsang",
  confidence: 0.62,
  retry_recommended: false,
  donation_eligible: false,
  demo: true,
};

export async function analyzeVoice(blob: Blob | null): Promise<AnalyzeResult> {
  if (USE_MOCK_ANALYZE || !blob) {
    await new Promise((r) => setTimeout(r, 1400));
    return DEMO_RESULT;
  }

  const form = new FormData();
  form.append("audio", blob, "recording.webm");
  form.append("session_id", getSessionId());

  // Content-Type은 지정하지 않습니다 (FormData가 자동 설정)
  const res = await fetch(`${API_URL}/dna/analyze`, { method: "POST", headers: NGROK, body: form });
  if (!res.ok) throw new Error(`분석 실패: ${res.status}`);
  const raw = await res.json();

  const scores = { seoul: 0, gangwon: 0, chungcheong: 0, jeolla: 0, gyeongsang: 0, jeju: 0 } as Record<RegionId, number>;
  for (const [name, v] of Object.entries(raw.scores ?? {})) {
    const id = toRegionId(name);
    if (id) scores[id] = Number(v) || 0;
  }
  const top =
    toRegionId(String(raw.predicted_region ?? "")) ??
    (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as RegionId);
  const confidence = Number(raw.confidence ?? scores[top]) || 0;

  return {
    analysis_id: raw.analysis_id ?? null,
    scores,
    top_region: top,
    confidence,
    // 백엔드에 retry_recommended가 아직 없을 수 있어 50% 기준으로 보완
    retry_recommended: typeof raw.retry_recommended === "boolean" ? raw.retry_recommended : confidence < 0.5,
    donation_eligible: typeof raw.donation_eligible === "boolean" ? raw.donation_eligible : confidence >= 0.9,
  };
}

/* ---------------- 커뮤니티 (사투리 콘테스트) ---------------- */

export interface Post {
  id: string;
  nickname: string;
  title: string;
  content: string;
  region: string;
  likes: number;
  createdAt: string;
  hasAudio: boolean;
  sample?: boolean;
}

// 백엔드 응답 모양이 확정되지 않아 여러 형태를 받아들이도록 정규화합니다.
function normalizePost(raw: Record<string, unknown>, i: number): Post {
  const s = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
  return {
    id: s(raw.id ?? raw.post_id ?? i),
    nickname: s(raw.nickname) || "익명",
    title: s(raw.title),
    content: s(raw.content),
    region: s(raw.region),
    likes: Number(raw.likes ?? raw.like_count ?? raw.comment_count ?? 0) || 0,
    createdAt: s(raw.created_at ?? raw.createdAt),
    hasAudio: Boolean(raw.audio_path ?? raw.audio_url ?? raw.has_audio ?? raw.audio),
  };
}

export async function listPosts(postType = "contest"): Promise<Post[]> {
  const res = await fetch(`${API_URL}/community/posts?post_type=${encodeURIComponent(postType)}&limit=30`, {
    headers: NGROK,
  });
  if (!res.ok) throw new Error(`게시글을 불러오지 못했어요 (${res.status})`);
  const data = await res.json();
  const arr: unknown[] = Array.isArray(data) ? data : data.posts ?? data.items ?? data.data ?? [];
  return arr.map((p, i) => normalizePost(p as Record<string, unknown>, i));
}

export async function createPost(p: {
  nickname: string;
  title: string;
  content?: string;
  region: string;
  audio?: Blob | null;
  postType?: string;
}) {
  const form = new FormData();
  form.append("session_id", getSessionId());
  form.append("nickname", p.nickname);
  form.append("post_type", p.postType ?? "contest");
  form.append("title", p.title);
  form.append("content", p.content ?? "");
  form.append("region", p.region);
  if (p.audio) form.append("audio", p.audio, "recording.webm");
  const res = await fetch(`${API_URL}/community/posts`, { method: "POST", headers: NGROK, body: form });
  if (!res.ok) throw new Error(`등록 실패 (${res.status})`);
  return res.json();
}

export const postAudioUrl = (id: string) => `${API_URL}/community/posts/${encodeURIComponent(id)}/audio`;


/* ---------------- 댓글 ---------------- */

export interface CommentItem {
  nickname: string;
  content: string;
  createdAt: string;
}

export async function listComments(postId: string): Promise<CommentItem[]> {
  const res = await fetch(`${API_URL}/community/posts/${encodeURIComponent(postId)}/comments`, { headers: NGROK });
  if (!res.ok) throw new Error(`댓글을 불러오지 못했어요 (${res.status})`);
  const data = await res.json();
  const arr: Record<string, unknown>[] = Array.isArray(data) ? data : data.comments ?? data.items ?? data.data ?? [];
  return arr.map((c) => ({
    nickname: String(c.nickname ?? "익명"),
    content: String(c.content ?? ""),
    createdAt: String(c.created_at ?? c.createdAt ?? ""),
  }));
}

export async function addComment(postId: string, nickname: string, content: string) {
  const res = await fetch(`${API_URL}/community/posts/${encodeURIComponent(postId)}/comments`, {
    method: "POST",
    headers: { ...NGROK, "Content-Type": "application/json" },
    body: JSON.stringify({ nickname, content }),
  });
  if (!res.ok) throw new Error(`댓글 등록 실패 (${res.status})`);
  return res.json();
}


/* ---------------- 목소리 → 뇌 반응 (/voice-brain, AI 서버) ----------------
 * AI 서버 주소가 바뀌면 VOICE_BRAIN_URL만 고치세요.
 * 계산이 수십 초 걸리므로 Vercel 프록시를 거치지 않고 브라우저에서 바로 호출합니다.
 */
export const VOICE_BRAIN_URL =
  import.meta.env.VITE_VOICE_BRAIN_URL ?? "https://789e-203-251-135-23.ngrok-free.app";

export interface BrainRegion {
  key: string;
  name: string;
  desc: string;
  user: number;
  ref: number;
}
export interface VoiceBrainResult {
  seconds: number;
  elapsed: number;
  similar: { style: string; r: number }[];
  regions: BrainRegion[];
  images?: { left?: string; right?: string };
  dialect?: { label: string; name: string; prob: number };
}

export async function voiceBrain(wav: Blob): Promise<VoiceBrainResult> {
  const form = new FormData();
  form.append("audio", wav, "voice.wav");
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 180_000); // 최대 3분 대기
  try {
    const res = await fetch(`${VOICE_BRAIN_URL}/voice-brain`, {
      method: "POST",
      headers: NGROK,
      body: form,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      let msg = `f-MRI 예측에 실패했어요 (${res.status})`;
      try {
        const j = await res.json();
        if (typeof j.detail === "string") msg = j.detail;
      } catch {
        /* JSON이 아니면 기본 문구 */
      }
      throw new Error(msg);
    }
    return res.json();
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw new Error("응답이 너무 오래 걸려요. 잠시 후 다시 시도해 주세요.");
    if (e instanceof TypeError) throw new Error("뇌 반응 서버에 연결하지 못했어요. 서버가 켜져 있는지 확인해 주세요.");
    throw e;
  } finally {
    window.clearTimeout(timer);
  }
}