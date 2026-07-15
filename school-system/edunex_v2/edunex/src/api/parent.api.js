import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { PARENTS } from '../data/parents';

export async function getParents() {
  if (USE_MOCK_DATA) return mockResolve(PARENTS);
  return api.get(ENDPOINTS.PARENTS.LIST);
}

export async function getParentById(id) {
  if (USE_MOCK_DATA) return mockResolve(PARENTS.find((p) => p.id === id) || null);
  return api.get(ENDPOINTS.PARENTS.DETAIL(id));
}

export async function createParent(payload) {
  if (USE_MOCK_DATA) return mockResolve({ id: `P${Date.now()}`, ...payload }, 500);
  return api.post(ENDPOINTS.PARENTS.CREATE, payload);
}
