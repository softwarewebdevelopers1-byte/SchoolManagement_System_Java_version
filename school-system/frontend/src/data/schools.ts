import type { School, AcademicYear } from "@/types/finance";

export const SCHOOLS: School[] = [
  {
    id: "sch_edunex",
    name: "Edunex Academy",
    code: "EDN",
    county: "Nairobi",
    logoColor: "#0F4C81",
    studentCount: 842,
    usesFinance: true,
    subscriptionTier: "Premium",
    monthlyRevenue: 12_400_000,
  },
  {
    id: "sch_greenvalley",
    name: "Green Valley School",
    code: "GVS",
    county: "Kiambu",
    logoColor: "#14B8A6",
    studentCount: 614,
    usesFinance: true,
    subscriptionTier: "Standard",
    monthlyRevenue: 8_200_000,
  },
  {
    id: "sch_lakeview",
    name: "Lakeview High School",
    code: "LVS",
    county: "Kisumu",
    logoColor: "#F59E0B",
    studentCount: 508,
    usesFinance: true,
    subscriptionTier: "Standard",
    monthlyRevenue: 6_950_000,
  },
  {
    id: "sch_mtkenya",
    name: "Mt. Kenya Boys",
    code: "MKB",
    county: "Nyeri",
    logoColor: "#7C3AED",
    studentCount: 731,
    usesFinance: false,
    subscriptionTier: "Starter",
    monthlyRevenue: 5_400_000,
  },
];

export const ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: "ay_2026",
    label: "2026",
    terms: [
      {
        id: "t1_2026",
        label: "Term 1",
        startDate: "2026-01-06",
        endDate: "2026-04-10",
        isCurrent: false,
      },
      {
        id: "t2_2026",
        label: "Term 2",
        startDate: "2026-05-05",
        endDate: "2026-08-07",
        isCurrent: false,
      },
      {
        id: "t3_2026",
        label: "Term 3",
        startDate: "2026-09-01",
        endDate: "2026-11-27",
        isCurrent: true,
      },
    ],
  },
  {
    id: "ay_2025",
    label: "2025",
    terms: [
      {
        id: "t1_2025",
        label: "Term 1",
        startDate: "2025-01-06",
        endDate: "2025-04-10",
        isCurrent: false,
      },
      {
        id: "t2_2025",
        label: "Term 2",
        startDate: "2025-05-05",
        endDate: "2025-08-07",
        isCurrent: false,
      },
      {
        id: "t3_2025",
        label: "Term 3",
        startDate: "2025-09-01",
        endDate: "2025-11-27",
        isCurrent: false,
      },
    ],
  },
];

export const CLASSES: { id: string; name: string; stream: string }[] = [
  { id: "c_f1a", name: "Form 1A", stream: "A" },
  { id: "c_f1b", name: "Form 1B", stream: "B" },
  { id: "c_f2a", name: "Form 2A", stream: "A" },
  { id: "c_f2b", name: "Form 2B", stream: "B" },
  { id: "c_f3a", name: "Form 3A", stream: "A" },
  { id: "c_f3b", name: "Form 3B", stream: "B" },
  { id: "c_f4a", name: "Form 4A", stream: "A" },
  { id: "c_f4b", name: "Form 4B", stream: "B" },
];
