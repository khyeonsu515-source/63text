import { useMemo } from "react";
import { SECTION_STAGGER_MS } from "../constants.js";
import { staggerDelay } from "../lib/format.js";
import { clusterRelatedTopics } from "../lib/cluster.js";
import { TopicSection } from "./TopicSection.jsx";
import { ArticleGrid } from "./ArticleGrid.jsx";

// 기사가 딱 1개뿐인 주제는 "비교"라는 취지에 안 맞고, 섹션 하나씩 차지하면 공간을
// 낭비하므로, 제목 없이 한데 모아 카드 그리드로만(여러 줄로 흐르게) 표시합니다.
export function Feed({ sections, activeCategory }) {
  const { filtered, ordered, singles } = useMemo(() => {
    const filtered =
      activeCategory === "전체" ? sections : sections.filter(({ topic }) => topic.category === activeCategory);

    const headed = filtered.filter(({ articles }) => articles.length !== 1);
    const singles = filtered
      .filter(({ articles }) => articles.length === 1)
      .sort((a, b) => (b.topic.updatedAt || 0) - (a.topic.updatedAt || 0));

    const ordered = clusterRelatedTopics(headed);

    return { filtered, ordered, singles };
  }, [sections, activeCategory]);

  const statusText =
    activeCategory === "전체" ? `최근 이슈 ${filtered.length}건` : `${activeCategory} 이슈 ${filtered.length}건`;

  return (
    <>
      <p className="status-line">{statusText}</p>
      <div className="legend">
        <span className="swatch"></span>
        기사 테두리 색: 오른쪽 위 = 신뢰도, 왼쪽 아래 = 어그로도 (빨강 낮음 · 초록 높음)
      </div>
      <div>
        {ordered.map(({ topic, articles, isClustered }, index) => (
          <TopicSection
            key={topic.id}
            topic={topic}
            articles={articles}
            isClustered={isClustered}
            sectionDelayMs={staggerDelay(index, SECTION_STAGGER_MS)}
          />
        ))}
        {singles.length > 0 && (
          <section className="topic-section" style={{ animationDelay: `${staggerDelay(ordered.length, SECTION_STAGGER_MS)}ms` }}>
            <ArticleGrid
              items={singles.map(({ topic, articles }) => ({
                article: articles[0].article,
                analysis: articles[0].analysis,
                topicLabel: topic.topic,
              }))}
            />
          </section>
        )}
      </div>
    </>
  );
}
