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
  color: string;
}

export const REGIONS: Region[] = [
  { id: "seoul", name: "서울·경기", color: "#4C6EF5" },
  { id: "gangwon", name: "강원", color: "#12B886" },
  { id: "chungcheong", name: "충청", color: "#FAB005" },
  { id: "jeolla", name: "전라", color: "#FA5252" },
  { id: "gyeongsang", name: "경상", color: "#7950F2" },
  { id: "jeju", name: "제주", color: "#FD7E14" },
];