const SUBJECT_LIST = [
  { code: 'ENG', name: 'English', type: 'core' },
  { code: 'KIS', name: 'Kiswahili', type: 'core' },
  { code: 'MAT', name: 'Mathematics', type: 'core' },
  { code: 'BIO', name: 'Biology', type: 'core' },
  { code: 'CHE', name: 'Chemistry', type: 'core' },
  { code: 'PHY', name: 'Physics', type: 'core' },
  { code: 'HIS', name: 'History & Government', type: 'core' },
  { code: 'GEO', name: 'Geography', type: 'core' },
  { code: 'CRE', name: 'Christian Religious Education', type: 'elective' },
  { code: 'BST', name: 'Business Studies', type: 'elective' },
  { code: 'AGR', name: 'Agriculture', type: 'elective' },
  { code: 'CMP', name: 'Computer Studies', type: 'elective' },
  { code: 'FRE', name: 'French', type: 'elective' },
  { code: 'HSC', name: 'Home Science', type: 'elective' },
];

export const SUBJECTS = SUBJECT_LIST.map((s, i) => ({ id: `SUB${i + 1}`, ...s }));
export const CORE_SUBJECTS = SUBJECTS.filter((s) => s.type === 'core');
export const ELECTIVE_SUBJECTS = SUBJECTS.filter((s) => s.type === 'elective');
