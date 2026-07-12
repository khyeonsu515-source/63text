import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase.js";
import { TOPIC_FETCH_LIMIT } from "../constants.js";

// topics를 최신순으로 실시간 구독합니다.
export function useTopics() {
  const [topics, setTopics] = useState(null); // null = 아직 첫 스냅샷 전(로딩)
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "topics"), orderBy("updatedAt", "desc"), limit(TOPIC_FETCH_LIMIT)),
      (snapshot) => {
        setLoadError(false);
        setTopics(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
      },
      () => {
        setLoadError(true);
      }
    );
    return unsubscribe;
  }, []);

  return { topics, loadError };
}
