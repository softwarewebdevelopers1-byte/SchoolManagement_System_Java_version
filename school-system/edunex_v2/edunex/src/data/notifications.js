export const NOTIFICATIONS = [
  { id: 1, title: 'Midterm results published', body: 'Form 3 midterm results are now available for review.', time: '10 min ago', unread: true, type: 'result' },
  { id: 2, title: 'Timetable updated', body: 'Form 2 West timetable changed for Wednesday.', time: '1 hr ago', unread: true, type: 'timetable' },
  { id: 3, title: 'New parent message', body: 'Mr. Kariuki sent a message regarding Form 1 North.', time: '3 hrs ago', unread: true, type: 'message' },
  { id: 4, title: 'Attendance below threshold', body: 'Form 4 South attendance dropped below 90% this week.', time: 'Yesterday', unread: false, type: 'alert' },
  { id: 5, title: 'System backup completed', body: 'Nightly backup finished successfully at 02:00.', time: 'Yesterday', unread: false, type: 'system' },
];

export const ANNOUNCEMENTS = [
  { id: 1, title: 'Mid-Term Break', date: '2026-08-14', body: 'School closes for mid-term break on Friday, resuming the following Wednesday.', audience: 'All' },
  { id: 2, title: 'Parents\' Day', date: '2026-08-02', body: 'Parents are invited to review termly progress with class teachers from 9am.', audience: 'Parents' },
  { id: 3, title: 'Science Fair', date: '2026-07-28', body: 'Form 3 and Form 4 science projects will be exhibited in the main hall.', audience: 'Students' },
  { id: 4, title: 'Staff Development Day', date: '2026-07-24', body: 'No classes — teachers attend a curriculum training workshop.', audience: 'Staff' },
];

export const EVENTS = [
  { id: 1, title: 'Inter-house Athletics', date: '2026-07-18', category: 'Sports' },
  { id: 2, title: 'Music Festival Auditions', date: '2026-07-22', category: 'Arts' },
  { id: 3, title: 'Staff Development Day', date: '2026-07-24', category: 'Staff' },
  { id: 4, title: 'Science Fair', date: '2026-07-28', category: 'Academic' },
  { id: 5, title: 'Parents\' Day', date: '2026-08-02', category: 'Community' },
  { id: 6, title: 'Mid-Term Break Begins', date: '2026-08-14', category: 'Calendar' },
];
