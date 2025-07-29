import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  statusAlertEnrolled: {
    id: 'category.course-about.course-intro.status-alert.enrolled',
    defaultMessage: 'You are enrolled in this course',
    description: 'The text for the status alert when the user is enrolled in the course.',
  },
  viewCourseBtn: {
    id: 'category.course-about.course-intro.view-course-btn',
    defaultMessage: 'View course',
    description: 'The text for the button to view the course.',
  },
  statusAlertFull: {
    id: 'category.course-about.course-intro.status-alert.full',
    defaultMessage: 'Course is full',
    description: 'The text for the status alert when the course is full.',
  },
  statusAlertEnrollmentInvitationOnly: {
    id: 'category.course-about.course-intro.status-alert.enrollment-invitation-only',
    defaultMessage: 'Enrollment in this course is by invitation only',
    description: 'The text for the status alert when the enrollment is by invitation only.',
  },
  statusAlertEnrollmentClosed: {
    id: 'category.course-about.course-intro.status-alert.enrollment-closed',
    defaultMessage: 'Enrollment is closed',
    description: 'The text for the status alert when the enrollment is closed.',
  },
  enrollNowBtn: {
    id: 'category.course-about.course-intro.enroll-now-btn',
    defaultMessage: 'Enroll now',
    description: 'The text for the button to enroll in the course.',
  },
  enrollNowBtnPending: {
    id: 'category.course-about.course-intro.enroll-now-btn-pending',
    defaultMessage: 'Enrolling...',
    description: 'The text for the button to enroll in the course when the enrollment is pending.',
  },
  statusAlertEnrollmentError: {
    id: 'category.course-about.course-intro.status-alert.enrollment-error',
    defaultMessage: 'An error occurred. Please try again later.',
    description: 'The text for the status alert when an error occurs during enrollment.',
  },
});

export default messages;
