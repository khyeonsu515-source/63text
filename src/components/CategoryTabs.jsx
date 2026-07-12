import { CATEGORY_ORDER } from "../constants.js";

export function CategoryTabs({ sections, activeCategory, onSelect }) {
  const present = new Set(sections.map(({ topic }) => topic.category).filter(Boolean));
  if (!present.size) return <nav className="category-tabs" aria-label="카테고리"></nav>;

  const categories = ["전체", ...CATEGORY_ORDER.filter((c) => present.has(c))];

  return (
    <nav className="category-tabs" aria-label="카테고리">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-tab${category === activeCategory ? " active" : ""}`}
          type="button"
          aria-current={category === activeCategory ? "true" : undefined}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </nav>
  );
}
