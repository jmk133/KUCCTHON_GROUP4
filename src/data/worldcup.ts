import type { RegionId } from "../constants/regions";

export interface Expression {
  id: string;
  region: RegionId;
  text: string;
  meaning: string;
  culture: string;
}

// 표현과 설명은 예시입니다. 발표 전에 해당 지역 화자에게 꼭 검수받으세요.
export const EXPRESSIONS: Expression[] = [
  {
    id: "g1", region: "gyeongsang", text: "밥 뭇나?",
    meaning: "밥 먹었니?",
    culture: "안부를 밥으로 묻는 인사. 짧고 힘 있는 억양이 특징이에요.",
  },
  {
    id: "g2", region: "gyeongsang", text: "~아이가",
    meaning: "~이지? / ~잖아",
    culture: "동의나 확인을 구하는 말투로, 대화에 친근한 리듬을 줘요.",
  },
  {
    id: "j1", region: "jeolla", text: "거시기",
    meaning: "그것, 그 사람 (무엇이든 가리키는 말)",
    culture: "말하는 사람과 듣는 사람이 맥락으로 알아듣는 전라도 대표 표현이에요.",
  },
  {
    id: "j2", region: "jeolla", text: "겁나게",
    meaning: "매우, 아주",
    culture: "정도를 강조할 때 쓰는 표현으로, 감정이 풍부하게 전해져요.",
  },
  {
    id: "c1", region: "chungcheong", text: "괜찮아유",
    meaning: "괜찮아요",
    culture: "느긋하고 부드러운 어미 '~유'가 충청도 말투의 인상을 만들어요.",
  },
  {
    id: "c2", region: "chungcheong", text: "시방 뭐 하는 겨?",
    meaning: "지금 뭐 하는 거야?",
    culture: "'~는 겨'는 충청도에서 자주 쓰는 어미로 여유로운 느낌을 줘요.",
  },
  {
    id: "z1", region: "jeju", text: "혼저 옵서예",
    meaning: "어서 오세요",
    culture: "제주어로 손님을 맞는 인사말이에요. 제주의 환대 문화를 담고 있어요.",
  },
  {
    id: "z2", region: "jeju", text: "게메마씸",
    meaning: "글쎄요",
    culture: "'마씸'은 제주어에서 공손함을 더하는 어미로 쓰여요.",
  },
];