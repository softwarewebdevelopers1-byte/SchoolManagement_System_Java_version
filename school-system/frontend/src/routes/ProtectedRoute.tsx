import { Navigate } from "react-router-dom";
import { useFinance } from "@/context/FinanceContext";

export const ProtectedRoute = ({
  allow,
  children,
}: {
  allow: string[];
  children: React.ReactNode;
}) => {
  const { role } = useFinance();
  if (!allow.includes(role)) {
    return (
      <Navigate
        to={
          role === "parent"
            ? "/parent/finance"
            : role === "student"
              ? "/student/finance"
              : "/finance/dashboard"
        }
        replace
      />
    );
  }
  return <>{children}</>;
};
