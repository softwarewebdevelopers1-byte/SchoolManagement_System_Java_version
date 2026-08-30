import React, { useEffect, useMemo, useState } from "react";
import { Copy, Filter, MoreVertical, Search, Trash2 } from "lucide-react";
import { superAdminApi } from "../../lib/api";

const statusColors: Record<string, string> = {
  PENDING: "#c084fc",
  USED: "#16a34a",
  EXPIRED: "#6b7280",
  REVOKED: "#ef4444",
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

export default function SuperAdminInvitations() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInvite, setSelectedInvite] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminApi.getInvitations();
      setInvitations(Array.isArray(response) ? response : response?.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInvitations();
  }, []);

  const filteredInvitations = useMemo(() => {
    return invitations.filter((invite) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (invite.schoolName || "").toLowerCase().includes(q) ||
        (invite.email || "").toLowerCase().includes(q);

      const status = formatStatus(invite.invitationStatus || invite.status);
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invitations, search, statusFilter]);

  const copyToClipboard = async (link?: string) => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy link");
    }
  };

  const revokeInvitation = async (inviteId: string) => {
    try {
      await superAdminApi.revokeInvitation(inviteId);
      await loadInvitations();
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to revoke invitation");
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>Loading invitations...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>Platform management</div>
          <h1 style={styles.title}>Invitation Management</h1>
          <p style={styles.subtitle}>{filteredInvitations.length} invitations</p>
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <Search size={14} color="#5d6d66" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by school or email"
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <Filter size={14} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="USED">Used</option>
              <option value="EXPIRED">Expired</option>
              <option value="REVOKED">Revoked</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        {filteredInvitations.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>✉️</div>
            <div style={styles.emptyText}>No invitations found</div>
            <div style={styles.emptySubtext}>Try adjusting your filters</div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>School</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Expires</th>
                <th style={styles.th}>Used</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvitations.map((invite) => {
                const status = formatStatus(invite.invitationStatus || invite.status);
                const createdDate = new Date(invite.createdAt || new Date()).toLocaleDateString();
                const expiresDate = new Date(invite.expirationTime || new Date()).toLocaleDateString();
                const usedDate = invite.usedAt ? new Date(invite.usedAt).toLocaleDateString() : "—";

                return (
                  <tr key={invite.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.schoolCell}>
                        <div style={styles.schoolBadge}>
                          {(invite.schoolName || "S").slice(0, 1).toUpperCase()}
                        </div>
                        <div style={styles.schoolName}>{invite.schoolName || "School"}</div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.metaText}>{invite.email || "admin@school.com"}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...getStatusBadgeStyle(status) }}>{status}</span>
                    </td>
                    <td style={styles.td}>{createdDate}</td>
                    <td style={styles.td}>{expiresDate}</td>
                    <td style={styles.td}>{usedDate}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => {
                          setSelectedInvite(invite);
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

      {showModal && selectedInvite && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedInvite.schoolName || "Invitation"}</h2>
              <button onClick={() => setShowModal(false)} style={styles.closeButton}>
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Email</div>
                <div style={styles.detailValue}>{selectedInvite.email}</div>
              </div>

              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Status</div>
                <span style={{ ...styles.badge, ...getStatusBadgeStyle(formatStatus(selectedInvite.invitationStatus || selectedInvite.status)) }}>
                  {formatStatus(selectedInvite.invitationStatus || selectedInvite.status)}
                </span>
              </div>

              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Created</div>
                <div style={styles.detailValue}>
                  {new Date(selectedInvite.createdAt || new Date()).toLocaleString()}
                </div>
              </div>

              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Expires</div>
                <div style={styles.detailValue}>
                  {new Date(selectedInvite.expirationTime || new Date()).toLocaleString()}
                </div>
              </div>

              {selectedInvite.usedAt && (
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Used</div>
                  <div style={styles.detailValue}>
                    {new Date(selectedInvite.usedAt).toLocaleString()}
                  </div>
                </div>
              )}

              <div style={styles.detailRow}>
                <div style={styles.detailLabel}>Invite Link</div>
                <div style={styles.linkBox}>
                  <input
                    type="text"
                    value={selectedInvite.link || "No link available"}
                    readOnly
                    style={styles.linkInput}
                  />
                  <button
                    onClick={() => copyToClipboard(selectedInvite.link)}
                    style={styles.copyButton}
                  >
                    <Copy size={14} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {selectedInvite.roleName && (
                <div style={styles.detailRow}>
                  <div style={styles.detailLabel}>Role</div>
                  <div style={styles.roleTag}>{selectedInvite.roleName}</div>
                </div>
              )}
            </div>

            <div style={styles.modalActions}>
              {formatStatus(selectedInvite.invitationStatus || selectedInvite.status) === "PENDING" && (
                <button
                  onClick={() => revokeInvitation(selectedInvite.id)}
                  style={styles.actionBtnDanger}
                >
                  <Trash2 size={16} />
                  Revoke
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
  metaText: {
    color: "#5d6d66",
    fontSize: 12,
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
    maxWidth: 600,
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
  linkBox: {
    display: "flex",
    gap: 8,
  },
  linkInput: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid rgba(15,46,34,0.12)",
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "monospace",
    color: "#0f2e22",
  },
  copyButton: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "8px 12px",
    border: "1px solid rgba(15,46,34,0.12)",
    background: "#f0fdf4",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 12,
    color: "#16a34a",
    cursor: "pointer",
  },
  roleTag: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#c9963d",
    background: "#fffbeb",
    padding: "6px 10px",
    borderRadius: 6,
  },
  modalActions: {
    display: "flex",
    gap: 12,
    padding: 24,
    borderTop: "1px solid rgba(15,46,34,0.08)",
  },
  actionBtnDanger: {
    display: "flex",
    alignItems: "center",
    gap: 8,
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
