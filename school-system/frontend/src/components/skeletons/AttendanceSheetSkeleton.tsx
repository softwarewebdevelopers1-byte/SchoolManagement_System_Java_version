import Skeleton from "@mui/material/Skeleton";

export default function AttendanceSheetSkeleton() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          padding: "20px",
          flexDirection: "column",
        }}
      >
        <Skeleton variant="rectangular" width={"100%"} height={400} />
      </div>
    </div>
  );
}
