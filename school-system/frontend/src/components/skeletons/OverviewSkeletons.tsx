export default function OverviewSkeleton() {
  return (
    <div role="status" aria-label="Loading overview">
      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="performance-skeleton"
            style={{ width: 210, height: 60 }}
            aria-hidden="true"
          />
        ))}
      </div>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="performance-skeleton"
          style={{ height: 16, margin: "12px 20px" }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
