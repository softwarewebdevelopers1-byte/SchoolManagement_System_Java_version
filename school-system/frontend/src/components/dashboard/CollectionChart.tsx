import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useFinance } from "@/context/FinanceContext";
import { monthlyTrend } from "@/utils/calculations";
import { formatKES } from "@/utils/formatters";
import s from "./Dashboard.module.css";

export const CollectionChart = () => {
  const { payments, expenses, year } = useFinance();
  const data = monthlyTrend(payments, expenses, Number(year.label));

  return (
    <div className={s.chartWrap}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gExpected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F4C81" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#0F4C81" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--edunex-border)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "var(--edunex-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--edunex-muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              formatKES(Number(v), { compact: true }).replace("KES ", "")
            }
          />
          <Tooltip
            contentStyle={{
              background: "var(--edunex-surface)",
              border: "1px solid var(--edunex-border)",
              borderRadius: 10,
              fontSize: 12,
            }}
            formatter={(v) => formatKES(Number(v))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="expected"
            name="Expected"
            stroke="#0F4C81"
            strokeWidth={2}
            fill="url(#gExpected)"
          />
          <Area
            type="monotone"
            dataKey="collected"
            name="Collected"
            stroke="#14B8A6"
            strokeWidth={2.4}
            fill="url(#gCollected)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
