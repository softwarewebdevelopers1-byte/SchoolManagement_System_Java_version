import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  School,
  Users,
  BarChart3,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Pause,
  Shield,
  FileText,
  Loader2,
} from "lucide-react";
import "./SuperAdmin.css";
import { superAdminApi } from "../../lib/api";

type SchoolStatus = "ACTIVE" | "SUSPENDED" | "PENDING" | "REJECTED";
type UserStatus = "ACTIVE" | "SUSPENDED";

interface School {
  id: string;
  name: string;
  county: string;
  students: number;
  status: SchoolStatus;
  plan: string;
}
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
  status: UserStatus;
}
interface AuditLog {
  id: string;
  action: string;
  by: string;
  at: Date;
}

const menuItems = [
  { key: "overview", name: "Overview", icon: BarChart3 },
  { key: "schools", name: "Schools", icon: School },
  { key: "users", name: "Users", icon: Users },
  { key: "audit", name: "Audit Log", icon: FileText },
  { key: "settings", name: "Settings", icon: Settings },
];

export default function SuperAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [schoolData, userData] = await Promise.all([
        superAdminApi.getSchools(),
        superAdminApi.getTeachers(),
      ]);
      setSchools((schoolData || []).map((school: any) => ({
        id: school.schoolId,
        name: school.schoolName,
        county: school.address || "-",
        students: school.totalUsers || 0,
        status: mapSchoolStatus(school.status),
        plan: "-",
      })));
      setUsers((userData || []).map((user: any) => ({
        id: user.userId,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        email: user.email,
        role: (user.roles || []).join(", "),
        school: user.schoolName,
        status: mapUserStatus(user.status),
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load super-admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const mapSchoolStatus = (status: string): SchoolStatus => {
    const normalized = status?.toUpperCase();
    if (["ACTIVE", "SUSPENDED", "PENDING", "REJECTED"].includes(normalized)) {
      return normalized as SchoolStatus;
    }
    return "PENDING";
  };

  const mapUserStatus = (status: string): UserStatus => {
    const normalized = status?.toUpperCase();
    if (normalized === "SUSPENDED" || normalized === "INACTIVE") {
      return "SUSPENDED";
    }
    if (normalized === "DELETED") {
      return "SUSPENDED";
    }
    return "ACTIVE";
  };

  const logAction = (action: string) => {
    setAudit((prev) => [
      { id: Date.now().toString(), action, by: "Super Admin", at: new Date() },
      ...prev,
    ]);
  };

  const handleSchoolAction = async (id: string, action: SchoolStatus) => {
    try {
      const statusValue = action === "REJECTED" ? "REJECTED_APPROVAL" : action;
      await superAdminApi.updateSchoolStatus(id, statusValue);
      setSchools((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: action } : s)),
      );
      logAction(`${action} school ${schools.find((s) => s.id === id)?.name}`);
    } catch (err) {
      logAction(`Failed to ${action.toLowerCase()} school: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleUserStatus = async (id: string, status: UserStatus) => {
    try {
      const statusValue = status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE";
      await superAdminApi.updateUserStatus(id, statusValue);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
      logAction(`${status} user ${users.find((u) => u.id === id)?.name}`);
    } catch (err) {
      logAction(`Failed to ${status.toLowerCase()} user: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
          <Loader2 className="sa-spinner" />
          <span style={{ marginLeft: 12, color: "var(--textMut)" }}>Loading live dashboard data...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--dText)", marginBottom: "1rem" }}>{error}</p>
          <button onClick={loadData} className="sa-btn primary">Retry</button>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <>
            <div className="sa-grid">
              <div className="sa-stat-card">
                <h4>Total Schools</h4>
                <h2>{schools.length}</h2>
              </div>
              <div className="sa-stat-card">
                <h4>Active Schools</h4>
                <h2>{schools.filter((s) => s.status === "ACTIVE").length}</h2>
              </div>
              <div className="sa-stat-card">
                <h4>Total Users</h4>
                <h2>{users.length}</h2>
              </div>
              <div className="sa-stat-card">
                <h4>Pending Approvals</h4>
                <h2>{schools.filter((s) => s.status === "PENDING").length}</h2>
              </div>
            </div>
            <div className="sa-card">
              <h2 style={{ color: "var(--edu-green)", marginBottom: "1rem" }}>
                Recent Activity
              </h2>
              {audit.length === 0 && <p style={{ color: "var(--textMut)", fontSize: "0.875rem" }}>No activity yet.</p>}
              {audit.slice(0, 5).map((a) => (
                <p key={a.id} style={{ fontSize: "0.875rem" }}>
                  {a.at.toLocaleString()} - {a.action}
                </p>
              ))}
            </div>
          </>
        );
      case "schools":
        return (
          <div className="sa-card">
            <h2 style={{ color: "var(--edu-green)", marginBottom: "1rem" }}>
              Schools
            </h2>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>School</th>
                  <th>County</th>
                  <th>Plan</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.county}</td>
                    <td>{s.plan}</td>
                    <td>{s.students}</td>
                    <td>
                      <span className={`sa-badge ${s.status.toLowerCase()}`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ display: "flex", gap: "0.5rem" }}>
                      {s.status === "PENDING" && (
                        <button
                          className="sa-btn primary"
                          onClick={() => handleSchoolAction(s.id, "ACTIVE")}
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                      )}
                      {s.status === "PENDING" && (
                        <button
                          className="sa-btn danger"
                          onClick={() => handleSchoolAction(s.id, "REJECTED")}
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      )}
                      {s.status === "ACTIVE" && (
                        <button
                          className="sa-btn outline"
                          onClick={() => handleSchoolAction(s.id, "SUSPENDED")}
                        >
                          <Pause size={14} />
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "users":
        return (
          <div className="sa-card">
            <h2 style={{ color: "var(--edu-green)", marginBottom: "1rem" }}>
              All Users
            </h2>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>School</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.school}</td>
                    <td>
                      <span className={`sa-badge ${u.status.toLowerCase()}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.status === "ACTIVE" ? (
                        <button
                          className="sa-btn outline"
                          onClick={() => handleUserStatus(u.id, "SUSPENDED")}
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          className="sa-btn primary"
                          onClick={() => handleUserStatus(u.id, "ACTIVE")}
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "audit":
        return (
          <div className="sa-card">
            <h2 style={{ color: "var(--edu-green)", marginBottom: "1rem" }}>
              Audit Trail
            </h2>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id}>
                    <td>{a.at.toLocaleString()}</td>
                    <td>{a.action}</td>
                    <td>{a.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <div className="sa-card">Settings coming soon</div>;
    }
  };

  return (
    <div className="sa-container">
      <aside className={`sa-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sa-sidebar-header">
          <h1 className="sa-logo">
            <span className="edu">Edu</span>
            <span className="nex">Nex</span>
          </h1>
          <button
            className="sa-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="sa-nav">
          {menuItems.map((item) => (
            <div
              key={item.key}
              className={`sa-nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.key);
                setSidebarOpen(false);
              }}
            >
              <item.icon size={18} />
              {item.name}
            </div>
          ))}
        </nav>
        <button className="sa-logout" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {sidebarOpen && (
        <div
          className="sa-overlay show"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="sa-main">
        <header className="sa-topbar">
          <button className="sa-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield size={18} color="var(--nex-gold)" /> Super Admin
          </div>
        </header>

        <main className="sa-content">{renderContent()}</main>
      </div>
    </div>
  );
}
