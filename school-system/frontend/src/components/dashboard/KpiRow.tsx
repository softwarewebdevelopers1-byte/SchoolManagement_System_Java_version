import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Receipt,
  PiggyBank,
} from "lucide-react";
import { KpiCard } from "@/components/common/KpiCard";
import { useFinance } from "@/context/FinanceContext";
import { formatKES, formatPercent } from "@/utils/formatters";
import s from "./Dashboard.module.css";

export const KpiRow = () => {
  const { kpis, currentUser } = useFinance();
  const role = currentUser.role;

  const collectedDelta = (kpis.collected / (kpis.expected || 1) - 0.905) * 100;
  const outstandingDelta = -5.2;
  const expectedDelta = 8.4;
  const netDelta = 12.1;

  if (role === "platform_admin") {
    return (
      <div className={s.kpiRow}>
        <KpiCard
          label="Active Schools"
          value="248"
          hint="18 added this month"
          delta={7.3}
          icon={<PiggyBank size={16} />}
          tone="primary"
        />
        <KpiCard
          label="Finance Users"
          value="1,840"
          hint="Across all schools"
          delta={4.1}
          icon={<Wallet size={16} />}
          tone="primary"
        />
        <KpiCard
          label="Platform Collections"
          value={formatKES(184_200_000, { compact: true })}
          hint="This month"
          delta={9.6}
          icon={<TrendingUp size={16} />}
          tone="success"
        />
        <KpiCard
          label="Subscriptions"
          value="KES 8.2M"
          hint="MRR"
          delta={5.4}
          icon={<Receipt size={16} />}
          tone="success"
        />
      </div>
    );
  }

  if (role === "parent" || role === "student") {
    return null;
  }

  return (
    <div className={s.kpiRow}>
      <KpiCard
        label="Expected Fees"
        value={formatKES(kpis.expected, { compact: true })}
        hint="This term"
        delta={expectedDelta}
        icon={<Wallet size={16} />}
        tone="primary"
      />
      <KpiCard
        label="Collected"
        value={formatKES(kpis.collected, { compact: true })}
        hint={`${formatPercent(kpis.collectionRate, 1)} collection rate`}
        delta={collectedDelta}
        icon={<TrendingUp size={16} />}
        tone="success"
      />
      <KpiCard
        label="Outstanding"
        value={formatKES(kpis.outstanding, { compact: true })}
        hint={`${formatPercent((kpis.outstanding / (kpis.expected || 1)) * 100, 1)} of expected`}
        delta={outstandingDelta}
        invert
        icon={<AlertCircle size={16} />}
        tone="warning"
      />
      <KpiCard
        label="Net Cashflow"
        value={formatKES(kpis.netCashflow, { compact: true })}
        hint="Inflows minus outflows"
        delta={netDelta}
        icon={<PiggyBank size={16} />}
        tone={kpis.netCashflow >= 0 ? "success" : "danger"}
      />
    </div>
  );
};
