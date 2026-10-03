import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useFinance } from "@/context/FinanceContext";
import { expenseBreakdown } from "@/utils/calculations";
import { formatKES, formatPercent } from "@/utils/formatters";
import s from "./Dashboard.module.css";

const COLORS = [
  "#0F4C81",
  "#14B8A6",
  "#F59E0B",
  "#7C3AED",
  "#DC2626",
  "#2563EB",
  "#16A34A",
  "#64748B",
  "#0891B2",
  "#DB2777",
];

export const ExpenseBreakdownChart = () => {
  const { expenses } = useFinance();
  const data = expenseBreakdown(expenses).slice(0, 8);
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div
        className={s.chartWrapSm}
        style={{ flex: "0 0 200px", maxWidth: 200 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius={52}
              outerRadius={82}
              paddingAngle={2}
              stroke="var(--edunex-surface)"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--edunex-surface)",
                border: "1px solid var(--edunex-border)",
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v) => formatKES(Number(v))}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul
        style={{
          flex: 1,
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {data.map((d, i) => (
          <li
            key={d.category}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: COLORS[i % COLORS.length],
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, color: "var(--edunex-text-soft)" }}>
              {d.category}
            </span>
            <span
              style={{
                color: "var(--edunex-muted)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatPercent((d.amount / total) * 100, 0)}
            </span>
            <span
              style={{
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                minWidth: 80,
                textAlign: "right",
              }}
            >
              {formatKES(d.amount, { compact: true })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
