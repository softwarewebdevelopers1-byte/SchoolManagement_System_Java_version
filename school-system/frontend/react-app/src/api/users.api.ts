import { api } from "./http";
import { getStoredSession } from "./auth";
import { endpoints } from "./endpoints";

const unavailable = <T>(message: string): Promise<T> =>
  Promise.reject(new Error(message));

export const usersApi = {
  async dashboard<T>() {
    const schoolId = getStoredSession()?.user.schoolId;
    if (!schoolId) {
      return unavailable<T>("The authenticated user does not include a school ID.");
    }

    const [staff, subjects, assignments] = await Promise.all([
      api.get<unknown[]>(endpoints.users.teachers(schoolId)),
      api.get<unknown[]>(endpoints.subjects.subjects(schoolId)),
      api.get<unknown[]>(endpoints.subjects.subjectJoints(schoolId)),
    ]);

    return {
      staff: Array.isArray(staff) ? staff : [],
      students: [],
      subjects: Array.isArray(subjects) ? subjects : [],
      assignments: Array.isArray(assignments) ? assignments : [],
      exitedStudents: [],
    } as T;
  },
  byId<T>(id: string) {
    return unavailable<T>(`No backend endpoint exposes user ${id} by ID.`);
  },
  create<T>(payload: unknown) {
    return unavailable<T>(`No backend endpoint creates generic users: ${JSON.stringify(payload)}`);
  },
  teachers<T>(schoolId: string) {
    return api.get<T>(endpoints.users.teachers(schoolId));
  },
  invites<T>(schoolId: string) {
    return api.get<T>(endpoints.users.teacherInvites(schoolId));
  },
  addTeacherProfile<T>(payload: unknown) {
    return api.post<T>(endpoints.users.addTeacherProfile, payload);
  },
  createTeacher<T>(payload: unknown) {
    return api.post<T>(endpoints.users.createTeacher, payload);
  },
  updateTeacher<T>(payload: unknown) {
    return api.patch<T>(endpoints.users.updateTeacher, payload);
  },
  update<T>(id: string, payload: unknown) {
    void id;
    return api.patch<T>(endpoints.users.update, payload);
  },
  remove<T>(id: string) {
    return api.patch<T>(`${endpoints.users.remove}?id=${encodeURIComponent(id)}`);
  },
  suspend<T>(id: string) {
    return api.patch<T>(`${endpoints.users.suspend}?id=${encodeURIComponent(id)}`);
  },
  deactivate<T>(id: string) {
    return api.patch<T>(`${endpoints.users.deactivate}?id=${encodeURIComponent(id)}`);
  },
  dangerZoneDelete<T>(payload: unknown) {
    return unavailable<T>(`The delete-account backend contract requires a request body: ${JSON.stringify(payload)}`);
  },
  changePassword<T>(payload: unknown) {
    return unavailable<T>(`No authenticated password-change endpoint exists: ${JSON.stringify(payload)}`);
  },
  graduationSettings<T>() {
    return unavailable<T>("No graduation-settings endpoint exists.");
  },
  updateGraduationSettings<T>(payload: unknown) {
    return unavailable<T>(`No graduation-settings endpoint exists: ${JSON.stringify(payload)}`);
  },
  bulkUpdateTerm<T>(payload: unknown) {
    return unavailable<T>(`No bulk-term-update endpoint exists: ${JSON.stringify(payload)}`);
  },
  bulkEnrollElective<T>(payload: unknown) {
    return unavailable<T>(`No bulk-elective-enrollment endpoint exists: ${JSON.stringify(payload)}`);
  },
};
