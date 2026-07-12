import { STANCE_COLORS, STANCE_FALLBACK, STANCE_ORDER } from "../constants.js";

// 이 주제에 달린 기사들의 관점(stance) 분포를 스펙트럼 순서대로 칩으로 보여줍니다.
export function StanceSummary({ articles }) {
  const counts = new Map();
  articles.forEach(({ analysis }) => {
    const stance = analysis.direction?.stance;
    if (stance) counts.set(stance, (counts.get(stance) || 0) + 1);
  });
  if (!counts.size) return null;

  // 알려진 스펙트럼 값을 순서대로, 그 외(구버전 값 등)는 뒤에 붙여 하나도 빠뜨리지 않습니다.
  const known = STANCE_ORDER.filter((stance) => counts.has(stance));
  const unknown = [...counts.keys()].filter((stance) => !STANCE_ORDER.includes(stance));

  return (
    <div className="stance-summary">
      {[...known, ...unknown].map((stance) => {
        const color = STANCE_COLORS[stance] || STANCE_FALLBACK;
        return (
          <span key={stance} className="stance-chip" style={{ background: color.bg, color: color.fg }}>
            {stance} {counts.get(stance)}
          </span>
        );
      })}
    </div>
  );
}
