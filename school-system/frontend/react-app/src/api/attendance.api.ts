import { api } from "./http";
import { endpoints } from "./endpoints";

export const attendanceApi = {
  sheet<T>(payload: unknown) {
    return api.getWithBody<T>(endpoints.attendance.sheet, payload);
  },
  records<T>(payload: unknown) {
    return api.getWithBody<T>(endpoints.attendance.records, payload);
  },
  studentRecord<T>(payload: unknown) {
    return api.getWithBody<T>(endpoints.attendance.studentRecord, payload);
  },
  updateSheet<T>(payload: unknown) {
    return api.patch<T>("/attendance/update/sheet", payload);
  },
};
