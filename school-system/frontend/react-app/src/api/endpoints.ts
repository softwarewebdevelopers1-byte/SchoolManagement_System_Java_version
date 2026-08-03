export const endpoints = {
  auth: {
    login: "/auth/login/login-user",
    refresh: "/auth/refresh",
    profile: "/schools/get/school/for/user",
  },
  users: {
    dashboard: "/users",
    byId: (id: string) => `/users/${id}`,
    password: "/users/password",
  },
  school: {
    classes: (schoolId: string) => `/all/classes/${schoolId}`,
    subjects: (schoolId: string) => `/getAll/subjects/${schoolId}`,
    subjectJoints: (schoolId: string) => `/get/all/subject-joints/${schoolId}`,
  },
  attendance: {
    sheet: "/attendance/sheet",
    records: "/attendance/get/attendance-sheet",
    studentRecord: "/attendance/student/attendance/record",
  },
  marks: {
    sheet: (subjectJointId: string) => `/marks/${subjectJointId}`,
    entry: "/marks/entry",
  },
  timetable: {
    settings: "/timetables/settings",
    requirements: "/timetables/requirements",
    generate: "/timetables/generate",
    bySchool: (schoolId: string) => `/timetables/${schoolId}`,
    validate: (schoolId: string) => `/timetables/validate/${schoolId}`,
  },
};
