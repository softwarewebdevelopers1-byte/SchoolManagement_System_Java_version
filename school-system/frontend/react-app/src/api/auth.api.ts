import { endpoints } from "./endpoints";
import { api, normalizeSession } from "./http";
import { storeSession, type AuthSession } from "./auth";

export type LoginPayload = {
  email: string;
  password: string;
  captchaToken?: string;
};

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const response = await api.post<unknown>(endpoints.auth.login, payload);
    const session = normalizeSession(response);
    storeSession(session);
    return session;
  },
  profile() {
    return api.get(endpoints.auth.profile);
  },
};
