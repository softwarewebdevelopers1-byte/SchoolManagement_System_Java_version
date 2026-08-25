// components/admin/types.ts

import type {
  StudentSubjectEnrollment,
  SubjectEnrollmentMode,
} from "../../lib/subjectEnrollment";

export interface Teacher {
  id: string;
  userId?: string;
  usersId?: string;
  name: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  status: string;
  department: string;
  roles: string[];
  roleLabel: string;
  teacherNumber?: string;
  classGrade?: string;
  classStream?: string;
  schoolClass?: string;
  subjects?: string[];
  joinDate?: string;
  term?: number;
  year?: number;
  examType?: string;
}

export interface Subject {
  id: string;
  name: string;
  department: string;
  isOffered?: boolean;
  enrollmentMode?: SubjectEnrollmentMode;
  sharedSlotId?: string | null;
}

export interface Class {
  id: string;
  classId?: string;
  className?: string;
  name: string;
  grade: string;
  stream?: string;
  students: number;
  totalStudents?: number;
  classTeacher?: string | null;
  classTeacherId?: string;
  subjectAssignments: Record<string, string>;
  subjectSettings: Record<string, ClassSubjectSetting>;
  offeredSubjectIds: string[];
  droppedSubjectIds: string[];
  compulsorySubjectIds: string[];
  electiveSubjectIds: string[];
  term?: number;
  year?: number;
  examType?: string;
}

export interface ClassFound {
  classId: string;
  className: string;
  classTeacher: string;
  totalStudents: string;
}

export interface Student {
  id: string;
  studentFullName: string;
  studentAdm: string;
  email: string;
  phoneNumber: string;
  guardianName: string;
  classId: string;
  schoolId: string;
  gender?: string;
  classGrade: string;
  classStream: string;
  status: string;
  userId?: string;
}

export interface ApiTeacher {
  teacherProfileId: string;
  firstName: any;
  lastName: any;
  id: string;
  userId?: string;
  usersId?: string;
  name: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  status: string;
  department: string;
  roles: string[];
  roleLabel: string;
  teacherNumber?: string;
  classGrade?: string;
  classStream?: string;
  schoolClass?: string;
  subjects?: string[];
  joinDate?: string;
  term?: number;
  year?: number;
  examType?: string;
}

export interface ApiStudent {
  id: string;
  userId?: string;
  studentFullName: string;
  guardianName: string;
  studentAdm: string;
  email: string;
  phoneNumber: string;
  classId: string;
  schoolId: string;
  gender?: string;
  classGrade: string;
  classStream: string;
  status: string;
}
export interface subjectJoints {
  classId: string;
  className: string;
  electiveCode: string | null;
  subjectJointId: string;
  subjectName: string;
  subjectTeacherId: string | null;
  subjectTeacherName: "";
  subjectType: string;
}
export interface ApiAssignment {
  id: string;
  subjectId: string;
  teacherId: string;
  classGrade: string;
  classStream: string;
  enrollmentMode?: SubjectEnrollmentMode;
  sharedSlotId?: string | null;
  studentCount?: number;
}

export interface ClassSubjectSetting {
  id: string;
  subjectId: string;
  classGrade: string;
  classStream: string;
  isOffered: boolean;
  enrollmentMode?: SubjectEnrollmentMode;
  sharedSlotId?: string | null;
}

export interface UsersDashboardResponse {
  subjectJoints: ApiAssignment[];
  staff: ApiTeacher[];
  students: ApiStudent[];
  subjects: Subject[];
  assignments: ApiAssignment[];
  exitedStudents?: ExitedStudent[];
}

export interface ExitedStudentExamSummary {
  term: number;
  year: number;
  examType: string;
  classGrade: string;
  classStream: string;
  total: number;
  points: number;
  average: number;
  cbcBand: string;
  subjectCount: number;
}

export interface ExitedStudent {
  userId: string;
  studentAdm: string;
  studentFullName: string;
  gender?: string | null;
  guardianName?: string | null;
  phoneNumber?: string | null;
  classGrade: string;
  classStream: string;
  exitReason: string;
  exitedAt: string;
  examSummaries: ExitedStudentExamSummary[];
  totalPoints: number;
  averagePercentage: number;
  examCount: number;
}

export interface Assignment {
  id: string;
  subjectId: string;
  teacherId: string;
  classGrade: string;
  classStream: string;
}

export interface NavItem {
  id: string;
  label: string;
  svg: string;
}
export interface req {
  year: number;
  term: number;
  examType: string;
  finalGrade: string;
}
