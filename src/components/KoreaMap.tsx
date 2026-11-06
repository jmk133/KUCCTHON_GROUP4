import { REGIONS } from "../constants/regions";
import type { RegionId } from "../constants/regions";

/*
 * 한반도 백지도 (경위도를 단순 투영해 그린 윤곽, 분위기용)
 * viewBox 356 x 440 · 울릉도와 독도 포함
 */
const W = 356;
const H = 440;

const PENINSULA =
  "M36.0,133.9 L56.0,117.1 L84.0,102.4 L112.0,83.5 L136.0,62.5 L156.0,75.1 L184.0,77.2 L192.0,56.2 L216.0,49.9 L236.0,35.2 L252.0,31.0 L270.0,16.3 L288.0,39.4 L272.0,45.7 L252.0,62.5 L246.0,85.6 L228.0,102.4 L208.0,121.3 L184.0,136.0 L164.0,146.5 L160.0,163.3 L156.0,171.7 L172.0,180.1 L194.0,194.8 L204.0,211.6 L216.0,228.4 L228.0,245.2 L236.0,264.1 L238.0,287.2 L242.0,301.9 L238.0,322.9 L232.0,335.5 L222.0,341.8 L206.0,348.1 L196.0,352.3 L180.0,352.3 L170.0,358.6 L156.0,362.8 L140.0,367.0 L124.0,373.3 L114.0,364.9 L112.0,352.3 L118.0,333.4 L122.0,314.5 L126.0,304.0 L120.0,287.2 L106.0,274.6 L118.0,264.1 L130.0,259.9 L124.0,245.2 L120.0,232.6 L104.0,230.5 L88.0,226.3 L68.0,224.2 L50.0,215.8 L58.0,199.0 L72.0,188.5 L66.0,173.8 L76.0,159.1 L60.0,152.8 L44.0,150.7 L36.0,140.2 Z";

// 휴전선 아래(남쪽)만 진하게 칠하기 위한 영역
const SOUTH_CLIP = "20,228.4 128,228.4 148,209.5 194,194 380,194 380,472 -20,472";

// 지도 위 위치와 말풍선 방향
const SPOTS: Record<RegionId, { x: number; y: number; side: "left" | "right" }> = {
  seoul: { x: 139, y: 239, side: "left" },
  gangwon: { x: 192, y: 228, side: "right" },
  chungcheong: { x: 146, y: 281, side: "left" },
  gyeongsang: { x: 208, y: 310, side: "right" },
  jeolla: { x: 140, y: 338, side: "left" },
  jeju: { x: 122, y: 414, side: "right" },
};

export default function KoreaMap() {
  return (
    <div className="kmap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="울릉도와 독도를 포함한 한반도 지도">
        <defs>
          <clipPath id="south">
            <polygon points={SOUTH_CLIP} />
          </clipPath>
        </defs>

        {/* 한반도 */}
        <path d={PENINSULA} className="land" />
        <path d={PENINSULA} className="land-south" clipPath="url(#south)" />

        {/* 제주도 */}
        <ellipse cx="122" cy="414" rx="16" ry="7" className="land-south" />

        {/* 울릉도 */}
        <circle cx="294.8" cy="241" r="3.2" className="land-south" />
        <text x="294.8" y="233" className="isle-label" textAnchor="middle">울릉도</text>

        {/* 독도 (동도·서도) */}
        <circle cx="333.4" cy="252.4" r="2" className="dokdo" />
        <circle cx="337" cy="251.4" r="2" className="dokdo" />
        <text x="335" y="266" className="isle-label dokdo-label" textAnchor="middle">독도</text>
      </svg>

      {REGIONS.map((r) => {
        const s = SPOTS[r.id];
        return (
          <div
            key={r.id}
            className={`pin ${s.side}`}
            style={{ left: `${(s.x / W) * 100}%`, top: `${(s.y / H) * 100}%`, ["--c" as string]: r.color }}
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