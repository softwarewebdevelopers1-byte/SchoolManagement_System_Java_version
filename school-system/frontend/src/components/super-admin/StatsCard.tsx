// components/StatsCards.tsx
import React from 'react';
import './StatsCards.css';

interface StatsCardsProps {
  activeTab: 'schools' | 'teachers';
  schools: any[];
  users: any[];
}

 const StatsCards: React.FC<StatsCardsProps> = ({ activeTab, schools, users }) => {
  const teacherUsers = users.filter(u => 
    u.roles.some((r: string) => ['TEACHER', 'CLASSTEACHER', 'HEADTEACHER', 'DEPUTYTEACHER'].includes(r))
  );

  const schoolStats = {
    total: schools.length,
    pending: schools.filter(s => s.status === 'PENDING').length,
    active: schools.filter(s => s.status === 'ACTIVE').length,
    suspended: schools.filter(s => s.status === 'SUSPENDED').length,
  };

  const userStats = {
    total: teacherUsers.length,
    active: teacherUsers.filter(u => u.status === 'ACTIVE').length,
    pending: teacherUsers.filter(u => u.status === 'PENDING').length,
    inactive: teacherUsers.filter(u => u.status === 'INACTIVE').length,
  };

  const stats = activeTab === 'schools' ? [
    { label: 'Total Schools', value: schoolStats.total, color: '#1a3a2f' },
    { label: 'Pending Approval', value: schoolStats.pending, color: '#c9963d' },
    { label: 'Active', value: schoolStats.active, color: '#0b5e42' },
    { label: 'Suspended', value: schoolStats.suspended, color: '#b91c1c' },
  ] : [
    { label: 'Total Staff', value: userStats.total, color: '#1a3a2f' },
    { label: 'Active', value: userStats.active, color: '#0b5e42' },
    { label: 'Pending', value: userStats.pending, color: '#c9963d' },
    { label: 'Inactive', value: userStats.inactive, color: '#b91c1c' },
  ];

  return (
    <div className="admin-stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="admin-stat-card">
          <div className="admin-stat-label">{stat.label}</div>
          <div className="admin-stat-number" style={{ color: stat.color }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};
export default StatsCards;