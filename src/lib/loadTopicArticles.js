import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { sha256Hex } from "./format.js";

// 한 주제(topic)의 articleUrls를 해시해 analysisResults에서 분석 기록을 조회합니다.
// 중복 URL은 한 번만, 기록이 없거나 기사가 아닌 문서는 조용히 건너뜁니다.
export async function loadTopicArticles(topic) {
  const urls = [...new Set((Array.isArray(topic.articleUrls) ? topic.articleUrls : []).filter(Boolean))];
  const docIds = await Promise.all(urls.map((url) => sha256Hex(url)));
  const articleDocs = await Promise.all(
    docIds.map((docId) => getDoc(doc(db, "analysisResults", docId)).catch(() => null))
  );

  const articles = [];
  articleDocs.forEach((docSnap, index) => {
    if (!docSnap || !docSnap.exists()) return;
    const analysis = docSnap.data();
    if (!analysis || !analysis.is_article) return;
    articles.push({ article: { url: urls[index] }, analysis });
  });
  return articles;
}
