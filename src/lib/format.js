import { MAX_STAGGER_STEPS } from "../constants.js";

// 공개 쓰기 가능한 Firestore에서 온 URL이므로, http/https만 신뢰합니다.
// javascript:, data: 같은 위험한 스킴은 빈 문자열로 걸러 링크/이동에서 제외합니다.
export function safeHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
  } catch (error) {
    return "";
  }
}

export function timeAgo(epochMs) {
  if (!epochMs) return "";
  const diffMs = Date.now() - epochMs;
  if (diffMs < 0) return "방금 전";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (error) {
    return "출처 미상";
  }
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function staggerDelay(index, step) {
  return Math.min(index, MAX_STAGGER_STEPS) * step;
}
