export function Skeleton({ width = '100%', height = 16, radius = 8, style }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <Skeleton width={90} height={12} style={{ marginBottom: 12 }} />
      <Skeleton width={120} height={26} style={{ marginBottom: 14 }} />
      <Skeleton width={70} height={12} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <Skeleton width={36} height={36} radius={10} />
          <div style={{ flex: 1 }}>
            <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
            <Skeleton width="70%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}
