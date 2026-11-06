import type { RegionId } from "../constants/regions";
import type { Post } from "../api/client";

/* ⚠ 모든 사투리 표현은 예시입니다. 발표 전 해당 지역 출신에게 꼭 검수받으세요. */

/* ---------------- 첫 화면: 바뀌는 제목 ---------------- */
export const HERO_PHRASES: { region: RegionId; text: string }[] = [
  { region: "gyeongsang", text: "니 고향이 어데고?" },
  { region: "seoul", text: "어디서 왔어?" },
  { region: "chungcheong", text: "어서 왔대유?" },
  { region: "jeolla", text: "어서 왔어야?" },
  { region: "gangwon", text: "어디서 왔나?" },
  { region: "jeju", text: "어디서 왔수과?" },
];

/* ---------------- 사투리 월드컵 (소리로 고르기) ----------------
 * 표준어 문장을 보여 주고, 두 지역 말투를 "1번 목소리 / 2번 목소리"로 들려줍니다.
 * 지역은 마지막 결과에서만 공개합니다.
 * 실제 녹음 파일을 public/audio/worldcup/ 에 넣으면 그 파일을 재생하고,
 * 파일이 없으면 기기의 합성음으로 문장을 읽어 줍니다.
 * 각 지역이 정확히 2번씩 나오도록 짝을 맞췄습니다.
 */
export interface VoiceOption {
  region: RegionId;
  text: string; // 사투리 문장 (결과 전까지 화면에 표시하지 않음)
  audio: string; // public 폴더 기준 경로
}
export interface WorldcupQuestion {
  id: string;
  standard: string;
  options: [VoiceOption, VoiceOption];
}

const a = (q: string, r: RegionId) => `/audio/worldcup/${q}-${r}.mp3`;

export const WORLDCUP_QUESTIONS: WorldcupQuestion[] = [
  {
    id: "q1", standard: "우리 집에 어서 와.",
    options: [
      { region: "gyeongsang", text: "우리 집에 퍼뜩 온나.", audio: a("q1", "gyeongsang") },
      { region: "jeolla", text: "우리 집에 싸게 와잉.", audio: a("q1", "jeolla") },
    ],
  },
  {
    id: "q2", standard: "밥 먹었어?",
    options: [
      { region: "chungcheong", text: "밥 먹었슈?", audio: a("q2", "chungcheong") },
      { region: "gangwon", text: "밥 먹었드래요?", audio: a("q2", "gangwon") },
    ],
  },
  {
    id: "q3", standard: "어서 오세요.",
    options: [
      { region: "seoul", text: "어서 오세요.", audio: a("q3", "seoul") },
      { region: "jeju", text: "혼저 옵서예.", audio: a("q3", "jeju") },
    ],
  },
  {
    id: "q4", standard: "이거 정말 맛있다.",
    options: [
      { region: "gyeongsang", text: "이거 억수로 맛있데이.", audio: a("q4", "gyeongsang") },
      { region: "chungcheong", text: "이거 증말 맛있네유.", audio: a("q4", "chungcheong") },
    ],
  },
  {
    id: "q5", standard: "너 지금 뭐 해?",
    options: [
      { region: "jeolla", text: "니 시방 뭐 한당가?", audio: a("q5", "jeolla") },
      { region: "seoul", text: "너 지금 뭐 해?", audio: a("q5", "seoul") },
    ],
  },
  {
    id: "q6", standard: "괜찮아, 천천히 해.",
    options: [
      { region: "gangwon", text: "괜찮드래요, 천천히 해요.", audio: a("q6", "gangwon") },
      { region: "jeju", text: "괜찮수다, 천천히 헙서.", audio: a("q6", "jeju") },
    ],
  },
];

/* ---------------- 사투리 콘테스트 ---------------- */
export const CONTEST_SENTENCE = "오늘 밥은 먹었어? 시간 되면 우리 같이 밥 먹자.";

// 백엔드 연결 전/실패 시 보여 줄 가상 게시글 (화면에 '가상'이라고 표시됨)
export const SAMPLE_POSTS: Post[] = [
  { id: "s1", nickname: "해운대갈매기", title: "오늘 밥은 묵었나? 시간 되믄 같이 밥 묵자.", content: "", region: "gyeongsang", likes: 128, createdAt: "2026-11-06", hasAudio: false, sample: true },
  { id: "s2", nickname: "전주비빔", title: "오늘 밥은 묵었당가? 시간 되믄 같이 밥 묵세.", content: "", region: "jeolla", likes: 97, createdAt: "2026-11-06", hasAudio: false, sample: true },
  { id: "s3", nickname: "대전꿈돌이", title: "오늘 밥은 먹었슈? 시간 되면 같이 밥 먹어유.", content: "", region: "chungcheong", likes: 85, createdAt: "2026-11-05", hasAudio: false, sample: true },
  { id: "s4", nickname: "한라봉", title: "오늘 밥은 먹언? 시간 되민 같이 밥 먹게.", content: "", region: "jeju", likes: 74, createdAt: "2026-11-05", hasAudio: false, sample: true },
  { id: "s5", nickname: "감자바우", title: "오늘 밥은 먹었드래요? 시간 되믄 같이 밥 먹자요.", content: "", region: "gangwon", likes: 61, createdAt: "2026-11-04", hasAudio: false, sample: true },
];

/* ---------------- 말의 기록 ---------------- */
export interface FlipCard {
  id: string;
  front: string; // 사투리
  back: string; // 표준어
  label: string; // 지역 표시
  note?: string;
}

// 독특한 방언: 표준어와 많이 달라서 뜻을 짐작하기 어려운 말 (카드 뒤집기)
export const UNIQUE_WORDS: FlipCard[] = [
  { id: "u1", front: "도르멍 옵서", back: "빨리 오십시오", label: "제주" },
  { id: "u2", front: "혼저 옵서예", back: "어서 오세요", label: "제주" },
  { id: "u3", front: "폭삭 속았수다", back: "수고 많으셨습니다", label: "제주", note: "'속다'가 '고생하다'라는 뜻으로 쓰여요." },
  { id: "u4", front: "정구지", back: "부추", label: "경상" },
  { id: "u5", front: "단디 해라", back: "제대로, 야무지게 해라", label: "경상" },
  { id: "u6", front: "냅둬유", back: "그냥 두세요", label: "충청" },
];

// 희귀한 방언: 특정 소수 지역에서만 쓰이는 말
export interface RareDialect {
  id: string;
  name: string;
  where: string;
  desc: string;
}
export const RARE_DIALECTS: RareDialect[] = [
  {
    id: "r1", name: "제주어", where: "제주도",
    desc: "다른 지역 사람은 알아듣기 어려울 만큼 고유한 어휘와 어미가 남아 있어요. 쓰는 사람이 빠르게 줄고 있어 보존이 시급한 말로 꼽혀요.",
  },
  {
    id: "r2", name: "육진 방언", where: "함경북도 북부(육진 지역)",
    desc: "옛 한국어의 특징이 많이 남아 있는 말이에요. 쓰는 사람이 아주 적어 기록 자체가 귀해요.",
  },
  {
    id: "r3", name: "영동 방언", where: "강원도 동해안",
    desc: "같은 강원도라도 산맥 동쪽은 말소리의 높낮이가 뚜렷해서, 높낮이로 뜻을 구별하는 특징이 남아 있어요.",
  },
];

// 재미 요소: 북한에서는 뭐라고 할까?
export const NORTH_WORDS: FlipCard[] = [
  { id: "n1", front: "손전화", back: "휴대전화", label: "북한" },
  { id: "n2", front: "곽밥", back: "도시락", label: "북한" },
  { id: "n3", front: "가락지빵", back: "도넛", label: "북한" },
  { id: "n4", front: "얼음보숭이", back: "아이스크림", label: "북한", note: "요즘은 '아이스크림'이라는 말도 함께 쓴다고 알려져 있어요." },
];