import { useEffect, useState } from "react";
import { CATEGORY_ORDER } from "./constants.js";
import { useTopics } from "./hooks/useTopics.js";
import { useFeedSections } from "./hooks/useFeedSections.js";
import { Header } from "./components/Header.jsx";
import { CategoryTabs } from "./components/CategoryTabs.jsx";
import { Notice } from "./components/Notice.jsx";
import { Skeleton } from "./components/Skeleton.jsx";
import { Feed } from "./components/Feed.jsx";

export default function App() {
  const { topics, loadError } = useTopics();
  const { sections, sectionsError } = useFeedSections(topics);
  const [activeCategory, setActiveCategory] = useState("전체");

  useEffect(() => {
    if (activeCategory !== "전체" && !CATEGORY_ORDER.includes(activeCategory)) {
      setActiveCategory("전체");
    }
  }, [sections, activeCategory]);

  let categoryTabs = null;
  let body;

  if (loadError) {
    body = <Notice title="이슈 목록을 불러오지 못했습니다" detail="잠시 후 다시 시도해주세요." />;
  } else if (topics === null) {
    body = <Skeleton />;
  } else if (topics.length === 0) {
    body = <Notice title="표시할 이슈가 없습니다" detail="아직 분석된 기사가 쌓이지 않았습니다." />;
  } else if (sectionsError) {
    body = <Notice title="이슈를 표시하는 중 문제가 발생했습니다" detail="잠시 후 다시 시도해주세요." />;
  } else if (sections === null) {
    body = <Skeleton />;
  } else {
    categoryTabs = <CategoryTabs sections={sections} activeCategory={activeCategory} onSelect={setActiveCategory} />;
    body = <Feed sections={sections} activeCategory={activeCategory} />;
  }

  return (
    <>
      <Header />
      {categoryTabs ?? <nav className="category-tabs" aria-label="카테고리"></nav>}
      <main>{body}</main>
    </>
  );
}
