import { api } from "./http";
import { endpoints } from "./endpoints";

const unavailable = <T>(message: string): Promise<T> =>
  Promise.reject(new Error(message));

export const schoolApi = {
  classes<T>(schoolId: string) {
    return api.get<T>(endpoints.classes.classes(schoolId));
  },
  createClass<T>(payload: unknown) {
    return api.post<T>(endpoints.classes.create, payload);
  },
  updateClass<T>(payload: unknown) {
    return api.patch<T>(endpoints.classes.update, payload);
  },
  unassignClassTeacher<T>(payload: unknown) {
    return api.patch<T>(endpoints.classes.unassignTeacher, payload);
  },
  updateCycle<T>(classId: string) {
    return api.patch<T>(endpoints.classes.updateCycle(classId));
  },
  subjects<T>(schoolId: string) {
    return api.get<T>(endpoints.subjects.subjects(schoolId));
  },
  createSubject<T>(payload: unknown) {
    return api.post<T>(endpoints.subjects.create, payload);
  },
  createMultipleSubjects<T>(payload: unknown) {
    return api.post<T>(endpoints.subjects.createMany, payload);
  },
  updateSubject<T>(payload: unknown) {
    return api.patch<T>(endpoints.subjects.update, payload);
  },
  subjectJoints<T>(schoolId: string) {
    return api.get<T>(endpoints.subjects.subjectJoints(schoolId));
  },
  registerSubjectJoint<T>(payload: unknown) {
    return api.post<T>(endpoints.subjects.registerJoint, payload);
  },
  assignSubjectTeacher<T>(payload: unknown) {
    return api.post<T>(endpoints.subjects.assignTeacher, payload);
  },
  assignmentsByTeacher<T>(teacherId: string) {
    return unavailable<T>(`No backend endpoint returns assignments for teacher ${teacherId}. The backend provides subject joints via /get/all/subject-joints/{schoolId} instead.`);
  },
  unassignSubjectTeacher<T>(payload: unknown) {
    return api.patch<T>(endpoints.subjects.unassignTeacher, payload);
  },
  classSubjectSettings<T>(params?: Record<string, unknown>) {
    return unavailable<T>(`No backend endpoint exposes class-subject settings: ${JSON.stringify(params)}`);
  },
  updateClassSubjectSettings<T>(payload: unknown) {
    return unavailable<T>(`No backend endpoint exposes class-subject settings: ${JSON.stringify(payload)}`);
  },
};
