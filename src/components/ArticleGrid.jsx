import { CARD_STAGGER_MS } from "../constants.js";
import { staggerDelay } from "../lib/format.js";
import { ArticleCard } from "./ArticleCard.jsx";

export function ArticleGrid({ items }) {
  return (
    <div className="article-grid">
      {items.map(({ article, analysis, topicLabel }, index) => (
        <ArticleCard
          key={article.url}
          article={article}
          analysis={analysis}
          topicLabel={topicLabel}
          delayMs={staggerDelay(index, CARD_STAGGER_MS)}
        />
      ))}
    </div>
  );
}
