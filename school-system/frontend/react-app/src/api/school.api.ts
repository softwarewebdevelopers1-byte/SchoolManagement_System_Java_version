import { api } from "./http";
import { endpoints } from "./endpoints";

export const schoolApi = {
  classes<T>(schoolId: string) {
    return api.get<T>(endpoints.school.classes(schoolId));
  },
  createClass<T>(payload: unknown) {
    return api.post<T>("/create/school/class", payload);
  },
  updateClass<T>(payload: unknown) {
    return api.patch<T>("/update/class", payload);
  },
  unassignClassTeacher<T>(payload: unknown) {
    return api.patch<T>("/unassign/classteacher", payload);
  },
  subjects<T>(schoolId: string) {
    return api.get<T>(endpoints.school.subjects(schoolId));
  },
  createSubject<T>(payload: unknown) {
    return api.post<T>("/create/subject", payload);
  },
  updateSubject<T>(payload: unknown) {
    return api.patch<T>("/update/subject", payload);
  },
  subjectJoints<T>(schoolId: string) {
    return api.get<T>(endpoints.school.subjectJoints(schoolId));
  },
  registerSubjectJoint<T>(payload: unknown) {
    return api.post<T>("/register/subject-joint", payload);
  },
  assignSubjectTeacher<T>(payload: unknown) {
    return api.post<T>("/assign/subject/teacher", payload);
  },
  assignmentsByTeacher<T>(teacherId: string) {
    return api.get<T>(`/school/assignments/teacher/${teacherId}`);
  },
  unassignSubjectTeacher<T>(payload: unknown) {
    return api.patch<T>("/unassign/subject/teacher", payload);
  },
  classSubjectSettings<T>(params?: Record<string, unknown>) {
    return api.get<T>("/school/class-subjects", params);
  },
  updateClassSubjectSettings<T>(payload: unknown) {
    return api.put<T>("/school/class-subjects", payload);
  },
};
