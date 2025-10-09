import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import CourseAboutEnrollmentButtonSlot from '@src/plugin-slots/CourseAboutEnrollmentButtonSlot';
import { StatusMessage, EnrolledStatus } from '../components';
import { getLearningHomePageUrl } from '../utils';
import messages from '../messages';
import { STATUS_MESSAGE_VARIANTS } from '../constants';
import type { UseEnrollmentStatusTypes } from './types';

export const useEnrollmentStatus = ({
  courseAboutData,
  enrollmentError,
  authenticatedUser,
  isEnrollmentPending,
  handleChangeEnrollment,
  handleEcommerceCheckout,
}: UseEnrollmentStatusTypes) => {
  const intl = useIntl();
  const {
    id: courseId,
    canEnroll,
    enrollment,
    isShibCourse,
    isCourseFull,
    allowAnonymous,
    singlePaidMode,
    invitationOnly,
    ecommerceCheckout,
    showCoursewareLink,
  } = courseAboutData;

  const renderStatusContent = () => {
    if (enrollmentError) {
      return <StatusMessage variant={STATUS_MESSAGE_VARIANTS.DANGER} messageKey="statusMessageEnrollmentError" />;
    }

    if (authenticatedUser && enrollment.isActive) {
      return <EnrolledStatus showCoursewareLink={showCoursewareLink} courseId={courseId} />;
    }

    if (isCourseFull) {
      return <StatusMessage variant={STATUS_MESSAGE_VARIANTS.INFO} messageKey="statusMessageFull" />;
    }

    if (invitationOnly && !canEnroll) {
      return <StatusMessage variant={STATUS_MESSAGE_VARIANTS.INFO} messageKey="statusMessageEnrollmentInvitationOnly" />;
    }

    if (!isShibCourse && !canEnroll) {
      return <StatusMessage variant={STATUS_MESSAGE_VARIANTS.INFO} messageKey="statusMessageEnrollmentClosed" />;
    }

    if (allowAnonymous && showCoursewareLink) {
      return (
        <Button as="a" href={getLearningHomePageUrl(courseId)}>
          {intl.formatMessage(messages.viewCourseBtn)}
        </Button>
      );
    }

    return (
      <CourseAboutEnrollmentButtonSlot
        singlePaidMode={singlePaidMode}
        ecommerceCheckout={ecommerceCheckout}
        isEnrollmentPending={isEnrollmentPending}
        onEnroll={handleChangeEnrollment}
        onEcommerceCheckout={handleEcommerceCheckout}
      />
    );
  };

  return { renderStatusContent };
};
