import type { CourseAboutData } from '@src/course-about/types';
import type { PathwayDetailData } from './types';

/**
 * Fields shared by every embedded fixture course's CourseAboutData. Per-course
 * values (id, name, shortDescription, overview) are layered on top by
 * buildCourseAboutData; all other fields are dummy-but-complete constants, so
 * the sidebar/media slots render without a missing-field crash.
 */
const COURSE_ABOUT_BASE: Omit<CourseAboutData, 'id' | 'name' | 'shortDescription' | 'overview'> = {
  accessExpiration: null,
  contentTypeGatingEnabled: false,
  courseGoals: { selectedGoal: null, weeklyLearningGoalEnabled: false },
  effort: '4–6 hours per week',
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
  license: 'all-rights-reserved',
  language: 'English',
  media: {
    courseImage: { uri: null },
    courseVideo: { uri: null },
    image: { raw: '', small: '', large: '' },
  },
  offer: null,
  relatedPrograms: null,
  start: '2027-03-03T00:00:00Z',
  startDisplay: 'Mar 3, 2027',
  startType: 'timestamp',
  pacing: 'self',
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
    certStatus: 'not available',
    certWebViewUrl: null,
    downloadUrl: null,
    certificateAvailableDate: null,
  },
  verifyIdentityUrl: null,
  verificationStatus: 'none',
  linkedinAddToProfileUrl: null,
  isIntegritySignatureEnabled: false,
  userNeedsIntegritySignature: false,
  learningAssistantEnabled: false,
  showCoursewareLink: false,
  isCourseFull: false,
  canEnroll: true,
  invitationOnly: false,
  isShibCourse: false,
  allowAnonymous: true,
  ecommerceCheckout: false,
  singlePaidMode: {},
  ecommerceCheckoutLink: null,
  courseImageUrls: [],
  startDateIsStillDefault: false,
  advertisedStart: null,
  coursePrice: 'Free',
  preRequisiteCourses: [],
  aboutSidebarHtml: null,
  displayNumberWithDefault: '1234',
  displayOrgWithDefault: 'MIT OpenLearning',
  ocwLinks: [],
  prerequisites: [],
  requirements: '',
};

/**
 * Static trusted overview HTML shared by the embedded fixture courses. It is
 * rendered through the existing dangerouslySetInnerHTML overview path, so it
 * must stay hard-coded fixture copy and never accept user-controlled content.
 */
const COURSE_OVERVIEW_HTML = '<h2>About This Course</h2>'
  + '<p>'
  + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '
  + 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
  + '</p>'
  + '<h2>Requirements</h2>'
  + '<p>'
  + 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. '
  + 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  + '</p>'
  + '<h2>Frequently Asked Questions</h2>'
  + '<p>'
  + 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, '
  + 'eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'
  + '</p>';

/** Layers the per-course fields onto the shared dummy base; the overview
 * defaults to the shared trusted copy. */
const buildCourseAboutData = ({
  id,
  title,
  shortDescription,
  overview = COURSE_OVERVIEW_HTML,
}: {
  id: string;
  title: string;
  shortDescription: string;
  overview?: string;
}): CourseAboutData => ({
  ...COURSE_ABOUT_BASE,
  id,
  name: title,
  shortDescription,
  overview,
});

/**
 * Static Data Engineering fixture matching the approved FAL-4380 screenshots.
 * The first six courses and credentials reproduce the screenshot copy verbatim;
 * the final two exist to exercise the "See more" control.
 */
export const DATA_ENGINEERING_PATHWAY: PathwayDetailData = {
  id: 'data-engineering-fundamentals',
  name: 'Data Engineering Fundamentals',
  organization: 'MIT OpenCourseWare',
  description: 'Master the complete data engineering stack, from pipeline design and SQL to distributed computing and real-time streaming. Earn a Professional Certificate upon completion.',
  about: [
    'The Data Engineering Fundamentals pathway is designed for professionals looking to build scalable data infrastructure. You will learn to design, build, and maintain data pipelines that power real-time analytics and machine learning systems.',
    'Each course builds on the previous one, giving you a complete foundation in modern data engineering tools and practices used at leading technology companies.',
  ],
  isEnrolled: false,
  facts: [
    { label: 'Classes start', value: 'Mar 3, 2027' },
    { label: 'Courses', value: '8' },
    { label: 'Price', value: 'Free' },
    { label: 'Duration', value: '8 months' },
    { label: 'Pace', value: 'Self-paced' },
    { label: 'Certificates', value: '1' },
    { label: 'Badges', value: '1' },
  ],
  courses: [
    {
      id: 'introduction-to-data-pipelines',
      title: 'Introduction to Data Pipelines',
      summary: '2 weeks · Self-paced · 1 certificate',
      courseAboutData: buildCourseAboutData({
        id: 'introduction-to-data-pipelines',
        title: 'Introduction to Data Pipelines',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'sql-for-data-engineers',
      title: 'SQL for Data Engineers',
      summary: '2 weeks · Self-paced · 1 badge',
      courseAboutData: buildCourseAboutData({
        id: 'sql-for-data-engineers',
        title: 'SQL for Data Engineers',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'apache-spark-and-distributed-computing',
      title: 'Apache Spark and Distributed Computing',
      summary: '2 weeks · Self-paced · 1 certificate',
      courseAboutData: buildCourseAboutData({
        id: 'apache-spark-and-distributed-computing',
        title: 'Apache Spark and Distributed Computing',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'cloud-data-warehousing',
      title: 'Cloud Data Warehousing',
      summary: '2 weeks · Self-paced · 1 certificate',
      courseAboutData: buildCourseAboutData({
        id: 'cloud-data-warehousing',
        title: 'Cloud Data Warehousing',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'real-time-streaming-with-kafka',
      title: 'Real-Time Streaming with Kafka',
      summary: '2 weeks · Self-paced · 1 badge',
      courseAboutData: buildCourseAboutData({
        id: 'real-time-streaming-with-kafka',
        title: 'Real-Time Streaming with Kafka',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'capstone-build-a-data-platform',
      title: 'Capstone: Build a Data Platform',
      summary: '2 weeks · Self-paced · 1 certificate',
      courseAboutData: buildCourseAboutData({
        id: 'capstone-build-a-data-platform',
        title: 'Capstone: Build a Data Platform',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        // Intentionally longer than the other fixtures so the modal body
        // scrolls and can be exercised manually; repeats the same trusted
        // static copy, never new or user-controlled content.
        overview: COURSE_OVERVIEW_HTML.repeat(8),
      }),
    },
    {
      id: 'data-quality-and-testing',
      title: 'Data Quality and Testing',
      summary: '3 weeks · Self-paced · 1 badge',
      courseAboutData: buildCourseAboutData({
        id: 'data-quality-and-testing',
        title: 'Data Quality and Testing',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'mlops-for-data-pipelines',
      title: 'MLOps for Data Pipelines',
      summary: '3 weeks · Self-paced · 1 certificate',
      courseAboutData: buildCourseAboutData({
        id: 'mlops-for-data-pipelines',
        title: 'MLOps for Data Pipelines',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
  ],
  credentials: [
    {
      id: 'certificate-introduction-to-data-pipelines',
      title: 'Earn a certificate for 50% or more',
      courseTitle: 'Course: Introduction to Data Pipelines',
    },
    {
      id: 'badge-sql-for-data-engineers',
      title: 'Earn a badge on completion',
      courseTitle: 'Course: SQL for Data Engineers',
    },
    {
      id: 'certificate-apache-spark-and-distributed-computing',
      title: 'Earn a certificate for 65% or more',
      courseTitle: 'Course: Apache Spark and Distributed Computing',
    },
    {
      id: 'certificate-cloud-data-warehousing',
      title: 'Earn a certificate on completion',
      courseTitle: 'Course: Cloud Data Warehousing',
    },
    {
      id: 'badge-real-time-streaming-with-kafka',
      title: 'Earn a badge for 50% or more',
      courseTitle: 'Course: Real-Time Streaming with Kafka',
    },
    {
      id: 'certificate-capstone-build-a-data-platform',
      title: 'Earn a certificate for 50% or more',
      courseTitle: 'Course: Capstone: Build a Data Platform',
    },
    {
      id: 'certificate-data-quality-and-testing',
      title: 'Earn a certificate on completion',
      courseTitle: 'Course: Data Quality and Testing',
    },
    {
      id: 'badge-mlops-for-data-pipelines',
      title: 'Earn a badge for 50% or more',
      courseTitle: 'Course: MLOps for Data Pipelines',
    },
  ],
  instructors: [
    {
      id: 'julian-theodore-kensington',
      name: 'Julian Theodore Kensington',
      role: 'Computational Systems at MIT OpenLearning',
    },
    {
      id: 'ingrid-rasmussen',
      name: 'Ingrid Rasmussen',
      role: 'Applied Mathematics at MIT OpenLearning',
    },
    {
      id: 'anika-devanshi-bhattacharya',
      name: 'Anika Devanshi Bhattacharya',
      role: 'Artificial Intelligence at MIT OpenLearning',
    },
    {
      id: 'adrian-holloway',
      name: 'Adrian Holloway',
      role: 'Mechanical Engineering at MIT OpenLearning',
    },
  ],
  faqs: [
    {
      id: 'question-1',
      question: 'Question 1',
      answer: 'This is where your text will go',
    },
    {
      id: 'question-2',
      question: 'Question 2',
      answer: 'This is where your text will go',
    },
    {
      id: 'question-3',
      question: 'Question 3',
      answer: 'This is where your text will go',
    },
  ],
  testimonials: [
    {
      id: 'jane-smith',
      quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      attribution: 'Jane Smith',
    },
    {
      id: 'arvind-deshmukh',
      quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      attribution: 'Arvind Deshmukh',
    },
  ],
};

/**
 * Returns a copy of the Data Engineering fixture for any nonempty pathway ID,
 * or undefined when the ID is blank. Static only; no API or query layer.
 */
export const getPathwayDetail = (pathwayId: string): PathwayDetailData | undefined => (
  pathwayId.trim()
    ? { ...DATA_ENGINEERING_PATHWAY, id: pathwayId }
    : undefined
);
