// Metadata describing the exportable reports available across the app.
// icon keys are resolved to lucide-react components in ReportsModule.
export const REPORT_SETS = {
  academic: [
    { icon: 'GraduationCap', title: 'Term 2 Academic Summary', meta: 'All forms · Updated today' },
    { icon: 'FileText', title: 'Subject Performance Breakdown', meta: 'By department · Updated today' },
    { icon: 'GraduationCap', title: 'Grade Distribution Report', meta: 'School-wide · Updated 2 days ago' },
  ],
  student: [
    { icon: 'GraduationCap', title: 'Student Progress Report', meta: 'Per class · Updated today' },
    { icon: 'FileText', title: 'Attendance Compliance Report', meta: 'School-wide · Updated today' },
    { icon: 'GraduationCap', title: 'Discipline & Conduct Summary', meta: 'Per class · Updated 3 days ago' },
  ],
  teacher: [
    { icon: 'UserCog', title: 'Teacher Workload Report', meta: 'All departments · Updated today' },
    { icon: 'UserCog', title: 'Teacher Performance Review', meta: 'Per subject · Updated yesterday' },
  ],
  school: [
    { icon: 'School', title: 'School Termly Report', meta: 'Board-ready · Updated today' },
    { icon: 'School', title: 'Enrollment & Capacity Report', meta: 'School-wide · Updated this week' },
    { icon: 'School', title: 'Financial Summary (UI only)', meta: 'Fees & expenses · Updated today' },
  ],
};
