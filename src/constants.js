// Intone 확장 프로그램이 신뢰도/관점 분석을 쌓아두는 공유 Firestore.
// 웹 API 키는 클라이언트 공개용이며, 접근 제어는 Firestore 보안 규칙(allow read: if true)이 담당합니다.
export const firebaseConfig = {
  apiKey: "AIzaSyBQT-UNNgB5Ujlkw_RFsPNsfKfj0jIXQnY",
  projectId: "intone-analysis",
};

export const TOPIC_FETCH_LIMIT = 30; // 한 번에 불러올 최근 주제 수
export const RELATED_OVERLAP_THRESHOLD = 0.2; // 두 주제를 "연관"으로 볼 키워드 겹침 비율(Jaccard)
export const CARD_STAGGER_MS = 55; // 카드 등장 애니메이션 간격
export const SECTION_STAGGER_MS = 85; // 섹션 등장 애니메이션 간격
export const MAX_STAGGER_STEPS = 8; // 지연 누적 상한 (많은 항목일 때 마지막이 너무 늦게 뜨지 않게)

export const CARD_EXPAND_DELAY_MS = 1500; // 이 시간 이상 머물러야 카드가 옆으로 펼쳐짐
export const CARD_EXPAND_GAP = 20; // 본문과 세부 패널 사이 간격(px)
export const CARD_EXPAND_MIN_PANEL_WIDTH = 160; // 펼쳤을 때 이보다 패널이 좁아지면(모바일 등) 아예 펼치지 않음
export const CARD_EXPAND_ANIM_MS = 420; // 펼침 애니메이션 총 소요 시간
export const CARD_COLLAPSE_ANIM_MS = 320; // 접힘 애니메이션 소요 시간

// Intone이 새 topic을 만들 때 매기는 고정 대분류와 순서를 맞춥니다.
export const CATEGORY_ORDER = ["정치", "경제", "사회", "국제", "문화", "과학기술", "스포츠", "연예", "기타"];

// 부정 ~ 긍정 단일 스펙트럼. 배열 순서가 곧 스펙트럼 위치를 나타냅니다.
export const STANCE_ORDER = ["매우 부정적", "약간 부정적", "중립적", "약간 긍정적", "매우 긍정적"];
export const STANCE_COLORS = {
  "매우 부정적": { bg: "rgba(239, 68, 68, 0.14)", fg: "#dc2626" },
  "약간 부정적": { bg: "rgba(249, 115, 22, 0.14)", fg: "#c2620a" },
  "중립적": { bg: "rgba(107, 114, 128, 0.14)", fg: "#6b7280" },
  "약간 긍정적": { bg: "rgba(56, 145, 255, 0.14)", fg: "#2563eb" },
  "매우 긍정적": { bg: "rgba(99, 102, 241, 0.16)", fg: "#4f46e5" },
};
export const STANCE_FALLBACK = STANCE_COLORS["중립적"];

// Intone 확장의 세부 분석 팝업(content-popup.js)과 항목/배점을 그대로 맞춘 목록입니다
// — 같은 데이터를 같은 기준으로 보여줘야 하므로.
export const CREDIBILITY_ROWS = [
  ["source_clarity", "공식 출처 인용", 20],
  ["title_body_match", "제목/본문 일치", 25],
  ["evidence_quality", "근거 충실도", 25],
  ["neutrality", "객관적 표현 사용", 15],
  ["context", "맥락 제공성", 15],
];
export const CLICKBAIT_ROWS = [
  ["exaggeration", "과장된 표현", 20],
  ["curiosity_gap", "궁금증 유도", 20],
  ["title_body_mismatch", "선정적 제목", 25],
  ["emotional_trigger", "감정 자극", 20],
  ["hidden_key_info", "핵심 정보 은폐", 15],
];

export const PLACEHOLDER_ICON_PATHS = {
  rect: { x: 3, y: 4, width: 18, height: 16, rx: 2 },
  lines: "M7 9H17M7 13H14M7 17H11",
};
