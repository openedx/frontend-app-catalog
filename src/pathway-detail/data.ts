import type { PathwayDetailData } from './types';

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
  certificateLabel: 'Bootcamp Certificate',
  start: '2027-03-03',
  facts: [
    { kind: 'start', label: 'Classes start', value: 'Mar 3, 2027' },
    { kind: 'courses', label: 'Courses', value: '8' },
    { kind: 'price', label: 'Price', value: 'Free' },
    { kind: 'duration', label: 'Duration', value: '8 months' },
    { kind: 'pace', label: 'Pace', value: 'Self-paced' },
    { kind: 'certificates', label: 'Certificates', value: '1' },
    { kind: 'badges', label: 'Badges', value: '1' },
  ],
  courses: [
    {
      id: 'introduction-to-data-pipelines',
      title: 'Introduction to Data Pipelines',
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'certificate', count: 1 },
      shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    {
      id: 'sql-for-data-engineers',
      title: 'SQL for Data Engineers',
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'badge', count: 1 },
      shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    {
      id: 'apache-spark-and-distributed-computing',
      title: 'Apache Spark and Distributed Computing',
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'certificate', count: 1 },
      shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    {
      id: 'cloud-data-warehousing',
      title: 'Cloud Data Warehousing',
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'certificate', count: 1 },
      shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    {
      id: 'real-time-streaming-with-kafka',
      title: 'Real-Time Streaming with Kafka',
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'badge', count: 1 },
      shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    {
      id: 'capstone-build-a-data-platform',
      title: 'Capstone: Build a Data Platform',
      duration: '2 weeks',
      pace: 'Self-paced',
      credential: { kind: 'certificate', count: 1 },
      shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    {
      id: 'data-quality-and-testing',
      title: 'Data Quality and Testing',
      duration: '3 weeks',
      pace: 'Self-paced',
      credential: { kind: 'certificate', count: 1 },
      shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    {
      id: 'mlops-for-data-pipelines',
      title: 'MLOps for Data Pipelines',
      duration: '3 weeks',
      pace: 'Self-paced',
      credential: { kind: 'badge', count: 1 },
      shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
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
