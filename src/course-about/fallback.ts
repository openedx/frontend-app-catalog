import type { CourseAboutCore, CourseAboutData, CourseAboutInput } from './types';

/**
 * Neutral defaults for every field a Course About source may omit. Values
 * carry no learner-facing copy and no fixture data, so a source that supplies
 * nothing renders nothing for that region. The `Omit` type keeps this object
 * complete as CourseAboutData grows.
 */
export const COURSE_ABOUT_FALLBACK: Omit<CourseAboutData, keyof CourseAboutCore> = {
  accessExpiration: null,
  contentTypeGatingEnabled: false,
  courseGoals: { selectedGoal: null, weeklyLearningGoalEnabled: false },
  effort: null,
  end: null,
  enrollment: { mode: null, isActive: false },
  enrollmentStart: null,
  enrollmentEnd: null,
  entranceExamData: {
    entranceExamCurrentScore: 0,
    entranceExamEnabled: false,
    entranceExamId: '',
    entranceExamMinimumScorePct: 0,
    entranceExamPassed: false,
  },
  license: null,
  language: '',
  media: {
    courseImage: { uri: null },
    courseVideo: { uri: null },
    image: { raw: '', small: '', large: '' },
  },
  offer: null,
  relatedPrograms: null,
  start: '',
  startDisplay: null,
  startType: '',
  pacing: '',
  userTimezone: null,
  showCalculator: false,
  canAccessProctoredExams: false,
  notes: { enabled: false, visible: false },
  marketingUrl: null,
  celebrations: {
    firstSection: false,
    streakLengthToCelebrate: null,
    streakDiscountEnabled: false,
    weeklyGoal: false,
  },
  userHasPassingGrade: false,
  courseExitPageIsActive: false,
  certificateData: {
    certStatus: '',
    certWebViewUrl: null,
    downloadUrl: null,
    certificateAvailableDate: null,
  },
  verifyIdentityUrl: null,
  verificationStatus: '',
  linkedinAddToProfileUrl: null,
  isIntegritySignatureEnabled: false,
  userNeedsIntegritySignature: false,
  learningAssistantEnabled: false,
  showCoursewareLink: false,
  isCourseFull: false,
  canEnroll: false,
  invitationOnly: false,
  isShibCourse: false,
  allowAnonymous: false,
  ecommerceCheckout: false,
  singlePaidMode: {},
  ecommerceCheckoutLink: null,
  courseImageUrls: [],
  startDateIsStillDefault: true,
  advertisedStart: null,
  coursePrice: '',
  preRequisiteCourses: [],
  aboutSidebarHtml: null,
  ocwLinks: [],
  prerequisites: [],
  requirements: '',
};

/**
 * Expands a source into the complete record the v1 Slot Adapters read. Source
 * values win at every level and only omitted fields are topped up, so an
 * absent property must be omitted rather than set to `undefined`, which would
 * overwrite the default.
 */
export const expandCourseAboutData = (source: CourseAboutInput): CourseAboutData => ({
  ...COURSE_ABOUT_FALLBACK,
  ...source,
  media: {
    ...COURSE_ABOUT_FALLBACK.media,
    ...source.media,
    courseImage: { ...COURSE_ABOUT_FALLBACK.media.courseImage, ...source.media?.courseImage },
    courseVideo: { ...COURSE_ABOUT_FALLBACK.media.courseVideo, ...source.media?.courseVideo },
  },
});
