export interface CourseGoals {
  selectedGoal: string | null;
  weeklyLearningGoalEnabled: boolean;
}

export interface Enrollment {
  mode: string | null;
  isActive: boolean;
}

export interface EntranceExamData {
  entranceExamCurrentScore: number;
  entranceExamEnabled: boolean;
  entranceExamId: string;
  entranceExamMinimumScorePct: number;
  entranceExamPassed: boolean;
}

export interface CourseImage {
  uri: string | null;
}

export interface CourseVideo {
  uri: string | null;
}

export interface CourseImageUrls {
  raw: string;
  small: string;
  large: string;
}

export interface CourseMedia {
  courseImage: CourseImage;
  courseVideo: CourseVideo;
  image: CourseImageUrls;
}

export interface CertificateData {
  certStatus: string;
  certWebViewUrl: string | null;
  downloadUrl: string | null;
  certificateAvailableDate: string | null;
}

export interface Celebrations {
  firstSection: boolean;
  streakLengthToCelebrate: number | null;
  streakDiscountEnabled: boolean;
  weeklyGoal: boolean;
}

export interface Notes {
  enabled: boolean;
  visible: boolean;
}

export interface SinglePaidMode {
  [key: string]: any;
}

export interface PrerequisiteCourse {
  key: string;
  name: string;
  shortDescription?: string;
}

export interface OCWLink {
  title: string;
  url: string;
  description?: string;
}

export interface CourseAboutData {
  accessExpiration: string | null;
  contentTypeGatingEnabled: boolean;
  courseGoals: CourseGoals;
  effort: string | null;
  end: string | null;
  enrollment: Enrollment;
  enrollmentStart: string | null;
  enrollmentEnd: string | null;
  entranceExamData: EntranceExamData;
  id: string;
  license: string | null;
  language: string;
  media: CourseMedia;
  name: string;
  offer: any | null;
  relatedPrograms: any[] | null;
  shortDescription: string;
  start: string;
  startDisplay: string | null;
  startType: string;
  pacing: string;
  userTimezone: string | null;
  showCalculator: boolean;
  canAccessProctoredExams: boolean;
  notes: Notes;
  marketingUrl: string | null;
  celebrations: Celebrations;
  userHasPassingGrade: boolean;
  courseExitPageIsActive: boolean;
  certificateData: CertificateData;
  verifyIdentityUrl: string | null;
  verificationStatus: string;
  linkedinAddToProfileUrl: string | null;
  isIntegritySignatureEnabled: boolean;
  userNeedsIntegritySignature: boolean;
  learningAssistantEnabled: boolean;
  showCoursewareLink: boolean;
  isCourseFull: boolean;
  canEnroll: boolean;
  invitationOnly: boolean;
  isShibCourse: boolean;
  allowAnonymous: boolean;
  ecommerceCheckout: boolean;
  singlePaidMode: SinglePaidMode;
  ecommerceCheckoutLink: string | null;
  courseImageUrls: string[];
  startDateIsStillDefault: boolean;
  advertisedStart: string | null;
  coursePrice: string;
  preRequisiteCourses: PrerequisiteCourse[];
  aboutSidebarHtml: string | null;
  displayNumberWithDefault: string;
  displayOrgWithDefault: string;
  overview: string;
  ocwLinks: OCWLink[];
  prerequisites: string[];
}

export type CourseAboutDataPartial = Omit<Pick<CourseAboutData,
| 'id'
| 'name'
| 'displayOrgWithDefault'
| 'shortDescription'
| 'enrollment'
| 'isCourseFull'
| 'invitationOnly'
| 'canEnroll'
| 'isShibCourse'
| 'allowAnonymous'
| 'showCoursewareLink'
| 'singlePaidMode'
| 'ecommerceCheckout'
| 'ecommerceCheckoutLink'
>, 'enrollment'> & {
  enrollment: EnrollmentPartial;
};

export type CourseMediaPartial = {
  courseImage: CourseImage;
  courseVideo?: CourseVideo;
};

export type EnrollmentPartial = Pick<Enrollment, 'isActive'>;
