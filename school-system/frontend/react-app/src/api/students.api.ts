import { api } from "./http";
import { endpoints } from "./endpoints";

const unavailable = <T>(message: string): Promise<T> =>
  Promise.reject(new Error(message));

export const studentsApi = {
  all<T>(schoolId: string) {
    return api.get<T>(endpoints.students.all, { schoolId });
  },
  byClass<T>(classId: string) {
    return api.get<T>(endpoints.students.byClass, { classId });
  },
  register<T>(payload: unknown) {
    return api.post<T>(endpoints.students.register, payload);
  },
  update<T>(payload: unknown) {
    return api.patch<T>(endpoints.students.update, payload);
  },
};

export default studentsApi;
