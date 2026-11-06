import { REGIONS } from "../constants/regions";
import type { RegionId } from "../constants/regions";

/* 단순화한 한반도 백지도 (정확한 지도 아님, 분위기용) */
const PENINSULA =
  "M70,40 L120,30 L170,15 L225,5 L275,20 L260,45 L235,70 L215,105 L200,135 L215,160 L240,200 L258,250 L262,300 L250,340 L235,365 L200,378 L165,385 L130,382 L100,388 L80,375 L72,345 L85,320 L78,290 L90,260 L80,235 L100,215 L85,200 L60,185 L45,165 L60,140 L50,115 L70,95 L60,70 Z";

// 지도 위 위치 (viewBox 320 x 440 기준) 와 말풍선 방향
const SPOTS: Record<RegionId, { x: number; y: number; side: "left" | "right" }> = {
  seoul: { x: 100, y: 212, side: "left" },
  gangwon: { x: 190, y: 205, side: "right" },
  chungcheong: { x: 125, y: 265, side: "left" },
  gyeongsang: { x: 215, y: 300, side: "right" },
  jeolla: { x: 105, y: 335, side: "left" },
  jeju: { x: 112, y: 418, side: "right" },
};

export default function KoreaMap() {
  return (
    <div className="kmap">
      <svg viewBox="0 0 320 440" aria-hidden="true">
        <path d={PENINSULA} className="land" />
        <clipPath id="south">
          <rect x="0" y="195" width="320" height="245" />
        </clipPath>
        <path d={PENINSULA} className="land-south" clipPath="url(#south)" />
        <ellipse cx="112" cy="418" rx="22" ry="9" className="land-south" />
      </svg>
      {REGIONS.map((r) => {
        const s = SPOTS[r.id];
        return (
          <div
            key={r.id}
            className={`pin ${s.side}`}
            style={{ left: `${(s.x / 320) * 100}%`, top: `${(s.y / 440) * 100}%`, ["--c" as string]: r.color }}
          >
            <i className="pin-dot" />
            <span className="pin-card">
              <small>{r.short}</small>
              {r.greeting}
            </span>
          </div>
        );
      })}
    </div>
  );
}