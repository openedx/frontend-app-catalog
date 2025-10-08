import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  statusMessageEnrolled: {
    id: 'category.course-about.course-intro.status-message.enrolled',
    defaultMessage: 'You are enrolled in this course',
    description: 'The text for the status message when the user is enrolled in the course.',
  },
  viewCourseBtn: {
    id: 'category.course-about.course-intro.view-course-btn',
    defaultMessage: 'View course',
    description: 'The text for the button to view the course.',
  },
  statusMessageFull: {
    id: 'category.course-about.course-intro.status-message.full',
    defaultMessage: 'Course is full',
    description: 'The text for the status message when the course is full.',
  },
  statusMessageEnrollmentInvitationOnly: {
    id: 'category.course-about.course-intro.status-message.enrollment-invitation-only',
    defaultMessage: 'Enrollment in this course is by invitation only',
    description: 'The text for the status message when the enrollment is by invitation only.',
  },
  statusMessageEnrollmentClosed: {
    id: 'category.course-about.course-intro.status-message.enrollment-closed',
    defaultMessage: 'Enrollment is closed',
    description: 'The text for the status message when the enrollment is closed.',
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
  statusMessageEnrollmentError: {
    id: 'category.course-about.course-intro.status-message.enrollment-error',
    defaultMessage: 'An error occurred. Please try again later.',
    description: 'The text for the status message when an error occurs during enrollment.',
  },
});

export default messages;
