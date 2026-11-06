import type { RegionId } from "../constants/regions";

/*
 * 사투리 콘테스트 참여 자격
 * - 사투리 월드컵 또는 DNA 분석에서 한 지역이 80% 이상이면 그 지역으로 참여할 수 있어요.
 * - 이 브라우저에만 저장되는 간단한 표시입니다 (해커톤 프로토타입).
 */
export const CONTEST_THRESHOLD = 0.8;
const KEY = "saturi_contest_eligibility";

export interface Eligibility {
  region: RegionId;
  score: number;
  source: "worldcup" | "dna";
}

export function getEligibility(): Eligibility | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Eligibility) : null;
  } catch {
    return null;
  }
}

export function saveEligibility(e: Eligibility) {
  if (e.score < CONTEST_THRESHOLD) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(e));
  } catch {
    /* 저장이 막힌 환경에서는 무시 */
  }
}