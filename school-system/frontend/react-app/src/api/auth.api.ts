import { endpoints } from "./endpoints";
import { api, normalizeSession } from "./http";
import { storeSession, updateStoredUser, type AuthSession, type AuthUser } from "./auth";

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
  async hydrate(): Promise<AuthUser> {
    const context = await api.get<{ user: AuthUser }>(endpoints.auth.currentUser);
    updateStoredUser(context.user);
    return context.user;
  },
};
