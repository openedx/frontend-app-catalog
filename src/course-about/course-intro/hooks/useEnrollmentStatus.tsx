import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import CourseAboutEnrollmentButtonSlot from '@src/plugin-slots/CourseAboutEnrollmentButtonSlot';
import { StatusAlert, EnrolledStatus } from '../components';
import { getLearningHomePageUrl } from '../utils';
import messages from '../messages';
import { ALERT_VARIANTS } from '../constants';
import { UseEnrollmentStatusTypes } from './types';

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
      return <StatusAlert variant={ALERT_VARIANTS.DANGER} messageKey="statusAlertEnrollmentError" />;
    }

    if (authenticatedUser && enrollment.isActive) {
      return <EnrolledStatus showCoursewareLink={showCoursewareLink} courseId={courseId} />;
    }

    if (isCourseFull) {
      return <StatusAlert variant={ALERT_VARIANTS.INFO} messageKey="statusAlertFull" />;
    }

    if (invitationOnly && !canEnroll) {
      return <StatusAlert variant={ALERT_VARIANTS.INFO} messageKey="statusAlertEnrollmentInvitationOnly" />;
    }

    if (!isShibCourse && !canEnroll) {
      return <StatusAlert variant={ALERT_VARIANTS.INFO} messageKey="statusAlertEnrollmentClosed" />;
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
