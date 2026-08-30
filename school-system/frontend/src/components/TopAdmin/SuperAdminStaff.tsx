import React, { useEffect, useMemo, useState } from "react";
import { Filter, MoreVertical, Search } from "lucide-react";
import { superAdminApi } from "../../lib/api";

const statusColors: Record<string, string> = {
  ACTIVE: "#16a34a",
  INACTIVE: "#f59e0b",
  PENDING: "#c084fc",
  SUSPENDED: "#ef4444",
};

const formatStatus = (value?: string) => {
  if (!value) return "PENDING";
  return String(value).trim().toUpperCase();
};

const getStatusBadgeStyle = (status: string) => ({
  background: `${statusColors[status] || "#64748b"}22`,
  color: statusColors[status] || "#64748b",
  borderColor: `${statusColors[status] || "#64748b"}55`,
});

export default function SuperAdminStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminApi.getPlatformStaff();
      setStaff(Array.isArray(response) ? response : response?.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStaff();
  }, []);

  const roles = useMemo(() => {
    const uniqueRoles = new Set<string>();
    staff.forEach((member) => {
      if (member.roles) {
        const rolesArr = Array.isArray(member.roles) ? member.roles : [member.roles];
        rolesArr.forEach((r: string) => uniqueRoles.add(r));
      }
    });
    return Array.from(uniqueRoles).sort();
  }, [staff]);

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (member.firstName || "").toLowerCase().includes(q) ||
        (member.lastName || "").toLowerCase().includes(q) ||
        (member.email || "").toLowerCase().includes(q) ||
        (member.schoolName || "").toLowerCase().includes(q);

      const status = formatStatus(member.status);
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;

      const memberRoles = Array.isArray(member.roles) ? member.roles : [member.roles];
      const matchesRole = roleFilter === "ALL" || memberRoles.includes(roleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [staff, search, statusFilter, roleFilter]);

  const updateStaffStatus = async (userId: string, newStatus: string) => {
    try {
      await superAdminApi.updateUserStatus(userId, newStatus);
      await loadStaff();
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to update staff status");
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>Loading staff...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>Platform management</div>
          <h1 style={styles.title}>Staff Directory</h1>
          <p style={styles.subtitle}>{filteredStaff.length} staff members</p>
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <Search size={14} color="#5d6d66" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or school"
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <Filter size={14} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.select}>
            <option value="ALL">All roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.tableContainer}>
        {filteredStaff.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <div style={styles.emptyText}>No staff members found</div>
            <div style={styles.emptySubtext}>Try adjusting your filters</div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Staff</th>
                <th style={styles.th}>School</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => {
                const status = formatStatus(member.status);
                const joinDate = new Date(member.registeredDate || member.createdAt || Date.now()).toLocaleDateString();
                const roles = Array.isArray(member.roles) ? member.roles : [member.roles];
                return (
                  <tr key={member.userId || member.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.userBadge}>{(member.firstName || member.email || "U").slice(0, 1).toUpperCase()}</div>
                        <div>
                          <div style={styles.userName}>
                            {member.firstName || ""} {member.lastName || ""}
                          </div>
                          <div style={styles.metaText}>{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{member.schoolName || "No school"}</td>
                    <td style={styles.td}>
                      <div style={styles.rolesSection}>
                        {roles.map((role: string) => (
                          <span key={role} style={styles.roleTag}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...getStatusBadgeStyle(status) }}>{status}</span>
                    </td>
                    <td style={styles.td}>{joinDate}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => {
                          setSelectedMember(member);
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

      {showModal && selectedMember && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {selectedMember.firstName} {selectedMember.lastName}
              </h2>
              <button onClick={() => setShowModal(false)} style={styles.closeButton}>
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Email</div>
                <div style={styles.detailValue}>{selectedMember.email}</div>
              </div>
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>School</div>
                <div style={styles.detailValue}>{selectedMember.schoolName || "No school assigned"}</div>
              </div>
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Roles</div>
                <div style={styles.rolesSection}>
                  {(Array.isArray(selectedMember.roles) ? selectedMember.roles : [selectedMember.roles]).map(
                    (role: string) => (
                      <span key={role} style={styles.roleTag}>
                        {role}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Current Status</div>
                <span style={{ ...styles.badge, ...getStatusBadgeStyle(formatStatus(selectedMember.status)) }}>
                  {formatStatus(selectedMember.status)}
                </span>
              </div>
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Joined</div>
                <div style={styles.detailValue}>{new Date(selectedMember.createdAt || new Date()).toLocaleDateString()}</div>
              </div>
            </div>

            <div style={styles.modalActions}>
              {formatStatus(selectedMember.status) !== "ACTIVE" && (
                <button
                  onClick={() => updateStaffStatus(selectedMember.userId, "ACTIVE")}
                  style={styles.actionBtnPrimary}
                >
                  Activate
                </button>
              )}
              {formatStatus(selectedMember.status) !== "INACTIVE" && (
                <button
                  onClick={() => updateStaffStatus(selectedMember.userId, "INACTIVE")}
                  style={styles.actionBtnDanger}
                >
                  Deactivate
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
    overflowX: "auto",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 16,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 760,
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(15,46,34,0.08)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.08,
    color: "#5d6d66",
    background: "rgba(15,46,34,0.02)",
  },
  tr: {
    borderBottom: "1px solid rgba(15,46,34,0.06)",
  },
  td: {
    padding: "14px 16px",
    fontSize: 14,
    color: "#0f2e22",
    verticalAlign: "top",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  userBadge: {
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
  actionButton: {
    border: "none",
    background: "transparent",
    color: "#5d6d66",
    width: 32,
    height: 32,
    borderRadius: 8,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    transition: "all 0.2s ease",
  },
  cardBody: {
    padding: 16,
  },
  userName: {
    fontWeight: 700,
    color: "#0f2e22",
    marginBottom: 4,
  },
  metaText: {
    color: "#5d6d66",
    fontSize: 12,
    marginBottom: 12,
  },
  schoolTag: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 600,
    color: "#153f2f",
    background: "#ebf4ff",
    padding: "4px 8px",
    borderRadius: 6,
    marginBottom: 12,
  },
  rolesSection: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  roleTag: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#c9963d",
    background: "#fffbeb",
    padding: "4px 8px",
    borderRadius: 4,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTop: "1px solid rgba(15,46,34,0.04)",
  },
  joinedLabel: {
    fontSize: 11,
    color: "#5d6d66",
    textTransform: "uppercase",
    letterSpacing: 0.08,
  },
  joinedValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0f2e22",
    marginTop: 4,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    border: "1px solid",
    padding: "4px 8px",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  emptyState: {
    gridColumn: "1 / -1",
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
