import type { SmsMessage } from "@/types/finance";
import { STUDENTS } from "./students";

const pad = (n: number, w = 5) => String(n).padStart(w, "0");
const dateOffset = (daysAgo: number): string => {
  const d = new Date("2026-10-15");
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const SMS_HISTORY: SmsMessage[] = STUDENTS.filter(
  (s) => s.outstanding > 0,
)
  .slice(0, 12)
  .map((s, i): SmsMessage => ({
    id: `sms_${pad(i + 1)}`,
    messageId: `MSG-${pad(i + 100)}`,
    recipientName: s.guardian.name,
    recipientPhone: s.guardian.phone,
    studentId: s.id,
    studentName: s.fullName,
    type: "Fee Reminder",
    body: `Dear ${s.guardian.name}, this is a reminder that ${s.fullName} has an outstanding fee balance of KES ${s.outstanding.toLocaleString()}. Kindly make payment. Thank you, Edunex Academy.`,
    date: dateOffset(2 + i),
    status:
      i % 7 === 3
        ? "Failed"
        : i % 5 === 2
          ? "Pending"
          : i % 3 === 1
            ? "Delivered"
            : "Sent",
  }));

export const REMINDER_TEMPLATE = `Dear [PARENT_NAME],

This is a reminder that [STUDENT_NAME] of [CLASS] has an outstanding school fee balance of KES [BALANCE].

Kindly make payment at your earliest convenience.

Thank you,
[SCHOOL_NAME]`;

export const SMS_VARIABLES = [
  "STUDENT_NAME",
  "PARENT_NAME",
  "CLASS",
  "BALANCE",
  "TERM",
  "DUE_DATE",
  "SCHOOL_NAME",
] as const;
