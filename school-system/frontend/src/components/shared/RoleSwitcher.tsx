import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { normalizeRoles, ROLE_PATHS } from "../../lib/api";

interface RoleSwitcherProps {
  user: any;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  SUPERADMIN: "Super Admin",
  HEADTEACHER: "Head Teacher",
  DEPUTYTEACHER: "Deputy Head",
  CLASSTEACHER: "Class Teacher",
  SUBJECTTEACHER: "Subject Teacher",
  STUDENT: "Student",
};

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCompact, setIsCompact] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth <= 640,
  );
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  let roles = normalizeRoles(user?.roles || user?.role);
  const validRoles = roles.filter((r) => ROLE_PATHS[r]);

  const uniquePathRoles: string[] = [];
  const seenPaths = new Set<string>();

  for (const r of validRoles) {
    const path = ROLE_PATHS[r];
    if (path && !seenPaths.has(path)) {
      uniquePathRoles.push(r);
      seenPaths.add(path);
    }
  }

  roles = uniquePathRoles;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      setIsCompact(window.innerWidth <= 640);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (roles.length <= 1) return null;

  const currentPath = location.pathname.toLowerCase();
  const rolePath = (role: string) =>
    `/edunex-org${ROLE_PATHS[role] || ""}`.toLowerCase();
  const currentRole =
    roles.find((r) => rolePath(r) === currentPath) || roles[0];

  return (
    <div ref={dropdownRef} style={{ position: "relative", zIndex: 100 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: isCompact ? "7px 10px" : "6px 14px",
          borderRadius: 8,
          border: "1.5px solid var(--gold)",
          background: "var(--white)",
          color: "var(--text)",
          fontSize: isCompact ? "11px" : "12px",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 8px 20px rgba(11, 32, 24, 0.08)",
          whiteSpace: "nowrap",
          maxWidth: isCompact ? 160 : 240,
        }}
      >
        {!isCompact && (
          <span
            style={{ color: "var(--gold)", fontSize: "10px", fontWeight: 800 }}
          >
            DASHBOARD:
          </span>
        )}
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {roleLabels[currentRole] || currentRole}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <>
          {isCompact && (
            <div
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(8, 17, 13, 0.42)",
                zIndex: 999,
              }}
            />
          )}
          <div
            style={{
              position: isCompact ? "fixed" : "absolute",
              top: isCompact ? "auto" : "120%",
              right: isCompact ? 12 : 0,
              left: isCompact ? 12 : "auto",
              bottom: isCompact ? 12 : "auto",
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: isCompact ? 14 : 10,
              boxShadow: "0 16px 36px rgba(11, 32, 24, 0.16)",
              padding: isCompact ? "10px" : "6px",
              minWidth: isCompact ? "auto" : "180px",
              maxHeight: isCompact ? "min(70dvh, 360px)" : undefined,
              overflowY: isCompact ? "auto" : undefined,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              zIndex: 1000,
              animation: "scaleIn 0.2s ease-out",
            }}
          >
            {isCompact && (
              <div
                style={{
                  padding: "4px 6px 10px",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "var(--textMut)",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                }}
              >
                Switch dashboard
              </div>
            )}
            {roles.map((r: string) => {
              const path = ROLE_PATHS[r];
              if (!path) return null;
              const isActive = currentPath === rolePath(r);

              return (
                <button
                  key={r}
                  onClick={() => {
                    navigate(`/edunex-org${path}`);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: isActive ? "var(--goldP)" : "transparent",
                    color: isActive ? "var(--gold)" : "var(--text)",
                    textAlign: "left",
                    fontSize: "12.5px",
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {roleLabels[r] || r}
                  {isActive && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--gold)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
