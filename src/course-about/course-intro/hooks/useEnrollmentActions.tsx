import { useState, useMemo, useRef } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { useEnrollment } from '../../data/hooks';
import messages from '../messages';
import type { UseEnrollmentActionsTypes } from './types';

export const useEnrollmentActions = ({ courseId, ecommerceCheckoutLink }: UseEnrollmentActionsTypes) => {
  const intl = useIntl();
  const [enrollmentError, setEnrollmentError] = useState<null | string>(null);
  const [isEnrollmentPending, setIsEnrollmentPending] = useState(false);
  const enrollmentInFlight = useRef(false);

  const enrollmentConfig = useMemo(() => ({
    onError: setEnrollmentError,
    errorMessage: intl.formatMessage(messages.statusMessageEnrollmentError),
  }), [intl]);

  const enrollAndRedirect = useEnrollment(enrollmentConfig);

  const handleChangeEnrollment = async () => {
    // Plugin prop composition can call twice before a React state update commits.
    if (enrollmentInFlight.current) {
      return;
    }
    enrollmentInFlight.current = true;
    setIsEnrollmentPending(true);
    try {
      await enrollAndRedirect(courseId, `${getConfig().LMS_BASE_URL}/dashboard`);
    } catch (error) {
      logError('Failed to enroll in course', error);
    } finally {
      enrollmentInFlight.current = false;
      setIsEnrollmentPending(false);
    }
  };

  const handleEcommerceCheckout = () => {
    if (!ecommerceCheckoutLink) {
      logError('Ecommerce checkout link is not available');
      return;
    }
    window.location.assign(ecommerceCheckoutLink);
  };

  return {
    enrollmentError,
    isEnrollmentPending,
    handleChangeEnrollment,
    handleEcommerceCheckout,
  };
};
