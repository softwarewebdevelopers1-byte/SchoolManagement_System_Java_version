// components/SuperAdminDashboard.tsx
import React, { useState } from "react";
import "./SuperAdminDashboard.css";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import StatsCards  from "./StatsCard";
import { SchoolsTable } from "./SchoolsTable";
import { TeachersTable } from "./TeachersTable";
import { useData } from "../hooks/useData";

type TabType = "schools" | "teachers";

const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("schools");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const {
    schools,
    users,
    loading,
    error,
    updateSchoolStatus,
    updateUserStatus,
  } = useData();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  return (
    <div className="admin-dashboard">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="admin-main">
        <DashboardHeader
          activeTab={activeTab}
          schools={schools}
          users={users}
        />

        <StatsCards activeTab={activeTab} schools={schools} users={users} />

        <div className="admin-filters">
          <div className="admin-search-wrapper">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder={
                activeTab === "schools"
                  ? "Search schools..."
                  : "Search teachers..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {error && (
          <div className="admin-error-message">
            <span>⚠</span>
            <span>{error}</span>
            <button onClick={() => {}}>✕</button>
          </div>
        )}

        {loading ? (
          <div className="admin-loading">Loading...</div>
        ) : (
          <>
            {activeTab === "schools" && (
              <SchoolsTable
                schools={schools}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                onUpdateStatus={updateSchoolStatus}
              />
            )}
            {activeTab === "teachers" && (
              <TeachersTable
                users={users}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                onUpdateStatus={updateUserStatus}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
export default SuperAdminDashboard;
