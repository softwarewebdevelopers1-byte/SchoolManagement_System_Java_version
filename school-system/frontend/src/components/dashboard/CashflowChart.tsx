import {
  BarChart,
  Bar,
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

export const CashflowChart = () => {
  const { payments, expenses, year } = useFinance();
  const data = monthlyTrend(payments, expenses, Number(year.label));

  return (
    <div className={s.chartWrap}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
        >
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
          <Bar
            dataKey="inflows"
            name="Inflows"
            fill="#16A34A"
            radius={[5, 5, 0, 0]}
            maxBarSize={22}
          />
          <Bar
            dataKey="outflows"
            name="Outflows"
            fill="#DC2626"
            radius={[5, 5, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
