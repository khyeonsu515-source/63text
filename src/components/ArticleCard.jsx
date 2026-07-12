import { useState } from "react";
import { CLICKBAIT_ROWS, CREDIBILITY_ROWS, STANCE_COLORS, STANCE_FALLBACK } from "../constants.js";
import { domainOf, safeHttpUrl } from "../lib/format.js";
import { lightenRgb, rgbToCss, scoreToRgbColor } from "../lib/color.js";
import { useCardHoverExpand } from "../hooks/useCardHoverExpand.js";
import { PlaceholderIcon } from "./PlaceholderIcon.jsx";
import { BreakdownRows } from "./BreakdownRows.jsx";

export function ArticleCard({ article, analysis, delayMs, topicLabel }) {
  const wrapperRef = useCardHoverExpand();
  const [imgFailed, setImgFailed] = useState(false);

  const href = safeHttpUrl(article.url);

  const stance = analysis.direction?.stance;
  const stanceColor = STANCE_COLORS[stance] || STANCE_FALLBACK;

  // 주제 섹션 헤더 없이 단독으로 표시되는 카드(기사 1개짜리 주제 모음)에서만
  // 어떤 이슈인지 알 수 있도록 작게 표시합니다.

  // 실제 기사 제목을 메인 헤드라인으로, AI 한 줄 요약은 그 아래 보조 설명으로.
  // article_title이 없던 옛날 기사는 요약을 대신 헤드라인 자리에 보여줍니다.
  const hasTitle = Boolean(analysis.article_title);
  const headlineText = hasTitle ? analysis.article_title : analysis.article_summary || "제목 없음";

  // 오른쪽 위 대각선 = 신뢰도, 왼쪽 아래 대각선 = 어그로도. 신호등 색으로 또렷하게
  // 대비시키고, 같은 두 색을 옅게 밝혀 은은한 글로우(호버 시 진하게)도 만듭니다.
  const credibilityRgb = scoreToRgbColor(analysis.credibility_score, false);
  const clickbaitRgb = scoreToRgbColor(analysis.clickbait_score, true);

  // 본문(썸네일+제목) 어디를 클릭하든 기사로 이동(편의 기능). 세부 분석
  // 패널은 기사 자체가 아니라 참고 정보라 클릭 대상에서 제외합니다.
  // 단, (1) 링크/펼치기(details) 요소를 눌렀거나 (2) 텍스트를 드래그 선택
  // 중이거나 (3) 안전한 URL이 없으면 건너뜁니다.
  function handleMainClick(event) {
    if (!href) return;
    if (event.target.closest("a, details")) return;
    if (String(window.getSelection?.() || "").length > 0) return;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      ref={wrapperRef}
      className="article-card-border"
      style={{
        background: `linear-gradient(45deg, ${rgbToCss(clickbaitRgb)}, ${rgbToCss(credibilityRgb)})`,
        "--glow-a": rgbToCss(lightenRgb(clickbaitRgb, 0.15), 0.55),
        "--glow-b": rgbToCss(lightenRgb(credibilityRgb, 0.15), 0.55),
        animationDelay: `${delayMs}ms`,
      }}
    >
      <div className={`article-card${href ? "" : " article-card--nolink"}`}>
        <div className="article-card-main" onClick={handleMainClick}>
          <div className="thumb">
            {analysis.image_url && !imgFailed ? (
              <img src={analysis.image_url} alt="" loading="lazy" onError={() => setImgFailed(true)} />
            ) : (
              <PlaceholderIcon />
            )}
          </div>
          <div className="body">
            {topicLabel && <span className="article-topic-kicker">{topicLabel}</span>}
            <span className="article-source">{domainOf(article.url)}</span>
            <div className="article-headline">
              <h3 className="article-title">
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {headlineText}
                  </a>
                ) : (
                  headlineText
                )}
              </h3>
              {hasTitle && analysis.article_summary && <p className="article-dek">{analysis.article_summary}</p>}
            </div>
            {stance && (
              <span className="stance-badge" style={{ background: stanceColor.bg, color: stanceColor.fg }}>
                {stance}
              </span>
            )}
            {analysis.direction?.reason && (
              <details className="reason">
                <summary>이 관점으로 본 이유</summary>
                <p>{analysis.direction.reason}</p>
              </details>
            )}
          </div>
        </div>
        {/* 카드를 1.5초 이상 호버/포커스하면 옆으로 펼쳐지며 나타나는 세부 분석
            — Intone 팝업과 같은 항목/배점. 세로가 아니라 가로로 펼쳐지는 패널이라
            위아래로 쌓지 않고 신뢰도/어그로도를 한 칸에 순서대로 쌓습니다. */}
        <div className="article-card-side">
          <div className="article-detail">
            <div className="detail-col">
              <h4>신뢰도 세부</h4>
              <BreakdownRows breakdown={analysis.credibility_breakdown} rows={CREDIBILITY_ROWS} />
            </div>
            <div className="detail-col">
              <h4>어그로도 세부</h4>
              <BreakdownRows breakdown={analysis.clickbait_breakdown} rows={CLICKBAIT_ROWS} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
