// ── 점수 → 색상 ────────────────────────────────────────────────
// 0~100 점수를 빨강(나쁨)~주황~노랑~초록(좋음)의 다단계 색상으로 변환합니다.
// hue만 회전시키면 중간 구간이 탁한 올리브색으로 뭉개져 대비가 약해지므로,
// 뚜렷이 구분되는 색 정지점 사이를 RGB로 보간합니다 — 신호등처럼 한눈에 대비됩니다.
const SCORE_COLOR_STOPS = [
  { at: 0, rgb: [220, 38, 38] }, // 빨강 (나쁨)
  { at: 33, rgb: [249, 115, 22] }, // 주황
  { at: 66, rgb: [234, 179, 8] }, // 노랑
  { at: 100, rgb: [22, 197, 94] }, // 초록 (좋음)
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function scoreToRgb(goodness) {
  const clamped = Math.max(0, Math.min(100, goodness));
  for (let i = 0; i < SCORE_COLOR_STOPS.length - 1; i += 1) {
    const cur = SCORE_COLOR_STOPS[i];
    const next = SCORE_COLOR_STOPS[i + 1];
    if (clamped >= cur.at && clamped <= next.at) {
      const t = (clamped - cur.at) / (next.at - cur.at);
      return cur.rgb.map((channel, index) => Math.round(lerp(channel, next.rgb[index], t)));
    }
  }
  return SCORE_COLOR_STOPS[SCORE_COLOR_STOPS.length - 1].rgb;
}

// invert가 true면 점수가 높을수록 나쁜 지표(어그로도)에 맞게 축을 뒤집습니다.
export function scoreToRgbColor(score, invert) {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const goodness = invert ? 100 - clamped : clamped;
  return scoreToRgb(goodness);
}

export function rgbToCss([r, g, b], alpha) {
  return alpha === undefined ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function lightenRgb([r, g, b], amount) {
  return [r, g, b].map((c) => Math.round(c + (255 - c) * amount));
}
