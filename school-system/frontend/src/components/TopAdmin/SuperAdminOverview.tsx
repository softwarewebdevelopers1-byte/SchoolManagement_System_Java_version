import React, { useEffect, useState } from "react";
import {
  Activity,
  Building2,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  TrendingUp,
  Users,
  X,
  MapPin,
  Quote,
} from "lucide-react";
import { superAdminApi } from "../../lib/api";

interface SchoolForm {
  schoolName: string;
  schoolEmail: string;
  schoolAddress: string;
  phoneNumber: string;
  motto: string;
}

const initialSchoolForm: SchoolForm = {
  schoolName: "",
  schoolEmail: "",
  schoolAddress: "",
  phoneNumber: "",
  motto: "",
};

export default function SuperAdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // School modal state
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolForm, setSchoolForm] = useState<SchoolForm>(initialSchoolForm);
  const [creatingSchool, setCreatingSchool] = useState(false);
  const [schoolSuccess, setSchoolSuccess] = useState<string | null>(null);
  const [schoolError, setSchoolError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await superAdminApi.getPlatformStatistics();

      setStats(response || null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load platform statistics",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, []);

  const openSchoolModal = () => {
    setSchoolForm(initialSchoolForm);
    setSchoolError(null);
    setSchoolSuccess(null);
    setShowSchoolModal(true);
  };

  const closeSchoolModal = () => {
    if (creatingSchool) return;

    setShowSchoolModal(false);
    setSchoolForm(initialSchoolForm);
    setSchoolError(null);
    setSchoolSuccess(null);
  };

  const handleSchoolChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setSchoolForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSchool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSchoolError(null);
    setSchoolSuccess(null);

    // Frontend validation
    if (!schoolForm.schoolName.trim()) {
      setSchoolError("School name is required.");
      return;
    }

    if (!schoolForm.schoolEmail.trim()) {
      setSchoolError("School email is required.");
      return;
    }

    if (!schoolForm.schoolAddress.trim()) {
      setSchoolError("School address is required.");
      return;
    }

    if (!schoolForm.phoneNumber.trim()) {
      setSchoolError("Phone number is required.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(schoolForm.schoolEmail.trim())) {
      setSchoolError("Please enter a valid school email address.");
      return;
    }

    try {
      setCreatingSchool(true);

      /*
       * This calls:
       *
       * POST /api/schools/create-school
       *
       * with:
       * {
       *   schoolName,
       *   schoolEmail,
       *   schoolAddress,
       *   phoneNumber,
       *   motto
       * }
       */
      const response = await superAdminApi.createSchool({
        schoolName: schoolForm.schoolName.trim(),
        schoolEmail: schoolForm.schoolEmail.trim(),
        schoolAddress: schoolForm.schoolAddress.trim(),
        phoneNumber: schoolForm.phoneNumber.trim(),
        motto: schoolForm.motto.trim(),
      });

      console.log("School created:", response);

      setSchoolSuccess(response?.message || "School created successfully.");

      // Refresh dashboard statistics
      await loadStats();

      // Close modal after a short success display
      setTimeout(() => {
        setShowSchoolModal(false);
        setSchoolForm(initialSchoolForm);
        setSchoolSuccess(null);
      }, 1200);
    } catch (err: any) {
      console.error("Create school error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      setSchoolError(
        backendMessage || "Failed to create school. Please try again.",
      );
    } finally {
      setCreatingSchool(false);
    }
  };

  const statCards = [
    {
      label: "Total Schools",
      value: stats?.totalSchools ?? 0,
      icon: Building2,
      color: "#163325",
    },
    {
      label: "Active Schools",
      value: stats?.activeSchools ?? 0,
      icon: CheckCircle2,
      color: "#16a34a",
    },
    {
      label: "Pending Approval",
      value: stats?.pendingSchools ?? 0,
      icon: Activity,
      color: "#c084fc",
    },
    {
      label: "Total Staff",
      value: stats?.totalStaff ?? 0,
      icon: Users,
      color: "#0ea5e9",
    },
    {
      label: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: GraduationCap,
      color: "#f59e0b",
    },
    {
      label: "Recent Invitations",
      value: stats?.recentInvitations?.length ?? 0,
      icon: Mail,
      color: "#ec4899",
    },
  ];

  const getRecentActivity = (): {
    label: string;
    value: string;
    color: string;
  }[] => [
    {
      label: "Recent Registrations",
      value: String(stats?.recentRegistrations ?? 0),
      color: "#16a34a",
    },
    {
      label: "Pending Schools",
      value: String(stats?.pendingSchools ?? 0),
      color: "#c084fc",
    },
    {
      label: "Active Staff",
      value: String(stats?.activeStaff ?? 0),
      color: "#0ea5e9",
    },
    {
      label: "Suspended Schools",
      value: String(stats?.suspendedSchools ?? 0),
      color: "#ef4444",
    },
  ];

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>Loading platform overview...</div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.page}>
        <header style={styles.header}>
          <div>
            <div style={styles.kicker}>Welcome back</div>
            <h1 style={styles.title}>Platform Overview</h1>
          </div>

          <div style={styles.lastUpdated}>
            Last updated: {new Date().toLocaleString()}
          </div>
        </header>

        {error && <div style={styles.error}>{error}</div>}

        {/* Statistics */}
        <section style={styles.metricsGrid}>
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={styles.metricCard}>
              <div
                style={{
                  ...styles.metricIconWrap,
                  background: `${color}22`,
                }}
              >
                <Icon size={20} color={color} />
              </div>

              <div>
                <div style={styles.metricValue}>{value}</div>

                <div style={styles.metricLabel}>{label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Activity */}
        <section style={styles.activityGrid}>
          {getRecentActivity().map(({ label, value, color }) => (
            <div key={label} style={styles.activityCard}>
              <div style={styles.activityLabel}>{label}</div>

              <div
                style={{
                  ...styles.activityValue,
                  color,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Quick Actions</h2>

            <TrendingUp size={20} color="#163325" />
          </div>

          <div style={styles.actionGrid}>
            {/* ONBOARD SCHOOL */}
            <button
              type="button"
              style={styles.actionButton}
              onClick={openSchoolModal}
            >
              <div style={styles.actionIcon}>
                <Plus size={21} />
              </div>

              <div>
                <div style={styles.actionTitle}>Onboard New School</div>

                <div style={styles.actionDesc}>Create school account</div>
              </div>
            </button>

            <button type="button" style={styles.actionButton}>
              <div style={styles.actionIcon}>👥</div>

              <div>
                <div style={styles.actionTitle}>Review Pending Schools</div>

                <div style={styles.actionDesc}>Approve or reject</div>
              </div>
            </button>

            <button type="button" style={styles.actionButton}>
              <div style={styles.actionIcon}>📊</div>

              <div>
                <div style={styles.actionTitle}>View Analytics</div>

                <div style={styles.actionDesc}>Platform insights</div>
              </div>
            </button>

            <button type="button" style={styles.actionButton}>
              <div style={styles.actionIcon}>⚙️</div>

              <div>
                <div style={styles.actionTitle}>Platform Settings</div>

                <div style={styles.actionDesc}>Configure system</div>
              </div>
            </button>
          </div>
        </section>
      </div>

      {/* =========================================================
          ONBOARD SCHOOL MODAL
         ========================================================= */}
      {showSchoolModal && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeSchoolModal();
            }
          }}
        >
          <div style={styles.modal}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalKicker}>SCHOOL ONBOARDING</div>

                <h2 style={styles.modalTitle}>Onboard New School</h2>

                <p style={styles.modalSubtitle}>
                  Create a school profile on the Edunex platform.
                </p>
              </div>

              <button
                type="button"
                onClick={closeSchoolModal}
                disabled={creatingSchool}
                style={styles.closeButton}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Success */}
            {schoolSuccess && (
              <div style={styles.success}>
                <CheckCircle2 size={18} />
                <span>{schoolSuccess}</span>
              </div>
            )}

            {/* Error */}
            {schoolError && (
              <div style={styles.modalError}>
                <Activity size={18} />
                <span>{schoolError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateSchool}>
              <div style={styles.formGrid}>
                {/* School Name */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    School Name
                    <span style={styles.required}>*</span>
                  </label>

                  <div style={styles.inputWrapper}>
                    <Building2 size={18} style={styles.inputIcon} />

                    <input
                      type="text"
                      name="schoolName"
                      value={schoolForm.schoolName}
                      onChange={handleSchoolChange}
                      placeholder="e.g. Rongo Academy"
                      style={styles.input}
                      disabled={creatingSchool}
                      autoComplete="organization"
                    />
                  </div>
                </div>

                {/* School Email */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    School Email
                    <span style={styles.required}>*</span>
                  </label>

                  <div style={styles.inputWrapper}>
                    <Mail size={18} style={styles.inputIcon} />

                    <input
                      type="email"
                      name="schoolEmail"
                      value={schoolForm.schoolEmail}
                      onChange={handleSchoolChange}
                      placeholder="admin@school.ac.ke"
                      style={styles.input}
                      disabled={creatingSchool}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Contact / Phone Number
                    <span style={styles.required}>*</span>
                  </label>

                  <div style={styles.inputWrapper}>
                    <Phone size={18} style={styles.inputIcon} />

                    <input
                      type="tel"
                      name="phoneNumber"
                      value={schoolForm.phoneNumber}
                      onChange={handleSchoolChange}
                      placeholder="e.g. 0712 345 678"
                      style={styles.input}
                      disabled={creatingSchool}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Address */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    School Address
                    <span style={styles.required}>*</span>
                  </label>

                  <div style={styles.inputWrapper}>
                    <MapPin size={18} style={styles.inputIcon} />

                    <input
                      type="text"
                      name="schoolAddress"
                      value={schoolForm.schoolAddress}
                      onChange={handleSchoolChange}
                      placeholder="e.g. Rongo, Migori County"
                      style={styles.input}
                      disabled={creatingSchool}
                      autoComplete="street-address"
                    />
                  </div>
                </div>

                {/* Motto */}
                <div
                  style={{
                    ...styles.field,
                    gridColumn: "1 / -1",
                  }}
                >
                  <label style={styles.label}>
                    School Motto
                    <span style={styles.optional}>Optional</span>
                  </label>

                  <div
                    style={{
                      ...styles.inputWrapper,
                      alignItems: "flex-start",
                    }}
                  >
                    <Quote
                      size={18}
                      style={{
                        ...styles.inputIcon,
                        top: 15,
                      }}
                    />

                    <textarea
                      name="motto"
                      value={schoolForm.motto}
                      onChange={handleSchoolChange}
                      placeholder="e.g. Excellence Through Education"
                      style={styles.textarea}
                      disabled={creatingSchool}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={closeSchoolModal}
                  disabled={creatingSchool}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingSchool}
                  style={styles.submitButton}
                >
                  {creatingSchool ? (
                    <>
                      <span style={styles.spinner} />
                      Creating School...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Create School
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gap: 24,
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },

  kicker: {
    fontSize: 12,
    color: "#5d6d66",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  title: {
    margin: 0,
    fontSize: 32,
    letterSpacing: "-0.05em",
    color: "#0f2e22",
  },

  lastUpdated: {
    fontSize: 13,
    color: "#5d6d66",
    background: "rgba(22, 51, 37, 0.04)",
    padding: "8px 12px",
    borderRadius: 8,
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },

  metricCard: {
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 18,
    padding: 18,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  metricIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },

  metricValue: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.05em",
    color: "#0f2e22",
  },

  metricLabel: {
    color: "#4b5a54",
    fontSize: 13,
    marginTop: 4,
  },

  activityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },

  activityCard: {
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 16,
    padding: 16,
  },

  activityLabel: {
    fontSize: 12,
    color: "#5d6d66",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
  },

  activityValue: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.05em",
  },

  card: {
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 20,
    padding: 24,
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  cardTitle: {
    margin: 0,
    fontSize: 20,
    color: "#0f2e22",
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },

  actionButton: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 16,
    border: "1px solid rgba(15,46,34,0.08)",
    borderRadius: 14,
    background: "rgba(22, 51, 37, 0.02)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
  },

  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "#c9963d",
    color: "#fff",
    fontWeight: 800,
    fontSize: 20,
    flexShrink: 0,
  },

  actionTitle: {
    fontWeight: 700,
    color: "#0f2e22",
    fontSize: 14,
  },

  actionDesc: {
    fontSize: 12,
    color: "#5d6d66",
    marginTop: 4,
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

  /* Modal */

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(7, 25, 17, 0.58)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: 24,
    boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
    padding: 28,
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 24,
  },

  modalKicker: {
    color: "#c9963d",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.14em",
    marginBottom: 7,
  },

  modalTitle: {
    margin: 0,
    color: "#163325",
    fontSize: 25,
    fontWeight: 800,
  },

  modalSubtitle: {
    margin: "7px 0 0",
    color: "#6b7771",
    fontSize: 13,
  },

  closeButton: {
    width: 38,
    height: 38,
    border: "none",
    borderRadius: 10,
    background: "#f2f5f3",
    color: "#52615a",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },

  field: {
    display: "grid",
    gap: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#263d32",
  },

  required: {
    color: "#dc2626",
    marginLeft: 4,
  },

  optional: {
    color: "#89948f",
    fontSize: 11,
    fontWeight: 500,
    marginLeft: 7,
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    border: "1px solid #dce4df",
    borderRadius: 12,
    background: "#fbfcfb",
    transition: "border-color 0.2s ease",
  },

  inputIcon: {
    position: "absolute",
    left: 13,
    color: "#718078",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    height: 46,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "0 13px 0 42px",
    color: "#163325",
    fontSize: 14,
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "13px 13px 13px 42px",
    color: "#163325",
    fontSize: 14,
    resize: "vertical",
    minHeight: 85,
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 26,
    paddingTop: 20,
    borderTop: "1px solid #edf1ee",
  },

  cancelButton: {
    height: 44,
    padding: "0 18px",
    border: "1px solid #d9e1dc",
    borderRadius: 11,
    background: "#fff",
    color: "#43534b",
    fontWeight: 700,
    cursor: "pointer",
  },

  submitButton: {
    height: 44,
    padding: "0 20px",
    border: "none",
    borderRadius: 11,
    background: "#163325",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  spinner: {
    width: 15,
    height: 15,
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },

  success: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "11px 13px",
    marginBottom: 18,
    borderRadius: 11,
    background: "#ecfdf3",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontSize: 13,
    fontWeight: 600,
  },

  modalError: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "11px 13px",
    marginBottom: 18,
    borderRadius: 11,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: 13,
    fontWeight: 600,
  },
};
