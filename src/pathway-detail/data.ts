import type { CourseAboutInput } from '@src/course-about/types';
import type { PathwayDetailData } from './types';

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

/**
 * Builds the Course About source for an embedded fixture course: only the
 * fields this fixture actually knows. The embedding Module supplies neutral
 * defaults for the rest, so no fixture copy leaks into another host. The
 * overview defaults to the shared trusted copy.
 */
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
}): CourseAboutInput => ({
  id,
  name: title,
  displayOrgWithDefault: '',
  displayNumberWithDefault: '',
  shortDescription,
  overview,
});

/**
 * Static Data Engineering fixture matching the approved FAL-4380 screenshots.
 * The first six courses and credentials reproduce the screenshot copy verbatim;
 * the final two exist to exercise the "See more" control.
 *
 * The final two courses' credential kinds follow their credentials-list entry.
 * The screenshots' course summaries disagreed there ("1 badge" for a course
 * whose credential is a certificate, and vice versa); the list is authoritative.
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
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'certificate', count: 1 },
      courseAboutData: buildCourseAboutData({
        id: 'introduction-to-data-pipelines',
        title: 'Introduction to Data Pipelines',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'sql-for-data-engineers',
      title: 'SQL for Data Engineers',
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'badge', count: 1 },
      courseAboutData: buildCourseAboutData({
        id: 'sql-for-data-engineers',
        title: 'SQL for Data Engineers',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'apache-spark-and-distributed-computing',
      title: 'Apache Spark and Distributed Computing',
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'certificate', count: 1 },
      courseAboutData: buildCourseAboutData({
        id: 'apache-spark-and-distributed-computing',
        title: 'Apache Spark and Distributed Computing',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'cloud-data-warehousing',
      title: 'Cloud Data Warehousing',
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'certificate', count: 1 },
      courseAboutData: buildCourseAboutData({
        id: 'cloud-data-warehousing',
        title: 'Cloud Data Warehousing',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'real-time-streaming-with-kafka',
      title: 'Real-Time Streaming with Kafka',
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'badge', count: 1 },
      courseAboutData: buildCourseAboutData({
        id: 'real-time-streaming-with-kafka',
        title: 'Real-Time Streaming with Kafka',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'capstone-build-a-data-platform',
      title: 'Capstone: Build a Data Platform',
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'certificate', count: 1 },
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
      duration: '3 weeks',
      pace: 'Self-paced',
      credential: { kind: 'certificate', count: 1 },
      courseAboutData: buildCourseAboutData({
        id: 'data-quality-and-testing',
        title: 'Data Quality and Testing',
        shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      }),
    },
    {
      id: 'mlops-for-data-pipelines',
      title: 'MLOps for Data Pipelines',
      duration: '3 weeks',
      pace: 'Self-paced',
      credential: { kind: 'badge', count: 1 },
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
      kind: 'certificate',
      rule: 'for 50% or more',
      courseTitle: 'Introduction to Data Pipelines',
    },
    {
      id: 'badge-sql-for-data-engineers',
      kind: 'badge',
      rule: 'on completion',
      courseTitle: 'SQL for Data Engineers',
    },
    {
      id: 'certificate-apache-spark-and-distributed-computing',
      kind: 'certificate',
      rule: 'for 65% or more',
      courseTitle: 'Apache Spark and Distributed Computing',
    },
    {
      id: 'certificate-cloud-data-warehousing',
      kind: 'certificate',
      rule: 'on completion',
      courseTitle: 'Cloud Data Warehousing',
    },
    {
      id: 'badge-real-time-streaming-with-kafka',
      kind: 'badge',
      rule: 'for 50% or more',
      courseTitle: 'Real-Time Streaming with Kafka',
    },
    {
      id: 'certificate-capstone-build-a-data-platform',
      kind: 'certificate',
      rule: 'for 50% or more',
      courseTitle: 'Capstone: Build a Data Platform',
    },
    {
      id: 'certificate-data-quality-and-testing',
      kind: 'certificate',
      rule: 'on completion',
      courseTitle: 'Data Quality and Testing',
    },
    {
      id: 'badge-mlops-for-data-pipelines',
      kind: 'badge',
      rule: 'for 50% or more',
      courseTitle: 'MLOps for Data Pipelines',
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
