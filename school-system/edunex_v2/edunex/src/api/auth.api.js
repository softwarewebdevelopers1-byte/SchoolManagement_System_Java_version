import api, { USE_MOCK_DATA } from './axios';
import { ENDPOINTS } from './endpoints';
import { mockResolve } from './mock';

const DEMO_USERS = {
  'admin@edunex.io': { name: 'Amina Wafula', role: 'admin', avatarSeed: 'Amina' },
  'head@edunex.io': { name: 'Dr. Peter Kamau', role: 'headteacher', avatarSeed: 'Peter' },
  'classteacher@edunex.io': { name: 'Grace Njoroge', role: 'classteacher', avatarSeed: 'Grace' },
  'subjectteacher@edunex.io': { name: 'Brian Otieno', role: 'subjectteacher', avatarSeed: 'Brian' },
  'student@edunex.io': { name: 'Faith Wanjiru', role: 'student', avatarSeed: 'Faith' },
  'parent@edunex.io': { name: 'Samuel Mwangi', role: 'parent', avatarSeed: 'Samuel' },
};

export async function login(email, password) {
  if (USE_MOCK_DATA) {
    const found = DEMO_USERS[email.toLowerCase().trim()];
    const profile = found || { name: email.split('@')[0], role: 'admin', avatarSeed: email };
    const user = { email, ...profile };
    return mockResolve({ user, token: `mock-token-${Date.now()}` }, 700);
  }
  return api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
}

export async function logout() {
  if (USE_MOCK_DATA) return mockResolve({ success: true }, 150);
  return api.post(ENDPOINTS.AUTH.LOGOUT);
}

export async function forgotPassword(email) {
  if (USE_MOCK_DATA) return mockResolve({ sent: true, email }, 600);
  return api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
}

export async function verifyOtp(email, code) {
  if (USE_MOCK_DATA) return mockResolve({ verified: true }, 600);
  return api.post(ENDPOINTS.AUTH.VERIFY_OTP, { email, code });
}

export async function resetPassword(token, password) {
  if (USE_MOCK_DATA) return mockResolve({ success: true }, 600);
  return api.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
}

export async function getCurrentUser() {
  if (USE_MOCK_DATA) {
    const saved = localStorage.getItem('edunex-user');
    return mockResolve(saved ? JSON.parse(saved) : null, 100);
  }
  return api.get(ENDPOINTS.AUTH.ME);
}
