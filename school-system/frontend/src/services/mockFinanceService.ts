import type { Payment, SmsMessage, Student } from "@/types/finance";
import { applyVariables } from "@/utils/financeHelpers";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const recordPayment = async (
  input: Omit<Payment, "id" | "transactionId" | "receiptNo" | "status">,
): Promise<Payment> => {
  await delay(450);
  const seq = Math.floor(Math.random() * 90000) + 10000;
  return {
    ...input,
    id: `pay_${Date.now()}`,
    transactionId: `TXN-${seq}`,
    receiptNo: `RCP-2026-${seq}`,
    status: "Completed",
  };
};

export const sendFeeReminders = async (
  recipients: Student[],
  template: string,
  schoolName: string,
  term: string,
  dueDate: string,
): Promise<SmsMessage[]> => {
  await delay(600);
  return recipients.map((s, i) => {
    const body = applyVariables(template, {
      STUDENT_NAME: s.fullName,
      PARENT_NAME: s.guardian.name,
      CLASS: s.className,
      BALANCE: s.outstanding.toLocaleString(),
      TERM: term,
      DUE_DATE: dueDate,
      SCHOOL_NAME: schoolName,
    });
    return {
      id: `sms_${Date.now()}_${i}`,
      messageId: `MSG-${Date.now().toString().slice(-7)}${i}`,
      recipientName: s.guardian.name,
      recipientPhone: s.guardian.phone,
      studentId: s.id,
      studentName: s.fullName,
      type: "Fee Reminder" as const,
      body,
      date: new Date().toISOString(),
      status: "Sent" as const,
    };
  });
};
