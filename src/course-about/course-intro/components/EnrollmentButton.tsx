import { StatefulButton } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import type { EnrollmentButtonTypes } from './types';

export const EnrollmentButton = ({
  onEnroll,
  singlePaidMode,
  ecommerceCheckout,
  isEnrollmentPending,
  onEcommerceCheckout,
}: EnrollmentButtonTypes) => {
  const intl = useIntl();

  return (
    <StatefulButton
      variant={Object.entries(singlePaidMode).length > 0 ? 'outline-primary' : 'primary'}
      onClick={ecommerceCheckout ? onEcommerceCheckout : onEnroll}
      state={isEnrollmentPending ? 'pending' : 'default'}
      labels={{
        default: intl.formatMessage(messages.enrollNowBtn),
        pending: intl.formatMessage(messages.enrollNowBtnPending),
      }}
    />
  );
};
