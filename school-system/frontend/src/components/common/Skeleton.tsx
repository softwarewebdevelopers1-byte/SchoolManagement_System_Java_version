import s from "./Skeleton.module.css";

export const Skeleton = ({
  w = "100%",
  h = 14,
  radius = 6,
  className = "",
}: {
  w?: string | number;
  h?: number;
  radius?: number;
  className?: string;
}) => (
  <div
    className={`${s.shimmer} ${className}`}
    style={{
      width: typeof w === "number" ? `${w}px` : w,
      height: h,
      borderRadius: radius,
    }}
  />
);
