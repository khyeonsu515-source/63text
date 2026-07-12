// 한 번에 하나만 펼쳐지도록, 지금 펼쳐진 카드를 접는 함수를 기억해둡니다.
// 다른 카드가 펼쳐지거나 창 크기가 바뀌면 이걸 호출해서 즉시 접습니다.
let collapseCurrentlyExpandedCard = null;

export function getExpandedCollapse() {
  return collapseCurrentlyExpandedCard;
}

export function setExpandedCollapse(collapseFn) {
  collapseCurrentlyExpandedCard = collapseFn;
}

export function clearExpandedCollapseIfCurrent(collapseFn) {
  if (collapseCurrentlyExpandedCard === collapseFn) {
    collapseCurrentlyExpandedCard = null;
  }
}

// 확장 위치/폭은 호버를 시작한 시점의 레이아웃 기준으로 계산되므로,
// 창 크기가 바뀌면 그 좌표가 더는 정확하지 않습니다 — 안전하게 접습니다.
if (typeof window !== "undefined") {
  window.addEventListener("resize", () => {
    collapseCurrentlyExpandedCard?.();
  });
}
