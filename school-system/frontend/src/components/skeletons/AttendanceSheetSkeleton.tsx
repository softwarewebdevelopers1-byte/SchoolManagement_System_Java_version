export default function AttendanceSheetSkeleton() {
  return (
    <div role="status" aria-label="Loading attendance sheet">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          padding: "20px",
          flexDirection: "column",
        }}
      >
        <div
          className="performance-skeleton"
          style={{ width: "100%", height: 400 }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
