import { RELATED_OVERLAP_THRESHOLD } from "../constants.js";

// ── Jaccard 유사도: 두 키워드 집합의 교집합 크기 / 합집합 크기 ──
export function keywordOverlapRatio(keywordsA, keywordsB) {
  const setA = new Set(Array.isArray(keywordsA) ? keywordsA : []);
  const setB = new Set(Array.isArray(keywordsB) ? keywordsB : []);
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  setA.forEach((kw) => {
    if (setB.has(kw)) intersection += 1;
  });
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// 서로 다른 topic이라도 core_keywords가 어느 정도 겹치면 연관 있다고 보고 Union-Find로
// 묶습니다. 묶음 안은 최신순, 묶음끼리는 묶음의 최신 updatedAt 순으로 정렬한 뒤 평평한
// 배열로 반환하며, 각 항목에 isClustered(묶음의 2번째 이후 항목인지)를 붙입니다.
export function clusterRelatedTopics(sections) {
  const parent = sections.map((_, i) => i);
  const find = (i) => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootA] = rootB;
  };

  for (let i = 0; i < sections.length; i += 1) {
    for (let j = i + 1; j < sections.length; j += 1) {
      if (keywordOverlapRatio(sections[i].topic.keywords, sections[j].topic.keywords) >= RELATED_OVERLAP_THRESHOLD) {
        union(i, j);
      }
    }
  }

  const clusters = new Map();
  sections.forEach((section, i) => {
    const root = find(i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(section);
  });

  const clusterList = [...clusters.values()];
  clusterList.forEach((members) => members.sort((a, b) => (b.topic.updatedAt || 0) - (a.topic.updatedAt || 0)));
  clusterList.sort((a, b) => (b[0].topic.updatedAt || 0) - (a[0].topic.updatedAt || 0));

  const ordered = [];
  clusterList.forEach((members) => {
    members.forEach((section, index) => ordered.push({ ...section, isClustered: index > 0 }));
  });
  return ordered;
}
