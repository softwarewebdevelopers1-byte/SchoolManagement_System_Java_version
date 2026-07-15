import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';
import { NOTIFICATIONS, ANNOUNCEMENTS, EVENTS } from '../data/notifications';

export async function getNotifications() {
  if (USE_MOCK_DATA) return mockResolve(NOTIFICATIONS);
  return api.get(ENDPOINTS.NOTIFICATIONS.LIST);
}

export async function getAnnouncements() {
  if (USE_MOCK_DATA) return mockResolve(ANNOUNCEMENTS);
  return api.get(ENDPOINTS.NOTIFICATIONS.ANNOUNCEMENTS);
}

export async function getEvents() {
  if (USE_MOCK_DATA) return mockResolve(EVENTS);
  return api.get(ENDPOINTS.NOTIFICATIONS.EVENTS);
}

export async function markNotificationRead(id) {
  if (USE_MOCK_DATA) return mockResolve({ id, read: true }, 200);
  return api.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
}
