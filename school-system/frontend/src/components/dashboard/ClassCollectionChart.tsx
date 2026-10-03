import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useFinance } from "@/context/FinanceContext";
import { classPerformance } from "@/utils/calculations";
import { formatKES, formatPercent } from "@/utils/formatters";
import s from "./Dashboard.module.css";

const barColor = (rate: number) =>
  rate >= 90
    ? "#16A34A"
    : rate >= 75
      ? "#14B8A6"
      : rate >= 60
        ? "#F59E0B"
        : "#DC2626";

export const ClassCollectionChart = () => {
  const { students } = useFinance();
  const data = classPerformance(students);

  return (
    <div className={s.chartWrap}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            stroke="var(--edunex-border)"
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--edunex-muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="className"
            width={72}
            tick={{ fontSize: 12, fill: "var(--edunex-text-soft)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--edunex-surface)",
              border: "1px solid var(--edunex-border)",
              borderRadius: 10,
              fontSize: 12,
            }}
            formatter={(v, name) =>
              name === "rate"
                ? formatPercent(Number(v), 1)
                : formatKES(Number(v))
            }
          />
          <Bar dataKey="rate" radius={[0, 6, 6, 0]} maxBarSize={18}>
            {data.map((d, i) => (
              <Cell key={i} fill={barColor(d.rate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
