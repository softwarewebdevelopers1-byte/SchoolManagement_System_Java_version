import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Filter, MoreVertical, Search } from "lucide-react";
import { superAdminApi } from "../../lib/api";

const statusColors: Record<string, string> = {
  ACTIVE: "#16a34a",
  PENDING_APPROVAL: "#c084fc",
  PENDING: "#c084fc",
  REJECTED: "#ef4444",
  REJECTED_APPROVAL: "#ef4444",
  SUSPENDED: "#f59e0b",
  INACTIVE: "#f59e0b",
  EXPIRED: "#6b7280",
};

const formatStatus = (value?: string) => {
  if (!value) return "PENDING";
  const normalized = String(value).trim().toUpperCase();
  if (normalized === "PENDING_APPROVAL") return "PENDING";
  if (normalized === "REJECTED_APPROVAL") return "REJECTED";
  if (normalized === "INACTIVE") return "SUSPENDED";
  if (normalized === "NOT_PAID") return "EXPIRED";
  return normalized;
};

const getStatusBadgeStyle = (status: string) => ({
  background: `${statusColors[status] || "#64748b"}22`,
  color: statusColors[status] || "#64748b",
  borderColor: `${statusColors[status] || "#64748b"}55`,
});

export default function SuperAdminSchools() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name");
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const loadSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminApi.getSchools();
      setSchools(Array.isArray(response) ? response : response?.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSchools();
  }, []);

  const filteredAndSortedSchools = useMemo(() => {
    let filtered = schools.filter((school) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (school.schoolName || "").toLowerCase().includes(q) ||
        (school.schoolCode || "").toLowerCase().includes(q) ||
        (school.email || "").toLowerCase().includes(q);
      const status = formatStatus(school.status);
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.schoolName || "").localeCompare(b.schoolName || "");
        case "status":
          return formatStatus(a.status).localeCompare(formatStatus(b.status));
        case "recent":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [schools, search, statusFilter, sortBy]);

  const updateSchoolStatus = async (schoolId: string, newStatus: string) => {
    try {
      await superAdminApi.updateSchoolStatus(schoolId, newStatus);
      await loadSchools();
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to update school status");
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>Loading schools...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>Platform management</div>
          <h1 style={styles.title}>School Directory</h1>
          <p style={styles.subtitle}>{filteredAndSortedSchools.length} schools</p>
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <Search size={14} color="#5d6d66" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, or email"
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <Filter size={14} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
            <option value="name">Sort by name</option>
            <option value="status">Sort by status</option>
            <option value="recent">Sort by recent</option>
          </select>
        </div>
      </div>

      <div style={styles.tableContainer}>
        {filteredAndSortedSchools.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📚</div>
            <div style={styles.emptyText}>No schools found</div>
            <div style={styles.emptySubtext}>Try adjusting your filters</div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>School</th>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Admin Email</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Staff</th>
                <th style={styles.th}>Students</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedSchools.map((school) => {
                const status = formatStatus(school.status);
                const joinDate = new Date(school.createdAt || new Date()).toLocaleDateString();
                return (
                  <tr key={school.schoolId || school.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.schoolCell}>
                        <div style={styles.schoolBadge}>{(school.schoolName || "S").slice(0, 1).toUpperCase()}</div>
                        <div>
                          <button
                            onClick={() => navigate(`/edunex-org/superAdmin/schools/${school.schoolId}`)}
                            style={styles.schoolNameLink}
                          >
                            {school.schoolName}
                          </button>
                          <div style={styles.metaText}>{school.address || "No address"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.code}>{school.schoolCode}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.metaText}>{school.email || "N/A"}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...getStatusBadgeStyle(status) }}>{status}</span>
                    </td>
                    <td style={styles.td}>{school.totalStaff ?? 0}</td>
                    <td style={styles.td}>{school.totalStudents ?? 0}</td>
                    <td style={styles.td}>{joinDate}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => {
                          setSelectedSchool(school);
                          setShowModal(true);
                        }}
                        style={styles.actionButton}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selectedSchool && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedSchool.schoolName}</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeButton}>
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>School Code</div>
                <div style={styles.detailValue}>{selectedSchool.schoolCode}</div>
              </div>
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Admin Email</div>
                <div style={styles.detailValue}>{selectedSchool.email}</div>
              </div>
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Current Status</div>
                <span style={{ ...styles.badge, ...getStatusBadgeStyle(formatStatus(selectedSchool.status)) }}>
                  {formatStatus(selectedSchool.status)}
                </span>
              </div>
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Address</div>
                <div style={styles.detailValue}>{selectedSchool.address || "No address provided"}</div>
              </div>
            </div>

            <div style={styles.modalActions}>
              {formatStatus(selectedSchool.status) !== "ACTIVE" && (
                <button
                  onClick={() => updateSchoolStatus(selectedSchool.schoolId, "ACTIVE")}
                  style={{ ...styles.actionBtnPrimary }}
                >
                  Approve
                </button>
              )}
              {formatStatus(selectedSchool.status) !== "REJECTED" && (
                <button
                  onClick={() => updateSchoolStatus(selectedSchool.schoolId, "REJECTED_APPROVAL")}
                  style={styles.actionBtnDanger}
                >
                  Reject
                </button>
              )}
              <button onClick={() => setShowModal(false)} style={styles.actionBtnSecondary}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gap: 24,
  },
  header: {
    paddingBottom: 16,
    borderBottom: "1px solid rgba(15,46,34,0.08)",
  },
  kicker: {
    fontSize: 12,
    color: "#5d6d66",
    letterSpacing: 0.12,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: 32,
    letterSpacing: -0.05,
    color: "#0f2e22",
  },
  subtitle: {
    margin: "8px 0 0 0",
    fontSize: 14,
    color: "#5d6d66",
  },
  controls: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 16,
    alignItems: "center",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(15,46,34,0.12)",
    borderRadius: 12,
    background: "#fff",
    padding: "10px 12px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    fontSize: 14,
    color: "#0f2e22",
  },
  filters: {
    display: "flex",
    gap: 12,
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(15,46,34,0.12)",
    borderRadius: 12,
    background: "#fff",
    padding: "10px 12px",
    color: "#5d6d66",
  },
  select: {
    border: "1px solid rgba(15,46,34,0.12)",
    borderRadius: 10,
    padding: "10px 12px",
    background: "#fff",
    fontSize: 14,
    color: "#0f2e22",
    fontWeight: 600,
  },
  tableContainer: {
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 20,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.08,
    color: "#5d6d66",
    borderBottom: "1px solid rgba(15,46,34,0.08)",
    fontWeight: 700,
  },
  tr: {
    borderBottom: "1px solid rgba(15,46,34,0.04)",
  },
  td: {
    padding: "14px 16px",
    verticalAlign: "middle",
    fontSize: 14,
  },
  schoolCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  schoolBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "#ebf4ff",
    color: "#153f2f",
    fontWeight: 800,
    fontSize: 14,
  },
  schoolName: {
    fontWeight: 700,
    color: "#0f2e22",
  },
  schoolNameLink: {
    background: "none",
    border: "none",
    padding: 0,
    fontWeight: 700,
    color: "#0366d6",
    cursor: "pointer",
    textDecoration: "none",
    fontSize: 14,
  },
  metaText: {
    color: "#5d6d66",
    fontSize: 12,
  },
  code: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: 700,
    color: "#0f2e22",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    border: "1px solid",
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  actionButton: {
    border: "none",
    background: "rgba(15,46,34,0.04)",
    color: "#0f2e22",
    width: 32,
    height: 32,
    borderRadius: 8,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    transition: "all 0.2s ease",
  },
  emptyState: {
    padding: 60,
    textAlign: "center",
    color: "#5d6d66",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f2e22",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.3)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#fff",
    borderRadius: 20,
    maxWidth: 500,
    width: "90vw",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    borderBottom: "1px solid rgba(15,46,34,0.08)",
  },
  modalTitle: {
    margin: 0,
    fontSize: 20,
    color: "#0f2e22",
  },
  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: 20,
    cursor: "pointer",
    color: "#5d6d66",
  },
  modalBody: {
    padding: 24,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#5d6d66",
    textTransform: "uppercase",
    letterSpacing: 0.08,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    color: "#0f2e22",
    fontWeight: 600,
  },
  modalActions: {
    display: "flex",
    gap: 12,
    padding: 24,
    borderTop: "1px solid rgba(15,46,34,0.08)",
  },
  actionBtnPrimary: {
    flex: 1,
    padding: "10px 16px",
    border: "none",
    background: "#16a34a",
    color: "#fff",
    fontWeight: 700,
    borderRadius: 10,
    cursor: "pointer",
  },
  actionBtnDanger: {
    flex: 1,
    padding: "10px 16px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: 700,
    borderRadius: 10,
    cursor: "pointer",
  },
  actionBtnSecondary: {
    flex: 1,
    padding: "10px 16px",
    border: "1px solid rgba(15,46,34,0.12)",
    background: "transparent",
    color: "#0f2e22",
    fontWeight: 700,
    borderRadius: 10,
    cursor: "pointer",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 600,
  },
  loadingCard: {
    maxWidth: 500,
    margin: "40vh auto 0",
    background: "#fff",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 16px 40px rgba(16,36,28,0.08)",
    textAlign: "center",
    color: "#0f2e22",
    fontWeight: 700,
  },
};
