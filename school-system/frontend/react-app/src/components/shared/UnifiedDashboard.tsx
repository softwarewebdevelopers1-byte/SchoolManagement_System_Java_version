import AdminDashboard from "../admin/AdminDashboard";
import StudentDashboard from "../students/StudentDashboard";
import { getCurrentUser, hasAnyRole } from "../../api";

const UnifiedDashboard = () => {
  const user = getCurrentUser();

  if (hasAnyRole(user, ["student", "parent"])) {
    return <StudentDashboard />;
  }

  return <AdminDashboard />;
};

export default UnifiedDashboard;
