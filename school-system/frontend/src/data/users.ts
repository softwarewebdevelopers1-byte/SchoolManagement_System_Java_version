import type { Role } from "@/types/finance";

export interface DemoUser {
  role: Role;
  name: string;
  title: string;
  initials: string;
  email: string;
  allowedNavKeys: string[]; // empty = all allowed
  parentChildIds?: string[]; // for parent role
  studentId?: string; // for student role
}

export const DEMO_USERS: DemoUser[] = [
  {
    role: "platform_admin",
    name: "Wanjiru Mwangi",
    title: "Platform Administrator",
    initials: "WM",
    email: "wanjiru@edunex.io",
    allowedNavKeys: [
      "dashboard",
      "platform_schools",
      "platform_activity",
      "reports",
      "settings",
      "audit",
    ],
  },
  {
    role: "school_admin",
    name: "David Otieno",
    title: "Proprietor — Edunex Academy",
    initials: "DO",
    email: "d.otieno@edunex.ac.ke",
    allowedNavKeys: [],
  },
  {
    role: "finance_manager",
    name: "Grace Njeri",
    title: "Finance Manager",
    initials: "GN",
    email: "g.njeri@edunex.ac.ke",
    allowedNavKeys: [],
  },
  {
    role: "accounts_clerk",
    name: "Brian Kimani",
    title: "Accounts Clerk",
    initials: "BK",
    email: "b.kimani@edunex.ac.ke",
    allowedNavKeys: [
      "dashboard",
      "students",
      "invoices",
      "payments",
      "receipts",
      "outstanding",
      "statements",
      "reconciliation",
      "cashbook",
    ],
  },
  {
    role: "school_administrator",
    name: "Faith Chebet",
    title: "School Administrator",
    initials: "FC",
    email: "f.chebet@edunex.ac.ke",
    allowedNavKeys: [
      "dashboard",
      "students",
      "invoices",
      "outstanding",
      "expenses",
      "reports",
      "audit",
    ],
  },
  {
    role: "parent",
    name: "Samuel Kariuki",
    title: "Parent / Guardian",
    initials: "SK",
    email: "s.kariuki@gmail.com",
    allowedNavKeys: [],
    parentChildIds: ["std_001", "std_002"],
  },
  {
    role: "student",
    name: "John Kamau",
    title: "Student — Form 3A",
    initials: "JK",
    email: "john.k@student.edunex.ac.ke",
    allowedNavKeys: [],
    studentId: "std_001",
  },
];

export const getDemoUser = (role: Role): DemoUser =>
  DEMO_USERS.find((u) => u.role === role) ?? DEMO_USERS[2];
