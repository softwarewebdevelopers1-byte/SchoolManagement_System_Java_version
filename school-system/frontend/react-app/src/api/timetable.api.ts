import { api } from "./http";
import { endpoints } from "./endpoints";

export const timetableApi = {
  configureSettings<T>(payload: unknown) {
    return api.put<T>(endpoints.timetable.settings, payload);
  },
  upsertRequirement<T>(payload: unknown) {
    return api.put<T>(endpoints.timetable.requirements, payload);
  },
  generate<T>(payload: unknown) {
    return api.post<T>(endpoints.timetable.generate, payload);
  },
  bySchool<T>(schoolId: string) {
    return api.get<T>(endpoints.timetable.bySchool(schoolId));
  },
  validate<T>(schoolId: string) {
    return api.get<T>(endpoints.timetable.validate(schoolId));
  },
  delete<T>(schoolId: string) {
    return api.delete<T>(endpoints.timetable.bySchool(schoolId));
  },
};
