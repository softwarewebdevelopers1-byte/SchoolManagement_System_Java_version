import { api } from "./http";
import { endpoints } from "./endpoints";

const unavailable = <T>(message: string): Promise<T> => Promise.reject(new Error(message));

export const marksApi = {
  sheet<T>(subjectJointId: string) {
    return api.get<T>(endpoints.marks.sheet(subjectJointId));
  },
  list<T>(params?: Record<string, unknown>) {
    return unavailable<T>(`No backend marks-list endpoint exists: ${JSON.stringify(params)}`);
  },
  save<T>(payload: unknown) {
    return this.entry<T>(payload);
  },
  entry<T>(payload: unknown) {
    return api.post<T>(endpoints.marks.entry, payload);
  },
  saveSummary<T>(payload: unknown) {
    return unavailable<T>(`No backend marks-summary endpoint exists: ${JSON.stringify(payload)}`);
  },
  teacherAverages<T>(teacherId: string, params?: Record<string, unknown>) {
    return unavailable<T>(`No backend teacher-averages endpoint exists for ${teacherId}: ${JSON.stringify(params)}`);
  },
  sendClassWhatsapp<T>(payload: unknown) {
    return unavailable<T>(`No backend marks messaging endpoint exists: ${JSON.stringify(payload)}`);
  },
};
