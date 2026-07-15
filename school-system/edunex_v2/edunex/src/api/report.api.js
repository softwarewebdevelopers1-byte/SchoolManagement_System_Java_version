import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { REPORT_SETS } from '../data/reports';

export async function getReports(category = 'academic') {
  if (USE_MOCK_DATA) return mockResolve(REPORT_SETS[category] || []);
  return api.get(ENDPOINTS.REPORTS.LIST(category));
}

export async function exportReport(reportId) {
  if (USE_MOCK_DATA) return mockResolve({ reportId, exported: true, url: '#' }, 500);
  return api.post(ENDPOINTS.REPORTS.EXPORT(reportId));
}
