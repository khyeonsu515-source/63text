import { useEffect, useState } from "react";
import { loadTopicArticles } from "../lib/loadTopicArticles.js";

// topics(주제 목록)마다 딸린 기사 분석 기록을 불러와 [{ topic, articles }] 섹션으로
// 만듭니다. topics가 바뀌는 동안(예: 실시간 구독으로 더 새 스냅샷 도착) 오래된
// 비동기 로딩 결과가 최신 결과를 덮어쓰지 않도록 ignore 플래그로 방지합니다.
export function useFeedSections(topics) {
  const [sections, setSections] = useState(null); // null = 아직 첫 로딩 전
  const [sectionsError, setSectionsError] = useState(false);

  useEffect(() => {
    if (!topics) return undefined;
    if (!topics.length) {
      setSections([]);
      setSectionsError(false);
      return undefined;
    }

    let ignore = false;
    Promise.all(topics.map(async (topic) => ({ topic, articles: await loadTopicArticles(topic) })))
      .then((loaded) => {
        if (ignore) return;
        setSections(loaded);
        setSectionsError(false);
      })
      .catch(() => {
        if (ignore) return;
        setSectionsError(true);
      });

    return () => {
      ignore = true;
    };
  }, [topics]);

  return { sections, sectionsError };
}
