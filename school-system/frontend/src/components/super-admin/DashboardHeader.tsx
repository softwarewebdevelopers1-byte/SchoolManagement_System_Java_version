// components/DashboardHeader.tsx
import React from 'react';
import './DashboardHeader.css';

interface DashboardHeaderProps {
  activeTab: 'schools' | 'teachers';
  schools: any[];
  users: any[];
}

 const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  activeTab, 
  schools, 
  users 
}) => {
  const teacherUsers = users.filter(u => 
    u.roles.some((r: string) => ['TEACHER', 'CLASSTEACHER', 'HEADTEACHER', 'DEPUTYTEACHER'].includes(r))
  );

  const getStats = () => {
    if (activeTab === 'schools') {
      return {
        title: 'Schools',
        subtitle: `Manage ${schools.length} registered schools`,
        count: schools.length
      };
    }
    return {
      title: 'Staff',
      subtitle: `Staff directory`,
      count: teacherUsers.length
    };
  };

  const stats = getStats();

  return (
    <header className="admin-header">
      <div>
        <h1>{stats.title}</h1>
        <p>{stats.subtitle}</p>
      </div>
      <div className="admin-header-actions">
        <button className="admin-header-btn">
          <span>+</span> Add {activeTab === 'schools' ? 'School' : 'Staff'}
        </button>
        <span className="admin-date-badge">
          📅 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </header>
  );
};
export default DashboardHeader;