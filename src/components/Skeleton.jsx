export function Skeleton() {
  return (
    <>
      <p className="status-line">불러오는 중...</p>
      <div className="article-grid">
        {Array.from({ length: 4 }, (_, i) => (
          <div className="skeleton" key={i}></div>
        ))}
      </div>
    </>
  );
}
