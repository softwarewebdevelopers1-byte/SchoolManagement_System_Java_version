import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Mail,
  Search,
  BarChart3,
  Shield,
  Bell,
  DollarSign,
  Ban,
  Eye,
  GraduationCap,
  Loader2,
} from "lucide-react";
import "./SuperAdmin.css";

interface School {
  id: number;
  schoolCode: string;
  schoolName: string;
  schoolEmail: string;
  schoolPhone: string;
  schoolAddress: string;
  motto: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  createdAt: string;
  studentCount: number;
  adminEmail: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "ACTIVE" | "SUSPENDED"
  >("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    const res = await fetch("/api/superadmin/schools");
    const data = await res.json();
    setSchools(data);
    setLoading(false);
  };

  const handleApprove = async (schoolCode: string) => {
    await fetch(`/api/superadmin/schools/${schoolCode}/approve`, {
      method: "POST",
    });
    await sendEmail(schoolCode, "APPROVED");
    fetchSchools();
  };

  const handleSuspend = async (schoolCode: string) => {
    await fetch(`/api/superadmin/schools/${schoolCode}/suspend`, {
      method: "POST",
    });
    await sendEmail(schoolCode, "SUSPENDED");
    fetchSchools();
  };

  const sendEmail = async (schoolCode: string, type: string) => {
    await fetch("/api/superadmin/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolCode, type }),
    });
  };

  const filteredSchools = schools.filter(
    (s) =>
      (filter === "ALL" || s.status === filter) &&
      (s.schoolName.toLowerCase().includes(search.toLowerCase()) ||
        s.schoolCode.toLowerCase().includes(search.toLowerCase())),
  );

  const stats = {
    total: schools.length,
    pending: schools.filter((s) => s.status === "PENDING").length,
    active: schools.filter((s) => s.status === "ACTIVE").length,
    students: schools.reduce((acc, s) => acc + s.studentCount, 0),
  };

  return (
    <div className="super-page">
      {" "}
      {/* 1. OPEN div */}
      {/* Sidebar */}
      <aside className="super-sidebar">
        {" "}
        {/* 2. OPEN aside */}
        <div className="super-brand">
          <Shield size={28} />
          <h1>EduNex</h1>
        </div>
        <nav>
          {" "}
          {/* 3. OPEN nav */}
          <button className="super-nav-item active">
            <BarChart3 size={18} /> Dashboard
          </button>
          <button className="super-nav-item">
            <Building2 size={18} /> All Schools
          </button>
          <button className="super-nav-item">
            <Users size={18} /> All Users
          </button>
          <button className="super-nav-item">
            <Mail size={18} /> Send Broadcast
          </button>
          <button className="super-nav-item">
            <DollarSign size={18} /> Billing
          </button>
        </nav>{" "}
        {/* 3. CLOSE nav */}
      </aside>{" "}
      {/* 2. CLOSE aside */}
      {/* Main Content */}
      <main className="super-main">
        <header className="super-header">
          <h2>Super Admin Dashboard</h2>
          <div className="super-header-actions">
            <Bell size={20} />
            <div className="super-profile">SA</div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="super-stats-grid">
          <div className="super-stat-card">
            <Building2 />
            <div>
              <p>Total Schools</p>
              <h3>{stats.total}</h3>
            </div>
          </div>
          <div className="super-stat-card amber">
            <CheckCircle />
            <div>
              <p>Pending Approval</p>
              <h3>{stats.pending}</h3>
            </div>
          </div>
          <div className="super-stat-card green">
            <Users />
            <div>
              <p>Active Schools</p>
              <h3>{stats.active}</h3>
            </div>
          </div>
          <div className="super-stat-card blue">
            <GraduationCap />
            <div>
              <p>Total Students</p>
              <h3>{stats.students.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Schools Table */}
        <div className="super-card">
          <div className="super-card-header">
            <h3>School Management</h3>
            <div className="super-tools">
              <div className="super-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search school or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="super-select"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loader2 className="super-loader" />
          ) : (
            <table className="super-table">
              <thead>
                <tr>
                  <th>School</th>
                  <th>Code</th>
                  <th>Admin</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map((school) => (
                  <tr key={school.id}>
                    <td>
                      <div className="super-school-cell">
                        <Building2 size={18} />
                        <div>
                          <strong>{school.schoolName}</strong>
                          <p>{school.schoolEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="super-code">{school.schoolCode}</span>
                    </td>
                    <td>{school.adminEmail}</td>
                    <td>{school.studentCount}</td>
                    <td>
                      <span
                        className={`super-badge ${school.status.toLowerCase()}`}
                      >
                        {school.status}
                      </span>
                    </td>
                    <td>{new Date(school.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="super-actions">
                        <button
                          className="super-icon-btn"
                          onClick={() => setSelectedSchool(school)}
                        >
                          <Eye size={16} />
                        </button>
                        {school.status === "PENDING" && (
                          <button
                            className="super-icon-btn approve"
                            onClick={() => handleApprove(school.schoolCode)}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {school.status === "ACTIVE" && (
                          <button
                            className="super-icon-btn suspend"
                            onClick={() => handleSuspend(school.schoolCode)}
                          >
                            <Ban size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      {/* School Detail Modal */}
      {selectedSchool && (
        <div
          className="super-modal-overlay"
          onClick={() => setSelectedSchool(null)}
        >
          <div className="super-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedSchool.schoolName}</h3>
            <p>
              <strong>Code:</strong> {selectedSchool.schoolCode}
            </p>
            <p>
              <strong>Email:</strong> {selectedSchool.schoolEmail}
            </p>
            <p>
              <strong>Phone:</strong> {selectedSchool.schoolPhone}
            </p>
            <p>
              <strong>Address:</strong> {selectedSchool.schoolAddress}
            </p>
            <p>
              <strong>Motto:</strong> "{selectedSchool.motto}"
            </p>
            <button
              onClick={() => setSelectedSchool(null)}
              className="super-btn-close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div> /* 1. CLOSE div */
  );
};

export default SuperAdminDashboard;
