import React from "react";
import { useNavigate } from "react-router-dom";

const UnassignedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--sand, #f4efe6)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "min(100%, 520px)",
          background: "var(--cream, #fffaf1)",
          border: "1px solid var(--border, #e4d8c4)",
          borderRadius: 8,
          boxShadow: "0 18px 48px rgba(11, 32, 24, 0.12)",
          overflow: "hidden",
          textAlign: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--goldL, #f5e6c8)",
            color: "var(--gold, #c9963d)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
            margin: "0 auto 20px",
          }}
        >
          !
        </div>
        <h1
          style={{
            fontFamily: "var(--serif, system-ui)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text, #0f2e22)",
            margin: "0 0 12px",
          }}
        >
          No Role Assigned
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--textM, #5d665f)",
            lineHeight: 1.6,
            margin: "0 0 24px",
          }}
        >
          Your account does not have any active role assigned. Please contact your
          school administrator to request access and have a role assigned to your
          account.
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "10px 24px",
            background: "var(--gold, #c9963d)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Login
        </button>
      </section>
    </main>
  );
};

export default UnassignedPage;
