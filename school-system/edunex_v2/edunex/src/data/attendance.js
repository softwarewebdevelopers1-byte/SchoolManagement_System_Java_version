import { int } from './utils';

export function attendanceTrend(days = 14) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    out.push({
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      present: int(88, 99), absent: int(1, 8), late: int(0, 4),
    });
  }
  return out;
}
