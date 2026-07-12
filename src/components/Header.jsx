import { useMemo } from "react";

export function Header() {
  const editionDate = useMemo(
    () =>
      new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
    []
  );

  return (
    <header>
      <div className="masthead">
        <a className="brand" href="/">
          <span className="logo-dot"></span>
          <span className="wordmark">Intone</span>
          <span className="tagline">Cross-checked news</span>
        </a>
        <span className="edition-date">{editionDate}</span>
      </div>
    </header>
  );
}
