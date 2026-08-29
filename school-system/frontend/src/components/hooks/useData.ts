// hooks/useData.ts
import { useState, useEffect } from 'react';

interface School {
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  createdAt: string;
  adminEmail?: string;
  adminName?: string;
}

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  schoolId?: string;
  schoolName?: string;
  createdAt: string;
}

// Mock API service
const mockApi = {
  async getSchools(): Promise<School[]> {
    return [
      { schoolId: '1', schoolName: 'Nairobi Academy', schoolCode: 'NA-001', status: 'ACTIVE', createdAt: '2025-01-15', adminEmail: 'admin@nairobiacademy.ac.ke', adminName: 'Jane Mwangi' },
      { schoolId: '2', schoolName: 'Mombasa High School', schoolCode: 'MH-002', status: 'PENDING', createdAt: '2025-02-20', adminEmail: 'admin@mombasahigh.ac.ke', adminName: 'Omar Hassan' },
      { schoolId: '3', schoolName: 'Kisumu Central', schoolCode: 'KC-003', status: 'SUSPENDED', createdAt: '2025-01-28', adminEmail: 'admin@kisumucentral.ac.ke', adminName: 'Achieng Omondi' },
      { schoolId: '4', schoolName: 'Eldoret International', schoolCode: 'EI-004', status: 'REJECTED', createdAt: '2025-03-01', adminEmail: 'admin@eldoretinternational.ac.ke', adminName: 'Kiprop Rono' },
      { schoolId: '5', schoolName: 'Thika School of Excellence', schoolCode: 'TE-005', status: 'PENDING', createdAt: '2025-03-10', adminEmail: 'admin@thikaexcellence.ac.ke', adminName: 'Grace Wanjiru' },
    ];
  },

  async getUsers(): Promise<User[]> {
    return [
      { userId: 'u1', email: 'john.doe@school.com', firstName: 'John', lastName: 'Doe', roles: ['HEADTEACHER'], status: 'ACTIVE', schoolId: '1', schoolName: 'Nairobi Academy', createdAt: '2025-01-20' },
      { userId: 'u2', email: 'jane.smith@school.com', firstName: 'Jane', lastName: 'Smith', roles: ['TEACHER'], status: 'ACTIVE', schoolId: '1', schoolName: 'Nairobi Academy', createdAt: '2025-02-01' },
      { userId: 'u3', email: 'peter.odhiambo@school.com', firstName: 'Peter', lastName: 'Odhiambo', roles: ['TEACHER'], status: 'PENDING', schoolId: '2', schoolName: 'Mombasa High School', createdAt: '2025-02-25' },
      { userId: 'u4', email: 'mary.akinyi@school.com', firstName: 'Mary', lastName: 'Akinyi', roles: ['TEACHER'], status: 'INACTIVE', schoolId: '3', schoolName: 'Kisumu Central', createdAt: '2025-01-30' },
      { userId: 'u5', email: 'robert.kariuki@school.com', firstName: 'Robert', lastName: 'Kariuki', roles: ['CLASSTEACHER'], status: 'ACTIVE', schoolId: '1', schoolName: 'Nairobi Academy', createdAt: '2025-02-10' },
      { userId: 'u6', email: 'susan.chepkoech@school.com', firstName: 'Susan', lastName: 'Chepkoech', roles: ['TEACHER'], status: 'PENDING', schoolId: '4', schoolName: 'Eldoret International', createdAt: '2025-03-05' },
    ];
  },

  async updateSchoolStatus(_schoolId: string, _status: School['status']): Promise<void> {
    return;
  },

  async updateUserStatus(_userId: string, _status: User['status']): Promise<void> {
    return;
  }
};

export const useData = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [schoolsRes, usersRes] = await Promise.all([
          mockApi.getSchools(),
          mockApi.getUsers()
        ]);
        setSchools(schoolsRes);
        setUsers(usersRes);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const updateSchoolStatus = async (schoolId: string, status: School['status']) => {
    try {
      await mockApi.updateSchoolStatus(schoolId, status);
      setSchools(prev => prev.map(s => s.schoolId === schoolId ? { ...s, status } : s));
    } catch (err: any) {
      setError(err.message || 'Failed to update school status');
    }
  };

  const updateUserStatus = async (userId: string, status: User['status']) => {
    try {
      await mockApi.updateUserStatus(userId, status);
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, status } : u));
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    }
  };

  return { schools, users, loading, error, updateSchoolStatus, updateUserStatus };
};