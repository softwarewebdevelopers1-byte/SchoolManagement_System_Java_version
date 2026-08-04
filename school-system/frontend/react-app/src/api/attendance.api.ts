import { api } from "./http";
import { endpoints } from "./endpoints";

export const attendanceApi = {
  sheet<T>(payload: unknown) {
    return api.get<T>(endpoints.attendance.sheet, payload as Record<string, unknown>);
  },
  records<T>(payload: unknown) {
    return api.get<T>(endpoints.attendance.records, payload as Record<string, unknown>);
  },
  studentRecord<T>(payload: unknown) {
    return api.get<T>(endpoints.attendance.studentRecord, payload as Record<string, unknown>);
  },
  updateSheet<T>(payload: unknown) {
    return api.patch<T>(endpoints.attendance.updateSheet, payload);
  },
};
