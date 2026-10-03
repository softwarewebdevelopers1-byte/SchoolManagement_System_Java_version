import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import s from "./KpiCard.module.css";

interface Props {
  label: string;
  value: string;
  hint?: string;
  delta?: number; // percentage change vs previous
  deltaLabel?: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
  invert?: boolean; // for metrics where "down is good"
}

export const KpiCard = ({
  label,
  value,
  hint,
  delta,
  deltaLabel,
  icon,
  tone = "default",
  invert,
}: Props) => {
  const dir =
    delta === undefined
      ? "flat"
      : delta > 0
        ? "up"
        : delta < 0
          ? "down"
          : "flat";
  const positive = invert ? dir === "down" : dir === "up";
  const negative = invert ? dir === "up" : dir === "down";
  const TrendIcon =
    dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;

  return (
    <article className={`${s.card} ${s[tone]}`}>
      <header className={s.head}>
        <span className={s.label}>{label}</span>
        {icon && <span className={s.icon}>{icon}</span>}
      </header>
      <div className={s.value}>{value}</div>
      <div className={s.meta}>
        {delta !== undefined && (
          <span
            className={`${s.delta} ${positive ? s.pos : negative ? s.neg : s.flat}`}
          >
            <TrendIcon size={12} />
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        )}
        {(deltaLabel || hint) && (
          <span className={s.hint}>{deltaLabel ?? hint}</span>
        )}
      </div>
    </article>
  );
};
