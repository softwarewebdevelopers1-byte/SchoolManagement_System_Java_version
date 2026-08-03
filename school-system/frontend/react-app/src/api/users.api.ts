import { api } from "./http";

export const usersApi = {
  dashboard<T>() {
    return api.get<T>("/users");
  },
  byId<T>(id: string) {
    return api.get<T>(`/users/${id}`);
  },
  create<T>(payload: unknown) {
    return api.post<T>("/users", payload);
  },
  update<T>(id: string, payload: unknown) {
    return api.put<T>(`/users/${id}`, payload);
  },
  remove<T>(id: string) {
    return api.delete<T>(`/users/${id}`);
  },
  changePassword(payload: { oldPassword: string; newPassword: string }) {
    return api.put("/users/password", payload);
  },
  graduationSettings<T>() {
    return api.get<T>("/users/graduation-settings");
  },
  updateGraduationSettings<T>(payload: { finalGrade: string }) {
    return api.put<T>("/users/graduation-settings", payload);
  },
  bulkUpdateTerm<T>(payload: { term: number; year: number; examType: string }) {
    return api.put<T>("/users/bulk-update-term", payload);
  },
  bulkEnrollElective<T>(payload: unknown) {
    return api.put<T>("/users/bulk-enroll-elective", payload);
  },
};
