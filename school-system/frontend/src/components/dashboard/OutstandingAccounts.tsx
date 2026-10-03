import { useNavigate } from "react-router-dom";
import { useFinance } from "@/context/FinanceContext";
import { formatKES } from "@/utils/formatters";
import { StatusBadge } from "@/components/common/StatusBadge";
import s from "./Dashboard.module.css";

export const OutstandingAccounts = () => {
  const { students } = useFinance();
  const navigate = useNavigate();
  const top = [...students]
    .filter((s) => s.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 6);

  return (
    <div>
      {top.map((student) => (
        <button
          key={student.id}
          type="button"
          className={s.outstandingRow}
          onClick={() => navigate(`/finance/students/${student.id}`)}
          style={{
            background: "none",
            border: "none",
            textAlign: "left",
            width: "100%",
            cursor: "pointer",
          }}
        >
          <div className={s.activityAvatar}>{student.photoInitials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={s.outstandingName}>{student.fullName}</div>
            <div className={s.outstandingClass}>
              {student.className} · {student.admissionNo}
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
            <span className={s.outstandingAmt}>
              {formatKES(student.outstanding, { compact: true })}
            </span>
            <StatusBadge value={student.status} />
          </div>
        </button>
      ))}
    </div>
  );
};
