import Skeleton from "@mui/material/Skeleton";

export default function OverviewSkeleton() {
  return (
    <div>
      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        {" "}
        <Skeleton variant="rectangular" width={210} height={60} />
        <Skeleton variant="rectangular" width={210} height={60} />
        <Skeleton variant="rectangular" width={210} height={60} />
        <Skeleton variant="rectangular" width={210} height={60} />
      </div>
      <Skeleton />
      <Skeleton animation="wave" />
      <Skeleton animation={false} />
    </div>
  );
}
