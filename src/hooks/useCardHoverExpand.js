import { useEffect, useRef } from "react";
import {
  CARD_COLLAPSE_ANIM_MS,
  CARD_EXPAND_ANIM_MS,
  CARD_EXPAND_DELAY_MS,
  CARD_EXPAND_GAP,
  CARD_EXPAND_MIN_PANEL_WIDTH,
} from "../constants.js";
import { clearExpandedCollapseIfCurrent, getExpandedCollapse, setExpandedCollapse } from "../lib/cardExpandCoordinator.js";

// 카드 호버 확장 — 1.5초 이상 머물면 옆으로만 넓어지고, 다른 카드를 밀어내지
// 않고 그 위를 덮습니다(그리드 흐름에서 빠져나와 절대 위치로 전환). 마우스가
// 나가면 즉시 원래 크기로 줄어들며 그리드 흐름으로 되돌아갑니다.
//
// 순수 DOM 레이아웃 측정/애니메이션이라 React 렌더 사이클과는 독립적으로
// ref가 가리키는 실제 DOM 노드를 직접 조작합니다(원본 구현과 동일한 방식).
export function useCardHoverExpand() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;

    let expandTimer = null;
    let expanded = false;
    let placeholder = null;

    function clearExpandTimer() {
      if (expandTimer) {
        window.clearTimeout(expandTimer);
        expandTimer = null;
      }
    }

    function collapse() {
      if (!expanded) return;
      expanded = false;
      clearExpandedCollapseIfCurrent(collapse);

      // is-expanded는 바로 떼서 글로우/투명도가 곧장 자연스럽게 페이드되게
      // 둡니다. is-sizing-locked(main 폭 고정)는 아직 떼지 않습니다 — 지금
      // 떼면 side가 즉시 폭 0으로 돌아가면서 main이 flex:1로 남은 공간을
      // 순간 떠안아, 접을 때도 확장 때와 같은 "잠깐 아래로 늘어나는" 점프가
      // 생깁니다. 폭 transition이 완전히 끝나는 cleanup()에서 마저 뗍니다.
      wrapper.classList.remove("is-expanded");

      // 펼치는 동안 left도 0까지 움직였으므로, 접을 때는 폭뿐 아니라
      // left도 원래 자리(자리표시자 위치)로 함께 되돌립니다.
      const gridEl = wrapper.closest(".article-grid");
      const placeholderRect = placeholder ? placeholder.getBoundingClientRect() : null;
      if (placeholderRect && gridEl) {
        const gridRect = gridEl.getBoundingClientRect();
        wrapper.style.transition =
          `width ${CARD_COLLAPSE_ANIM_MS}ms var(--ease), ` +
          `left ${CARD_COLLAPSE_ANIM_MS}ms var(--ease), ` +
          `transform 320ms var(--ease), box-shadow 320ms var(--ease)`;
        wrapper.style.width = `${placeholderRect.width}px`;
        wrapper.style.left = `${placeholderRect.left - gridRect.left}px`;
      }

      const cleanup = () => {
        wrapper.classList.remove("is-sizing-locked");
        wrapper.style.position = "";
        wrapper.style.top = "";
        wrapper.style.left = "";
        wrapper.style.width = "";
        wrapper.style.height = "";
        wrapper.style.transition = "";
        wrapper.style.removeProperty("--main-width");
        placeholder?.remove();
        placeholder = null;
      };

      // transitionend를 우선 쓰되(정확한 타이밍), 브라우저가 이벤트를 못
      // 보내는 예외 상황(예: 요소가 도중에 DOM에서 제거됨) 대비 타이머로 이중 방어.
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        wrapper.removeEventListener("transitionend", onTransitionEnd);
        cleanup();
      };
      const onTransitionEnd = (event) => {
        if (event.target === wrapper && event.propertyName === "width") finish();
      };
      wrapper.addEventListener("transitionend", onTransitionEnd);
      window.setTimeout(finish, CARD_COLLAPSE_ANIM_MS + 180);
    }

    function expand() {
      expandTimer = null;
      if (expanded || !wrapper.isConnected) return;

      const gridEl = wrapper.closest(".article-grid");
      if (!gridEl) return;

      // 다른 카드가 펼쳐져 있으면 먼저 접습니다 — 동시에 여러 개가
      // 펼쳐져 좌표 계산이 꼬이는 걸 막습니다.
      const currentCollapse = getExpandedCollapse();
      if (currentCollapse && currentCollapse !== collapse) {
        currentCollapse();
      }

      const gridRect = gridEl.getBoundingClientRect();
      const rect = wrapper.getBoundingClientRect();
      const collapsedWidth = rect.width;
      const top = rect.top - gridRect.top;
      const originalLeft = rect.left - gridRect.left;
      const rowWidth = gridRect.width; // 그리드의 한 행은 항상 그리드 전체 폭을 씁니다.

      // 사진+기사 칸(article-card-main)은 확장 중에도 어차피 내용이 안 바뀌니,
      // 지금 이 순간의 폭을 그대로 고정값으로 못박아 둡니다 — 세부 패널이
      // flex:1로 나머지 공간을 흡수하는 동안 이 칸은 단 1px도 흔들리지 않습니다.
      const mainEl = wrapper.querySelector(".article-card-main");
      const mainWidth = mainEl ? mainEl.getBoundingClientRect().width : null;

      // 펼쳤을 때 다른 기사가 한 조각이라도 튀어나와 보이지 않도록, 펼쳐진
      // 카드는 항상 자기 줄(그리드 폭) 전체를 정확히 채웁니다. 채울 여유가
      // 너무 좁으면(모바일 1열 레이아웃 등) 어색하게 살짝만 펼쳐지는 대신
      // 아예 펼치지 않습니다.
      const panelWidth = rowWidth - collapsedWidth - CARD_EXPAND_GAP;
      if (panelWidth < CARD_EXPAND_MIN_PANEL_WIDTH) return;

      // 그리드 자리를 그대로 예약해두는 자리표시자 — wrapper와 똑같은
      // 위치(다음 형제로)에 넣어서, wrapper가 absolute로 빠져도 다른
      // 카드가 밀려오지 않습니다.
      placeholder = document.createElement("div");
      placeholder.className = "article-card-placeholder";
      placeholder.style.height = `${rect.height}px`;
      wrapper.before(placeholder);

      wrapper.style.position = "absolute";
      wrapper.style.top = `${top}px`;
      wrapper.style.left = `${originalLeft}px`;
      wrapper.style.width = `${collapsedWidth}px`;
      wrapper.style.height = `${rect.height}px`;
      if (mainWidth) wrapper.style.setProperty("--main-width", `${mainWidth}px`);

      // Intone 팝업이 아래로 늘어나다가 화면 끝에 부딪히면 그때부터 반대
      // 방향(위)으로 늘어나는 것과 같은 방식: 먼저 오른쪽으로 늘어나 줄의
      // 오른쪽 끝에 닿을 때까지 자라고, 그 뒤로는 오른쪽 끝을 그대로 붙인 채
      // 왼쪽으로 계속 늘어나 결국 줄 왼쪽 끝(left:0)까지 닿습니다.
      // width는 처음부터 끝까지 하나의 선형(linear) 전환이고, left는 오른쪽
      // 여유(rightGap)를 다 쓴 시점부터 delay만큼 늦게 움직이기 시작하도록
      // 만들어서, 두 구간 내내 "오른쪽 끝 = 줄 오른쪽 경계"가 수학적으로
      // 정확히 맞물립니다(선형 구간에서 left+width의 변화율이 항상 상쇄되도록
      // 구간 길이를 rightGap : leftGap 비율로 나눴기 때문 — 다른 기사가
      // 한순간이라도 비집고 튀어나올 여지가 없습니다).
      const rightGap = rowWidth - (originalLeft + collapsedWidth);
      const leftGap = originalLeft;
      const totalGrowth = rightGap + leftGap; // = rowWidth - collapsedWidth, 항상 > 0(위 가드에서 보장)
      const phase1Ms = (CARD_EXPAND_ANIM_MS * rightGap) / totalGrowth;
      const phase2Ms = CARD_EXPAND_ANIM_MS - phase1Ms;

      // 폭/좌표를 먼저 "지금과 같은 값"으로 명시적으로 고정한 뒤, 다음
      // 프레임에 목표 값으로 바꿔야 transition이 실제로 애니메이션됩니다
      // (같은 프레임에 position: absolute와 목표 값을 한 번에 주면 전환
      // 없이 바로 점프해버림).
      requestAnimationFrame(() => {
        if (!expanded) return; // 그 사이 collapse()가 먼저 불렸으면 건너뜀
        wrapper.classList.add("is-expanded", "is-sizing-locked");
        wrapper.style.transition =
          `width ${CARD_EXPAND_ANIM_MS}ms linear, ` +
          `left ${phase2Ms}ms linear ${phase1Ms}ms, ` +
          `transform 320ms var(--ease), box-shadow 320ms var(--ease)`;
        wrapper.style.width = `${rowWidth}px`;
        wrapper.style.left = "0px";
      });

      expanded = true;
      setExpandedCollapse(collapse);
    }

    // 마우스: 1.5초 이상 머물러야 펼쳐지고, 벗어나면 즉시 접힙니다.
    function onMouseEnter() {
      clearExpandTimer();
      if (!expanded) {
        expandTimer = window.setTimeout(expand, CARD_EXPAND_DELAY_MS);
      }
    }
    function onMouseLeave() {
      clearExpandTimer();
      collapse();
    }

    // 키보드 포커스: 마우스처럼 "잠깐 스쳐가는" 신호가 아니라 명확한 진입/이탈
    // 동작이라, 기다리지 않고 바로 펼치고/접습니다(Tab으로 훑을 때 1.5초씩
    // 기다리게 하면 키보드 사용자 경험이 오히려 나빠지므로).
    function onFocusIn() {
      clearExpandTimer();
      if (!expanded) expand();
    }
    function onFocusOut(event) {
      if (wrapper.contains(event.relatedTarget)) return; // 카드 내부에서 포커스 이동한 것뿐
      clearExpandTimer();
      collapse();
    }

    wrapper.addEventListener("mouseenter", onMouseEnter);
    wrapper.addEventListener("mouseleave", onMouseLeave);
    wrapper.addEventListener("focusin", onFocusIn);
    wrapper.addEventListener("focusout", onFocusOut);

    return () => {
      clearExpandTimer();
      clearExpandedCollapseIfCurrent(collapse);
      wrapper.removeEventListener("mouseenter", onMouseEnter);
      wrapper.removeEventListener("mouseleave", onMouseLeave);
      wrapper.removeEventListener("focusin", onFocusIn);
      wrapper.removeEventListener("focusout", onFocusOut);
      placeholder?.remove();
    };
  }, []);

  return wrapperRef;
}
