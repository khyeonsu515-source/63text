export function Notice({ title, detail }) {
  return (
    <div className="notice">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}
