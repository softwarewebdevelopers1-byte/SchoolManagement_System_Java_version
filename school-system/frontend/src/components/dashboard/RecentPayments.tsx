import { useNavigate } from "react-router-dom";
import { useFinance } from "@/context/FinanceContext";
import { formatKES, timeAgo } from "@/utils/formatters";
import { StatusBadge } from "@/components/common/StatusBadge";
import s from "./Dashboard.module.css";

export const RecentPayments = () => {
  const { payments } = useFinance();
  const navigate = useNavigate();
  const recent = payments.slice(0, 6);

  return (
    <div className={s.activity}>
      {recent.map((p) => (
        <button
          key={p.id}
          type="button"
          className={s.activityRow}
          onClick={() => navigate(`/finance/students/${p.studentId}`)}
          style={{
            background: "none",
            border: "none",
            textAlign: "left",
            width: "100%",
            cursor: "pointer",
          }}
        >
          <div className={s.activityAvatar}>
            {p.studentName
              .split(" ")
              .map((x) => x[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className={s.activityMeta}>
            <div className={s.activityName}>{p.studentName}</div>
            <div className={s.activityDesc}>
              {p.method} · {p.className} · {timeAgo(p.date)}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
            }}
          >
            <span className={s.activityAmt}>
              +{formatKES(p.amount, { compact: true })}
            </span>
            <StatusBadge value={p.status} />
          </div>
        </button>
      ))}
    </div>
  );
};
