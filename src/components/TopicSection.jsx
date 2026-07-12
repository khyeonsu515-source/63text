import { timeAgo } from "../lib/format.js";
import { StanceSummary } from "./StanceSummary.jsx";
import { ArticleGrid } from "./ArticleGrid.jsx";

function TopicHeader({ topic, metaText, isClustered }) {
  return (
    <div className="topic-header">
      <div className="topic-title-block">
        {isClustered && <span className="related-tag">관련 이슈</span>}
        {topic.category && <span className="topic-category">{topic.category}</span>}
        <h2>{topic.topic || "제목 없음"}</h2>
      </div>
      <span className="topic-meta">{metaText}</span>
    </div>
  );
}

export function TopicSection({ topic, articles, sectionDelayMs, isClustered }) {
  const sectionClassName = isClustered ? "topic-section clustered" : "topic-section";

  if (!articles.length) {
    return (
      <section className={sectionClassName} style={{ animationDelay: `${sectionDelayMs}ms` }}>
        <TopicHeader topic={topic} metaText={`${timeAgo(topic.updatedAt)} 업데이트`} isClustered={isClustered} />
        <p className="topic-empty">이 이슈에 연결된 기사의 분석 기록을 찾지 못했습니다.</p>
      </section>
    );
  }

  return (
    <section className={sectionClassName} style={{ animationDelay: `${sectionDelayMs}ms` }}>
      <TopicHeader
        topic={topic}
        metaText={`${articles.length}개 매체 보도 · ${timeAgo(topic.updatedAt)} 업데이트`}
        isClustered={isClustered}
      />
      <StanceSummary articles={articles} />
      <ArticleGrid items={articles} />
    </section>
  );
}
