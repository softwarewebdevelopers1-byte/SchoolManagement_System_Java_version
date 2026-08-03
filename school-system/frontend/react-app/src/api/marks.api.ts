import { api } from "./http";
import { endpoints } from "./endpoints";

export const marksApi = {
  sheet<T>(subjectJointId: string) {
    return api.get<T>(endpoints.marks.sheet(subjectJointId));
  },
  list<T>(params?: Record<string, unknown>) {
    return api.get<T>("/marks", params);
  },
  save<T>(payload: unknown) {
    return api.post<T>("/marks/save", payload);
  },
  entry<T>(payload: unknown) {
    return api.post<T>(endpoints.marks.entry, payload);
  },
  saveSummary<T>(payload: unknown) {
    return api.post<T>("/marks/summary-save", payload);
  },
  teacherAverages<T>(teacherId: string, params?: Record<string, unknown>) {
    return api.get<T>(`/marks/averages/teacher/${teacherId}`, params);
  },
  sendClassWhatsapp<T>(payload: unknown) {
    return api.post<T>("/marks/whatsapp/class", payload);
  },
};
