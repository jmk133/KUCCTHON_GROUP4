import type { RegionId } from "../constants/regions";
import type { Post } from "../api/client";

/* 모든 표현은 예시입니다. 발표 전 해당 지역 화자에게 검수받으세요. */

export interface ToneItem {
  id: string;
  region: RegionId;
  text: string;
  vibe: string;
}

// 말투 찾기: "같이 밥 먹자"를 지역마다 다르게 말하면?
export const TONE_ITEMS: ToneItem[] = [
  { id: "t1", region: "gyeongsang", text: "밥 같이 묵자, 좋제?", vibe: "툭 던지는 다정함" },
  { id: "t2", region: "chungcheong", text: "밥 같이 먹어유, 좋쥬?", vibe: "느긋한 여유" },
  { id: "t3", region: "jeolla", text: "밥 같이 묵어야제잉", vibe: "구수한 정" },
  { id: "t4", region: "jeju", text: "밥 혼디 먹게마씸", vibe: "섬의 따뜻함" },
];

export interface WordSeed {
  id: string;
  word: string;
  region: RegionId;
  meaning: string;
  story: string;
}

export const WORD_SEEDS: WordSeed[] = [
  {
    id: "w1", word: "혼저 옵서예", region: "jeju", meaning: "어서 오세요",
    story: "제주에서 손님을 맞을 때 건네는 인사예요. 공항이나 관광지 표지판에서도 자주 볼 수 있어요.",
  },
  {
    id: "w2", word: "정구지", region: "gyeongsang", meaning: "부추",
    story: "시장 할머니께 '정구지 한 단 주이소' 하면 바로 알아들으시죠. 지역마다 부추를 부르는 이름이 달라요.",
  },
  {
    id: "w3", word: "거시기", region: "jeolla", meaning: "그것, 그 사람",
    story: "이름이 생각나지 않아도 대화가 이어지게 해 주는 말. 듣는 사람이 맥락으로 알아듣는 게 묘미예요.",
  },
  {
    id: "w4", word: "괜찮아유", region: "chungcheong", meaning: "괜찮아요",
    story: "부드럽게 끝을 늘이는 '~유'에는 상대를 재촉하지 않는 마음이 담겨 있어요.",
  },
  {
    id: "w5", word: "우야꼬", region: "gyeongsang", meaning: "어떡하지",
    story: "걱정과 놀람이 한 번에 담긴 말. 할머니의 '아이고 우야꼬'를 기억하는 분이 많아요.",
  },
  {
    id: "w6", word: "강냉이", region: "gangwon", meaning: "옥수수",
    story: "여름이면 마당에서 쪄 먹던 강냉이. 지금도 여러 지역 어르신들이 즐겨 쓰는 말이에요.",
  },
];

export const CONTEST_SENTENCE = "오늘 밥은 먹었어? 시간 되면 우리 같이 밥 먹자.";

// 백엔드 연결 전/실패 시 보여 줄 가상 게시글 (화면에 '가상'이라고 표시됨)
export const SAMPLE_POSTS: Post[] = [
  { id: "s1", nickname: "해운대갈매기", title: "오늘 밥은 묵었나? 시간 되믄 같이 밥 묵자.", content: "", region: "gyeongsang", likes: 128, createdAt: "2026-11-06", hasAudio: false, sample: true },
  { id: "s2", nickname: "전주비빔", title: "오늘 밥은 묵었당가? 시간 되믄 같이 밥 묵세.", content: "", region: "jeolla", likes: 97, createdAt: "2026-11-06", hasAudio: false, sample: true },
  { id: "s3", nickname: "대전꿈돌이", title: "오늘 밥은 먹었슈? 시간 되면 같이 밥 먹어유.", content: "", region: "chungcheong", likes: 85, createdAt: "2026-11-05", hasAudio: false, sample: true },
  { id: "s4", nickname: "한라봉", title: "오늘 밥은 먹언? 시간 되민 같이 밥 먹게.", content: "", region: "jeju", likes: 74, createdAt: "2026-11-05", hasAudio: false, sample: true },
  { id: "s5", nickname: "감자바우", title: "오늘 밥은 먹었나? 시간 되믄 같이 밥 먹자야.", content: "", region: "gangwon", likes: 61, createdAt: "2026-11-04", hasAudio: false, sample: true },
];