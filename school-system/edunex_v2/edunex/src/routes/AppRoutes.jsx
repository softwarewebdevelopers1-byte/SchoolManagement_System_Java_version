import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

import Landing from '../pages/public/Landing';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import OtpVerification from '../pages/auth/OtpVerification';
import ResetPassword from '../pages/auth/ResetPassword';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import { StudentList, StudentProfile } from '../pages/admin/Students';
import { TeacherList, TeacherProfile } from '../pages/admin/Teachers';
import Parents from '../pages/admin/Parents';
import Classes from '../pages/admin/Classes';
import Subjects from '../pages/admin/Subjects';
import TeacherAssignment from '../pages/admin/TeacherAssignment';
import Departments from '../pages/admin/Departments';
import AcademicStructure from '../pages/admin/AcademicStructure';
import AdminTimetable from '../pages/admin/Timetable';
import UserManagement from '../pages/admin/UserManagement';
import RolesPermissions from '../pages/admin/RolesPermissions';
import AdminReports from '../pages/admin/Reports';
import SchoolAnalytics from '../pages/admin/SchoolAnalytics';
import AuditLogs from '../pages/admin/AuditLogs';
import SystemSettings from '../pages/admin/SystemSettings';

// Headteacher
import HeadteacherDashboard from '../pages/headteacher/HeadteacherDashboard';
import HeadAnalytics from '../pages/headteacher/Analytics';
import HeadAttendance from '../pages/headteacher/Attendance';
import HeadReports from '../pages/headteacher/Reports';
import HeadTimetable from '../pages/headteacher/Timetable';
import ResultsApproval from '../pages/headteacher/ResultsApproval';
import Announcements from '../pages/headteacher/Announcements';

// Class Teacher
import ClassTeacherDashboard from '../pages/classteacher/ClassTeacherDashboard';
import MyClasses from '../pages/classteacher/MyClasses';
import ClassStudents from '../pages/classteacher/ClassStudents';
import CTAttendance from '../pages/classteacher/Attendance';
import ReportCards from '../pages/classteacher/ReportCards';
import CTPerformance from '../pages/classteacher/Performance';
import CTCommunication from '../pages/classteacher/Communication';
import Discipline from '../pages/classteacher/Discipline';
import CTResults from '../pages/classteacher/Results';
import CTTimetable from '../pages/classteacher/Timetable';

// Subject Teacher
import SubjectTeacherDashboard from '../pages/subjectteacher/SubjectTeacherDashboard';
import AssignedSubjects from '../pages/subjectteacher/AssignedSubjects';
import MarksEntry from '../pages/subjectteacher/MarksEntry';
import Assessments from '../pages/subjectteacher/Assessments';
import GradeBook from '../pages/subjectteacher/GradeBook';
import STPerformance from '../pages/subjectteacher/Performance';
import STAttendance from '../pages/subjectteacher/Attendance';
import STTimetable from '../pages/subjectteacher/Timetable';
import STReports from '../pages/subjectteacher/Reports';

// Student
import StudentDashboard from '../pages/student/StudentDashboard';
import MyProfile from '../pages/student/MyProfile';
import StudentResults from '../pages/student/Results';
import StudentAttendance from '../pages/student/Attendance';
import StudentSubjects from '../pages/student/Subjects';
import StudentTimetable from '../pages/student/Timetable';
import Assignments from '../pages/student/Assignments';
import Downloads from '../pages/student/Downloads';
import StudentNotifications from '../pages/student/Notifications';
import Trends from '../pages/student/Trends';

// Parent
import ParentDashboard from '../pages/parent/ParentDashboard';
import Children from '../pages/parent/Children';
import ParentAttendance from '../pages/parent/Attendance';
import ParentPerformance from '../pages/parent/Performance';
import ParentReportCards from '../pages/parent/ReportCards';
import Fees from '../pages/parent/Fees';
import ParentTimetable from '../pages/parent/Timetable';
import ParentNotifications from '../pages/parent/Notifications';
import ParentCommunication from '../pages/parent/Communication';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verification" element={<OtpVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Administrator */}
      <Route path="/app/admin" element={<ProtectedRoute role="admin"><DashboardLayout role="admin" base="/app/admin" /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="teachers" element={<TeacherList />} />
        <Route path="teachers/:id" element={<TeacherProfile />} />
        <Route path="parents" element={<Parents />} />
        <Route path="classes" element={<Classes />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="assignments" element={<TeacherAssignment />} />
        <Route path="departments" element={<Departments />} />
        <Route path="academic-structure" element={<AcademicStructure />} />
        <Route path="timetable" element={<AdminTimetable />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="roles" element={<RolesPermissions />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="analytics" element={<SchoolAnalytics />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* Headteacher */}
      <Route path="/app/headteacher" element={<ProtectedRoute role="headteacher"><DashboardLayout role="headteacher" base="/app/headteacher" /></ProtectedRoute>}>
        <Route index element={<HeadteacherDashboard />} />
        <Route path="analytics" element={<HeadAnalytics />} />
        <Route path="attendance" element={<HeadAttendance />} />
        <Route path="reports" element={<HeadReports />} />
        <Route path="timetable" element={<HeadTimetable />} />
        <Route path="results-approval" element={<ResultsApproval />} />
        <Route path="announcements" element={<Announcements />} />
      </Route>

      {/* Class Teacher */}
      <Route path="/app/class-teacher" element={<ProtectedRoute role="classteacher"><DashboardLayout role="classteacher" base="/app/class-teacher" /></ProtectedRoute>}>
        <Route index element={<ClassTeacherDashboard />} />
        <Route path="my-classes" element={<MyClasses />} />
        <Route path="students" element={<ClassStudents />} />
        <Route path="attendance" element={<CTAttendance />} />
        <Route path="report-cards" element={<ReportCards />} />
        <Route path="performance" element={<CTPerformance />} />
        <Route path="communication" element={<CTCommunication />} />
        <Route path="discipline" element={<Discipline />} />
        <Route path="results" element={<CTResults />} />
        <Route path="timetable" element={<CTTimetable />} />
      </Route>

      {/* Subject Teacher */}
      <Route path="/app/subject-teacher" element={<ProtectedRoute role="subjectteacher"><DashboardLayout role="subjectteacher" base="/app/subject-teacher" /></ProtectedRoute>}>
        <Route index element={<SubjectTeacherDashboard />} />
        <Route path="assigned" element={<AssignedSubjects />} />
        <Route path="marks-entry" element={<MarksEntry />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="gradebook" element={<GradeBook />} />
        <Route path="performance" element={<STPerformance />} />
        <Route path="attendance" element={<STAttendance />} />
        <Route path="timetable" element={<STTimetable />} />
        <Route path="reports" element={<STReports />} />
      </Route>

      {/* Student */}
      <Route path="/app/student" element={<ProtectedRoute role="student"><DashboardLayout role="student" base="/app/student" /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="subjects" element={<StudentSubjects />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="downloads" element={<Downloads />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="trends" element={<Trends />} />
      </Route>

      {/* Parent */}
      <Route path="/app/parent" element={<ProtectedRoute role="parent"><DashboardLayout role="parent" base="/app/parent" /></ProtectedRoute>}>
        <Route index element={<ParentDashboard />} />
        <Route path="children" element={<Children />} />
        <Route path="attendance" element={<ParentAttendance />} />
        <Route path="performance" element={<ParentPerformance />} />
        <Route path="report-cards" element={<ParentReportCards />} />
        <Route path="fees" element={<Fees />} />
        <Route path="timetable" element={<ParentTimetable />} />
        <Route path="notifications" element={<ParentNotifications />} />
        <Route path="communication" element={<ParentCommunication />} />
      </Route>

      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
