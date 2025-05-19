import { useMemo } from 'react';
import { Alert } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import { StatusAlertTypes } from '../types';
import { ALERT_ICONS, ALERT_VARIANTS } from '../constants';

export const StatusAlert = ({ variant, messageKey }: StatusAlertTypes) => {
  const intl = useIntl();

  const icon = useMemo(() => ALERT_ICONS[variant] || ALERT_ICONS[ALERT_VARIANTS.INFO], [variant]);

  return (
    <Alert
      className="course-about-intro-alert"
      variant={variant}
      icon={icon}
    >
      <Alert.Heading>{intl.formatMessage(messages[messageKey])}</Alert.Heading>
    </Alert>
  );
};
