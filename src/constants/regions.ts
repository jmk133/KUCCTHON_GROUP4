export type RegionId =
  | "seoul"
  | "gangwon"
  | "chungcheong"
  | "jeolla"
  | "gyeongsang"
  | "jeju";

export interface Region {
  id: RegionId;
  name: string;
  short: string;
  color: string;
  greeting: string;
}

export const REGIONS: Region[] = [
  { id: "seoul", name: "서울·경기", short: "수도권", color: "#5B7CFA", greeting: "밥 먹었어?" },
  { id: "gangwon", name: "강원", short: "강원", color: "#2FB38A", greeting: "밥 먹었나?" },
  { id: "chungcheong", name: "충청", short: "충청", color: "#F2A33A", greeting: "밥 먹었슈?" },
  { id: "gyeongsang", name: "경상", short: "경상", color: "#FF385C", greeting: "밥 묵었나?" },
  { id: "jeolla", name: "전라", short: "전라", color: "#9B6BF2", greeting: "밥은 먹었당가?" },
  { id: "jeju", name: "제주", short: "제주", color: "#F07B3F", greeting: "밥 먹언?" },
];

export const regionById = (id: string | undefined | null) =>
  REGIONS.find((r) => r.id === id || r.name === id || r.short === id);