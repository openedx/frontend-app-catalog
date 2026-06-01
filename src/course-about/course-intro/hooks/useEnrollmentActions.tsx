import { useState, useMemo } from 'react';
import { getSiteConfig, logError, useIntl } from '@openedx/frontend-base';

import { useEnrollment } from '../../data/hooks';
import messages from '../messages';
import type { UseEnrollmentActionsTypes } from './types';

export const useEnrollmentActions = ({ courseId, ecommerceCheckoutLink }: UseEnrollmentActionsTypes) => {
  const intl = useIntl();
  const [enrollmentError, setEnrollmentError] = useState<null | string>(null);
  const [isEnrollmentPending, setIsEnrollmentPending] = useState(false);

  const enrollmentConfig = useMemo(() => ({
    onError: setEnrollmentError,
    errorMessage: intl.formatMessage(messages.statusMessageEnrollmentError),
  }), [intl]);

  const enrollAndRedirect = useEnrollment(enrollmentConfig);

  const handleChangeEnrollment = async () => {
    setIsEnrollmentPending(true);
    try {
      await enrollAndRedirect(courseId, `${getSiteConfig().lmsBaseUrl}/dashboard`);
    } catch (error) {
      setIsEnrollmentPending(false);
      logError('Failed to enroll in course', error);
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
