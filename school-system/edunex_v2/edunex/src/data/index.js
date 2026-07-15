// ============================================================================
// Compatibility barrel — re-exports every dummy-data module from one place so
// existing screens can keep doing `import { STUDENTS } from '../../data'`.
// Prefer importing directly from the specific file (e.g. `data/students.js`)
// in new code — it keeps bundles smaller and mirrors the eventual API layer.
// ============================================================================
export * from './utils';
export * from './school';
export * from './subjects';
export * from './classes';
export * from './teachers';
export * from './students';
export * from './parents';
export * from './marks';
export * from './attendance';
export * from './timetable';
export * from './notifications';
export * from './users';
export * from './analytics';
export * from './reports';
