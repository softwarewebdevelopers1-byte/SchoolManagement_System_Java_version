import s from "./StatusBadge.module.css";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const toneFor = (value: string): Tone => {
  const v = value.toLowerCase();
  if (
    [
      "paid",
      "completed",
      "approved",
      "delivered",
      "fulfilled",
      "sent",
      "active",
      "success",
    ].includes(v)
  )
    return "success";
  if (
    [
      "pending",
      "partially paid",
      "partially fulfilled",
      "draft",
      "pending approval",
      "issued",
      "attention needed",
    ].includes(v)
  )
    return "warning";
  if (
    [
      "overdue",
      "failed",
      "rejected",
      "cancelled",
      "critical balance",
      "unpaid",
      "reversed",
    ].includes(v)
  )
    return "danger";
  if (["unallocated", "pending match", "info"].includes(v)) return "info";
  if (["on track"].includes(v)) return "primary";
  return "neutral";
};

export const StatusBadge = ({
  value,
  tone,
}: {
  value: string;
  tone?: Tone;
}) => {
  const t = tone ?? toneFor(value);
  return <span className={`${s.badge} ${s[t]}`}>{value}</span>;
};
