// Single entry point for the whole API layer.
// Usage: import { studentApi, marksApi } from '../api';
export * as authApi from './auth.api';
export * as studentApi from './student.api';
export * as teacherApi from './teacher.api';
export * as parentApi from './parent.api';
export * as classApi from './class.api';
export * as subjectApi from './subject.api';
export * as marksApi from './marks.api';
export * as timetableApi from './timetable.api';
export * as attendanceApi from './attendance.api';
export * as analyticsApi from './analytics.api';
export * as reportApi from './report.api';
export * as userApi from './user.api';
export * as notificationApi from './notification.api';

export { default as api, API_BASE_URL, USE_MOCK_DATA } from './axios';
export { ENDPOINTS } from './endpoints';
