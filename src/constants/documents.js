export const DOCUMENT_CATEGORIES = [
  {
    value: 'admissions',
    label: 'Admissions',
    description: 'Entry requirements and application guidance.',
    tone: 'blue',
  },
  {
    value: 'tuition-fees',
    label: 'Tuition & Fees',
    description: 'Tuition costs, payment plans and refunds.',
    tone: 'emerald',
  },
  {
    value: 'scholarships',
    label: 'Scholarships',
    description: 'Financial aid, grants and merit awards.',
    tone: 'amber',
  },
  {
    value: 'academic-programs',
    label: 'Academic Programs',
    description: 'Degrees, majors and course catalogues.',
    tone: 'violet',
  },
  {
    value: 'academic-regulations',
    label: 'Academic Regulations',
    description: 'Grading, progression and examination rules.',
    tone: 'rose',
  },
  {
    value: 'student-handbook',
    label: 'Student Handbook',
    description: 'Student rights, conduct and campus policies.',
    tone: 'cyan',
  },
  {
    value: 'international-students',
    label: 'International Students',
    description: 'Visas, housing and orientation information.',
    tone: 'indigo',
  },
  {
    value: 'application-deadlines',
    label: 'Application Deadlines',
    description: 'Key dates for each intake.',
    tone: 'orange',
  },
  {
    value: 'general-information',
    label: 'General Information',
    description: 'Other official university publications.',
    tone: 'slate',
  },
];

export const CATEGORY_MAP = DOCUMENT_CATEGORIES.reduce((map, category) => {
  map[category.value] = category;
  return map;
}, {});

export const getCategoryMeta = (value) =>
  CATEGORY_MAP[value] ?? {
    value: value || 'uncategorised',
    label: 'Uncategorised',
    description: 'No category has been assigned to this document.',
    tone: 'slate',
  };

export const PROCESSING_STATUS_MAP = {
  pending: { label: 'Pending', tone: 'slate' },
  processing: { label: 'Processing', tone: 'blue' },
  completed: { label: 'Processed', tone: 'emerald' },
  failed: { label: 'Failed', tone: 'rose' },
};

export const getProcessingStatus = (status) =>
  PROCESSING_STATUS_MAP[status] ?? { label: 'Unknown', tone: 'slate' };

/** Server-enforced upload rules (Backend/config/multer.js and documentRoutes.js). */
export const UPLOAD_ACCEPT = { 'application/pdf': ['.pdf'] };
export const MAX_UPLOAD_FILES = 5;
export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Academic years count from August onwards, newest first. */
export const getAcademicYearOptions = (reference = new Date()) => {
  const startYear =
    reference.getMonth() >= 7 ? reference.getFullYear() : reference.getFullYear() - 1;

  return Array.from({ length: 6 }, (_, index) => {
    const year = startYear + 1 - index;
    return `${year}/${year + 1}`;
  });
};
