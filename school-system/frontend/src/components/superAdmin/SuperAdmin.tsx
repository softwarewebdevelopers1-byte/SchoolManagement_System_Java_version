import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  School,
  Users,
  Link,
  BarChart3,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  Pause,
  Send,
  Shield,
  FileText,
} from "lucide-react";
import "./SuperAdmin.css";
import { api } from "../../lib/api";

type SchoolStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
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
interface AdminInvite {
  id: string;
  email: string;
  school: string;
  token: string;
  expiresAt: Date;
  used: boolean;
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
  { key: "invites", name: "Admin Invites", icon: Link },
  { key: "audit", name: "Audit Log", icon: FileText },
  { key: "settings", name: "Settings", icon: Settings },
];

export default function SuperAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", schoolId: "" });

  const [schools, setSchools] = useState<School[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([
    {
      id: "1",
      action: "Created SuperAdmin account",
      by: "System",
      at: new Date(),
    },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [schoolData, userData] = await Promise.all([
          api.get<any[]>("/superadmin/schools"),
          api.get<any[]>("/superadmin/users/teachers"),
        ]);
        setSchools((schoolData || []).map((school) => ({
          id: school.schoolId,
          name: school.schoolName,
          county: school.address || "-",
          students: school.totalUsers || 0,
          status: school.status === "ACTIVE" ? "ACTIVE" : school.status === "SUSPENDED" ? "SUSPENDED" : school.status === "REJECTED" ? "REJECTED" : "PENDING",
          plan: "-",
        })));
        setUsers((userData || []).map((user) => ({
          id: user.userId,
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
          email: user.email,
          role: (user.roles || []).join(", "),
          school: user.schoolName,
          status: user.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
        })));
      } catch (error) {
        logAction(error instanceof Error ? error.message : "Unable to load super-admin data");
      }
    };
    void loadData();
  }, []);

  const logAction = (action: string) => {
    setAudit((prev) => [
      { id: Date.now().toString(), action, by: "Super Admin", at: new Date() },
      ...prev,
    ]);
  };

  const handleSchoolAction = (id: string, action: SchoolStatus) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: action } : s)),
    );
    logAction(`${action} school ${schools.find((s) => s.id === id)?.name}`);
  };

  const handleUserStatus = (id: string, status: UserStatus) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    logAction(`${status} user ${users.find((u) => u.id === id)?.name}`);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invite = await api.post<any>("/superadmin/invites", inviteForm);
      setInvites((prev) => [{
        id: invite.id,
        email: invite.email,
        school: invite.schoolName,
        token: invite.token,
        expiresAt: new Date(invite.expiresAt),
        used: invite.used,
      }, ...prev]);
      logAction(`Generated admin invite for ${invite.email}`);
      setInviteForm({ email: "", schoolId: "" });
      setShowInviteModal(false);
    } catch (error) {
      logAction(error instanceof Error ? error.message : "Unable to generate invite");
    }
  };

  const renderContent = () => {
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
      case "invites":
        return (
          <div className="sa-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ color: "var(--edu-green)" }}>Admin Invites</h2>
              <button
                className="sa-btn primary"
                onClick={() => setShowInviteModal(true)}
              >
                <Send size={14} />
                Send Invite
              </button>
            </div>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>School</th>
                  <th>Link</th>
                  <th>Expires</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((i) => (
                  <tr key={i.id}>
                    <td>{i.email}</td>
                    <td>{i.school}</td>
                    <td>
                      <code>
                        {window.location.origin}/register/school?token={i.token}
                      </code>
                    </td>
                    <td>{i.expiresAt.toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`sa-badge ${i.used ? "active" : "pending"}`}
                      >
                        {i.used ? "USED" : "PENDING"}
                      </span>
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
        <button className="sa-logout">
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

      {showInviteModal && (
        <div className="sa-modal" onClick={() => setShowInviteModal(false)}>
          <div
            className="sa-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sa-modal-header">
              <h3>Send Admin Invite</h3>
              <button
                className="sa-close-btn"
                onClick={() => setShowInviteModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSendInvite}>
              <div className="sa-form-group">
                <label>Select School</label>
                <select
                  className="sa-input"
                  value={inviteForm.schoolId}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, schoolId: e.target.value })
                  }
                  required
                >
                  <option value="">-- Select --</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sa-form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  className="sa-input"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit" className="sa-btn primary">
                Generate Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
