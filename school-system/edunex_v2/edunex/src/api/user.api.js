import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { SYSTEM_USERS, ROLES_PERMISSIONS, AUDIT_LOGS } from '../data/users';

export async function getSystemUsers() {
  if (USE_MOCK_DATA) return mockResolve(SYSTEM_USERS);
  return api.get(ENDPOINTS.USERS.LIST);
}

export async function getRolesPermissions() {
  if (USE_MOCK_DATA) return mockResolve(ROLES_PERMISSIONS);
  return api.get(ENDPOINTS.USERS.ROLES);
}

export async function getAuditLogs() {
  if (USE_MOCK_DATA) return mockResolve(AUDIT_LOGS);
  return api.get(ENDPOINTS.USERS.AUDIT_LOGS);
}
